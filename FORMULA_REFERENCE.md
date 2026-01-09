# Formula Reference - Code Implementation Guide

This document provides formulas in a code-friendly format for implementation.

## Notation
- `t` = current time step (0-30)
- `t-1` = previous time step
- `t-delay` = time step delayed by `delay` steps
- Parameters prefixed with `param_` (e.g., `param_initial_skin_integrity`)

## Core Variables

### Skin Barrier Integrity (Row 4)

```javascript
// T0 (initial)
skin_integrity[0] = param_initial_skin_integrity  // 0.75

// T1-T30
skin_integrity[t] = Math.min(skin_integrity[t-1] + actual_repair_rate[t], 1.0)
```

### Skin Graft State (Row 5) - Visual

```javascript
skin_graft_state[t] = skin_integrity[t] >= param_skin_integrity_threshold ? "High" : "Low"
// param_skin_integrity_threshold = 0.85
```

### Base Skin Repair Rate (Row 7)

```javascript
if (skin_integrity[t-1] < param_skin_integrity_threshold) {
    base_repair_rate[t] = param_base_repair_low  // 0.005
} else if (skin_integrity[t-1] < 1.0) {
    base_repair_rate[t] = param_base_repair_high  // 0.01
} else {
    base_repair_rate[t] = 0
}
```

### Bacteria Damage (Row 9)

```javascript
if (bacteria_total_count[t] > param_bacteria_damage_threshold) {
    bacteria_damage[t] = param_bacterial_damage_modifier * (bacteria_total_count[t] - param_bacteria_damage_threshold)
} else {
    bacteria_damage[t] = 0
}
// param_bacteria_damage_threshold = 150.0
// param_bacterial_damage_modifier = 5e-05
```

### Cytokines (PR) Boost (Row 10)

```javascript
let max_repair_needed = Math.max(1 - skin_integrity[t-1] - base_repair_rate[t] + bacteria_damage[t], 0)
pr_boost[t] = Math.min(param_pr_boost_modifier * pr_used_for_healing[t], max_repair_needed)
// param_pr_boost_modifier = 5e-05
```

### Actual Skin Repair Rate (Row 11)

```javascript
actual_repair_rate[t] = base_repair_rate[t] - bacteria_damage[t] + pr_boost[t]
```

## Bacteria Variables

### Bacteria Inflow per Step (Row 24)

```javascript
if (skin_integrity[t-1] < param_skin_integrity_threshold) {
    bacteria_inflow[t] = param_bacterial_inflow_low  // 20.0
} else if (skin_integrity[t-1] < 1.0) {
    bacteria_inflow[t] = param_bacterial_inflow_high  // 5.0
} else {
    bacteria_inflow[t] = 0
}
```

### Bacteria Reproduced per Step (Row 25)

```javascript
bacteria_reproduced[t] = Math.floor(param_bacteria_reproduction_rate * bacteria_total_count[t-1])
// param_bacteria_reproduction_rate = 0.1
```

### Bacteria Removed by Neutrophils per Step (Row 26)

```javascript
bacteria_removed_by_neutrophils[t] = param_bacteria_removal_rate_neutrophils * active_neutrophils_in_burn_site[t]
// param_bacteria_removal_rate_neutrophils = 2.0
```

### Bacteria Removed by Macrophages (M1) per Step (Row 27)

```javascript
bacteria_removed_by_macrophages[t] = param_bacteria_removal_rate_macrophages * active_m1_in_burn_site_after_transform[t]
// param_bacteria_removal_rate_macrophages = 3.0
```

### Bacteria Net Flow per Step (Row 28)

```javascript
bacteria_net_flow[t] = bacteria_inflow[t] + bacteria_reproduced[t] - bacteria_removed_by_neutrophils[t] - bacteria_removed_by_macrophages[t]
```

### Bacteria Total Count (Row 29)

```javascript
// T0 (initial)
bacteria_total_count[0] = 0  // or initial value if set

// T1-T30
bacteria_total_count[t] = Math.max(bacteria_total_count[t-1] + bacteria_net_flow[t], 0)
```

## Neutrophil Variables

### Neutrophils Activated per Step (Row 35)

```javascript
let pi_available_for_neutrophils = pi_before_use_in_blood_vessel[t]
let neutrophils_that_can_be_activated = Math.floor(pi_available_for_neutrophils / param_neutrophil_activation_cost)
neutrophils_activated[t] = Math.min(neutrophils_that_can_be_activated, param_inactive_neutrophils_per_step)
// param_neutrophil_activation_cost = 1.0 (1 PI per neutrophil)
// param_inactive_neutrophils_per_step = 5.0
```

### Active Neutrophils in Transit (Row 36)

