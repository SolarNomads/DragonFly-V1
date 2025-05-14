// index.js
console.log("index.js: Script execution started.");

// --- Global Scope & Game State ---
let gameSounds; let score = 0; let gameActive = false; let currentLevel = 1; let timeLeft = 60;
let mouseX = window.innerWidth / 2; let mouseY = window.innerHeight / 2;
let dragonflyX, dragonflyY; let dragonflyAngle = 0; let isDashing = false;
let dashCooldown = 400; let lastDashTime = 0; let preyCaughtThisLevel = 0;
let preyCaughtThisDash = 0;

const flies = []; const predatorBirds = []; const waterSkimmers = []; const jumpingFish = [];
const hunterFrogs = []; const skyTerrors = []; const powerUpFruits = [];
const activeSplashParticles = [];

let gameLoopId; let timerIntervalId;
let flySpawnIntervalId, birdSpawnIntervalId, skimmerSpawnIntervalId, fishSpawnIntervalId;
let hunterFrogSpawnIntervalId, skyTerrorSpawnIntervalId;
let powerUpFruitSpawnIntervalId;

let gameArea, dragonflyElement, scoreDisplay, timeDisplay, levelDisplay, fliesLeftDisplay;
let messageCenter, messageText, startButton, celestialBody, root, muteButtonElement;

let bgMusicSynth, bgMusicPattern; let isMuted = false;
let dragonflyIsInvincible = false; let dragonflySpeedBoostActive = false;
let invincibilityTimerId, speedBoostTimerId;
let originalDragonflySpeed = 0.12, originalDashDistance = 100, originalDashDuration = 120;
const globalFlySpeedFactor = 1.40;

const levelSettings = [
    { name: "Azure Skies", preyToLevelUp: 10, timePerLevel: 60, skyFlySpawnRate: 1200, maxSkyFlies: 6, skyFlySpeedMultiplier: 1.0, birdSpawnRate: 0, waterSkimmerSpawnRate: 0, fishSpawnRate: 0, hunterFrogSpawnRate: 0, skyTerrorSpawnRate: 0, powerUpFruitSpawnRate: 20000, maxPowerUpFruits: 1, theme: { skyTop: '#65C6F7', skyBottom: '#92DDFC', sunMoon: '#FFDD00', sunMoonShadow: 'rgba(255,221,0,0.6)', cloud: '#FFFFFF', celestialType: 'sun', type: 'sky', scenery: null, dragonflyBody: '#59D2FE', dragonflyHead: '#49BCEF', dragonflyWing: 'rgba(230, 245, 255, 0.75)', flyBody: '#FF6B6B', flyWing: 'rgba(255, 190, 190, 0.8)', outline: '#2C3E50' }},
    { name: "Serene Waters", preyToLevelUp: 12 * 2.5, timePerLevel: 60, skyFlySpawnRate: 1500, maxSkyFlies: 4, skyFlySpeedMultiplier: 1.0, birdSpawnRate: 25000, birdSpeed: 2, birdTimePenalty: 5, waterSkimmerSpawnRate: 2000, maxWaterSkimmers: 4, waterSkimmerSpeedMultiplier: 1.0, fishSpawnRate: 18000, fishJumpForce: 10, fishTimePenalty: 3, hunterFrogSpawnRate: 0, skyTerrorSpawnRate: 0, powerUpFruitSpawnRate: 18000, maxPowerUpFruits: 1, theme: { skyTop: '#89D8D3', skyBottom: '#ACE2E1', waterTop: '#4DBAEB', waterBottom: '#3AA7D9', sunMoon: '#FFDD00', sunMoonShadow: 'rgba(255,221,0,0.5)', cloud: '#F7F7F7', celestialType: 'sun', type: 'water', scenery: { type: 'pond', lilypadCount: 3, reedClusterCount: 4 }, dragonflyBody: '#FFD166', dragonflyHead: '#FFB74D', dragonflyWing: 'rgba(255, 240, 200, 0.75)', flyBody: '#A0E7E5', flyWing: 'rgba(200, 250, 248, 0.8)', skimmerBody: '#F76D6D', birdBody: '#546E7A', birdWing: '#78909C', birdBeak: '#FFF176', fishBody: '#FF8A80', fishFin: '#FF5252', lilypad: '#79D75A', reed: '#5EBF4A', outline: '#37474F' }},
    { name: "Crimson Twilight", preyToLevelUp: 15 * 3, timePerLevel: 60, skyFlySpawnRate: 1000, maxSkyFlies: 7, skyFlySpeedMultiplier: 1.1, birdSpawnRate: 15000, birdSpeed: 2.5, birdTimePenalty: 6, waterSkimmerSpawnRate: 0, fishSpawnRate: 0, hunterFrogSpawnRate: 22000, maxHunterFrogs: 1, hunterFrogHealth: 2, hunterFrogLungeSpeed: 4, hunterFrogLungeDelay: 300, hunterFrogDamage: 5, hunterFrogPoints: 10, skyTerrorSpawnRate: 0, powerUpFruitSpawnRate: 15000, maxPowerUpFruits: 1, theme: { skyTop: '#E55D87', skyBottom: '#5C258D', sunMoon: '#FDE1A1', sunMoonShadow: 'rgba(253,225,161,0.5)', cloud: '#D1C4E9', celestialType: 'moon-k', type: 'sky', scenery: { type: 'sparse_reeds', reedClusterCount: 5 }, dragonflyBody: '#AB47BC', dragonflyHead: '#8E24AA', dragonflyWing: 'rgba(220, 180, 255, 0.75)', flyBody: '#FFCC80', flyWing: 'rgba(255, 230, 200, 0.8)', birdBody: '#263238', birdWing: '#37474F', birdBeak: '#FFCA28', frogBody: '#DCE775', frogEye: '#FFFDE7', frogPupil: '#424242', outline: '#1A237E' }},
    { name: "Nebula Dash", preyToLevelUp: 20 * 2.5, timePerLevel: 60, skyFlySpawnRate: 800, maxSkyFlies: 8, skyFlySpeedMultiplier: 1.2, birdSpawnRate: 12000, birdSpeed: 3, birdTimePenalty: 7, waterSkimmerSpawnRate: 0, fishSpawnRate: 0, hunterFrogSpawnRate: 18000, maxHunterFrogs: 2, hunterFrogHealth: 3, hunterFrogLungeSpeed: 5, hunterFrogLungeDelay: 250, hunterFrogDamage: 6, hunterFrogPoints: 15, skyTerrorSpawnRate: 25000, maxSkyTerrors: 1, skyTerrorHealth: 3, skyTerrorSpeed: 2, skyTerrorEngageDelay: 400, skyTerrorDamage: 7, skyTerrorPoints: 20, powerUpFruitSpawnRate: 12000, maxPowerUpFruits: 2, theme: { skyTop: '#1A2980', skyBottom: '#26D0CE', sunMoon: '#FFF59D', sunMoonShadow: 'rgba(255,245,157,0.5)', cloud: '#6A1B9A', celestialType: 'hidden', type: 'sky', scenery: { type: 'floating_crystals', reedClusterCount: 7 }, dragonflyBody: '#FF7043', dragonflyHead: '#F4511E', dragonflyWing: 'rgba(255, 200, 180, 0.75)', flyBody: '#4FC3F7', flyWing: 'rgba(180, 230, 255, 0.8)', birdBody: '#004D40', birdWing: '#00695C', birdBeak: '#FFD54F', frogBody: '#FF8A65', frogEye: '#FFF3E0', frogPupil: '#3E2723', skyTerrorBody: '#1E1E1E', skyTerrorWing: '#424242', outline: '#0D0D0D' }},
    { name: "Carboniferous Canopy", preyToLevelUp: 30 * 2, timePerLevel: 70, skyFlySpawnRate: 700, maxSkyFlies: 10, skyFlySpeedMultiplier: 1.3, birdSpawnRate: 10000, birdSpeed: 3.2, birdTimePenalty: 8, waterSkimmerSpawnRate: 0, fishSpawnRate: 0, hunterFrogSpawnRate: 15000, maxHunterFrogs: 2, hunterFrogHealth: 3, hunterFrogLungeSpeed: 5, hunterFrogLungeDelay: 200, hunterFrogDamage: 7, hunterFrogPoints: 18, skyTerrorSpawnRate: 20000, maxSkyTerrors: 1, skyTerrorHealth: 4, skyTerrorSpeed: 2.5, skyTerrorEngageDelay: 350, skyTerrorDamage: 8, skyTerrorPoints: 25, powerUpFruitSpawnRate: 10000, maxPowerUpFruits: 2, theme: { skyTop: '#79A14F', skyBottom: '#AAD678', sunMoon: '#FFFACD', sunMoonShadow: 'rgba(255,250,205,0.6)', cloud: '#E8F5E9', celestialType: 'sun', type: 'sky', scenery: { type: 'grassland', grassClumpCount: 15 }, dragonflyBody: '#4CAF50', dragonflyHead: '#388E3C', dragonflyWing: 'rgba(200, 255, 200, 0.7)', flyBody: '#FF9800', flyWing: 'rgba(255, 224, 178, 0.8)', birdBody: '#5D4037', birdWing: '#6D4C41', birdBeak: '#FFC107', frogBody: '#CDDC39', frogEye: '#FFF9C4', frogPupil: '#795548', skyTerrorBody: '#3E2723', skyTerrorWing: '#4E342E', outline: '#2E7D32' }},
    { name: "Triassic Inferno", preyToLevelUp: 30 * 2.5, timePerLevel: 80, skyFlySpawnRate: 600, maxSkyFlies: 12, skyFlySpeedMultiplier: 1.4, birdSpawnRate: 8000, birdSpeed: 3.5, birdTimePenalty: 9, waterSkimmerSpawnRate: 0, fishSpawnRate: 0, hunterFrogSpawnRate: 12000, maxHunterFrogs: 3, hunterFrogHealth: 4, hunterFrogLungeSpeed: 6, hunterFrogLungeDelay: 150, hunterFrogDamage: 8, hunterFrogPoints: 22, skyTerrorSpawnRate: 18000, maxSkyTerrors: 2, skyTerrorHealth: 5, skyTerrorSpeed: 2.8, skyTerrorEngageDelay: 300, skyTerrorDamage: 9, skyTerrorPoints: 30, powerUpFruitSpawnRate: 9000, maxPowerUpFruits: 3, theme: { skyTop: '#FF8A65', skyBottom: '#FFCCBC', sunMoon: '#FFFFFF', sunMoonShadow: 'rgba(255,255,255,0.4)', cloud: '#FFE0B2', celestialType: 'sun', type: 'sky', scenery: { type: 'prehistoric_forest', treeCount: 6 }, dragonflyBody: '#D84315', dragonflyHead: '#BF360C', dragonflyWing: 'rgba(255, 204, 188, 0.7)', flyBody: '#FDD835', flyWing: 'rgba(255, 249, 196, 0.8)', birdBody: '#212121', birdWing: '#424242', birdBeak: '#FF6F00', frogBody: '#EF6C00', frogEye: '#FFF3E0', frogPupil: '#D84315', skyTerrorBody: '#BF360C', skyTerrorWing: '#A1887F', outline: '#8D6E63' }}
];

