# EXAMGUARD
> **"Don't just schedule exams. Make them resilient."**  
> *Intelligent Examination Operations & Self-Healing Scheduling Platform*

---

## 🏆 Hackathon Overview

Traditional academic scheduling systems are **static and brittle**: they compute a timetable once, but collapse the moment real-world campus disruptions strike on exam day—a blown HVAC in Hall B, an emergency proctor absence, or an unscheduled influx of repeater students. Administrators are forced to manually scramble, risking timetable clashes, hall capacity violations, and student panic.

**EXAMGUARD** introduces **Autonomous Self-Healing Examination Operations**:
1. **Dynamic Master Scheduling**: Generates conflict-free timetable allocations respecting 10 hard and 10 soft constraints.
2. **Continuous Resilience Scoring**: Evaluates an active **0–100 Exam Resilience Score** across capacity buffers, proctor equity, backup readiness, and fault tolerance.
3. **Minimum-Disruption Self-Healing Repair**: When a hall or faculty member is compromised, EXAMGUARD does *not* regenerate the entire timetable; it computes and compares multiple candidate solutions and applies the **minimum-perturbation repair** in milliseconds with **0 student timetable clashes**.
4. **What-If Simulation Sandbox**: Clones the live state into an isolated sandbox to model multi-hall failures, student surges, and staff shortages without touching production.
5. **Schedule Digital Twin**: Interconnected topological graph tracing physical and operational dependencies between examination halls, course papers, student cohorts, and proctor faculty.
6. **Smart Anti-Cheating Seating & Accessibility**: Checkerboard matrix dispersion, department alternating, and guaranteed ground-floor placement for candidates with wheelchair or mobility constraints.
7. **Exam Day Command Center & QR Verification**: Real-time attendance telemetry, live field incident dispatch, and student admit card QR verification.

---

## ⚡ Why EXAMGUARD Is Different

| Feature | Traditional Timetable Tools | EXAMGUARD |
| :--- | :--- | :--- |
| **Reaction to Disruption** | Manual re-entry or global wipe & regenerate | **Algorithmic Self-Healing** with minimum perturbation |
| **Fault Modeling** | None (pure static schedule) | **What-If Simulator** with isolated sandbox cloning |
| **Conflict Explanations** | Generic "Constraint Error" message | **Explainable Conflicts** with root causes, impacts & 1-click fixes |
| **Platform Health Metric** | Binary pass / fail | **Dynamic 0–100 Resilience Score** across 6 operational dimensions |
| **System Visibility** | Tabular spreadsheets | **Topological Digital Twin** dependency graph |
| **Accessibility Compliance** | Manual afterthought | **Strict Ground-Floor Heuristic** & Front-row ramp reservations |
| **Field Verification** | Paper rosters | **Digital Admit QR Verification** & Proctor portal |

---

## 📐 System Architecture & Constraint Model

