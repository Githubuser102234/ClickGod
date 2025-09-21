// Game state variables
let score = 0;
let clickValue = 1;
let cps = 0;
let prestigeLevel = 0;
let prestigeMultiplier = 1;
let autoClickers = 0;
let doubleClicks = 0;
let critChance = 0.05;
let lastDailyRewardTime = 0;
let username = '';

// DOM element references
const scoreElement = document.getElementById('score');
const cpsElement = document.getElementById('cps');
const prestigeLevelElement = document.getElementById('prestige-level');
const clickButton = document.getElementById('clickButton');
const prestigeButton = document.getElementById('prestige-button');
const dailyRewardButton = document.getElementById('daily-reward-button');
const upgradesList = document.getElementById('upgrades-list');
const storeList = document.getElementById('store-list');
const achievementsList = document.getElementById('achievements-list');
const themeToggle = document.getElementById('theme-toggle');
const leaderboardList = document.getElementById('leaderboard-list');

// Game data
const upgrades = [
    { id: 'auto-clicker', name: 'Auto-Clicker', cost: 10, initialCost: 10, effect: 'Adds 1 CPS', count: 0 },
    { id: 'double-clicks', name: 'Double Clicks', cost: 50, initialCost: 50, effect: 'Doubles click value', count: 0 },
    { id: 'crit-booster', name: 'Critical Click Booster', cost: 200, initialCost: 200, effect: 'Increases crit chance by 2%', count: 0 }
];

const storeItems = [
    { id: 'score-boost', name: 'Score Multiplier', cost: 500, effect: 'Multiplies current score by 1.5' },
    { id: 'cps-boost', name: 'CPS Multiplier', cost: 1000, effect: 'Multiplies current CPS by 2' },
];

const achievements = [
    { id: 'first-click', name: 'First Click!', description: 'Click the button for the first time.', achieved: false },
    { id: 'hundred-score', name: 'Centurion', description: 'Reach 100 score.', achieved: false },
    { id: 'first-upgrade', name: 'Making Progress', description: 'Buy your first upgrade.', achieved: false },
    { id: 'prestige-one', name: 'The Cycle Begins', description: 'Prestige for the first time.', achieved: false },
];

// --- Core Game Functions ---

// Save game state to local storage
function saveGame() {
    const gameState = {
        score,
        clickValue,
        cps,
        prestigeLevel,
        prestigeMultiplier,
        upgrades,
        lastDailyRewardTime,
        username
    };
    localStorage.setItem('quantumClickerSave', JSON.stringify(gameState));
}

// Load game state from local storage
function loadGame() {
    const savedState = localStorage.getItem('quantumClickerSave');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        score = gameState.score;
        clickValue = gameState.clickValue;
        cps = gameState.cps;
        prestigeLevel = gameState.prestigeLevel;
        prestigeMultiplier = gameState.prestigeMultiplier;
        gameState.upgrades.forEach(savedUpgrade => {
            const currentUpgrade = upgrades.find(up => up.id === savedUpgrade.id);
            if (currentUpgrade) {
                currentUpgrade.cost = savedUpgrade.cost;
                currentUpgrade.count = savedUpgrade.count;
            }
        });
        lastDailyRewardTime = gameState.lastDailyRewardTime;
        username = gameState.username || prompt('Welcome, Player! Please enter your username:');
        if (username) {
            saveGame();
        }
    } else {
        username = prompt('Welcome, Player! Please enter your username:');
        if (username) {
            saveGame();
        }
    }
}

// Update the display with current stats
function updateDisplay() {
    scoreElement.textContent = Math.floor(score);
    cpsElement.textContent = cps * prestigeMultiplier;
    prestigeLevelElement.textContent = prestigeLevel;
}

