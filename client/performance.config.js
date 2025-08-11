// Performance configuration for Next.js
// Copy these environment variables to your .env.local file

module.exports = {
  // Performance optimizations
  NEXT_TELEMETRY_DISABLED: '1',
  NODE_ENV: 'development',
  
  // Turbopack mode optimizations
  NEXT_TURBOPACK: '1',
  
  // Memory optimizations
  NODE_OPTIONS: '--max-old-space-size=4096 --optimize-for-size',
  
  // Development optimizations
  NEXT_FAST_REFRESH: '1',
  NEXT_FAST_DEV: '1',
  
  // Cache optimizations
  NEXT_CACHE_DISABLED: '0',
  NEXT_CACHE_MAX_AGE: '31536000',
  
  // Build optimizations
  NEXT_BUILD_ANALYZE: 'false',
  NEXT_BUILD_OPTIMIZE: 'true',
  
  // Webpack optimizations
  WEBPACK_ANALYZE: 'false',
  WEBPACK_OPTIMIZE: 'true',
  
  // Source map configuration (fixes webpack performance warning)
  DISABLE_SOURCE_MAPS: 'false',
  
  // TypeScript optimizations
  TSC_COMPILE_ON_SAVE: 'false',
  TSC_WATCH: 'false',
  
  // ESLint optimizations
  ESLINT_DISABLE: 'true',
  ESLINT_OPTIMIZE: 'false',
  
  // Tailwind optimizations
  TAILWIND_MODE: 'watch',
  TAILWIND_JIT: 'true',
  
  // PostCSS optimizations
  POSTCSS_OPTIMIZE: 'true',
  
  // Development server optimizations
  NEXT_DEV_OPTIMIZE: 'true',
  NEXT_DEV_FAST: 'true',
  
  // Bundle analyzer
  ANALYZE: 'false',
  
  // Instructions for usage
  instructions: `
    To use these optimizations:

    1. Copy the environment variables above to your .env.local file
    2. Run: npm run cache:clear (to clear cache)
    3. Run: npm run dev:fast (for turbopack mode)
    4. Run: npm run build:fast (for fast builds)

    Additional commands:
    - npm run clean (clear cache directories)
    - npm run analyze (analyze bundle)
    - npm run type-check (type checking only)

    Performance tips:
    - Use turbopack mode for development: npm run dev:fast
    - Disable TypeScript checking during development for faster builds
    - Use fast refresh for better development experience
    - Clear cache regularly if you experience slowdowns
    
    Webpack Performance Fix:
    - If you see webpack devtool performance warnings, set DISABLE_SOURCE_MAPS=true
    - This will disable source maps but improve build performance
  `
};

// Export as environment variables for easy copying
console.log('📋 Copy these environment variables to your .env.local file:');
console.log('');
Object.entries(module.exports).forEach(([key, value]) => {
  if (typeof value === 'string' && !key.includes('instructions')) {
    console.log(`${key}=${value}`);
  }
});
console.log('');
console.log('💡 Run: npm run cache:clear to clear cache and optimize compilation');
