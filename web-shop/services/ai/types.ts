// AI Service Types
export interface LLMProvider {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface AIPrompt {
  system: string;
  user: string;
  context?: string;
}

export interface AIResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  timestamp: Date;
}

export interface ComponentGenerationRequest {
  name: string;
  documentation: string;
  existingCode?: string;
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'css' | 'styled-components';
}

export interface ComponentGenerationResult {
  code: string;
  tests?: string;
  documentation?: string;
  dependencies: string[];
}

export interface ArchitectureAnalysisRequest {
  requirements: string;
  existingStructure?: string;
  preferences?: string[];
}

export interface ArchitectureAnalysisResult {
  structure: {
    folders: string[];
    files: { path: string; purpose: string }[];
  };
  patterns: string[];
  technologies: string[];
  recommendations: string[];
}

export interface CodeReviewRequest {
  code: string;
  language: string;
  context?: string;
}

export interface CodeReviewResult {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    line?: number;
    message: string;
    fix?: string;
  }>;
  strengths: string[];
  recommendations: string[];
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
}


export interface LLMProvider {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface AIPrompt {
  system: string;
  user: string;
  context?: string;
}

export interface AIResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  timestamp: Date;
}

export interface ComponentGenerationRequest {
  name: string;
  documentation: string;
  existingCode?: string;
  framework: 'react' | 'vue' | 'angular';
  styling: 'tailwind' | 'css' | 'styled-components';
}

export interface ComponentGenerationResult {
  code: string;
  tests?: string;
  documentation?: string;
  dependencies: string[];
}

export interface ArchitectureAnalysisRequest {
  requirements: string;
  existingStructure?: string;
  preferences?: string[];
}

export interface ArchitectureAnalysisResult {
  structure: {
    folders: string[];
    files: { path: string; purpose: string }[];
  };
  patterns: string[];
  technologies: string[];
  recommendations: string[];
}

export interface CodeReviewRequest {
  code: string;
  language: string;
  context?: string;
}

export interface CodeReviewResult {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    line?: number;
    message: string;
    fix?: string;
  }>;
  strengths: string[];
  recommendations: string[];
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
}

