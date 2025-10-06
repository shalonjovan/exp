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
    const { error } = await supabase.from('leaderboard_time').insert([{ player_name: playerName, score: score }]);
    if (error) throw error;
    submittingMsg.textContent = '✓ Score submitted!';
    scoreSubmitted = true;
  } catch (error) {
    console.error('Error submitting score:', error);
    submittingMsg.textContent = '✗ Failed to submit score';
  }
}

function restartGame() { scoreSubmitted = false; startGame(); }
function backToMenu() { window.location.href = `../../index.html?score=${survivalTime.toFixed(1)}&mode=time`; }

const canvas = document.getElementById("game"), ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOverScreen"), finalScoreElem = document.getElementById("finalScore");
const specialButton = document.getElementById("specialButton");
let mouse = { x: 0, y: 0 }, wrecky = { x: 0, y: 0, radius: 70 }, orb = { x: 0, y: 0, radius: 500 };
const balls = [], particles = [], slowWaves = [];

function resizeCanvas() {
  const oldWidth = canvas.width, oldHeight = canvas.height;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  if (oldWidth > 0 && oldHeight > 0) {
    const widthRatio = canvas.width / oldWidth, heightRatio = canvas.height / oldHeight;
    orb.x = 100; orb.y = canvas.height / 2;
    mouse.x = Math.min(mouse.x * widthRatio, canvas.width / 2);
    mouse.y *= heightRatio;
    wrecky.x = mouse.x; wrecky.y = mouse.y;
    balls.forEach(b => { b.x *= widthRatio; b.y *= heightRatio; });
    slowWaves.forEach(w => { w.x *= widthRatio; w.y *= heightRatio; });
    particles.forEach(p => { p.x *= widthRatio; p.y *= heightRatio; });
  } else {
    orb.x = 100; orb.y = canvas.height / 2;
    mouse.x = canvas.width / 4; mouse.y = canvas.height / 2;
    wrecky.x = mouse.x; wrecky.y = mouse.y;
  }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let orbMaxHP = 100, orbHP = orbMaxHP, survivalTime = 0, lastBallSpawn = performance.now();
let ballSpawnInterval = 1200, gameStartTime = 0, ballSpeed = 12;
const scoreElem = document.getElementById("score"), hpElem = document.getElementById("hp"), specialsElem = document.getElementById("specials");
let prevMouse = { x: mouse.x, y: mouse.y }, lastMouseMoveTime = Date.now(), gameRunning = true, specialCount = 3;
let slowMoActive = false, slowMoEndTime = 0;
let lastSpecialRegen = 0;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

function triggerSpecial() {
  if (specialCount > 0 && !slowMoActive) {
    slowWaves.push({ x: mouse.x, y: mouse.y, radius: 10, max: 400 });
    slowMoActive = true;
    slowMoEndTime = performance.now() + 3000;
    specialCount--;
    specialsElem.textContent = `Slow-Mo: ${specialCount}`;
  }
}

window.addEventListener("mousemove", (e) => {
  prevMouse = { ...mouse };
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  lastMouseMoveTime = Date.now();
});

window.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!isMobile) triggerSpecial(); });
window.addEventListener("mousedown", (e) => { if (e.button === 0 && !isMobile) triggerSpecial(); });

let touchStartTime = 0;
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault(); touchStartTime = Date.now();
  const touch = e.touches[0], rect = canvas.getBoundingClientRect();
  prevMouse = { ...mouse };
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
  lastMouseMoveTime = Date.now();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0], rect = canvas.getBoundingClientRect();
  prevMouse = { ...mouse };
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
  lastMouseMoveTime = Date.now();
}, { passive: false });

specialButton.addEventListener("touchstart", (e) => { e.preventDefault(); triggerSpecial(); });
specialButton.addEventListener("click", (e) => { e.preventDefault(); triggerSpecial(); });

function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function getOrbColor(hp, maxHP) {
  const ratio = hp / maxHP;
  if (ratio > 0.6) return `rgb(${Math.floor(255 * (1 - (ratio - 0.6) / 0.4 * 0.5))}, 255, 0)`;
  else if (ratio > 0.3) return `rgb(255, ${Math.floor(255 * (ratio - 0.3) / 0.3)}, 0)`;
  else return `rgb(255, ${Math.floor(128 * ratio / 0.3)}, 0)`;
}