```javascript
active_neutrophils_in_transit[t] = active_neutrophils_in_transit[t-1] + neutrophils_activated[t] - active_neutrophils_arrived[t]
```

### Active Neutrophils Arrived per Step (Row 39)

```javascript
let migration_delay = param_neutrophil_migration_steps  // 1.0
if (t >= migration_delay) {
    active_neutrophils_arrived[t] = neutrophils_activated[t - migration_delay]
} else {
    active_neutrophils_arrived[t] = 0
}
```

### Active Neutrophils Expired per Step (Row 40)

```javascript
let expiration_delay = param_neutrophil_expiration_steps  // 3.0
if (t >= expiration_delay) {
    active_neutrophils_expired[t] = active_neutrophils_arrived[t - expiration_delay]
} else {
    active_neutrophils_expired[t] = 0
}
```

### Active Neutrophils in Burn Site (Row 41)

```javascript
active_neutrophils_in_burn_site[t] = active_neutrophils_in_burn_site[t-1] + active_neutrophils_arrived[t] - active_neutrophils_expired[t]
```

### Dead Neutrophils Before Eaten in Burn Site (Row 42)

```javascript
dead_neutrophils_before_eaten[t] = Math.max(
    dead_neutrophils_before_eaten[t-1] + active_neutrophils_expired[t] - dead_neutrophils_eaten_by_m1[t-1] - remaining_dead_neutrophils_eaten[t-1],
    0
)
```

### Active Neutrophils Total Count (Row 44)

```javascript
active_neutrophils_total_count[t] = active_neutrophils_total_count[t-1] + neutrophils_activated[t] - active_neutrophils_expired[t]
```

### Neutrophil Energy per Step (Row 45)

```javascript
neutrophil_energy[t] = param_neutrophil_energy_cost * active_neutrophils_total_count[t]
// param_neutrophil_energy_cost = 10.0
```

## Macrophage Variables

### Macrophage (M1) Activated per Step (Row 48)

```javascript
let pi_remaining_after_neutrophils = pi_before_use_in_blood_vessel[t] - pi_used_for_neutrophil_activation[t]
let activation_cost = param_m1_activation_rate_strong  // if "Strong" = 25.0, if "Weak" = 50.0
let m1_that_can_be_activated = Math.floor(pi_remaining_after_neutrophils / activation_cost)
macrophage_m1_activated[t] = Math.min(m1_that_can_be_activated, param_inactive_m1_per_step)
// param_inactive_m1_per_step = 1.0
```

### Active Macrophage (M1) in Transit (Row 49)

```javascript
active_m1_in_transit[t] = active_m1_in_transit[t-1] + macrophage_m1_activated[t] - active_m1_arrived[t]
```

### Active Macrophage (M1) Arrived per Step (Row 52)

```javascript
let migration_delay = param_m1_migration_steps  // 5.0
if (t >= migration_delay) {
    active_m1_arrived[t] = macrophage_m1_activated[t - migration_delay]
} else {
    active_m1_arrived[t] = 0
}
```

### Active Macrophage (M1) in Burn Site Before Transformed (Row 53)

```javascript
active_m1_before_transform[t] = active_m1_in_burn_site_after_transform[t-1] - active_m1_expired[t-1] + active_m1_arrived[t]
```

### Dead Neutrophils Eaten by Macrophage (M1) per Step (Row 57)

```javascript
let threshold_value = get_m1_m2_threshold_value(param_m1_m2_switch_threshold)
// "Low" = 10, "Medium-Low" = 20, "Medium-High" = 30, "High" = 40
dead_neutrophils_eaten_by_m1[t] = m1_transformed_to_m2[t] * threshold_value
```

### Active Macrophage (M1) Transformed (=M2) per Step (Row 58)

```javascript
let threshold_value = get_m1_m2_threshold_value(param_m1_m2_switch_threshold)
let max_transformation = Math.floor(dead_neutrophils_before_eaten[t] / threshold_value)
m1_transformed_to_m2[t] = Math.min(active_m1_before_transform[t], max_transformation)
```

### Active Macrophage (M1) in Burn Site After Transformed (Row 59)

```javascript
active_m1_in_burn_site_after_transform[t] = active_m1_before_transform[t] - m1_transformed_to_m2[t]
```

### Remaining Dead Neutrophils Eaten by Macrophage (M1) w/o Transformed (Row 60)

```javascript
let threshold_value = get_m1_m2_threshold_value(param_m1_m2_switch_threshold)
if (active_m1_in_burn_site_after_transform[t] > 0 && 
    active_neutrophils_expired[t+1] === 0 && 
    dead_neutrophils_before_eaten[t] < threshold_value) {
    remaining_dead_neutrophils_eaten[t] = dead_neutrophils_before_eaten[t]
} else {
    remaining_dead_neutrophils_eaten[t] = 0
}
```

