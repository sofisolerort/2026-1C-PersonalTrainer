import sql from "mssql";
import config from "./config.js";

class Database {
  #pool = null;

  async getConnection() {
    if (this.#pool) return this.#pool;

    try {
      this.#pool = await sql.connect(config.DB);
      console.log("Conectado a SQL Server");
      return this.#pool;
    } catch (error) {
      console.error("Error conectando a SQL Server:", error.message);
      throw error;
    }
  }
}

export default new Database();
