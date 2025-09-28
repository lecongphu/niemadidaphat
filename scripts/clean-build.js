const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function cleanBuild() {
  console.log('🧹 Cleaning build directories...\n');
  
  const dirsToClean = [
    '.next',
    'out',
    'node_modules/.cache',
    '.turbo'
  ];
  
  dirsToClean.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      console.log(`🗑️  Removing ${dir}...`);
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
      } catch (error) {
        console.log(`❌ Failed to remove ${dir}: ${error.message}`);
      }
    } else {
      console.log(`ℹ️  ${dir} doesn't exist, skipping`);
    }
  });
  
  console.log('\n🔨 Building with optimized settings...\n');
  
  try {
    // Set NODE_ENV to production for optimized build
    process.env.NODE_ENV = 'production';
    
    // Run build command
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('\n📊 Build completed! Checking size...\n');
    
    // Check build size
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      const buildSize = getDirectorySize(buildDir);
      const limit = 25 * 1024 * 1024; // 25MB
      const percentage = (buildSize / limit) * 100;
      
      console.log(`📁 Build size: ${prettyBytes(buildSize)}`);
      console.log(`🎯 Cloudflare limit: ${prettyBytes(limit)}`);
      console.log(`📈 Usage: ${percentage.toFixed(1)}% of limit`);
      
      if (buildSize > limit) {
        console.log('\n❌ BUILD STILL TOO LARGE!');
        console.log('💡 Try these additional optimizations:');
        console.log('   - Remove unused dependencies');
        console.log('   - Use dynamic imports for large components');
        console.log('   - Consider code splitting');
        process.exit(1);
      } else if (percentage > 80) {
        console.log('\n⚠️  WARNING: Build size is close to limit');
      } else {
        console.log('\n✅ Build size is within limits!');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the clean build
cleanBuild();
