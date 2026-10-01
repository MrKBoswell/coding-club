// Canvas Setup
const canvas = document.getElementById('collisionCanvas');
const ctx = canvas.getContext('2d');

// Control References
const rectAWidthInput = document.getElementById('rectAWidth');
const rectAHeightInput = document.getElementById('rectAHeight');
const rectBWidthInput = document.getElementById('rectBWidth');
const rectBHeightInput = document.getElementById('rectBHeight');

const resetPosBtn = document.getElementById('resetPosBtn');
const toggleAnimBtn = document.getElementById('toggleAnimBtn');

const collisionBanner = document.getElementById('collisionBanner');
const statusText = document.getElementById('statusText');
const pythonCode = document.getElementById('pythonCode');

// Condition Elements
const cond1El = document.getElementById('cond1');
const cond2El = document.getElementById('cond2');
const cond3El = document.getElementById('cond3');
const cond4El = document.getElementById('cond4');

const val1El = document.getElementById('val1');
const val2El = document.getElementById('val2');
const val3El = document.getElementById('val3');
const val4El = document.getElementById('val4');

// State Objects
const rectA = {
  x: 80,
  y: 150,
  w: 100,
  h: 100,
  color: '#38bdf8', // Cyan/Blue
  vx: 2.5,
  vy: 1.8
};

const rectB = {
  x: 350,
  y: 120,
  w: 100,
  h: 100,
  color: '#a855f7', // Purple
  vx: -2,
  vy: 2.2
};

let isDragging = false;
let draggedRect = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isAnimating = false;
let animFrameId = null;

// Draw Grid Background
function drawGrid() {
  const gridSize = 20;
  ctx.strokeStyle = '#1e1e24';
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Compute AABB Collision & Inequalities
function evaluateCollision() {
  const c1 = rectA.x < rectB.x + rectB.w;
  const c2 = rectA.x + rectA.w > rectB.x;
  const c3 = rectA.y < rectB.y + rectB.h;
  const c4 = rectA.y + rectA.h > rectB.y;

  const isColliding = c1 && c2 && c3 && c4;

  // Update Math Breakdown UI
  updateCondUI(cond1El, val1El, c1, `${Math.round(rectA.x)} < ${Math.round(rectB.x + rectB.w)}`);
  updateCondUI(cond2El, val2El, c2, `${Math.round(rectA.x + rectA.w)} > ${Math.round(rectB.x)}`);
  updateCondUI(cond3El, val3El, c3, `${Math.round(rectA.y)} < ${Math.round(rectB.y + rectB.h)}`);
  updateCondUI(cond4El, val4El, c4, `${Math.round(rectA.y + rectA.h)} > ${Math.round(rectB.y)}`);

  // Update Status Banner
  if (isColliding) {
    collisionBanner.className = 'status-banner is-colliding';
    statusText.textContent = 'COLLISION DETECTED (True)';
  } else {
    collisionBanner.className = 'status-banner no-collision';
    statusText.textContent = 'No Collision (False)';
  }

  // Update Pygame Code Preview
  pythonCode.textContent = `# Pygame rect instances
rect1 = pygame.Rect(${Math.round(rectA.x)}, ${Math.round(rectA.y)}, ${rectA.w}, ${rectA.h})
rect2 = pygame.Rect(${Math.round(rectB.x)}, ${Math.round(rectB.y)}, ${rectB.w}, ${rectB.h})

# Collision Evaluation
is_colliding = rect1.colliderect(rect2)  # ${isColliding ? 'True' : 'False'}`;

  return { isColliding, c1, c2, c3, c4 };
}

function updateCondUI(itemEl, valEl, passed, expr) {
  itemEl.className = `cond-item ${passed ? 'pass' : 'fail'}`;
  valEl.textContent = `${expr} (${passed ? '✔' : '✘'})`;
}

// Calculate Overlap Area
function getIntersectionRect() {
  const x1 = Math.max(rectA.x, rectB.x);
  const y1 = Math.max(rectA.y, rectB.y);
  const x2 = Math.min(rectA.x + rectA.w, rectB.x + rectB.w);
  const y2 = Math.min(rectA.y + rectA.h, rectB.y + rectB.h);

  if (x2 > x1 && y2 > y1) {
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  return null;
}

// Main Render Loop
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  const { isColliding } = evaluateCollision();

  // Draw Rect A
  ctx.fillStyle = isColliding ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.15)';
  ctx.strokeStyle = rectA.color;
  ctx.lineWidth = 2;
  ctx.fillRect(rectA.x, rectA.y, rectA.w, rectA.h);
  ctx.strokeRect(rectA.x, rectA.y, rectA.w, rectA.h);

  // Draw Rect B
  ctx.fillStyle = isColliding ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.15)';
  ctx.strokeStyle = rectB.color;
  ctx.lineWidth = 2;
  ctx.fillRect(rectB.x, rectB.y, rectB.w, rectB.h);
  ctx.strokeRect(rectB.x, rectB.y, rectB.w, rectB.h);

  // Highlight Intersection Box if Colliding
  const overlap = getIntersectionRect();
  if (overlap) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.fillRect(overlap.x, overlap.y, overlap.w, overlap.h);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(overlap.x, overlap.y, overlap.w, overlap.h);
  }

  // Draw Coordinates Text Labels
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px monospace';
  ctx.fillText(`A (${Math.round(rectA.x)}, ${Math.round(rectA.y)})`, rectA.x + 6, rectA.y + 16);
  ctx.fillText(`B (${Math.round(rectB.x)}, ${Math.round(rectB.y)})`, rectB.x + 6, rectB.y + 16);
}

