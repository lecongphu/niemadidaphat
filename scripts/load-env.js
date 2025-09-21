const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .env.local file
 * @param {string} envPath - Path to .env.local file
 * @returns {Object} Environment variables object
 */
function loadEnvLocal(envPath = '.env.local') {
  const fullPath = path.resolve(envPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`Environment file not found: ${fullPath}`);
    return {};
  }

  const envContent = fs.readFileSync(fullPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      envVars[key.trim()] = value;
    }
  });

  return envVars;
}

/**
 * Set environment variables from .env.local
 */
function setEnvFromLocal() {
  const envVars = loadEnvLocal();
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

module.exports = {
  loadEnvLocal,
  setEnvFromLocal
};

// Auto-load if this file is run directly
if (require.main === module) {
  setEnvFromLocal();
  console.log('Environment variables loaded from .env.local');
  console.log('Available variables:', Object.keys(loadEnvLocal()));
}