// --- ALL GAME LOGIC FUNCTIONS ---
function initializeSoundsAndMusic() {
    try {
        gameSounds = {
            dash: () => new Tone.NoiseSynth({ volume: -20, noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 } }).toDestination().triggerAttackRelease("16n"),
            catch: () => new Tone.Synth({ volume: -12, oscillator: { type: "triangle" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.01, release: 0.2 } }).toDestination().triggerAttackRelease("A5", "16n"),
            gameOver: () => new Tone.Synth({ oscillator: { type: "pwm", modulationFrequency: 0.2 }, envelope: { attack: 0.01, decay: 0.7, sustain: 0, release: 0.1 }, volume: -10 }).toDestination().triggerAttackRelease("C3", "1n"),
            start: () => new Tone.Synth({ volume: -12, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 } }).toDestination().triggerAttackRelease("C4", "8n"),
            levelUp: () => new Tone.PolySynth(Tone.Synth, { volume: -8, oscillator: {type: "fmsine", modulationIndex: 10}, envelope: {attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5}}).toDestination().triggerAttackRelease(["C4", "F4", "A4", "C5"], "0.4n"),
            birdHit: () => new Tone.Synth({ volume: -10, oscillator: {type: "fatsawtooth", count: 3, spread: 20}, envelope: {attack:0.01, decay:0.2, sustain:0.1, release:0.3}}).toDestination().triggerAttackRelease("G2", "8n"),
            fishSplash: () => new Tone.NoiseSynth({volume: -18, noise: {type: "pink", playbackRate: 0.5}, envelope: {attack:0.01, decay:0.1, sustain:0}}).toDestination().triggerAttackRelease("16n"),
            hazardHit: () => new Tone.NoiseSynth({volume: -16, noise: {type: "brown"}, envelope: {attack:0.005, decay:0.08, sustain:0}}).toDestination().triggerAttackRelease("16n"),
            enemyHit: () => new Tone.Synth({ volume: -15, oscillator: { type: "square" }, envelope: { attack: 0.002, decay: 0.05, sustain: 0, release: 0.1 } }).toDestination().triggerAttackRelease("E3", "32n"), // Sound for player hitting enemy
            enemyDefeated: () => new Tone.Synth({ volume: -12, oscillator: { type: "sawtooth" }, filter: new Tone.Filter(400, "lowpass"), filterEnvelope: { attack:0.01, decay:0.1, baseFrequency:200, octaves:2}, envelope: { attack:0.01, decay:0.2, sustain:0.1, release:0.2 }}).toDestination().triggerAttackRelease("G2", "8n"),
            frogLunge: () => new Tone.Synth({ volume: -18, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 } }).toDestination().triggerAttackRelease("C3", "16n"),
            powerUpCollect: () => new Tone.Synth({ volume: -10, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 } }).toDestination().triggerAttackRelease("C6", "8n"),
            powerUpActivate: () => new Tone.PolySynth(Tone.Synth, { volume: -12, oscillator: { type: "triangle" }, envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.4 } }).toDestination().triggerAttackRelease(["E5", "G#5", "C#6"], "0.3n"),
            powerUpDeactivate: () => new Tone.Synth({ volume: -15, oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 } }).toDestination().triggerAttackRelease("A4", "8n")
        };

        bgMusicSynth = new Tone.PolySynth(Tone.Synth, {
            volume: -25,
            oscillator: { type: "pulse", width: 0.6 },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 }
        }).toDestination();

        bgMusicPattern = new Tone.Sequence((time, note) => {
            bgMusicSynth.triggerAttackRelease(note, "8n", time);
            if(note === "C5") {
                bgMusicSynth.triggerAttackRelease("A4", "16n", time + Tone.Time("8n").toSeconds() * 0.5);
            }
        }, ["C4", "E4", "G4", "C5", "G4", "E4"], "4n");
        bgMusicPattern.loop = true;
        Tone.Transport.bpm.value = 120;

    } catch (e) {
        console.error("Sound initialization failed:", e);
        const noOpSound = () => {};
        gameSounds = { dash: noOpSound, catch: noOpSound, gameOver: noOpSound, start: noOpSound, levelUp: noOpSound, birdHit: noOpSound, fishSplash: noOpSound, hazardHit: noOpSound, enemyHit: noOpSound, enemyDefeated: noOpSound, frogLunge: noOpSound, powerUpCollect: noOpSound, powerUpActivate: noOpSound, powerUpDeactivate: noOpSound };
    }
}

window.toggleMute = function() {
    if (!Tone || !Tone.Master) {
        console.warn("Tone.js not fully initialized to toggle mute.");
        return;
    }
    isMuted = !isMuted;
    Tone.Master.mute = isMuted;

    if (bgMusicPattern) {
        if (isMuted || !gameActive) {
            Tone.Transport.pause();
        } else if (gameActive) {
            Tone.Transport.start();
        }
    }
    if (muteButtonElement) muteButtonElement.textContent = isMuted ? "Unmute" : "Mute";
}

function applyLevelTheme(levelConf) {
    if(!root || !celestialBody || !gameArea || !levelConf || typeof levelConf.theme !== 'object' || levelConf.theme === null) {
        console.error("applyLevelTheme: CRITICAL - Missing elements or theme data.");
        document.body.style.backgroundColor = '#CCCCCC';
        if(gameArea) gameArea.style.backgroundImage = 'linear-gradient(to bottom, #AAAAFF, #7777DD)';
        return;
    }

    root.style.setProperty('--sky-color-top-k', levelConf.theme.skyTop);
    root.style.setProperty('--sky-color-bottom-k', levelConf.theme.skyBottom);
    root.style.setProperty('--sun-moon-color-k', levelConf.theme.sunMoon);
    root.style.setProperty('--sun-moon-shadow-k', levelConf.theme.sunMoonShadow);
    root.style.setProperty('--cloud-color-k', levelConf.theme.cloud);
    root.style.setProperty('--outline-k', levelConf.theme.outline);
    root.style.setProperty('--text-k', levelConf.theme.outline);

    root.style.setProperty('--dragonfly-body-k', levelConf.theme.dragonflyBody);
    root.style.setProperty('--dragonfly-head-k', levelConf.theme.dragonflyHead);
    root.style.setProperty('--dragonfly-wing-k', levelConf.theme.dragonflyWing);
    root.style.setProperty('--fly-body-k', levelConf.theme.flyBody);
    root.style.setProperty('--fly-wing-k', levelConf.theme.flyWing);

    if(levelConf.theme.skimmerBody) root.style.setProperty('--skimmer-body-k', levelConf.theme.skimmerBody);
    if(levelConf.theme.birdBody) {
        root.style.setProperty('--bird-body-k', levelConf.theme.birdBody);
        root.style.setProperty('--bird-wing-k', levelConf.theme.birdWing);
        root.style.setProperty('--bird-beak-k', levelConf.theme.birdBeak);
    }
    if(levelConf.theme.fishBody) {
        root.style.setProperty('--fish-body-k', levelConf.theme.fishBody);
        root.style.setProperty('--fish-fin-k', levelConf.theme.fishFin);
    }
    if(levelConf.theme.frogBody) {
        root.style.setProperty('--frog-body-k', levelConf.theme.frogBody);
        root.style.setProperty('--frog-eye-k', levelConf.theme.frogEye);
        root.style.setProperty('--frog-pupil-k', levelConf.theme.frogPupil);
    }
    if(levelConf.theme.skyTerrorBody) {
        root.style.setProperty('--sky-terror-body-k', levelConf.theme.skyTerrorBody);
        root.style.setProperty('--sky-terror-wing-k', levelConf.theme.skyTerrorWing);
    }
    if(levelConf.theme.lilypad) root.style.setProperty('--lilypad-color-k', levelConf.theme.lilypad);
    if(levelConf.theme.reed) root.style.setProperty('--reed-color-k', levelConf.theme.reed);
    if(levelConf.theme.grass) root.style.setProperty('--grass-color-k', levelConf.theme.grass);
    if(levelConf.theme.prehistoricTreeTrunk) root.style.setProperty('--prehistoric-tree-trunk-k', levelConf.theme.prehistoricTreeTrunk);
    if(levelConf.theme.prehistoricTreeFrond) root.style.setProperty('--prehistoric-tree-frond-k', levelConf.theme.prehistoricTreeFrond);

    document.body.style.backgroundColor = levelConf.theme.skyBottom;

    if (levelConf.theme.type === 'water') {
        gameArea.className = 'water-gradient-k';
        root.style.setProperty('--water-color-top-k', levelConf.theme.waterTop || '#4DBAEB');
        root.style.setProperty('--water-color-bottom-k', levelConf.theme.waterBottom || '#3AA7D9');
    } else {
        gameArea.className = 'sky-gradient-k';
    }

    spawnLevelScenery(levelConf);

    celestialBody.className = '';
    if (levelConf.theme.celestialType === 'moon-k') {
        celestialBody.classList.add('moon-k');
        celestialBody.classList.remove('hidden');
    } else if (levelConf.theme.celestialType === 'sun') {
        celestialBody.classList.remove('moon-k');
        celestialBody.classList.remove('hidden');
    } else {
        celestialBody.classList.add('hidden');
    }
}

