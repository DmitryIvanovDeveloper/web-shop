// Example client for Payments API
// This file shows how to work with the payments table

const { createClient } = require('@supabase/supabase-js');
const config = require('./remote-config');

// Initialize Supabase client
const supabase = createClient(config.projectUrl, config.anonKey);

// Example functions for payments
async function getAllPayments() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    console.log(`💳 Found ${data?.length || 0} payments`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

async function getPaymentsByUser(userId) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }

    console.log(`👤 Found ${data?.length || 0} payments for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

async function getPaymentsByMerchant(merchantId) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchant payments:', error);
      return [];
    }

    console.log(`🏪 Found ${data?.length || 0} payments for merchant ${merchantId}`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

async function createPayment(paymentData) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    console.log(`✅ Created payment with ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

async function updatePayment(paymentId, updates) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return null;
    }

    console.log(`✅ Updated payment ${paymentId}`);
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

async function deletePayment(paymentId) {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error('Error deleting payment:', error);
      return false;
    }

    console.log(`✅ Deleted payment ${paymentId}`);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Example usage
async function exampleUsage() {
  console.log('=== Payments API Example ===\n');

  // Get all payments
  console.log('1. Getting all payments...');
  const payments = await getAllPayments();
  console.log('Payments:', payments);

  // Create a sample payment
  console.log('\n2. Creating sample payment...');
  const samplePayment = {
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    merchant_id: '550e8400-e29b-41d4-a716-446655440002',
    app_id: '550e8400-e29b-41d4-a716-446655440003',
    product_id: '550e8400-e29b-41d4-a716-446655440004',
    paid_amount: 99.99
  };

  const createdPayment = await createPayment(samplePayment);
  if (createdPayment) {
    console.log('Created payment:', createdPayment);

    // Update the payment
    console.log('\n3. Updating payment...');
    const updatedPayment = await updatePayment(createdPayment.id, {
      paid_amount: 149.99
    });
    console.log('Updated payment:', updatedPayment);

    // Get payments by user
    console.log('\n4. Getting payments by user...');
    const userPayments = await getPaymentsByUser(samplePayment.user_id);
    console.log('User payments:', userPayments);

    // Get payments by merchant
    console.log('\n5. Getting payments by merchant...');
    const merchantPayments = await getPaymentsByMerchant(samplePayment.merchant_id);
    console.log('Merchant payments:', merchantPayments);

    // Delete the payment
    console.log('\n6. Deleting payment...');
    const deleted = await deletePayment(createdPayment.id);
    console.log('Payment deleted:', deleted);
  }

  // Final check
  console.log('\n7. Final payments count...');
  const finalPayments = await getAllPayments();
  console.log('Final payments:', finalPayments);
}

// Export functions for use in other modules
module.exports = {
  getAllPayments,
  getPaymentsByUser,
  getPaymentsByMerchant,
  createPayment,
  updatePayment,
  deletePayment,
  supabase
};

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().then(() => {
    console.log('\n✅ Payments example completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Payments example failed:', error);
    process.exit(1);
  });
}
