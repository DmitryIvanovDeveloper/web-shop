const path = require('path');
const fs = require('fs');

/**
 * Utility functions for working with file paths
 */
class PathUtils {
  /**
   * Get the project root directory
   */
  static getProjectRoot() {
    return path.resolve(__dirname, '..');
  }

  /**
   * Get the source directory path
   */
  static getSourceDir() {
    return path.join(this.getProjectRoot(), 'src');
  }

  /**
   * Get the AI agents directory path
   */
  static getAgentsDir() {
    return path.join(this.getProjectRoot(), 'ai-agents');
  }

  /**
   * Check if a path exists
   */
  static exists(path) {
    return fs.existsSync(path);
  }

  /**
   * Create directory if it doesn't exist
   */
  static ensureDir(dirPath) {
    if (!this.exists(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get relative path from project root
   */
  static getRelativePath(fullPath) {
    return path.relative(this.getProjectRoot(), fullPath);
  }
}

module.exports = PathUtils;
