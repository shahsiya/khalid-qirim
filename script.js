const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W, H;
let particleSize;
let dpr = window.devicePixelRatio || 1;

const lines = [
  "Добро пожаловать! ",
  "Я занимаюсь",
  "Frontend-разработкой",
  "Firebase,WordPress",
  "Tilda,Node.js",
  "JavaScript",
  "парсинг,автоматизация."
];

let particles = [];
let frame = 0;
let animationPhase = 'explode';
let assembledPositions = [];

function centerX() { return W / 2; }
function centerY() { return H / 2; }

function getMaxFittingParticleSize() {
  const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b));
  const padding = 40;
  const availableWidth = W - padding;
  let size = W < 480 ? 17 : W < 768 ? 25 : 32;

  ctx.font = `bold ${size}px 'Orbitron', sans-serif`;
  let textWidth = ctx.measureText(longestLine).width;

  while (textWidth > availableWidth && size > 10) {
    size -= 1;
    ctx.font = `bold ${size}px 'Orbitron', sans-serif`;
    textWidth = ctx.measureText(longestLine).width;
  }

  return size;
}

function setupCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;

  particleSize = getMaxFittingParticleSize();

  prepareAssembledPositions();
  createParticles();
}

window.addEventListener('resize', setupCanvas);

function prepareAssembledPositions() {
  assembledPositions.length = 0;
  const totalHeight = lines.length * particleSize * 1.8;
  const startY = centerY() - totalHeight / 2;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLength = line.length;
    const startX = centerX() - (lineLength * particleSize) / 2;
    for (let j = 0; j < lineLength; j++) {
      assembledPositions.push({
        x: startX + j * particleSize,
        y: startY + i * particleSize * 1.8,
        char: line[j]
      });
    }
  }
}

function createParticles() {
  particles.length = 0;
  for (let pos of assembledPositions) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 2;
    particles.push({
      x: centerX(),
      y: centerY(),
      char: pos.char,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      targetX: pos.x,
      targetY: pos.y,
      phase: 'explode',
      flyRadius: 100 + Math.random() * 100,
      flyAngle: Math.random() * Math.PI * 2,
      flySpeed: 0.01 + Math.random() * 0.015,
      opacity: 0
    });
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawTextWithEffects(p, x, y) {
  ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFD700';
  ctx.strokeText(p.char, x, y);
  ctx.fillStyle = '#000000';
  ctx.fillText(p.char, x, y);
  ctx.shadowBlur = 0;
}

function updateParticles() {
  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `bold ${particleSize}px 'Orbitron', sans-serif`;

  let done = true;

  for (let p of particles) {
    if (animationPhase === 'explode') {
      p.x += p.vx;
      p.y += p.vy;
      p.opacity += 0.02;
      if (p.opacity > 1) p.opacity = 1;

      p.flyAngle += p.flySpeed;
      p.x += Math.cos(p.flyAngle) * 0.5;
      p.y += Math.sin(p.flyAngle) * 0.5;

      // Через 60 кадров переключаемся в собранное состояние
      if (frame > 60) {
        animationPhase = 'assemble';
      }
      done = false;
    } else if (animationPhase === 'assemble') {
      p.x = lerp(p.x, p.targetX, 0.1);
      p.y = lerp(p.y, p.targetY, 0.1);
      p.opacity = lerp(p.opacity, 1, 0.1);
      if (Math.abs(p.x - p.targetX) > 1 || Math.abs(p.y - p.targetY) > 1) {
        done = false;
      }
    }

    ctx.globalAlpha = p.opacity;
    drawTextWithEffects(p, p.x, p.y);
    ctx.globalAlpha = 1;
  }

  if (!done) {
  frame++;
  requestAnimationFrame(updateParticles);
} else if (animationPhase !== 'done' && frame > 200) {
  animationPhase = 'done';
  showIcons();
}


setupCanvas();
updateParticles();

// Параллакс при движении мыши
document.getElementById('animation-container').addEventListener('mousemove', e => {
  const layers = document.querySelectorAll('.parallax-layer');
  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;

  layers.forEach(layer => {
    const depth = parseFloat(layer.dataset.depth);
    const movementX = x * depth * 30;
    const movementY = y * depth * 30;
    layer.style.transform = `translate3d(${movementX}px, ${movementY}px, 0)`;
  });
});
function showIcons() {
  const icons = document.getElementById("icons");
  if (icons) {
    icons.classList.add("visible");
  }
}
