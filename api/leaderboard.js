// api/leaderboard.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'leaderboard.json');

// Helper function to read the leaderboard file
function readLeaderboard() {
    try {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Failed to read leaderboard file:', error);
        return [];
    }
}

// Helper function to write to the leaderboard file
function writeLeaderboard(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to write to leaderboard file:', error);
    }
}

module.exports = (req, res) => {
    if (req.method === 'GET') {
        const leaderboardData = readLeaderboard();
        res.status(200).json(leaderboardData);
    } else if (req.method === 'POST') {
        const { username, score, prestigeLevel } = req.body;
        const leaderboardData = readLeaderboard();

        const existingUserIndex = leaderboardData.findIndex(user => user.username === username);
        if (existingUserIndex !== -1) {
            if (score > leaderboardData[existingUserIndex].score) {
                leaderboardData[existingUserIndex].score = score;
                leaderboardData[existingUserIndex].prestigeLevel = prestigeLevel;
            }
        } else {
            leaderboardData.push({ username, score, prestigeLevel });
        }

        writeLeaderboard(leaderboardData);
        res.status(200).send('Score updated successfully.');
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
