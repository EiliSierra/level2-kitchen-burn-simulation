# Level 2 Kitchen Burn - Immune System Simulation Analysis

## Overview

This document provides a comprehensive analysis of the immune system simulation spreadsheet for Level 2 of the educational video game. The simulation models the immune response to a grafted second-degree burn over 30 time steps.

## Simulation Structure

### Time Steps
- **T0**: Initial state (Column H)
- **T1-T30**: Time steps 1-30 (Columns I through AL)
- Total: 31 time points (T0 + 30 steps)

### Input Variables (Columns A-E)

Input parameters are defined in columns A-E, with values stored in column E. These include:

#### Player-Adjustable Variables
1. **Inflammation Signal Speed** (E17): "Fast", "Mid", or "Slow"
   - Controls how quickly cytokines (PI) travel from burn site to blood vessel
   - Affects migration steps: Fast=1, Mid=2, Slow=3

2. **M1/M2 Switch Threshold** (E54): "Low", "Medium-Low", "Medium-High", or "High"
   - Controls how many dead neutrophils must be eaten for M1→M2 transformation
   - Low=10, Medium-Low=20, Medium-High=30, High=40

3. **PR Cytokine Production Rate** (E77): "Strong" or "Weak"
   - Controls M2 macrophage production of PR cytokines
   - Strong=40 per M2, Weak=20 per M2

4. **M1 Macrophage Activation Rate** (E87): "Strong" or "Weak"
   - Controls how much PI cytokine is needed to activate M1 macrophages
   - Strong=25 PI per M1, Weak=50 PI per M1

#### Fixed Parameters
- **Initial skin barrier integrity** (E4): 0.75
- **Skin integrity threshold** (E5): 0.85
- **Base repair rates**: High integrity=0.01, Low integrity=0.005
- **Bacteria damage threshold** (E8): 150.0
- **Bacterial damage modifier** (E9): 5e-05
- **Cytokines (PR) boost modifier** (E10): 5e-05
- **Inflammation intensity threshold** (E13): 100.0
- **Bacterial inflow**: High integrity=5.0, Low integrity=20.0
- **Bacteria reproduction rate** (E25): 0.1
- **Bacteria removal rates**: Neutrophils=2.0, M1 Macrophages=3.0
- **Neutrophil parameters**: 
  - Inactive in blood vessel per step: 5.0
  - Migration steps: 1.0
  - Expiration steps after arrival: 3.0
  - Energy cost: 10.0
- **Macrophage parameters**:
  - Inactive M1 in blood vessel per step: 1.0
  - Migration steps: 5.0
  - Expiration steps: 15.0
  - Energy cost: 20.0
- **Cytokine parameters**:
  - PI production by burn site: High integrity=1.0, Low integrity=3.0
  - PI production by neutrophils: 3.0 per neutrophil
  - PI production by M1 macrophages: 5.0 per M1
  - PI expiration steps: 3.0
- **Inflammation energy cost** (E98): 5.0

## Output Variables (Columns G-AL)

### Key Player-Visible Variables

1. **Skin Barrier Integrity** (Row 4)
   - Range: 0 to 1
   - Formula: `min(previous_integrity + actual_repair_rate, 1)`
   - Initial: 0.75 (from E4)
   - Affected by: repair rate, bacteria damage, PR cytokine boost

2. **Bacteria Total Count** (Row 29)
   - Formula: `max(previous_count + net_flow, 0)`
   - Net flow = inflow + reproduction - removal_by_neutrophils - removal_by_macrophages
   - Affected by: skin integrity (affects inflow), immune cell activity

3. **Energy Use** (Row 98)
   - Formula: `inflammation_energy_cost * PI_total_count`
   - Also includes: Neutrophil energy (Row 45) and Macrophage energy (Row 66)
   - Total energy = Neutrophil energy + Macrophage energy + Inflammation energy

### Variable Categories

