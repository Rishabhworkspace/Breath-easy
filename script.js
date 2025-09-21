// Box Breathing Companion - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Box Breathing Companion loaded!');
    
    // DOM Elements
    const breathingCircle = document.getElementById('breathingCircle');
    const instructionText = document.getElementById('instructionText');
    const phaseIndicator = document.getElementById('phaseIndicator');
    const progressFill = document.getElementById('progressFill');
    const startBtn = document.getElementById('startBtn');
    const soundBtn = document.getElementById('soundBtn');
    const soundIcon = document.getElementById('soundIcon');
    const cycleCount = document.getElementById('cycleCount');
    
    // Audio elements
    const inhaleSound = document.getElementById('inhaleSound');
    const holdSound = document.getElementById('holdSound');
    const exhaleSound = document.getElementById('exhaleSound');
    
    // App State
    let isBreathing = false;
    let currentPhase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    let cycleCounter = 0;
    let breathingInterval = null;
    let progressInterval = null;
    let soundEnabled = true;
    
    // Breathing phases configuration
    const phases = [
        { name: 'Inhale', duration: 4000, instruction: 'Breathe In', circleClass: 'inhale' },
        { name: 'Hold', duration: 4000, instruction: 'Hold', circleClass: 'inhale' },
        { name: 'Exhale', duration: 4000, instruction: 'Breathe Out', circleClass: 'exhale' },
        { name: 'Hold', duration: 4000, instruction: 'Hold', circleClass: 'exhale' }
    ];
    
    // Initialize app
    function init() {
        updateUI();
        setupEventListeners();
        createAudioContext();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        startBtn.addEventListener('click', toggleBreathing);
        soundBtn.addEventListener('click', toggleSound);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                toggleBreathing();
            } else if (e.code === 'KeyS') {
                e.preventDefault();
                toggleSound();
            }
        });
    }
    
    // Create audio context for better browser compatibility
    function createAudioContext() {
        // Create simple audio tones since we can't load external audio files
        // This is a fallback - in a real app you'd load actual audio files
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create simple tones for breathing cues
            window.playTone = function(frequency, duration, type = 'sine') {
                if (!soundEnabled) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            };
        } catch (e) {
            console.log('Audio context not available');
            window.playTone = () => {}; // Fallback function
        }
    }
    
    // Toggle breathing session
    function toggleBreathing() {
        if (isBreathing) {
            stopBreathing();
        } else {
            startBreathing();
        }
    }
    
    // Start breathing session
    function startBreathing() {
        isBreathing = true;
        currentPhase = 0;
        
        updateStartButton();
        startBreathingCycle();
    }
    
    // Stop breathing session
    function stopBreathing() {
        isBreathing = false;
        currentPhase = 0;
        
        // Clear intervals
        if (breathingInterval) {
            clearTimeout(breathingInterval);
            breathingInterval = null;
        }
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
        
        // Reset UI
        resetCircle();
        resetProgress();
        updateStartButton();
        updateInstruction('Press Start to Begin');
        hidePhaseIndicator();
    }
    
    // Start breathing cycle
    function startBreathingCycle() {
        if (!isBreathing) return;
        
        const phase = phases[currentPhase];
        
        // Update UI for current phase
        updateInstruction(phase.instruction);
        updateCircle(phase.circleClass);
        showPhaseIndicator();
        startProgress(phase.duration);
        
        // Play audio cue
        playPhaseSound(currentPhase);
        
        // Set timer for next phase
        breathingInterval = setTimeout(() => {
            if (!isBreathing) return;
            
            // Move to next phase
            currentPhase = (currentPhase + 1) % phases.length;
            
            // If we completed a full cycle (back to inhale)
            if (currentPhase === 0) {
                cycleCounter++;
                updateCycleCounter();
            }
            
            // Continue to next phase
            startBreathingCycle();
        }, phase.duration);
    }
    
    // Play sound for current phase
    function playPhaseSound(phase) {
        if (!soundEnabled) return;
        
        switch (phase) {
            case 0: // Inhale
                window.playTone(220, 0.5, 'sine'); // A3 note
                break;
            case 1: // Hold after inhale
                window.playTone(330, 0.3, 'triangle'); // E4 note
                break;
            case 2: // Exhale
                window.playTone(165, 0.5, 'sine'); // E3 note
                break;
            case 3: // Hold after exhale
                window.playTone(275, 0.3, 'triangle'); // C#4 note
                break;
        }
    }
    
    // Update breathing circle
    function updateCircle(className) {
        breathingCircle.className = 'breathing-circle';
        if (className) {
            breathingCircle.classList.add(className);
        }
    }
    
    // Reset breathing circle
    function resetCircle() {
        breathingCircle.className = 'breathing-circle';
    }
    
    // Update instruction text
    function updateInstruction(text) {
        instructionText.classList.remove('visible');
        
        setTimeout(() => {
            instructionText.textContent = text;
            instructionText.classList.add('visible');
        }, 250);
    }
    
    // Show phase indicator
    function showPhaseIndicator() {
        phaseIndicator.classList.add('active');
    }
    
    // Hide phase indicator
    function hidePhaseIndicator() {
        phaseIndicator.classList.remove('active');
    }
    
    // Start progress animation
    function startProgress(duration) {
        progressFill.style.width = '0%';
        progressFill.style.transition = 'none';
        
        // Force reflow
        progressFill.offsetHeight;
        
        // Start animation
        progressFill.style.transition = `width ${duration}ms linear`;
        progressFill.style.width = '100%';
    }
    
    // Reset progress bar
    function resetProgress() {
        progressFill.style.width = '0%';
        progressFill.style.transition = 'none';
    }
    
    // Update start button
    function updateStartButton() {
        const btnText = startBtn.querySelector('.btn-text');
        
        if (isBreathing) {
            btnText.textContent = 'Stop';
            startBtn.classList.add('active');
        } else {
            btnText.textContent = 'Start';
            startBtn.classList.remove('active');
        }
    }
    
    // Toggle sound
    function toggleSound() {
        soundEnabled = !soundEnabled;
        updateSoundButton();
    }
    
    // Update sound button
    function updateSoundButton() {
        if (soundEnabled) {
            soundIcon.textContent = '🔊';
            soundBtn.classList.remove('muted');
            soundBtn.title = 'Turn Sound Off';
        } else {
            soundIcon.textContent = '🔇';
            soundBtn.classList.add('muted');
            soundBtn.title = 'Turn Sound On';
        }
    }
    
    // Update cycle counter
    function updateCycleCounter() {
        cycleCount.textContent = cycleCounter;
        
        // Add a subtle animation to highlight the counter update
        cycleCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cycleCount.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Update UI
    function updateUI() {
        updateStartButton();
        updateSoundButton();
        updateCycleCounter();
    }
    
    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isBreathing) {
            // Optionally pause when tab is not visible
            // stopBreathing();
        }
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (isBreathing) {
            stopBreathing();
        }
    });
    
    // Initialize the app
    init();
    
    // Add some helpful console messages
    console.log('🫁 Box Breathing Companion ready!');
    console.log('💡 Tip: Press Space to start/stop, S to toggle sound');
    console.log('🎯 Follow the 4-4-4-4 breathing pattern for best results');
});