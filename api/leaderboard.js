// api/leaderboard.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'leaderboard.json');

// Helper function to read the leaderboard file
function readLeaderboard() {
    
