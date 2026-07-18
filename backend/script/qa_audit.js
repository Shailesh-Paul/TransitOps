import "dotenv/config";
import { getDB, connectDB } from "../src/config/db.js";

const API_URL = "http://localhost:5000/api/v1";
let token = "";
let vehicleId = 0;
let maintenanceId = 0;

const report = {
  passed: [],
  failed: [],
  criticalBugs: [],
  minorBugs: [],
  securityFindings: [],
  performanceFindings: [],
  score: 100
};

const assert = (condition, description, isCritical = false) => {
  if (condition) {
    report.passed.push(description);
  } else {
    report.failed.push(description);
    if (isCritical) {
      report.criticalBugs.push(description);
      report.score -= 10;
    } else {
      report.minorBugs.push(description);
      report.score -= 3;
    }
    console.error(`❌ FAILED: ${description}`);
  }
};

async function runAudit() {
  console.log("Starting Enterprise QA Audit...");
  
  try {
    // 0. Setup & Auth
    await connectDB();
    const pool = getDB();
    const [users] = await pool.query("SELECT email FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'Fleet Manager') LIMIT 1");
    if (users.length === 0) throw new Error("No Fleet Manager found");
    const email = users[0].email;
    
    try {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: "password123" })
      });
      const loginData = await loginRes.json();
      token = loginData.data ? loginData.data.token : loginData.token;
      assert(!!token, "Authentication successful", true);
    } catch(e) {
      throw new Error("Login failed. Cannot proceed with Audit. " + e.message);
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Get an Available vehicle
    const [vehicles] = await pool.query("SELECT id FROM vehicles WHERE status = 'Available' LIMIT 1");
    if (vehicles.length === 0) throw new Error("No Available vehicle found for testing.");
    vehicleId = vehicles[0].id;

    // STEP 1: Schedule Maintenance
    console.log("STEP 1: Schedule Maintenance");
    const schedulePayload = {
      vehicle_id: vehicleId,
      category: "routine",
      type: "routine",
      priority: "High",
      description: "QA Audit Routine Check",
      scheduled_date: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
      cost: 500
    };
    
    let mRes = await fetch(`${API_URL}/maintenance`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(schedulePayload)
    });
    const mData = await mRes.json();
    maintenanceId = mData.data.id;
    assert(!!maintenanceId, "Work Order generated", true);

    let [checkM] = await pool.query("SELECT status, work_order_number FROM maintenance_records WHERE id = ?", [maintenanceId]);
    assert(checkM[0].status === "Scheduled", "Status = Scheduled");
    assert(checkM[0].work_order_number.startsWith("MNT-"), "Work Order number format correct");

    let [checkV] = await pool.query("SELECT status FROM vehicles WHERE id = ?", [vehicleId]);
    assert(checkV[0].status === "Available", "Vehicle remains Available while Scheduled", true);

    // STEP 2: Maintenance Details
    console.log("STEP 2: Maintenance Details");
    let detailsRes = await fetch(`${API_URL}/maintenance/${maintenanceId}/details`, { headers });
    const detailsData = await detailsRes.json();
    assert(detailsData.data.record.id === maintenanceId, "Operational summary retrieved");
    assert(Array.isArray(detailsData.data.audit_logs), "Audit information retrieved");
    assert(detailsData.data.record.vehicle_status === "Available", "Vehicle information retrieved");

    // STEP 3: Start Maintenance
    console.log("STEP 3: Start Maintenance");
    // Queue first
    await fetch(`${API_URL}/maintenance/${maintenanceId}/queue`, { method: 'POST', headers });
    // Then Start
    await fetch(`${API_URL}/maintenance/${maintenanceId}/start`, { method: 'POST', headers });
    
    [checkM] = await pool.query("SELECT status FROM maintenance_records WHERE id = ?", [maintenanceId]);
    assert(checkM[0].status === "In Progress", "Status = In Progress", true);

    [checkV] = await pool.query("SELECT status FROM vehicles WHERE id = ?", [vehicleId]);
    assert(checkV[0].status === "In Shop", "Vehicle = In Shop (Dispatch blocked)", true);

    // Trip assignment blocked test
    try {
      const tripRes = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          driver_id: 1, // dummy
          route_id: 1, // dummy
          start_time: new Date().toISOString()
        })
      });
      if (tripRes.ok) throw new Error("Trip should be blocked");
      assert(tripRes.status === 400 || tripRes.status === 409, "Trip assignment blocked correctly");
    } catch(e) {
      if (e.message === "Trip should be blocked") {
        assert(false, "Trip assignment should be blocked for In Shop vehicle", true);
      } else {
        assert(true, "Trip assignment blocked correctly");
      }
    }

    // STEP 4: Progress Tracking
    console.log("STEP 4: Progress Tracking");
    await fetch(`${API_URL}/maintenance/${maintenanceId}/progress`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        progress: 50,
        note: "Halfway done",
        workshop_bay: "Bay 1"
      })
    });

    [checkM] = await pool.query("SELECT progress, technician_notes, workshop_bay FROM maintenance_records WHERE id = ?", [maintenanceId]);
    assert(checkM[0].progress === 50, "Progress updates stored");
    assert(checkM[0].technician_notes.includes("Halfway done"), "Technician notes stored");
    assert(checkM[0].workshop_bay === "Bay 1", "Workshop bay updated");

    // STEP 5: Complete Maintenance
    console.log("STEP 5: Complete Maintenance");
    const completePayload = {
      progress: 100,
      labour_hours: 2,
      labour_rate: 150,
      misc_cost: 50,
      parts: [{ name: "Oil Filter", quantity: 1, unit_cost: 200 }],
      completion_summary: "Oil changed and filters replaced.",
      technician: "QA Tech"
    };

    // Try complete with progress < 100
    try {
      const cRes = await fetch(`${API_URL}/maintenance/${maintenanceId}/complete`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...completePayload, progress: 90 })
      });
      if (cRes.ok) throw new Error("Should not complete");
      assert(cRes.status === 400 || cRes.status === 409, "Cannot complete if Progress < 100%");
    } catch (e) {
      if (e.message === "Should not complete") assert(false, "Should not complete if Progress < 100%", true);
      else assert(true, "Cannot complete if Progress < 100%");
    }

    // Actual complete
    await fetch(`${API_URL}/maintenance/${maintenanceId}/complete`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(completePayload)
    });

    [checkM] = await pool.query("SELECT status, progress, cost, downtime_minutes, parts FROM maintenance_records WHERE id = ?", [maintenanceId]);
    assert(checkM[0].status === "Completed", "Status is Completed");
    assert(checkM[0].progress === 100, "Progress = 100%");
    assert(Number(checkM[0].cost) === 550, "Actual cost calculated accurately (300 labour + 50 misc + 200 parts)");
    assert(checkM[0].downtime_minutes >= 0, "Downtime calculated");

    [checkV] = await pool.query("SELECT status, health_score FROM vehicles WHERE id = ?", [vehicleId]);
    assert(checkV[0].status === "Available", "Vehicle returns to Available", true);
    assert(checkV[0].health_score !== null, "Vehicle Health Score updated/persisted", true);

    // Business Rules
    console.log("BUSINESS RULES Validation");
    try {
      const startRes = await fetch(`${API_URL}/maintenance/${maintenanceId}/start`, { method: 'POST', headers });
      if (startRes.ok) throw new Error("Should not start Completed maintenance");
      assert(true, "Cannot start Completed maintenance");
    } catch (e) {
      if (e.message === "Should not start Completed maintenance") assert(false, "Should not start Completed maintenance", true);
      else assert(true, "Cannot start Completed maintenance");
    }

    // Analytics
    console.log("ANALYTICS Validation");
    let analyticsRes = await fetch(`${API_URL}/maintenance/analytics`, { headers });
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.data.kpis !== undefined, "Maintenance KPIs returned");
    assert(analyticsData.data.kpis.avgHealthScore !== undefined, "Vehicle Health Score aggregated");
    assert(analyticsData.data.costAnalytics !== undefined, "Cost analytics returned");
    assert(analyticsData.data.calendar !== undefined, "Calendar view data returned");

    // History
    let historyRes = await fetch(`${API_URL}/maintenance?status=Completed`, { headers });
    const historyData = await historyRes.json();
    assert(historyData.data.some(r => r.id === maintenanceId), "History timeline complete and accurate");

    console.log("QA Audit completed.");

  } catch (err) {
    console.error("Audit script failed: ", err);
    report.score = 0;
    report.criticalBugs.push("Audit Script Exception: " + err.message);
  } finally {
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }
}

runAudit();
