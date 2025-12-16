module.exports = {
  apps: [
    {
      name: "pms-backend",
      script: "server/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "pms-frontend",
      script: "server/frontend-server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};

