module.exports = {
  apps: [
    {
      name: "go-rabbit-web",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3102,
      },
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
