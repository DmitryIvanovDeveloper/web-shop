#!/usr/bin/env node

/**
 * Script to create 30 random daily rewards via API
 * Usage: node scripts/create-random-daily-rewards.js
 */

const API_URL = 'http://localhost:3000/api/merchant-admin/daily-rewards';
const APP_ID = 'APP123';
const COUNT = 30;

// Random reward types
const TYPES = ['points', 'currency', 'item'];

// Random titles
const TITLES = [
  'Daily Bonus Points',
  'Morning Reward',
  'Evening Special',
  'Weekend Bonus',
  'Lucky Draw',
  'Surprise Gift',
  'Daily Check-in',
  'Bonus Points',
  'Special Offer',
  'Limited Time Reward',
  'Exclusive Bonus',
  'Premium Reward',
  'Daily Challenge',
  'Welcome Bonus',
  'Loyalty Points',
  'Achievement Reward',
  'Milestone Bonus',
  'Seasonal Gift',
  'Holiday Special',
  'Flash Reward',
  'Quick Bonus',
  'Instant Points',
  'Daily Treasure',
  'Mystery Box',
  'Power Up',
  'Energy Boost',
  'Speed Bonus',
  'Strength Pack',
  'Wisdom Points',
  'Victory Reward'
];

// Random descriptions
const DESCRIPTIONS = [
  'Claim your daily reward and boost your balance!',
  'Don\'t miss out on this amazing daily bonus!',
  'Start your day with extra points!',
  'End your day with a special reward!',
  'A perfect way to earn more points daily!',
  'Exclusive daily reward just for you!',
  'Check in daily to claim your bonus!',
  'Limited time offer - claim now!',
  'Special daily reward waiting for you!',
  'Boost your account with daily points!',
  'Claim this reward and level up faster!',
  'Daily bonus to help you progress!',
  'Don\'t forget to claim your daily gift!',
  'Start earning more with daily rewards!',
  'Your daily reward is ready to claim!',
  'Special bonus points for loyal users!',
  'Claim now and get instant points!',
  'Daily reward to enhance your experience!',
  'Exclusive daily bonus available now!',
  'Claim your reward and keep the streak!',
  'Daily points to boost your account!',
  'Special daily offer just for you!',
  'Claim this amazing daily reward!',
  'Start your journey with daily bonuses!',
  'Don\'t miss your daily reward opportunity!',
  'Claim now and enjoy extra benefits!',
  'Daily bonus to help you succeed!',
  'Special reward for daily players!',
  'Claim your daily gift and progress!',
  'Exclusive daily bonus waiting for you!'
];

// Random points range
const MIN_POINTS = 10;
const MAX_POINTS = 1000;

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomReward(index) {
  const type = getRandomElement(TYPES);
  const title = `${getRandomElement(TITLES)} ${index + 1}`;
  const description = getRandomElement(DESCRIPTIONS);
  const points = getRandomInt(MIN_POINTS, MAX_POINTS);

  return {
    appId: APP_ID,
    type,
    title,
    description,
    points
  };
}

async function createReward(rewardData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rewardData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createRandomRewards() {
  console.log(`Creating ${COUNT} random daily rewards for appId: ${APP_ID}...\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < COUNT; i++) {
    const reward = generateRandomReward(i);
    console.log(`[${i + 1}/${COUNT}] Creating reward: "${reward.title}" (${reward.type}, ${reward.points} points)...`);

    const result = await createReward(reward);

    if (result.success) {
      results.success++;
      console.log(`  ✓ Success! ID: ${result.data.id}`);
    } else {
      results.failed++;
      results.errors.push({ index: i + 1, reward, error: result.error });
      console.log(`  ✗ Failed: ${result.error}`);
    }

    // Small delay to avoid overwhelming the server
    if (i < COUNT - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Success: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(({ index, reward, error }) => {
      console.log(`  [${index}] ${reward.title}: ${error}`);
    });
  }

  console.log('='.repeat(60));
}

// Run the script
createRandomRewards().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