#### Skin/Tissue Variables (Rows 4-11)
- **Row 4**: Skin barrier integrity
- **Row 5**: Skin graft state (visual: "High" or "Low")
- **Row 7**: Base skin repair rate (depends on integrity level)
- **Row 9**: Bacteria damage (if bacteria > threshold)
- **Row 10**: Cytokines (PR) boost (promotes healing)
- **Row 11**: Actual skin repair rate = base_repair - bacteria_damage + PR_boost

#### Bacteria Variables (Rows 24-29)
- **Row 24**: Bacteria inflow per step (depends on skin integrity)
- **Row 25**: Bacteria reproduced per step (10% of current count)
- **Row 26**: Bacteria removed by Neutrophils per step (2.0 per neutrophil)
- **Row 27**: Bacteria removed by Macrophages (M1) per step (3.0 per M1)
- **Row 28**: Bacteria net flow = inflow + reproduction - removals
- **Row 29**: Bacteria total count (cumulative)

#### Neutrophil Variables (Rows 35-45)
- **Row 35**: Neutrophils activated per step (from blood vessel, limited by availability)
- **Row 36**: Active neutrophils in transit
- **Row 39**: Active neutrophils arrived per step (after migration delay)
- **Row 40**: Active neutrophils expired per step (after 3 steps active)
- **Row 41**: Active neutrophils in burn site
- **Row 42**: Dead neutrophils before eaten
- **Row 44**: Active neutrophils total count
- **Row 45**: Neutrophil energy per step (10.0 per active neutrophil)

#### Macrophage Variables (Rows 48-66)
- **Row 48**: Macrophage (M1) activated per step
- **Row 49**: Active macrophage (M1) in transit
- **Row 52**: Active macrophage (M1) arrived per step (after 5-step migration)
- **Row 53**: Active macrophage (M1) in burn site before transformation
- **Row 57**: Dead neutrophils eaten by macrophage (M1) per step
- **Row 58**: Active macrophage (M1) transformed to M2 per step
- **Row 59**: Active macrophage (M1) in burn site after transformation
- **Row 60**: Remaining dead neutrophils eaten without transformation
- **Row 61**: Active macrophage (M2) in burn site
- **Row 62**: Active macrophage (M1) expired per step
- **Row 63**: Active macrophage (M2) expired per step (after 15 steps)
- **Row 65**: Active macrophage (M1+M2) total count
- **Row 66**: Macrophage energy per step (20.0 per active macrophage)

#### Cytokine Variables (Rows 70-97)
- **Row 70**: Cytokines (PI) produced by burn site per step
- **Row 71**: Cytokines (PI) produced by neutrophils per step (3.0 per neutrophil)
- **Row 72**: Cytokines (PI) produced by macrophages (M1) per step (5.0 per M1)
- **Row 73**: Cytokines (PI) production inhibited by Cytokines (PR)
- **Row 74**: Cytokines (PI) total production per step (after inhibition)
- **Row 75**: Cytokines (PI) in transit (to blood vessel)
- **Row 79**: Cytokines (PR) produced per step (by M2 macrophages)
- **Row 80**: Cytokines (PR) used in soothing inflammation (inhibits PI production)
- **Row 81**: Cytokines (PR) used in promoting healing (boosts skin repair)
- **Row 84**: Cytokines (PI) arrived per step (after migration delay)
- **Row 85**: Cytokines (PI) before use in blood vessel
- **Row 86**: Cytokines (PI) used in neutrophil activation per step
- **Row 89**: Cytokines (PI) used in macrophage (M1) activation per step
- **Row 91**: Cytokines (PI) total arrived by this step
- **Row 92**: Cytokines (PI) should have gone by step (expiration tracking)
- **Row 93**: Cytokines (PI) actually gone by this step
- **Row 94**: Cytokines (PI) expired per step
- **Row 95**: Cytokines (PI) left in blood vessel
- **Row 97**: Cytokines (PI) total count (in transit + in blood vessel)

#### Inflammation Variables (Rows 13, 17, 98)
- **Row 13**: Inflammation intensity (visual: "None", "Moderate", "Severe")
  - Based on PI total count vs threshold (100.0)
