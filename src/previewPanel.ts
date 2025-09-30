import * as vscode from "vscode";
import { convertVectorDrawableToSVG, getNonce } from "./utils";

/**
 * Manages the webview panel for Android vector drawable preview
 */
export class AndroidVectorDrawablePreviewPanel {
  public static currentPanel: AndroidVectorDrawablePreviewPanel | undefined;
  private static readonly viewType = "androidVectorDrawablePreview";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _document: vscode.TextDocument | undefined;

  public static createOrShow(
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ) {
    const column = vscode.ViewColumn.Beside;

    // If we already have a panel, show it
    if (AndroidVectorDrawablePreviewPanel.currentPanel) {
      AndroidVectorDrawablePreviewPanel.currentPanel._panel.reveal(column);
      AndroidVectorDrawablePreviewPanel.currentPanel.update(document);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      AndroidVectorDrawablePreviewPanel.viewType,
      "Vector Drawable Preview",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    AndroidVectorDrawablePreviewPanel.currentPanel =
      new AndroidVectorDrawablePreviewPanel(panel, extensionUri, document);
  }

  public static updateIfVisible(document: vscode.TextDocument) {
    if (AndroidVectorDrawablePreviewPanel.currentPanel) {
      AndroidVectorDrawablePreviewPanel.currentPanel.update(document);
    }
  }

  public static dispose() {
    AndroidVectorDrawablePreviewPanel.currentPanel?.dispose();
    AndroidVectorDrawablePreviewPanel.currentPanel = undefined;
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._document = document;

    // Set the webview's initial html content
    this.update(document);

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "error":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public update(document: vscode.TextDocument) {
    this._document = document;
    this._panel.title = `Preview: ${document.fileName.split("/").pop()}`;
    this._panel.webview.html = this._getHtmlForWebview(document);
  }

  public dispose() {
    AndroidVectorDrawablePreviewPanel.currentPanel = undefined;

    // Clean up resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getHtmlForWebview(document: vscode.TextDocument): string {
    const nonce = getNonce();

    const xmlContent = document.getText();
    const svgContent = convertVectorDrawableToSVG(xmlContent);

    if (!svgContent) {
      return this._getErrorHtml(
        nonce,
        "Unable to parse vector drawable. Please ensure it's a valid Android vector drawable XML."
      );
    }

    // Extract dimensions from SVG for JavaScript
    const widthMatch = svgContent.match(/width="([^"]+)"/);
    const heightMatch = svgContent.match(/height="([^"]+)"/);
    const svgWidth = widthMatch ? widthMatch[1] : "24";
    const svgHeight = heightMatch ? heightMatch[1] : "24";

    // Encode SVG for data URI
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(
      svgContent
    ).toString("base64")}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${this._panel.webview.cspSource}; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
	<title>Vector Drawable Preview</title>
	<style>
		body {
			margin: 0;
			padding: 0;
			overflow: hidden;
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
			font-family: var(--vscode-font-family);
			height: 100vh;
			display: flex;
			flex-direction: column;
		}

		.toolbar {
			display: flex;
			align-items: center;
			padding: 8px 12px;
			background-color: var(--vscode-editorGroupHeader-tabsBackground);
			border-bottom: 1px solid var(--vscode-panel-border);
			gap: 12px;
			flex-shrink: 0;
		}

