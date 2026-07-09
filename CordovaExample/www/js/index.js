var uiDocuments = {
    check: {
        title: 'Check Scan',
        description: 'Capture the front or back side of the check.',
        frontLabel: 'Front Check',
        backLabel: 'Back Check',
        sides: [
            { label: 'Scan Front' },
            { label: 'Scan Back' }
        ]
    },
    id: {
        title: 'ID Scan',
        description: 'Capture the front and back side of the ID.',
        frontLabel: 'Front ID',
        backLabel: 'Back ID',
        sides: [
            { label: 'Scan Front' },
            { label: 'Scan Back' }
        ]
    },
    passport: {
        title: 'Passport Scan',
        description: 'Capture the passport front face only.',
        frontLabel: 'Passport Front Face',
        sides: [
            { label: 'Scan Front Face' }
        ]
    },
    selfie: {
        title: 'Selfie Scan',
        description: 'Capture your selfie',
        frontLabel: 'User Selfie',
        sides: [
            { label: 'Capture Face' }
        ]
    }
};

var ui = window.CordovaExampleUi.create({
    documents: uiDocuments,
    onDocumentChange: setActiveDocument,
    onPreviewSelect: openScan
});

var sdk = window.CordovaExampleSdk.create();
var sdkDocuments = sdk.getDocuments();

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
document.addEventListener('resume', onAppResume, false);
document.addEventListener('visibilitychange', onVisibilityChange, false);

function onDeviceReady() {
    isDeviceReady = true;
    applyPlatformClass();
    ui.setPreviewButtonsDisabled(false);
    ui.renderVersionMeta();
    sdk.initialize();

    if (window.cordova) {
        console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    }
}

function applyPlatformClass() {
    if (!window.cordova || !cordova.platformId || !document.body) {
        return;
    }

    document.body.classList.add('platform-' + cordova.platformId);
}

function onAppResume() {
    enablePreviewButtons();
}

function onVisibilityChange() {
    if (!document.hidden) {
        enablePreviewButtons();
    }
}

function enablePreviewButtons() {
    if (isDeviceReady) {
        ui.setPreviewButtonsDisabled(false);
    }
}

function setActiveDocument(documentKey) {
    if (!uiDocuments[documentKey] || !sdkDocuments[documentKey]) {
        return;
    }

    activeDocument = documentKey;
    activeScan = null;
    ui.renderDocumentScreen(activeDocument, isDeviceReady, previewState);
    resetScrollPosition();
}

function resetScrollPosition() {
    window.scrollTo(0, 0);

    if (document.body) {
        document.body.scrollTop = 0;
    }

    if (document.documentElement) {
        document.documentElement.scrollTop = 0;
    }
}

function openScan(sideIndex) {
    var uiConfig = uiDocuments[activeDocument];
    var sdkConfig = sdkDocuments[activeDocument];
    var uiSide = uiConfig.sides[Number(sideIndex)];
    var sdkSide = sdkConfig.sides[Number(sideIndex)];

    if (!uiSide || !sdkSide) {
        return;
    }

    activeScan = {
        documentKey: activeDocument,
        documentType: sdkConfig.documentType,
        captureSide: sdkSide.captureSide || 'front'
    };

    ui.setPreviewButtonsDisabled(true);

    sdk.registerCallbacks(
        function () {
            enablePreviewButtons();
        },
        function () {}
    );

    sdk.openScan(activeScan, onSdkOpenSuccess, onSdkOpenError);
}

function onSdkOpenSuccess(message) {
    enablePreviewButtons();

    var result = normalizeResult(message);
    if (result) {
        updateImagePreviews(result);
    }
}

function onSdkOpenError(error) {
    enablePreviewButtons();
    console.error('Scan error:', error);
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

function updateImagePreviews(result) {
    console.log('Contour capture result:', result);

    var currentDocument = activeScan ? activeScan.documentKey : activeDocument;
    var currentSide = activeScan ? activeScan.captureSide : 'front';
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
                    ui.renderDocumentScreen(activeDocument, isDeviceReady, previewState);
                    return;
                }

                ui.renderDocumentScreen(activeDocument, isDeviceReady, previewState);
            });
            return;
        }

        ui.renderDocumentScreen(activeDocument, isDeviceReady, previewState);
    });
}

function getPreviewCandidate(result, side) {
    return getImageSource(getPreviewCandidateValue(result, side));
}

function getPreviewCandidateValue(result, side) {
    return sdk.getPreviewImageValue(result, side);
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

ui.renderDocumentScreen(activeDocument, isDeviceReady, previewState);
