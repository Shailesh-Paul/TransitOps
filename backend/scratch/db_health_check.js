import dotenv from 'dotenv';
dotenv.config();
import { connectDB, getDB } from '../src/config/db.js';

async function runHealthCheck() {
  await connectDB();
  const pool = getDB();
  const report = {
    missing_fk_indexes: [],
    soft_delete_issues: [],
    orphan_records: [],
    cascade_rules: []
  };

  try {
    const dbName = process.env.DB_NAME || 'railway';

    // 1. Check Missing Indexes on Foreign Keys
    // Foreign keys without indexes cause full table scans during JOINs and ON DELETE CASCADE operations.
    const [fkRows] = await pool.query(`
      SELECT 
        kcu.TABLE_NAME, 
        kcu.COLUMN_NAME, 
        kcu.REFERENCED_TABLE_NAME 
      FROM information_schema.KEY_COLUMN_USAGE kcu
      LEFT JOIN information_schema.STATISTICS s 
        ON kcu.TABLE_NAME = s.TABLE_NAME 
        AND kcu.COLUMN_NAME = s.COLUMN_NAME
        AND kcu.TABLE_SCHEMA = s.TABLE_SCHEMA
      WHERE kcu.TABLE_SCHEMA = ? 
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        AND s.INDEX_NAME IS NULL
    `, [dbName]);
    report.missing_fk_indexes = fkRows;

    // 2. Soft Delete Consistency
    // Find tables that have 'deleted_at' but don't have an index on it, or tables missing 'deleted_at'
    const [cols] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = 'deleted_at'
    `, [dbName]);
    
    const tablesWithSoftDelete = cols.map(c => c.TABLE_NAME);
    
    const [indexes] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND COLUMN_NAME = 'deleted_at'
    `, [dbName]);
    
    const indexedSoftDeletes = indexes.map(i => i.TABLE_NAME);
    
    for (const table of tablesWithSoftDelete) {
      if (!indexedSoftDeletes.includes(table)) {
        report.soft_delete_issues.push({ table, issue: 'Missing index on deleted_at (Performance hit on every SELECT query)' });
      }
    }

    // 3. Cascade Rules
    const [cascades] = await pool.query(`
      SELECT 
        k.TABLE_NAME, k.COLUMN_NAME, k.REFERENCED_TABLE_NAME, rc.DELETE_RULE
      FROM information_schema.KEY_COLUMN_USAGE k
      JOIN information_schema.REFERENTIAL_CONSTRAINTS rc 
        ON k.CONSTRAINT_NAME = rc.CONSTRAINT_NAME 
        AND k.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      WHERE k.CONSTRAINT_SCHEMA = ? AND k.REFERENCED_TABLE_NAME IS NOT NULL
    `, [dbName]);
    
    cascades.forEach(c => {
      // Flag potentially dangerous rules
      if (c.DELETE_RULE === 'RESTRICT') {
        report.cascade_rules.push({ table: c.TABLE_NAME, column: c.COLUMN_NAME, rule: 'RESTRICT', risk: 'Cannot soft/hard delete parent without deleting child first' });
      } else if (c.DELETE_RULE === 'SET NULL') {
        report.cascade_rules.push({ table: c.TABLE_NAME, column: c.COLUMN_NAME, rule: 'SET NULL', risk: 'Can leave orphaned conceptual records' });
      }
    });

    // 4. Orphan Records Detection (Dynamic Query Generation)
    // Find records where foreign key points to a non-existent parent
    for (const fk of cascades) {
      const q = `
        SELECT COUNT(*) as orphan_count 
        FROM ${fk.TABLE_NAME} child
        LEFT JOIN ${fk.REFERENCED_TABLE_NAME} parent ON child.${fk.COLUMN_NAME} = parent.id
        WHERE child.${fk.COLUMN_NAME} IS NOT NULL AND parent.id IS NULL
      `;
      try {
        const [res] = await pool.query(q);
        if (res[0].orphan_count > 0) {
          report.orphan_records.push({ table: fk.TABLE_NAME, column: fk.COLUMN_NAME, count: res[0].orphan_count });
        }
      } catch (e) {
        // Ignore table errors if tables were dropped/changed
      }
    }

    console.log(JSON.stringify(report, null, 2));

  } catch(e) {
    console.error("Health Check failed:", e);
  } finally {
    pool.end();
  }
}

runHealthCheck();
