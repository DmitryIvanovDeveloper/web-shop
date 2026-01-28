const { execSync } = require('child_process');

console.log('🛠️ Installing GrapeJS dependencies for Site Builder...\n');

try {
  console.log('📦 Running npm install...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n✅ Dependencies installed successfully!');
  console.log('🎉 GrapeJS dependencies are now available.');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3001/site-builder?appId=app123');
  console.log('3. Check Chrome DevTools for GrapeJS logs');

} catch (error) {
  console.error('\n❌ Error installing dependencies:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your internet connection');
  console.log('2. Clear npm cache: npm cache clean --force');
  console.log('3. Delete node_modules and try again');
  process.exit(1);
}