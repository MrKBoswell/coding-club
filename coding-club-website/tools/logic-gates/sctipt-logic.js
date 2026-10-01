const canvas = document.getElementById('circuitCanvas');
const ctx = canvas.getContext('2d');

const switchKey = document.getElementById('switchKey');
const switchDoor = document.getElementById('switchDoor');
const switchLocked = document.getElementById('switchLocked');

const doorStatusBanner = document.getElementById('doorStatusBanner');
const doorStatusText = document.getElementById('doorStatusText');
const expressionText = document.getElementById('expressionText');
const pythonCode = document.getElementById('pythonCode');
const modeButtons = document.querySelectorAll('.mode-btn');

let logicMode = 'STANDARD';

function evaluateCircuit() {
  const A = switchKey.checked;
  const B = switchDoor.checked;
  const C = switchLocked.checked;

  let isUnlocked = false;

  if (logicMode === 'STANDARD') {
    isUnlocked = (A && B) && (!C);
    expressionText.textContent = `(${A} AND ${B}) AND NOT(${C})`;
  } else {
    isUnlocked = (A || B) && (!C);
    expressionText.textContent = `(${A} OR ${B}) AND NOT(${C})`;
  }

  if (isUnlocked) {
    doorStatusBanner.className = 'status-banner unlocked';
    doorStatusText.textContent = 'Chest Unlocked (True)';
  } else {
    doorStatusBanner.className = 'status-banner locked';
    doorStatusText.textContent = 'Chest Locked (False)';
  }

  if (logicMode === 'STANDARD') {
    pythonCode.textContent = `# Standard Logic\nif has_key and near_door and not is_locked:\n    open_chest()\nelse:\n    keep_locked()`;
  } else {
    pythonCode.textContent = `# Admin Override Logic\nif (has_key or near_door) and not is_locked:\n    open_chest()\nelse:\n    keep_locked()`;
  }

  renderCircuit(A, B, C, isUnlocked);
}

function renderCircuit(A, B, C, output) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawNode(80, 80, `Key (A): ${A}`, A);
  drawNode(80, 190, `Door (B): ${B}`, B);
  drawNode(80, 300, `Locked (C): ${C}`, C);

  const gate1Val = logicMode === 'STANDARD' ? (A && B) : (A || B);
  drawGate(280, 135, logicMode === 'STANDARD' ? 'AND' : 'OR', gate1Val);

  drawWire(120, 80, 280, 115, A);
  drawWire(120, 190, 280, 155, B);

  const notCVal = !C;
  drawGate(280, 300, 'NOT', notCVal);
  drawWire(120, 300, 280, 300, C);

  drawGate(460, 215, 'AND', output);
  drawWire(340, 135, 460, 195, gate1Val);
  drawWire(340, 300, 460, 235, notCVal);

  drawWire(520, 215, 560, 215, output);
  drawChestOutput(560, 215, output);
}

function drawNode(x, y, label, active) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fillStyle = active ? '#22c55e' : '#27272a';
  ctx.fill();
  ctx.strokeStyle = active ? '#4ade80' : '#52525b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f4f4f5';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(label, x - 24, y + 4);
}

function drawWire(x1, y1, x2, y2, active) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = active ? '#22c55e' : '#27272a';
  ctx.lineWidth = active ? 3 : 2;
  ctx.stroke();
}

function drawGate(x, y, label, active) {
  ctx.fillStyle = '#18181b';
  ctx.strokeStyle = active ? '#22c55e' : '#3f3f46';
  ctx.lineWidth = 2;
  ctx.fillRect(x, y - 25, 60, 50);
  ctx.strokeRect(x, y - 25, 60, 50);

  ctx.fillStyle = active ? '#4ade80' : '#a1a1aa';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + 30, y + 4);
}

function drawChestOutput(x, y, open) {
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? '🔓' : '🔒', x, y + 8);
}

switchKey.addEventListener('change', evaluateCircuit);
switchDoor.addEventListener('change', evaluateCircuit);
switchLocked.addEventListener('change', evaluateCircuit);

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    logicMode = btn.dataset.mode;
    evaluateCircuit();
  });
});

evaluateCircuit();