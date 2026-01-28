const { execSync } = require('child_process');
const path = require('path');

console.log('🛠️ Installing GrapeJS dependencies...\n');

try {
  const clientPath = path.join(__dirname, 'web-shop-client');

  console.log(`📂 Changing to directory: ${clientPath}`);
  process.chdir(clientPath);

  console.log('📦 Running npm install...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n✅ Dependencies installed successfully!');
  console.log('🎉 GrapeJS dependencies are now available for the Site Builder module.');

} catch (error) {
  console.error('\n❌ Error installing dependencies:', error.message);
  process.exit(1);
}