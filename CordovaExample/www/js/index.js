var statusLabel = document.getElementById('sdk-status');
var screenTitle = document.getElementById('screen-title');
var screenDescription = document.getElementById('screen-description');
var previewButtons = Array.prototype.slice.call(document.querySelectorAll('.preview-tile'));
var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
var previewSection = document.getElementById('image-preview-section');
var frontPreviewTile = document.getElementById('front-preview-tile');
var backPreviewTile = document.getElementById('back-preview-tile');
var frontPreviewImage = document.getElementById('front-preview-image');
var backPreviewImage = document.getElementById('back-preview-image');
var frontPreviewLabel = document.getElementById('front-preview-label');
var backPreviewLabel = document.getElementById('back-preview-label');
var versionMetaLabel = document.getElementById('version-meta');

var contourConfig = {
    clientId: 'cyclops',
    captureType: 'both',
    enableMultipleCapturing: false,
    environmentType: 'dev'
};

var documents = {
    check: {
        title: 'Check Scan',
        description: 'Capture the front or back side of the check.',
        sdkType: 'check',
        frontLabel: 'Front Check',
        backLabel: 'Back Check',
        sides: [
            { sdkSide: 'front', documentSide: 'front', label: 'Scan Front' },
            { sdkSide: 'back', documentSide: 'back', label: 'Scan Back' }
        ]
    },
    id: {
        title: 'ID Scan',
        description: 'Capture the front and back side of the ID.',
        sdkType: 'id',
        frontLabel: 'Front ID',
        backLabel: 'Back ID',
        sides: [
            { sdkSide: 'front', documentSide: 'front', label: 'Scan Front' },
            { sdkSide: 'back', documentSide: 'back', label: 'Scan Back' }
        ]
    },
    passport: {
        title: 'Passport Scan',
        description: 'Capture the passport front face only.',
        sdkType: 'passport',
        frontLabel: 'Passport Front Face',
        backLabel: '',
        sides: [
            { sdkSide: 'frontFaceOnly', documentSide: 'front', label: 'Scan Front Face' }
        ]
    },
    selfie: {
        title: 'Take Selfie',
        description: 'Capture your selfie',
        sdkType: 'selfie',
        frontLabel: 'User Selfie',
        backLabel: '',
        sides: [
            { sdkSide: 'selfie', documentSide: 'front', label: 'Capture Face' }
        ]
    }
};

var activeDocument = 'check';
var activeScan = null;
var isDeviceReady = false;
var previewState = {
    check: {},
    id: {},
    passport: {}, 
    selfie: {}
};

document.addEventListener('deviceready', onDeviceReady, false);

tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        setActiveDocument(button.dataset.document);
    });
});

previewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        openScan(button.dataset.sideIndex);
    });
});

renderDocumentScreen();

function onDeviceReady() {
    isDeviceReady = true;
    setPreviewButtonsDisabled(false);
    setStatus('Ready to scan check.');
    renderVersionMeta();
    initializeContourSdk();

    if (window.cordova) {
        console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    }
}

function renderVersionMeta() {
    versionMetaLabel.textContent = 'Cordova Example App';
}

function initializeContourSdk() {
    if (!window.ContourAISDK || typeof window.ContourAISDK.initialize !== 'function') {
        console.warn('ContourAISDK initialize action is not available.');
        return;
    }

    window.ContourAISDK.initialize(
        contourConfig.clientId,
        contourConfig.environmentType,
        function (message) {
            console.log(message || 'Contour SDK initialization started.');
        }
    );
}

function setActiveDocument(documentKey) {
    if (!documents[documentKey]) {
        return;
    }

    activeDocument = documentKey;
    activeScan = null;
    renderDocumentScreen();
    setStatus(isDeviceReady ? 'Ready to scan ' + getActiveDocumentName() + '.' : 'Preparing scanner...');
}

