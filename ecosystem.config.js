module.exports = {
  apps: [
    {
      name: 'WP_Checker',
      port: '3624',
      max_memory_restart: '200M',
      exec_mode: 'cluster',
      instances: '1',
      script: './.output/server/index.mjs'
    }
  ]
}