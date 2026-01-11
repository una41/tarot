module.exports = {
  apps: [{
    name: 'tarot-app',
    script: './.output/server/index.mjs',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    }
  }]
}
