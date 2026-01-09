/**
 * Main Application Logic
 * Handles UI, chart updates, parameter management, and simulation controls
 */

// Default parameters (from spreadsheet analysis)
const DEFAULT_PARAMETERS = {
    // Fixed parameters
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
    
    // Player-adjustable parameters
    inflammation_signal_speed: 'Fast',
    m1_m2_switch_threshold: 'Low',
    pr_cytokine_production_rate: 'Strong',
    m1_macrophage_activation_rate: 'Strong'
};

// Parameter metadata for designer view
const PARAMETER_METADATA = {
    // Fixed parameters
    initial_skin_barrier_integrity: { label: 'Initial Skin Barrier Integrity', type: 'number', min: 0, max: 1, step: 0.01 },
    skin_integrity_threshold: { label: 'Skin Integrity Threshold', type: 'number', min: 0, max: 1, step: 0.01 },
    base_repair_high: { label: 'Base Repair (High Integrity)', type: 'number', min: 0, step: 0.001 },
    base_repair_low: { label: 'Base Repair (Low Integrity)', type: 'number', min: 0, step: 0.001 },
    bacteria_damage_threshold: { label: 'Bacteria Damage Threshold', type: 'number', min: 0, step: 1 },
    bacterial_damage_modifier: { label: 'Bacterial Damage Modifier', type: 'number', min: 0, step: 1e-06 },
    pr_boost_modifier: { label: 'Cytokines (PR) Boost Modifier', type: 'number', min: 0, step: 1e-06 },
    inflammation_intensity_threshold: { label: 'Inflammation Intensity Threshold', type: 'number', min: 0, step: 1 },
    bacterial_inflow_high: { label: 'Bacterial Inflow (High Integrity)', type: 'number', min: 0, step: 0.1 },
    bacterial_inflow_low: { label: 'Bacterial Inflow (Low Integrity)', type: 'number', min: 0, step: 0.1 },
    bacteria_reproduction_rate: { label: 'Bacteria Reproduction Rate', type: 'number', min: 0, max: 1, step: 0.01 },
    bacteria_removal_rate_neutrophils: { label: 'Bacteria Removal Rate by Neutrophils', type: 'number', min: 0, step: 0.1 },
    bacteria_removal_rate_macrophages: { label: 'Bacteria Removal Rate by Macrophages (M1)', type: 'number', min: 0, step: 0.1 },
    inactive_neutrophils_per_step: { label: 'Inactive Neutrophils in Blood Vessel per Step', type: 'number', min: 0, step: 0.1 },
    neutrophil_migration_steps: { label: 'Neutrophil Migration Steps', type: 'number', min: 0, step: 1 },
    neutrophil_expiration_steps: { label: 'Active Neutrophil Expiration Steps After Arrival', type: 'number', min: 0, step: 1 },
    neutrophil_energy_cost: { label: 'Neutrophil Energy Cost', type: 'number', min: 0, step: 0.1 },
    neutrophil_activation_cost: { label: 'Neutrophil Activation Rate (1 Neutrophil = x PI)', type: 'number', min: 0, step: 0.1 },
    inactive_m1_per_step: { label: 'Inactive Macrophage (M1) in Blood Vessel per Step', type: 'number', min: 0, step: 0.1 },
    m1_migration_steps: { label: 'Macrophage (M1) Migration Steps', type: 'number', min: 0, step: 1 },
    macrophage_expiration_steps: { label: 'Active Macrophage (M1 & M2) Expiration Steps', type: 'number', min: 0, step: 1 },
    macrophage_energy_cost: { label: 'Macrophage Energy Cost', type: 'number', min: 0, step: 0.1 },
    pi_production_burn_site_high: { label: 'Burn Site Cytokines (PI) Production (High Integrity)', type: 'number', min: 0, step: 0.1 },
    pi_production_burn_site_low: { label: 'Burn Site Cytokines (PI) Production (Low Integrity)', type: 'number', min: 0, step: 0.1 },
    pi_production_neutrophils: { label: 'Neutrophil Cytokines (PI) Production', type: 'number', min: 0, step: 0.1 },
    pi_production_m1: { label: 'Macrophage (M1) Cytokines (PI) Production', type: 'number', min: 0, step: 0.1 },
    pi_expiration_steps: { label: 'Cytokines (PI) Expiration Steps After Arrival', type: 'number', min: 0, step: 1 },
    inflammation_energy_cost: { label: 'Inflammation Energy Cost', type: 'number', min: 0, step: 0.1 },
    energy_allotment_per_step: { label: 'Energy Allotment Per Step', type: 'number', min: 0, step: 1 },
    
    // Player-adjustable parameter values
    inflammation_signal_speed_fast_steps: { label: 'PI Migration Steps (Fast)', type: 'number', min: 0, step: 1 },
    inflammation_signal_speed_mid_steps: { label: 'PI Migration Steps (Mid)', type: 'number', min: 0, step: 1 },
    inflammation_signal_speed_slow_steps: { label: 'PI Migration Steps (Slow)', type: 'number', min: 0, step: 1 },
    m1_m2_switch_threshold_low: { label: 'Dead Neutrophils Eaten to Switch (Low)', type: 'number', min: 0, step: 1 },
    m1_m2_switch_threshold_medium_low: { label: 'Dead Neutrophils Eaten to Switch (Medium-Low)', type: 'number', min: 0, step: 1 },
    m1_m2_switch_threshold_medium_high: { label: 'Dead Neutrophils Eaten to Switch (Medium-High)', type: 'number', min: 0, step: 1 },
    m1_m2_switch_threshold_high: { label: 'Dead Neutrophils Eaten to Switch (High)', type: 'number', min: 0, step: 1 },
    pr_cytokine_production_rate_strong: { label: 'Cytokines (PR) Production Rate (Strong)', type: 'number', min: 0, step: 0.1 },
    pr_cytokine_production_rate_weak: { label: 'Cytokines (PR) Production Rate (Weak)', type: 'number', min: 0, step: 0.1 },
    m1_macrophage_activation_rate_strong: { label: 'Macrophage (M1) Activation Rate (Strong)', type: 'number', min: 0, step: 0.1 },
    m1_macrophage_activation_rate_weak: { label: 'Macrophage (M1) Activation Rate (Weak)', type: 'number', min: 0, step: 0.1 }
};

