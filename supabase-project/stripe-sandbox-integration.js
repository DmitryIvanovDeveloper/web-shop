// Stripe Sandbox Integration for Supabase Payments
// This file demonstrates how to integrate Stripe sandbox with Supabase payments table

const { createClient } = require('@supabase/supabase-js');
const config = require('./remote-config');

// Initialize Supabase client
const supabase = createClient(config.projectUrl, config.anonKey);

// Stripe Sandbox Configuration
const STRIPE_CONFIG = {
  // Test API keys for Stripe sandbox
  publishableKey: 'pk_test_...', // Replace with your Stripe test publishable key
  secretKey: 'sk_test_...', // Replace with your Stripe test secret key
  
  // Sandbox environment settings
  environment: 'sandbox',
  webhookEndpoint: 'https://your-app.com/webhooks/stripe',
  
  // Test card numbers for different scenarios
  testCards: {
    success: '4242424242424242',
    decline: '4000000000000002',
    insufficientFunds: '4000000000009995',
    expired: '4000000000000069',
    processingError: '4000000000000119'
  }
};

// Simulate Stripe payment processing
async function simulateStripePayment(paymentData) {
  console.log('🔄 Simulating Stripe payment in sandbox...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate different payment outcomes based on card number
  const cardNumber = paymentData.cardNumber || STRIPE_CONFIG.testCards.success;
  
  let result;
  if (cardNumber === STRIPE_CONFIG.testCards.decline) {
    result = {
      success: false,
      error: 'Your card was declined.',
      stripePaymentIntentId: null
    };
  } else if (cardNumber === STRIPE_CONFIG.testCards.insufficientFunds) {
    result = {
      success: false,
      error: 'Your card has insufficient funds.',
      stripePaymentIntentId: null
    };
  } else if (cardNumber === STRIPE_CONFIG.testCards.expired) {
    result = {
      success: false,
      error: 'Your card has expired.',
      stripePaymentIntentId: null
    };
  } else {
    // Simulate successful payment
    result = {
      success: true,
      stripePaymentIntentId: `pi_test_${Date.now()}`,
      transactionId: `txn_${Date.now()}`,
      status: 'succeeded'
    };
  }
  
  console.log(`💳 Stripe sandbox result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  return result;
}

// Create payment in Supabase after Stripe processing
async function createPaymentWithStripe(paymentData) {
  try {
    console.log('🚀 Processing payment with Stripe sandbox...');
    
    // Step 1: Process payment through Stripe sandbox
    const stripeResult = await simulateStripePayment(paymentData);
    
    // Step 2: Create payment record in Supabase
    const supabasePaymentData = {
      user_id: paymentData.userId,
      merchant_id: paymentData.merchantId,
      app_id: paymentData.appId,
      product_id: paymentData.productId,
      paid_amount: paymentData.amount,
      // Add Stripe-specific fields
      stripe_payment_intent_id: stripeResult.stripePaymentIntentId,
      transaction_id: stripeResult.transactionId,
      payment_status: stripeResult.success ? 'completed' : 'failed',
      payment_method: 'stripe_card',
      error_message: stripeResult.error || null
    };
    
    const { data, error } = await supabase
      .from('payments')
      .insert([supabasePaymentData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating payment in Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Payment created in Supabase:', data.id);
    
    return {
      success: true,
      payment: data,
      stripeResult: stripeResult
    };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

// Test different payment scenarios
async function testPaymentScenarios() {
  console.log('🧪 Testing Stripe Sandbox Payment Scenarios\n');
  
  const testScenarios = [
    {
      name: 'Successful Payment',
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        merchantId: '550e8400-e29b-41d4-a716-446655440002',
        appId: '550e8400-e29b-41d4-a716-446655440003',
        productId: '550e8400-e29b-41d4-a716-446655440004',
        amount: 99.99,
        cardNumber: STRIPE_CONFIG.testCards.success
      }
    },
    {
      name: 'Declined Card',
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        merchantId: '550e8400-e29b-41d4-a716-446655440002',
        appId: '550e8400-e29b-41d4-a716-446655440003',
        productId: '550e8400-e29b-41d4-a716-446655440005',
        amount: 199.99,
        cardNumber: STRIPE_CONFIG.testCards.decline
      }
    },
    {
      name: 'Insufficient Funds',
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        merchantId: '550e8400-e29b-41d4-a716-446655440002',
        appId: '550e8400-e29b-41d4-a716-446655440003',
        productId: '550e8400-e29b-41d4-a716-446655440006',
        amount: 299.99,
        cardNumber: STRIPE_CONFIG.testCards.insufficientFunds
      }
    }
  ];
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log('─'.repeat(50));
    
    const result = await createPaymentWithStripe(scenario.data);
    
    if (result.success) {
      console.log(`✅ ${scenario.name}: SUCCESS`);
      console.log(`   Payment ID: ${result.payment.id}`);
      console.log(`   Amount: $${result.payment.paid_amount}`);
      console.log(`   Status: ${result.payment.payment_status}`);
    } else {
      console.log(`❌ ${scenario.name}: FAILED`);
      console.log(`   Error: ${result.error}`);
    }
  }
}

// Get payment analytics
async function getPaymentAnalytics() {
  try {
    console.log('\n📊 Payment Analytics from Supabase:');
    console.log('─'.repeat(50));
    
    // Get total payments count
    const { count: totalPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });
    
    // Get successful payments
    const { count: successfulPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'completed');
    
    // Get failed payments
    const { count: failedPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'failed');
    
    // Get total revenue
    const { data: revenueData } = await supabase
      .from('payments')
      .select('paid_amount')
      .eq('payment_status', 'completed');
    
    const totalRevenue = revenueData?.reduce((sum, payment) => sum + parseFloat(payment.paid_amount || 0), 0) || 0;
    
    console.log(`📈 Total Payments: ${totalPayments || 0}`);
    console.log(`✅ Successful: ${successfulPayments || 0}`);
    console.log(`❌ Failed: ${failedPayments || 0}`);
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
    
    return {
      totalPayments: totalPayments || 0,
      successfulPayments: successfulPayments || 0,
      failedPayments: failedPayments || 0,
      totalRevenue: totalRevenue
    };
    
  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    return null;
  }
}

// Clean up test data
async function cleanupTestData() {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .not('id', 'is', null); // Delete all payments
    
    if (error) {
      console.error('❌ Error cleaning up:', error);
      return false;
    }
    
    console.log('✅ Test data cleaned up');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    return false;
  }
}

// Main execution function
async function main() {
  console.log('🎯 Stripe Sandbox Integration with Supabase');
  console.log('=' .repeat(60));
  
  try {
    // Test payment scenarios
    await testPaymentScenarios();
    
    // Show analytics
    await getPaymentAnalytics();
    
    // Ask user if they want to clean up
    console.log('\n💡 To clean up test data, run: cleanupTestData()');
    
  } catch (error) {
    console.error('❌ Main execution failed:', error);
  }
}

// Export functions for use in other modules
module.exports = {
  createPaymentWithStripe,
  simulateStripePayment,
  testPaymentScenarios,
  getPaymentAnalytics,
  cleanupTestData,
  STRIPE_CONFIG
};

// Run main function if this file is executed directly
if (require.main === module) {
  main().then(() => {
    console.log('\n🎉 Stripe Sandbox integration test completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  });
}
