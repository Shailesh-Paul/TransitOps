import { getDB } from "../config/db.js";
import NotificationEngine from "../core/NotificationEngine.js";

/**
 * Daily Expiry Scanner Job
 * Automatically flags Expiries matching strict thresholds and pipes them into NotificationEngine
 */
export const runExpiryScanner = async () => {
  const pool = getDB();
  const thresholds = [30, 15, 7, 3, 1, 0];
  const maintThresholds = [7, 3, 1, 0];
  const adminRole = 'Fleet Manager'; // Fleet Manager gets all expiry alerts

  console.log("[CRON] Starting Advanced Expiry Scanner...");

  // 1. Vehicle Insurance Expiry
  const [insuranceExpiries] = await pool.query(`
    SELECT id, registration_number, DATEDIFF(insurance_expiry, CURDATE()) as daysLeft 
    FROM vehicles 
    WHERE insurance_expiry IS NOT NULL AND deleted_at IS NULL 
    AND DATEDIFF(insurance_expiry, CURDATE()) IN (?)
  `, [thresholds]);

  for (const v of insuranceExpiries) {
    await NotificationEngine.notifyExpiry(adminRole, {
      item: `Vehicle ${v.registration_number} Insurance`,
      daysLeft: v.daysLeft,
      reference_id: v.id,
      reference_type: 'vehicle'
    });
  }

  // 2. Vehicle PUC Expiry
  const [pucExpiries] = await pool.query(`
    SELECT id, registration_number, DATEDIFF(puc_expiry, CURDATE()) as daysLeft 
    FROM vehicles 
    WHERE puc_expiry IS NOT NULL AND deleted_at IS NULL 
    AND DATEDIFF(puc_expiry, CURDATE()) IN (?)
  `, [thresholds]);

  for (const v of pucExpiries) {
    await NotificationEngine.notifyExpiry(adminRole, {
      item: `Vehicle ${v.registration_number} PUC`,
      daysLeft: v.daysLeft,
      reference_id: v.id,
      reference_type: 'vehicle'
    });
  }

  // 3. Driver License Expiry
  const [licenseExpiries] = await pool.query(`
    SELECT d.id, e.first_name, e.last_name, DATEDIFF(d.license_expiry, CURDATE()) as daysLeft 
    FROM drivers d
    JOIN employees e ON d.employee_id = e.id
    WHERE d.license_expiry IS NOT NULL AND d.deleted_at IS NULL 
    AND DATEDIFF(d.license_expiry, CURDATE()) IN (?)
  `, [thresholds]);

  for (const d of licenseExpiries) {
    await NotificationEngine.notifyExpiry(adminRole, {
      item: `Driver ${d.first_name} ${d.last_name} License`,
      daysLeft: d.daysLeft,
      reference_id: d.id,
      reference_type: 'driver'
    });
  }

  // 4. Maintenance Scheduling Reminders & Overdue
  const [maintenanceRecords] = await pool.query(`
    SELECT m.id, m.type, m.scheduled_date, m.work_order_number, v.registration_number, DATEDIFF(m.scheduled_date, CURDATE()) as daysLeft 
    FROM maintenance_records m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE m.scheduled_date IS NOT NULL AND m.deleted_at IS NULL AND m.status = 'Scheduled'
  `);

  for (const m of maintenanceRecords) {
    if (maintThresholds.includes(m.daysLeft)) {
      const daysText = m.daysLeft === 0 ? 'Today' : m.daysLeft === 1 ? 'Tomorrow' : `in ${m.daysLeft} Days`;
      await NotificationEngine.notifyExpiry(adminRole, {
        item: `Work Order ${m.work_order_number} (${m.type}) for Vehicle ${m.registration_number}`,
        daysLeft: m.daysLeft,
        reference_id: m.id,
        reference_type: 'maintenance_record'
      });
    } else if (m.daysLeft < 0) {
      // OVERDUE ENGINE
      await pool.query('UPDATE maintenance_records SET status = "Overdue" WHERE id = ?', [m.id]);
      const formattedDate = new Date(m.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      await NotificationEngine.notifyExpiry(adminRole, {
        item: `⚠ Vehicle ${m.registration_number} ${m.type} was scheduled for ${formattedDate} and has not started. Maintenance is overdue.`,
        daysLeft: -1,
        reference_id: m.id,
        reference_type: 'maintenance_record'
      });
    }
  }

  // 5. In Progress Overdue (Progress Tracking)
  const [inProgressRecords] = await pool.query(`
    SELECT m.id, m.type, m.expected_completion_date, m.work_order_number, v.registration_number, DATEDIFF(m.expected_completion_date, CURDATE()) as daysLeft 
    FROM maintenance_records m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE m.expected_completion_date IS NOT NULL AND m.deleted_at IS NULL AND m.status = 'In Progress'
  `);

  for (const m of inProgressRecords) {
    if (m.daysLeft < 0) {
      await pool.query('UPDATE maintenance_records SET status = "Overdue" WHERE id = ?', [m.id]);
      const formattedDate = new Date(m.expected_completion_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      await NotificationEngine.notify(adminRole, {
        title: "Maintenance Overdue",
        message: `⚠ Work Order ${m.work_order_number} for Vehicle ${m.registration_number} missed its expected completion date of ${formattedDate}. Status updated to OVERDUE.`,
        type: "WARNING"
      });
    }
  }

  console.log("[CRON] Advanced Expiry Scanner completed successfully.");
};
