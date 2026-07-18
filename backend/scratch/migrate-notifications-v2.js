import { getDB, connectDB } from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  await connectDB();
  const pool = getDB();
  try {
    console.log("Starting notification v2 schema migration...");
    
    // 1. Alter notifications
    console.log("Altering notifications table...");
    await pool.query(`ALTER TABLE notifications ADD COLUMN priority ENUM('low', 'normal', 'high', 'critical') NOT NULL DEFAULT 'normal' AFTER is_read`);
    await pool.query(`ALTER TABLE notifications ADD COLUMN status ENUM('unread', 'read', 'archived', 'dismissed') NOT NULL DEFAULT 'unread' AFTER priority`);
    
    // Migrate data from is_read to status
    await pool.query(`UPDATE notifications SET status = 'read' WHERE is_read = 1`);
    
    // Drop is_read
    await pool.query(`ALTER TABLE notifications DROP COLUMN is_read`);

    // 2. Create notification_templates
    console.log("Creating notification_templates table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        title_template VARCHAR(255) NOT NULL,
        body_template TEXT NOT NULL,
        default_priority ENUM('low', 'normal', 'high', 'critical') NOT NULL DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create notification_preferences
    console.log("Creating notification_preferences table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        notification_type ENUM('SYSTEM', 'EXPIRY', 'ASSIGNMENT', 'APPROVAL') NOT NULL,
        in_app BOOLEAN DEFAULT TRUE,
        email BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_type_unique (user_id, notification_type),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Create notification_history
    console.log("Creating notification_history table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        notification_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        action ENUM('created', 'read', 'archived', 'dismissed') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Seed Templates
    console.log("Seeding templates...");
    await pool.query(`
      INSERT INTO notification_templates (name, title_template, body_template, default_priority) VALUES
      ('EXPIRY_WARNING', '{{item}} Expiry Warning - {{daysLeft}} Days', '{{item}} will expire in {{daysLeft}} days. Please take action.', 'high'),
      ('TRIP_ASSIGNED', 'New Trip Assigned', 'You have been assigned a new trip with vehicle {{vehicleRegistration}}.', 'high'),
      ('MAINTENANCE_STATUS', 'Maintenance: {{vehicleRegistration}}', 'Vehicle {{vehicleRegistration}} maintenance status is now {{status}}.', 'normal'),
      ('APPROVAL_REQUIRED', '{{title}}', '{{message}}', 'critical')
      ON DUPLICATE KEY UPDATE title_template = VALUES(title_template), body_template = VALUES(body_template)
    `);

    console.log("Migration completed successfully.");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    pool.end();
  }
}
migrate();