function spawnLevelScenery(levelConf) {
    clearLevelScenery();
    if (!gameArea || !levelConf.theme.scenery) return;
    const scenery = levelConf.theme.scenery;

    if (scenery.type === 'pond') {
        for (let i = 0; i < (scenery.lilypadCount || 0); i++) {
            const lilypad = document.createElement('div');
            lilypad.classList.add('lilypad-svg');
            const size = 60 + Math.random() * 20;
            lilypad.style.width = `${size}px`;
            lilypad.style.height = `${size * 0.7}px`;
            lilypad.style.left = `${Math.random() * (gameArea.offsetWidth - size)}px`;
            lilypad.style.top = `${gameArea.offsetHeight * (0.55 + Math.random() * 0.4) - (size*0.35)}px`;
            lilypad.innerHTML = `
                <svg viewBox="0 0 70 50">
                    <path d="M35,0 C15.67,0 0,11.19 0,25 C0,38.81 15.67,50 35,50 C54.33,50 70,38.81 70,25 C70,11.19 54.33,0 35,0 Z M35,45 C18.43,45 5,36.93 5,25 C5,13.07 18.43,5 35,5 L35,25 L55,40 C49.37,43.31 42.54,45 35,45 Z" fill="var(--lilypad-color-k)" stroke="var(--outline-k)" stroke-width="2.5"/>
                    <path d="M35,5 Q45,15 50,25 Q55,35 58,42" stroke="var(--lilypad-vein-color-k)" stroke-width="1.5" fill="none" opacity="0.7"/>
                    <path d="M35,5 Q25,15 20,25 Q15,35 12,42" stroke="var(--lilypad-vein-color-k)" stroke-width="1.5" fill="none" opacity="0.7"/>
                </svg>`;
            gameArea.appendChild(lilypad);
        }
         for (let i = 0; i < (scenery.reedClusterCount || 0); i++) {
            const cluster = document.createElement('div');
            cluster.classList.add('reed-svg-cluster');
            cluster.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
            cluster.style.bottom = `${Math.random() * -20 - 5}px`;
            const reedCount = 2 + Math.floor(Math.random() * 3);
            let clusterHtml = '';
            for(let j=0; j < reedCount; j++) {
                const height = 60 + Math.random() * 40;
                const width = 5 + Math.random() * 3;
                clusterHtml += `
                    <div class="reed-svg" style="width:${width}px; height:${height}px; margin: 0 ${Math.random()*2-1}px; animation-delay:${Math.random()*0.5}s;">
                        <svg viewBox="0 0 ${width} ${height}">
                            <path d="M${width/2},${height} C${width/3},${height*0.7} ${width/4},${height*0.4} ${width/2},0" fill="var(--reed-color-k)" stroke="var(--outline-k)" stroke-width="1.5"/>
                            <path d="M${width/2},${height*0.5} L${width*0.8},${height*0.45}" stroke="var(--reed-highlight-k)" stroke-width="1" fill="none"/>
                        </svg>
                    </div>`;
            }
            cluster.innerHTML = clusterHtml;
            gameArea.appendChild(cluster);
        }
    } else if (scenery.type === 'sparse_reeds') {
         for (let i = 0; i < (scenery.reedClusterCount || 0); i++) {
            const cluster = document.createElement('div');
            cluster.classList.add('reed-svg-cluster');
            cluster.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
            cluster.style.bottom = `${Math.random() * (gameArea.offsetHeight * 0.6)}px`;
            const reedCount = 1 + Math.floor(Math.random() * 2);
            let clusterHtml = '';
            for(let j=0; j < reedCount; j++) {
                const height = 80 + Math.random() * 50;
                const width = 6 + Math.random() * 2;
                clusterHtml += `
                    <div class="reed-svg" style="width:${width}px; height:${height}px; margin: 0 ${Math.random()*2-1}px; animation-delay:${Math.random()*0.5}s;">
                        <svg viewBox="0 0 ${width} ${height}">
                            <path d="M${width/2},${height} C${width/3},${height*0.7} ${width/4},${height*0.4} ${width/2},0" fill="var(--reed-color-k)" stroke="var(--outline-k)" stroke-width="1.5"/>
                        </svg>
                    </div>`;
            }
            cluster.innerHTML = clusterHtml;
            gameArea.appendChild(cluster);
        }
    } else if (scenery.type === 'floating_crystals') {
         for (let i = 0; i < (scenery.reedClusterCount || 0); i++) {
            const crystal = document.createElement('div');
            crystal.classList.add('reed-svg-cluster'); 
            crystal.style.left = `${Math.random() * (gameArea.offsetWidth - 20)}px`;
            crystal.style.top = `${Math.random() * (gameArea.offsetHeight - 100)}px`;
            const crystalHeight = 40 + Math.random() * 30;
            const crystalWidth = 15 + Math.random() * 10;
            crystal.innerHTML = `
                <div class="reed-svg" style="width:${crystalWidth}px; height:${crystalHeight}px; animation: none; transform: rotate(${(Math.random()-0.5)*30}deg)">
                    <svg viewBox="0 0 20 30">
                        <polygon points="10,0 20,10 10,30 0,10" fill="var(--cloud-color-k)" stroke="var(--outline-k)" stroke-width="1.5" opacity="0.7"/>
                    </svg>
                </div>`;
            gameArea.appendChild(crystal);
         }
    } else if (scenery.type === 'grassland') {
        for (let i = 0; i < (scenery.grassClumpCount || 0); i++) {
            const clump = document.createElement('div');
            clump.classList.add('grass-clump-svg');
            const clumpWidth = 40 + Math.random() * 30;
            const clumpHeight = 30 + Math.random() * 20;
            clump.style.width = `${clumpWidth}px`;
            clump.style.height = `${clumpHeight}px`;
            clump.style.left = `${Math.random() * (gameArea.offsetWidth - clumpWidth)}px`;
            clump.style.bottom = `${-5 + Math.random() * -10}px`;
            let bladesHTML = '<svg viewBox="0 0 50 30">';
            for (let j = 0; j < 3 + Math.random() * 2; j++) {
                const bladeHeight = 20 + Math.random() * 10;
                const bladeWidth = 3 + Math.random() * 2;
                const startX = 5 + j * 10 + (Math.random() - 0.5) * 5;
                bladesHTML += `<path class="grass-blade" d="M${startX},30 Q${startX + (Math.random()-0.5)*bladeWidth},${30-bladeHeight/2} ${startX + (Math.random()-0.5)*bladeWidth*0.5},${30-bladeHeight}" stroke="var(--outline-k)" fill="var(--grass-color-k)" stroke-width="1"/>`;
            }
            bladesHTML += '</svg>';
            clump.innerHTML = bladesHTML;
            gameArea.appendChild(clump);
        }
    } else if (scenery.type === 'prehistoric_forest') {
         for (let i = 0; i < (scenery.treeCount || 0); i++) {
            const tree = document.createElement('div');
            tree.classList.add('prehistoric-tree-svg');
            const treeHeight = 100 + Math.random() * 80;
            const treeWidth = treeHeight * (0.6 + Math.random() * 0.3);
            tree.style.width = `${treeWidth}px`;
            tree.style.height = `${treeHeight}px`;
            tree.style.left = `${Math.random() * (gameArea.offsetWidth - treeWidth)}px`;
            tree.style.bottom = `${-10 + Math.random() * -20}px`;
            tree.innerHTML = `
                <svg viewBox="0 0 100 150">
                    <path d="M50,150 C45,100 40,80 50,70 C60,80 55,100 50,150 Z M50,75 C30,70 20,50 30,30 C35,20 45,20 50,25 C55,20 65,20 70,30 C80,50 70,70 50,75 Z" fill="var(--prehistoric-tree-trunk-k)" stroke="var(--outline-k)" stroke-width="3"/>
                    <ellipse class="tree-frond" cx="50" cy="35" rx="45" ry="30" fill="var(--prehistoric-tree-frond-k)" stroke="var(--outline-k)" stroke-width="2.5" transform="rotate(-5 50 35)"/>
                    <ellipse class="tree-frond" cx="30" cy="50" rx="30" ry="20" fill="var(--prehistoric-tree-frond-k)" stroke="var(--outline-k)" stroke-width="2" transform="rotate(15 30 50)"/>
                    <ellipse class="tree-frond" cx="70" cy="50" rx="30" ry="20" fill="var(--prehistoric-tree-frond-k)" stroke="var(--outline-k)" stroke-width="2" transform="rotate(-20 70 50)"/>
                </svg>`;
            gameArea.appendChild(tree);
        }
    }
}
function clearLevelScenery() {
    if (!gameArea) return;
    gameArea.querySelectorAll('.lilypad-svg, .reed-svg-cluster, .grass-clump-svg, .prehistoric-tree-svg').forEach(el => el.remove());
}

function createSplashParticle(x, y) {
    if (!gameArea) return;
    const particle = document.createElement('div');
    particle.classList.add('splash-particle');
    particle.style.left = `${x - 2.5}px`;
    particle.style.top = `${y - 2.5}px`;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2;
    const force = 1 + Math.random() * 1.5;
    particle.dataset.vx = Math.cos(angle) * force;
    particle.dataset.vy = Math.sin(angle) * force * 1.5;
    particle.dataset.gravity = 0.08 + Math.random() * 0.04;
    particle.style.opacity = '0.8';
    gameArea.appendChild(particle);
    activeSplashParticles.push(particle);
}

function updateSplashParticles() {
    if (!gameArea) return;
    for (let i = activeSplashParticles.length - 1; i >= 0; i--) {
        const p = activeSplashParticles[i];
        if (!p || !p.parentNode) { // Safety check if particle was already removed
            activeSplashParticles.splice(i, 1);
            continue;
        }
        let newX = parseFloat(p.style.left) + parseFloat(p.dataset.vx);
        let newY = parseFloat(p.style.top) + parseFloat(p.dataset.vy);
        p.dataset.vy = (parseFloat(p.dataset.vy) || 0) + (parseFloat(p.dataset.gravity) || 0.1);
        
        p.style.left = `${newX}px`;
        p.style.top = `${newY}px`;
        
        let currentOpacity = parseFloat(p.style.opacity || 1);
        currentOpacity -= 0.03;
        p.style.opacity = Math.max(0, currentOpacity).toString();

        if (currentOpacity <= 0 || newY > gameArea.offsetHeight + 10) {
            p.remove();
            activeSplashParticles.splice(i, 1);
        }
    }
}

function updateDragonflyPosition() {
    if (!gameActive || isDashing || !gameArea || !dragonflyElement) return;
    const speedFactor = dragonflySpeedBoostActive ? 1.5 : 1;
    const actualSpeed = originalDragonflySpeed * speedFactor;
    const gameAreaRect = gameArea.getBoundingClientRect();
    const targetX = mouseX - gameAreaRect.left;
    const targetY = mouseY - gameAreaRect.top;
    const dx = targetX - (dragonflyX + dragonflyElement.offsetWidth / 2);
    const dy = targetY - (dragonflyY + dragonflyElement.offsetHeight / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const prevDragonflyBottom = dragonflyY + dragonflyElement.offsetHeight;

    if (distance > 1) {
        dragonflyX += dx * actualSpeed;
        dragonflyY += dy * actualSpeed;
        dragonflyAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    }
    dragonflyX = Math.max(0, Math.min(gameArea.offsetWidth - dragonflyElement.offsetWidth, dragonflyX));
    dragonflyY = Math.max(0, Math.min(gameArea.offsetHeight - dragonflyElement.offsetHeight, dragonflyY));
    dragonflyElement.style.left = `${dragonflyX}px`;
    dragonflyElement.style.top = `${dragonflyY}px`;
    dragonflyElement.style.transform = `rotate(${dragonflyAngle}deg)`;

    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (levelConf && levelConf.theme.type === 'water') {
        const waterLine = gameArea.offsetHeight * 0.5;
        const currentDragonflyBottom = dragonflyY + dragonflyElement.offsetHeight;
        if (prevDragonflyBottom <= waterLine && currentDragonflyBottom > waterLine) {
            for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
                createSplashParticle(dragonflyX + dragonflyElement.offsetWidth / 2 + (Math.random()-0.5)*20, waterLine);
            }
        }
    }
}

function dashDragonfly() {
    if (!gameActive || isDashing || Date.now() - lastDashTime < dashCooldown || !dragonflyElement || !gameArea) return;
    isDashing = true;
    preyCaughtThisDash = 0;
    lastDashTime = Date.now();
    if (gameSounds && gameSounds.dash) gameSounds.dash();
    const speedFactor = dragonflySpeedBoostActive ? 1.5 : 1;
    const actualDashDistance = originalDashDistance * speedFactor;
    const actualDashDuration = originalDashDuration / speedFactor;
    const currentAngleRad = dragonflyAngle * (Math.PI / 180);
    const startX = dragonflyX; const startY = dragonflyY;
    const endX = dragonflyX + Math.cos(currentAngleRad) * actualDashDistance;
    const endY = dragonflyY + Math.sin(currentAngleRad) * actualDashDistance;
    const startTime = performance.now();
    function animateDash(currentTime) {
        if (!isDashing || !gameActive) { // Stop if dash interrupted or game ended
            isDashing = false; preyCaughtThisDash = 0;
            return;
        }
        const elapsedTime = currentTime - startTime;
        let progress = Math.min(elapsedTime / actualDashDuration, 1);
        progress = 1 - Math.pow(1 - progress, 2);
        let newX = startX + (endX - startX) * progress;
        let newY = startY + (endY - startY) * progress;
        newX = Math.max(0, Math.min(gameArea.offsetWidth - dragonflyElement.offsetWidth, newX));
        newY = Math.max(0, Math.min(gameArea.offsetHeight - dragonflyElement.offsetHeight, newY));
        dragonflyX = newX; dragonflyY = newY;
        dragonflyElement.style.left = `${dragonflyX}px`;
        dragonflyElement.style.top = `${dragonflyY}px`;
        checkPreyCollisions(); 
        checkPlayerAttackOnEnemies();
        if (progress < 1) { requestAnimationFrame(animateDash); } else { isDashing = false; preyCaughtThisDash = 0; }
    }
    requestAnimationFrame(animateDash);
}

