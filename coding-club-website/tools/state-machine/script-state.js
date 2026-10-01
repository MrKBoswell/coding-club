const canvas = document.getElementById('stateCanvas');
const ctx = canvas.getContext('2d');

const stateBanner = document.getElementById('stateBanner');
const currentStateText = document.getElementById('currentStateText');
const flagGrounded = document.getElementById('flagGrounded');
const flagVelY = document.getElementById('flagVelY');
const flagAttack = document.getElementById('flagAttack');
const transitionRules = document.getElementById('transitionRules');
const pythonCode = document.getElementById('pythonCode');

const nodes = {
  IDLE:   { x: 120, y: 190, label: 'IDLE', color: '#38bdf8' },
  WALK:   { x: 300, y: 100, label: 'WALK', color: '#22c55e' },
  JUMP:   { x: 480, y: 190, label: 'JUMP', color: '#eab308' },
  ATTACK: { x: 300, y: 280, label: 'ATTACK', color: '#a855f7' },
  HURT:   { x: 300, y: 190, label: 'HURT', color: '#ef4444' }
};

const transitions = [
  { from: 'IDLE', to: 'WALK', trigger: '← / →' },
  { from: 'WALK', to: 'IDLE', trigger: 'Release' },
  { from: 'IDLE', to: 'JUMP', trigger: 'Space' },
  { from: 'WALK', to: 'JUMP', trigger: 'Space' },
  { from: 'JUMP', to: 'IDLE', trigger: 'Land' },
  { from: 'IDLE', to: 'ATTACK', trigger: 'Z' },
  { from: 'WALK', to: 'ATTACK', trigger: 'Z' },
  { from: 'ATTACK', to: 'IDLE', trigger: 'Timer' },
  { from: 'IDLE', to: 'HURT', trigger: 'H' },
  { from: 'WALK', to: 'HURT', trigger: 'H' },
  { from: 'JUMP', to: 'HURT', trigger: 'H' },
  { from: 'HURT', to: 'IDLE', trigger: 'Timer' }
];

let currentState = 'IDLE';
let isGrounded = true;
let velocityY = 0;
let canAttack = true;
let stateTimer = null;

function setState(newState) {
  if (currentState === newState) return;
  currentState = newState;

  if (newState === 'JUMP') {
    isGrounded = false;
    velocityY = -12;
    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      isGrounded = true;
      velocityY = 0;
      if (currentState === 'JUMP') setState('IDLE');
    }, 1200);
  } else if (newState === 'ATTACK') {
    canAttack = false;
    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      canAttack = true;
      if (currentState === 'ATTACK') setState('IDLE');
    }, 600);
  } else if (newState === 'HURT') {
    clearTimeout(stateTimer);
    stateTimer = setTimeout(() => {
      if (currentState === 'HURT') setState('IDLE');
    }, 800);
  } else {
    isGrounded = true;
    velocityY = 0;
  }

  updateUI();
  render();
}

function updateUI() {
  currentStateText.textContent = `State: ${currentState}`;
  stateBanner.style.borderColor = nodes[currentState].color;
  stateBanner.style.color = nodes[currentState].color;

  flagGrounded.textContent = isGrounded ? 'True' : 'False';
  flagGrounded.className = `flag-val ${isGrounded ? 'true' : ''}`;
  flagVelY.textContent = velocityY;
  flagAttack.textContent = canAttack ? 'True' : 'False';
  flagAttack.className = `flag-val ${canAttack ? 'true' : ''}`;

  transitionRules.innerHTML = '';
  const activeRules = transitions.filter(t => t.from === currentState);
  activeRules.forEach(r => {
    const div = document.createElement('div');
    div.className = 'rule-item';
    div.innerHTML = `If <strong>${r.trigger}</strong> &rarr; Switch to <strong>${r.to}</strong>`;
    transitionRules.appendChild(div);
  });

  pythonCode.textContent = `# Active State Logic
if state == "${currentState}":
    update_${currentState.toLowerCase()}_animation()
${activeRules.map(r => `    if event_${r.trigger.toLowerCase().replace(/[^a-z]/g, '')}: state = "${r.to}"`).join('\n')}`;
}

function drawConnections() {
  transitions.forEach(t => {
    const start = nodes[t.from];
    const end = nodes[t.to];
    const isCurrentTransition = (t.from === currentState);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = isCurrentTransition ? 'rgba(56, 189, 248, 0.6)' : '#27272a';
    ctx.lineWidth = isCurrentTransition ? 2 : 1;
    ctx.stroke();
  });
}

function drawNodes() {
  Object.keys(nodes).forEach(key => {
    const node = nodes[key];
    const isActive = (key === currentState);

    ctx.beginPath();
    ctx.arc(node.x, node.y, 32, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? node.color : '#18181b';
    ctx.fill();
    ctx.strokeStyle = node.color;
    ctx.lineWidth = isActive ? 4 : 2;
    ctx.stroke();

    ctx.fillStyle = isActive ? '#09090b' : '#f4f4f5';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  drawNodes();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setState('WALK');
  if (e.key === ' ') setState('JUMP');
  if (e.key.toLowerCase() === 'z') setState('ATTACK');
  if (e.key.toLowerCase() === 'h') setState('HURT');
});

window.addEventListener('keyup', (e) => {
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && currentState === 'WALK') {
    setState('IDLE');
  }
});

document.getElementById('triggerLeft').addEventListener('click', () => setState('WALK'));
document.getElementById('triggerRight').addEventListener('click', () => setState('WALK'));
document.getElementById('triggerJump').addEventListener('click', () => setState('JUMP'));
document.getElementById('triggerAttack').addEventListener('click', () => setState('ATTACK'));
document.getElementById('triggerHurt').addEventListener('click', () => setState('HURT'));

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  Object.keys(nodes).forEach(key => {
    const node = nodes[key];
    const dist = Math.hypot(clickX - node.x, clickY - node.y);
    if (dist <= 32) setState(key);
  });
});

updateUI();
render();