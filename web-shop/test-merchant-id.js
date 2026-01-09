// Simple test for UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

console.log('Testing UUID validation:');

// Test valid UUID
const validUUID = '550e8400-e29b-41d4-a716-446655440000';
console.log(`Valid UUID "${validUUID}":`, uuidRegex.test(validUUID));

// Test invalid UUID
const invalidUUID = 'invalid-uuid';
console.log(`Invalid UUID "${invalidUUID}":`, uuidRegex.test(invalidUUID));

// Test the UUID we use in the app
const appUUID = '550e8400-e29b-41d4-a716-446655440000';
console.log(`App UUID "${appUUID}":`, uuidRegex.test(appUUID));