function createFly() {
    if (!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.skyFlySpawnRate === 0 || flies.length >= levelConf.maxSkyFlies) return;

    const fly = document.createElement('div');
    fly.classList.add('fly');
    const flyBodySize = 10;
    const margin = 4;
    const spawnableWidth = gameArea.offsetWidth - flyBodySize - (2 * margin);
    const flyZoneHeight = gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.5 : 0.9);
    const spawnableHeightArea = flyZoneHeight - flyBodySize - (2 * margin);
    const x = Math.random() * Math.max(0, spawnableWidth) + margin;
    const y = Math.random() * Math.max(0, spawnableHeightArea) + margin;
    fly.style.left = `${x}px`;
    fly.style.top = `${y}px`;
    const speedMod = levelConf.skyFlySpeedMultiplier;
   fly.dataset.vx = (Math.random() - 0.5) * 2 * speedMod * globalFlySpeedFactor;
    fly.dataset.vy = (Math.random() - 0.5) * 2 * speedMod * globalFlySpeedFactor;

    fly.dataset.x = x;
    fly.dataset.y = y;
    fly.dataset.id = `fly-${Date.now()}-${Math.random()}`;

    gameArea.appendChild(fly);
    flies.push(fly);
}
function updateFlies() {
    if (!gameActive || !gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const skyLimit = gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.5 : 1);
    flies.forEach(fly => {
        if (!fly || !fly.dataset) return;
        let x = parseFloat(fly.dataset.x); let y = parseFloat(fly.dataset.y);
        let vx = parseFloat(fly.dataset.vx); let vy = parseFloat(fly.dataset.vy);
        x += vx; y += vy;
        if (x <= 0 || x >= gameArea.offsetWidth - fly.offsetWidth) { vx *= -1; x = Math.max(0, Math.min(gameArea.offsetWidth - fly.offsetWidth, x)); }
        if (y <= 0 || y >= skyLimit - fly.offsetHeight) { vy *= -1; y = Math.max(0, Math.min(skyLimit - fly.offsetHeight, y)); }
        const changeDirChance = 0.02 + (currentLevel * 0.002);
        if (Math.random() < changeDirChance) {vx = (Math.random() - 0.5) * 2.5 * levelConf.skyFlySpeedMultiplier * globalFlySpeedFactor;
        }
        if (Math.random() < changeDirChance) vy = (Math.random() - 0.5) * 2.5 * levelConf.skyFlySpeedMultiplier * globalFlySpeedFactor;
        
        fly.style.left = `${x}px`; // x was already updated with old vx
        fly.style.top = `${y}px`;  // y was already updated with old vy

        fly.dataset.x = x; // Store the updated x
        fly.dataset.y = y; // Store the updated y
        fly.dataset.vx = vx; // Store the potentially new vx
        fly.dataset.vy = vy; // Store the potentially new vy
    });
}
function createWaterSkimmer() {
    if(!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.waterSkimmerSpawnRate === 0 || waterSkimmers.length >= levelConf.maxWaterSkimmers) return;
    const skimmer = document.createElement('div'); skimmer.classList.add('water-skimmer');
    skimmer.innerHTML = `<svg viewBox="0 0 20 8"><ellipse cx="10" cy="4" rx="9" ry="3" fill="var(--skimmer-body-k)" stroke="var(--outline-k)" stroke-width="1"/><line x1="2" y1="4" x2="-2" y2="2" stroke="var(--outline-k)" stroke-width="1"/><line x1="18" y1="4" x2="22" y2="2" stroke="var(--outline-k)" stroke-width="1"/></svg>`;
    const x = Math.random() * (gameArea.offsetWidth - 20) + 10;
    const y = (gameArea.offsetHeight * (0.5 + Math.random() * 0.45)) - 4; // Ensure on water
    skimmer.style.left = `${x}px`; skimmer.style.top = `${y}px`;
    const speedMod = levelConf.waterSkimmerSpeedMultiplier;
    skimmer.dataset.vx = (Math.random() - 0.5) * 3 * speedMod;
    skimmer.dataset.vy = (Math.random() - 0.5) * 1 * speedMod;
    skimmer.dataset.x = x; skimmer.dataset.y = y;
    skimmer.dataset.id = `skimmer-${Date.now()}-${Math.random()}`;
    gameArea.appendChild(skimmer); waterSkimmers.push(skimmer);
}
function updateWaterSkimmers() {
    if (!gameActive || !gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const waterLine = gameArea.offsetHeight * 0.5;
    waterSkimmers.forEach(skimmer => {
        if (!skimmer || !skimmer.dataset) return;
        let x = parseFloat(skimmer.dataset.x); let y = parseFloat(skimmer.dataset.y);
        let vx = parseFloat(skimmer.dataset.vx); let vy = parseFloat(skimmer.dataset.vy);
        x += vx; y += vy;
        if (x <= 0 || x >= gameArea.offsetWidth - skimmer.offsetWidth) vx *= -1;
        if (y <= waterLine || y >= gameArea.offsetHeight - skimmer.offsetHeight) { vy *= -1; y = Math.max(waterLine, Math.min(gameArea.offsetHeight - skimmer.offsetHeight, y)); }
        if (Math.random() < 0.03) vx = (Math.random() - 0.5) * 3.5 * levelConf.waterSkimmerSpeedMultiplier;
        if (Math.random() < 0.05) vy = (Math.random() - 0.5) * 1.5 * levelConf.waterSkimmerSpeedMultiplier;
        skimmer.style.left = `${x}px`; skimmer.style.top = `${y}px`;
        skimmer.dataset.x = x; skimmer.dataset.y = y; skimmer.dataset.vx = vx; skimmer.dataset.vy = vy;
    });
}
function createPredatorBird() {
    if(!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.birdSpawnRate === 0 || predatorBirds.length >= (levelConf.maxPredatorBirds || 3) ) return; // Added maxPredatorBirds
    const bird = document.createElement('div'); bird.classList.add('predator-bird');
    bird.innerHTML = `<svg viewBox="0 0 100 60"><path class="bird-wing-k back" d="M65,30 Q40,5 15,25 L35,30 Q50,45 65,30 Z" fill="var(--bird-wing-k)" stroke="var(--outline-k)" stroke-width="2"/><ellipse cx="50" cy="30" rx="30" ry="15" fill="var(--bird-body-k)" stroke="var(--outline-k)" stroke-width="3"/><circle cx="78" cy="25" r="10" fill="var(--bird-body-k)" stroke="var(--outline-k)" stroke-width="2.5"/><circle cx="83" cy="23" r="4" fill="var(--bird-eye-k)"/><circle cx="83" cy="23" r="2" fill="var(--outline-k)"/><polygon points="85,25 100,28 85,31" fill="var(--bird-beak-k)" stroke="var(--outline-k)" stroke-width="1.5"/><path class="bird-wing-k front" d="M65,30 Q40,55 15,35 L35,30 Q50,15 65,30 Z" fill="var(--bird-wing-k)" stroke="var(--outline-k)" stroke-width="2"/></svg>`;
    const fliesRight = Math.random() < 0.5;
    const startY = Math.random() * (gameArea.offsetHeight * 0.6) + (gameArea.offsetHeight * 0.1); // Mid-sky
    if (fliesRight) { bird.style.left = `-120px`; bird.dataset.vx = levelConf.birdSpeed; bird.style.transform = 'scaleX(1)'; }
    else { bird.style.left = `${gameArea.offsetWidth}px`; bird.dataset.vx = -levelConf.birdSpeed; bird.style.transform = 'scaleX(-1)'; }
    bird.style.top = `${startY}px`; bird.dataset.y = startY; // Store initial Y for potential swooping
    gameArea.appendChild(bird); predatorBirds.push(bird);
}
function updatePredatorBirds() {
    if (!gameActive || !gameArea) return;
    for (let i = predatorBirds.length - 1; i >= 0; i--) {
        const bird = predatorBirds[i];
        if (!bird || !bird.dataset) { predatorBirds.splice(i, 1); continue; }
        let x = parseFloat(bird.style.left);
        const vx = parseFloat(bird.dataset.vx);
        x += vx; bird.style.left = `${x}px`;
        if ((vx > 0 && x > gameArea.offsetWidth) || (vx < 0 && x < -bird.offsetWidth)) {
            bird.remove(); predatorBirds.splice(i, 1);
        }
    }
}
function createJumpingFish() {
    if(!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.fishSpawnRate === 0 || jumpingFish.length >= (levelConf.maxJumpingFish || 2)) return;
    const fish = document.createElement('div'); fish.classList.add('jumping-fish');
    fish.innerHTML = `<svg viewBox="0 0 60 40"><ellipse cx="30" cy="20" rx="28" ry="15" fill="var(--fish-body-k)" stroke="var(--outline-k)" stroke-width="2.5"/><path d="M5,20 Q15,10 30,15 L30,25 Q15,30 5,20 Z" fill="var(--fish-fin-k)" stroke="var(--outline-k)" stroke-width="1.5"/><circle cx="48" cy="18" r="4" fill="white"/><circle cx="48" cy="18" r="2" fill="var(--outline-k)"/></svg>`;
    const startX = Math.random() * (gameArea.offsetWidth - 60);
    fish.style.left = `${startX}px`; fish.style.top = `${gameArea.offsetHeight}px`; // Start below screen
    fish.dataset.startY = gameArea.offsetHeight;
    fish.dataset.jumpForce = -levelConf.fishJumpForce - (Math.random() * 4);
    fish.dataset.gravity = 0.4; fish.dataset.vy = fish.dataset.jumpForce;
    gameArea.appendChild(fish); jumpingFish.push(fish);
}
function updateJumpingFish() {
    if (!gameActive || !gameArea) return;
    for (let i = jumpingFish.length - 1; i >= 0; i--) {
        const fish = jumpingFish[i];
        if (!fish || !fish.dataset) { jumpingFish.splice(i, 1); continue; }
        let y = parseFloat(fish.style.top); let vy = parseFloat(fish.dataset.vy);
        const gravity = parseFloat(fish.dataset.gravity);
        const startY = parseFloat(fish.dataset.startY);
        vy += gravity; y += vy;
        fish.style.top = `${y}px`; fish.dataset.vy = vy;
        const angle = vy < 0 ? -15 + (vy/ (parseFloat(fish.dataset.jumpForce) || -10)) * 30 : 15 + (vy/15) * 30;
        fish.style.transform = `rotate(${angle}deg)`;
        if (y > startY + fish.offsetHeight) { fish.remove(); jumpingFish.splice(i, 1); }
    }
}

function createHunterFrog() {
    if(!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.hunterFrogSpawnRate === 0 || hunterFrogs.length >= (levelConf.maxHunterFrogs || 1) ) return;
    const frogEl = document.createElement('div');
    frogEl.classList.add('hunter-frog');
    frogEl.innerHTML = `<svg viewBox="0 0 60 45"><ellipse cx="30" cy="28" rx="25" ry="15" fill="var(--frog-body-k)" stroke="var(--outline-k)" stroke-width="2.5"/><circle cx="18" cy="15" r="10" fill="var(--frog-body-k)" stroke="var(--outline-k)" stroke-width="2"/><circle cx="42" cy="15" r="10" fill="var(--frog-body-k)" stroke="var(--outline-k)" stroke-width="2"/><circle class="frog-eye-k" cx="18" cy="15" r="5" fill="var(--frog-eye-k)"/><circle cx="18" cy="15" r="2.5" fill="var(--frog-pupil-k)"/><circle class="frog-eye-k" cx="42" cy="15" r="5" fill="var(--frog-eye-k)"/><circle cx="42" cy="15" r="2.5" fill="var(--frog-pupil-k)"/></svg>`;
    const x = Math.random() * (gameArea.offsetWidth - 60);
    const waterLine = gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.5 : 0.8);
    const y = waterLine + Math.random() * (gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.5 : 0.2) - 45);
    frogEl.style.left = `${x}px`; frogEl.style.top = `${y}px`;
    const frogObj = { element: frogEl, x: x, y: y, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.4, health: levelConf.hunterFrogHealth, lungeSpeed: levelConf.hunterFrogLungeSpeed, isLunging: false, isPreparingLunge: false, lungePrepareTimer: null, lungeCooldown: 2500 + Math.random() * 1000, lastLungeTime: 0, pursuitRange: 180 + Math.random() * 50, lungeDelay: levelConf.hunterFrogLungeDelay || 300 };
    gameArea.appendChild(frogEl); hunterFrogs.push(frogObj);
}

