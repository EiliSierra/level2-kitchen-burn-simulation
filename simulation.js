/**
 * Immune System Simulation Engine
 * Implements all formulas from the spreadsheet analysis
 */

class ImmuneSystemSimulation {
    constructor(parameters) {
        this.params = { ...parameters };
        this.reset();
    }

    reset() {
        const MAX_STEPS = 31; // T0 to T30
        
        // Initialize all state arrays
        this.state = {
            // Skin/Tissue
            skin_integrity: new Array(MAX_STEPS).fill(0),
            skin_graft_state: new Array(MAX_STEPS).fill(''),
            base_repair_rate: new Array(MAX_STEPS).fill(0),
            bacteria_damage: new Array(MAX_STEPS).fill(0),
            pr_boost: new Array(MAX_STEPS).fill(0),
            actual_repair_rate: new Array(MAX_STEPS).fill(0),
            
            // Bacteria
            bacteria_inflow: new Array(MAX_STEPS).fill(0),
            bacteria_reproduced: new Array(MAX_STEPS).fill(0),
            bacteria_removed_by_neutrophils: new Array(MAX_STEPS).fill(0),
            bacteria_removed_by_macrophages: new Array(MAX_STEPS).fill(0),
            bacteria_net_flow: new Array(MAX_STEPS).fill(0),
            bacteria_total_count: new Array(MAX_STEPS).fill(0),
            
            // Neutrophils
            neutrophils_activated: new Array(MAX_STEPS).fill(0),
            active_neutrophils_in_transit: new Array(MAX_STEPS).fill(0),
            active_neutrophils_arrived: new Array(MAX_STEPS).fill(0),
            active_neutrophils_expired: new Array(MAX_STEPS).fill(0),
            active_neutrophils_in_burn_site: new Array(MAX_STEPS).fill(0),
            dead_neutrophils_before_eaten: new Array(MAX_STEPS).fill(0),
            active_neutrophils_total_count: new Array(MAX_STEPS).fill(0),
            neutrophil_energy: new Array(MAX_STEPS).fill(0),
            
            // Macrophages
            macrophage_m1_activated: new Array(MAX_STEPS).fill(0),
            active_m1_in_transit: new Array(MAX_STEPS).fill(0),
            active_m1_arrived: new Array(MAX_STEPS).fill(0),
            active_m1_before_transform: new Array(MAX_STEPS).fill(0),
            dead_neutrophils_eaten_by_m1: new Array(MAX_STEPS).fill(0),
            m1_transformed_to_m2: new Array(MAX_STEPS).fill(0),
            active_m1_in_burn_site_after_transform: new Array(MAX_STEPS).fill(0),
            remaining_dead_neutrophils_eaten: new Array(MAX_STEPS).fill(0),
            active_m2_in_burn_site: new Array(MAX_STEPS).fill(0),
            active_m1_expired: new Array(MAX_STEPS).fill(0),
            active_m2_expired: new Array(MAX_STEPS).fill(0),
            active_macrophages_total_count: new Array(MAX_STEPS).fill(0),
            macrophage_energy: new Array(MAX_STEPS).fill(0),
            
            // Cytokines
            pi_produced_by_burn_site: new Array(MAX_STEPS).fill(0),
            pi_produced_by_neutrophils: new Array(MAX_STEPS).fill(0),
            pi_produced_by_m1: new Array(MAX_STEPS).fill(0),
            pi_inhibition: new Array(MAX_STEPS).fill(0),
            pi_total_production: new Array(MAX_STEPS).fill(0),
            pi_in_transit: new Array(MAX_STEPS).fill(0),
            pr_produced: new Array(MAX_STEPS).fill(0),
            pr_used_for_inflammation_soothing: new Array(MAX_STEPS).fill(0),
            pr_used_for_healing: new Array(MAX_STEPS).fill(0),
            pi_arrived: new Array(MAX_STEPS).fill(0),
            pi_before_use_in_blood_vessel: new Array(MAX_STEPS).fill(0),
            pi_used_for_neutrophil_activation: new Array(MAX_STEPS).fill(0),
            pi_used_for_m1_activation: new Array(MAX_STEPS).fill(0),
            pi_total_arrived: new Array(MAX_STEPS).fill(0),
            pi_should_have_gone: new Array(MAX_STEPS).fill(0),
            pi_actually_gone: new Array(MAX_STEPS).fill(0),
            pi_expired: new Array(MAX_STEPS).fill(0),
            pi_left_in_blood_vessel: new Array(MAX_STEPS).fill(0),
            pi_total_count: new Array(MAX_STEPS).fill(0),
            
            // Inflammation
            inflammation_intensity: new Array(MAX_STEPS).fill(''),
            inflammation_signal_speed_visual: new Array(MAX_STEPS).fill(''),
            inflammation_energy: new Array(MAX_STEPS).fill(0),
            total_energy: new Array(MAX_STEPS).fill(0),
            
            // Energy pool
            available_energy: new Array(MAX_STEPS).fill(0),
            energy_remaining: new Array(MAX_STEPS).fill(0),
            energy_depleted: new Array(MAX_STEPS).fill(false)
        };
        
        // Initialize T0
        this.initializeT0();
    }

