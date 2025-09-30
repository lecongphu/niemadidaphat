module.exports = {
  apps: [{
    name: 'niemadidaphat-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 1,
    exec_mode: 'cluster',
    
    // Environment
    env: {
      NODE_ENV: 'production'
    },
    
    // Logs
    error_file: './logs/frontend-err.log',
    out_file: './logs/frontend-out.log',
    log_file: './logs/frontend-combined.log',
    time: true,
    
    // Monitoring
    max_memory_restart: '1G',
    
    // Auto-restart on crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Watch (disable in production)
    watch: false,
    
    // Graceful shutdown
    kill_timeout: 5000
  }]
};
