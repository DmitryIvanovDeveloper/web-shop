const fs = require('fs');
const path = require('path');
const PathUtils = require('./path-utils');

/**
 * Quality monitoring utilities for the web-shop project
 */
class QualityMonitor {
  constructor() {
    this.projectRoot = PathUtils.getProjectRoot();
  }

  /**
   * Check code quality metrics
   */
  async checkCodeQuality() {
    console.log('🔍 Checking code quality...');
    
    const metrics = {
      totalFiles: 0,
      totalLines: 0,
      typescriptFiles: 0,
      javascriptFiles: 0,
      testFiles: 0,
      issues: []
    };

    await this.scanDirectory(this.projectRoot, metrics);
    
    this.reportMetrics(metrics);
    return metrics;
  }

  /**
   * Recursively scan directory for files
   */
  async scanDirectory(dir, metrics, depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules, .git, .next
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(item.name)) {
          await this.scanDirectory(fullPath, metrics, depth + 1);
        }
      } else if (item.isFile()) {
        await this.analyzeFile(fullPath, metrics);
      }
    }
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath, metrics) {
    const ext = path.extname(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    metrics.totalFiles++;
    metrics.totalLines += content.split('\n').length;
    
    if (ext === '.ts' || ext === '.tsx') {
      metrics.typescriptFiles++;
    } else if (ext === '.js' || ext === '.jsx') {
      metrics.javascriptFiles++;
    }
    
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      metrics.testFiles++;
    }

    // Check for potential issues
    this.checkFileIssues(filePath, content, metrics);
  }

  /**
   * Check for common issues in files
   */
  checkFileIssues(filePath, content, metrics) {
    const issues = [];
    
    // Check for TODO comments
    const todoMatches = content.match(/TODO|FIXME|HACK/gi);
    if (todoMatches) {
      issues.push({
        type: 'TODO',
        count: todoMatches.length,
        message: `Found ${todoMatches.length} TODO/FIXME/HACK comments`
      });
    }
    
    // Check for console.log in production code
    if (!filePath.includes('.test.') && content.includes('console.log')) {
      issues.push({
        type: 'CONSOLE_LOG',
        message: 'Found console.log in production code'
      });
    }
    
    // Check for very long files
    const lineCount = content.split('\n').length;
    if (lineCount > 500) {
      issues.push({
        type: 'LONG_FILE',
        message: `File has ${lineCount} lines (consider splitting)`
      });
    }
    
    if (issues.length > 0) {
      metrics.issues.push({
        file: PathUtils.getRelativePath(filePath),
        issues
      });
    }
  }

  /**
   * Report quality metrics
   */
  reportMetrics(metrics) {
    console.log('\n📊 Quality Report:');
    console.log(`   Total files: ${metrics.totalFiles}`);
    console.log(`   Total lines: ${metrics.totalLines}`);
    console.log(`   TypeScript files: ${metrics.typescriptFiles}`);
    console.log(`   JavaScript files: ${metrics.javascriptFiles}`);
    console.log(`   Test files: ${metrics.testFiles}`);
    
    if (metrics.issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      metrics.issues.forEach(fileIssue => {
        console.log(`   📄 ${fileIssue.file}:`);
        fileIssue.issues.forEach(issue => {
          console.log(`      - ${issue.type}: ${issue.message}`);
        });
      });
    } else {
      console.log('\n✅ No issues found!');
    }
  }
}

// Run quality check if called directly
if (require.main === module) {
  const monitor = new QualityMonitor();
  monitor.checkCodeQuality().catch(console.error);
}

module.exports = QualityMonitor;
