/**
 * QA Test Script - Level 2 Kitchen Burn Simulation
 * Tests all 48 combinations of player-adjustable parameters
 *
 * Author: Eili Sierra
 * Date: January 9, 2026
 * Project: Cell Collective - Case 2 Prototype v1
 */

// Import simulation (for Node.js environment)
// If running in browser, simulation.js must be loaded first

// Default parameters (same as app.js)
const TEST_PARAMETERS = {
    initial_skin_barrier_integrity: 0.75,
    skin_integrity_threshold: 0.85,
    base_repair_high: 0.01,
    base_repair_low: 0.005,
    bacteria_damage_threshold: 150.0,
    bacterial_damage_modifier: 5e-05,
    pr_boost_modifier: 5e-05,
    inflammation_intensity_threshold: 100.0,
    bacterial_inflow_high: 5.0,
    bacterial_inflow_low: 20.0,
    bacteria_reproduction_rate: 0.1,
    bacteria_removal_rate_neutrophils: 2.0,
    bacteria_removal_rate_macrophages: 3.0,
    inactive_neutrophils_per_step: 5.0,
    neutrophil_migration_steps: 1.0,
    neutrophil_expiration_steps: 3.0,
    neutrophil_energy_cost: 10.0,
    neutrophil_activation_cost: 1.0,
    inactive_m1_per_step: 1.0,
    m1_migration_steps: 5.0,
    macrophage_expiration_steps: 15.0,
    macrophage_energy_cost: 20.0,
    pi_production_burn_site_high: 1.0,
    pi_production_burn_site_low: 3.0,
    pi_production_neutrophils: 3.0,
    pi_production_m1: 5.0,
    pi_expiration_steps: 3.0,
    inflammation_energy_cost: 5.0,
    energy_allotment_per_step: 470.0,

    // Player-adjustable parameter values
    inflammation_signal_speed_fast_steps: 1.0,
    inflammation_signal_speed_mid_steps: 2.0,
    inflammation_signal_speed_slow_steps: 3.0,
    m1_m2_switch_threshold_low: 10.0,
    m1_m2_switch_threshold_medium_low: 20.0,
    m1_m2_switch_threshold_medium_high: 30.0,
    m1_m2_switch_threshold_high: 40.0,
    pr_cytokine_production_rate_strong: 40.0,
    pr_cytokine_production_rate_weak: 20.0,
    m1_macrophage_activation_rate_strong: 25.0,
    m1_macrophage_activation_rate_weak: 50.0
};

// All possible combinations
const SIGNAL_SPEEDS = ['Slow', 'Mid', 'Fast'];
const SWITCH_THRESHOLDS = ['Low', 'Medium-Low', 'Medium-High', 'High'];
const PR_RATES = ['Strong', 'Weak'];
const M1_RATES = ['Strong', 'Weak'];

// Results storage
const results = [];

/**
 * Run a single test with given parameters
 */
function runTest(testNum, signalSpeed, switchThreshold, prRate, m1Rate) {
    const params = {
        ...TEST_PARAMETERS,
        inflammation_signal_speed: signalSpeed,
        m1_m2_switch_threshold: switchThreshold,
        pr_cytokine_production_rate: prRate,
        m1_macrophage_activation_rate: m1Rate
    };

    const sim = new ImmuneSystemSimulation(params);
    sim.run();

    // Find the last valid step (before energy depletion or T30)
    let lastStep = 30;
    let energyDepleted = false;
    let depletedAtStep = null;

    for (let t = 1; t <= 30; t++) {
        if (sim.state.energy_depleted[t]) {
            energyDepleted = true;
            depletedAtStep = t;
            lastStep = t;
            break;
        }
    }

    // Get final state
    const finalSkin = sim.state.skin_integrity[lastStep];
    const finalBacteria = sim.state.bacteria_total_count[lastStep];
    const finalEnergy = sim.state.energy_remaining[lastStep];

    // Determine win conditions
    const skinHealed = finalSkin >= 0.99;
    const bacteriaEradicated = finalBacteria <= 0.5;
    const reachedT30 = lastStep === 30 && !energyDepleted;

    // A WIN requires: reaching T30, skin healed, bacteria eradicated
    const isWinner = reachedT30 && skinHealed && bacteriaEradicated;

    // Determine failure reason
    let failureReason = '';
    if (!isWinner) {
        if (energyDepleted) {
            failureReason = `Energy depleted at T${depletedAtStep}`;
        } else if (!skinHealed && !bacteriaEradicated) {
            failureReason = 'Skin not healed AND Bacteria not eradicated';
        } else if (!skinHealed) {
            failureReason = 'Skin not healed';
        } else if (!bacteriaEradicated) {
            failureReason = 'Bacteria not eradicated';
        }
    }

    return {
        testNum,
        signalSpeed,
        switchThreshold,
        prRate,
        m1Rate,
        lastStep,
        finalSkin: finalSkin.toFixed(4),
        finalBacteria: finalBacteria.toFixed(2),
        finalEnergy: Math.round(finalEnergy),
        energyDepleted,
        depletedAtStep,
        skinHealed,
        bacteriaEradicated,
        reachedT30,
        isWinner,
        result: isWinner ? 'WIN' : 'FAIL',
        failureReason
    };
}

