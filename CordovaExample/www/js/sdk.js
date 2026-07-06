(function () {
    var contourConfig = {
        clientId: '<CLIENT_ID>',
        captureType: 'both',
        enableMultipleCapturing: false
    };
    var sdkDocuments = {
        check: {
            documentType: 'check',
            sides: [
                { captureSide: 'front' },
                { captureSide: 'back' }
            ]
        },
        id: {
            documentType: 'id',
            sides: [
                { captureSide: 'front' },
                { captureSide: 'back' }
            ]
        },
        passport: {
            documentType: 'passport',
            sides: [
                { captureSide: 'front' }
            ]
        },
        selfie: {
            documentType: 'selfie',
            sides: [
                {}
            ]
        }
    };

    function createSdk() {
        function getDocuments() {
            return sdkDocuments;
        }

        function getPreviewImageValue(result, side) {
            if (!result || typeof result !== 'object') {
                return '';
            }

            if (side === 'back') {
                return result.rearUri || result.rearCroppedUri;
            }

            if (result.selfieUri) {
                return result.selfieUri;
            }

            return result.frontUri || result.frontCroppedUri;
        }

        function initialize(onReady) {
            if (!window.ContourAISDK || typeof window.ContourAISDK.initialize !== 'function') {
                console.warn('ContourAISDK initialize action is not available.');
                return;
            }
            window.ContourAISDK.initialize(contourConfig.clientId, function (message) {
                console.log(message || 'Contour SDK initialization started.');
                if (typeof onReady === 'function') {
                    onReady(message);
                }
            });
        }

        function openScan(scanRequest, onSuccess, onError) {
            if (!(window.cordova && cordova.exec)) {
                onError('ContourAISDK is not available yet. Install the local plugin to open the SDK.');
                return;
            }

            var scanType = scanRequest.documentType || scanRequest.sdkType || scanRequest.scanType;
            var captureSide = scanRequest.captureSide || 'front';
            if (!window.ContourAISDK || typeof window.ContourAISDK.startContour !== 'function') {
                onError('ContourAISDK startContour action is not available.');
                return;
            }
            window.ContourAISDK.startContour(
                contourConfig.clientId,
                contourConfig.captureType,
                scanType,
                captureSide,
                contourConfig.enableMultipleCapturing,
                onSuccess,
                onError
            );
        }

        function registerCallbacks(onClose, onEvent) {
            if (!(window.cordova && cordova.exec)) {
                return;
            }

            cordova.exec(onClose, null, 'ContourAISDK', 'onClose', []);
            cordova.exec(onEvent, null, 'ContourAISDK', 'eventCallBack', []);
        }

        return {
            getDocuments: getDocuments,
            getPreviewImageValue: getPreviewImageValue,
            initialize: initialize,
            openScan: openScan,
            registerCallbacks: registerCallbacks
        };
    }

    window.CordovaExampleSdk = {
        create: createSdk
    };
}());