// Extended default parameters for player-adjustable values
const EXTENDED_DEFAULT_PARAMETERS = {
    ...DEFAULT_PARAMETERS,
    energy_allotment_per_step: 470.0,
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

// Application state
let appState = {
    parameters: { ...EXTENDED_DEFAULT_PARAMETERS },
    simulation: null,
    chart: null,
    currentStep: 0,
    isRunning: false,
    animationId: null,
    speed: 1.0, // steps per second
    lastUpdateTime: 0
};

// Randomize player-adjustable parameters on page load
function randomizeAdjustableParameters() {
    const pick = (options) => options[Math.floor(Math.random() * options.length)];
    appState.parameters.inflammation_signal_speed = pick(['Fast', 'Mid', 'Slow']);
    appState.parameters.m1_m2_switch_threshold = pick(['Low', 'Medium-Low', 'Medium-High', 'High']);
    appState.parameters.pr_cytokine_production_rate = pick(['Strong', 'Weak']);
    appState.parameters.m1_macrophage_activation_rate = pick(['Strong', 'Weak']);
}


// Initialize application
function init() {
    loadParameters();
    randomizeAdjustableParameters();
    setupViewToggle();
    setupDesignerView();
    setupPlayerView();
    setupChart();
    resetSimulation();
}

// Load parameters from localStorage
function loadParameters() {
    const saved = localStorage.getItem('simulation_parameters');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState.parameters = { ...EXTENDED_DEFAULT_PARAMETERS, ...parsed };
        } catch (e) {
            console.error('Error loading parameters:', e);
        }
    }
}

// Save parameters to localStorage
function saveParameters() {
    localStorage.setItem('simulation_parameters', JSON.stringify(appState.parameters));
}

// View toggle
function setupViewToggle() {
    document.getElementById('toggle-designer').addEventListener('click', () => {
        document.getElementById('designer-view').classList.add('active');
        document.getElementById('player-view').classList.remove('active');
        document.getElementById('toggle-designer').classList.add('active');
        document.getElementById('toggle-player').classList.remove('active');
    });

    document.getElementById('toggle-player').addEventListener('click', () => {
        document.getElementById('player-view').classList.add('active');
        document.getElementById('designer-view').classList.remove('active');
        document.getElementById('toggle-player').classList.add('active');
        document.getElementById('toggle-designer').classList.remove('active');
    });
}

// Designer view setup
const fixedParamKeys = Object.keys(DEFAULT_PARAMETERS).filter(key => 
    !['inflammation_signal_speed', 'm1_m2_switch_threshold', 'pr_cytokine_production_rate', 'm1_macrophage_activation_rate'].includes(key)
);

