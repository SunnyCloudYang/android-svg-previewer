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

// Handle wheel zoom
previewContainer.addEventListener('wheel', (e) => {
	if (e.ctrlKey || e.metaKey) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
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
	currentZoom = Math.min(maxZoom, currentZoom + zoomStep);
	applyZoom();
}

function zoomOut() {
	currentZoom = Math.max(minZoom, currentZoom - zoomStep);
	applyZoom();
}

function resetZoom() {
	// Calculate zoom to fit the container (with minimal padding)
	const containerWidth = previewContainer.clientWidth - 40;
	const containerHeight = previewContainer.clientHeight - 40;
	
	const scaleX = containerWidth / baseWidth;
	const scaleY = containerHeight / baseHeight;
	
	// Allow upscaling for small images, cap at 5x for very small icons
	currentZoom = Math.min(scaleX, scaleY, maxZoom);
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
		mark.style.bottom = '0px';
		mark.innerHTML = '<span style="position:absolute;top:0px;left:50%;transform:translateX(-50%);white-space:nowrap;">' + i + '</span><br><span style="padding-top:2px;">│</span>';
		rulerTop.appendChild(mark);
	}
	
	// Always add final tick if not already present
	if (!drawnPositions.has(maxWidth)) {
		const mark = document.createElement('div');
		mark.className = 'ruler-marks ruler-tick-major';
		const pos = (previewContainer.clientWidth / 2) - (baseWidth * currentZoom / 2) + (maxWidth * currentZoom);
		mark.style.left = pos + 'px';
		mark.style.bottom = '0px';
		mark.innerHTML = '<span style="position:absolute;top:0px;left:50%;transform:translateX(-50%);white-space:nowrap;">' + maxWidth + '</span><br><span style="padding-top:2px;">│</span>';
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
		mark.innerHTML = '<span style="position:absolute;left:2px;top:-4px;white-space:nowrap;">' + i + '</span><span style="position:absolute;right:0px;top:-4px;">─</span>';
		rulerLeft.appendChild(mark);
	}
	
	// Always add final tick if not already present
	if (!drawnPositions.has(maxHeight)) {
		const mark = document.createElement('div');
		mark.className = 'ruler-marks ruler-tick-major vertical-tick';
		const pos = (previewContainer.clientHeight / 2) - (baseHeight * currentZoom / 2) + (maxHeight * currentZoom);
		mark.style.top = pos + 'px';
		mark.innerHTML = '<span style="position:absolute;left:2px;top:-4px;white-space:nowrap;">' + maxHeight + '</span><span style="position:absolute;right:0px;top:-4px;">─</span>';
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
