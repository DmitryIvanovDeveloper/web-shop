module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'npm run type-check',
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
};