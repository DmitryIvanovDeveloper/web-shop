const fs = require('fs');
const path = require('path');

const useCasesDir = 'src/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases';

const useCaseFiles = [
  'subscribe-realtime.use-case.ts',
  'unsubscribe-realtime.use-case.ts',
  'apply-settings.use-case.ts',
  'reset-settings.use-case.ts',
  'load-settings.use-case.ts',
  'load-presets.use-case.ts',
  'save-preset.use-case.ts',
  'monitor-data-freshness.use-case.ts',
  'evaluate-alerts.use-case.ts',
  'acknowledge-alert.use-case.ts',
  'silence-alert.use-case.ts'
];

useCaseFiles.forEach(fileName => {
  const filePath = path.join(useCasesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File ${fileName} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add @injectable decorator if missing
  if (!content.includes('@injectable()')) {
    content = content.replace(
      /^export class (\w+)UseCase \{/,
      '@injectable()\nexport class $1UseCase {'
    );
  }
  
  // Add injectable import if missing
  if (!content.includes('import { injectable') && content.includes('@injectable()')) {
    // Find the first import line and add injectable import
    const lines = content.split('\n');
    const firstImportIndex = lines.findIndex(line => line.startsWith('import '));
    if (firstImportIndex !== -1) {
      lines.splice(firstImportIndex, 0, "import { injectable } from 'inversify';");
      content = lines.join('\n');
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${fileName}`);
});

console.log('Use Case files updated successfully!');
