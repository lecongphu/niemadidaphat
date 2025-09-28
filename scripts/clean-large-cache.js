const fs = require('fs');
const path = require('path');

// Simple pretty bytes function
function prettyBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

function cleanLargeCacheFiles() {
  console.log('🔍 Scanning for large cache files...\n');
  
  const cacheDir = path.join(process.cwd(), '.next/cache');
  const largeFileThreshold = 5 * 1024 * 1024; // 5MB
  
  if (!fs.existsSync(cacheDir)) {
    console.log('ℹ️  No .next/cache directory found');
    return;
  }
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    let cleanedCount = 0;
    let cleanedSize = 0;
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        const subResult = scanDirectory(filePath);
        cleanedCount += subResult.count;
        cleanedSize += subResult.size;
      } else if (stats.size > largeFileThreshold) {
        console.log(`🗑️  Removing large file: ${file} (${prettyBytes(stats.size)})`);
        try {
          fs.unlinkSync(filePath);
          cleanedCount++;
          cleanedSize += stats.size;
        } catch (error) {
          console.log(`❌ Failed to remove ${file}: ${error.message}`);
        }
      }
    }
    
    return { count: cleanedCount, size: cleanedSize };
  }
  
  const result = scanDirectory(cacheDir);
  
  if (result.count > 0) {
    console.log(`\n✅ Cleaned ${result.count} large files (${prettyBytes(result.size)} total)`);
  } else {
    console.log('\n✅ No large cache files found');
  }
  
  // Check remaining cache size
  const remainingSize = getDirectorySize(cacheDir);
  console.log(`📊 Remaining cache size: ${prettyBytes(remainingSize)}`);
  
  const limit = 25 * 1024 * 1024; // 25MB
  if (remainingSize > limit) {
    console.log(`⚠️  Cache size still exceeds limit (${prettyBytes(limit)})`);
    console.log('💡 Consider running full cache clean: npm run build:clean');
  } else {
    console.log('✅ Cache size is within limits');
  }
}

// Run the clean
cleanLargeCacheFiles();
