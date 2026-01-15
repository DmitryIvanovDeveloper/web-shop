#!/usr/bin/env node

/**
 * Script to create 30 random products via API
 * Usage: node scripts/create-random-products.js
 */

const API_URL = 'http://localhost:3000/api/products';
const APP_ID = 'APP123';
const COUNT = 30;

// Random product titles
const TITLES = [
  'Premium Sword',
  'Magic Shield',
  'Golden Helmet',
  'Dragon Armor',
  'Elite Boots',
  'Legendary Bow',
  'Mystic Staff',
  'Crystal Ring',
  'Power Amulet',
  'Ancient Scroll',
  'Hero\'s Blade',
  'Warrior\'s Axe',
  'Mage\'s Robe',
  'Rogue\'s Dagger',
  'Paladin\'s Plate',
  'Assassin\'s Cloak',
  'Berserker\'s Gauntlets',
  'Necromancer\'s Skull',
  'Priest\'s Cross',
  'Ranger\'s Quiver',
  'Enchanted Potion',
  'Health Elixir',
  'Mana Crystal',
  'Speed Boost',
  'Strength Tonic',
  'Wisdom Scroll',
  'Fortune Coin',
  'Lucky Charm',
  'Treasure Chest',
  'Mystery Box'
];

// Random descriptions
const DESCRIPTIONS = [
  'A powerful weapon forged in the fires of Mount Doom.',
  'This legendary item will boost your combat abilities significantly.',
  'Rare artifact discovered in ancient ruins.',
  'Premium quality item crafted by master artisans.',
  'Enhance your gameplay with this exclusive product.',
  'Limited edition item with unique properties.',
  'Collect this rare item before it\'s gone forever!',
  'Perfect for players who want to dominate the game.',
  'This item will give you a competitive edge.',
  'Unlock new possibilities with this special product.',
  'A must-have for serious players.',
  'Experience the power of this legendary item.',
  'Transform your character with this amazing product.',
  'Join the elite players who own this item.',
  'Don\'t miss out on this incredible opportunity.',
  'This product will change your gaming experience.',
  'Premium quality guaranteed.',
  'One of the most sought-after items in the game.',
  'Add this to your collection today!',
  'Exclusive item available for a limited time.',
  'Boost your stats with this powerful item.',
  'Unlock hidden potential with this product.',
  'A game-changer for any serious player.',
  'Experience the difference with this premium item.',
  'Join thousands of satisfied customers.',
  'This item has been tested and proven effective.',
  'Get ahead of the competition with this product.',
  'Limited stock available - order now!',
  'Premium craftsmanship meets exceptional quality.',
  'The ultimate choice for discerning players.'
];

// Random rarities
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', null];

// Random discounts
const DISCOUNTS = ['10% OFF', '20% OFF', '30% OFF', '50% OFF', 'BUY 2 GET 1', 'FLASH SALE', null];

// Random player limits
const PLAYER_LIMITS = ['1 per player', '2 per player', '5 per player', '10 per player', 'Unlimited', null];

// Price ranges
const MIN_PRICE = 10;
const MAX_PRICE = 1000;

// Bonus ranges
const MIN_BONUS = 5;
const MAX_BONUS = 500;

// Limited offer ranges
const MIN_LIMITED_OFFER = 10;
const MAX_LIMITED_OFFER = 1000;

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomDateInFuture(daysAhead = 30) {
  const date = new Date();
  date.setDate(date.getDate() + getRandomInt(1, daysAhead));
  return date.toISOString();
}

function generateProductId() {
  return `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateRandomProduct(index) {
  const id = generateProductId();
  const title = `${getRandomElement(TITLES)} ${index + 1}`;
  const description = getRandomElement(DESCRIPTIONS);
  const rarity = getRandomElement(RARITIES);
  const discount = getRandomElement(DISCOUNTS);
  const player_limit = getRandomElement(PLAYER_LIMITS);
  const price = getRandomFloat(MIN_PRICE, MAX_PRICE);
  const rp_bonus = Math.random() > 0.5 ? getRandomInt(MIN_BONUS, MAX_BONUS) : null;
  const lp_bonus = Math.random() > 0.5 ? getRandomInt(MIN_BONUS, MAX_BONUS) : null;
  const limited_offer = Math.random() > 0.6 ? getRandomInt(MIN_LIMITED_OFFER, MAX_LIMITED_OFFER) : null;
  const expires_at = Math.random() > 0.7 ? getRandomDateInFuture(30) : null;

  return {
    id,
    title,
    description,
    rarity,
    discount,
    player_limit,
    price,
    rp_bonus,
    lp_bonus,
    limited_offer,
    expires_at
  };
}

async function createProduct(productData) {
  try {
    const payload = {
      appId: APP_ID,
      product: productData
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

async function createRandomProducts() {
  console.log(`Creating ${COUNT} random products for appId: ${APP_ID}...\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < COUNT; i++) {
    const product = generateRandomProduct(i);
    const priceStr = product.price ? `$${product.price.toFixed(2)}` : 'N/A';
    console.log(`[${i + 1}/${COUNT}] Creating product: "${product.title}" (${priceStr})...`);

    const result = await createProduct(product);

    if (result.success) {
      results.success++;
      console.log(`  ✓ Success! ID: ${result.data.id}`);
    } else {
      results.failed++;
      results.errors.push({ index: i + 1, product, error: result.error });
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
    results.errors.forEach(({ index, product, error }) => {
      console.log(`  [${index}] ${product.title}: ${error}`);
    });
  }

  console.log('='.repeat(60));
}

// Run the script
createRandomProducts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

