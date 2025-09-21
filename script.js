// Game state variables
let score = 0;
let clickValue = 1;
let cps = 0;
let prestigeLevel = 0;
let prestigeMultiplier = 1;
let autoClickers = 0;
let doubleClicks = 0;
let critChance = 0.05; // 5% base chance
let lastDailyRewardTime = 0;

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

// Game data
const upgrades = [
    { id: 'auto-clicker', name: 'Auto-Clicker', cost: 10, initialCost: 10, effect: 'Adds 1 CPS' },
    { id: 'double-clicks', name: 'Double Clicks', cost: 50, initialCost: 50, effect: 'Doubles click value' },
    { id: 'crit-booster', name: 'Critical Click Booster', cost: 200, initialCost: 200, effect: 'Increases crit chance by 2%' }
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
                <h3>${item.name}</h3>
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
            } else if (achievement.id === 'first-upgrade' && (autoClickers > 0 || doubleClicks > 0)) {
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

// --- Event Listeners ---

// Main click button logic
clickButton.addEventListener('click', () => {
    let currentClickValue = clickValue * prestigeMultiplier;
    
    // Critical click logic
    const isCrit = Math.random() < critChance;
    if (isCrit) {
        currentClickValue *= 10; // 10x critical bonus
        score += currentClickValue;
        alert('Critical Click! + ' + Math.floor(currentClickValue));
    } else {
        score += currentClickValue;
    }
    
    checkAchievements();
    updateDisplay();
});

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Upgrade purchasing logic
upgradesList.addEventListener('click', (event) => {
    if (event.target.classList.contains('buy-btn')) {
        const itemId = event.target.dataset.id;
        const item = upgrades.find(up => up.id === itemId);

        if (score >= item.cost) {
            score -= item.cost;
            if (itemId === 'auto-clicker') {
                autoClickers++;
                cps++;
            } else if (itemId === 'double-clicks') {
                clickValue *= 2;
                doubleClicks++;
            } else if (itemId === 'crit-booster') {
                critChance += 0.02;
            }
            item.cost = Math.floor(item.cost * 1.5);
            generateItems(); // Re-render to show new costs
            checkAchievements();
            updateDisplay();
        } else {
            alert('Not enough score!');
        }
    }
});

// Store item purchasing logic
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
            // Remove the item from the store after purchase
            storeItems.splice(storeItems.indexOf(item), 1);
            generateItems(); // Re-render to show purchased item is gone
            updateDisplay();
        } else {
            alert('Not enough score!');
        }
    }
});

// Prestige logic
prestigeButton.addEventListener('click', () => {
    if (score >= 1000) {
        score = 0;
        clickValue = 1;
        cps = 0;
        autoClickers = 0;
        doubleClicks = 0;
        prestigeLevel++;
        prestigeMultiplier += 0.1; // Increases CPS/click value
        
        // Reset upgrades to initial state
        upgrades.forEach(up => {
            up.cost = up.initialCost;
        });

        checkAchievements();
        generateItems();
        updateDisplay();
        alert(`You have prestiged to level ${prestigeLevel}!`);
    } else {
        alert('You need at least 1000 score to prestige!');
    }
});

// Daily reward logic
dailyRewardButton.addEventListener('click', () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - lastDailyRewardTime > oneDay) {
        const reward = 50 + prestigeLevel * 10;
        score += reward;
        lastDailyRewardTime = now;
        alert(`You claimed your daily reward of ${reward} score!`);
        updateDisplay();
    } else {
        const timeRemaining = oneDay - (now - lastDailyRewardTime);
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        alert(`Next daily reward available in ${hours}h ${minutes}m.`);
    }
});

// Theme toggle logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
});

// --- Game Loop ---
setInterval(() => {
    score += cps * prestigeMultiplier;
    checkAchievements();
    updateDisplay();
}, 1000);

// Initial setup
generateItems();
renderAchievements();
updateDisplay();