function updateHunterFrogs() {
    if (!gameActive || !gameArea || !dragonflyElement) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const waterLine = gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.5 : 0.8);

    hunterFrogs.forEach(frog => {
        if (!frog.element) return;
        if (frog.isLunging) {
            frog.x += frog.vx; frog.y += frog.vy;
            if (frog.x <= 0 || frog.x >= gameArea.offsetWidth - frog.element.offsetWidth || frog.y <= (levelConf.theme.type === 'water' ? waterLine : 0) || frog.y >= gameArea.offsetHeight - frog.element.offsetHeight) {
                frog.isLunging = false; frog.vx = (Math.random() - 0.5) * 0.8; frog.vy = (Math.random() - 0.5) * 0.4;
            }
        } else if (frog.isPreparingLunge) {
            // CSS handles visual, timer handles logic
        } else {
            const dfCenterX = dragonflyX + dragonflyElement.offsetWidth / 2;
            const dfCenterY = dragonflyY + dragonflyElement.offsetHeight / 2;
            const frogCenterX = frog.x + frog.element.offsetWidth / 2;
            const frogCenterY = frog.y + frog.element.offsetHeight / 2;
            const dx = dfCenterX - frogCenterX; const dy = dfCenterY - frogCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < frog.pursuitRange &&
                (levelConf.theme.type !== 'water' || dfCenterY > waterLine) &&
                Date.now() - frog.lastLungeTime > frog.lungeCooldown) {

                frog.isPreparingLunge = true;
                frog.element.classList.add('preparing-lunge');
                if(frog.lungePrepareTimer) clearTimeout(frog.lungePrepareTimer);
                frog.lungePrepareTimer = setTimeout(() => {
                    if (!frog.element || !gameActive) {
                        if(frog.element) frog.element.classList.remove('preparing-lunge');
                        frog.isPreparingLunge = false; return;
                    }
                    frog.isPreparingLunge = false;
                    frog.element.classList.remove('preparing-lunge');
                    frog.isLunging = true;
                    frog.lastLungeTime = Date.now();
                    const angle = Math.atan2(dy, dx);
                    frog.vx = Math.cos(angle) * frog.lungeSpeed;
                    frog.vy = Math.sin(angle) * frog.lungeSpeed;
                    if (gameSounds.frogLunge) gameSounds.frogLunge();
                    setTimeout(() => {
                        if (frog.isLunging) {
                            frog.isLunging = false;
                            frog.vx = (Math.random() - 0.5) * 0.8; frog.vy = (Math.random() - 0.5) * 0.4;
                        }
                    }, 600 + Math.random() * 300);
                }, frog.lungeDelay);
            } else {
                frog.x += frog.vx; frog.y += frog.vy;
                if (frog.x <= 0 || frog.x >= gameArea.offsetWidth - frog.element.offsetWidth) frog.vx *= -1;
                const lowerBound = levelConf.theme.type === 'water' ? waterLine : 0;
                if (frog.y <= lowerBound || frog.y >= gameArea.offsetHeight - frog.element.offsetHeight) frog.vy *= -1;
                frog.y = Math.max(lowerBound, Math.min(gameArea.offsetHeight - frog.element.offsetHeight, frog.y));
            }
        }
        frog.element.style.left = `${frog.x}px`; frog.element.style.top = `${frog.y}px`;
        if (frog.vx !== 0 && !frog.isLunging && !frog.isPreparingLunge) {
            frog.element.style.transform = frog.vx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
        } else if (frog.isLunging || (frog.isPreparingLunge && !frog.element.style.transform.includes('scale(1.05)'))) {
             const dfCenterX = dragonflyX + dragonflyElement.offsetWidth / 2;
             const frogCenterX = frog.x + frog.element.offsetWidth / 2;
             frog.element.style.transform = dfCenterX > frogCenterX ? 'scaleX(1)' : 'scaleX(-1)';
        }
    });
}

function createSkyTerror() {
    if(!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.skyTerrorSpawnRate === 0 || skyTerrors.length >= (levelConf.maxSkyTerrors || 1) ) return;
    const terrorEl = document.createElement('div'); terrorEl.classList.add('sky-terror');
    terrorEl.innerHTML = `<svg viewBox="0 0 110 80"><path class="sky-terror-wing-anim-k" d="M60,40 Q25,10 0,35 L30,45 Q45,60 60,40 Z" fill="var(--sky-terror-wing-k)" stroke="var(--outline-k)" stroke-width="2.5" style="animation-name: skyTerrorFlap-k;"/><ellipse cx="55" cy="40" rx="35" ry="18" fill="var(--sky-terror-body-k)" stroke="var(--outline-k)" stroke-width="3"/><circle cx="85" cy="30" r="12" fill="var(--sky-terror-body-k)" stroke="var(--outline-k)" stroke-width="2.5"/><circle cx="90" cy="28" r="5" fill="#FF1744"/><circle cx="90" cy="28" r="2" fill="#FFFF00"/><path class="sky-terror-wing-anim-k" d="M60,40 Q25,70 0,45 L30,35 Q45,20 60,40 Z" fill="var(--sky-terror-wing-k)" stroke="var(--outline-k)" stroke-width="2.5" style="animation-name: skyTerrorFlap-k; animation-direction: alternate-reverse;"/></svg>`;
    const fliesRight = Math.random() < 0.5;
    const startY = Math.random() * (gameArea.offsetHeight * 0.4);
    let x, vx;
    if (fliesRight) { x = -terrorEl.offsetWidth - 20; vx = levelConf.skyTerrorSpeed; terrorEl.style.transform = 'scaleX(1)'; }
    else { x = gameArea.offsetWidth + 20; vx = -levelConf.skyTerrorSpeed; terrorEl.style.transform = 'scaleX(-1)';}
    terrorEl.style.left = `${x}px`; terrorEl.style.top = `${startY}px`;
    const terrorObj = { element: terrorEl, x: x, y: startY, vx: vx, vy: (Math.random() - 0.5) * 0.4, health: levelConf.skyTerrorHealth, initialVx: vx, pursuitRange: 220 + Math.random() * 80, isEngaged: false, isEngaging: false, chargeTimer: null, engageDelay: levelConf.skyTerrorEngageDelay || 400 };
    gameArea.appendChild(terrorEl); skyTerrors.push(terrorObj);
}
function updateSkyTerrors() {
    if (!gameActive || !gameArea || !dragonflyElement) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const skyLimit = gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.5 : 1);

    skyTerrors.forEach((terror, index) => {
        if (!terror.element) return;
        const dfCenterX = dragonflyX + dragonflyElement.offsetWidth / 2;
        const dfCenterY = dragonflyY + dragonflyElement.offsetHeight / 2;
        const terrorCenterX = terror.x + terror.element.offsetWidth / 2;
        const terrorCenterY = terror.y + terror.element.offsetHeight / 2;
        const dx = dfCenterX - terrorCenterX; const dy = dfCenterY - terrorCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!terror.isEngaged && !terror.isEngaging && distance < terror.pursuitRange && dfCenterY < skyLimit) {
            terror.isEngaging = true;
            terror.element.classList.add('charging');
            if(terror.chargeTimer) clearTimeout(terror.chargeTimer);
            terror.chargeTimer = setTimeout(() => {
                if (!terror.element || !gameActive) {
                    if(terror.element) terror.element.classList.remove('charging');
                    terror.isEngaging = false; return;
                }
                terror.isEngaging = false;
                terror.isEngaged = true;
                terror.element.classList.remove('charging');
            }, terror.engageDelay);
        } else if (terror.isEngaged) {
            const angle = Math.atan2(dy, dx);
            const speed = levelConf.skyTerrorSpeed;
            terror.vx = Math.cos(angle) * speed * 1.1;
            terror.vy = Math.sin(angle) * speed * 1.1;
            if (distance > terror.pursuitRange * 1.5) {
                terror.isEngaged = false;
                terror.vx = terror.initialVx;
                terror.vy = (Math.random() - 0.5) * 0.4;
            }
        } else if (!terror.isEngaging) {
            terror.vx = terror.initialVx;
            terror.vy = (Math.random() - 0.5) * 0.4 * (levelConf.skyTerrorSpeed / 2);
        }

        terror.x += terror.vx; terror.y += terror.vy;

        if (!terror.isEngaged && !terror.isEngaging && ( (terror.initialVx > 0 && terror.x > gameArea.offsetWidth + 50) || (terror.initialVx < 0 && terror.x < -terror.element.offsetWidth - 50))) {
            terror.element.remove(); skyTerrors.splice(index, 1); return;
        }
        if (terror.y < 0) { terror.y = 0; terror.vy *= -0.5; }
        if (terror.y > skyLimit - terror.element.offsetHeight) { terror.y = skyLimit - terror.element.offsetHeight; terror.vy *= -0.5; }

        terror.element.style.left = `${terror.x}px`; terror.element.style.top = `${terror.y}px`;
        if(terror.vx !== 0 && !terror.isEngaging) {
            terror.element.style.transform = terror.vx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
        } else if (terror.isEngaging) {
             terror.element.style.transform = dfCenterX > terrorCenterX ? 'scaleX(1)' : 'scaleX(-1)';
        }
    });
}

