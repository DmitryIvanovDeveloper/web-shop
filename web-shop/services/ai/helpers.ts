import fs from 'fs';
import path from 'path';
import { getAIService } from './AIService';
import {
  ComponentGenerationRequest,
  ComponentGenerationResult,
  ArchitectureAnalysisRequest,
  ArchitectureAnalysisResult,
  CodeReviewRequest,
  CodeReviewResult
} from './types';

/**
 * Генерация компонента из файла документации
 */
export async function generateComponentFromDocs(
  docsPath: string,
  componentName: string,
  outputPath?: string
): Promise<ComponentGenerationResult> {
  
  // Читаем документацию
  if (!fs.existsSync(docsPath)) {
    throw new Error(`Documentation file not found: ${docsPath}`);
  }
  
  const documentation = fs.readFileSync(docsPath, 'utf-8');
  
  // Читаем существующий код если есть
  let existingCode: string | undefined;
  if (outputPath && fs.existsSync(outputPath)) {
    existingCode = fs.readFileSync(outputPath, 'utf-8');
  }
  
  const request: ComponentGenerationRequest = {
    name: componentName,
    documentation,
    existingCode,
    framework: 'react',
    styling: 'tailwind'
  };
  
  const aiService = getAIService();
  const result = await aiService.generateComponent(request);
  
  // Сохраняем сгенерированный код если указан путь
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, result.code);
    console.log(`✅ Component generated: ${outputPath}`);
  }
  
  return result;
}

/**
 * Анализ архитектуры проекта
 */
export async function analyzeProjectArchitecture(
  requirements: string,
  projectPath?: string
): Promise<ArchitectureAnalysisResult> {
  
  let existingStructure: string | undefined;
  
  // Анализируем существующую структуру проекта
  if (projectPath && fs.existsSync(projectPath)) {
    existingStructure = analyzeProjectStructure(projectPath);
  }
  
  const request: ArchitectureAnalysisRequest = {
    requirements,
    existingStructure,
    preferences: [
      'Clean Architecture',
      'TypeScript',
      'React',
      'Tailwind CSS',
      'Next.js'
    ]
  };
  
  const aiService = getAIService();
  return await aiService.analyzeArchitecture(request);
}

/**
 * Code review файла или кода
 */
export async function performCodeReview(
  codeOrPath: string,
  language: string = 'typescript',
  context?: string
): Promise<CodeReviewResult> {
  
  let code: string;
  
  // Определяем, это путь к файлу или код
  if (fs.existsSync(codeOrPath)) {
    code = fs.readFileSync(codeOrPath, 'utf-8');
    context = context || `File: ${codeOrPath}`;
  } else {
    code = codeOrPath;
  }
  
  const request: CodeReviewRequest = {
    code,
    language,
    context
  };
  
  const aiService = getAIService();
  return await aiService.reviewCode(request);
}

/**
 * Анализ структуры проекта
 */
function analyzeProjectStructure(projectPath: string, maxDepth: number = 3): string {
  const structure: string[] = [];
  
  function scanDirectory(dirPath: string, depth: number = 0) {
    if (depth > maxDepth) return;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        // Игнорируем служебные папки
        if (['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          continue;
        }
        
        const itemPath = path.join(dirPath, item);
        const relativePath = path.relative(projectPath, itemPath);
        const indent = '  '.repeat(depth);
        
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          structure.push(`${indent}📁 ${item}/`);
          scanDirectory(itemPath, depth + 1);
        } else {
          const ext = path.extname(item);
          const icon = getFileIcon(ext);
          structure.push(`${indent}${icon} ${item}`);
        }
      }
    } catch (error) {
      // Игнорируем ошибки доступа
    }
  }
  
  scanDirectory(projectPath);
  return structure.join('\n');
}

/**
 * Получение иконки для файла по расширению
 */
function getFileIcon(ext: string): string {
  const icons: Record<string, string> = {
    '.ts': '🔷',
    '.tsx': '⚛️',
    '.js': '🟨',
    '.jsx': '⚛️',
    '.json': '📋',
    '.md': '📝',
    '.css': '🎨',
    '.scss': '🎨',
    '.html': '🌐',
    '.env': '🔐'
  };
  
  return icons[ext] || '📄';
}

/**
 * Пакетная генерация компонентов из документации
 */
export async function generateComponentsFromDocsFolder(
  docsFolder: string,
  outputFolder: string
): Promise<ComponentGenerationResult[]> {
  
  if (!fs.existsSync(docsFolder)) {
    throw new Error(`Documentation folder not found: ${docsFolder}`);
  }
  
  const results: ComponentGenerationResult[] = [];
  const docFiles = fs.readdirSync(docsFolder).filter(file => file.endsWith('.md'));
  
  for (const docFile of docFiles) {
    const docsPath = path.join(docsFolder, docFile);
    const componentName = docFile.replace(/^\d+\s*-\s*/, '').replace(/\.md$/, '').replace(/\s+/g, '');
    const outputPath = path.join(outputFolder, `${componentName}.tsx`);
    
    console.log(`🔄 Generating ${componentName} from ${docFile}...`);
    
    try {
      const result = await generateComponentFromDocs(docsPath, componentName, outputPath);
      results.push(result);
      console.log(`✅ Generated ${componentName}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${componentName}:`, error);
    }
  }
  
  return results;
}