    initializeT0() {
        const s = this.state;
        const p = this.params;
        
        // T0 initial values
        s.skin_integrity[0] = p.initial_skin_barrier_integrity;
        s.bacteria_total_count[0] = 0;
        s.active_neutrophils_in_burn_site[0] = 0;
        s.dead_neutrophils_before_eaten[0] = 0;
        s.active_m1_in_burn_site_after_transform[0] = 0;
        s.active_m2_in_burn_site[0] = 0;
        s.pi_left_in_blood_vessel[0] = 0;
        s.pr_used_for_healing[0] = 0;
        
        // Energy pool: start with energy allotment at T0
        const initial_energy = p.energy_allotment_per_step || 460;
        s.available_energy[0] = initial_energy;
        s.energy_remaining[0] = initial_energy;
        s.energy_depleted[0] = false;
        s.total_energy[0] = 0; // No energy use at T0
    }

    // Helper functions
    getM1M2ThresholdValue(threshold) {
        const p = this.params;
        const map = {
            'Low': p.m1_m2_switch_threshold_low || 10.0,
            'Medium-Low': p.m1_m2_switch_threshold_medium_low || 20.0,
            'Medium-High': p.m1_m2_switch_threshold_medium_high || 30.0,
            'High': p.m1_m2_switch_threshold_high || 40.0
        };
        return map[threshold] || 10.0;
    }

    getPIMigrationSteps(signalSpeed) {
        const p = this.params;
        const map = {
            'Slow': p.inflammation_signal_speed_slow_steps || 3.0,
            'Mid': p.inflammation_signal_speed_mid_steps || 2.0,
            'Fast': p.inflammation_signal_speed_fast_steps || 1.0
        };
        return map[signalSpeed] || 1.0;
    }

    getM1ActivationCost(activationRate) {
        const p = this.params;
        const map = {
            'Strong': p.m1_macrophage_activation_rate_strong || 25.0,
            'Weak': p.m1_macrophage_activation_rate_weak || 50.0
        };
        return map[activationRate] || 25.0;
    }

    getPRProductionRate(productionRate) {
        const p = this.params;
        const map = {
            'Strong': p.pr_cytokine_production_rate_strong || 40.0,
            'Weak': p.pr_cytokine_production_rate_weak || 20.0
        };
        return map[productionRate] || 40.0;
    }