### Active Macrophage (M2) in Burn Site (Row 61)

```javascript
active_m2_in_burn_site[t] = active_m2_in_burn_site[t-1] + m1_transformed_to_m2[t] - active_m2_expired[t]
```

### Active Macrophage (M1) Expired per Step (Row 62)

```javascript
let total_delay = param_m1_migration_steps + param_macrophage_expiration_steps  // 5 + 15 = 20
if (t >= total_delay) {
    let total_expired = macrophage_m1_activated[t - total_delay]
    active_m1_expired[t] = total_expired - active_m2_expired[t]
} else {
    active_m1_expired[t] = 0
}
```

### Active Macrophage (M2) Expired per Step (Row 63)

```javascript
let expiration_delay = param_macrophage_expiration_steps  // 15.0
if (t >= expiration_delay) {
    active_m2_expired[t] = m1_transformed_to_m2[t - expiration_delay]
} else {
    active_m2_expired[t] = 0
}
```

### Active Macrophage (M1+M2) Total Count (Row 65)

```javascript
active_macrophages_total_count[t] = active_m1_in_burn_site_after_transform[t] + active_m2_in_burn_site[t]
```

### Macrophage Energy per Step (Row 66)

```javascript
macrophage_energy[t] = param_macrophage_energy_cost * active_macrophages_total_count[t]
// param_macrophage_energy_cost = 20.0
```

## Cytokine Variables

### Cytokines (PI) Produced by Burn Site per Step (Row 70)

```javascript
if (skin_integrity[t-1] < param_skin_integrity_threshold) {
    pi_produced_by_burn_site[t] = param_pi_production_burn_site_low  // 3.0
} else if (skin_integrity[t-1] < 1.0) {
    pi_produced_by_burn_site[t] = param_pi_production_burn_site_high  // 1.0
} else {
    pi_produced_by_burn_site[t] = 0
}
```

### Cytokines (PI) Produced by Neutrophils per Step (Row 71)

```javascript
pi_produced_by_neutrophils[t] = param_pi_production_neutrophils * active_neutrophils_in_burn_site[t]
// param_pi_production_neutrophils = 3.0
```

### Cytokines (PI) Produced by Macrophages (M1) per Step (Row 72)

```javascript
pi_produced_by_m1[t] = param_pi_production_m1 * active_m1_in_burn_site_after_transform[t]
// param_pi_production_m1 = 5.0
```

### Cytokines (PI) Production Inhibited by Cytokines (PR) (Row 73)

```javascript
let total_pi_production = pi_produced_by_neutrophils[t] + pi_produced_by_m1[t]
if (total_pi_production === 0) {
    pi_inhibition[t] = 0
} else {
    pi_inhibition[t] = pr_used_for_inflammation_soothing[t] / total_pi_production
}
```

### Cytokines (PI) Total Production per Step (Row 74)

```javascript
let total_production = pi_produced_by_burn_site[t] + pi_produced_by_neutrophils[t] + pi_produced_by_m1[t]
pi_total_production[t] = Math.floor(total_production * (1 - pi_inhibition[t]))
```

### Cytokines (PI) in Transit (Row 75)

```javascript
pi_in_transit[t] = pi_in_transit[t-1] + pi_total_production[t] - pi_arrived[t]
```

### Cytokines (PR) Produced per Step (Row 79)

```javascript
if (param_pr_production_rate === "Strong") {
    pr_produced[t] = param_pr_production_rate_strong * active_m2_in_burn_site[t]
    // param_pr_production_rate_strong = 40.0
} else {
    pr_produced[t] = param_pr_production_rate_weak * active_m2_in_burn_site[t]
    // param_pr_production_rate_weak = 20.0
}
```

### Cytokines (PR) Used in Soothing Inflammation (Row 80)

```javascript
let total_pi_production = pi_produced_by_neutrophils[t] + pi_produced_by_m1[t]
pr_used_for_inflammation_soothing[t] = Math.min(pr_produced[t], total_pi_production)
```

### Cytokines (PR) Used in Promoting Healing (Row 81)

```javascript
pr_used_for_healing[t] = pr_produced[t] - pr_used_for_inflammation_soothing[t]
```

### Cytokines (PI) Arrived per Step (Row 84)

```javascript
let migration_delay = get_pi_migration_steps(param_inflammation_signal_speed)
// "Slow" = 3, "Mid" = 2, "Fast" = 1
if (t >= migration_delay) {
    pi_arrived[t] = pi_total_production[t - migration_delay]
} else {
    pi_arrived[t] = 0
}
```