		.toolbar button {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 4px 8px;
			cursor: pointer;
			border-radius: 2px;
			font-size: 16px;
			min-width: 28px;
			height: 28px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.toolbar button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		.toolbar button.active {
			background-color: var(--vscode-button-secondaryBackground);
			border: 1px solid var(--vscode-button-border);
		}

		.toolbar .separator {
			width: 1px;
			height: 20px;
			background-color: var(--vscode-panel-border);
			margin: 0 4px;
		}

		.toolbar .info {
			font-size: 11px;
			color: var(--vscode-descriptionForeground);
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 0 4px;
		}

		.toolbar .info-label {
			color: var(--vscode-foreground);
			font-weight: 500;
		}

		.ruler-container {
			flex: 1;
			position: relative;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		.ruler-top {
			height: 25px;
			background-color: var(--vscode-editorWidget-background);
			border-bottom: 1px solid var(--vscode-panel-border);
			position: relative;
			overflow: hidden;
			margin-left: 25px;
		}

		.ruler-horizontal {
			display: flex;
			position: relative;
			flex: 1;
			overflow: hidden;
		}

		.ruler-left {
			width: 25px;
			background-color: var(--vscode-editorWidget-background);
			border-right: 1px solid var(--vscode-panel-border);
			position: relative;
			overflow: hidden;
			display: flex;
			align-items: flex-start;
		}

		.ruler-marks {
			position: absolute;
			color: var(--vscode-descriptionForeground);
			font-size: 9px;
			font-family: monospace;
			line-height: 1;
		}
		
		.ruler-marks.vertical-tick {
			left: 0;
			width: 100%;
			text-align: left;
		}

		.ruler-tick-major {
			color: var(--vscode-foreground);
			font-weight: 500;
		}

		.ruler-tick-minor {
			opacity: 0.6;
		}

		.crosshair {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			pointer-events: none;
			z-index: 1000;
			display: none;
			overflow: hidden;
		}

		.crosshair.active {
			display: block;
		}

		.crosshair-h {
			position: absolute;
			left: 0;
			right: 0;
			height: 1px;
			background-color: var(--vscode-editorCursor-foreground);
			opacity: 0.7;
		}

		.crosshair-v {
			position: absolute;
			top: 0;
			bottom: 0;
			width: 1px;
			background-color: var(--vscode-editorCursor-foreground);
			opacity: 0.7;
		}

		.crosshair-coords {
			position: absolute;
			background-color: var(--vscode-editorWidget-background);
			color: var(--vscode-editorWidget-foreground);
			border: 1px solid var(--vscode-panel-border);
			padding: 2px 6px;
			font-size: 10px;
			font-family: monospace;
			border-radius: 3px;
			white-space: nowrap;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		}

		.ruler-crosshair {
			position: absolute;
			background-color: var(--vscode-editorCursor-foreground);
			opacity: 0.8;
			display: none;
		}

		.ruler-crosshair.active {
			display: block;
		}

		.ruler-crosshair-h {
			height: 100%;
			width: 2px;
			box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
		}

		.ruler-crosshair-v {
			width: 100%;
			height: 2px;
			box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
		}

		.preview-container {
			flex: 1;
			position: relative;
			overflow: auto;
			background-image: 
				linear-gradient(45deg, var(--vscode-editor-lineHighlightBackground) 25%, transparent 25%),
				linear-gradient(-45deg, var(--vscode-editor-lineHighlightBackground) 25%, transparent 25%),
				linear-gradient(45deg, transparent 75%, var(--vscode-editor-lineHighlightBackground) 75%),
				linear-gradient(-45deg, transparent 75%, var(--vscode-editor-lineHighlightBackground) 75%);
			background-size: 20px 20px;
			background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
		}

		.preview-wrapper {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}

		.svg-container {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		.bounds-box {
			position: absolute;
			border: 2px dashed var(--vscode-editorInfo-foreground);
			pointer-events: none;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
		}

		.bounds-label {
			position: absolute;
			top: -20px;
			left: 0;
			font-size: 11px;
			color: var(--vscode-editorInfo-foreground);
			background-color: var(--vscode-editor-background);
			padding: 2px 6px;
			border-radius: 2px;
			white-space: nowrap;
		}

		#svgImage {
			display: block;
			transition: transform 0.1s ease-out;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		}

		.zoom-controls {
			position: absolute;
			bottom: 20px;
			right: 20px;
			display: flex;
			flex-direction: column;
			gap: 4px;
			background-color: var(--vscode-editorWidget-background);
			border: 1px solid var(--vscode-panel-border);
			border-radius: 4px;
			padding: 4px;
		}

		.zoom-controls button {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			padding: 6px 12px;
			cursor: pointer;
			border-radius: 2px;
			font-size: 14px;
			min-width: 40px;
		}

		.zoom-controls button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		.zoom-controls .zoom-level {
			text-align: center;
			font-size: 12px;
			padding: 4px;
			color: var(--vscode-descriptionForeground);
		}
	</style>
</head>
<body>
	<div class="toolbar">
		<div class="info">
			<span class="info-label">Zoom:</span>
			<span id="scaleInfo">100%</span>
			<span class="info-label">│</span>
			<span class="info-label">Size:</span>
			<span id="boundsInfo">-</span>
		</div>
	</div>
	<div class="ruler-container">
		<div class="ruler-top" id="rulerTop">
			<div class="ruler-crosshair ruler-crosshair-h" id="rulerCrosshairTop"></div>
		</div>
		<div class="ruler-horizontal">
			<div class="ruler-left" id="rulerLeft">
				<div class="ruler-crosshair ruler-crosshair-v" id="rulerCrosshairLeft"></div>
			</div>
			<div class="preview-container" id="previewContainer">
				<div class="crosshair" id="crosshair">
					<div class="crosshair-h" id="crosshairH"></div>
					<div class="crosshair-v" id="crosshairV"></div>
					<div class="crosshair-coords" id="crosshairCoords">0, 0</div>
				</div>
				<div class="preview-wrapper">
					<div class="svg-container" id="svgContainer">
						<div class="bounds-box">
							<div class="bounds-label" id="boundsLabel">0 × 0 dp</div>
						</div>
						<img id="svgImage" src="${svgDataUri}" alt="Vector Drawable Preview" />
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="zoom-controls">
		<button id="crosshairBtn" title="Toggle Crosshair">⌖</button>
		<button id="zoomInBtn2" title="Zoom In">+</button>
		<div class="zoom-level" id="zoomLevel">100%</div>
		<button id="zoomOutBtn2" title="Zoom Out">-</button>
		<button id="resetZoomBtn2" title="Reset Zoom">⟲</button>
	</div>

	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		
		let currentZoom = 1.0;
		let baseWidth = ${svgWidth};
		let baseHeight = ${svgHeight};
		
		const svgImage = document.getElementById('svgImage');
		const svgContainer = document.getElementById('svgContainer');
		const previewContainer = document.getElementById('previewContainer');
		const scaleInfo = document.getElementById('scaleInfo');
		const boundsInfo = document.getElementById('boundsInfo');
		const boundsLabel = document.getElementById('boundsLabel');
		const zoomLevel = document.getElementById('zoomLevel');
		const rulerTop = document.getElementById('rulerTop');
		const rulerLeft = document.getElementById('rulerLeft');
		const crosshair = document.getElementById('crosshair');
		const crosshairH = document.getElementById('crosshairH');
		const crosshairV = document.getElementById('crosshairV');
		const crosshairCoords = document.getElementById('crosshairCoords');
		const crosshairBtn = document.getElementById('crosshairBtn');
		const rulerCrosshairTop = document.getElementById('rulerCrosshairTop');
		const rulerCrosshairLeft = document.getElementById('rulerCrosshairLeft');

		let crosshairEnabled = false;

		// Initialize on image load
		svgImage.onload = function() {
			// Use the dimensions we already know
			if (svgImage.naturalWidth > 0) {
				baseWidth = svgImage.naturalWidth;
				baseHeight = svgImage.naturalHeight;
			}
			resetZoom();
			updateBoundsInfo();
		};

		// Add button event listeners
		document.getElementById('zoomInBtn2').addEventListener('click', zoomIn);
		document.getElementById('zoomOutBtn2').addEventListener('click', zoomOut);
		document.getElementById('resetZoomBtn2').addEventListener('click', resetZoom);
		crosshairBtn.addEventListener('click', toggleCrosshair);

		// Handle wheel zoom
		previewContainer.addEventListener('wheel', (e) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				const delta = e.deltaY > 0 ? -0.1 : 0.1;
				currentZoom = Math.max(0.1, Math.min(10, currentZoom + delta));
				applyZoom();
			}
		});

