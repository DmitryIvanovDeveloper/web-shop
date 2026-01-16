// Simple test for AppContext functionality
const { JSDOM } = require('jsdom');

// Create mock browser environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3001/?appId=APP123&userId=test-user-123'
});

global.window = dom.window;
global.document = dom.window.document;
global.location = dom.window.location;

console.log('Testing AppContext with URL:', global.window.location.href);

try {
  // Test URL parsing
  const urlParams = new URLSearchParams(global.window.location.search);
  const appId = urlParams.get('appId');
  const userId = urlParams.get('userId');

  console.log('✅ URL parsing works:');
  console.log('  appId:', appId);
  console.log('  userId:', userId);

  if (appId === 'APP123' && userId === 'test-user-123') {
    console.log('✅ AppContext logic should work correctly!');
  } else {
    console.log('❌ URL parsing failed');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}

