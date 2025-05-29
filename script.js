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

  ctx.font = bold ${size}px 'Orbitron', sans-serif;
  let textWidth = ctx.measureText(longestLine).width;

  while (textWidth > availableWidth && size > 10) {
    size -= 1;
    ctx.font = bold ${size}px 'Orbitron', sans-serif;
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
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  ctx.font = bold ${particleSize}px 'Orbitron', sans-serif;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  frame++;

  let allAssembled = true;

  for (let p of particles) {
    if (p.phase === 'explode') {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.opacity = Math.min(1, p.opacity + 0.03);
      if (Math.abs(p.vx) < 0.5 && Math.abs(p.vy) < 0.5) {
        p.phase = 'fly';
      }
    }

    if (p.phase === 'fly') {
      if (frame > 200) {
        p.flyRadius = lerp(p.flyRadius, 0, 0.04);
        if (p.flyRadius < 1) {
          p.x = lerp(p.x, p.targetX, 0.12);
          p.y = lerp(p.y, p.targetY, 0.12);
        } else {
          p.flyAngle += p.flySpeed;
          p.x = lerp(p.x, p.targetX + p.flyRadius * Math.cos(p.flyAngle), 0.08);
          p.y = lerp(p.y, p.targetY + p.flyRadius * Math.sin(p.flyAngle), 0.08);
        }
      } else {
        p.flyAngle += p.flySpeed;
        p.x += Math.cos(p.flyAngle) * 1.2;
        p.y += Math.sin(p.flyAngle) * 1.2;
      }

      if (Math.abs(p.x - p.targetX) > 1.5 || Math.abs(p.y - p.targetY) > 1.5 || p.flyRadius > 1) {
        allAssembled = false;
      }
    }

    ctx.globalAlpha = p.opacity;
    drawTextWithEffects(p, p.x, p.y);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  if (animationPhase !== 'done') {
    if (allAssembled && frame > 200) {
      animationPhase = 'done';
      document.getElementById('icons').classList.add('visible');
    }
  }

  requestAnimationFrame(animate);
}

setupCanvas();
animate();
function scrollToAbout() {
  document.getElementById("about").scrollIntoView({ behavior: "smooth" });
}
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  document.querySelectorAll('.parallax-layer').forEach(layer => {
    const depth = parseFloat(layer.getAttribute('data-depth')) || 0;
    const movement = scrollY * depth;
    layer.style.transform = translateY(${movement}px);
  });
});
