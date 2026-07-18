import BaseRepository from "../../core/BaseRepository.js";

class RouteRepository extends BaseRepository {
  constructor() {
    super("routes");
  }

  async findByName(name) {
    const [rows] = await this.pool.query(
      "SELECT * FROM routes WHERE name = ? AND deleted_at IS NULL",
      [name]
    );
    return rows[0] || null;
  }
}

export default new RouteRepository();
