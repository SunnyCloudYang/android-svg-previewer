const vscode = acquireVsCodeApi();

let currentZoom = 1.0;
let baseWidth = {{svgWidth}};
let baseHeight = {{svgHeight}};

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

const maxZoom = 50;
const minZoom = 0.25;
const zoomStep = 0.25;

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

// Handle wheel zoom — zoom toward pointer, Ctrl/Cmd required
previewContainer.addEventListener('wheel', (e) => {
	if (!e.ctrlKey && !e.metaKey) { return; }
	e.preventDefault();

	const rect = previewContainer.getBoundingClientRect();
	const pointerX = e.clientX - rect.left;
	const pointerY = e.clientY - rect.top;

	// SVG is always at PAD inside the wrapper
	const svgX = (pointerX + previewContainer.scrollLeft - PAD) / currentZoom;
	const svgY = (pointerY + previewContainer.scrollTop  - PAD) / currentZoom;

	// 3% per notch
	const factor = e.deltaY < 0 ? 1.02 : 1 / 1.02;
	currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom * factor));

	applyZoom();

	previewContainer.scrollLeft = PAD + svgX * currentZoom - pointerX;
	previewContainer.scrollTop  = PAD + svgY * currentZoom - pointerY;
}, { passive: false });

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
	currentZoom = Math.min(maxZoom, currentZoom + zoomStep);
	applyZoom();
}

function zoomOut() {
	currentZoom = Math.max(minZoom, currentZoom - zoomStep);
	applyZoom();
}

function resetZoom() {
	const containerWidth = previewContainer.clientWidth - PAD * 2;
	const containerHeight = previewContainer.clientHeight - PAD * 2;

	currentZoom = Math.min(containerWidth / baseWidth, containerHeight / baseHeight, maxZoom);
	applyZoom();

	// Center by scrolling: wrapper = svgSize + 2*PAD, so center scroll = (wrapW - containerW) / 2
	const wrapW = baseWidth * currentZoom + PAD * 2;
	const wrapH = baseHeight * currentZoom + PAD * 2;
	previewContainer.scrollLeft = (wrapW - previewContainer.clientWidth) / 2;
	previewContainer.scrollTop  = (wrapH - previewContainer.clientHeight) / 2;
}

const PAD = 40;

function applyZoom() {
	const width = baseWidth * currentZoom;
	const height = baseHeight * currentZoom;

	svgImage.style.width = width + 'px';
	svgImage.style.height = height + 'px';

	svgContainer.style.width = width + 'px';
	svgContainer.style.height = height + 'px';
	svgContainer.style.margin = '0';

	// Wrapper is always exactly SVG + PAD on all sides — never clamped to
	// containerW/H. Centering is done via scrollLeft/scrollTop, not by
	// changing offsetX/Y, so zoom-toward-pointer works at all zoom levels.
	const wrapW = width + PAD * 2;
	const wrapH = height + PAD * 2;
	const previewWrapper = svgContainer.parentElement;
	previewWrapper.style.width = wrapW + 'px';
	previewWrapper.style.height = wrapH + 'px';

	// SVG is always at (PAD, PAD) inside the wrapper.
	svgContainer.style.position = 'absolute';
	svgContainer.style.left = PAD + 'px';
	svgContainer.style.top = PAD + 'px';

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
	
	if (currentZoom > 10) {
		interval = 2;
	} else if (currentZoom > 5) {
		interval = 5;
	} else if (currentZoom > 2) {
		interval = 10;
	} else if (currentZoom > 0.5) {
		interval = 20;
	} else {
		interval = 50;
	}

	// SVG origin in viewport coords: SVG is always at PAD inside the wrapper
	const svgLeft = PAD - previewContainer.scrollLeft;
	const svgTop  = PAD - previewContainer.scrollTop;

	// Draw horizontal ruler (top)
	rulerTop.innerHTML = '';
	const maxWidth = baseWidth;
	const drawnPositions = new Set();

	for (let i = 0; i <= maxWidth; i += interval) {
		drawnPositions.add(i);
		const pos = svgLeft + i * currentZoom;
		if (pos < -20 || pos > previewContainer.clientWidth + 20) { continue; }
		const mark = document.createElement('div');
		mark.className = 'ruler-marks ruler-tick-major';
		mark.style.left = pos + 'px';
		mark.style.bottom = '0px';
		mark.innerHTML = '<span style="position:absolute;top:0px;left:50%;transform:translateX(-50%);white-space:nowrap;">' + i + '</span><br><span style="padding-top:2px;">│</span>';
		rulerTop.appendChild(mark);
	}

	if (!drawnPositions.has(maxWidth)) {
		const pos = svgLeft + maxWidth * currentZoom;
		if (pos >= -20 && pos <= previewContainer.clientWidth + 20) {
			const mark = document.createElement('div');
			mark.className = 'ruler-marks ruler-tick-major';
			mark.style.left = pos + 'px';
			mark.style.bottom = '0px';
			mark.innerHTML = '<span style="position:absolute;top:0px;left:50%;transform:translateX(-50%);white-space:nowrap;">' + maxWidth + '</span><br><span style="padding-top:2px;">│</span>';
			rulerTop.appendChild(mark);
		}
	}

	// Draw vertical ruler (left)
	rulerLeft.innerHTML = '';
	const maxHeight = baseHeight;
	drawnPositions.clear();

	for (let i = 0; i <= maxHeight; i += interval) {
		drawnPositions.add(i);
		const pos = svgTop + i * currentZoom;
		if (pos < -20 || pos > previewContainer.clientHeight + 20) { continue; }
		const mark = document.createElement('div');
		mark.className = 'ruler-marks ruler-tick-major vertical-tick';
		mark.style.top = pos + 'px';
		mark.innerHTML = '<span style="position:absolute;left:2px;top:-4px;white-space:nowrap;">' + i + '</span><span style="position:absolute;right:0px;top:-4px;">─</span>';
		rulerLeft.appendChild(mark);
	}

	if (!drawnPositions.has(maxHeight)) {
		const pos = svgTop + maxHeight * currentZoom;
		if (pos >= -20 && pos <= previewContainer.clientHeight + 20) {
			const mark = document.createElement('div');
			mark.className = 'ruler-marks ruler-tick-major vertical-tick';
			mark.style.top = pos + 'px';
			mark.innerHTML = '<span style="position:absolute;left:2px;top:-4px;white-space:nowrap;">' + maxHeight + '</span><span style="position:absolute;right:0px;top:-4px;">─</span>';
			rulerLeft.appendChild(mark);
		}
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

// Handle window resize to update rulers and wrapper size
window.addEventListener('resize', () => {
	applyZoom();
});

// Update ruler tick positions when scrolling
previewContainer.addEventListener('scroll', () => {
	updateRulers();
});