import path from 'path';
import { getAIService } from './AIService';
import {
  ComponentGenerationRequest,
  ComponentGenerationResult,
  ArchitectureAnalysisRequest,
  ArchitectureAnalysisResult,
  CodeReviewRequest,
  CodeReviewResult
} from './types';

/**
 * Генерация компонента из файла документации
 */
export async function generateComponentFromDocs(
  docsPath: string,
  componentName: string,
  outputPath?: string
): Promise<ComponentGenerationResult> {
  
  // Читаем документацию
  if (!fs.existsSync(docsPath)) {
    throw new Error(`Documentation file not found: ${docsPath}`);
  }
  
  const documentation = fs.readFileSync(docsPath, 'utf-8');
  
  // Читаем существующий код если есть
  let existingCode: string | undefined;
  if (outputPath && fs.existsSync(outputPath)) {
    existingCode = fs.readFileSync(outputPath, 'utf-8');
  }
  
  const request: ComponentGenerationRequest = {
    name: componentName,
    documentation,
    existingCode,
    framework: 'react',
    styling: 'tailwind'
  };
  
  const aiService = getAIService();
  const result = await aiService.generateComponent(request);
  
  // Сохраняем сгенерированный код если указан путь
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, result.code);
    console.log(`✅ Component generated: ${outputPath}`);
  }
  
  return result;
}

/**
 * Анализ архитектуры проекта
 */
export async function analyzeProjectArchitecture(
  requirements: string,
  projectPath?: string
): Promise<ArchitectureAnalysisResult> {
  
  let existingStructure: string | undefined;
  
  // Анализируем существующую структуру проекта
  if (projectPath && fs.existsSync(projectPath)) {
    existingStructure = analyzeProjectStructure(projectPath);
  }
  
  const request: ArchitectureAnalysisRequest = {
    requirements,
    existingStructure,
    preferences: [
      'Clean Architecture',
      'TypeScript',
      'React',
      'Tailwind CSS',
      'Next.js'
    ]
  };
  
  const aiService = getAIService();
  return await aiService.analyzeArchitecture(request);
}

/**
 * Code review файла или кода
 */
export async function performCodeReview(
  codeOrPath: string,
  language: string = 'typescript',
  context?: string
): Promise<CodeReviewResult> {
  
  let code: string;
  
  // Определяем, это путь к файлу или код
  if (fs.existsSync(codeOrPath)) {
    code = fs.readFileSync(codeOrPath, 'utf-8');
    context = context || `File: ${codeOrPath}`;
  } else {
    code = codeOrPath;
  }
  
  const request: CodeReviewRequest = {
    code,
    language,
    context
  };
  
  const aiService = getAIService();
  return await aiService.reviewCode(request);
}

/**
 * Анализ структуры проекта
 */
function analyzeProjectStructure(projectPath: string, maxDepth: number = 3): string {
  const structure: string[] = [];
  
  function scanDirectory(dirPath: string, depth: number = 0) {
    if (depth > maxDepth) return;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        // Игнорируем служебные папки
        if (['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
          continue;
        }
        
        const itemPath = path.join(dirPath, item);
        const relativePath = path.relative(projectPath, itemPath);
        const indent = '  '.repeat(depth);
        
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          structure.push(`${indent}📁 ${item}/`);
          scanDirectory(itemPath, depth + 1);
        } else {
          const ext = path.extname(item);
          const icon = getFileIcon(ext);
          structure.push(`${indent}${icon} ${item}`);
        }
      }
    } catch (error) {
      // Игнорируем ошибки доступа
    }
  }
  
  scanDirectory(projectPath);
  return structure.join('\n');
}

/**
 * Получение иконки для файла по расширению
 */
function getFileIcon(ext: string): string {
  const icons: Record<string, string> = {
    '.ts': '🔷',
    '.tsx': '⚛️',
    '.js': '🟨',
    '.jsx': '⚛️',
    '.json': '📋',
    '.md': '📝',
    '.css': '🎨',
    '.scss': '🎨',
    '.html': '🌐',
    '.env': '🔐'
  };
  
  return icons[ext] || '📄';
}

/**
 * Пакетная генерация компонентов из документации
 */
export async function generateComponentsFromDocsFolder(
  docsFolder: string,
  outputFolder: string
): Promise<ComponentGenerationResult[]> {
  
  if (!fs.existsSync(docsFolder)) {
    throw new Error(`Documentation folder not found: ${docsFolder}`);
  }
  
  const results: ComponentGenerationResult[] = [];
  const docFiles = fs.readdirSync(docsFolder).filter(file => file.endsWith('.md'));
  
  for (const docFile of docFiles) {
    const docsPath = path.join(docsFolder, docFile);
    const componentName = docFile.replace(/^\d+\s*-\s*/, '').replace(/\.md$/, '').replace(/\s+/g, '');
    const outputPath = path.join(outputFolder, `${componentName}.tsx`);
    
    console.log(`🔄 Generating ${componentName} from ${docFile}...`);
    
    try {
      const result = await generateComponentFromDocs(docsPath, componentName, outputPath);
      results.push(result);
      console.log(`✅ Generated ${componentName}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${componentName}:`, error);
    }
  }
  
  return results;
}