// Animation Step
function animate() {
  if (!isAnimating) return;

  // Move Rect A & Bounce
  rectA.x += rectA.vx;
  rectA.y += rectA.vy;

  if (rectA.x <= 0 || rectA.x + rectA.w >= canvas.width) rectA.vx *= -1;
  if (rectA.y <= 0 || rectA.y + rectA.h >= canvas.height) rectA.vy *= -1;

  // Move Rect B & Bounce
  rectB.x += rectB.vx;
  rectB.y += rectB.vy;

  if (rectB.x <= 0 || rectB.x + rectB.w >= canvas.width) rectB.vx *= -1;
  if (rectB.y <= 0 || rectB.y + rectB.h >= canvas.height) rectB.vy *= -1;

  render();
  animFrameId = requestAnimationFrame(animate);
}

// Mouse/Touch Drag Logic
function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function isPointInRect(pt, r) {
  return pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
}

function handlePointerDown(e) {
  const pt = getCanvasCoords(e);

  if (isPointInRect(pt, rectA)) {
    isDragging = true;
    draggedRect = rectA;
    dragOffsetX = pt.x - rectA.x;
    dragOffsetY = pt.y - rectA.y;
  } else if (isPointInRect(pt, rectB)) {
    isDragging = true;
    draggedRect = rectB;
    dragOffsetX = pt.x - rectB.x;
    dragOffsetY = pt.y - rectB.y;
  }
}

function handlePointerMove(e) {
  if (!isDragging || !draggedRect) return;
  const pt = getCanvasCoords(e);

  draggedRect.x = Math.max(0, Math.min(canvas.width - draggedRect.w, pt.x - dragOffsetX));
  draggedRect.y = Math.max(0, Math.min(canvas.height - draggedRect.h, pt.y - dragOffsetY));

  render();
}

function handlePointerUp() {
  isDragging = false;
  draggedRect = null;
}

// Event Listeners for Dragging
canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
window.addEventListener('touchend', handlePointerUp);

// Dimension Inputs Listeners
rectAWidthInput.addEventListener('input', (e) => {
  rectA.w = parseInt(e.target.value, 10) || 20;
  render();
});
rectAHeightInput.addEventListener('input', (e) => {
  rectA.h = parseInt(e.target.value, 10) || 20;
  render();
});
rectBWidthInput.addEventListener('input', (e) => {
  rectB.w = parseInt(e.target.value, 10) || 20;
  render();
});
rectBHeightInput.addEventListener('input', (e) => {
  rectB.h = parseInt(e.target.value, 10) || 20;
  render();
});

// Action Buttons
resetPosBtn.addEventListener('click', () => {
  rectA.x = 80;
  rectA.y = 150;
  rectB.x = 350;
  rectB.y = 120;
  render();
});

toggleAnimBtn.addEventListener('click', () => {
  isAnimating = !isAnimating;
  if (isAnimating) {
    toggleAnimBtn.textContent = 'Pause Animation';
    toggleAnimBtn.classList.add('active');
    animate();
  } else {
    toggleAnimBtn.textContent = 'Start Bounce Animation';
    toggleAnimBtn.classList.remove('active');
    cancelAnimationFrame(animFrameId);
  }
});

// Initial Render
render();