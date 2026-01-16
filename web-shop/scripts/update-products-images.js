#!/usr/bin/env node

/**
 * Script to update all products with images from "1 Month" product
 * Usage: node scripts/update-products-images.js
 */

const API_URL = 'http://localhost:3000/api/products';
const APP_ID = 'APP123';
const SOURCE_PRODUCT_TITLE = '1 Month';

async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}?appId=${APP_ID}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}

async function updateProduct(productId, productData) {
  try {
    const payload = {
      appId: APP_ID,
      id: productId,
      product: productData
    };

    const response = await fetch(API_URL, {
      method: 'PUT',
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

async function updateAllProductsImages() {
  console.log(`Fetching all products for appId: ${APP_ID}...\n`);

  // Get all products
  const products = await getAllProducts();
  
  if (products.length === 0) {
    console.log('No products found.');
    return;
  }

  console.log(`Found ${products.length} products.\n`);

  // Find the source product "1 Month"
  const sourceProduct = products.find(p => 
    p.title && p.title.toLowerCase().includes('1 month')
  );

  if (!sourceProduct) {
    console.log(`Product "${SOURCE_PRODUCT_TITLE}" not found.`);
    console.log('Available products:');
    products.forEach(p => console.log(`  - ${p.title || p.id}`));
    return;
  }

  console.log(`Found source product: "${sourceProduct.title}" (ID: ${sourceProduct.id})`);
  console.log(`  main_image: ${sourceProduct.main_image ? '✓' : '✗'}`);
  console.log(`  background_image: ${sourceProduct.background_image ? '✓' : '✗'}\n`);

  const sourceMainImage = sourceProduct.main_image;
  const sourceBackgroundImage = sourceProduct.background_image;

  if (!sourceMainImage && !sourceBackgroundImage) {
    console.log('Source product has no images to copy.');
    return;
  }

  // Filter out the source product itself
  const productsToUpdate = products.filter(p => p.id !== sourceProduct.id);

  if (productsToUpdate.length === 0) {
    console.log('No other products to update.');
    return;
  }

  console.log(`Updating ${productsToUpdate.length} products with images from "${sourceProduct.title}"...\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < productsToUpdate.length; i++) {
    const product = productsToUpdate[i];
    console.log(`[${i + 1}/${productsToUpdate.length}] Updating "${product.title}" (ID: ${product.id})...`);

    // Prepare update data - keep existing fields, update only images
    const updateData = {
      title: product.title,
      description: product.description ?? null,
      main_image: sourceMainImage ?? product.main_image ?? null,
      background_image: sourceBackgroundImage ?? product.background_image ?? null,
      rarity: product.rarity ?? null,
      discount: product.discount ?? null,
      player_limit: product.player_limit ?? null,
      limited_offer: product.limited_offer ?? null,
      expires_at: product.expires_at ?? null,
      price: product.price ?? null,
      rp_bonus: product.rp_bonus ?? null,
      lp_bonus: product.lp_bonus ?? null,
    };

    const result = await updateProduct(product.id, updateData);

    if (result.success) {
      results.success++;
      console.log(`  ✓ Success!`);
    } else {
      results.failed++;
      results.errors.push({ product, error: result.error });
      console.log(`  ✗ Failed: ${result.error}`);
    }

    // Small delay to avoid overwhelming the server
    if (i < productsToUpdate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Success: ${results.success}`);
  console.log(`  Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(({ product, error }) => {
      console.log(`  [${product.title}]: ${error}`);
    });
  }

  console.log('='.repeat(60));
}

// Run the script
updateAllProductsImages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


