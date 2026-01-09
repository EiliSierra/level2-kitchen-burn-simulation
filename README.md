# Level 2 Kitchen Burn - Immune System Simulation

A web-based simulation of the immune response to a grafted second-degree burn, converted from the original Excel spreadsheet.

## Features

### Designer Backend
- View and edit all fixed simulation parameters
- Adjust numeric values for player-adjustable property settings
- Save parameters to browser localStorage
- Reset to default values

### Player Frontend
- **Adjustable Properties**: Four dropdown controls for:
  - Inflammation Signal Speed (Fast/Mid/Slow)
  - M1/M2 Switch Threshold (Low/Medium-Low/Medium-High/High)
  - PR Cytokine Production Rate (Strong/Weak)
  - M1 Macrophage Activation Rate (Strong/Weak)

- **Simulation Graph**: Real-time visualization of:
  - Skin Barrier Integrity (0-1 scale)
  - Bacteria Total Count
  - Energy Use
  - Neutrophils in Burn Site
  - Dead Neutrophils
  - M1 Macrophages in Burn Site
  - M2 Macrophages in Burn Site
  - PI Cytokines in Blood Vessel
  - PR Cytokines in Burn Site

- **Status Displays**: Read-only displays for:
  - Current Inflammation Signal Speed
  - Current Inflammation Intensity (None/Moderate/Severe)
  - Current Time Step (T0-T30)

- **Time Controls**:
  - **Play**: Start/pause simulation animation
  - **Reset**: Reset simulation to T0
  - **Speed**: Control animation speed (steps per second, default: 1)

## Usage

1. Open `index.html` in a web browser
2. Use the toggle buttons in the top-right to switch between Designer and Player views
3. In Designer view, adjust parameters and click "Save Parameters"
4. In Player view, adjust the four player-adjustable properties
5. Click "Play" to start the simulation
6. Watch the graph update in real-time as the simulation progresses

## Technical Details

- **Simulation Engine**: `simulation.js` - Implements all formulas from the spreadsheet
- **Application Logic**: `app.js` - Handles UI, chart updates, and controls
- **Styling**: `styles.css` - Modern, responsive design
- **Charting**: Chart.js library (loaded via CDN)

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling
- `simulation.js` - Simulation engine with all formulas
- `app.js` - Application logic and UI handling
- `SIMULATION_ANALYSIS.md` - Detailed analysis of the spreadsheet
- `FORMULA_REFERENCE.md` - Code-friendly formula reference
- `ANALYSIS_SUMMARY.md` - Quick reference summary

## Notes

- Parameters are saved to browser localStorage
- Controls are disabled while simulation is running
- Simulation runs for 30 time steps (T0 to T30)
- All calculations match the original spreadsheet formulas