```
src/
├── components/          # Reusable UI widgets, Navbar, Sidebar, Modals
│   ├── Navbar.jsx               # Global search, disaster trigger, undo/redo, theme
│   ├── Sidebar.jsx              # Navigation hierarchy, platform health meter
│   ├── QuickDisasterModal.jsx   # Flagship judge disaster demonstration
│   ├── GlobalSearchModal.jsx    # Instant Ctrl+K search across all resources
│   └── ConflictModal.jsx        # Explainable conflict viewer & auto-fixer
├── engine/              # Pure Algorithmic Engines (Decoupled from UI)
│   ├── scheduler.js             # Best-fit bin packing & multi-slot allocation
│   ├── validator.js             # Hard & soft constraint verification
│   ├── repairEngine.js          # Minimum-disruption multi-candidate repair
│   ├── resilienceEngine.js      # Dynamic 0–100 Exam Resilience Score
│   ├── conflictEngine.js        # Root cause formatter & single-click repair
│   ├── seatingEngine.js         # Anti-cheating checkerboard & accessibility
│   ├── simulationEngine.js      # Isolated clone sandbox for what-if shocks
│   └── ruleEngine.js            # Natural language rule semantic parser
├── data/
│   └── seedData.js              # Realistic university seed dataset (390+ students)
├── store/
│   └── examStore.js             # Zustand state store with LocalStorage & Undo/Redo
├── layouts/
│   └── MainLayout.jsx           # Master mission-control shell & hotkeys
└── pages/                       # 16 Production-Quality Operations Views
    ├── DashboardPage.jsx        # Command center KPI overview
    ├── SchedulePage.jsx         # Master timetable grid & CSV/JSON export
    ├── SeatingPage.jsx          # Interactive hall desk matrix & risk heatmap
    ├── RecoveryPlaygroundPage.jsx# Interactive "Break The Schedule" suite
    ├── SimulatorPage.jsx        # What-If scenario sandbox
    ├── DigitalTwinPage.jsx      # Interactive topological dependency graph
    ├── ExamDayPage.jsx          # Live telemetry & attendance counters
    ├── IncidentsPage.jsx        # Incident dispatch & resolution
    ├── RuleBuilderPage.jsx      # Natural language policy builder
    ├── AnalyticsPage.jsx        # Recharts multi-day health & fairness charts
    ├── HallsPage.jsx            # Examination hall capacity & status
    ├── InvigilatorsPage.jsx     # Proctor quota & workload bars
    ├── StudentsPage.jsx         # 390+ examinee table with CSV import/export
    ├── ExamsPage.jsx            # Course paper parameters & batches
    ├── InvigilatorPortalPage.jsx# Personal supervisor duty view
    ├── StudentPortalPage.jsx    # Candidate admit card & campus route finder
    ├── VerificationPage.jsx     # QR code seat authenticator
    ├── AuditLogPage.jsx         # Immutable event trail
    └── SettingsPage.jsx         # Platform settings & demo reset
```

---

## 🧠 Constraint Formulation

### Hard Constraints (Enforced with Critical Penalty)
1. **Hall Capacity Bound**: $\forall \text{assignment } a, \quad \text{students}(a) \le \text{capacity}(\text{hall}(a))$.
2. **Hall Non-Overlapping**: A hall cannot host multiple exams in the same slot.
3. **Proctor Non-Overlapping**: An invigilator cannot supervise two halls simultaneously.
4. **Staff Availability**: Proctors on `LEAVE` or `UNAVAILABLE` cannot be assigned.
5. **Student Clash Prevention**: No candidate can have two exams in the same slot.
6. **Full Seat Guarantee**: Every enrolled student receives an authenticated desk.
7. **Accessibility Mandate**: Students with wheelchair or mobility impairment *must* be assigned to ground floor halls (`isGroundFloor: true`) with ramp access.
8. **Proctor Coverage Ratio**: Every hall must meet required proctor ratios (minimum 2, or 3 for capacities $\ge 80$).

### Soft Constraints (Optimized via Objective Scoring)
1. **Invigilator Equity**: Minimize variance in duty allocations across faculty ($\sigma^2 < 0.5$).
2. **Anti-Cheating Dispersion**: Maximize orthogonal distance between candidates taking identical papers or belonging to identical student batches.
3. **Department Neutrality**: Prefer assigning proctors to supervise exams outside their native academic department.
4. **Capacity Headroom**: Maintain a 15–20% spare capacity buffer across active and backup halls.
5. **Minimum Disruption**: During emergency repairs, penalize candidate timetable changes ($10\times$) heavily over room switches ($1\times$).

---

## 📊 Exam Resilience Score Formulation

EXAMGUARD dynamically calculates an aggregate **Resilience Score** ($R \in [0, 100]$):

$$R = \max\left(5, \; \min\left(100, \; \sum_{i=1}^{6} w_i M_i - P_{\text{conflicts}}\right)\right)$$