function createPowerUpFruit() {
    if(!gameArea) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!gameActive || levelConf.powerUpFruitSpawnRate === 0 || powerUpFruits.length >= levelConf.maxPowerUpFruits) return;
    const fruit = document.createElement('div'); fruit.classList.add('power-up-fruit');
    const fruitTypes = ['speed', 'time', 'invincible'];
    const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
    fruit.dataset.type = type; let svgContent = '', fruitColor = 'var(--fruit-speed-k)';
    const outlineStroke = "var(--outline-k)"; const outlineWidth = "2";
    switch(type) {
        case 'speed': fruitColor = 'var(--fruit-speed-k)';
            svgContent = `<svg viewBox="-2 -2 34 34"><path d="M15 2 L25 15 L15 28 L5 15 Z" fill="${fruitColor}" stroke="${outlineStroke}" stroke-width="${outlineWidth}"/><path d="M10 20 L15 15 L10 10 M16 20 L21 15 L16 10" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round"/></svg>`; break;
        case 'time': fruitColor = 'var(--fruit-time-k)';
            svgContent = `<svg viewBox="-2 -2 34 34"><circle cx="15" cy="15" r="14" fill="${fruitColor}" stroke="${outlineStroke}" stroke-width="${outlineWidth}"/><path d="M15 8 V15 H22" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="15" cy="15" r="2" fill="white"/></svg>`; break;
        case 'invincible': fruitColor = 'var(--fruit-invincible-k)';
            svgContent = `<svg viewBox="-2 -2 34 34"><path d="M15 0 L18.53 10.45 L29.72 10.45 L20.59 17 L24.27 27.29 L15 20.5 L5.73 27.29 L9.41 17 L0.28 10.45 L11.47 10.45 Z" fill="${fruitColor}" stroke="${outlineStroke}" stroke-width="${outlineWidth}"/></svg>`; break;
    }
    fruit.innerHTML = svgContent;
    const x = Math.random() * (gameArea.offsetWidth - 35);
    const y = Math.random() * (gameArea.offsetHeight * (levelConf.theme.type === 'water' ? 0.8 : 0.9) - 35) + 10;
    fruit.style.left = `${x}px`; fruit.style.top = `${y}px`;
    fruit.dataset.vx = (Math.random() - 0.5) * 0.4; fruit.dataset.vy = (Math.random() - 0.5) * 0.4;
    fruit.dataset.life = 7000 + Math.random() * 3000;
    gameArea.appendChild(fruit);
    powerUpFruits.push({element: fruit, x:x, y:y, vx: parseFloat(fruit.dataset.vx), vy: parseFloat(fruit.dataset.vy), spawnTime: Date.now(), life: parseFloat(fruit.dataset.life) });
}
function updatePowerUpFruits() {
    if (!gameActive || !gameArea) return;
    for (let i = powerUpFruits.length - 1; i >= 0; i--) {
        const fruitObj = powerUpFruits[i];
        if (!fruitObj.element || !fruitObj.element.parentNode) { // Check if element exists and is in DOM
            powerUpFruits.splice(i, 1);
            continue;
        }
        fruitObj.x += fruitObj.vx; fruitObj.y += fruitObj.vy;
        if (fruitObj.x <= 0 || fruitObj.x >= gameArea.offsetWidth - fruitObj.element.offsetWidth) fruitObj.vx *= -1;
        if (fruitObj.y <= 0 || fruitObj.y >= gameArea.offsetHeight - fruitObj.element.offsetHeight) fruitObj.vy *= -1;
        fruitObj.element.style.left = `${fruitObj.x}px`; fruitObj.element.style.top = `${fruitObj.y}px`;
        if (Date.now() - fruitObj.spawnTime > fruitObj.life) { fruitObj.element.remove(); powerUpFruits.splice(i, 1); }
    }
}
function checkPowerUpFruitCollision() {
    if (!gameActive || !dragonflyElement || !gameArea || isDashing) return;
    const dfRect = dragonflyElement.getBoundingClientRect();
    for (let i = powerUpFruits.length - 1; i >= 0; i--) {
        const fruitObj = powerUpFruits[i];
        if (!fruitObj.element || !fruitObj.element.parentNode) { powerUpFruits.splice(i,1); continue; }
        const fruitRect = fruitObj.element.getBoundingClientRect();
        if (dfRect.left < fruitRect.right && dfRect.right > fruitRect.left && dfRect.top < fruitRect.bottom && dfRect.bottom > fruitRect.top) {
            if(gameSounds.powerUpCollect) gameSounds.powerUpCollect();
            activatePowerUp(fruitObj.element.dataset.type);
            fruitObj.element.remove(); powerUpFruits.splice(i, 1);
            return;
        }
    }
}
function activatePowerUp(type) {
    if(gameSounds.powerUpActivate) gameSounds.powerUpActivate();
    const gameAreaRect = gameArea.getBoundingClientRect();
    const popupX = dragonflyX + dragonflyElement.offsetWidth / 2 - gameAreaRect.left;
    const popupY = dragonflyY - 20 - gameAreaRect.top;
    let popupColor = 'var(--score-popup-color-k)';
    if (type === 'speed' && speedBoostTimerId) clearTimeout(speedBoostTimerId);
    if (type === 'invincible' && invincibilityTimerId) clearTimeout(invincibilityTimerId);
    switch(type) {
        case 'speed': dragonflySpeedBoostActive = true; dragonflyElement.classList.add('speed-boost-k'); popupColor = 'var(--fruit-speed-k)'; showScorePopup(popupX, popupY, "Speed Up!", popupColor); speedBoostTimerId = setTimeout(() => deactivatePowerUp('speed'), 7000); break;
        case 'time': timeLeft += 5; if(timeDisplay) timeDisplay.textContent = timeLeft; popupColor = 'var(--fruit-time-k)'; showScorePopup(popupX, popupY, "+5 Sec!", popupColor); break;
        case 'invincible': dragonflyIsInvincible = true; dragonflyElement.classList.add('invincible-k'); popupColor = 'var(--fruit-invincible-k)'; showScorePopup(popupX, popupY, "Invincible!", popupColor); invincibilityTimerId = setTimeout(() => deactivatePowerUp('invincible'), 5000); break;
    }
}
function deactivatePowerUp(type) {
    if(gameSounds.powerUpDeactivate) gameSounds.powerUpDeactivate();
    switch(type) {
        case 'speed': dragonflySpeedBoostActive = false; if(dragonflyElement) dragonflyElement.classList.remove('speed-boost-k'); break;
        case 'invincible': dragonflyIsInvincible = false; if(dragonflyElement) dragonflyElement.classList.remove('invincible-k'); break;
    }
}
function showHitEffect(element) {
    if(!gameArea || !element) return;
    const rect = element.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    if (!gameAreaRect.width) return;
    const effect = document.createElement('div'); effect.classList.add('hit-effect');
    effect.style.left = `${rect.left + rect.width/2 - 12.5 - gameAreaRect.left}px`;
    effect.style.top = `${rect.top + rect.height/2 - 12.5 - gameAreaRect.top}px`;
    gameArea.appendChild(effect); setTimeout(() => {if(effect)effect.remove()}, 200);
}
function showEnemyImpactEffect(element) {
    if (!gameArea || !element) return;
    const enemyHitIndicator = document.createElement('div');
    enemyHitIndicator.classList.add('enemy-impact-indicator');
    const rect = element.getBoundingClientRect();
    const gameAreaRect = gameArea.getBoundingClientRect();
    if (!gameAreaRect.width) return;

    enemyHitIndicator.style.left = `${rect.left + rect.width / 2 - 15 - gameAreaRect.left}px`;
    enemyHitIndicator.style.top = `${rect.top + rect.height / 2 - 15 - gameAreaRect.top}px`;
    gameArea.appendChild(enemyHitIndicator);
    
    element.classList.add('hit-by-player');
    setTimeout(() => {
        if (enemyHitIndicator && enemyHitIndicator.parentNode) enemyHitIndicator.remove();
        if (element && element.classList) element.classList.remove('hit-by-player');
    }, 150);
}

