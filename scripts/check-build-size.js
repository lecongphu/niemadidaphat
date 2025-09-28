const fs = require('fs');
const path = require('path');
const prettyBytes = require('pretty-bytes');

// Cloudflare Pages file size limit
const CLOUDFLARE_LIMIT = 25 * 1024 * 1024; // 25MB in bytes

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Directory doesn't exist
  }
  
  return totalSize;
}

function checkBuildSize() {
  console.log('🔍 Checking build size for Cloudflare Pages compatibility...\n');
  
  const buildDir = path.join(process.cwd(), '.next');
  const outDir = path.join(process.cwd(), 'out');
  
  let totalSize = 0;
  const largeFiles = [];
  
  // Check .next directory
  if (fs.existsSync(buildDir)) {
    const nextSize = getDirectorySize(buildDir);
    totalSize += nextSize;
    
    console.log(`📁 .next directory: ${prettyBytes(nextSize)}`);
    
    // Check for large cache files
    const cacheDir = path.join(buildDir, 'cache');
    if (fs.existsSync(cacheDir)) {
      const cacheSize = getDirectorySize(cacheDir);
      console.log(`  └── cache/: ${prettyBytes(cacheSize)}`);
      
      if (cacheSize > 5 * 1024 * 1024) { // 5MB
        largeFiles.push({
          path: '.next/cache/',
          size: cacheSize,
          message: '⚠️  Large cache directory detected'
        });
      }
    }
  }
  
  // Check out directory (static export)
  if (fs.existsSync(outDir)) {
    const outSize = getDirectorySize(outDir);
    totalSize += outSize;
    console.log(`📁 out directory: ${prettyBytes(outSize)}`);
  }
  
  // Check for individual large files
  const checkPaths = [
    '.next/cache/webpack/server-production',
    '.next/cache/webpack/client-production',
    '.next/static/chunks',
  ];
  
  checkPaths.forEach(checkPath => {
    const fullPath = path.join(process.cwd(), checkPath);
    if (fs.existsSync(fullPath)) {
      const size = getDirectorySize(fullPath);
      console.log(`📁 ${checkPath}: ${prettyBytes(size)}`);
      
      if (size > 10 * 1024 * 1024) { // 10MB
        largeFiles.push({
          path: checkPath,
          size: size,
          message: '🚨 Large webpack cache detected'
        });
      }
    }
  });
  
  console.log(`\n📊 Total build size: ${prettyBytes(totalSize)}`);
  console.log(`🎯 Cloudflare limit: ${prettyBytes(CLOUDFLARE_LIMIT)}`);
  
  const percentage = (totalSize / CLOUDFLARE_LIMIT) * 100;
  console.log(`📈 Usage: ${percentage.toFixed(1)}% of limit`);
  
  if (totalSize > CLOUDFLARE_LIMIT) {
    console.log('\n❌ BUILD TOO LARGE for Cloudflare Pages!');
    console.log(`   Exceeds limit by ${prettyBytes(totalSize - CLOUDFLARE_LIMIT)}`);
    
    if (largeFiles.length > 0) {
      console.log('\n🔍 Large files detected:');
      largeFiles.forEach(file => {
        console.log(`   ${file.message}`);
        console.log(`   ${file.path}: ${prettyBytes(file.size)}`);
      });
    }
    
    console.log('\n💡 Suggestions:');
    console.log('   - Disable webpack cache in next.config.js');
    console.log('   - Add .next/cache/** to .gitignore');
    console.log('   - Use output: "standalone" for smaller builds');
    
    process.exit(1);
  } else if (percentage > 80) {
    console.log('\n⚠️  WARNING: Build size is close to limit');
    console.log('   Consider optimizing further');
  } else {
    console.log('\n✅ Build size is within Cloudflare Pages limits');
  }
  
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Large files detected:');
    largeFiles.forEach(file => {
      console.log(`   ${file.message}`);
      console.log(`   ${file.path}: ${prettyBytes(file.size)}`);
    });
  }
}

// Run the check
checkBuildSize();
