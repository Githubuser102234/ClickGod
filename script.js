let score = 0;
let clickValue = 1;
let cps = 0;
let autoClickers = 0;
let doubleClickers = 0;

const scoreElement = document.getElementById('score');
const cpsElement = document.getElementById('cps');
const clickButton = document.getElementById('clickButton');
const upgradesContainer = document.querySelector('.upgrades-container');

// Upgrade data
const upgrades = {
    1: { name: 'Auto-Clicker', cost: 10, effect: 'Adds 1 CPS' },
    2: { name: 'Double Clicks', cost: 50, effect: 'Doubles click value' }
};

// Update the display with current stats
function updateDisplay() {
    scoreElement.textContent = Math.floor(score);
    cpsElement.textContent = cps;
    document.getElementById('upgrade1-cost').textContent = upgrades[1].cost;
    document.getElementById('upgrade2-cost').textContent = upgrades[2].cost;
}

// Handle the main button click
clickButton.addEventListener('click', () => {
    score += clickValue;
    updateDisplay();
});

// Handle upgrade purchases
upgradesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('buy-upgrade')) {
        const upgradeId = parseInt(event.target.dataset.upgradeId);
        const upgrade = upgrades[upgradeId];

        if (score >= upgrade.cost) {
            score -= upgrade.cost;
            if (upgradeId === 1) {
                autoClickers++;
                cps += 1;
                upgrade.cost = Math.floor(upgrade.cost * 1.5);
            } else if (upgradeId === 2) {
                doubleClickers++;
                clickValue *= 2;
                upgrade.cost = Math.floor(upgrade.cost * 2.5);
            }
            updateDisplay();
        } else {
            alert('Not enough score to buy this upgrade!');
        }
    }
});

// Auto-clicker logic
setInterval(() => {
    score += autoClickers * 1;
    updateDisplay();
}, 1000);

// Initial display update
updateDisplay();
