import express from "express";
import cors from "cors";

import db from "./db.js";

class Server {
  #port = null;

  constructor(port) {
    this.#port = port;
  }

  start() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/api/status", async (req, res) => {
      try {
        const pool = await db.getConnection();
        const result = await pool.request().query("SELECT 1 AS estado");
        res.json({
          mensaje: "Backend funcionando",
          conexionBD: result.recordset[0].estado === 1 ? "OK" : "Error",
        });
      } catch (error) {
        console.error("Error en /api/status:", error.message);
        res.status(500).json({
          mensaje: "Backend funcionando",
          conexionBD: "Error: " + error.message,
        });
      }
    });

    const port = this.#port;
    const server = app.listen(port, () =>
      console.log(`Servidor escuchando en http://localhost:${port}`),
    );
    server.on("error", (error) =>
      console.log(`Error en servidor ${error.message}`),
    );
  }
}

export default Server;