    calculateStep(t) {
        if (t === 0) return; // T0 is already initialized
        
        const s = this.state;
        const p = this.params;
        const t_prev = t - 1;

        // 1. Skin repair components
        // Base repair rate
        if (s.skin_integrity[t_prev] < p.skin_integrity_threshold) {
            s.base_repair_rate[t] = p.base_repair_low;
        } else if (s.skin_integrity[t_prev] < 1.0) {
            s.base_repair_rate[t] = p.base_repair_high;
        } else {
            s.base_repair_rate[t] = 0;
        }

        // Bacteria damage (calculated after bacteria count is updated)
        // Will be updated later

        // PR boost (calculated later, but needed here)
        // Will be updated after PR calculation

        // 2. Update skin barrier integrity (temporary, will update after PR boost)
        // s.skin_integrity[t] = Math.min(s.skin_integrity[t_prev] + s.actual_repair_rate[t], 1.0);

        // 3. Bacteria flows
        // Bacteria inflow
        if (s.skin_integrity[t_prev] < p.skin_integrity_threshold) {
            s.bacteria_inflow[t] = p.bacterial_inflow_low;
        } else if (s.skin_integrity[t_prev] < 1.0) {
            s.bacteria_inflow[t] = p.bacterial_inflow_high;
        } else {
            s.bacteria_inflow[t] = 0;
        }

        // Bacteria reproduced
        s.bacteria_reproduced[t] = Math.floor(p.bacteria_reproduction_rate * s.bacteria_total_count[t_prev]);

        // Bacteria removed (calculated after immune cells are updated)
        // Will be updated later

        // 4. PI cytokine production (before migration)
        // PI produced by burn site
        if (s.skin_integrity[t_prev] < p.skin_integrity_threshold) {
            s.pi_produced_by_burn_site[t] = p.pi_production_burn_site_low;
        } else if (s.skin_integrity[t_prev] < 1.0) {
            s.pi_produced_by_burn_site[t] = p.pi_production_burn_site_high;
        } else {
            s.pi_produced_by_burn_site[t] = 0;
        }

        // PI produced by neutrophils and M1 (calculated after immune cells)
        // Will be updated later

        // 5. Calculate PI migration (arrival from previous steps)
        const pi_migration_delay = this.getPIMigrationSteps(p.inflammation_signal_speed);
        if (t >= pi_migration_delay) {
            s.pi_arrived[t] = s.pi_total_production[Math.floor(t - pi_migration_delay)];
        } else {
            s.pi_arrived[t] = 0;
        }

        // PI before use in blood vessel
        s.pi_before_use_in_blood_vessel[t] = s.pi_left_in_blood_vessel[t_prev] + s.pi_arrived[t];

        // 6. Immune cell activation
        // Neutrophil activation
        const pi_for_neutrophils = Math.floor(s.pi_before_use_in_blood_vessel[t] / p.neutrophil_activation_cost);
        const max_neutrophils = p.inactive_neutrophils_per_step;
        s.neutrophils_activated[t] = Math.min(pi_for_neutrophils, max_neutrophils);
        s.pi_used_for_neutrophil_activation[t] = s.neutrophils_activated[t] * p.neutrophil_activation_cost;

        // M1 activation
        const pi_remaining = s.pi_before_use_in_blood_vessel[t] - s.pi_used_for_neutrophil_activation[t];
        const m1_activation_cost = this.getM1ActivationCost(p.m1_macrophage_activation_rate);
        const m1_that_can_be_activated = Math.floor(pi_remaining / m1_activation_cost);
        const max_m1 = p.inactive_m1_per_step;
        s.macrophage_m1_activated[t] = Math.min(m1_that_can_be_activated, max_m1);
        s.pi_used_for_m1_activation[t] = s.macrophage_m1_activated[t] * m1_activation_cost;

        // 7. Immune cell migration
        // Neutrophil arrival
        const neutrophil_migration_delay = p.neutrophil_migration_steps;
        if (t >= neutrophil_migration_delay) {
            s.active_neutrophils_arrived[t] = s.neutrophils_activated[Math.floor(t - neutrophil_migration_delay)];
        } else {
            s.active_neutrophils_arrived[t] = 0;
        }

        // Neutrophil expiration
        const neutrophil_expiration_delay = p.neutrophil_expiration_steps;
        if (t >= neutrophil_expiration_delay) {
            s.active_neutrophils_expired[t] = s.active_neutrophils_arrived[Math.floor(t - neutrophil_expiration_delay)];
        } else {
            s.active_neutrophils_expired[t] = 0;
        }

        // Update neutrophil counts
        s.active_neutrophils_in_transit[t] = s.active_neutrophils_in_transit[t_prev] + s.neutrophils_activated[t] - s.active_neutrophils_arrived[t];
        s.active_neutrophils_in_burn_site[t] = s.active_neutrophils_in_burn_site[t_prev] + s.active_neutrophils_arrived[t] - s.active_neutrophils_expired[t];
        s.active_neutrophils_total_count[t] = s.active_neutrophils_total_count[t_prev] + s.neutrophils_activated[t] - s.active_neutrophils_expired[t];

        // M1 arrival
        const m1_migration_delay = p.m1_migration_steps;
        if (t >= m1_migration_delay) {
            s.active_m1_arrived[t] = s.macrophage_m1_activated[Math.floor(t - m1_migration_delay)];
        } else {
            s.active_m1_arrived[t] = 0;
        }

        // M1 before transform
        s.active_m1_before_transform[t] = s.active_m1_in_burn_site_after_transform[t_prev] - s.active_m1_expired[t_prev] + s.active_m1_arrived[t];

        // M1 expiration (calculated after transformation)
        const m1_total_delay = p.m1_migration_steps + p.macrophage_expiration_steps;
        if (t >= m1_total_delay) {
            const total_expired = s.macrophage_m1_activated[Math.floor(t - m1_total_delay)];
            s.active_m1_expired[t] = total_expired - s.active_m2_expired[t];
        } else {
            s.active_m1_expired[t] = 0;
        }

        // M2 expiration
        const m2_expiration_delay = p.macrophage_expiration_steps;
        if (t >= m2_expiration_delay) {
            s.active_m2_expired[t] = s.m1_transformed_to_m2[Math.floor(t - m2_expiration_delay)];
        } else {
            s.active_m2_expired[t] = 0;
        }

        // 8. M1→M2 transformation
        const threshold_value = this.getM1M2ThresholdValue(p.m1_m2_switch_threshold);
        const max_transformation = Math.floor(s.dead_neutrophils_before_eaten[t_prev] / threshold_value);
        s.m1_transformed_to_m2[t] = Math.min(s.active_m1_before_transform[t], max_transformation);
        s.dead_neutrophils_eaten_by_m1[t] = s.m1_transformed_to_m2[t] * threshold_value;

        // Update M1 after transform
        s.active_m1_in_burn_site_after_transform[t] = s.active_m1_before_transform[t] - s.m1_transformed_to_m2[t];

        // Remaining dead neutrophils eaten
        if (t < 30) { // Check next step's expiration
            const next_expiration = (t + 1 >= neutrophil_expiration_delay) ? 
                s.active_neutrophils_arrived[Math.floor(t + 1 - neutrophil_expiration_delay)] : 0;
            if (s.active_m1_in_burn_site_after_transform[t] > 0 && 
                next_expiration === 0 && 
                s.dead_neutrophils_before_eaten[t_prev] < threshold_value) {
                s.remaining_dead_neutrophils_eaten[t] = s.dead_neutrophils_before_eaten[t_prev];
            } else {
                s.remaining_dead_neutrophils_eaten[t] = 0;
            }
        } else {
            s.remaining_dead_neutrophils_eaten[t] = 0;
        }

        // Update dead neutrophils
        s.dead_neutrophils_before_eaten[t] = Math.max(
            s.dead_neutrophils_before_eaten[t_prev] + s.active_neutrophils_expired[t] - s.dead_neutrophils_eaten_by_m1[t] - s.remaining_dead_neutrophils_eaten[t],
            0
        );

        // Update M2
        s.active_m2_in_burn_site[t] = s.active_m2_in_burn_site[t_prev] + s.m1_transformed_to_m2[t] - s.active_m2_expired[t];
        s.active_macrophages_total_count[t] = s.active_m1_in_burn_site_after_transform[t] + s.active_m2_in_burn_site[t];

        // Update M1 in transit
        s.active_m1_in_transit[t] = s.active_m1_in_transit[t_prev] + s.macrophage_m1_activated[t] - s.active_m1_arrived[t];

        // 9. Bacteria removal (now that immune cells are updated)
        s.bacteria_removed_by_neutrophils[t] = p.bacteria_removal_rate_neutrophils * s.active_neutrophils_in_burn_site[t];
        s.bacteria_removed_by_macrophages[t] = p.bacteria_removal_rate_macrophages * s.active_m1_in_burn_site_after_transform[t];

        // Bacteria net flow
        s.bacteria_net_flow[t] = s.bacteria_inflow[t] + s.bacteria_reproduced[t] - s.bacteria_removed_by_neutrophils[t] - s.bacteria_removed_by_macrophages[t];

        // Update bacteria count
        s.bacteria_total_count[t] = Math.max(s.bacteria_total_count[t_prev] + s.bacteria_net_flow[t], 0);

        // Update bacteria damage (now that bacteria count is known)
        if (s.bacteria_total_count[t] > p.bacteria_damage_threshold) {
            s.bacteria_damage[t] = p.bacterial_damage_modifier * (s.bacteria_total_count[t] - p.bacteria_damage_threshold);
        } else {
            s.bacteria_damage[t] = 0;
        }

        // 10. PI cytokine production (now that immune cells are updated)
        s.pi_produced_by_neutrophils[t] = p.pi_production_neutrophils * s.active_neutrophils_in_burn_site[t];
        s.pi_produced_by_m1[t] = p.pi_production_m1 * s.active_m1_in_burn_site_after_transform[t];

        // 11. PR cytokine production
        const pr_production_rate = this.getPRProductionRate(p.pr_cytokine_production_rate);
        s.pr_produced[t] = pr_production_rate * s.active_m2_in_burn_site[t];

        // PR usage
        const total_pi_production = s.pi_produced_by_neutrophils[t] + s.pi_produced_by_m1[t];
        s.pr_used_for_inflammation_soothing[t] = Math.min(s.pr_produced[t], total_pi_production);
        s.pr_used_for_healing[t] = s.pr_produced[t] - s.pr_used_for_inflammation_soothing[t];

        // PI inhibition
        if (total_pi_production === 0) {
            s.pi_inhibition[t] = 0;
        } else {
            s.pi_inhibition[t] = s.pr_used_for_inflammation_soothing[t] / total_pi_production;
        }

        // PI total production
        const total_pi_prod = s.pi_produced_by_burn_site[t] + s.pi_produced_by_neutrophils[t] + s.pi_produced_by_m1[t];
        s.pi_total_production[t] = Math.floor(total_pi_prod * (1 - s.pi_inhibition[t]));

        // Update PI in transit
        s.pi_in_transit[t] = s.pi_in_transit[t_prev] + s.pi_total_production[t] - s.pi_arrived[t];

        // 12. PR boost (now that PR is calculated)
        const max_repair_needed = Math.max(1 - s.skin_integrity[t_prev] - s.base_repair_rate[t] + s.bacteria_damage[t], 0);
        s.pr_boost[t] = Math.min(p.pr_boost_modifier * s.pr_used_for_healing[t], max_repair_needed);

        // Actual repair rate
        s.actual_repair_rate[t] = s.base_repair_rate[t] - s.bacteria_damage[t] + s.pr_boost[t];

        // Update skin integrity
        s.skin_integrity[t] = Math.min(s.skin_integrity[t_prev] + s.actual_repair_rate[t], 1.0);

        // Skin graft state
        s.skin_graft_state[t] = s.skin_integrity[t] >= p.skin_integrity_threshold ? 'High' : 'Low';

        // 13. PI expiration
        s.pi_total_arrived[t] = s.pi_total_arrived[t_prev] + s.pi_arrived[t];
        
        const pi_expiration_delay = p.pi_expiration_steps;
        if (t >= pi_expiration_delay) {
            s.pi_should_have_gone[t] = s.pi_total_arrived[Math.floor(t - pi_expiration_delay)];
        } else {
            s.pi_should_have_gone[t] = 0;
        }

        s.pi_actually_gone[t] = s.pi_actually_gone[t_prev] + s.pi_expired[t_prev] + s.pi_used_for_neutrophil_activation[t] + s.pi_used_for_m1_activation[t];

        if (s.pi_should_have_gone[t] > s.pi_actually_gone[t]) {
            s.pi_expired[t] = s.pi_should_have_gone[t] - s.pi_actually_gone[t];
        } else {
            s.pi_expired[t] = 0;
        }

        // PI left in blood vessel
        s.pi_left_in_blood_vessel[t] = s.pi_left_in_blood_vessel[t_prev] + s.pi_arrived[t] - s.pi_used_for_neutrophil_activation[t] - s.pi_used_for_m1_activation[t] - s.pi_expired[t];

        // PI total count
        s.pi_total_count[t] = s.pi_in_transit[t] + s.pi_left_in_blood_vessel[t];

        // 14. Inflammation
        if (s.pi_total_count[t] <= 0) {
            s.inflammation_intensity[t] = 'None';
        } else if (s.pi_total_count[t] < p.inflammation_intensity_threshold) {
            s.inflammation_intensity[t] = 'Moderate';
        } else {
            s.inflammation_intensity[t] = 'Severe';
        }

        if (s.pi_in_transit[t] > 0) {
            s.inflammation_signal_speed_visual[t] = p.inflammation_signal_speed;
        } else {
            s.inflammation_signal_speed_visual[t] = 'None';
        }

        // 15. Energy
        s.neutrophil_energy[t] = p.neutrophil_energy_cost * s.active_neutrophils_total_count[t];
        s.macrophage_energy[t] = p.macrophage_energy_cost * s.active_macrophages_total_count[t];
        s.inflammation_energy[t] = p.inflammation_energy_cost * s.pi_total_count[t];
        s.total_energy[t] = s.neutrophil_energy[t] + s.macrophage_energy[t] + s.inflammation_energy[t];
        
        // 16. Energy pool management
        // Add energy allotment at each step T1-T29
        const energy_allotment = p.energy_allotment_per_step || 460;
        if (t >= 1 && t <= 29) {
            s.available_energy[t] = s.energy_remaining[t_prev] + energy_allotment;
        } else {
            s.available_energy[t] = s.energy_remaining[t_prev];
        }
        
        // Consume energy
        if (s.total_energy[t] > s.available_energy[t]) {
            // Energy depleted - simulation should stop
            s.energy_depleted[t] = true;
            s.energy_remaining[t] = 0;
        } else {
            s.energy_depleted[t] = false;
            s.energy_remaining[t] = s.available_energy[t] - s.total_energy[t];
        }
    }

