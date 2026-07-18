SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. Insert Enterprise Roles
-- ==========================================
INSERT IGNORE INTO roles (id, name, description, is_active) VALUES
(1, 'Super Administrator', 'Unrestricted system access to all modules and configurations', 1),
(2, 'Fleet Manager', 'Full control over vehicles, drivers, and maintenance schedules', 1),
(3, 'HR Manager', 'Access to employee profiles, attendance, and leave management', 1),
(4, 'Chief Dispatcher', 'Control over routes, trip assignments, and live tracking', 1),
(5, 'Dispatcher', 'Can view routes, assign drivers, and manage daily trip logs', 1),
(6, 'Driver', 'Vehicle operator with access to view assigned trips and clock-in', 1),
(7, 'Maintenance Technician', 'Access to view and update vehicle maintenance logs', 1),
(8, 'Auditor', 'Read-only access across all modules for compliance reporting', 1),
(9, 'Standard Employee', 'Basic profile for non-operational staff to manage personal leaves', 1);

-- ==========================================
-- 2. Insert Enterprise Permissions
-- ==========================================
INSERT IGNORE INTO permissions (id, name, description) VALUES
(1, 'manage_users', 'Create, update, and deactivate user accounts'),
(2, 'view_users', 'View user directory'),
(3, 'manage_roles', 'Assign or modify roles and system permissions'),
(4, 'manage_vehicles', 'Add, retire, or update fleet vehicles'),
(5, 'view_vehicles', 'View fleet status and details'),
(6, 'manage_trips', 'Schedule, update, and manage transit trips'),
(7, 'view_trips', 'View trip logs and schedules'),
(8, 'manage_routes', 'Create and modify transit routes'),
(9, 'manage_departments', 'Create and update organizational departments'),
(10, 'manage_attendance', 'Override and manage employee attendance records'),
(11, 'view_attendance', 'View employee attendance logs'),
(12, 'manage_leaves', 'Approve or reject leave requests'),
(13, 'manage_drivers', 'Create and manage driver profiles and licenses'),
(14, 'view_drivers', 'View driver directory and statuses'),
(15, 'manage_settings', 'Modify global system settings'),
(16, 'manage_notifications', 'Send system-wide broadcast notifications'),
(17, 'view_reports', 'Access analytics and audit reports');

-- ==========================================
-- 3. Assign Permissions to Roles (Role Permissions Matrix)
-- ==========================================
-- Super Admin (Role 1) gets everything (1 through 17)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1,1), (1,2), (1,3), (1,4), (1,5), (1,6), (1,7), (1,8), (1,9), (1,10), 
(1,11), (1,12), (1,13), (1,14), (1,15), (1,16), (1,17);

-- Fleet Manager (Role 2)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(2,4), (2,5), (2,6), (2,7), (2,8), (2,13), (2,14), (2,17);

-- HR Manager (Role 3)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(3,1), (3,2), (3,9), (3,10), (3,11), (3,12), (3,17);

-- Chief Dispatcher (Role 4)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(4,5), (4,6), (4,7), (4,8), (4,14);

-- Dispatcher (Role 5)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(5,5), (5,7), (5,14);

-- Auditor (Role 8) - Read Only Everything
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(8,2), (8,5), (8,7), (8,11), (8,14), (8,17);

-- ==========================================
-- 4. Create Default Admin User
-- ==========================================
-- Password is 'admin123' hashed with bcrypt
INSERT IGNORE INTO users (id, email, password_hash, role_id, status) VALUES
(1, 'system.admin@transitops.enterprise', '$2b$10$SBXvxgipJjlIOBsnILKndOO5ttILdo8vevGGeYmIGKVFnE0.hU6BS', 1, 'active'),
(2, 'hr.director@transitops.enterprise', '$2b$10$SBXvxgipJjlIOBsnILKndOO5ttILdo8vevGGeYmIGKVFnE0.hU6BS', 3, 'active'),
(3, 'fleet.manager@transitops.enterprise', '$2b$10$SBXvxgipJjlIOBsnILKndOO5ttILdo8vevGGeYmIGKVFnE0.hU6BS', 2, 'active');

-- ==========================================
-- 5. Insert Enterprise Departments
-- ==========================================
INSERT IGNORE INTO departments (id, name, description, is_active) VALUES
(1, 'Executive Operations', 'C-Level executives and high-level strategy planning', 1),
(2, 'Human Resources', 'Talent acquisition, payroll, and employee welfare', 1),
(3, 'Fleet Management', 'Vehicle procurement, lifecycle management, and compliance', 1),
(4, 'Dispatch & Logistics', 'Daily transit operations, routing, and driver coordination', 1),
(5, 'Vehicle Maintenance', 'Mechanical repairs, inspections, and depot servicing', 1),
(6, 'Customer Support', 'Handling rider feedback, lost & found, and ticketing issues', 1),
(7, 'Information Technology', 'System infrastructure, internal software, and security', 1),
(8, 'Finance & Accounting', 'Budgeting, auditing, and financial reporting', 1),
(9, 'Safety & Compliance', 'Regulatory adherence, safety training, and incident investigation', 1);

-- ==========================================
-- 6. Insert Enterprise System Settings
-- ==========================================
INSERT IGNORE INTO settings (setting_key, setting_value, description) VALUES
('company_name', 'TransitOps Global Enterprise', 'The official legal name of the organization'),
('timezone', 'America/New_York', 'Default operational timezone for scheduling'),
('currency', 'INR', 'Default currency for payroll and procurement'),
('max_trip_duration_hrs', '10', 'DOT Compliance: Maximum allowed continuous hours per trip for drivers'),
('mandatory_rest_period_hrs', '8', 'DOT Compliance: Mandatory rest hours between shifts'),
('support_email', 'it.helpdesk@transitops.enterprise', 'Internal IT support contact'),
('system_maintenance_mode', 'false', 'Toggle to true to lock out non-admin users during upgrades'),
('auto_approve_sick_leaves', 'false', 'Whether sick leaves under 2 days are automatically approved'),
('gps_tracking_interval_sec', '30', 'Frequency in seconds that vehicle telemetry is pinged'),
('default_pagination_limit', '25', 'Default number of records returned per API page');