function showScorePopup(x, y, points, color = 'var(--score-popup-color-k)') {
    if(!gameArea) return;
    const popup = document.createElement('div');
    
    if (typeof points === 'string' && points.startsWith("-")) {
        popup.classList.add('time-penalty-popup');
        popup.style.color = color;
    } else {
        popup.classList.add('score-popup');
        popup.style.color = color;
        if (isDashing && preyCaughtThisDash > 0) {
            popup.classList.add('dash-combo');
        }
    }
    popup.textContent = (typeof points === 'number' && points > 0 ? "+" : "") + points;
    popup.style.left = `${x}px`; popup.style.top = `${y - 15}px`;
    gameArea.appendChild(popup);
    setTimeout(() => {if(popup && popup.parentNode) popup.remove(); }, popup.classList.contains('time-penalty-popup') ? 990 : 690);
}
function checkGenericHazardCollision(hazardsArray, penaltyKey, soundName = 'hazardHit') {
    if (!gameActive || !dragonflyElement || !gameArea || !hazardsArray || dragonflyIsInvincible) return false;
    const dfRect = dragonflyElement.getBoundingClientRect();
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const gameAreaRect = gameArea.getBoundingClientRect();
    if (!gameAreaRect.width) return false;

    for (let i = hazardsArray.length - 1; i >= 0; i--) {
        const hazard = hazardsArray[i];
        const hazardElement = hazard.element || hazard;
        if (!hazardElement || !hazardElement.parentNode) { hazardsArray.splice(i,1); continue; }
        const hazardRect = hazardElement.getBoundingClientRect();
        if (dfRect.left < hazardRect.right && dfRect.right > hazardRect.left && dfRect.top < hazardRect.bottom && dfRect.bottom > hazardRect.top) {
            if (gameSounds[soundName]) gameSounds[soundName]();
            const penalty = levelConf[penaltyKey] || 2;
            timeLeft -= penalty;
            if(timeDisplay) timeDisplay.textContent = timeLeft;
            const popupX = dfRect.left + dfRect.width / 2 - gameAreaRect.left;
            const popupY = dfRect.top - 20 - gameAreaRect.top;
            showScorePopup(popupX, popupY, `-${penalty}s`, '#FF4081');
            hazardElement.remove(); hazardsArray.splice(i, 1);
            if (timeLeft <= 0) endGame(); return true;
        }
    } return false;
}
function checkEnemyAttackCollisions() {
    if (dragonflyIsInvincible || !gameActive || !dragonflyElement || !gameArea) return false;
    const dfRect = dragonflyElement.getBoundingClientRect();
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const gameAreaRect = gameArea.getBoundingClientRect();
    if (!gameAreaRect.width) return false;

    for (let i = hunterFrogs.length - 1; i >= 0; i--) {
        const frog = hunterFrogs[i];
        if (!frog.element || !frog.isLunging) continue;
        const frogRect = frog.element.getBoundingClientRect();
        if (dfRect.left < frogRect.right && dfRect.right > frogRect.left && dfRect.top < frogRect.bottom && dfRect.bottom > frogRect.top) {
            if (gameSounds.birdHit) gameSounds.birdHit();
            timeLeft -= levelConf.hunterFrogDamage;
            if(timeDisplay) timeDisplay.textContent = timeLeft;
            const popupX = dfRect.left + dfRect.width / 2 - gameAreaRect.left;
            const popupY = dfRect.top - 20 - gameAreaRect.top;
            showScorePopup(popupX, popupY, `-${levelConf.hunterFrogDamage}s`, '#FF4081');
            frog.isLunging = false; frog.isPreparingLunge = false; frog.element.classList.remove('preparing-lunge');
            if(frog.lungePrepareTimer) clearTimeout(frog.lungePrepareTimer);
            frog.vx = (Math.random() - 0.5) * 0.8; frog.vy = (Math.random() - 0.5) * 0.4;
            frog.lastLungeTime = Date.now() + 1000;
            if (timeLeft <= 0) endGame(); return true;
        }
    }
    for (let i = skyTerrors.length - 1; i >= 0; i--) {
        const terror = skyTerrors[i];
        if (!terror.element || !terror.isEngaged) continue;
        const terrorRect = terror.element.getBoundingClientRect();
        if (dfRect.left < terrorRect.right && dfRect.right > terrorRect.left && dfRect.top < terrorRect.bottom && dfRect.bottom > terrorRect.top) {
            if (gameSounds.birdHit) gameSounds.birdHit();
            timeLeft -= levelConf.skyTerrorDamage;
            if(timeDisplay) timeDisplay.textContent = timeLeft;
            const popupX = dfRect.left + dfRect.width / 2 - gameAreaRect.left;
            const popupY = dfRect.top - 20 - gameAreaRect.top;
            showScorePopup(popupX, popupY, `-${levelConf.skyTerrorDamage}s`, '#FF4081');
            terror.x -= terror.vx * 5; terror.y -= terror.vy * 5;
            terror.isEngaged = false; terror.isEngaging = false; terror.element.classList.remove('charging');
            if(terror.chargeTimer) clearTimeout(terror.chargeTimer);
            terror.vx = terror.initialVx; terror.vy = (Math.random() - 0.5) * 0.4;
            if (timeLeft <= 0) endGame(); return true;
        }
    }
    return false;
}
function checkPlayerAttackOnEnemies() {
    if (!isDashing || !dragonflyElement || !gameArea) return;
    const dfRect = dragonflyElement.getBoundingClientRect();
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const gameAreaRect = gameArea.getBoundingClientRect();
    if (!gameAreaRect.width) return;

    for (let i = hunterFrogs.length - 1; i >= 0; i--) {
        const frog = hunterFrogs[i];
        if (!frog.element) continue;
        const frogRect = frog.element.getBoundingClientRect();
        if (dfRect.left < frogRect.right && dfRect.right > frogRect.left && dfRect.top < frogRect.bottom && dfRect.bottom > frogRect.top) {
            frog.health--;
            showEnemyImpactEffect(frog.element);
            if (gameSounds.enemyHit) gameSounds.enemyHit();
            if (frog.health <= 0) {
                if (gameSounds.enemyDefeated) gameSounds.enemyDefeated();
                score += levelConf.hunterFrogPoints || 5;
                if(scoreDisplay) scoreDisplay.textContent = score;
                const popupX = frogRect.left + frogRect.width / 2 - gameAreaRect.left;
                const popupY = frogRect.top + frogRect.height / 2 - gameAreaRect.top;
                showScorePopup(popupX, popupY, `+${levelConf.hunterFrogPoints || 5}`);
                if(frog.lungePrepareTimer) clearTimeout(frog.lungePrepareTimer);
                frog.element.remove(); hunterFrogs.splice(i, 1);
            } else {
                frog.x -= Math.cos(dragonflyAngle * Math.PI / 180) * 25;
                frog.y -= Math.sin(dragonflyAngle * Math.PI / 180) * 25;
                frog.isLunging = false; frog.isPreparingLunge = false; frog.element.classList.remove('preparing-lunge');
                if(frog.lungePrepareTimer) clearTimeout(frog.lungePrepareTimer);
                frog.lastLungeTime = Date.now() + 500;
            } return;
        }
    }
    for (let i = skyTerrors.length - 1; i >= 0; i--) {
        const terror = skyTerrors[i];
        if (!terror.element) continue;
        const terrorRect = terror.element.getBoundingClientRect();
        if (dfRect.left < terrorRect.right && dfRect.right > terrorRect.left && dfRect.top < terrorRect.bottom && dfRect.bottom > terrorRect.top) {
            terror.health--;
            showEnemyImpactEffect(terror.element);
            if (gameSounds.enemyHit) gameSounds.enemyHit();
            if (terror.health <= 0) {
                if (gameSounds.enemyDefeated) gameSounds.enemyDefeated();
                score += levelConf.skyTerrorPoints || 5;
                if(scoreDisplay) scoreDisplay.textContent = score;
                const popupX = terrorRect.left + terrorRect.width / 2 - gameAreaRect.left;
                const popupY = terrorRect.top + terrorRect.height / 2 - gameAreaRect.top;
                showScorePopup(popupX, popupY, `+${levelConf.skyTerrorPoints || 5}`);
                if(terror.chargeTimer) clearTimeout(terror.chargeTimer);
                terror.element.remove(); skyTerrors.splice(i, 1);
            } else {
                terror.x -= Math.cos(dragonflyAngle * Math.PI / 180) * 35;
                terror.y -= Math.sin(dragonflyAngle * Math.PI / 180) * 35;
                terror.isEngaged = false; terror.isEngaging = false; terror.element.classList.remove('charging');
                if(terror.chargeTimer) clearTimeout(terror.chargeTimer);
            } return;
        }
    }
}
function checkPreyCollisions() {
    if(!dragonflyElement || !gameArea) return;
    const dfRect = dragonflyElement.getBoundingClientRect();
    const allPrey = [...flies, ...waterSkimmers];
    for (let i = allPrey.length - 1; i >= 0; i--) {
        const prey = allPrey[i];
        if(!prey || !prey.parentNode) { allPrey.splice(i, 1); continue; } // Remove if already gone
        const preyRect = prey.getBoundingClientRect();
        if (dfRect.left < preyRect.right && dfRect.right > preyRect.left && dfRect.top < preyRect.bottom && dfRect.bottom > preyRect.top) {
            const catchEffect = document.createElement('div'); catchEffect.classList.add('catch-effect');
            const gameAreaRect = gameArea.getBoundingClientRect();
            if(!gameAreaRect.width) return; // Game area not ready
            const effectX = preyRect.left + preyRect.width / 2 - 15 - gameAreaRect.left;
            const effectY = preyRect.top + preyRect.height / 2 - 15 - gameAreaRect.top;
            catchEffect.style.left = `${effectX}px`; catchEffect.style.top = `${effectY}px`;
            gameArea.appendChild(catchEffect);
            setTimeout(() => {if(catchEffect && catchEffect.parentNode) catchEffect.remove();}, 300);
            
            if (isDashing) preyCaughtThisDash++;
            showScorePopup(effectX, effectY, 1);

            prey.remove();
            if (flies.includes(prey)) flies.splice(flies.indexOf(prey), 1);
            if (waterSkimmers.includes(prey)) waterSkimmers.splice(waterSkimmers.indexOf(prey), 1);
            
            score++; preyCaughtThisLevel++;
            if(scoreDisplay) scoreDisplay.textContent = score;
            updatePreyLeftDisplay();
            if (gameSounds && gameSounds.catch) gameSounds.catch();
            const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
            if (preyCaughtThisLevel >= levelConf.preyToLevelUp) { levelUp(); }
        }
    }
}
function checkAllPassiveObstacleCollisions() {
    if (dragonflyIsInvincible) return;
    if (checkGenericHazardCollision(predatorBirds, 'birdTimePenalty', 'birdHit')) return;
    if (checkGenericHazardCollision(jumpingFish, 'fishTimePenalty', 'fishSplash')) return;
}
function updateTimer() {
    timeLeft--;
    if(timeDisplay) {
        timeDisplay.textContent = timeLeft;
        if (timeLeft < 10 && timeLeft > 0 && gameActive) {
            timeDisplay.classList.add('low-time-warning');
        } else {
            timeDisplay.classList.remove('low-time-warning');
        }
    }
    if (timeLeft <= 0 && gameActive) {
        endGame();
    }
}
function updatePreyLeftDisplay() {
    if(!fliesLeftDisplay) return;
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    const preyRemaining = levelConf.preyToLevelUp - preyCaughtThisLevel;
    fliesLeftDisplay.textContent = Math.max(0, preyRemaining);
}
function showMessage(text, showBtn = true, buttonText = "Start Game") {
    if(!messageText || !startButton || !messageCenter) return;
    messageText.innerHTML = text;
    startButton.textContent = buttonText;
    startButton.style.display = showBtn ? 'block' : 'none';
    messageCenter.style.display = 'flex';
}
function hideMessage() { if(!messageCenter) return; messageCenter.style.display = 'none'; }

