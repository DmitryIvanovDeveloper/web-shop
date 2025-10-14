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
  
  // Add injectable import and decorator
  if (!content.includes('import { injectable, inject }')) {
    content = content.replace(
      /^import { ([^}]+) } from '([^']+)';$/m,
      `import { injectable, inject } from 'inversify';
import type { $1 } from '$2';`
    );
  }
  
  // Add ROOT_TYPES import
  if (!content.includes('import { ROOT_TYPES }')) {
    content = content.replace(
      /import type { ([^}]+) } from '([^']+)';/,
      `import type { $1 } from '$2';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';`
    );
  }
  
  // Add @injectable decorator
  if (!content.includes('@injectable()')) {
    content = content.replace(
      /^export class (\w+)UseCase \{/,
      '@injectable()\nexport class $1UseCase {'
    );
  }
  
  // Add @inject decorators to constructor parameters
  content = content.replace(
    /constructor\(\s*private readonly (\w+): (\w+),/g,
    'constructor(\n    @inject(ROOT_TYPES.$2)\n    private readonly $1: $2,'
  );
  
  // Fix multiple parameters
  content = content.replace(
    /private readonly (\w+): (\w+),\s*private readonly (\w+): (\w+)/g,
    'private readonly $1: $2,\n    @inject(ROOT_TYPES.$4)\n    private readonly $3: $4'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${fileName}`);
});

console.log('Use Case files fixed successfully!');
