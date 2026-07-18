# TransitOps

Enterprise Fleet & Financial Operations Management System

## Project Overview

TransitOps is designed to help organizations manage fleet operations, drivers, trips, vehicle maintenance, fuel usage, and financial operations from a centralized platform.

The system replaces manual spreadsheets with an integrated enterprise solution that improves operational efficiency, financial visibility, and decision making.

## Problem Statement

Fleet management often involves scattered data, manual tracking in spreadsheets, and lack of real-time visibility into vehicle health and trip costs. This fragmentation leads to inefficient route planning, delayed maintenance, inaccurate fuel tracking, and opaque financial operations, making it difficult for decision-makers to optimize resources.

## Solution

TransitOps centralizes all fleet operations into a single cohesive web application. It connects vehicle management, driver tracking, trip assignments, maintenance schedules, and financial operations. By unifying these modules, organizations can monitor fleet activity, enforce approval workflows for expenses, track maintenance proactively, and analyze financial performance effectively.

## Key Features

- **Centralized Dashboard**: Real-time overview of fleet operations, active trips, and pending approvals.
- **Vehicle & Driver Allocation**: Map vehicles to qualified drivers and manage schedules.
- **Trip Lifecycle Management**: Track trips from initiation to completion with associated costs.
- **Maintenance Tracking**: Log vehicle maintenance, schedules, and repair expenses.
- **Fuel Monitoring**: Record fuel consumption and track efficiency across the fleet.
- **Expense & Budget Management**: Manage operational costs and track budget allocations.
- **Approval Workflow**: Multi-tier approval system for financial and operational requests.
- **Comprehensive Reporting**: Generate actionable reports and financial analytics.

## System Modules

- **Authentication**: Secure user login with JWT-based sessions.
- **Dashboard**: High-level metrics and system summaries.
- **Vehicle Management**: Inventory and status tracking for all fleet vehicles.
- **Driver Management**: Driver profiles, licensing, and assignment history.
- **Trip Management**: Dispatching, route assignment, and trip status tracking.
- **Maintenance Management**: Preventive and reactive vehicle maintenance logging.
- **Fuel Management**: Fuel entry logs and efficiency tracking.
- **Expense Management**: Logging of operational costs and petty cash transactions.
- **Approval Workflow**: Authorization process for trips and expenses based on user roles.
- **Budget Management**: Allocation and monitoring of departmental budgets.
- **Financial Analytics**: Data visualization for costs, revenues, and efficiency metrics.
- **Notification Center**: Alerts for pending approvals, maintenance due, and trip updates.
- **Reports**: Exportable data summaries for auditing and record-keeping.

## Technology Stack

| Technology | Description |
|---|---|
| ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | Frontend User Interface |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | Frontend Build Tool |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Frontend Styling |
| ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) | Backend Runtime Environment |
| ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat) | Backend Web Framework |
| ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=flat&logo=mysql&logoColor=white) | Relational Database |
| ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens) | Secure Authentication |

## System Architecture

```text
Frontend
       ↓
Backend
       ↓
Business Layer
       ↓
Database
```

## Project Workflow

Users authenticate and are granted access based on their Role-Based Access Control (RBAC) profile. Operators can log vehicles, drivers, and trips. Drivers can log fuel and trip milestones. Managers use the approval workflow to authorize expenses and monitor operations via the dashboard. The backend processes these interactions, applies business logic and validation, and stores the structured data in a relational MySQL database.

## Folder Structure

```text
TransitOps/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── script/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── routes/
    │   ├── services/
    │   ├── store/
    │   ├── styles/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Installation Guide

### Prerequisites
- Node.js
- MySQL

### Clone Repository
```bash
git clone https://github.com/Shailesh-Paul/TransitOps.git
cd TransitOps
```

### Environment Variables
Configure `.env` files for both the frontend and backend. Refer to the Environment Variables section for required keys.

### Run Backend
```bash
cd backend
npm install
npm run dev
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

**Backend**
- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

**Frontend**
- `VITE_API_BASE_URL`

## API Structure

The API is structured in a RESTful manner, organized by module resource.

- `/api/auth`
- `/api/users`
- `/api/vehicles`
- `/api/drivers`
- `/api/trips`
- `/api/maintenance`
- `/api/fuel`
- `/api/expenses`
- `/api/approvals`
- `/api/reports`

## Screenshots

### Dashboard
*(Add Screenshot Here)*

### Vehicle Management
*(Add Screenshot Here)*

### Driver Management
*(Add Screenshot Here)*

### Trip Management
*(Add Screenshot Here)*

### Maintenance Management
*(Add Screenshot Here)*

### Fuel Management
*(Add Screenshot Here)*

### Expense Management
*(Add Screenshot Here)*

## Future Enhancements

- GPS Tracking
- Predictive Maintenance
- OCR Fuel Receipt Processing
- Mobile Application
- AI Insights

## Learning Outcomes

- Designing and optimizing normalized schemas in MySQL.
- Implementing Role-Based Access Control (RBAC) securely using JWT middleware.
- Developing modular RESTful APIs with Express.js and separation of concerns (Controllers, Services).
- State management and side-effect handling in React.js.
- Component-driven UI design and utility-first styling with Tailwind CSS.
- Structuring a monorepo-style Full Stack application.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

MIT
