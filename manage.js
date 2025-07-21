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

async function removeAllBarsAndGoals() {
  try {
    await db.run('DELETE FROM progress WHERE type IN ("bar", "goal")');
    await db.run('DELETE FROM bars');
    await db.run('DELETE FROM goals');
    console.log('✅ All bars and goals removed successfully');
  } catch (error) {
    console.error('❌ Error removing bars and goals:', error.message);
  }
}

async function removeAllBars() {
  try {
    await db.run('DELETE FROM progress WHERE type = "bar"');
    await db.run('DELETE FROM bars');
    console.log('✅ All bars removed successfully');
  } catch (error) {
    console.error('❌ Error removing bars:', error.message);
  }
}

async function removeAllGoals() {
  try {
    await db.run('DELETE FROM progress WHERE type = "goal"');
    await db.run('DELETE FROM goals');
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
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const bars = csvContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (bars.length === 0) {
      console.log('⚠️  No bars found in bars.csv');
      return;
    }

    // Remove existing bars first
    await db.run('DELETE FROM progress WHERE type = "bar"');
    await db.run('DELETE FROM bars');

    // Insert new bars
    for (const bar of bars) {
      await db.run('INSERT INTO bars (name) VALUES (?)', [bar]);
    }

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
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const goals = csvContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (goals.length === 0) {
      console.log('⚠️  No goals found in goals.csv');
      return;
    }

    // Remove existing goals first
    await db.run('DELETE FROM progress WHERE type = "goal"');
    await db.run('DELETE FROM goals');

    // Insert new goals
    for (const goal of goals) {
      await db.run('INSERT INTO goals (name) VALUES (?)', [goal]);
    }

    console.log(`✅ Successfully imported ${goals.length} goals from goals.csv`);
  } catch (error) {
    console.error('❌ Error importing goals:', error.message);
  }
}

async function makeUserAdmin() {
  try {
    const username = await question('Enter username to make admin: ');
    
    if (!username.trim()) {
      console.log('❌ Username cannot be empty');
      return;
    }

    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username.trim()]);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    if (user.is_admin) {
      console.log('⚠️  User is already an admin');
      return;
    }

    // Update user to admin
    await db.run('UPDATE users SET is_admin = 1 WHERE username = ?', [username.trim()]);
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