// Example client for Supabase API
// This file shows how to connect to your Supabase project

const { createClient } = require('@supabase/supabase-js');
const config = require('./remote-config');

// Initialize Supabase client
// For local development use:
// const supabaseUrl = 'http://localhost:54321';
// const supabaseKey = 'your-anon-key';

// For remote project use:
const supabaseUrl = config.projectUrl;
const supabaseKey = config.anonKey;

const supabase = createClient(supabaseUrl, supabaseKey);

// Example functions
async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    console.log(`📦 Found ${data?.length || 0} products`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

async function createOrder(userId, items) {
  try {
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return null;
    }

    console.log(`📋 Created order ${order.id} with total: $${totalAmount}`);

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return null;
    }

    console.log(`📦 Added ${createdItems?.length || 0} items to order`);
    return order;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

async function getUserOrders(userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

// Example usage
async function exampleUsage() {
  console.log('=== Supabase Client Example ===');

  // Get all products
  console.log('\n1. Getting all products...');
  const products = await getProducts();
  console.log('Products:', products);

  if (products.length > 0) {
    // Get first product details
    console.log('\n2. Getting product details...');
    const product = await getProductById(products[0].id);
    console.log('Product details:', product);

    // Create sample order (if user exists)
    console.log('\n3. Creating sample order...');
    const sampleItems = [{
      product_id: products[0].id,
      quantity: 1,
      price: products[0].price
    }];

    // Note: Replace with actual user ID from authentication
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const order = await createOrder(userId, sampleItems);
    console.log('Created order:', order);

    // Get user orders
    console.log('\n4. Getting user orders...');
    const orders = await getUserOrders(userId);
    console.log('User orders:', orders);
  }
}

// Export functions for use in other modules
module.exports = {
  getProducts,
  getProductById,
  createOrder,
  getUserOrders,
  supabase
};

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().then(() => {
    console.log('\nExample completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });
}
