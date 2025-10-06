let lastScore = null, currentMode = 'classic';

window.addEventListener('DOMContentLoaded', () => {
  const savedName = localStorage.getItem('playerName');
  if (savedName) document.getElementById('playerNameInput').value = savedName;
  const urlParams = new URLSearchParams(window.location.search);
  lastScore = urlParams.get('score');
  const mode = urlParams.get('mode') || 'classic';
  currentMode = mode;
  if (lastScore) {
    document.getElementById('lastScoreSection').style.display = 'block';
    document.getElementById('lastScoreValue').textContent = mode === 'time' ? `${lastScore}s` : lastScore;
  }
  switchLeaderboard(mode);
});

async function loadLeaderboard(mode) {
  try {
    const table = mode === 'classic' ? 'leaderboard' : 'leaderboard_time';
    const { data, error } = await supabase.from(table).select('player_name, score, created_at').order('score', { ascending: false }).limit(10);
    if (error) throw error;
    const content = document.getElementById('leaderboardContent');
    if (data.length === 0) {
      content.innerHTML = '<p style="text-align: center; color: #666; font-size: 14px;">No scores yet</p>';
      return;
    }
    const list = document.createElement('ul');
    list.className = 'leaderboard-list';
    data.forEach((entry, index) => {
      const item = document.createElement('li');
      item.className = 'leaderboard-item';
      if (index === 0) item.classList.add('top-1');
      else if (index === 1) item.classList.add('top-2');
      else if (index === 2) item.classList.add('top-3');
      const rank = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
      const scoreDisplay = mode === 'time' ? `${entry.score}s` : entry.score;
      item.innerHTML = `<span class="rank">${rank}</span><span class="player-name">${escapeHtml(entry.player_name)}</span><span class="score">${scoreDisplay}</span>`;
      list.appendChild(item);
    });
    content.innerHTML = '';
    content.appendChild(list);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    document.getElementById('leaderboardContent').innerHTML = '<p style="text-align: center; color: #c00; font-size: 14px;">Failed to load</p>';
  }
}

function switchLeaderboard(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event?.target?.classList.add('active') || document.querySelector(`.tab-btn:${mode === 'classic' ? 'first' : 'last'}-child`).classList.add('active');
  loadLeaderboard(mode);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function startGame(mode) {
  const nameInput = document.getElementById('playerNameInput');
  const playerName = nameInput.value.trim();
  if (!playerName) { showError('Please enter your name'); nameInput.focus(); return; }
  if (playerName.length < 2) { showError('Name must be at least 2 characters'); nameInput.focus(); return; }
  localStorage.setItem('playerName', playerName);
  window.location.href = `modes/${mode}/game.html?player=${encodeURIComponent(playerName)}`;
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => errorDiv.style.display = 'none', 3000);
}

document.getElementById('playerNameInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') showError('Please select a game mode'); });