Where components $M_i$ include:
- **Capacity Buffer** (20%): Headroom in active halls relative to peak slot load.
- **Staff Availability** (20%): Unassigned supervisor shift quota reserve.
- **Backup Capacity** (15%): Ready-to-activate capacity in standby halls (e.g. Hall F301, F302).
- **Schedule Flexibility** (15%): Slack in slot allocations and room distributions.
- **Recovery Capability** (15%): Survivability against single-point failure of the largest hall.
- **Accessibility Coverage** (15%): Percentage of mobility-accommodated examinees properly seated.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the repository
cd CFiesta

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🎯 Step-by-Step Hackathon Judge Demo Flow

To demonstrate EXAMGUARD's capabilities in **3 minutes**:

### Step 1: Open the Platform (0:00 - 0:30)
- Launch the app to view the **EXAMGUARD Mission Control Landing Page**.
- Click **[ ENTER DEMO ]** to load the pristine benchmark scenario:
  - 6 active halls + 2 backup halls
  - 15 invigilators
  - 390 students across 12 batches
  - 4 core examination papers
  - **0 conflicts** and an **Exam Resilience Score of 94/100**.

### Step 2: Test Anti-Cheating Seating (0:30 - 1:00)
- Navigate to **Smart Seating** (`/seating`).
- Inspect the visual hall matrix for **Hall B203**.
- Toggle between **Checkerboard (Dept Alternate)** and **Batch Separation**.
- Click any green or blue seat to view student identity details and **Admit QR Code**.

### Step 3: Trigger Disruption in Recovery Playground (1:00 - 2:00)
- Navigate to **Self-Healing Playground** (`/recovery`) or click **SIMULATE DISASTER** in the top bar.
- Click **[ Disable Hall B203 ]** (100 seats offline due to HVAC failure).
- Observe the **6-stage visual pipeline**:
  $$\text{BREAK} \rightarrow \text{DETECT} \rightarrow \text{ANALYZE} \rightarrow \text{OPTIMIZE} \rightarrow \text{REPAIR} \rightarrow \text{VERIFY}$$
- Review the **Candidate Ranking**:
  - **Option A (Targeted Backup Activation)**: 2 changes, 0 student timetable moves (RECOMMENDED).
  - **Option B (Distributed Hall Splitting)**: 5 changes, 35 student moves.
  - **Option C (Slot Reschedule)**: 12+ changes.
- Read the mathematical **"WHY WAS OPTION A SELECTED?"** explanation.
- Click **[ Apply Selected Candidate ]** to observe instant self-healing with **0 conflicts remaining**.

### Step 4: Explore What-If Simulator & Digital Twin (2:00 - 3:00)
- Navigate to **What-If Simulator** (`/simulator`): test hypothetical staff shocks in the sandbox with side-by-side metric comparison.
- Navigate to **Schedule Digital Twin** (`/digital-twin`): click **Hall B203** to inspect topological connections to examinees, papers, and proctors.
- Test **QR Seat Scanner** (`/verify`): enter roll number `23CSE014` to authenticate candidate desk placement.

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + K`: Global search across students, halls, proctors, papers, and incidents.
- `Ctrl + Z`: Undo last scheduling or resource modification.
- `Ctrl + Y`: Redo reverted state change.
- `G then D`: Navigate to Dashboard.
- `G then S`: Navigate to Master Schedule.
- `G then H`: Navigate to Halls Management.
- `G then I`: Navigate to Invigilators.
- `G then A`: Navigate to Analytics.
- `Esc`: Dismiss active modal.

---

## 🔒 Offline & Data Integrity Guarantee

- **Zero Paid APIs**: Runs 100% locally with client-side heuristics.
- **LocalStorage Persistence**: Schedule state, incidents, rules, and audit logs persist across browser refreshes.
- **Reset Benchmark**: Instant restoration to clean seed benchmark via the "Reset Demo" button.

---

*EXAMGUARD — Built for Hackathons. Engineered for Production.*
