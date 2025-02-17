const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../config/db.json');

function getData() {
    if (!fs.existsSync(dbPath)) {
        const defaultData = {
            currentBarIndex: 0,
            users: [],
            bars: [
                "Schooner Bar",
                "Trellis Bar",
                "Boleros",
                "Rising Tide Bar",
                "Solarium Bar",
                "Suite Lounge",
                "Pool Bar & Sand Bar",
                "Vintages",
                "English Pub",
                "Wipe Out Bar",
                "Dazzles",
                "Champagne Bar"
            ],
            secondaryGoals: [
                "Order a drink from the next country we're due to visit",
                "Down your drink",
                "Order your drink in another language",
                "Finish your drink within 10 seconds",
                "Order a drink with an umbrella"
            ]
        };
        fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function saveData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { getData, saveData };