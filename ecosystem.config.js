module.exports = {
  apps: [
    {
      name: "WP_Checker",
      port: "3624",
      max_memory_restart: "1G",
      exec_mode: "cluster",
      instances: "1",
      script: "./.output_pd/server/index.mjs",
    },
  ],
};
