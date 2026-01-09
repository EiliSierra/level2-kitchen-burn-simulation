# Spreadsheet Analysis Summary

## Analysis Complete ✅

I have successfully analyzed the "Level 2 Kitchen Burn.xlsx" spreadsheet and documented the complete simulation model. Here's what I've created:

## Generated Documents

1. **SIMULATION_ANALYSIS.md** - Comprehensive overview of the simulation structure, variables, and relationships
2. **FORMULA_REFERENCE.md** - Code-friendly formula reference with JavaScript-style pseudocode for all calculations
3. **detailed_analysis.json** - Complete JSON export of all formulas and parameters
4. **spreadsheet_analysis.json** - Initial analysis data

## Key Findings

### Simulation Structure
- **30 time steps** (T0-T30) simulated across columns H-AL
- **57 output variables** tracked across time
- **44 input parameters** defined in columns A-E
- **1,681 formulas** implementing the simulation logic

### Player-Adjustable Variables
1. **Inflammation Signal Speed** (E17): Fast/Mid/Slow
   - Controls PI cytokine migration delay (1/2/3 steps)
   
2. **M1/M2 Switch Threshold** (E54): Low/Medium-Low/Medium-High/High
   - Controls dead neutrophils needed for M1→M2 transformation (10/20/30/40)
   
3. **PR Cytokine Production Rate** (E77): Strong/Weak
   - Controls M2 macrophage PR production (40/20 per M2)
   
4. **M1 Macrophage Activation Rate** (E87): Strong/Weak
   - Controls PI needed to activate M1 (25/50 PI per M1)

### Key Output Variables
1. **Skin Barrier Integrity** (Row 4): 0-1 scale, affected by repair, bacteria damage, and PR boost
2. **Bacteria Total Count** (Row 29): Cumulative count affected by inflow, reproduction, and immune cell removal
3. **Energy Use** (Row 98): Sum of neutrophil, macrophage, and inflammation energy costs

### Core Systems Modeled

#### 1. Skin/Tissue System
- Skin barrier integrity with repair mechanisms
- Bacteria damage when count exceeds threshold
- PR cytokine boost for healing

#### 2. Bacteria System
- Inflow rate (depends on skin integrity)
- Reproduction (10% per step)
- Removal by neutrophils (2.0 per neutrophil) and M1 macrophages (3.0 per M1)

#### 3. Neutrophil System
- Activation from blood vessel (limited by PI cytokines and availability)
- Migration delay (1 step)
- Active lifespan (3 steps after arrival)
- Bacteria removal and PI cytokine production

#### 4. Macrophage System
- M1 activation from blood vessel (limited by PI cytokines and availability)
- Migration delay (5 steps)
- M1→M2 transformation based on dead neutrophil consumption
- M1/M2 active lifespan (15 steps)
- Bacteria removal (M1) and PR cytokine production (M2)

#### 5. Cytokine System
- **PI (Pro-Inflammatory)**: Produced by burn site, neutrophils, M1 macrophages
  - Migrates to blood vessel (delay based on signal speed)
  - Used for neutrophil and M1 activation
  - Expires after 3 steps
  - Inhibited by PR cytokines
  
- **PR (Pro-Resolution)**: Produced by M2 macrophages
  - Soothes inflammation (inhibits PI production)
  - Promotes healing (boosts skin repair)

#### 6. Energy System
- Neutrophil energy: 10.0 per active neutrophil
- Macrophage energy: 20.0 per active macrophage
- Inflammation energy: 5.0 per PI cytokine

## Implementation Notes

### Calculation Order
The simulation requires careful ordering of calculations each time step:
1. Skin repair components
2. Skin integrity update
3. Bacteria flows
4. PI cytokine production
5. PR cytokine production and usage
6. PI migration (arrival from previous steps)
7. Immune cell activation
8. Immune cell migration (arrival from previous steps)
9. Immune cell expiration
10. M1→M2 transformation
11. PI expiration
12. Energy calculations

### Time Delays
The simulation uses time-delayed calculations for:
- Cell migration (neutrophils: 1 step, macrophages: 5 steps)
- Cell expiration (neutrophils: 3 steps, macrophages: 15 steps)
- Cytokine migration (1-3 steps based on signal speed)
- Cytokine expiration (3 steps)

### Dependencies
- Skin integrity affects bacteria inflow and PI production
- Bacteria count affects skin damage
- PI cytokines drive immune cell activation
- PR cytokines affect PI production and skin repair
- Dead neutrophils drive M1→M2 transformation
- M2 macrophages produce PR cytokines

## Next Steps for Web Implementation

1. **Data Structure**: Create state objects for each time step
2. **Calculation Engine**: Implement formulas in order of dependencies
3. **Player Controls**: UI for the 4 adjustable parameters
4. **Visualization**: Display key variables (skin integrity, bacteria count, energy)
5. **Time Step Loop**: Run calculations sequentially from T0 to T30

## Files Ready for Reference

- Use `SIMULATION_ANALYSIS.md` for understanding the overall model
- Use `FORMULA_REFERENCE.md` for implementation details
- Use `detailed_analysis.json` for programmatic access to all formulas

All formulas have been extracted and documented. The simulation is ready to be reimplemented in code!