		// Handle crosshair movement
		previewContainer.addEventListener('mousemove', (e) => {
			if (!crosshairEnabled) return;
			
			const rect = previewContainer.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			
			// Update crosshair position in preview
			crosshairH.style.top = y + 'px';
			crosshairV.style.left = x + 'px';
			
			// Update crosshair position in rulers
			const topRect = rulerTop.getBoundingClientRect();
			const leftRect = rulerLeft.getBoundingClientRect();
			rulerCrosshairTop.style.left = (e.clientX - topRect.left) + 'px';
			rulerCrosshairLeft.style.top = (e.clientY - leftRect.top) + 'px';
			
			// Calculate coordinates relative to the SVG
			const svgRect = svgImage.getBoundingClientRect();
			const containerRect = previewContainer.getBoundingClientRect();
			
			const svgX = Math.round((e.clientX - svgRect.left) / currentZoom);
			const svgY = Math.round((e.clientY - svgRect.top) / currentZoom);
			
			// Only show coordinates if cursor is over the SVG
			if (svgX >= 0 && svgX <= baseWidth && svgY >= 0 && svgY <= baseHeight) {
				crosshairCoords.textContent = svgX + ', ' + svgY;
				crosshairCoords.style.left = (x + 10) + 'px';
				crosshairCoords.style.top = (y + 10) + 'px';
				crosshairCoords.style.display = 'block';
			} else {
				crosshairCoords.style.display = 'none';
			}
		});

