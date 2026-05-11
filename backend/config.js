import "dotenv/config";

const config = {
  PORT: process.env.PORT || 3000,
  DB: {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    port: 1433,
    options: {
      trustServerCertificate: true,
      encrypt: false,
    },
  },
};

export default config;
