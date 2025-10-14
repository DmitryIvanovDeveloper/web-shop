const fs = require('fs');
const path = require('path');

const useCasesDir = 'src/modules/merchant-admin/analytics/realtime-dashboard/application/use-cases';

const useCaseFiles = [
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
  
  // Fix ROOT_TYPES references
  content = content.replace(/ROOT_TYPES\.RealtimeClientPort/g, 'ROOT_TYPES.RealtimeClient');
  content = content.replace(/ROOT_TYPES\.LoggerPort/g, 'ROOT_TYPES.Logger');
  
  // Ensure proper import structure
  if (!content.includes('import type { Logger }')) {
    content = content.replace(
      /import { Logger } from '([^']+)';/,
      "import type { Logger } from '$1';"
    );
  }
  
  // Add @injectable decorator if missing
  if (!content.includes('@injectable()')) {
    content = content.replace(
      /^export class (\w+)UseCase \{/,
      '@injectable()\nexport class $1UseCase {'
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Final fix applied to ${fileName}`);
});

console.log('Final Use Case fixes applied successfully!');
