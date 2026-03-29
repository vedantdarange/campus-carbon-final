# 🌍 Campus Carbon Dashboard

A highly interactive, hyper-immersive GHG (Greenhouse Gas) Footprint Dashboard designed specifically for University Campuses. This platform provides deep insights into campus sustainability metrics across Scope 1, 2, and 3 emissions, featuring complex data visualizations, real-time scenario modeling, and comprehensive analytics.

---

## 🚀 Features

### 📊 Comprehensive Overviews
- **Global Constraints & Navigation**: Persistent top bar for period selection, scope perspectives (Category vs. Scope), and dynamic unit toggling (kg CO₂e ↔ Tonnes).
- **Executive Summary**: High-fidelity dynamic KPI cards tracking Total Emissions, Energy, Transport, Waste, and Per-Capita footprints with trend sparklines.
- **Operations Interactive Map**: Leaflet-powered campus map pinpointing high-intensity emission hotspots with specialized scale-to-intensity markers.

### ⚡ Energy Analytics
- **Facility Deep Dives**: Analyze building-wise power consumption ranking (Electricity vs. Diesel vs. LPG).
- **Consumption Heatmaps**: 12-month calendar intensity matrices showing seasonal power loads across academic and administrative blocks.

### 🚗 Transport & Commuter Flow
- **Modal Shift Simulation**: Real-time modeling of CO₂e savings from shifting solo-drivers to public transit or active commuting.
- **Distance vs. Intensity**: Complex dual-axis grouped bar charts mapping commuting distances against direct emissions.
- **Personal Emission Calculator**: Individual impact assessment widget allowing students/staff to calculate their monthly footprint.

### ♻️ Waste Management
- **Stream Tracking**: Visualize the entire waste hierarchy (Landfill, Recycled, Composted) with animated Doughnut and Stacked Area compositions.
- **Impact Simulators**: Interactive ranges to model the impact of increasing diversion and composting rates, demonstrating real-time CO₂e reduction equivalencies (e.g., "Trees Planted").

### 🏗️ Building Typology Matrix
- **Footprint Bubble Charts**: Analyze the correlation between Floor Area (m²), Energy Intensity (kWh/m²), and total carbon weight.
- **Drilldown Panels**: Interactive sliding panels exposing 12-month multi-source energy breakdowns and emission source splits for individual facilities (from Engineering Labs to Canteens).

### 🔮 AI-Powered Scenario Planner
- **Intervention Controls**: 4 core draggable metrics: Solar Offset, Fleet EV Transition, Generator Reduction, and Composting Expansion.
- **Live Predictive Modeling**: A 12-month forward-looking projection engine visualizing "Business As Usual" against "Projected Savings", dynamically calculating the net gap.
- **Emissions Decomposition Radar**: Pre/Post intervention multi-axis spider charts showing hollistic sustainability shifts.
- **Net Zero Tracker**: Horizontal timeline tracking the campus's trajectory to Net Zero 2035 based on selected interventions.

### ⚙️ Audit & Settings
- **Transparency Engine**: Dedicated interfaces detailing Emission Factors, Data Quality assumptions (Metered vs. Estimated), and a simulated Audit Log for immutability.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) for fluid, utility-first design
- **Data Visualization**: 
  - [Chart.js](https://www.chartjs.org/) & `react-chartjs-2` (highly customized plugins for gradients, floating annotations, and emojis)
  - [D3.js](https://d3js.org/) (Sankey diagrams and complex interpolations)
- **Map Engine**: [Leaflet](https://leafletjs.com/) & `react-leaflet`
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & `react-countup`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment & Tooling**: ESLint, PostCSS, TypeScript

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CodeDev-Parag/Carbon-Emission.git
   cd Carbon-Emission/dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173` (or the port specified in your terminal).

---

## 📂 Project Structure

```text
dashboard/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Layout, Cards, Navigation)
│   ├── pages/              # Core dashboard views
│   │   ├── Overview.tsx    # Executive Summary & Map
│   │   ├── Energy.tsx      # Power grids & Facility Rankings
│   │   ├── Transport.tsx   # Commuter analytics & Modal shifts
│   │   ├── Waste.tsx       # Diversion tracking & flow diagrams
│   │   ├── Buildings.tsx   # High-density drilldowns & Benchmarking
│   │   ├── Scenarios.tsx   # Interactive predictive modeling engine
│   │   └── Settings.tsx    # Assumptions & Emission Factors registry
│   ├── App.tsx             # Root component and Router configuration
│   └── main.tsx            # Application entry point
├── package.json
├── tailwind.config.js      # Custom theme scaling and colors
└── tsconfig.json           # Type configurations
```

---

## 🎨 Design Philosophy

This dashboard strictly adheres to the principles of **Hyper-Immersive Data Visualization**:
- **Continuous Feedback**: Every interaction (slider drag, filter click, sort change) triggers immediate fluid transitions across all connected layout elements.
- **Glassmorphism & Depth**: Utilizing rich dark/light contrasting themes, soft `radial-gradients`, and calculated box-shadows to ensure high readability of dense numbers.
- **Typography & Scale**: Leveraging precise typographic scaling for instant KPI scannability.

---

## 📄 License & Attribution

This is a proprietary interface built for educational sustainability tracking. All mock data represents architectural placeholders and should be replaced by live IoT mapping matrices in production.
