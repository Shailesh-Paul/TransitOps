const fs = require('fs');
const file = 'c:/Users/shail/OneDrive/Desktop/OdooHackathon/backend/backend/database/seed.sql';
let sql = `
-- ==========================================
-- 14. Schema Update Reminder (Attendance)
-- ==========================================
-- Note: attendance status ENUM modified to include on_leave
-- ALTER TABLE attendance MODIFY COLUMN status ENUM('present', 'absent', 'late', 'half_day', 'on_leave') DEFAULT 'present';

-- ==========================================
-- 15. Insert Enterprise Attendance (Last 30 Days)
-- ==========================================
INSERT IGNORE INTO attendance (employee_id, date, clock_in, clock_out, status) VALUES
`;
let values = [];
let d = new Date('2026-06-12T00:00:00Z');
for (let i = 0; i < 30; i++) {
    let dateStr = d.toISOString().split('T')[0];
    for (let emp = 1; emp <= 5; emp++) {
        let status = 'present';
        let clockIn = `'${dateStr} 09:00:00'`;
        let clockOut = `'${dateStr} 17:00:00'`;
        
        // Employee 1 takes leave days 20 to 24 (i 19 to 23)
        if (emp === 1 && i >= 19 && i <= 23) {
            status = 'on_leave';
            clockIn = 'NULL';
            clockOut = 'NULL';
        }
        // Employee 2 absent on day 1
        else if (emp === 2 && i === 0) {
            status = 'absent';
            clockIn = 'NULL';
            clockOut = 'NULL';
        }
        // Employee 3 late on day 10
        else if (emp === 3 && i === 9) {
            status = 'late';
            clockIn = `'${dateStr} 10:45:00'`;
        }
        // Employee 4 takes half day on day 6 and 16
        else if (emp === 4 && (i === 5 || i === 15)) {
            status = 'half_day';
            clockOut = `'${dateStr} 13:00:00'`;
        }
        
        values.push(`(${emp}, '${dateStr}', ${clockIn}, ${clockOut}, '${status}')`);
    }
    d.setDate(d.getDate() + 1);
}
sql += values.join(',\n') + ';\n\nSET FOREIGN_KEY_CHECKS = 1;\n';

let content = fs.readFileSync(file, 'utf8');
content = content.replace('SET FOREIGN_KEY_CHECKS = 1;', sql);
fs.writeFileSync(file, content);
console.log("Attendance appended to seed.sql");
