import BaseRepository from "../../core/BaseRepository.js";

class DepartmentRepository extends BaseRepository {
  constructor() {
    super("departments");
  }

  async findByName(name) {
    const [rows] = await this.pool.query(
      "SELECT * FROM departments WHERE name = ? AND deleted_at IS NULL",
      [name]
    );
    return rows[0] || null;
  }
}

export default new DepartmentRepository();