		previewContainer.addEventListener('mouseleave', () => {
			if (crosshairEnabled) {
				crosshairCoords.style.display = 'none';
			}
		});

		function zoomIn() {
			currentZoom = Math.min(10, currentZoom + 0.25);
			applyZoom();
		}

		function zoomOut() {
			currentZoom = Math.max(0.1, currentZoom - 0.25);
			applyZoom();
		}

		function resetZoom() {
			// Calculate zoom to fit the container (with minimal padding)
			const containerWidth = previewContainer.clientWidth - 40;
			const containerHeight = previewContainer.clientHeight - 40;
			
			const scaleX = containerWidth / baseWidth;
			const scaleY = containerHeight / baseHeight;
			
			// Allow upscaling for small images, cap at 5x for very small icons
			currentZoom = Math.min(scaleX, scaleY, 5.0);
			applyZoom();
		}

		function applyZoom() {
			const width = baseWidth * currentZoom;
			const height = baseHeight * currentZoom;
			
			svgImage.style.width = width + 'px';
			svgImage.style.height = height + 'px';
			
			svgContainer.style.width = width + 'px';
			svgContainer.style.height = height + 'px';
			
			updateZoomInfo();
			updateRulers();
		}

		function updateZoomInfo() {
			const percentage = Math.round(currentZoom * 100);
			scaleInfo.textContent = percentage + '%';
			zoomLevel.textContent = percentage + '%';
		}

		function updateBoundsInfo() {
			boundsInfo.textContent = baseWidth + ' × ' + baseHeight + ' px';
			boundsLabel.textContent = baseWidth + ' × ' + baseHeight + ' px';
		}

