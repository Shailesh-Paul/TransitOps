import BaseRepository from "../../core/BaseRepository.js";

class SettingsRepository extends BaseRepository {
  constructor() {
    super("settings");
  }

  async findByKey(key) {
    const [rows] = await this.pool.query(
      "SELECT * FROM settings WHERE setting_key = ?",
      [key]
    );
    return rows[0] || null;
  }

  async updateByKey(key, payload) {
    // Construct dynamic set clause
    const fields = Object.keys(payload);
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const values = Object.values(payload);

    const [result] = await this.pool.query(
      `UPDATE settings SET ${setClause} WHERE setting_key = ?`,
      [...values, key]
    );
    return result.affectedRows > 0;
  }
}

export default new SettingsRepository();
