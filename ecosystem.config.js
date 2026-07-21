module.exports = {
  apps: [
    {
      name: 'livestock-backend-api',
      script: 'node_modules/.bin/tsx',
      args: 'src/server/index.ts',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'livestock-frontend-ui',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