		function updateRulers() {
			// Determine tick interval based on zoom level
			let interval = 5;
			
			if (currentZoom > 8) {
				interval = 2;
			} else if (currentZoom > 4) {
				interval = 5;
			} else if (currentZoom > 2) {
				interval = 10;
			} else if (currentZoom > 0.5) {
				interval = 20;
			} else {
				interval = 50;
			}

			// Draw horizontal ruler (top)
			rulerTop.innerHTML = '';
			const maxWidth = baseWidth;
			const drawnPositions = new Set();
			
			// Draw regular ticks
			for (let i = 0; i <= maxWidth; i += interval) {
				drawnPositions.add(i);
				const mark = document.createElement('div');
				mark.className = 'ruler-marks ruler-tick-major';
				const pos = (previewContainer.clientWidth / 2) - (baseWidth * currentZoom / 2) + (i * currentZoom);
				mark.style.left = pos + 'px';
				mark.style.top = '0px';
				mark.innerHTML = '│<br><span style="position:absolute;top:13px;left:50%;transform:translateX(-50%);white-space:nowrap;">' + i + '</span>';
				rulerTop.appendChild(mark);
			}
			
			// Always add final tick if not already present
			if (!drawnPositions.has(maxWidth)) {
				const mark = document.createElement('div');
				mark.className = 'ruler-marks ruler-tick-major';
				const pos = (previewContainer.clientWidth / 2) - (baseWidth * currentZoom / 2) + (maxWidth * currentZoom);
				mark.style.left = pos + 'px';
				mark.style.top = '0px';
				mark.innerHTML = '│<br><span style="position:absolute;top:13px;left:50%;transform:translateX(-50%);white-space:nowrap;">' + maxWidth + '</span>';
				rulerTop.appendChild(mark);
			}

			// Draw vertical ruler (left)
			rulerLeft.innerHTML = '';
			const maxHeight = baseHeight;
			drawnPositions.clear();
			
			// Draw regular ticks
			for (let i = 0; i <= maxHeight; i += interval) {
				drawnPositions.add(i);
				const mark = document.createElement('div');
				mark.className = 'ruler-marks ruler-tick-major vertical-tick';
				const pos = (previewContainer.clientHeight / 2) - (baseHeight * currentZoom / 2) + (i * currentZoom);
				mark.style.top = pos + 'px';
				mark.innerHTML = '<span style="position:absolute;left:1px;top:-4px;">─</span><span style="position:absolute;left:8px;top:-4px;white-space:nowrap;">' + i + '</span>';
				rulerLeft.appendChild(mark);
			}
			
			// Always add final tick if not already present
			if (!drawnPositions.has(maxHeight)) {
				const mark = document.createElement('div');
				mark.className = 'ruler-marks ruler-tick-major vertical-tick';
				const pos = (previewContainer.clientHeight / 2) - (baseHeight * currentZoom / 2) + (maxHeight * currentZoom);
				mark.style.top = pos + 'px';
				mark.innerHTML = '<span style="position:absolute;left:1px;top:-4px;">─</span><span style="position:absolute;left:8px;top:-4px;white-space:nowrap;">' + maxHeight + '</span>';
				rulerLeft.appendChild(mark);
			}
		}

		function toggleCrosshair() {
			crosshairEnabled = !crosshairEnabled;
			if (crosshairEnabled) {
				crosshair.classList.add('active');
				rulerCrosshairTop.classList.add('active');
				rulerCrosshairLeft.classList.add('active');
				crosshairBtn.classList.add('active');
			} else {
				crosshair.classList.remove('active');
				rulerCrosshairTop.classList.remove('active');
				rulerCrosshairLeft.classList.remove('active');
				crosshairBtn.classList.remove('active');
			}
		}

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			if (e.key === '+' || e.key === '=') {
				e.preventDefault();
				zoomIn();
			} else if (e.key === '-' || e.key === '_') {
				e.preventDefault();
				zoomOut();
			} else if (e.key === '0') {
				e.preventDefault();
				resetZoom();
			}
		});
	</script>
</body>
</html>`;
  }

  private _getErrorHtml(nonce: string, errorMessage: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
	<title>Preview Error</title>
	<style>
		body {
			margin: 0;
			padding: 20px;
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
			font-family: var(--vscode-font-family);
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100vh;
		}
		.error-message {
			text-align: center;
			color: var(--vscode-errorForeground);
		}
	</style>
</head>
<body>
	<div class="error-message">
		<h2>⚠️ Preview Error</h2>
		<p>${errorMessage}</p>
	</div>
</body>
</html>`;
  }
}