-- ==========================================
-- 7. Insert Dummy Users
-- ==========================================
INSERT IGNORE INTO users (id, email, password_hash, role_id, status) VALUES
(4, 'suresh.nair@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 4, 'active'),
(5, 'anjali.patel@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 5, 'active'),
(6, 'manish.tiwari@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 5, 'active'),
(7, 'sneha.reddy@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 5, 'active'),
(8, 'arjun.yadav@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(9, 'deepak.verma@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(10, 'karan.sharma@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(11, 'mohit.jain@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(12, 'prakash.singh@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(13, 'rohit.gupta@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(14, 'sanjay.joshi@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(15, 'vijay.kumar@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(16, 'anil.deshmukh@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 7, 'active'),
(17, 'ravi.teja@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 7, 'active'),
(18, 'kavita.menon@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 8, 'active'),
(19, 'neha.bhatia@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(20, 'pooja.iyer@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(21, 'vivek.agarwal@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(22, 'tarun.garg@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(23, 'megha.chawla@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(24, 'swati.mishra@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(25, 'aditya.rao@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 9, 'active'),
(26, 'vikas.thakur@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(27, 'nitesh.pandey@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(28, 'rajiv.shukla@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(29, 'sandeep.nayak@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(30, 'gaurav.dubey@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(31, 'ajay.choudhary@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active'),
(32, 'sunil.das@transitops.enterprise', '$2a$10$3Yd5IqE8G2hT/n/qD.P6rOb7CqQpQoT/K0H.C4i2.w5z5h7k/9uF2', 6, 'active');

-- ==========================================
-- 8. Insert Enterprise Employees
-- ==========================================
INSERT IGNORE INTO employees (id, user_id, department_id, first_name, last_name, phone, hire_date, status) VALUES
(1, 1, 1, 'Vikram', 'Singh', '+919876543001', '2020-05-10', 'active'),
(2, 2, 2, 'Priya', 'Kapoor', '+919876543002', '2021-02-15', 'active'),
(3, 3, 3, 'Rajesh', 'Kumar', '+919876543003', '2019-11-20', 'active'),
(4, 4, 4, 'Suresh', 'Nair', '+919876543004', '2021-06-01', 'active'),
(5, 5, 4, 'Anjali', 'Patel', '+919876543005', '2022-01-10', 'active'),
(6, 6, 4, 'Manish', 'Tiwari', '+919876543006', '2022-03-22', 'active'),
(7, 7, 4, 'Sneha', 'Reddy', '+919876543007', '2022-05-18', 'active'),
(8, 8, 4, 'Arjun', 'Yadav', '+919876543008', '2020-08-14', 'active'),
(9, 9, 4, 'Deepak', 'Verma', '+919876543009', '2021-04-05', 'active'),
(10, 10, 4, 'Karan', 'Sharma', '+919876543010', '2021-07-19', 'active'),
(11, 11, 4, 'Mohit', 'Jain', '+919876543011', '2022-02-28', 'active'),
(12, 12, 4, 'Prakash', 'Singh', '+919876543012', '2022-09-15', 'active'),
(13, 13, 4, 'Rohit', 'Gupta', '+919876543013', '2023-01-05', 'active'),
(14, 14, 4, 'Sanjay', 'Joshi', '+919876543014', '2023-03-10', 'active'),
(15, 15, 4, 'Vijay', 'Kumar', '+919876543015', '2023-06-25', 'active'),
(16, 16, 5, 'Anil', 'Deshmukh', '+919876543016', '2018-12-01', 'active'),
(17, 17, 5, 'Ravi', 'Teja', '+919876543017', '2019-09-12', 'active'),
(18, 18, 8, 'Kavita', 'Menon', '+919876543018', '2020-01-20', 'active'),
(19, 19, 2, 'Neha', 'Bhatia', '+919876543019', '2021-10-08', 'active'),
(20, 20, 2, 'Pooja', 'Iyer', '+919876543020', '2022-11-01', 'active'),
(21, 21, 7, 'Vivek', 'Agarwal', '+919876543021', '2021-08-30', 'active'),
(22, 22, 7, 'Tarun', 'Garg', '+919876543022', '2022-04-14', 'active'),
(23, 23, 6, 'Megha', 'Chawla', '+919876543023', '2023-02-10', 'active'),
(24, 24, 6, 'Swati', 'Mishra', '+919876543024', '2023-05-05', 'active'),
(25, 25, 9, 'Aditya', 'Rao', '+919876543025', '2021-03-18', 'active'),
(26, 26, 4, 'Vikas', 'Thakur', '+919876543026', '2021-02-22', 'active'),
(27, 27, 4, 'Nitesh', 'Pandey', '+919876543027', '2022-07-15', 'active'),
(28, 28, 4, 'Rajiv', 'Shukla', '+919876543028', '2021-09-30', 'active'),
(29, 29, 4, 'Sandeep', 'Nayak', '+919876543029', '2023-04-10', 'active'),
(30, 30, 4, 'Gaurav', 'Dubey', '+919876543030', '2020-11-05', 'active'),
(31, 31, 4, 'Ajay', 'Choudhary', '+919876543031', '2022-12-18', 'active'),
(32, 32, 4, 'Sunil', 'Das', '+919876543032', '2023-08-25', 'active');

-- ==========================================
-- 9. Insert Enterprise Drivers
-- Current Date: 2026-07-12
-- ==========================================
INSERT IGNORE INTO drivers (id, employee_id, license_number, license_expiry, status) VALUES
-- Already Expired
(1, 8, 'MH-1420010062821', '2026-06-01', 'Off Duty'),
(2, 9, 'MH-1220050073942', '2026-06-15', 'Off Duty'),

-- Expiring within 7 days (e.g. 2026-07-18)
(3, 10, 'MH-0420100084153', '2026-07-18', 'Available'),
(4, 11, 'KA-0120120095264', '2026-07-19', 'On Trip'),

-- Expiring within 15 days (e.g. 2026-07-25)
(5, 12, 'KA-0320150106375', '2026-07-24', 'Available'),
(6, 13, 'DL-0120180117486', '2026-07-26', 'Available'),

-- Expiring within 30 days (e.g. 2026-08-05)
(7, 14, 'DL-0420190128597', '2026-08-05', 'On Trip'),
(8, 15, 'TS-0920200139608', '2026-08-10', 'Available'),

-- Valid for > 1 Year (e.g. 2028/2029)
(9, 26, 'TS-0720210140719', '2028-12-31', 'Available'),
(10, 27, 'KA-5120220151820', '2029-05-10', 'On Trip'),
(11, 28, 'MH-0120230162931', '2028-09-15', 'Available'),
(12, 29, 'MH-0220240173042', '2030-01-20', 'Available'),
(13, 30, 'DL-0220250184153', '2028-07-11', 'On Trip'),
(14, 31, 'KA-0520260195264', '2029-02-28', 'Available'),
(15, 32, 'TS-1020270206375', '2027-11-15', 'Available');

-- ==========================================
-- 10. Schema Update Reminder
-- ==========================================
-- Note: The vehicles schema has been updated to include insurance_expiry, puc_expiry, and registration_expiry.
-- If you are running this on an existing database, execute these ALTER TABLE commands first:
-- ALTER TABLE vehicles ADD COLUMN insurance_expiry DATE;
-- ALTER TABLE vehicles ADD COLUMN puc_expiry DATE;
-- ALTER TABLE vehicles ADD COLUMN registration_expiry DATE;

-- ==========================================
-- 11. Insert Enterprise Vehicles
-- Current Date: 2026-07-12
-- ==========================================
INSERT IGNORE INTO vehicles (id, registration_number, make, model, year, capacity, insurance_expiry, puc_expiry, registration_expiry, status) VALUES
-- Near Expiry / Expired (For Notification Testing)
(1, 'MH-01-TR-1234', 'Tata', 'Marcopolo', 2021, 45, '2026-07-15', '2026-12-10', '2036-05-12', 'active'),       -- Insurance expires in 3 days
(2, 'MH-02-TR-5678', 'Ashok Leyland', 'Viking', 2022, 50, '2026-07-20', '2026-07-25', '2037-01-15', 'active'), -- Insurance in 8 days, PUC in 13 days
(3, 'KA-01-TR-9012', 'Volvo', '9400', 2019, 40, '2026-06-30', '2026-07-01', '2034-08-20', 'maintenance'),      -- Both already expired (maintenance mode)
(4, 'KA-03-TR-3456', 'Tata', 'Starbus', 2023, 35, '2027-02-15', '2026-07-17', '2038-03-10', 'active'),         -- PUC expires in 5 days
(5, 'DL-01-TR-7890', 'Eicher', 'Skyline', 2020, 30, '2026-08-11', '2026-08-11', '2035-11-05', 'active'),       -- Both expire in 30 days

-- Healthy / Valid Vehicles
(6, 'DL-02-TR-1122', 'Ashok Leyland', 'Cheetah', 2024, 50, '2027-01-15', '2026-11-20', '2039-01-10', 'active'),
(7, 'TS-09-TR-3344', 'Tata', 'Marcopolo', 2022, 45, '2027-03-10', '2026-12-05', '2037-04-18', 'active'),
(8, 'TS-07-TR-5566', 'Volvo', '9400 B11R', 2023, 40, '2027-05-22', '2027-02-28', '2038-06-12', 'active'),
(9, 'MH-12-TR-7788', 'BharatBenz', 'Glider', 2021, 45, '2026-11-10', '2026-09-15', '2036-09-30', 'active'),
(10, 'MH-14-TR-9900', 'Eicher', 'Skyline Pro', 2024, 30, '2027-06-01', '2027-01-10', '2039-08-25', 'active'),
(11, 'KA-05-TR-1212', 'Tata', 'Starbus Ultra', 2022, 35, '2026-10-18', '2026-09-22', '2037-12-05', 'active'),
(12, 'KA-51-TR-3434', 'Ashok Leyland', 'Viking', 2020, 50, '2026-12-12', '2026-10-30', '2035-02-14', 'active'),
(13, 'DL-04-TR-5656', 'Volvo', '9400', 2021, 40, '2027-04-05', '2026-11-15', '2036-07-19', 'active'),
(14, 'TS-10-TR-7878', 'BharatBenz', 'Glider', 2023, 45, '2027-08-20', '2027-03-10', '2038-11-11', 'active'),
(15, 'MH-04-TR-9090', 'Tata', 'Winger', 2024, 15, '2027-09-15', '2027-04-20', '2039-10-01', 'active');

-- ==========================================
-- 12. Insert Enterprise Routes
-- ==========================================
INSERT IGNORE INTO routes (id, name, start_location, end_location, distance_km, estimated_time_mins, is_active) VALUES
(1, 'RT-MUM-PUN-01', 'Mumbai Central', 'Pune Swargate', 152.50, 210, 1),
(2, 'RT-PUN-MUM-02', 'Pune Swargate', 'Mumbai Central', 152.50, 210, 1),
(3, 'RT-MUM-GOA-03', 'Mumbai Borivali', 'Panaji Kadamba', 590.00, 720, 1),
(4, 'RT-GOA-MUM-04', 'Panaji Kadamba', 'Mumbai Borivali', 590.00, 720, 1),
(5, 'RT-BLR-MYS-05', 'Bengaluru Majestic', 'Mysuru KSRTC', 145.00, 180, 1),
(6, 'RT-MYS-BLR-06', 'Mysuru KSRTC', 'Bengaluru Majestic', 145.00, 180, 1),
(7, 'RT-BLR-HYD-07', 'Bengaluru Majestic', 'Hyderabad MGBS', 570.00, 600, 1),
(8, 'RT-HYD-BLR-08', 'Hyderabad MGBS', 'Bengaluru Majestic', 570.00, 600, 1),
(9, 'RT-DEL-CHD-09', 'Delhi ISBT', 'Chandigarh Sec-43', 245.00, 270, 1),
(10, 'RT-CHD-DEL-10', 'Chandigarh Sec-43', 'Delhi ISBT', 245.00, 270, 1),
(11, 'RT-DEL-JAI-11', 'Delhi ISBT', 'Jaipur Sindhi Camp', 280.00, 300, 1),
(12, 'RT-JAI-DEL-12', 'Jaipur Sindhi Camp', 'Delhi ISBT', 280.00, 300, 1),
(13, 'RT-CHE-BLR-13', 'Chennai CMBT', 'Bengaluru Majestic', 350.00, 420, 1),
(14, 'RT-BLR-CHE-14', 'Bengaluru Majestic', 'Chennai CMBT', 350.00, 420, 1),
(15, 'RT-CHE-COI-15', 'Chennai CMBT', 'Coimbatore Gandhipuram', 510.00, 540, 1),
(16, 'RT-COI-CHE-16', 'Coimbatore Gandhipuram', 'Chennai CMBT', 510.00, 540, 1),
(17, 'RT-AHM-SUR-17', 'Ahmedabad Gita Mandir', 'Surat Central', 265.00, 240, 1),
(18, 'RT-SUR-AHM-18', 'Surat Central', 'Ahmedabad Gita Mandir', 265.00, 240, 1),
(19, 'RT-KOL-SIL-19', 'Kolkata Esplanade', 'Siliguri Tenzing Norgay', 585.00, 840, 1),
(20, 'RT-SIL-KOL-20', 'Siliguri Tenzing Norgay', 'Kolkata Esplanade', 585.00, 840, 1);

-- ==========================================
-- 13. Insert Enterprise Trips
-- Current Date Context: 2026-07-12
-- ==========================================
INSERT IGNORE INTO trips (id, route_id, vehicle_id, driver_id, start_time, end_time, status, notes) VALUES
-- COMPLETED TRIPS (July 10 - July 11, 2026)
(1, 1, 1, 1, '2026-07-10 06:00:00', '2026-07-10 09:30:00', 'completed', 'Arrived on time without issues.'),
(2, 2, 2, 2, '2026-07-10 07:00:00', '2026-07-10 10:30:00', 'completed', 'Heavy traffic near toll plaza.'),
(3, 5, 3, 3, '2026-07-10 08:15:00', '2026-07-10 11:15:00', 'completed', 'Standard run.'),
(4, 7, 4, 4, '2026-07-10 09:00:00', '2026-07-10 19:00:00', 'completed', 'Long haul completed successfully.'),
(5, 9, 5, 5, '2026-07-10 10:30:00', '2026-07-10 15:00:00', 'completed', 'Slight delay due to rain.'),
(6, 11, 6, 6, '2026-07-11 05:45:00', '2026-07-11 10:45:00', 'completed', 'Smooth journey.'),
(7, 13, 7, 7, '2026-07-11 06:30:00', '2026-07-11 13:30:00', 'completed', 'Route clear.'),
(8, 15, 8, 8, '2026-07-11 07:00:00', '2026-07-11 16:00:00', 'completed', 'No incidents reported.'),
(9, 17, 9, 9, '2026-07-11 08:00:00', '2026-07-11 12:00:00', 'completed', 'Driver reported minor engine noise.'),
(10, 19, 10, 10, '2026-07-11 18:00:00', '2026-07-12 08:00:00', 'completed', 'Overnight journey completed safely.'),

-- IN PROGRESS TRIPS (Currently running on July 12, 2026)
(11, 3, 1, 11, '2026-07-12 05:00:00', '2026-07-12 17:00:00', 'in_progress', 'Live tracking active.'),
(12, 8, 2, 12, '2026-07-12 06:30:00', '2026-07-12 16:30:00', 'in_progress', 'Running on schedule.'),
(13, 14, 3, 13, '2026-07-12 07:45:00', '2026-07-12 14:45:00', 'in_progress', 'Traffic delay reported at border.'),
(14, 16, 4, 14, '2026-07-12 08:00:00', '2026-07-12 17:00:00', 'in_progress', 'All systems nominal.'),
(15, 20, 5, 15, '2026-07-12 09:15:00', '2026-07-12 23:15:00', 'in_progress', 'Long route, double driver check required.'),
(16, 4, 6, 1, '2026-07-12 10:00:00', '2026-07-12 22:00:00', 'in_progress', 'Routine updates.'),
(17, 6, 7, 2, '2026-07-12 11:30:00', '2026-07-12 14:30:00', 'in_progress', 'Short trip.'),
(18, 10, 8, 3, '2026-07-12 12:00:00', '2026-07-12 16:30:00', 'in_progress', 'Halfway through route.'),
(19, 12, 9, 4, '2026-07-12 13:15:00', '2026-07-12 18:15:00', 'in_progress', 'Weather clear.'),
(20, 18, 10, 5, '2026-07-12 14:00:00', '2026-07-12 18:00:00', 'in_progress', 'Running slightly ahead of schedule.'),

-- SCHEDULED TRIPS (July 13 - July 15, 2026)
(21, 1, 11, 6, '2026-07-13 06:00:00', '2026-07-13 09:30:00', 'scheduled', 'Morning dispatch.'),
(22, 2, 12, 7, '2026-07-13 10:00:00', '2026-07-13 13:30:00', 'scheduled', 'Return trip.'),
(23, 5, 13, 8, '2026-07-13 08:00:00', '2026-07-13 11:00:00', 'scheduled', 'VIP passengers booked.'),
(24, 7, 14, 9, '2026-07-13 20:00:00', '2026-07-14 06:00:00', 'scheduled', 'Overnight sleeper bus.'),
(25, 9, 15, 10, '2026-07-14 05:30:00', '2026-07-14 10:00:00', 'scheduled', 'Early morning departure.'),
(26, 11, 1, 11, '2026-07-14 07:00:00', '2026-07-14 12:00:00', 'scheduled', 'Routine passenger route.'),
(27, 13, 2, 12, '2026-07-14 09:15:00', '2026-07-14 16:15:00', 'scheduled', 'Ensure A/C check before departure.'),
(28, 15, 3, 13, '2026-07-14 11:00:00', '2026-07-14 20:00:00', 'scheduled', 'Standard.'),
(29, 17, 4, 14, '2026-07-14 14:30:00', '2026-07-14 18:30:00', 'scheduled', 'Evening transit.'),
(30, 19, 5, 15, '2026-07-14 18:00:00', '2026-07-15 08:00:00', 'scheduled', 'Overnight journey.'),
(31, 4, 6, 1, '2026-07-15 06:45:00', '2026-07-15 18:45:00', 'scheduled', 'Driver shift change confirmed.'),
(32, 6, 7, 2, '2026-07-15 08:30:00', '2026-07-15 11:30:00', 'scheduled', 'Short morning trip.'),
(33, 8, 8, 3, '2026-07-15 10:00:00', '2026-07-15 20:00:00', 'scheduled', 'Check tire pressure prior to trip.'),
(34, 10, 9, 4, '2026-07-15 12:15:00', '2026-07-15 16:45:00', 'scheduled', 'Normal run.'),
(35, 12, 10, 5, '2026-07-15 15:00:00', '2026-07-15 20:00:00', 'scheduled', 'Evening dispatch.'),

-- CANCELLED TRIPS
(36, 1, 11, 6, '2026-07-11 07:00:00', '2026-07-11 10:30:00', 'cancelled', 'Cancelled due to severe weather conditions.'),
(37, 3, 12, 7, '2026-07-11 09:00:00', '2026-07-11 21:00:00', 'cancelled', 'Vehicle breakdown prior to departure.'),
(38, 7, 13, 8, '2026-07-12 18:00:00', '2026-07-13 04:00:00', 'cancelled', 'Driver unavailable due to medical emergency.'),
(39, 14, 14, 9, '2026-07-13 06:00:00', '2026-07-13 13:00:00', 'cancelled', 'Route blocked by highway protests.'),
(40, 19, 15, 10, '2026-07-14 20:00:00', '2026-07-15 10:00:00', 'cancelled', 'Low booking volume, consolidated with Trip 30.');


-- ==========================================
-- 14. Schema Update Reminder (Attendance)
-- ==========================================
-- Note: attendance status ENUM modified to include on_leave
-- ALTER TABLE attendance MODIFY COLUMN status ENUM('present', 'absent', 'late', 'half_day', 'on_leave') DEFAULT 'present';

-- ==========================================
-- 15. Insert Enterprise Attendance (Last 30 Days)
-- ==========================================
INSERT IGNORE INTO attendance (employee_id, date, clock_in, clock_out, status) VALUES
(1, '2026-06-12', '2026-06-12 09:00:00', '2026-06-12 17:00:00', 'present'),
(2, '2026-06-12', NULL, NULL, 'absent'),
(3, '2026-06-12', '2026-06-12 09:00:00', '2026-06-12 17:00:00', 'present'),
(4, '2026-06-12', '2026-06-12 09:00:00', '2026-06-12 17:00:00', 'present'),
(5, '2026-06-12', '2026-06-12 09:00:00', '2026-06-12 17:00:00', 'present'),
(1, '2026-06-13', '2026-06-13 09:00:00', '2026-06-13 17:00:00', 'present'),
(2, '2026-06-13', '2026-06-13 09:00:00', '2026-06-13 17:00:00', 'present'),
(3, '2026-06-13', '2026-06-13 09:00:00', '2026-06-13 17:00:00', 'present'),
(4, '2026-06-13', '2026-06-13 09:00:00', '2026-06-13 17:00:00', 'present'),
(5, '2026-06-13', '2026-06-13 09:00:00', '2026-06-13 17:00:00', 'present'),
(1, '2026-06-14', '2026-06-14 09:00:00', '2026-06-14 17:00:00', 'present'),
(2, '2026-06-14', '2026-06-14 09:00:00', '2026-06-14 17:00:00', 'present'),
(3, '2026-06-14', '2026-06-14 09:00:00', '2026-06-14 17:00:00', 'present'),
(4, '2026-06-14', '2026-06-14 09:00:00', '2026-06-14 17:00:00', 'present'),
(5, '2026-06-14', '2026-06-14 09:00:00', '2026-06-14 17:00:00', 'present'),
(1, '2026-06-15', '2026-06-15 09:00:00', '2026-06-15 17:00:00', 'present'),
(2, '2026-06-15', '2026-06-15 09:00:00', '2026-06-15 17:00:00', 'present'),
(3, '2026-06-15', '2026-06-15 09:00:00', '2026-06-15 17:00:00', 'present'),
(4, '2026-06-15', '2026-06-15 09:00:00', '2026-06-15 17:00:00', 'present'),
(5, '2026-06-15', '2026-06-15 09:00:00', '2026-06-15 17:00:00', 'present'),
(1, '2026-06-16', '2026-06-16 09:00:00', '2026-06-16 17:00:00', 'present'),
(2, '2026-06-16', '2026-06-16 09:00:00', '2026-06-16 17:00:00', 'present'),
(3, '2026-06-16', '2026-06-16 09:00:00', '2026-06-16 17:00:00', 'present'),
(4, '2026-06-16', '2026-06-16 09:00:00', '2026-06-16 17:00:00', 'present'),
(5, '2026-06-16', '2026-06-16 09:00:00', '2026-06-16 17:00:00', 'present'),
(1, '2026-06-17', '2026-06-17 09:00:00', '2026-06-17 17:00:00', 'present'),
(2, '2026-06-17', '2026-06-17 09:00:00', '2026-06-17 17:00:00', 'present'),
(3, '2026-06-17', '2026-06-17 09:00:00', '2026-06-17 17:00:00', 'present'),
(4, '2026-06-17', '2026-06-17 09:00:00', '2026-06-17 13:00:00', 'half_day'),
(5, '2026-06-17', '2026-06-17 09:00:00', '2026-06-17 17:00:00', 'present'),
(1, '2026-06-18', '2026-06-18 09:00:00', '2026-06-18 17:00:00', 'present'),
(2, '2026-06-18', '2026-06-18 09:00:00', '2026-06-18 17:00:00', 'present'),
(3, '2026-06-18', '2026-06-18 09:00:00', '2026-06-18 17:00:00', 'present'),
(4, '2026-06-18', '2026-06-18 09:00:00', '2026-06-18 17:00:00', 'present'),
(5, '2026-06-18', '2026-06-18 09:00:00', '2026-06-18 17:00:00', 'present'),
(1, '2026-06-19', '2026-06-19 09:00:00', '2026-06-19 17:00:00', 'present'),
(2, '2026-06-19', '2026-06-19 09:00:00', '2026-06-19 17:00:00', 'present'),
(3, '2026-06-19', '2026-06-19 09:00:00', '2026-06-19 17:00:00', 'present'),
(4, '2026-06-19', '2026-06-19 09:00:00', '2026-06-19 17:00:00', 'present'),
(5, '2026-06-19', '2026-06-19 09:00:00', '2026-06-19 17:00:00', 'present'),
(1, '2026-06-20', '2026-06-20 09:00:00', '2026-06-20 17:00:00', 'present'),
(2, '2026-06-20', '2026-06-20 09:00:00', '2026-06-20 17:00:00', 'present'),
(3, '2026-06-20', '2026-06-20 09:00:00', '2026-06-20 17:00:00', 'present'),
(4, '2026-06-20', '2026-06-20 09:00:00', '2026-06-20 17:00:00', 'present'),
(5, '2026-06-20', '2026-06-20 09:00:00', '2026-06-20 17:00:00', 'present'),
(1, '2026-06-21', '2026-06-21 09:00:00', '2026-06-21 17:00:00', 'present'),
(2, '2026-06-21', '2026-06-21 09:00:00', '2026-06-21 17:00:00', 'present'),
(3, '2026-06-21', '2026-06-21 10:45:00', '2026-06-21 17:00:00', 'late'),
(4, '2026-06-21', '2026-06-21 09:00:00', '2026-06-21 17:00:00', 'present'),
(5, '2026-06-21', '2026-06-21 09:00:00', '2026-06-21 17:00:00', 'present'),
(1, '2026-06-22', '2026-06-22 09:00:00', '2026-06-22 17:00:00', 'present'),
(2, '2026-06-22', '2026-06-22 09:00:00', '2026-06-22 17:00:00', 'present'),
(3, '2026-06-22', '2026-06-22 09:00:00', '2026-06-22 17:00:00', 'present'),
(4, '2026-06-22', '2026-06-22 09:00:00', '2026-06-22 17:00:00', 'present'),
(5, '2026-06-22', '2026-06-22 09:00:00', '2026-06-22 17:00:00', 'present'),
(1, '2026-06-23', '2026-06-23 09:00:00', '2026-06-23 17:00:00', 'present'),
(2, '2026-06-23', '2026-06-23 09:00:00', '2026-06-23 17:00:00', 'present'),
(3, '2026-06-23', '2026-06-23 09:00:00', '2026-06-23 17:00:00', 'present'),
(4, '2026-06-23', '2026-06-23 09:00:00', '2026-06-23 17:00:00', 'present'),
(5, '2026-06-23', '2026-06-23 09:00:00', '2026-06-23 17:00:00', 'present'),
(1, '2026-06-24', '2026-06-24 09:00:00', '2026-06-24 17:00:00', 'present'),
(2, '2026-06-24', '2026-06-24 09:00:00', '2026-06-24 17:00:00', 'present'),
(3, '2026-06-24', '2026-06-24 09:00:00', '2026-06-24 17:00:00', 'present'),
(4, '2026-06-24', '2026-06-24 09:00:00', '2026-06-24 17:00:00', 'present'),
(5, '2026-06-24', '2026-06-24 09:00:00', '2026-06-24 17:00:00', 'present'),
(1, '2026-06-25', '2026-06-25 09:00:00', '2026-06-25 17:00:00', 'present'),
(2, '2026-06-25', '2026-06-25 09:00:00', '2026-06-25 17:00:00', 'present'),
(3, '2026-06-25', '2026-06-25 09:00:00', '2026-06-25 17:00:00', 'present'),
(4, '2026-06-25', '2026-06-25 09:00:00', '2026-06-25 17:00:00', 'present'),
(5, '2026-06-25', '2026-06-25 09:00:00', '2026-06-25 17:00:00', 'present'),
(1, '2026-06-26', '2026-06-26 09:00:00', '2026-06-26 17:00:00', 'present'),
(2, '2026-06-26', '2026-06-26 09:00:00', '2026-06-26 17:00:00', 'present'),
(3, '2026-06-26', '2026-06-26 09:00:00', '2026-06-26 17:00:00', 'present'),
(4, '2026-06-26', '2026-06-26 09:00:00', '2026-06-26 17:00:00', 'present'),
(5, '2026-06-26', '2026-06-26 09:00:00', '2026-06-26 17:00:00', 'present'),
(1, '2026-06-27', '2026-06-27 09:00:00', '2026-06-27 17:00:00', 'present'),
(2, '2026-06-27', '2026-06-27 09:00:00', '2026-06-27 17:00:00', 'present'),
(3, '2026-06-27', '2026-06-27 09:00:00', '2026-06-27 17:00:00', 'present'),
(4, '2026-06-27', '2026-06-27 09:00:00', '2026-06-27 13:00:00', 'half_day'),
(5, '2026-06-27', '2026-06-27 09:00:00', '2026-06-27 17:00:00', 'present'),
(1, '2026-06-28', '2026-06-28 09:00:00', '2026-06-28 17:00:00', 'present'),
(2, '2026-06-28', '2026-06-28 09:00:00', '2026-06-28 17:00:00', 'present'),
(3, '2026-06-28', '2026-06-28 09:00:00', '2026-06-28 17:00:00', 'present'),
(4, '2026-06-28', '2026-06-28 09:00:00', '2026-06-28 17:00:00', 'present'),
(5, '2026-06-28', '2026-06-28 09:00:00', '2026-06-28 17:00:00', 'present'),
(1, '2026-06-29', '2026-06-29 09:00:00', '2026-06-29 17:00:00', 'present'),
(2, '2026-06-29', '2026-06-29 09:00:00', '2026-06-29 17:00:00', 'present'),
(3, '2026-06-29', '2026-06-29 09:00:00', '2026-06-29 17:00:00', 'present'),
(4, '2026-06-29', '2026-06-29 09:00:00', '2026-06-29 17:00:00', 'present'),
(5, '2026-06-29', '2026-06-29 09:00:00', '2026-06-29 17:00:00', 'present'),
(1, '2026-06-30', '2026-06-30 09:00:00', '2026-06-30 17:00:00', 'present'),
(2, '2026-06-30', '2026-06-30 09:00:00', '2026-06-30 17:00:00', 'present'),
(3, '2026-06-30', '2026-06-30 09:00:00', '2026-06-30 17:00:00', 'present'),
(4, '2026-06-30', '2026-06-30 09:00:00', '2026-06-30 17:00:00', 'present'),
(5, '2026-06-30', '2026-06-30 09:00:00', '2026-06-30 17:00:00', 'present'),
(1, '2026-07-01', NULL, NULL, 'on_leave'),
(2, '2026-07-01', '2026-07-01 09:00:00', '2026-07-01 17:00:00', 'present'),
(3, '2026-07-01', '2026-07-01 09:00:00', '2026-07-01 17:00:00', 'present'),
(4, '2026-07-01', '2026-07-01 09:00:00', '2026-07-01 17:00:00', 'present'),
(5, '2026-07-01', '2026-07-01 09:00:00', '2026-07-01 17:00:00', 'present'),
(1, '2026-07-02', NULL, NULL, 'on_leave'),
(2, '2026-07-02', '2026-07-02 09:00:00', '2026-07-02 17:00:00', 'present'),
(3, '2026-07-02', '2026-07-02 09:00:00', '2026-07-02 17:00:00', 'present'),
(4, '2026-07-02', '2026-07-02 09:00:00', '2026-07-02 17:00:00', 'present'),
(5, '2026-07-02', '2026-07-02 09:00:00', '2026-07-02 17:00:00', 'present'),
(1, '2026-07-03', NULL, NULL, 'on_leave'),
(2, '2026-07-03', '2026-07-03 09:00:00', '2026-07-03 17:00:00', 'present'),
(3, '2026-07-03', '2026-07-03 09:00:00', '2026-07-03 17:00:00', 'present'),
(4, '2026-07-03', '2026-07-03 09:00:00', '2026-07-03 17:00:00', 'present'),
(5, '2026-07-03', '2026-07-03 09:00:00', '2026-07-03 17:00:00', 'present'),
(1, '2026-07-04', NULL, NULL, 'on_leave'),
(2, '2026-07-04', '2026-07-04 09:00:00', '2026-07-04 17:00:00', 'present'),
(3, '2026-07-04', '2026-07-04 09:00:00', '2026-07-04 17:00:00', 'present'),
(4, '2026-07-04', '2026-07-04 09:00:00', '2026-07-04 17:00:00', 'present'),
(5, '2026-07-04', '2026-07-04 09:00:00', '2026-07-04 17:00:00', 'present'),
(1, '2026-07-05', NULL, NULL, 'on_leave'),
(2, '2026-07-05', '2026-07-05 09:00:00', '2026-07-05 17:00:00', 'present'),
(3, '2026-07-05', '2026-07-05 09:00:00', '2026-07-05 17:00:00', 'present'),
(4, '2026-07-05', '2026-07-05 09:00:00', '2026-07-05 17:00:00', 'present'),
(5, '2026-07-05', '2026-07-05 09:00:00', '2026-07-05 17:00:00', 'present'),
(1, '2026-07-06', '2026-07-06 09:00:00', '2026-07-06 17:00:00', 'present'),
(2, '2026-07-06', '2026-07-06 09:00:00', '2026-07-06 17:00:00', 'present'),
(3, '2026-07-06', '2026-07-06 09:00:00', '2026-07-06 17:00:00', 'present'),
(4, '2026-07-06', '2026-07-06 09:00:00', '2026-07-06 17:00:00', 'present'),
(5, '2026-07-06', '2026-07-06 09:00:00', '2026-07-06 17:00:00', 'present'),
(1, '2026-07-07', '2026-07-07 09:00:00', '2026-07-07 17:00:00', 'present'),
(2, '2026-07-07', '2026-07-07 09:00:00', '2026-07-07 17:00:00', 'present'),
(3, '2026-07-07', '2026-07-07 09:00:00', '2026-07-07 17:00:00', 'present'),
(4, '2026-07-07', '2026-07-07 09:00:00', '2026-07-07 17:00:00', 'present'),
(5, '2026-07-07', '2026-07-07 09:00:00', '2026-07-07 17:00:00', 'present'),
(1, '2026-07-08', '2026-07-08 09:00:00', '2026-07-08 17:00:00', 'present'),
(2, '2026-07-08', '2026-07-08 09:00:00', '2026-07-08 17:00:00', 'present'),
(3, '2026-07-08', '2026-07-08 09:00:00', '2026-07-08 17:00:00', 'present'),
(4, '2026-07-08', '2026-07-08 09:00:00', '2026-07-08 17:00:00', 'present'),
(5, '2026-07-08', '2026-07-08 09:00:00', '2026-07-08 17:00:00', 'present'),
(1, '2026-07-09', '2026-07-09 09:00:00', '2026-07-09 17:00:00', 'present'),
(2, '2026-07-09', '2026-07-09 09:00:00', '2026-07-09 17:00:00', 'present'),
(3, '2026-07-09', '2026-07-09 09:00:00', '2026-07-09 17:00:00', 'present'),
(4, '2026-07-09', '2026-07-09 09:00:00', '2026-07-09 17:00:00', 'present'),
(5, '2026-07-09', '2026-07-09 09:00:00', '2026-07-09 17:00:00', 'present'),
(1, '2026-07-10', '2026-07-10 09:00:00', '2026-07-10 17:00:00', 'present'),
(2, '2026-07-10', '2026-07-10 09:00:00', '2026-07-10 17:00:00', 'present'),
(3, '2026-07-10', '2026-07-10 09:00:00', '2026-07-10 17:00:00', 'present'),
(4, '2026-07-10', '2026-07-10 09:00:00', '2026-07-10 17:00:00', 'present'),
(5, '2026-07-10', '2026-07-10 09:00:00', '2026-07-10 17:00:00', 'present'),
(1, '2026-07-11', '2026-07-11 09:00:00', '2026-07-11 17:00:00', 'present'),
(2, '2026-07-11', '2026-07-11 09:00:00', '2026-07-11 17:00:00', 'present'),
(3, '2026-07-11', '2026-07-11 09:00:00', '2026-07-11 17:00:00', 'present'),
(4, '2026-07-11', '2026-07-11 09:00:00', '2026-07-11 17:00:00', 'present'),
(5, '2026-07-11', '2026-07-11 09:00:00', '2026-07-11 17:00:00', 'present');

-- ==========================================
-- 16. Insert Enterprise Leave Requests
-- Current Date Context: 2026-07-12
-- ==========================================
INSERT IGNORE INTO leave_requests (id, employee_id, type, start_date, end_date, reason, status, reviewed_by) VALUES
-- Approved Leaves (Past and Future)
(1, 1, 'annual', '2026-06-20', '2026-06-24', 'Family vacation to Kerala', 'approved', 2),
(2, 4, 'sick', '2026-07-02', '2026-07-03', 'Viral fever', 'approved', 2),
(3, 7, 'annual', '2026-07-15', '2026-07-20', 'Attending sister\'s wedding', 'approved', 2),
(4, 10, 'sick', '2026-06-15', '2026-06-15', 'Dental emergency', 'approved', 2),
(5, 12, 'annual', '2026-08-01', '2026-08-10', 'Hometown visit', 'approved', 2),
(6, 15, 'unpaid', '2026-06-05', '2026-06-06', 'Personal work', 'approved', 2),
(7, 18, 'sick', '2026-07-08', '2026-07-09', 'Food poisoning', 'approved', 2),
(8, 20, 'annual', '2026-07-25', '2026-07-28', 'Short getaway', 'approved', 2),
(9, 22, 'maternity', '2026-05-01', '2026-10-31', 'Maternity leave as per policy', 'approved', 2),
(10, 25, 'other', '2026-06-18', '2026-06-18', 'Exam duty', 'approved', 2),

-- Pending Leaves (Currently waiting for HR review)
(11, 2, 'annual', '2026-08-15', '2026-08-20', 'Planning a trip to Goa', 'pending', NULL),
(12, 5, 'sick', '2026-07-13', '2026-07-14', 'Severe migraine', 'pending', NULL),
(13, 8, 'unpaid', '2026-07-16', '2026-07-16', 'Bank work', 'pending', NULL),
(14, 14, 'annual', '2026-09-01', '2026-09-05', 'Attending a conference in Delhi', 'pending', NULL),
(15, 17, 'other', '2026-07-20', '2026-07-20', 'House shifting', 'pending', NULL),

-- Rejected Leaves (Denied by HR/Management)
(16, 3, 'annual', '2026-07-10', '2026-07-12', 'Weekend extension', 'rejected', 2),
(17, 6, 'unpaid', '2026-07-05', '2026-07-07', 'Going out of station', 'rejected', 2),
(18, 9, 'annual', '2026-08-12', '2026-08-18', 'Trip with friends (Insufficient leave balance)', 'rejected', 2),
(19, 11, 'sick', '2026-06-25', '2026-06-26', 'Stomach ache (Medical certificate not provided)', 'rejected', 2),
(20, 13, 'other', '2026-07-14', '2026-07-15', 'Cousin\'s birthday', 'rejected', 2);

-- ==========================================
-- Insert Dummy Payroll Records (June 2026)
-- ==========================================
INSERT IGNORE INTO payroll (id, employee_id, month, year, basic_salary, allowances, deductions, net_salary, status, payment_date) VALUES
(1, 1, 6, 2026, 120000.00, 15000.00, 5000.00, 130000.00, 'paid', '2026-06-30'),
(2, 2, 6, 2026, 85000.00, 10000.00, 2000.00, 93000.00, 'paid', '2026-06-30'),
(3, 3, 6, 2026, 95000.00, 12000.00, 3000.00, 104000.00, 'paid', '2026-06-30'),
(4, 4, 6, 2026, 60000.00, 5000.00, 1000.00, 64000.00, 'paid', '2026-06-30'),
(5, 5, 6, 2026, 55000.00, 4000.00, 1000.00, 58000.00, 'paid', '2026-06-30'),
(6, 6, 6, 2026, 58000.00, 4500.00, 1200.00, 61300.00, 'paid', '2026-06-30'),
(7, 7, 6, 2026, 70000.00, 8000.00, 2500.00, 75500.00, 'paid', '2026-06-30'),
(8, 8, 6, 2026, 45000.00, 3000.00, 500.00, 47500.00, 'paid', '2026-06-30'),
(9, 9, 6, 2026, 46000.00, 3500.00, 600.00, 48900.00, 'paid', '2026-06-30'),
(10, 10, 6, 2026, 48000.00, 4000.00, 800.00, 51200.00, 'paid', '2026-06-30'),

-- Insert Dummy Payroll Records (July 2026 - Draft/Processing)
(11, 1, 7, 2026, 120000.00, 15000.00, 5000.00, 130000.00, 'processing', NULL),
(12, 2, 7, 2026, 85000.00, 10000.00, 2000.00, 93000.00, 'processing', NULL),
(13, 3, 7, 2026, 95000.00, 12000.00, 3000.00, 104000.00, 'draft', NULL),
(14, 4, 7, 2026, 60000.00, 5000.00, 1000.00, 64000.00, 'draft', NULL),
(15, 5, 7, 2026, 55000.00, 4000.00, 1000.00, 58000.00, 'draft', NULL);

-- ==========================================
-- 17. Insert Enterprise Notifications
-- Current Date Context: 2026-07-12
-- ==========================================
INSERT IGNORE INTO notifications (id, user_id, title, message, is_read) VALUES
-- Welcome Notifications (New Employees)
(1, 24, 'Welcome to TransitOps Global Enterprise', 'Your account has been successfully created. Please update your profile information and read the employee handbook.', 0),
(2, 25, 'Welcome to TransitOps Global Enterprise', 'Your account has been successfully created. Please update your profile information and read the employee handbook.', 1),

-- Leave Approval & Rejection Notifications
(3, 1, 'Leave Request Approved', 'Your annual leave request from 2026-06-20 to 2026-06-24 has been approved by HR.', 1),
(4, 4, 'Leave Request Approved', 'Your sick leave request for 2026-07-02 has been approved. Take care!', 1),
(5, 3, 'Leave Request Rejected', 'Your annual leave request from 2026-07-10 to 2026-07-12 was rejected. Reason: Weekend extension not permitted without prior approval.', 0),
(6, 6, 'Leave Request Rejected', 'Your unpaid leave request for 2026-07-05 was rejected due to staff shortage during that period.', 0),

-- Driver License Expiry Alerts (To Fleet Manager and Driver)
(7, 3, 'ACTION REQUIRED: Driver License Expiring Soon', 'Driver Arjun Yadav (Emp ID: 8) has a driving license expiring on 2026-06-01. Immediate renewal required.', 0),
(8, 10, 'URGENT: Your License Expires Soon', 'Your driving license (DL-IND-MH-003) is set to expire on 2026-07-18. Please submit your renewal documents to HR immediately.', 0),

-- Vehicle Insurance & PUC Expiry (To Fleet Manager)
(9, 3, 'Vehicle Insurance Expiry Alert', 'Vehicle MH-01-TR-1234 (Tata Marcopolo) insurance expires in 3 days (2026-07-15). Please initiate renewal.', 0),
(10, 3, 'Vehicle PUC Expiry Alert', 'Vehicle KA-03-TR-3456 (Tata Starbus) PUC certificate expires in 5 days (2026-07-17).', 0),

-- Vehicle Maintenance Reminders (To Maintenance Techs)
(11, 16, 'Maintenance Scheduled', 'Vehicle KA-01-TR-9012 (Volvo 9400) is currently flagged for maintenance. Both insurance and PUC have expired.', 0),
(12, 17, 'Routine Checkup Reminder', 'Routine 10,000km checkup required for vehicle DL-02-TR-1122 (Ashok Leyland Cheetah) by end of this week.', 1),

-- Trip Assignments (To Drivers)
(13, 11, 'New Trip Assigned: RT-DEL-JAI-11', 'You have been assigned to route RT-DEL-JAI-11 (Delhi to Jaipur) starting at 2026-07-14 07:00:00.', 0),
(14, 12, 'New Trip Assigned: RT-CHE-BLR-13', 'You have been assigned to route RT-CHE-BLR-13 (Chennai to Bengaluru) starting at 2026-07-14 09:15:00.', 1);

-- ==========================================
-- 18. Insert Maintenance Records
-- Current Date Context: 2026-07-12
-- ==========================================
INSERT IGNORE INTO maintenance_records (id, vehicle_id, type, description, cost, status, start_date, end_date, performed_by) VALUES
(1, 1, 'routine', 'Standard 10,000km oil and filter change', 1500.00, 'completed', '2026-05-15', '2026-05-15', 'AutoCare Express'),
(2, 3, 'repair', 'Replaced worn out brake pads', 3200.50, 'completed', '2026-06-02', '2026-06-03', 'City Mechanics Workshop'),
(3, 5, 'inspection', 'Annual comprehensive safety inspection', 500.00, 'completed', '2026-06-20', '2026-06-20', 'Govt certified inspector'),
(4, 7, 'emergency', 'Engine overheating, radiator replacement', 12500.00, 'completed', '2026-06-28', '2026-07-01', 'Heavy Duty Repairs Inc'),
(5, 9, 'routine', 'Tire rotation and alignment', 800.00, 'completed', '2026-07-05', '2026-07-05', 'TirePro Service Center'),
(6, 11, 'repair', 'Fixing AC compressor', 4500.00, 'in_progress', '2026-07-11', NULL, 'CoolBreeze Auto AC'),
(7, 13, 'routine', 'Battery replacement', 2200.00, 'in_progress', '2026-07-12', NULL, 'AutoCare Express'),
(8, 2, 'inspection', 'Pre-monsoon wiper and light check', 300.00, 'scheduled', '2026-07-15', NULL, 'Internal Team'),
(9, 4, 'repair', 'Suspension overhaul', 8000.00, 'scheduled', '2026-07-18', NULL, 'City Mechanics Workshop'),
(10, 6, 'routine', 'Transmission fluid flush', 2800.00, 'scheduled', '2026-07-22', NULL, 'AutoCare Express');

-- ==========================================
-- 19. Insert Fuel Logs
-- ==========================================
INSERT IGNORE INTO fuel_logs (id, vehicle_id, liters, cost, station, date) VALUES
(1, 1, 45.5, 4500.00, 'HP Petrol Pump, Mumbai', '2026-07-01 10:00:00'),
(2, 2, 60.0, 5800.00, 'Indian Oil, Pune', '2026-07-02 12:30:00'),
(3, 3, 50.2, 4900.00, 'Bharat Petroleum, Bangalore', '2026-07-05 09:15:00'),
(4, 4, 30.0, 2900.00, 'Shell, Hyderabad', '2026-07-10 14:00:00');

-- ==========================================
-- 20. Insert Expenses
-- ==========================================
INSERT IGNORE INTO expenses (id, vehicle_id, driver_id, category, description, amount, date, status) VALUES
(1, 1, 1, 'Toll', 'Mumbai-Pune Expressway Toll', 320.00, '2026-07-02', 'cleared'),
(2, 2, 2, 'Maintenance', 'Puncture Repair', 150.00, '2026-07-05', 'pending'),
(3, NULL, NULL, 'Office Supplies', 'Printer Ink', 450.00, '2026-07-08', 'cleared'),
(4, 4, 4, 'Parking', 'City Center Parking Fee', 50.00, '2026-07-11', 'cleared');

SET FOREIGN_KEY_CHECKS = 1;
