module.exports = {
  apps: [{
    name: 'niemadidaphat-backend',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'cluster',
    
    // Environment
    env: {
      NODE_ENV: 'production'
    },
    
    // Logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Monitoring
    max_memory_restart: '500M',
    
    // Auto-restart on crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Watch (disable in production)
    watch: false,
    
    // Graceful shutdown
    kill_timeout: 5000,
    
    // Node args
    node_args: '--experimental-specifier-resolution=node'
  }]
};
