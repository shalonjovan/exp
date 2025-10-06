let playerName = '', scoreSubmitted = false;

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  playerName = urlParams.get('player') || 'Player';
  document.getElementById('playerName').textContent = `Player: ${playerName}`;
});

async function submitScore(score) {
  if (scoreSubmitted) return;
  const submittingMsg = document.getElementById('submittingMessage');
  submittingMsg.textContent = 'Submitting score...';
  try {
    const { error } = await supabase.from('leaderboard').insert([{ player_name: playerName, score: score }]);
    if (error) throw error;
    submittingMsg.textContent = '✓ Score submitted!';
    scoreSubmitted = true;
  } catch (error) {
    console.error('Error submitting score:', error);
    submittingMsg.textContent = '✗ Failed to submit score';
  }
}

function restartGame() { scoreSubmitted = false; startGame(); }
function backToMenu() { window.location.href = `../../index.html?score=${score}&mode=classic`; }

const canvas = document.getElementById("game"), ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOverScreen"), finalScoreElem = document.getElementById("finalScore");
const specialButton = document.getElementById("specialButton");
let mouse = { x: 0, y: 0 }, wrecky = { x: 0, y: 0, radius: 70 }, orb = { x: 0, y: 0, radius: 80 };
const enemies = [], particles = [], waves = [];

function resizeCanvas() {
  const oldWidth = canvas.width, oldHeight = canvas.height;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  if (oldWidth > 0 && oldHeight > 0 && typeof orb !== 'undefined') {
    const widthRatio = canvas.width / oldWidth, heightRatio = canvas.height / oldHeight;
    orb.x = canvas.width / 2; orb.y = canvas.height / 2;
    mouse.x *= widthRatio; mouse.y *= heightRatio;
    wrecky.x = mouse.x; wrecky.y = mouse.y;
    enemies.forEach(e => { e.x *= widthRatio; e.y *= heightRatio; });
    waves.forEach(w => { w.x *= widthRatio; w.y *= heightRatio; });
    particles.forEach(p => { p.x *= widthRatio; p.y *= heightRatio; });
  } else {
    mouse.x = canvas.width / 2; mouse.y = canvas.height / 2;
    wrecky.x = canvas.width / 2; wrecky.y = canvas.height / 2;
    orb.x = canvas.width / 2; orb.y = canvas.height / 2;
  }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let orbMaxHP = 100, orbHP = orbMaxHP, score = 0, lastEnemySpawn = performance.now();
let enemySpawnInterval = 800, gameStartTime = 0, enemyBaseSpeed = 1.0;
const scoreElem = document.getElementById("score"), hpElem = document.getElementById("hp"), specialsElem = document.getElementById("specials");
let prevMouse = { x: mouse.x, y: mouse.y }, lastMouseMoveTime = Date.now(), gameRunning = true, specialCount = 3;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function triggerSpecial() {
  if (specialCount > 0) {
    waves.push({ x: mouse.x, y: mouse.y, radius: 10, max: 300 });
    specialCount--; specialsElem.textContent = `Specials: ${specialCount}`;
  }
}

window.addEventListener("mousemove", (e) => { prevMouse = { ...mouse }; mouse.x = e.clientX; mouse.y = e.clientY; lastMouseMoveTime = Date.now(); });
window.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!isMobile) triggerSpecial(); });
window.addEventListener("mousedown", (e) => { if (e.button === 0 && !isMobile) triggerSpecial(); });

let touchStartTime = 0;
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); touchStartTime = Date.now();
  const touch = e.touches[0], rect = canvas.getBoundingClientRect();
  prevMouse = { ...mouse }; mouse.x = touch.clientX - rect.left; mouse.y = touch.clientY - rect.top; lastMouseMoveTime = Date.now();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0], rect = canvas.getBoundingClientRect();
  prevMouse = { ...mouse }; mouse.x = touch.clientX - rect.left; mouse.y = touch.clientY - rect.top; lastMouseMoveTime = Date.now();
}, { passive: false });

specialButton.addEventListener("touchstart", (e) => { e.preventDefault(); triggerSpecial(); });
specialButton.addEventListener("click", (e) => { e.preventDefault(); triggerSpecial(); });

function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function getOrbColor(hp, maxHP) {
  const ratio = hp / maxHP;
  if (ratio > 0.6) {
    const greenToYellowRatio = (ratio - 0.6) / 0.4;
    return `rgb(${Math.floor(255 * (1 - greenToYellowRatio * 0.5))}, 255, 0)`;
  } else if (ratio > 0.3) {
    const yellowToOrangeRatio = (ratio - 0.3) / 0.3;
    return `rgb(255, ${Math.floor(255 * yellowToOrangeRatio)}, 0)`;
  } else {
    const orangeToRedRatio = ratio / 0.3;
    return `rgb(255, ${Math.floor(128 * orangeToRedRatio)}, 0)`;
  }
}

function spawnEnemy() {
  const size = 40; let x, y;
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) { x = Math.random() * canvas.width; y = -size; }
  else if (edge === 1) { x = canvas.width + size; y = Math.random() * canvas.height; }
  else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + size; }
  else { x = -size; y = Math.random() * canvas.height; }
  const colors = ["crimson", "darkorange", "blueviolet", "deeppink", "teal", "navy", "lime"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  enemies.push({ x, y, size, dx: 0, dy: 0, vx: 0, vy: 0, hit: false, color });
}