- **Row 17**: Inflammation signal speed (visual state)
- **Row 98**: Inflammation energy per step (5.0 per PI cytokine)

## Formula Patterns and Dependencies

### Time-Delayed Calculations
Many formulas use `INDIRECT(ADDRESS(...))` to reference values from previous time steps, implementing delays:
- **Neutrophil arrival**: References activation from (current_step - migration_steps)
- **Neutrophil expiration**: References arrival from (current_step - expiration_steps)
- **Macrophage arrival**: References activation from (current_step - 5)
- **Macrophage expiration**: References activation/transformation from (current_step - 15)
- **Cytokine arrival**: References production from (current_step - migration_steps based on signal speed)
- **Cytokine expiration**: References arrival from (current_step - 3)

### Key Dependencies

1. **Skin Integrity** depends on:
   - Previous integrity
   - Base repair rate (function of integrity level)
   - Bacteria damage (if bacteria count > 150)
   - PR cytokine boost

2. **Bacteria Count** depends on:
   - Previous count
   - Inflow (function of skin integrity)
   - Reproduction (10% of current count)
   - Removal by neutrophils and M1 macrophages

3. **Neutrophil Activation** depends on:
   - PI cytokines available in blood vessel
   - Limited by inactive neutrophils available (5 per step)

4. **Macrophage M1 Activation** depends on:
   - PI cytokines available after neutrophil activation
   - Activation rate (Strong=25 PI per M1, Weak=50 PI per M1)
   - Limited by inactive M1 available (1 per step)

5. **M1→M2 Transformation** depends on:
   - M1 macrophages present
   - Dead neutrophils available
   - M1/M2 Switch Threshold setting

6. **PI Cytokine Production** depends on:
   - Burn site production (function of skin integrity)
   - Neutrophil count (3.0 per neutrophil)
   - M1 macrophage count (5.0 per M1)
   - Inhibition by PR cytokines

7. **PR Cytokine Production** depends on:
   - M2 macrophage count
   - Production rate setting (Strong=40, Weak=20)

8. **Energy Use** is sum of:
   - Neutrophil energy (10.0 × active neutrophils)
   - Macrophage energy (20.0 × active macrophages)
   - Inflammation energy (5.0 × PI total count)

## Implementation Notes for Web Version

### Data Structure
- Store state for each time step as an object
- Maintain arrays for all variables across time steps
- Track delays using time indices rather than INDIRECT formulas

### Calculation Order (per time step)
1. Calculate skin repair components (base repair, bacteria damage, PR boost)
2. Update skin barrier integrity
3. Calculate bacteria flows (inflow, reproduction, removal)
4. Update bacteria count
5. Calculate PI cytokine production (burn site, neutrophils, M1)
6. Apply PR cytokine inhibition to PI production
7. Calculate PR cytokine production (M2)
8. Calculate PR cytokine usage (inflammation soothing, healing boost)
9. Calculate PI cytokine migration (arrival from previous steps)
10. Calculate immune cell activation (neutrophils, M1 macrophages)
11. Calculate immune cell migration (arrival from previous steps)
12. Calculate immune cell expiration
13. Update immune cell counts
14. Calculate M1→M2 transformation
15. Calculate PI cytokine expiration
16. Calculate energy use
17. Calculate visual states

### Player Controls
- Inflammation Signal Speed: Dropdown (Fast/Mid/Slow)
- M1/M2 Switch Threshold: Dropdown (Low/Medium-Low/Medium-High/High)
- PR Cytokine Production Rate: Dropdown (Strong/Weak)
- M1 Macrophage Activation Rate: Dropdown (Strong/Weak)

### Display Variables
- Skin Barrier Integrity: Progress bar or percentage (0-100%)
- Bacteria Total Count: Number display
- Energy Use: Number display (can show breakdown)
- Additional visual states: Inflammation intensity, Skin graft state

## Formula Reference

See `all_formulas.txt` for complete formula listing for all variables across all time steps.

