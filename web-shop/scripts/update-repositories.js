const fs = require('fs');
const path = require('path');

const repositoriesDir = 'src/modules/merchant-admin/analytics/realtime-dashboard/infrastructure/repositories';

const repositoryFiles = [
  'dashboard.repository.ts',
  'geography.repository.ts', 
  'conversion.repository.ts',
  'retention.repository.ts',
  'cohort.repository.ts',
  'payment-methods.repository.ts',
  'transactions.repository.ts',
  'refunds.repository.ts',
  'marketing-channels.repository.ts',
  'filter-preset.repository.ts'
];

repositoryFiles.forEach(fileName => {
  const filePath = path.join(repositoriesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File ${fileName} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add imports if not present
  if (!content.includes('import { injectable, inject }')) {
    content = content.replace(
      /^import { ([^}]+) } from '([^']+)';$/m,
      `import { injectable, inject } from 'inversify';
import { $1 } from '$2';`
    );
  }
  
  // Add type import for HttpClient
  if (!content.includes("import type { HttpClient }")) {
    content = content.replace(
      /import { HttpClient } from '([^']+)';/,
      "import type { HttpClient } from '$1';"
    );
  }
  
  // Add ROOT_TYPES import
  if (!content.includes('import { ROOT_TYPES }')) {
    content = content.replace(
      /import type { HttpClient } from '([^']+)';/,
      `import type { HttpClient } from '$1';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';`
    );
  }
  
  // Add @injectable decorator
  if (!content.includes('@injectable()')) {
    content = content.replace(
      /^export class (\w+) implements/,
      '@injectable()\nexport class $1 implements'
    );
  }
  
  // Update constructor with @inject
  if (!content.includes('@inject(ROOT_TYPES.HttpClient)')) {
    content = content.replace(
      /constructor\(private readonly httpClient: HttpClient\)/,
      `constructor(
    @inject(ROOT_TYPES.HttpClient)
    private readonly httpClient: HttpClient`
    );
  }
  
  // Add closing parenthesis and brace
  if (content.includes('@inject(ROOT_TYPES.HttpClient)') && !content.includes('  ) {}')) {
    content = content.replace(
      /    private readonly httpClient: HttpClient$/,
      `    private readonly httpClient: HttpClient
  ) {}`
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${fileName}`);
});

console.log('Repository files updated successfully!');