function renderDocumentScreen() {
    var config = documents[activeDocument];
    screenTitle.textContent = config.title;
    screenDescription.textContent = config.description;
    frontPreviewLabel.textContent = config.frontLabel;
    backPreviewLabel.textContent = config.backLabel;
    backPreviewTile.hidden = config.sides.length === 1;
    previewSection.classList.toggle('selfie-preview', activeDocument === 'selfie');

    previewButtons.forEach(function (button, index) {
        var side = config.sides[index];
        if (!side) {
            button.hidden = true;
            button.disabled = true;
            return;
        }

        button.hidden = false;
        button.dataset.sideIndex = String(index);
        button.disabled = !isDeviceReady;
    });

    tabButtons.forEach(function (button) {
        var isActive = button.dataset.document === activeDocument;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    renderPreviewState();
}

function openScan(sideIndex) {
    var config = documents[activeDocument];
    var side = config.sides[Number(sideIndex)];
    if (!side) {
        return;
    }

    activeScan = {
        documentKey: activeDocument,
        scanType: config.sdkType,
        sdkSide: side.sdkSide,
        documentSide: side.documentSide
    };

    setPreviewButtonsDisabled(true);
    setStatus('Opening ' + side.label.replace('Scan ', '').toLowerCase() + '...');

    if (window.cordova && cordova.exec) {
        registerContourCallbacks();
        var scanArgs = [
            contourConfig.clientId,
            contourConfig.captureType,
            config.sdkType,
            side.sdkSide,
            contourConfig.enableMultipleCapturing,
            contourConfig.environmentType,
            config.sdkType,
            side.documentSide
        ];

        launchContourSdk(config, side, scanArgs);
        return;
    }

    onSdkOpenError('ContourAISDK is not available yet. Install the local plugin to open the SDK.');
}

function launchContourSdk(config, side, scanArgs) {
    if (cordova.platformId === 'android' && window.ContourAISDK && typeof window.ContourAISDK.startContour === 'function') {
        window.ContourAISDK.startContour(
            contourConfig.clientId,
            contourConfig.captureType,
            config.sdkType,
            side.sdkSide,
            contourConfig.enableMultipleCapturing,
            contourConfig.environmentType,
            onSdkOpenSuccess,
            onSdkOpenError
        );
        return;
    }

    cordova.exec(
        onSdkOpenSuccess,
        onSdkOpenError,
        'ContourAISDK',
        'startContour',
        [scanArgs]
    );
}

function onSdkOpenSuccess(message) {
    setPreviewButtonsDisabled(false);
    var result = normalizeResult(message);
    if (result) {
        updateImagePreviews(result);
        setStatus(formatCaptureResult(result));
        return;
    }

    setStatus(message || 'Scan SDK opened.');
}

function onSdkOpenError(error) {
    setPreviewButtonsDisabled(false);
    setStatus(typeof error === 'string' ? error : 'Unable to open the scan SDK.');
    console.error('Scan error:', error);
}

function registerContourCallbacks() {
    cordova.exec(
        function () {
            if (!hasActivePreviewImage()) {
                setStatus(getActiveDocumentName() + ' scan closed.');
            }
            setPreviewButtonsDisabled(false);
        },
        null,
        'ContourAISDK',
        'onClose',
        []
    );

    cordova.exec(
        function () {
            setStatus('Contour SDK event received.');
        },
        null,
        'ContourAISDK',
        'eventCallBack',
        []
    );
}

function normalizeResult(message) {
    if (!message) {
        return null;
    }

    if (typeof message === 'object') {
        return message;
    }

    if (typeof message === 'string') {
        try {
            return JSON.parse(message);
        } catch (error) {
            return null;
        }
    }

    return null;
}

function formatCaptureResult(result) {
    if (!result || typeof result !== 'object') {
        return 'Scan completed.';
    }

    if (getPreviewCandidate(result, 'front') && getPreviewCandidate(result, 'back')) {
        return getActiveDocumentName() + ' front and back scan completed.';
    }

    if (getPreviewCandidate(result, 'back')) {
        return getActiveDocumentName() + ' back scan completed.';
    }

    if (getPreviewCandidate(result, 'front')) {
        return getSideLabel(activeScan && activeScan.sdkSide) + ' completed.';
    }

    return 'Scan completed.';
}

function updateImagePreviews(result) {
    console.log('Contour capture result:', result);

    var currentDocument = activeScan ? activeScan.documentKey : activeDocument;
    var currentSide = activeScan ? activeScan.documentSide : 'front';
    var frontImageValue = getPreviewCandidateValue(result, 'front');
    var backImageValue = getPreviewCandidateValue(result, 'back');
    var state = previewState[currentDocument];

    Promise.all([
        resolveImageSource(frontImageValue),
        resolveImageSource(backImageValue)
    ]).then(function (sources) {
        var frontImage = sources[0];
        var backImage = sources[1];

        if (frontImage) {
            state.front = frontImage;
        }

        if (backImage) {
            state.back = backImage;
        }

        if (!frontImage && !backImage) {
            resolveImageSource(getPreviewCandidateValue(result, currentSide)).then(function (sideImage) {
                if (sideImage) {
                    state[currentSide] = sideImage;
                    renderPreviewState();
                    return;
                }

                renderPreviewState();
                if (!hasActivePreviewImage()) {
                    setStatus('Capture result received, but no preview image was returned.');
                }
            });
            return;
        }

        renderPreviewState();

        if (!hasActivePreviewImage()) {
            setStatus('Capture result received, but no preview image was returned.');
        }
    });
}

function renderPreviewState() {
    var state = previewState[activeDocument] || {};
    setPreviewImage(frontPreviewImage, state.front || '');
    setPreviewImage(backPreviewImage, state.back || '');
    previewSection.hidden = false;
}

function setPreviewImage(imageElement, source) {
    imageElement.src = source;
    imageElement.parentElement.classList.toggle('has-image', Boolean(source));
}

function getPreviewCandidate(result, side) {
    return getImageSource(getPreviewCandidateValue(result, side));
}

function getPreviewCandidateValue(result, side) {
    if (side === 'back') {
        return (
            result.rearCroppedUri ||
            result.rearUri
        );
    }

    return (
        result.selfieUri ||
        result.frontCroppedUri ||
        result.frontUri
    );
}

function resolveImageSource(value) {
    if (!value || typeof value !== 'string') {
        return Promise.resolve('');
    }

    if (value.indexOf('data:image') === 0) {
        return Promise.resolve(value);
    }

    if (window.cordova && isLocalImageUri(value)) {
        return readLocalImageAsDataUrl(value).then(function (dataUrl) {
            return dataUrl || getImageSource(value);
        }).catch(function () {
            return getImageSource(value);
        });
    }

    return Promise.resolve(getImageSource(value));
}

function getImageSource(value) {
    if (!value || typeof value !== 'string') {
        return '';
    }

    if (value.indexOf('data:image') === 0 || value.indexOf('file:') === 0 || value.indexOf('content:') === 0) {
        return value;
    }

    if (window.Ionic && window.Ionic.WebView && typeof window.Ionic.WebView.convertFileSrc === 'function') {
        return window.Ionic.WebView.convertFileSrc(value);
    }

    if (value.indexOf('/') === 0) {
        return 'file://' + value;
    }

    return 'data:image/jpeg;base64,' + value;
}

function isLocalImageUri(value) {
    return value.indexOf('file:') === 0 ||
        value.indexOf('content:') === 0 ||
        value.indexOf('/') === 0;
}

function readLocalImageAsDataUrl(value) {
    return new Promise(function (resolve, reject) {
        if (!window.resolveLocalFileSystemURL || !window.FileReader) {
            reject(new Error('Cordova file plugin is not available.'));
            return;
        }

        var uri = value.indexOf('/') === 0 ? 'file://' + value : value;
        window.resolveLocalFileSystemURL(uri, function (entry) {
            entry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    resolve(reader.result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }, reject);
        }, reject);
    });
}

function hasActivePreviewImage() {
    var state = previewState[activeDocument] || {};
    return Boolean(state.front || state.back);
}

function setPreviewButtonsDisabled(disabled) {
    previewButtons.forEach(function (button) {
        if (!button.hidden) {
            button.disabled = disabled;
        }
    });
}

function getActiveDocumentName() {
    if (activeDocument === 'id') {
        return 'ID';
    }

    return activeDocument.charAt(0).toUpperCase() + activeDocument.slice(1);
}

function getSideLabel(side) {
    var config = documents[activeDocument];
    var sideConfig = config.sides.filter(function (item) {
        return item.sdkSide === side;
    })[0];

    return sideConfig ? sideConfig.label.replace('Scan ', '') : 'Scan';
}

function setStatus(message) {
    statusLabel.textContent = message;
}