function spawnBall() {
  const size = 50;
  const y = Math.random() * canvas.height;
  const colors = ["crimson", "darkorange", "blueviolet", "deeppink", "teal", "navy", "lime"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  balls.push({ x: canvas.width + size, y, size, vx: -ballSpeed, vy: 0, hit: false, color });
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

function drawSlowWaves() {
  for (let i = slowWaves.length - 1; i >= 0; i--) {
    const w = slowWaves[i]; w.radius += 15;
    ctx.strokeStyle = `rgba(100, 200, 255, ${1 - w.radius / w.max})`;
    ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2); ctx.stroke();
    if (w.radius > w.max) slowWaves.splice(i, 1);
  }
}

function resetGame() {
  balls.length = 0; particles.length = 0; slowWaves.length = 0;
  survivalTime = 0; orbHP = orbMaxHP; specialCount = 3;
  orb.x = 100; orb.y = canvas.height / 2;
  mouse.x = canvas.width / 4; mouse.y = canvas.height / 2;
  wrecky.x = mouse.x; wrecky.y = mouse.y;
  scoreElem.textContent = `Time: 0.0s`; hpElem.textContent = `Orb HP: ${orbHP}`; specialsElem.textContent = `Slow-Mo: ${specialCount}`;
  ballSpawnInterval = 1200; gameStartTime = performance.now(); ballSpeed = 12; lastBallSpawn = performance.now();
  gameRunning = true; slowMoActive = false; slowMoEndTime = 0;lastSpecialRegen = 0;
  gameOverScreen.style.display = "none"; document.getElementById('submittingMessage').textContent = '';
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  survivalTime = (timestamp - gameStartTime) / 1000;
  if (survivalTime - lastSpecialRegen >= 60 && specialCount < 10) {
  specialCount++;
  lastSpecialRegen = survivalTime;
  specialsElem.textContent = `Slow-Mo: ${specialCount}`;
}
  scoreElem.textContent = `Time: ${survivalTime.toFixed(1)}s`;
  
  if (slowMoActive && timestamp > slowMoEndTime) slowMoActive = false;
  
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
  ctx.restore();
  
  wrecky.x = mouse.x; wrecky.y = mouse.y;
  ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2); ctx.fillStyle = getOrbColor(orbHP, orbMaxHP); ctx.fill();
  ctx.beginPath(); ctx.arc(wrecky.x, wrecky.y, wrecky.radius, 0, Math.PI * 2); ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; ctx.lineWidth = 4; ctx.stroke();
  
  const cursorSpeed = distance(mouse.x, mouse.y, prevMouse.x, prevMouse.y);
  const now = Date.now(), isIdle = (now - lastMouseMoveTime) > 2500;
  
  if (timestamp - lastBallSpawn > ballSpawnInterval) {
    spawnBall(); lastBallSpawn = timestamp;
    const progressRatio = Math.min(survivalTime / 60, 1);
    ballSpawnInterval = Math.max(1200 - (1000 * progressRatio), 200);
    ballSpeed = 12 + (4 * progressRatio);
  }
  
  const speedMultiplier = slowMoActive ? 0.3 : 1.0;
  
  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    if (!b.hit) b.vx = -ballSpeed * speedMultiplier;
    b.x += b.vx; b.y += b.vy;
    
    if (!isIdle && distance(b.x, b.y, wrecky.x, wrecky.y) < wrecky.radius + b.size / 2) {
      const angle = Math.atan2(b.y - wrecky.y, b.x - wrecky.x);
      const knockStrength = Math.min(cursorSpeed * 0.8, 20);
      b.vx = Math.cos(angle) * knockStrength; b.vy = Math.sin(angle) * knockStrength; b.hit = true; createParticles(b.x, b.y);
    }
    
    if (distance(b.x, b.y, orb.x, orb.y) < orb.radius + b.size / 2) {
      orbHP -= 1; hpElem.textContent = `Orb HP: ${orbHP}`; balls.splice(i, 1);
      if (orbHP <= 0) {
        finalScoreElem.textContent = `Survived: ${survivalTime.toFixed(1)}s`;
        gameOverScreen.style.display = "flex"; gameRunning = false;
        submitScore(parseFloat(survivalTime.toFixed(1)));
      }
      continue;
    }
    
    if (b.x < -b.size || b.x > canvas.width + b.size || b.y < -b.size || b.y > canvas.height + b.size) {
      balls.splice(i, 1); continue;
    }
    
    ctx.beginPath(); ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2); ctx.fillStyle = b.color; ctx.fill();
  }
  
  updateParticles(); drawParticles(); drawSlowWaves();
  
  if (slowMoActive) {
    ctx.fillStyle = "rgba(100, 200, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  requestAnimationFrame(gameLoop);
}

function startGame() { resetGame(); requestAnimationFrame(gameLoop); }
startGame();