// Generate upgrade and store items dynamically
function generateItems() {
    upgradesList.innerHTML = '';
    upgrades.forEach(item => {
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <div class="item-info">
                <h3>${item.name} (x${item.count})</h3>
                <p>${item.effect}</p>
            </div>
            <div class="item-cost">${item.cost}</div>
            <button class="buy-btn" data-id="${item.id}">Buy</button>
        `;
        upgradesList.appendChild(div);
    });

    storeList.innerHTML = '';
    storeItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'store-item';
        div.innerHTML = `
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.effect}</p>
            </div>
            <div class="item-cost">${item.cost}</div>
            <button class="buy-powerup-btn" data-id="${item.id}">Buy</button>
        `;
        storeList.appendChild(div);
    });
}

// Check for achievements
function checkAchievements() {
    achievements.forEach(achievement => {
        if (!achievement.achieved) {
            if (achievement.id === 'first-click' && score > 0) {
                achievement.achieved = true;
            } else if (achievement.id === 'hundred-score' && score >= 100) {
                achievement.achieved = true;
            } else if (achievement.id === 'first-upgrade' && upgrades.some(up => up.count > 0)) {
                achievement.achieved = true;
            } else if (achievement.id === 'prestige-one' && prestigeLevel >= 1) {
                achievement.achieved = true;
            }
        }
    });
    renderAchievements();
}

// Render achievements to the UI
function renderAchievements() {
    achievementsList.innerHTML = '';
    achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.className = achievement.achieved ? 'achieved' : 'not-achieved';
        li.innerHTML = `
            <span>${achievement.name}</span>
            <span>${achievement.achieved ? '✓' : '✗'}</span>
        `;
        achievementsList.appendChild(li);
    });
}

// Fetch and display leaderboard from a local JSON file
async function getLeaderboard() {
    try {
        const response = await fetch('leaderboard.json');
        const data = await response.json();
        renderLeaderboard(data);
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    }
}

// Update the leaderboard data and render it
function updateLeaderboard() {
    getLeaderboard().then(data => {
        const existingUserIndex = data.findIndex(user => user.username === username);
        if (existingUserIndex !== -1) {
            if (score > data[existingUserIndex].score) {
                data[existingUserIndex].score = score;
                data[existingUserIndex].prestigeLevel = prestigeLevel;
            }
        } else {
            data.push({ username, score, prestigeLevel });
        }
        // This part would ideally save to the file, but client-side JS cannot do that
        // For a client-only solution, the leaderboard is updated in memory
        renderLeaderboard(data);
    });
}

// Render leaderboard to the UI
function renderLeaderboard(data) {
    leaderboardList.innerHTML = '';
    data.sort((a, b) => b.score - a.score).slice(0, 10).forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>#${index + 1} ${entry.username}</span><span>Score: ${Math.floor(entry.score)} (P: ${entry.prestigeLevel})</span>`;
        leaderboardList.appendChild(li);
    });
}

// --- Event Listeners ---

clickButton.addEventListener('click', () => {
    let currentClickValue = clickValue * prestigeMultiplier;
    const isCrit = Math.random() < critChance;
    if (isCrit) {
        currentClickValue *= 10;
    }
    score += currentClickValue;
    checkAchievements();
    updateDisplay();
    saveGame();
});

document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        if (button.dataset.tab === 'leaderboard') {
            getLeaderboard();
        }
    });
});

upgradesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('buy-btn')) {
        const itemId = event.target.dataset.id;
        const item = upgrades.find(up => up.id === itemId);

        if (score >= item.cost) {
            score -= item.cost;
            item.count++;
            if (itemId === 'auto-clicker') {
                cps++;
            } else if (itemId === 'double-clicks') {
                clickValue *= 2;
            } else if (itemId === 'crit-booster') {
                critChance += 0.02;
            }
            item.cost = Math.floor(item.cost * 1.5);
            generateItems();
            checkAchievements();
            updateDisplay();
            saveGame();
        } else {
            alert('Not enough score!');
        }
    }
});

storeList.addEventListener('click', (event) => {
    if (event.target.classList.contains('buy-powerup-btn')) {
        const itemId = event.target.dataset.id;
        const item = storeItems.find(st => st.id === itemId);

        if (score >= item.cost) {
            score -= item.cost;
            if (itemId === 'score-boost') {
                score *= 1.5;
            } else if (itemId === 'cps-boost') {
                cps *= 2;
            }
            storeItems.splice(storeItems.indexOf(item), 1);
            generateItems();
            updateDisplay();
            saveGame();
        } else {
            alert('Not enough score!');
        }
    }
});

prestigeButton.addEventListener('click', () => {
    if (score >= 1000) {
        score = 0;
        clickValue = 1;
        cps = 0;
        prestigeLevel++;
        prestigeMultiplier += 0.1;
        upgrades.forEach(up => {
            up.cost = up.initialCost;
            up.count = 0;
        });

        checkAchievements();
        generateItems();
        updateDisplay();
        saveGame();
        updateLeaderboard();
        alert(`You have prestiged to level ${prestigeLevel}!`);
    } else {
        alert('You need at least 1000 score to prestige!');
    }
});

dailyRewardButton.addEventListener('click', () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - lastDailyRewardTime > oneDay) {
        const reward = 50 + prestigeLevel * 10;
        score += reward;
        lastDailyRewardTime = now;
        alert(`You claimed your daily reward of ${reward} score!`);
        updateDisplay();
        saveGame();
    } else {
        const timeRemaining = oneDay - (now - lastDailyRewardTime);
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        alert(`Next daily reward available in ${hours}h ${minutes}m.`);
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    saveGame();
});

// Game loop and initial setup
setInterval(() => {
    score += cps * prestigeMultiplier;
    checkAchievements();
    updateDisplay();
    saveGame();
}, 1000);

loadGame();
generateItems();
renderAchievements();
updateDisplay();
getLeaderboard();
