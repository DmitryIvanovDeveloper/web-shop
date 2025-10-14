const fs = require('fs');
const path = require('path');

const repositoriesDir = 'src/modules/merchant-admin/analytics/realtime-dashboard/infrastructure/repositories';

const repositoryFiles = [
  'cohort.repository.ts',
  'conversion.repository.ts',
  'filter-preset.repository.ts',
  'geography.repository.ts',
  'marketing-channels.repository.ts',
  'payment-methods.repository.ts',
  'retention.repository.ts',
  'refunds.repository.ts',
  'transactions.repository.ts',
  'dashboard.repository.ts'
];

repositoryFiles.forEach(fileName => {
  const filePath = path.join(repositoriesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File ${fileName} not found, skipping...`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix constructor syntax - remove the extra {}
  content = content.replace(
    /private readonly httpClient: HttpClient \{\}/,
    'private readonly httpClient: HttpClient\n  ) {}'
  );
  
  // Add @injectable decorator if missing
  if (!content.includes('@injectable()')) {
    content = content.replace(
      /^export class (\w+) implements/,
      '@injectable()\nexport class $1 implements'
    );
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${fileName}`);
});

console.log('Repository files fixed successfully!');
