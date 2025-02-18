const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../config/db.json');

function getData() {
    if (!fs.existsSync(dbPath)) {
        const defaultData = {
            currentBarIndex: 0,
            users: [],
            bars: [
                { name: "Postern Gate" },
                { name: "Stone Roses" },
                { name: "Yates" },
                { name: "Lowthers" },
                { name: "Old Bank" },
                { name: "Tank and Paddle" },
                { name: "Slug and Lettuce" },
                { name: "Stonebow" },
                { name: "Golden Fleece" },
                { name: "Brew York" }
            ],
            secondaryGoals: [
                { name: "Take a shot out of Roshan's mystery flask"},
                { name: "Down your drink" },
                { name: "Order your drink in another language" },
                { name: "Finish your drink within 10 seconds" },
                { name: "Order a drink that is the opposite colour of your shirt" },
                { name: "Order a drink that is the same colour as your shirt" },
                { name: "Take a selfie with the bartender"},
                { name: "Ask the bar staff if they know who John Pork is" },
                { name: "Ask the bar staff for a random fact" },
                { name: "Ask someone on a date and exchange contact info" },
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