const playerParamKeys = [
    'inflammation_signal_speed_fast_steps',
    'inflammation_signal_speed_mid_steps',
    'inflammation_signal_speed_slow_steps',
    'm1_m2_switch_threshold_low',
    'm1_m2_switch_threshold_medium_low',
    'm1_m2_switch_threshold_medium_high',
    'm1_m2_switch_threshold_high',
    'pr_cytokine_production_rate_strong',
    'pr_cytokine_production_rate_weak',
    'm1_macrophage_activation_rate_strong',
    'm1_macrophage_activation_rate_weak'
];

function setupDesignerView() {
    const fixedParamsContainer = document.getElementById('fixed-parameters');
    const playerParamsContainer = document.getElementById('player-parameter-values');

    // Clear containers
    fixedParamsContainer.innerHTML = '';
    playerParamsContainer.innerHTML = '';

    // Fixed parameters
    fixedParamKeys.forEach(key => {
        const meta = PARAMETER_METADATA[key];
        if (meta) {
            const item = createParameterInput(key, meta);
            fixedParamsContainer.appendChild(item);
        }
    });

    // Player-adjustable parameter values
    playerParamKeys.forEach(key => {
        const meta = PARAMETER_METADATA[key];
        if (meta) {
            const item = createParameterInput(key, meta);
            playerParamsContainer.appendChild(item);
        }
    });

    // Save button
    document.getElementById('save-parameters').addEventListener('click', () => {
        saveParameters();
        alert('Parameters saved!');
        resetSimulation();
    });

    // Reset button
    document.getElementById('reset-parameters').addEventListener('click', () => {
        if (confirm('Reset all parameters to defaults?')) {
            appState.parameters = { ...EXTENDED_DEFAULT_PARAMETERS };
            saveParameters();
            // Update all input values
            fixedParamKeys.forEach(key => {
                const input = document.getElementById(`param-${key}`);
                if (input) input.value = appState.parameters[key];
            });
            playerParamKeys.forEach(key => {
                const input = document.getElementById(`param-${key}`);
                if (input) input.value = appState.parameters[key];
            });
            resetSimulation();
        }
    });
}

function createParameterInput(key, meta) {
    const item = document.createElement('div');
    item.className = 'parameter-item';
    
    const label = document.createElement('label');
    label.textContent = meta.label;
    label.htmlFor = `param-${key}`;
    
    let input;
    if (meta.type === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.id = `param-${key}`;
        input.value = appState.parameters[key];
        if (meta.min !== undefined) input.min = meta.min;
        if (meta.max !== undefined) input.max = meta.max;
        if (meta.step !== undefined) input.step = meta.step;
        input.addEventListener('input', (e) => {
            appState.parameters[key] = parseFloat(e.target.value) || 0;
        });
    } else {
        input = document.createElement('select');
        input.id = `param-${key}`;
        // Handle select options if needed
    }
    
    item.appendChild(label);
    item.appendChild(input);
    
    return item;
}

// Player view setup
function setupPlayerView() {
    // Set initial dropdown values
    document.getElementById('inflammation-signal-speed').value = appState.parameters.inflammation_signal_speed;
    document.getElementById('m1-m2-switch-threshold').value = appState.parameters.m1_m2_switch_threshold;
    document.getElementById('pr-cytokine-production-rate').value = appState.parameters.pr_cytokine_production_rate;
    document.getElementById('m1-macrophage-activation-rate').value = appState.parameters.m1_macrophage_activation_rate;

    // Dropdown change handlers
    document.getElementById('inflammation-signal-speed').addEventListener('change', (e) => {
        appState.parameters.inflammation_signal_speed = e.target.value;
        resetSimulation();
    });

    document.getElementById('m1-m2-switch-threshold').addEventListener('change', (e) => {
        appState.parameters.m1_m2_switch_threshold = e.target.value;
        resetSimulation();
    });

    document.getElementById('pr-cytokine-production-rate').addEventListener('change', (e) => {
        appState.parameters.pr_cytokine_production_rate = e.target.value;
        resetSimulation();
    });

    document.getElementById('m1-macrophage-activation-rate').addEventListener('change', (e) => {
        appState.parameters.m1_macrophage_activation_rate = e.target.value;
        resetSimulation();
    });

    // Play button
    document.getElementById('play-btn').addEventListener('click', () => {
        if (appState.isRunning) {
            pauseSimulation();
        } else {
            playSimulation();
        }
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        resetSimulation();
    });

    // Speed control
    document.getElementById('sim-speed').addEventListener('change', (e) => {
        appState.speed = parseFloat(e.target.value) || 1.0;
    });
}

