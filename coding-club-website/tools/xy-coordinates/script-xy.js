const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const hoverTooltip = document.getElementById('hoverTooltip');

// Control References
const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
const xSlider = document.getElementById('xSlider');
const ySlider = document.getElementById('ySlider');
const sizeMinusBtn = document.getElementById('sizeMinusBtn');
const sizePlusBtn = document.getElementById('sizePlusBtn');
const targetSizeVal = document.getElementById('targetSizeVal');

// Readout References
const widthVal = document.getElementById('widthVal');
const heightVal = document.getElementById('heightVal');
const xVal = document.getElementById('xVal');
const yVal = document.getElementById('yVal');

const readoutX = document.getElementById('readoutX');
const readoutY = document.getElementById('readoutY');
const readoutW = document.getElementById('readoutW');
const readoutH = document.getElementById('readoutH');
const pythonCode = document.getElementById('pythonCode');

// State Variable for Target Size (index 0 = 1, 1 = 9, 2 = 25, 3 = 49...)
let sizeIndex = 0;

function getSideLength(idx) {
  return (2 * idx) + 1; // 1, 3, 5, 7, 9...
}

function getArea(idx) {
  const side = getSideLength(idx);
  return side * side; // 1, 9, 25, 49, 81...
}

function drawGrid() {
  const gridW = parseInt(widthSlider.value, 10);
  const gridH = parseInt(heightSlider.value, 10);

  // Dynamically update max limits for target position sliders
  xSlider.max = gridW - 1;
  ySlider.max = gridH - 1;

  // Clamp current active target inside bounds
  if (parseInt(xSlider.value, 10) >= gridW) xSlider.value = gridW - 1;
  if (parseInt(ySlider.value, 10) >= gridH) ySlider.value = gridH - 1;

  const targetX = parseInt(xSlider.value, 10);
  const targetY = parseInt(ySlider.value, 10);

  // Calculate target box size dimensions
  const sideLength = getSideLength(sizeIndex);
  const area = getArea(sizeIndex);
  const offset = sizeIndex; // offset to center target on (targetX, targetY)

  // Update target size display and button states
  targetSizeVal.textContent = area;
  sizeMinusBtn.disabled = (sizeIndex === 0);

  // Set internal canvas pixel grid resolution
  canvas.width = gridW;
  canvas.height = gridH;

  // Background Fill
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, gridW, gridH);

  // Draw active selected target block
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(targetX - offset, targetY - offset, sideLength, sideLength);

  // Update UI Text
  widthVal.textContent = `${gridW} px`;
  heightVal.textContent = `${gridH} px`;
  xVal.textContent = targetX;
  yVal.textContent = targetY;

  readoutX.textContent = targetX;
  readoutY.textContent = targetY;
  readoutW.textContent = gridW;
  readoutH.textContent = gridH;

  // Update Pygame Code Output Snippet
  if (pythonCode) {
    if (area === 1) {
      pythonCode.textContent = `# Pygame position\nplayer_pos = (${targetX}, ${targetY})`;
    } else {
      const startX = targetX - offset;
      const startY = targetY - offset;
      pythonCode.textContent = `# Pygame Rect (${sideLength}x${sideLength})\nplayer_rect = pygame.Rect(${startX}, ${startY}, ${sideLength}, ${sideLength})`;
    }
  }
}

// Target Size Stepper Button Listeners
sizeMinusBtn.addEventListener('click', () => {
  if (sizeIndex > 0) {
    sizeIndex--;
    drawGrid();
  }
});

sizePlusBtn.addEventListener('click', () => {
  sizeIndex++;
  drawGrid();
});

// Click Canvas to Select X/Y Position
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const gridW = parseInt(widthSlider.value, 10);
  const gridH = parseInt(heightSlider.value, 10);

  const selectedX = Math.floor((clickX / rect.width) * gridW);
  const selectedY = Math.floor((clickY / rect.height) * gridH);

  xSlider.value = Math.min(Math.max(selectedX, 0), gridW - 1);
  ySlider.value = Math.min(Math.max(selectedY, 0), gridH - 1);

  drawGrid();
});

// Hover Tooltip following Mouse Cursor over Canvas
canvas.addEventListener('mousemove', (event) => {
  const canvasRect = canvas.getBoundingClientRect();
  const wrapperRect = canvasWrapper.getBoundingClientRect();

  const clickX = event.clientX - canvasRect.left;
  const clickY = event.clientY - canvasRect.top;

  const gridW = parseInt(widthSlider.value, 10);
  const gridH = parseInt(heightSlider.value, 10);

  const hoverX = Math.floor((clickX / canvasRect.width) * gridW);
  const hoverY = Math.floor((clickY / canvasRect.height) * gridH);

  const clampedX = Math.min(Math.max(hoverX, 0), gridW - 1);
  const clampedY = Math.min(Math.max(hoverY, 0), gridH - 1);

  hoverTooltip.textContent = `(${clampedX}, ${clampedY})`;
  hoverTooltip.style.display = 'block';

  // Position tooltip relative to wrapper container
  const posX = event.clientX - wrapperRect.left;
  const posY = event.clientY - wrapperRect.top;

  hoverTooltip.style.left = `${posX}px`;
  hoverTooltip.style.top = `${posY}px`;
});

canvas.addEventListener('mouseleave', () => {
  hoverTooltip.style.display = 'none';
});

// Input Listeners
widthSlider.addEventListener('input', drawGrid);
heightSlider.addEventListener('input', drawGrid);
xSlider.addEventListener('input', drawGrid);
ySlider.addEventListener('input', drawGrid);

// Initial Render
drawGrid();