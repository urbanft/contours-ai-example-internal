(function () {
    function createUi(options) {
        var documents = options.documents;
        var onDocumentChange = options.onDocumentChange;
        var onPreviewSelect = options.onPreviewSelect;

        var topTitle = document.getElementById('top-title');
        var screenDescription = document.getElementById('screen-description');
        var previewButtons = Array.prototype.slice.call(document.querySelectorAll('.preview-tile'));
        var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab-button'));
        var previewSection = document.getElementById('image-preview-section');
        var backPreviewTile = document.getElementById('back-preview-tile');
        var frontPreviewImage = document.getElementById('front-preview-image');
        var backPreviewImage = document.getElementById('back-preview-image');
        var frontPreviewLabel = document.getElementById('front-preview-label');
        var backPreviewLabel = document.getElementById('back-preview-label');
        var versionMetaLabel = document.getElementById('version-meta');

        tabButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                onDocumentChange(button.dataset.document);
            });
        });

        previewButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                onPreviewSelect(button.dataset.sideIndex);
            });
        });

        function renderVersionMeta() {
            versionMetaLabel.textContent = 'Cordova Example App';
        }

        function renderDocumentScreen(activeDocument, isDeviceReady, previewState) {
            var config = documents[activeDocument];

            topTitle.textContent = config.title;
            screenDescription.textContent = config.description;
            frontPreviewLabel.textContent = config.frontLabel;
            backPreviewLabel.textContent = config.backLabel || '';
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

            renderPreviewState(activeDocument, previewState);
        }

        function renderPreviewState(activeDocument, previewState) {
            var state = previewState[activeDocument] || {};
            setPreviewImage(frontPreviewImage, state.front || '');
            setPreviewImage(backPreviewImage, state.back || '');
            previewSection.hidden = false;
        }

        function setPreviewImage(imageElement, source) {
            imageElement.src = source;
            imageElement.parentElement.classList.toggle('has-image', Boolean(source));
        }

        function setPreviewButtonsDisabled(disabled) {
            previewButtons.forEach(function (button) {
                if (!button.hidden) {
                    button.disabled = disabled;
                }
            });
        }

        return {
            renderVersionMeta: renderVersionMeta,
            renderDocumentScreen: renderDocumentScreen,
            setPreviewButtonsDisabled: setPreviewButtonsDisabled
        };
    }

    window.CordovaExampleUi = {
        create: createUi
    };
}());