function createParticles(x, y) {
  for (let i = 0; i < 12; i++) particles.push({ x, y, dx: (Math.random() - 0.5) * 6, dy: (Math.random() - 0.5) * 6, life: 30 });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.dx; p.y += p.dy; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.fillStyle = `rgba(255, 165, 0, ${p.life / 30})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawWaves() {
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i]; w.radius += 10;
    ctx.strokeStyle = `rgba(0, 100, 255, ${1 - w.radius / w.max})`;
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2); ctx.stroke();
    for (const e of enemies) {
      const d = distance(w.x, w.y, e.x, e.y);
      if (d < w.radius + e.size / 2) {
        const angle = Math.atan2(e.y - w.y, e.x - w.x);
        e.vx = Math.cos(angle) * 15; e.vy = Math.sin(angle) * 15; e.hit = true; createParticles(e.x, e.y);
      }
    }
    if (w.radius > w.max) waves.splice(i, 1);
  }
}

function resetGame() {
  enemies.length = 0; particles.length = 0; waves.length = 0;
  score = 0; orbHP = orbMaxHP; specialCount = 3;
  orb.x = canvas.width / 2; orb.y = canvas.height / 2;
  mouse.x = canvas.width / 2; mouse.y = canvas.height / 2;
  wrecky.x = canvas.width / 2; wrecky.y = canvas.height / 2;
  scoreElem.textContent = `Score: ${score}`; hpElem.textContent = `Orb HP: ${orbHP}`; specialsElem.textContent = `Specials: ${specialCount}`;
  enemySpawnInterval = 800; gameStartTime = performance.now(); enemyBaseSpeed = 1.0; lastEnemySpawn = performance.now();
  gameRunning = true; gameOverScreen.style.display = "none"; document.getElementById('submittingMessage').textContent = '';
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  wrecky.x = mouse.x; wrecky.y = mouse.y;
  ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2); ctx.fillStyle = getOrbColor(orbHP, orbMaxHP); ctx.fill();
  ctx.beginPath(); ctx.arc(wrecky.x, wrecky.y, wrecky.radius, 0, Math.PI * 2); ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; ctx.lineWidth = 4; ctx.stroke();
  const cursorSpeed = distance(mouse.x, mouse.y, prevMouse.x, prevMouse.y);
  const now = Date.now(), isIdle = (now - lastMouseMoveTime) > 2500;
  if (timestamp - lastEnemySpawn > enemySpawnInterval) {
    spawnEnemy(); lastEnemySpawn = timestamp;
    const gameTime = (timestamp - gameStartTime) / 1000, targetTime = 105;
    const progressRatio = Math.min(gameTime / targetTime, 1);
    enemySpawnInterval = Math.max(800 - (725 * progressRatio), 75); enemyBaseSpeed += 0.0025;
  }
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.hit) {
      const angle = Math.atan2(orb.y - e.y, orb.x - e.x);
      e.vx = Math.cos(angle) * enemyBaseSpeed; e.vy = Math.sin(angle) * enemyBaseSpeed;
    }
    e.x += e.vx; e.y += e.vy;
    if (!isIdle && distance(e.x, e.y, wrecky.x, wrecky.y) < wrecky.radius + e.size / 2) {
      const angle = Math.atan2(e.y - wrecky.y, e.x - wrecky.x);
      const knockStrength = Math.min(cursorSpeed * 0.8, canvas.width * 0.25 / 10);
      e.vx = Math.cos(angle) * knockStrength; e.vy = Math.sin(angle) * knockStrength; e.hit = true; createParticles(e.x, e.y);
    }
    if (distance(e.x, e.y, orb.x, orb.y) < orb.radius + e.size / 2) {
      orbHP -= 1; hpElem.textContent = `Orb HP: ${orbHP}`; enemies.splice(i, 1);
      if (orbHP <= 0) {
        finalScoreElem.textContent = `Your Score: ${score}`; gameOverScreen.style.display = "flex"; gameRunning = false; submitScore(score);
      }
      continue;
    }
    if (e.x < -e.size || e.x > canvas.width + e.size || e.y < -e.size || e.y > canvas.height + e.size) {
      const speed = Math.hypot(e.vx, e.vy);
      if (speed > 5) {
        enemies.splice(i, 1); score++; if (score % 100 === 0) specialCount++;
        scoreElem.textContent = `Score: ${score}`; specialsElem.textContent = `Specials: ${specialCount}`; continue;
      } else {
        if (e.x < -e.size) e.x = canvas.width + e.size;
        else if (e.x > canvas.width + e.size) e.x = -e.size;
        else if (e.y < -e.size) e.y = canvas.height + e.size;
        else if (e.y > canvas.height + e.size) e.y = -e.size;
        e.hit = false; e.vx = 0; e.vy = 0;
      }
    }
    ctx.beginPath(); ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2); ctx.fillStyle = e.color; ctx.fill();
  }
  updateParticles(); drawParticles(); drawWaves();
  requestAnimationFrame(gameLoop);
}

function startGame() { resetGame(); requestAnimationFrame(gameLoop); }
startGame();