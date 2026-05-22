const PORT = process.env.PORT || 3000;

const PROXY_CONFIG = {
  "/api": {
    "target": `http://localhost:${PORT}`,
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

module.exports = PROXY_CONFIG;
