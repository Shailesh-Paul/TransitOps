# TransitOps Database Architecture

This directory contains the database design, schema definitions, seed data, and documentation for the TransitOps Operations Management System.

## Architecture Overview
The database uses a highly normalized (3NF) relational model in MySQL. It is organized into four logical modules:
1. **Access Control & Security**: Users, Roles, Permissions, Role_Permissions.
2. **Human Resources**: Departments, Employees, Attendance, Leave Requests.
3. **Transit Operations**: Vehicles, Routes, Drivers, Trips.
4. **System & Audit**: Notifications, Documents, Audit Logs, Settings.

## Entity Relationship Diagram

```text
roles
  │
  ├─(1:M)── users ──(1:M)── notifications
              │       └──── audit_logs
              │
           (1:1)
              │
          employees ──(M:1)── departments
              │
              ├─(1:M)── attendance
              ├─(1:M)── leave_requests
              │
           (1:1)
              │
           drivers ──(1:M)── trips
                               │
            routes ──(1:M)─────┤
                               │
          vehicles ──(1:M)─────┘

documents (Polymorphic: attaches to employees, vehicles, trips)
settings (Global key-value store)
```

## Normalization (3NF)
- **1NF**: All columns contain scalar, atomic values. No comma-separated lists or JSON arrays for relational data.
- **2NF**: Achieved using auto-incrementing surrogate primary keys (`id`). All non-key attributes depend on the entire primary key.
- **3NF**: Eliminates transitive dependencies. For example, a driver's `license_number` is placed in the `drivers` table rather than the `users` or `employees` table, as it strictly depends on the driver entity.

## Indexing Strategy
To ensure optimal performance as the system scales:
- **Primary & Foreign Keys**: Implicitly indexed by MySQL (InnoDB) for fast `JOIN` resolution and referential integrity checks.
- **`idx_users_email`**: Optimizes authentication queries during login.
- **`idx_employees_name`**: Accelerates employee directory searches using `last_name` and `first_name`.
- **`idx_trips_status` & `idx_trips_start_time`**: Optimizes the primary dispatcher dashboard which frequently queries active or upcoming trips.
- **`idx_audit_logs_entity`**: Optimizes retrieving the history for a specific entity (e.g. all changes for a specific vehicle).

## Security & Best Practices
- **Passwords**: No plain-text passwords. Backends will verify against bcrypt hashes stored in `password_hash`.
- **Soft Deletes**: Major entities (`users`, `employees`, `vehicles`) include a `deleted_at` timestamp rather than permanent physical deletion.
- **Timestamps**: All transactional tables enforce `created_at` and `updated_at` automatically using native MySQL constraints.

## Initialization & Seed Strategy
1. **Schema Initialization**: Run `mysql -u root -p < database/schema.sql` to generate the structure and constraints.
2. **Data Seeding**: Run `mysql -u root -p < database/seed.sql` to insert the initial admin user, default roles, permissions, departments, and system settings.
