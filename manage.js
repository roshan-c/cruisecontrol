#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n🍺 CruiseControl Management Tool');
  console.log('================================');
  console.log('1. Remove all bars and goals');
  console.log('2. Remove all bars');
  console.log('3. Remove all goals');
  console.log('4. Import bars from bars.csv');
  console.log('5. Import goals from goals.csv');
  console.log('6. Make user admin');
  console.log('7. Exit');
  console.log('');
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Use the new JSON-based database
function getDb() {
  return require('./database');
}

async function removeAllBarsAndGoals() {
  try {
    const db = getDb();
    // Remove all progress of type bar or goal
    const progress = (await db.all('SELECT * FROM progress')).filter(pr => !['bar', 'goal'].includes(pr.type));
    db.db.progress = progress;
    db._save();
    // Remove all bars and goals
    db.db.bars = [];
    db.db.goals = [];
    db._save();
    console.log('✅ All bars and goals removed successfully');
  } catch (error) {
    console.error('❌ Error removing bars and goals:', error.message);
  }
}

async function removeAllBars() {
  try {
    const db = getDb();
    // Remove all progress of type bar
    const progress = (await db.all('SELECT * FROM progress')).filter(pr => pr.type !== 'bar');
    db.db.progress = progress;
    db._save();
    // Remove all bars
    db.db.bars = [];
    db._save();
    console.log('✅ All bars removed successfully');
  } catch (error) {
    console.error('❌ Error removing bars:', error.message);
  }
}

async function removeAllGoals() {
  try {
    const db = getDb();
    // Remove all progress of type goal
    const progress = (await db.all('SELECT * FROM progress')).filter(pr => pr.type !== 'goal');
    db.db.progress = progress;
    db._save();
    // Remove all goals
    db.db.goals = [];
    db._save();
    console.log('✅ All goals removed successfully');
  } catch (error) {
    console.error('❌ Error removing goals:', error.message);
  }
}

async function importBarsFromCSV() {
  const csvPath = path.join(__dirname, 'bars.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ bars.csv not found. Please create it in the project root.');
    console.log('Expected format: one bar name per line');
    return;
  }
  try {
    const db = getDb();
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const bars = csvContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (bars.length === 0) {
      console.log('⚠️  No bars found in bars.csv');
      return;
    }
    // Remove existing bars and related progress
    db.db.progress = db.db.progress.filter(pr => pr.type !== 'bar');
    db.db.bars = [];
    // Insert new bars
    let nextId = db.db.bars.length > 0 ? Math.max(...db.db.bars.map(b => b.id)) + 1 : 1;
    for (const bar of bars) {
      db.db.bars.push({ id: nextId++, name: bar });
    }
    db._save();
    console.log(`✅ Successfully imported ${bars.length} bars from bars.csv`);
  } catch (error) {
    console.error('❌ Error importing bars:', error.message);
  }
}

async function importGoalsFromCSV() {
  const csvPath = path.join(__dirname, 'goals.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ goals.csv not found. Please create it in the project root.');
    console.log('Expected format: one goal per line');
    return;
  }
  try {
    const db = getDb();
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const goals = csvContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (goals.length === 0) {
      console.log('⚠️  No goals found in goals.csv');
      return;
    }
    // Remove existing goals and related progress
    db.db.progress = db.db.progress.filter(pr => pr.type !== 'goal');
    db.db.goals = [];
    // Insert new goals
    let nextId = db.db.goals.length > 0 ? Math.max(...db.db.goals.map(g => g.id)) + 1 : 1;
    for (const goal of goals) {
      db.db.goals.push({ id: nextId++, name: goal });
    }
    db._save();
    console.log(`✅ Successfully imported ${goals.length} goals from goals.csv`);
  } catch (error) {
    console.error('❌ Error importing goals:', error.message);
  }
}

async function makeUserAdmin() {
  try {
    const db = getDb();
    const username = await question('Enter username to make admin: ');
    if (!username.trim()) {
      console.log('❌ Username cannot be empty');
      return;
    }
    // Check if user exists
    const user = (await db.all('SELECT * FROM users')).find(u => u.username === username.trim());
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    if (user.is_admin) {
      console.log('⚠️  User is already an admin');
      return;
    }
    user.is_admin = true;
    db._save();
    console.log(`✅ Successfully made ${username} an admin`);
  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
  }
}

async function main() {
  console.log('🍺 CruiseControl Management Tool Starting...');
  
  while (true) {
    showMenu();
    const choice = await question('Select an option (1-7): ');

    switch (choice.trim()) {
      case '1':
        const confirm1 = await question('⚠️  This will remove ALL bars, goals, and related progress. Continue? (y/N): ');
        if (confirm1.toLowerCase() === 'y') {
          await removeAllBarsAndGoals();
        } else {
          console.log('Operation cancelled.');
        }
        break;

      case '2':
        const confirm2 = await question('⚠️  This will remove ALL bars and related progress. Continue? (y/N): ');
        if (confirm2.toLowerCase() === 'y') {
          await removeAllBars();
        } else {
          console.log('Operation cancelled.');
        }
        break;

      case '3':
        const confirm3 = await question('⚠️  This will remove ALL goals and related progress. Continue? (y/N): ');
        if (confirm3.toLowerCase() === 'y') {
          await removeAllGoals();
        } else {
          console.log('Operation cancelled.');
        }
        break;

      case '4':
        await importBarsFromCSV();
        break;

      case '5':
        await importGoalsFromCSV();
        break;

      case '6':
        await makeUserAdmin();
        break;

      case '7':
        console.log('👋 Goodbye!');
        process.exit(0);
        break;

      default:
        console.log('❌ Invalid option. Please choose 1-7.');
        break;
    }

    await question('\nPress Enter to continue...');
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

process.on('exit', () => {
  rl.close();
});

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});