// Chart setup
function setupChart() {
    const ctx = document.getElementById('simulation-chart').getContext('2d');
    
    appState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 31 }, (_, i) => `T${i}`),
            datasets: [
                {
                    label: 'Skin Barrier Integrity',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y'
                },
                {
                    label: 'Bacteria Count',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'Energy Pool (×0.01)',
                    data: [],
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'Neutrophils in Burn Site',
                    data: [],
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'Dead Neutrophils',
                    data: [],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'M1 in Burn Site',
                    data: [],
                    borderColor: 'rgb(255, 205, 86)',
                    backgroundColor: 'rgba(255, 205, 86, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'M2 in Burn Site',
                    data: [],
                    borderColor: 'rgb(201, 203, 207)',
                    backgroundColor: 'rgba(201, 203, 207, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'PI in Blood Vessel',
                    data: [],
                    borderColor: 'rgb(255, 99, 255)',
                    backgroundColor: 'rgba(255, 99, 255, 0.2)',
                    yAxisID: 'y1'
                },
                {
                    label: 'PR in Burn Site',
                    data: [],
                    borderColor: 'rgb(99, 255, 132)',
                    backgroundColor: 'rgba(99, 255, 132, 0.2)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time Step'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Skin Barrier Integrity (0.75-1)'
                    },
                    min: 0.75,
                    max: 1
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Count / Energy'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Reset simulation
function resetSimulation() {
    pauseSimulation();
    appState.currentStep = 0;
    
    // Create new simulation with current parameters
    appState.simulation = new ImmuneSystemSimulation(appState.parameters);
    appState.simulation.run();
    
    updateChart();
    updateDisplays();
    updateControls();
}

// Update chart with current simulation data
function updateChart() {
    if (!appState.chart || !appState.simulation) return;

    const datasets = appState.chart.data.datasets;
    const lastValidStep = appState.simulation.getLastValidStep();
    const maxStep = Math.min(appState.currentStep + 1, lastValidStep + 1);
    
    // Update all datasets
    datasets[0].data = appState.simulation.state.skin_integrity.slice(0, maxStep);
    datasets[1].data = appState.simulation.state.bacteria_total_count.slice(0, maxStep);
    // Show energy pool (remaining) scaled by 0.1 for better graph visibility
    datasets[2].data = appState.simulation.state.energy_remaining.slice(0, maxStep).map(v => v * 0.01);
    datasets[3].data = appState.simulation.state.active_neutrophils_in_burn_site.slice(0, maxStep);
    datasets[4].data = appState.simulation.state.dead_neutrophils_before_eaten.slice(0, maxStep);
    datasets[5].data = appState.simulation.state.active_m1_in_burn_site_after_transform.slice(0, maxStep);
    datasets[6].data = appState.simulation.state.active_m2_in_burn_site.slice(0, maxStep);
    datasets[7].data = appState.simulation.state.pi_left_in_blood_vessel.slice(0, maxStep);
    datasets[8].data = appState.simulation.state.pr_used_for_healing.slice(0, maxStep);
    
    appState.chart.update('none');
}

// Update read-only displays
function updateDisplays() {
    if (!appState.simulation) return;
    
    const state = appState.simulation.getStateAtStep(appState.currentStep);
    const lastStep = appState.simulation.getLastValidStep();
    const finalState = appState.simulation.getStateAtStep(lastStep);
    
    document.getElementById('display-inflammation-signal-speed').textContent = state.inflammation_signal_speed || 'None';
    document.getElementById('display-inflammation-intensity').textContent = state.inflammation_intensity || 'None';
    document.getElementById('current-time-step').textContent = `T${appState.currentStep}`;
    
    // Update energy display if element exists
    const energyDisplay = document.getElementById('display-energy-remaining');
    if (energyDisplay) {
        if (state.energy_depleted) {
            energyDisplay.textContent = 'DEPLETED';
            energyDisplay.style.color = '#e74c3c';
        } else {
            energyDisplay.textContent = `${Math.round(state.energy_remaining)}`;
            energyDisplay.style.color = '#2c3e50';
        }
    }
    
    // Skin fully healed? (current state)
    const skinHealedDisplay = document.getElementById('display-skin-healed');
    if (skinHealedDisplay) {
        if (!appState.isRunning && appState.currentStep === 0) {
            skinHealedDisplay.textContent = '-';
            skinHealedDisplay.style.color = '#7f8c8d';
        } else {
            const skinHealedNow = state.skin_integrity >= 0.99;
            skinHealedDisplay.textContent = skinHealedNow ? 'YES' : 'NO';
            skinHealedDisplay.style.color = skinHealedNow ? '#27ae60' : '#e74c3c';
        }
    }
    
    // Bacteria eradicated? (current state)
    const bacteriaEradicatedDisplay = document.getElementById('display-bacteria-eradicated');
    if (bacteriaEradicatedDisplay) {
        if (!appState.isRunning && appState.currentStep === 0) {
            bacteriaEradicatedDisplay.textContent = '-';
            bacteriaEradicatedDisplay.style.color = '#7f8c8d';
        } else {
            const bacteriaEradicatedNow = state.bacteria_total_count <= 0.5;
            bacteriaEradicatedDisplay.textContent = bacteriaEradicatedNow ? 'YES' : 'NO';
            bacteriaEradicatedDisplay.style.color = bacteriaEradicatedNow ? '#27ae60' : '#e74c3c';
        }
    }
    
    // Simulation outcome
    const outcomeDisplay = document.getElementById('display-sim-outcome');
    if (outcomeDisplay) {
        if (!appState.isRunning && appState.currentStep === 0) {
            outcomeDisplay.textContent = '-';
            outcomeDisplay.style.color = '#7f8c8d';
        } else {
            const isFinished = (appState.currentStep >= lastStep) && (lastStep === 30 || finalState.energy_depleted);
            const skinHealed = finalState.skin_integrity >= 0.99;
            const bacteriaEradicated = finalState.bacteria_total_count <= 0.5;
            if (!isFinished && appState.isRunning) {
                outcomeDisplay.textContent = 'PENDING';
                outcomeDisplay.style.color = '#7f8c8d';
            } else if (skinHealed && bacteriaEradicated) {
                outcomeDisplay.textContent = 'SUCCESS';
                outcomeDisplay.style.color = '#27ae60';
            } else {
                outcomeDisplay.textContent = 'FAILURE';
                outcomeDisplay.style.color = '#e74c3c';
            }
        }
    }
}

// Update control states
function updateControls() {
    const isRunning = appState.isRunning;
    const playBtn = document.getElementById('play-btn');
    
    // Enable/disable controls
    document.getElementById('inflammation-signal-speed').disabled = isRunning;
    document.getElementById('m1-m2-switch-threshold').disabled = isRunning;
    document.getElementById('pr-cytokine-production-rate').disabled = isRunning;
    document.getElementById('m1-macrophage-activation-rate').disabled = isRunning;
    document.getElementById('sim-speed').disabled = isRunning;
    
    // Update play button
    playBtn.textContent = isRunning ? 'Pause' : 'Play';
    playBtn.className = isRunning ? 'btn btn-secondary' : 'btn btn-primary';
}

// Play simulation
function playSimulation() {
    const lastValidStep = appState.simulation ? appState.simulation.getLastValidStep() : 30;
    
    if (appState.currentStep >= lastValidStep) {
        resetSimulation();
        return;
    }
    
    appState.isRunning = true;
    updateControls();
    appState.lastUpdateTime = performance.now();
    
    function animate(currentTime) {
        if (!appState.isRunning) return;
        
        const elapsed = (currentTime - appState.lastUpdateTime) / 1000;
        const stepInterval = 1.0 / appState.speed;
        
        if (elapsed >= stepInterval) {
            const nextStep = appState.currentStep + 1;
            const state = appState.simulation.getStateAtStep(nextStep);
            
            // Check if energy is depleted at next step
            if (state.energy_depleted) {
                appState.currentStep = nextStep;
                updateChart();
                updateDisplays();
                pauseSimulation();
                alert(`Simulation stopped at T${nextStep}: Energy depleted!`);
                return;
            }
            
            appState.currentStep = Math.min(nextStep, lastValidStep);
            appState.lastUpdateTime = currentTime;
            
            updateChart();
            updateDisplays();
            
            if (appState.currentStep >= lastValidStep) {
                pauseSimulation();
            }
        }
        
        appState.animationId = requestAnimationFrame(animate);
    }
    
    appState.animationId = requestAnimationFrame(animate);
}

// Pause simulation
function pauseSimulation() {
    appState.isRunning = false;
    if (appState.animationId) {
        cancelAnimationFrame(appState.animationId);
        appState.animationId = null;
    }
    updateControls();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

