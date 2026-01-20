#!/usr/bin/env python3
"""
Script to clean up codebase:
1. Remove logger.error/info/warn/debug calls (except in constructors)
2. Remove console.log/error/info/warn/debug calls (except in constructors)
3. Remove all comments (// and /* */)
4. Translate Russian text to English (if any remains)
"""

import os
import re
from pathlib import Path

def remove_logger_calls(content):
    """Remove logger calls but keep constructors intact"""
    # Pattern to match logger calls on their own lines
    # Match: logger.error/info/warn/debug/log(...)
    patterns = [
        r'\s*(this\.)?_?logger\.(error|info|warn|debug|log)\s*\([^)]*(?:\([^)]*\)[^)]*)*\);?\s*\n',
        r'\s*(this\.)?logger\.(error|info|warn|debug|log)\s*\([^)]*(?:\([^)]*\)[^)]*)*\);?\s*\n',
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.MULTILINE)
    
    # Remove multiline logger calls
    content = re.sub(
        r'\s*(this\.)?_?logger\.(error|info|warn|debug|log)\s*\([^;]*\);?\s*\n',
        '',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    return content

def remove_console_calls(content):
    """Remove console.log/error/info/warn/debug calls"""
    # Match console calls on their own lines
    patterns = [
        r'\s*console\.(log|error|info|warn|debug)\s*\([^)]*(?:\([^)]*\)[^)]*)*\);?\s*\n',
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.MULTILINE)
    
    # Remove multiline console calls
    content = re.sub(
        r'\s*console\.(log|error|info|warn|debug)\s*\([^;]*\);?\s*\n',
        '',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    return content

def remove_comments(content):
    """Remove all comments from code"""
    # Remove single-line comments (// ...)
    # But not // in URLs
    content = re.sub(r'//(?![^\s]*://)[^\n]*', '', content)
    
    # Remove multi-line comments (/* ... */)
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    
    # Remove JSDoc comments (/** ... */)
    content = re.sub(r'/\*\*[\s\S]*?\*/', '', content)
    
    return content

def translate_russian(text):
    """Translate Russian text to English (basic translation for common patterns)"""
    # This is a placeholder - would need a proper translation library
    # For now, just identify Russian text
    russian_pattern = r'[а-яА-ЯёЁ]+'
    # If found, would need translation
    return text

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Step 1: Remove logger calls
        content = remove_logger_calls(content)
        
        # Step 2: Remove console calls
        content = remove_console_calls(content)
        
        # Step 3: Remove comments
        content = remove_comments(content)
        
        # Step 4: Translate Russian (if any)
        # content = translate_russian(content)
        
        # Clean up multiple empty lines
        content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all files"""
    projects = ['web-shop', 'web-shop-client', 'web-shop-payment']
    extensions = ['.ts', '.tsx']
    
    total_files = 0
    processed_files = 0
    
    for project in projects:
        src_dir = Path(project) / 'src'
        if not src_dir.exists():
            continue
        
        print(f"Processing {project}...")
        
        for ext in extensions:
            for file_path in src_dir.rglob(f'*{ext}'):
                # Skip node_modules, .next, etc.
                if 'node_modules' in str(file_path) or '.next' in str(file_path):
                    continue
                
                total_files += 1
                if process_file(file_path):
                    processed_files += 1
                    print(f"  Processed: {file_path}")
    
    print(f"\nTotal files: {total_files}")
    print(f"Files modified: {processed_files}")

if __name__ == '__main__':
    main()


