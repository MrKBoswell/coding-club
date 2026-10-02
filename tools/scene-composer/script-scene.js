const canvas = document.getElementById('sceneCanvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const hoverTooltip = document.getElementById('hoverTooltip');

const shapeButtons = document.querySelectorAll('.mode-btn');
const colorButtons = document.querySelectorAll('.color-btn');
const sizeWSlider = document.getElementById('sizeWSlider');
const sizeHSlider = document.getElementById('sizeHSlider');
const sizeWVal = document.getElementById('sizeWVal');
const sizeHVal = document.getElementById('sizeHVal');
const sizeWLabel = document.getElementById('sizeWLabel');
const heightGroup = document.getElementById('heightGroup');
const clearBtn = document.getElementById('clearBtn');
const pythonCode = document.getElementById('pythonCode');

// State
let currentShape = 'rect';
let currentColor = '#38bdf8';
let shapes = [];

function updateLabels() {
  if (currentShape === 'rect') {
    sizeWLabel.textContent = 'Width';
    sizeWVal.textContent = `${sizeWSlider.value} px`;
    sizeHVal.textContent = `${sizeHSlider.value} px`;
    heightGroup.style.display = 'flex';
  } else {
    sizeWLabel.textContent = 'Radius';
    sizeWVal.textContent = `${sizeWSlider.value} px`;
    heightGroup.style.display = 'none';
  }
}

function renderScene() {
  // Clear canvas with deep background
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid helper dots
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw all placed shapes
  shapes.forEach(shape => {
    ctx.fillStyle = shape.color;
    if (shape.type === 'rect') {
      ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    } else if (shape.type === 'circle') {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  generateCode();
}

function hexToRgbTuple(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `(${r}, ${g},${b})`;
}

function generateCode() {
  if (shapes.length === 0) {
    pythonCode.textContent = `# Click the canvas to add shapes!\n\n# Pygame loop draw block:\nscreen.fill((9, 9, 11))`;
    return;
  }

  let codeLines = [
    `# Pygame Scene Drawing Code`,
    `import pygame`,
    ``,
    `def draw_scene(screen):`,
    `    # Background fill`,
    `    screen.fill((9, 9, 11))`,
    ``
  ];

  shapes.forEach((shape, index) => {
    const rgb = hexToRgbTuple(shape.color);
    if (shape.type === 'rect') {
      codeLines.push(`    # Shape ${index + 1}: Rectangle`);
      codeLines.push(`    pygame.draw.rect(screen, ${rgb}, (${shape.x}, ${shape.y}, ${shape.w}, ${shape.h}))`);
    } else {
      codeLines.push(`    # Shape ${index + 1}: Circle`);
      codeLines.push(`    pygame.draw.circle(screen, ${rgb}, (${shape.x}, ${shape.y}), ${shape.r})`);
    }
  });

  pythonCode.textContent = codeLines.join('\n');
}

// Event Listeners for Shape Type Selection
shapeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    shapeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentShape = btn.dataset.shape;
    updateLabels();
  });
});

// Color Selection
colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    colorButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
  });
});

sizeWSlider.addEventListener('input', updateLabels);
sizeHSlider.addEventListener('input', updateLabels);

clearBtn.addEventListener('click', () => {
  shapes = [];
  renderScene();
});

// Click Canvas to Place Shape
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor(clickX * scaleX);
  const y = Math.floor(clickY * scaleY);

  const w = parseInt(sizeWSlider.value, 10);
  const h = parseInt(sizeHSlider.value, 10);

  if (currentShape === 'rect') {
    shapes.push({ type: 'rect', x: x - Math.floor(w / 2), y: y - Math.floor(h / 2), w, h, color: currentColor });
  } else {
    shapes.push({ type: 'circle', x, y, r: w, color: currentColor });
  }

  renderScene();
});

// Hover Tooltip tracking
canvas.addEventListener('mousemove', (event) => {
  const canvasRect = canvas.getBoundingClientRect();
  const wrapperRect = canvasWrapper.getBoundingClientRect();

  const clickX = event.clientX - canvasRect.left;
  const clickY = event.clientY - canvasRect.top;

  const scaleX = canvas.width / canvasRect.width;
  const scaleY = canvas.height / canvasRect.height;

  const hoverX = Math.floor(clickX * scaleX);
  const hoverY = Math.floor(clickY * scaleY);

  hoverTooltip.textContent = `(${hoverX}, ${hoverY})`;
  hoverTooltip.style.display = 'block';

  const posX = event.clientX - wrapperRect.left;
  const posY = event.clientY - wrapperRect.top;

  hoverTooltip.style.left = `${posX}px`;
  hoverTooltip.style.top = `${posY}px`;
});

canvas.addEventListener('mouseleave', () => {
  hoverTooltip.style.display = 'none';
});

// Initial Render
updateLabels();
renderScene();