### Cytokines (PI) Before Use in Blood Vessel (Row 85)

```javascript
pi_before_use_in_blood_vessel[t] = pi_left_in_blood_vessel[t-1] + pi_arrived[t]
```

### Cytokines (PI) Used in Neutrophil Activation per Step (Row 86)

```javascript
let pi_for_neutrophils = Math.floor(pi_before_use_in_blood_vessel[t] / param_neutrophil_activation_cost)
let max_neutrophils = param_inactive_neutrophils_per_step
pi_used_for_neutrophil_activation[t] = Math.min(pi_for_neutrophils * param_neutrophil_activation_cost, max_neutrophils * param_neutrophil_activation_cost)
```

### Cytokines (PI) Used in Macrophage (M1) Activation per Step (Row 89)

```javascript
let pi_remaining = pi_before_use_in_blood_vessel[t] - pi_used_for_neutrophil_activation[t]
let activation_cost = param_m1_activation_rate_strong  // if "Strong" = 25.0, if "Weak" = 50.0
let pi_for_m1 = Math.floor(pi_remaining / activation_cost)
let max_m1 = param_inactive_m1_per_step
pi_used_for_m1_activation[t] = Math.min(pi_for_m1 * activation_cost, max_m1 * activation_cost)
```

### Cytokines (PI) Total Arrived by This Step (Row 91)

```javascript
pi_total_arrived[t] = pi_total_arrived[t-1] + pi_arrived[t]
```

### Cytokines (PI) Should Have Gone by Step (Row 92)

```javascript
let expiration_delay = param_pi_expiration_steps  // 3.0
if (t >= expiration_delay) {
    pi_should_have_gone[t] = pi_total_arrived[t - expiration_delay]
} else {
    pi_should_have_gone[t] = 0
}
```

### Cytokines (PI) Actually Gone by This Step (Row 93)

```javascript
pi_actually_gone[t] = pi_actually_gone[t-1] + pi_expired[t-1] + pi_used_for_neutrophil_activation[t] + pi_used_for_m1_activation[t]
```

### Cytokines (PI) Expired per This Step (Row 94)

```javascript
if (pi_should_have_gone[t] > pi_actually_gone[t]) {
    pi_expired[t] = pi_should_have_gone[t] - pi_actually_gone[t]
} else {
    pi_expired[t] = 0
}
```

### Cytokines (PI) Left in Blood Vessel (Row 95)

```javascript
pi_left_in_blood_vessel[t] = pi_left_in_blood_vessel[t-1] + pi_arrived[t] - pi_used_for_neutrophil_activation[t] - pi_used_for_m1_activation[t] - pi_expired[t]
```

### Cytokines (PI) Total Count (Row 97)

```javascript
pi_total_count[t] = pi_in_transit[t] + pi_left_in_blood_vessel[t]
```

## Inflammation Variables

### Inflammation Intensity (Row 13) - Visual

```javascript
if (pi_total_count[t] <= 0) {
    inflammation_intensity[t] = "None"
} else if (pi_total_count[t] < param_inflammation_intensity_threshold) {
    inflammation_intensity[t] = "Moderate"
} else {
    inflammation_intensity[t] = "Severe"
}
// param_inflammation_intensity_threshold = 100.0
```

### Inflammation Signal Speed (Row 17) - Visual

```javascript
if (pi_in_transit[t] > 0) {
    inflammation_signal_speed_visual[t] = param_inflammation_signal_speed
} else {
    inflammation_signal_speed_visual[t] = "None"
}
```

### Inflammation Energy per Step (Row 98)

```javascript
inflammation_energy[t] = param_inflammation_energy_cost * pi_total_count[t]
// param_inflammation_energy_cost = 5.0
```

## Total Energy Use

```javascript
total_energy[t] = neutrophil_energy[t] + macrophage_energy[t] + inflammation_energy[t]
```

## Helper Functions

```javascript
function get_m1_m2_threshold_value(threshold) {
    switch(threshold) {
        case "Low": return 10.0
        case "Medium-Low": return 20.0
        case "Medium-High": return 30.0
        case "High": return 40.0
        default: return 10.0
    }
}

function get_pi_migration_steps(signal_speed) {
    switch(signal_speed) {
        case "Slow": return 3.0
        case "Mid": return 2.0
        case "Fast": return 1.0
        default: return 1.0
    }
}

function get_m1_activation_cost(activation_rate) {
    switch(activation_rate) {
        case "Strong": return 25.0
        case "Weak": return 50.0
        default: return 25.0
    }
}

function get_pr_production_rate(production_rate) {
    switch(production_rate) {
        case "Strong": return 40.0
        case "Weak": return 20.0
        default: return 40.0
    }
}
```