    run() {
        // Calculate all steps, stopping early if energy is depleted
        for (let t = 0; t <= 30; t++) {
            if (t > 0) {
                this.calculateStep(t);
                // Stop if energy is depleted
                if (this.state.energy_depleted[t]) {
                    break;
                }
            }
        }
    }
    
    getLastValidStep() {
        // Find the last step before energy depletion, or return 30
        for (let t = 30; t >= 0; t--) {
            if (!this.state.energy_depleted[t]) {
                return t;
            }
        }
        return 0;
    }

    getStateAtStep(t) {
        return {
            skin_integrity: this.state.skin_integrity[t],
            bacteria_total_count: this.state.bacteria_total_count[t],
            total_energy: this.state.total_energy[t],
            active_neutrophils_in_burn_site: this.state.active_neutrophils_in_burn_site[t],
            dead_neutrophils_before_eaten: this.state.dead_neutrophils_before_eaten[t],
            active_m1_in_burn_site: this.state.active_m1_in_burn_site_after_transform[t],
            active_m2_in_burn_site: this.state.active_m2_in_burn_site[t],
            pi_in_blood_vessel: this.state.pi_left_in_blood_vessel[t],
            pr_in_burn_site: this.state.pr_used_for_healing[t],
            inflammation_intensity: this.state.inflammation_intensity[t],
            inflammation_signal_speed: this.state.inflammation_signal_speed_visual[t],
            available_energy: this.state.available_energy[t],
            energy_remaining: this.state.energy_remaining[t],
            energy_depleted: this.state.energy_depleted[t]
        };
    }
}