/**
 * Run all 48 tests
 */
function runAllTests() {
    let testNum = 1;

    console.log('='.repeat(80));
    console.log('QA TEST REPORT - Level 2 Kitchen Burn Simulation');
    console.log('Testing all 48 combinations of player-adjustable parameters');
    console.log('Date:', new Date().toLocaleString());
    console.log('='.repeat(80));
    console.log('');

    // Following the suggested order: start with Slow, then iterate through all
    for (const signalSpeed of SIGNAL_SPEEDS) {
        for (const switchThreshold of SWITCH_THRESHOLDS) {
            for (const prRate of PR_RATES) {
                for (const m1Rate of M1_RATES) {
                    const result = runTest(testNum, signalSpeed, switchThreshold, prRate, m1Rate);
                    results.push(result);

                    // Print result
                    const status = result.isWinner ? '✓ WIN' : '✗ FAIL';
                    console.log(`Test #${String(testNum).padStart(2, '0')}: ${signalSpeed}/${switchThreshold}/${prRate}/${m1Rate}`);
                    console.log(`        Result: ${status} | Stopped at: T${result.lastStep} | Skin: ${result.finalSkin} | Bacteria: ${result.finalBacteria}`);
                    if (!result.isWinner) {
                        console.log(`        Reason: ${result.failureReason}`);
                    }
                    console.log('');

                    testNum++;
                }
            }
        }
    }

    return results;
}

/**
 * Generate summary report
 */
function generateSummary(results) {
    const winners = results.filter(r => r.isWinner);
    const losers = results.filter(r => !r.isWinner);
    const energyDepletions = results.filter(r => r.energyDepleted);
    const skinFailures = results.filter(r => !r.isWinner && !r.energyDepleted && !r.skinHealed);
    const bacteriaFailures = results.filter(r => !r.isWinner && !r.energyDepleted && r.skinHealed && !r.bacteriaEradicated);

    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Total Tests:              ${results.length}`);
    console.log(`Winning Combinations:     ${winners.length} (${(winners.length/results.length*100).toFixed(1)}%)`);
    console.log(`Failed Combinations:      ${losers.length} (${(losers.length/results.length*100).toFixed(1)}%)`);
    console.log('');
    console.log('Failure Breakdown:');
    console.log(`  - Energy Depleted:      ${energyDepletions.length}`);
    console.log(`  - Skin Not Healed:      ${skinFailures.length}`);
    console.log(`  - Bacteria Remaining:   ${bacteriaFailures.length}`);
    console.log('');

    if (winners.length > 0) {
        console.log('='.repeat(80));
        console.log('WINNING COMBINATIONS');
        console.log('='.repeat(80));
        winners.forEach(w => {
            console.log(`  Test #${w.testNum}: ${w.signalSpeed} / ${w.switchThreshold} / ${w.prRate} / ${w.m1Rate}`);
            console.log(`          Final Skin: ${w.finalSkin} | Final Bacteria: ${w.finalBacteria} | Energy: ${w.finalEnergy}`);
        });
        console.log('');
    }

    return {
        total: results.length,
        winners: winners.length,
        losers: losers.length,
        energyDepletions: energyDepletions.length,
        skinFailures: skinFailures.length,
        bacteriaFailures: bacteriaFailures.length,
        winningCombinations: winners
    };
}

/**
 * Generate CSV output
 */
function generateCSV(results) {
    const headers = [
        'Test #',
        'Signal Speed',
        'M1/M2 Threshold',
        'PR Rate',
        'M1 Rate',
        'Stopped At',
        'Final Skin',
        'Final Bacteria',
        'Final Energy',
        'Energy Depleted?',
        'Skin Healed?',
        'Bacteria Eradicated?',
        'Result',
        'Failure Reason'
    ];

    let csv = headers.join(',') + '\n';

    results.forEach(r => {
        const row = [
            r.testNum,
            r.signalSpeed,
            r.switchThreshold,
            r.prRate,
            r.m1Rate,
            `T${r.lastStep}`,
            r.finalSkin,
            r.finalBacteria,
            r.finalEnergy,
            r.energyDepleted ? 'YES' : 'NO',
            r.skinHealed ? 'YES' : 'NO',
            r.bacteriaEradicated ? 'YES' : 'NO',
            r.result,
            `"${r.failureReason}"`
        ];
        csv += row.join(',') + '\n';
    });

    return csv;
}

// Run tests when script is loaded
if (typeof window !== 'undefined') {
    // Browser environment
    window.runAllTests = runAllTests;
    window.generateSummary = generateSummary;
    window.generateCSV = generateCSV;
    window.testResults = [];

    console.log('QA Test Script loaded. Run window.runAllTests() to execute all tests.');
} else {
    // Node.js environment - need to load simulation.js first
    console.log('Please run this script in a browser environment with simulation.js loaded.');
}