function setupNewLevel() {
    if(!levelDisplay || !timeDisplay || !fliesLeftDisplay || !gameArea) { console.error("setupNewLevel: Missing UI elements"); return; }
    const levelConf = levelSettings[Math.min(currentLevel - 1, levelSettings.length - 1)];
    if (!levelConf) { console.error("setupNewLevel: No config for level " + currentLevel); endGame(); return; }
    
    applyLevelTheme(levelConf);
    timeLeft = levelConf.timePerLevel; 
    if (timeDisplay) {
        timeDisplay.textContent = timeLeft;
        timeDisplay.classList.remove('low-time-warning');
    }
    preyCaughtThisLevel = 0; updatePreyLeftDisplay(); 
    if (levelDisplay) levelDisplay.textContent = currentLevel;

    [flies, waterSkimmers, predatorBirds, jumpingFish, hunterFrogs, skyTerrors, powerUpFruits, activeSplashParticles].forEach(arr => {
         arr.forEach(elOrObj => {
            const el = elOrObj.element || elOrObj;
            if (el && el.remove) el.remove();
            if(elOrObj.lungePrepareTimer) clearTimeout(elOrObj.lungePrepareTimer);
            if(elOrObj.chargeTimer) clearTimeout(elOrObj.chargeTimer);
         });
         arr.length = 0;
    });
    
    const allIntervalsToClear = [flySpawnIntervalId, skimmerSpawnIntervalId, birdSpawnIntervalId, fishSpawnIntervalId, hunterFrogSpawnIntervalId, skyTerrorSpawnIntervalId, powerUpFruitSpawnIntervalId];
    allIntervalsToClear.forEach(id => { if (id) clearInterval(id); });
    
    if (invincibilityTimerId) clearTimeout(invincibilityTimerId); deactivatePowerUp('invincible');
    if (speedBoostTimerId) clearTimeout(speedBoostTimerId); deactivatePowerUp('speed');

    if (levelConf.skyFlySpawnRate > 0) { flySpawnIntervalId = setInterval(createFly, levelConf.skyFlySpawnRate); for(let i=0; i< Math.floor(levelConf.maxSkyFlies / 2) ; i++) createFly(); }
    if (levelConf.waterSkimmerSpawnRate > 0) { skimmerSpawnIntervalId = setInterval(createWaterSkimmer, levelConf.waterSkimmerSpawnRate); for(let i=0; i< Math.floor(levelConf.maxWaterSkimmers / 2) ; i++) createWaterSkimmer(); }
    if (levelConf.birdSpawnRate > 0) { birdSpawnIntervalId = setInterval(createPredatorBird, levelConf.birdSpawnRate); }
    if (levelConf.fishSpawnRate > 0) { fishSpawnIntervalId = setInterval(createJumpingFish, levelConf.fishSpawnRate); }
    if (levelConf.hunterFrogSpawnRate > 0) { hunterFrogSpawnIntervalId = setInterval(createHunterFrog, levelConf.hunterFrogSpawnRate); for(let i=0; i< Math.floor((levelConf.maxHunterFrogs || 0) / 2) ; i++) createHunterFrog(); }
    if (levelConf.skyTerrorSpawnRate > 0) { skyTerrorSpawnIntervalId = setInterval(createSkyTerror, levelConf.skyTerrorSpawnRate); for(let i=0; i< Math.floor((levelConf.maxSkyTerrors || 0) / 2) ; i++) createSkyTerror(); }
    if (levelConf.powerUpFruitSpawnRate > 0) { powerUpFruitSpawnIntervalId = setInterval(createPowerUpFruit, levelConf.powerUpFruitSpawnRate); if (Math.random() < 0.3 && levelConf.maxPowerUpFruits > 0) createPowerUpFruit(); }
}
function levelUp() {
    if (gameSounds && gameSounds.levelUp) gameSounds.levelUp();
    gameActive = false; currentLevel++;
    if (currentLevel > levelSettings.length) {
        showMessage(`You beat all levels!<br>Final Score: ${score}`, true, "Play Again?");
        if(startButton) startButton.onclick = () => { currentLevel = 1; startGame(true); };
        if (Tone && Tone.Transport) Tone.Transport.pause(); return;
    }
    showMessage(`Level ${currentLevel}! <br/> ${levelSettings[currentLevel-1].name}`, false);
    setTimeout(() => {
        hideMessage(); setupNewLevel(); gameActive = true;
        if (gameLoopId) cancelAnimationFrame(gameLoopId); gameLoopId = requestAnimationFrame(gameTick);
        if (timerIntervalId) clearInterval(timerIntervalId); timerIntervalId = setInterval(updateTimer, 1000);
    }, 2500);
}
function endGame() {
     gameActive = false; if (gameSounds && gameSounds.gameOver) gameSounds.gameOver(); if (Tone && Tone.Transport) Tone.Transport.pause(); cancelAnimationFrame(gameLoopId); [timerIntervalId, flySpawnIntervalId, birdSpawnIntervalId, fishSpawnIntervalId, skimmerSpawnIntervalId, hunterFrogSpawnIntervalId, skyTerrorSpawnIntervalId, powerUpFruitSpawnIntervalId].forEach(id => { if (id) clearInterval(id); }); if (invincibilityTimerId) clearTimeout(invincibilityTimerId); deactivatePowerUp('invincible'); if (speedBoostTimerId) clearTimeout(speedBoostTimerId); deactivatePowerUp('speed');
     if(timeDisplay) timeDisplay.classList.remove('low-time-warning');
     showMessage(`Game Over!<br>Final Score: ${score}`, true, "Play Again?"); if(startButton) startButton.onclick = () => { currentLevel = 1; startGame(true); };
}
function handleStartButtonClick() {
    console.log("handleStartButtonClick called. gameActive:", gameActive, "timeLeft:", timeLeft);
    if (!gameActive || timeLeft <= 0) {
        console.log("Condition to start game met in handleStartButtonClick.");
        const isInitial = (startButton && startButton.textContent === "Start Game");
        startGame(isInitial);
    } else {
        console.warn("Start button clicked, but game is already active and time > 0.");
    }
}
function startGame(isInitialStart = false) {
    console.log(`%cAttempting to start game... Level: ${currentLevel}. Initial: ${isInitialStart}`, "color: blue; font-weight: bold;");
    if (!scoreDisplay || !dragonflyElement || !gameArea || !messageCenter || !startButton || !levelDisplay || !fliesLeftDisplay || !timeDisplay || !root) { console.error("CRITICAL startGame: Essential DOM elements missing."); return; }
    if (isInitialStart) { currentLevel = 1; console.log("Reset currentLevel to 1 for initial start."); }
    try { if (Tone.context.state !== 'running') { Tone.start().then(() => { if (!isMuted && Tone.Transport && bgMusicPattern) { Tone.Transport.start(); bgMusicPattern.start(0); } }).catch(e => console.warn("Tone.start() error:", e)); } else { if (!isMuted && Tone.Transport && bgMusicPattern) { Tone.Transport.start(); bgMusicPattern.start(0); }}} catch(e) { console.warn("Error Tone.js in startGame:", e); }
    if (gameSounds && gameSounds.start) gameSounds.start();
    score = 0; if(scoreDisplay) scoreDisplay.textContent = score;
    gameActive = true; hideMessage();
    isDashing = false; lastDashTime = 0; preyCaughtThisDash = 0;
    if (dragonflyElement && gameArea) { dragonflyX = (gameArea.offsetWidth - dragonflyElement.offsetWidth) / 2; dragonflyY = (gameArea.offsetHeight - dragonflyElement.offsetHeight) / 2; dragonflyElement.style.left = `${dragonflyX}px`; dragonflyElement.style.top = `${dragonflyY}px`; }
    if(timeDisplay) timeDisplay.classList.remove('low-time-warning');
    setupNewLevel();
    if (gameLoopId) cancelAnimationFrame(gameLoopId); gameLoopId = requestAnimationFrame(gameTick);
    if (timerIntervalId) clearInterval(timerIntervalId); timerIntervalId = setInterval(updateTimer, 1000);
    console.log(`%cGame started on level ${currentLevel}`, "color: green; font-weight: bold;");
}

function gameTick() {
    try {
        if (!gameActive) return;
        updateDragonflyPosition();
        updateFlies(); updateWaterSkimmers(); updatePredatorBirds(); updateJumpingFish();
        updateHunterFrogs(); updateSkyTerrors(); updatePowerUpFruits();
        updateSplashParticles();

        if (!isDashing) {
            checkEnemyAttackCollisions();
            checkPowerUpFruitCollision();
            checkPreyCollisions();
        }
        checkAllPassiveObstacleCollisions();

        gameLoopId = requestAnimationFrame(gameTick);
    } catch (e) {
        console.error("Error in gameTick:", e);
        gameActive = false;
        if(messageCenter && messageText) showMessage("A critical error occurred in game loop.<br><small>" + (e.message || e) + "</small>", false);
    }
}

// --- DOMContentLoaded: Initialization and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("index.js: DOMContentLoaded event fired.");
    try {
        gameArea = document.getElementById('game-area');
        dragonflyElement = document.getElementById('dragonfly');
        scoreDisplay = document.getElementById('score');
        timeDisplay = document.getElementById('time');
        levelDisplay = document.getElementById('level');
        fliesLeftDisplay = document.getElementById('flies-left');
        messageCenter = document.getElementById('message-center');
        messageText = document.getElementById('message-text');
        startButton = document.getElementById('start-button');
        celestialBody = document.getElementById('celestial-body');
        root = document.documentElement;
        muteButtonElement = document.getElementById('mute-button');

        console.log("index.js: DOM Elements: ", { gameArea, dragonflyElement, startButton, muteButtonElement, messageCenter, messageText });

        if (!root || !gameArea || !startButton || !muteButtonElement || !messageCenter || !dragonflyElement || !messageText || !scoreDisplay || !timeDisplay || !levelDisplay || !fliesLeftDisplay || !celestialBody) {
            console.error("CRITICAL DOMContentLoaded: One or more essential elements NOT FOUND.");
            if(messageCenter && startButton && messageText) {
                 messageText.innerHTML = "Error: Critical game files missing. Please refresh.";
                 startButton.textContent = "Refresh";
                 startButton.onclick = () => window.location.reload();
                 messageCenter.style.display = 'flex';
            }
            return;
        }

        initializeSoundsAndMusic();
        console.log("index.js: Sounds initialized.");

        if (startButton) {
            startButton.addEventListener('click', handleStartButtonClick);
            console.log("index.js: Start button click listener attached.");
        } else {
            console.error("index.js: StartButton NOT FOUND for listener attachment!");
        }

        if (muteButtonElement) {
            muteButtonElement.addEventListener('click', window.toggleMute);
            console.log("index.js: Mute button click listener attached.");
        } else {
            console.error("index.js: MuteButton NOT FOUND for listener attachment!");
        }


        gameArea.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch' || e.pointerType === 'pen') { e.preventDefault(); }
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        gameArea.addEventListener('pointerdown', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        gameArea.addEventListener('click', (e) => {
            if (e.target === startButton || (messageCenter && messageCenter.contains(e.target)) || e.target === muteButtonElement) {
                return;
            }
            if (gameActive && !isDashing) {
                dashDragonfly();
            }
        });
        console.log("index.js: Game area listeners attached.");

        initGameView(); // This was missing from the original combined logic
        console.log("Dragonfly Sky Chase - Enhanced Edition Initialized (from index.js).");

    } catch (error) {
        console.error("Error during DOMContentLoaded initialization:", error);
        if(messageCenter && messageText && startButton) {
            messageText.innerHTML = "Initialization Error. Please refresh. <br><small>" + error.message + "</small>";
            startButton.style.display = 'block';
            startButton.textContent = "Refresh";
            startButton.onclick = () => window.location.reload();
            messageCenter.style.display = 'flex';
        }
    }
});

// Make sure initGameView is defined if it wasn't part of the "ALL THE GAME LOGIC FUNCTIONS"
// It usually is defined within the main block of functions.
// If it's not, here's a basic one:
function initGameView() {
    console.log("initGameView: Setting up initial view.");
    if(dragonflyElement && gameArea) {
        dragonflyX = (gameArea.offsetWidth - dragonflyElement.offsetWidth) / 2;
        dragonflyY = (gameArea.offsetHeight - dragonflyElement.offsetHeight) / 2;
        dragonflyElement.style.left = `${dragonflyX}px`;
        dragonflyElement.style.top = `${dragonflyY}px`;
    } else { console.error("initGameView: Dragonfly or GameArea element not found."); }

    if (levelSettings && levelSettings.length > 0 && levelSettings[0]) {
        applyLevelTheme(levelSettings[0]);
    } else { console.error("initGameView: levelSettings issue."); }

    if(levelDisplay) levelDisplay.textContent = currentLevel;
    if(fliesLeftDisplay && levelSettings[0]) fliesLeftDisplay.textContent = levelSettings[0].preyToLevelUp;
    if(timeDisplay && levelSettings[0]) timeDisplay.textContent = levelSettings[0].timePerLevel;
    showMessage("Catch the Prey!", true, "Start Game");
    console.log("initGameView completed.");
}
window.addEventListener('resize', () => {
    if (dragonflyElement && gameArea && !gameActive) { // Only reposition if game not active
        dragonflyX = (gameArea.offsetWidth - dragonflyElement.offsetWidth) / 2;
        dragonflyY = (gameArea.offsetHeight - dragonflyElement.offsetHeight) / 2;
        dragonflyElement.style.left = `${dragonflyX}px`;
        dragonflyElement.style.top = `${dragonflyY}px`;
    }
});


console.log("index.js: Script execution finished.");
