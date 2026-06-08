// ==========================================
// 1. STATO GLOBALE E CONFIGURAZIONE
// ==========================================
let inputField, state = "MENU", visualStack = [], systemLog = ">  WAVE SYSTEM V.1.8\n>  STATUS: AWAITING INPUT";
let bootTimer = 0, isFullscreen = false, showPlaceholderLabel = true;
let archiveItems = [], selectedArchiveIndex = -1, menuStep = 0, tourStep = 0, aboutStep = 0;
let oscClick, oscClack, oscBoot, envClick, envClack, envBoot, hasBooted = true;
let imgLaposky, imgLoaded = false, scanLineY = 0, arcadeBootFrame = 0, holdTimer = 0, skipTimer = 0;

const ARCADE_BOOT_DURATION = 300, SKIP_DURATION = 180, menuOptions = ["START", "INFO"];
const moodPlaceholders = [
  "WHAT ARE YOU THINKING ABOUT?", "HOW ARE YOU FEELING TODAY?",
  "INSERT A HIDDEN THOUGHT...", "WHAT STREAM of CONSCIOUSNESS IS CROSSING YOU?",
  "TYPE YOUR CURRENT VIBRATIONS..."
];

const tourPages = [
  { title: "=== WAVE SYSTEM V.1.8 ===", content: "Welcome.\n\nThis interface is a parametric generation system that translates\nlanguage structure into animated visual forms." },
  { title: "=== WHAT DOES IT ANALYZE? ===", content: "The system dissects your sentence in real time:\n- WORDS define the symmetrical axes of the shape.\n- VERBS alter the HSB COLOR palette.\n- PHONEMES alter the SHARPNESS and noise of the lines.\n- SENTIMENTS generate the ROTATION and parametric speed.\n- NOUNS determine the scale and SIZE.\n- THE GLITCH: The CRT terminal randomly corrupts a word with broken\n  noise out of pure spite. Geometric perfection is ruined." },
  { title: "=== NAVIGATION ===", content: "Type HELP to see available system commands." },
  { title: "=== ARCADE BOOT ===", content: "LOADING..." }
];

const aboutPages = [
  { title: "1. WHAT IS WAVE SYSTEM V.1.8?", content: "WAVE SYSTEM V.1.8 is an interactive artwork that brings code, language,\nand visual art into dialogue.\nHere, you feed the algorithm with your own words. The system takes\nyour sentences, deconstructs them in real time, and transforms them\ninto abstract geometric symmetries and flows of light." },
  { title: "2. THE LINGUISTIC ENGINE: RITA.JS", content: "The core of the system is RiTa.js, an NLP library for digital literature.\n\n• Syntactic Level (Verbs):\n  Maps sentence grammar. More verbs change the HSB color range.\n• Phonetic Level (Sounds):\n  Harsher sounds and combinations increase line jaggedness.\n• Quantitative Level (Words):\n  Defines the exact number of geometric axes." },
  { title: "3. VISUAL GENERATION", content: "Images are generated via p5.js trigonometric computation, paying tribute\nto Ben Laposky's historic analog oscillations.\n\n• The Inspirations:\n  Deeply rooted in 1960s/1970s Computer Art, the project draws from Max\n  Bense's informational aesthetics philosophy, separating his academic\n  role from early programmers like Nees, Nake, and Whitney.\n• The Process:\n   Trigo equations combine with harmonic Perlin Noise streams." },
  { title: "*** CREDITS ***", content: "PROGRAMMERS & DESIGNERS:\n- L. J. MENESES SANTANDER  [MEDIA ART DIVISION]\n- R. FIORETTI              [GRAPHIC DESIGN UNIT]\n\nPROJECT: INTEGRATED NEW MEDIA TECHNIQUES\nSUPERVISOR: PROF. A. BELLUSCIO\nSCHOOL: ABAFR (ACCADEMIA DI BELLE ARTI FROSINONE)\nCHRONO: A.A. 2025/2026\n----------------------------------------------------------------------\n*** DISTRIBUTION & LEGAL NOTICE ***\nLICENSED UNDER A CREATIVE COMMONS ATTRIBUTION-NONCOMMERCIAL-\nSHAREALIKE 4.0 INTERNATIONAL LICENSE (CC BY-NC-SA 4.0)." }
];

// ==========================================
// 2. LIFECYCLE (PRELOAD & SETUP)
// ==========================================
function preload() {
  imgLaposky = loadImage("Immagine6.jpeg", () => imgLoaded = true, () => console.warn("Immagine non trovata."));
}

function setup() {
  if (window.location.pathname !== window.location.pathname.toLowerCase()) {
    window.location.replace(window.location.origin + window.location.pathname.toLowerCase() + window.location.search + window.location.hash);
    return;
  }
  currentPlaceholder = random(moodPlaceholders);
  let params = getURLParams();
  if (params.state) {
    try {
      visualStack = JSON.parse(decodeURIComponent(atob(params.state)));
      state = "GENERATIVE";
      systemLog = ">  SHARED STACK INJECTED SUCCESSFULLY\n>  LOGGED PARAMETERS RESTORED. STACK: " + visualStack.length;
    } catch (err) {
      state = "MENU"; systemLog = ">  SYSTEM RESET\n>  CANVAS EMPTY. AWAITING INPUT...";
    }
  } else {
    state = "MENU"; systemLog = ">  SYSTEM RESET\n>  CANVAS EMPTY. AWAITING INPUT...";
  }

  createCanvas(windowWidth, windowHeight);
  textFont("VT323");
  initCyberSound();
  createDiv("").id("archive-container");

  let inputWrapper = createDiv("").id("terminal-input-wrapper").style("position", "absolute").style("display", "flex").style("align-items", "center").style("z-index", "999");
  createSpan("> ").style("font-family", "'VT323', monospace").style("font-size", "20px").style("color", "#00ff41").style("margin-right", "8px").style("user-select", "none").parent(inputWrapper);
  inputField = createInput("").addClass("input-style").attribute("maxlength", "50").parent(inputWrapper);
  centerInput();

  inputField.elt.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); triggerUNDO(); return; }
    if (e.key === "Enter") processText();
    if (e.key === "Tab") { e.preventDefault(); if (archiveItems.length > 0) moveSelection(1); }
  });
  inputField.elt.focus();
}

// ==========================================
// 3. MOTORE AUDIO SINTETICO
// ==========================================
function initCyberSound() {
  let modes = ["triangle", "triangle", "square"];
  let oscs = [oscClick = new p5.Oscillator(), oscClack = new p5.Oscillator(), oscBoot = new p5.Oscillator()];
  let envs = [envClick = new p5.Envelope(), envClack = new p5.Envelope(), envBoot = new p5.Envelope()];
  envs[0].setADSR(0.001, 0.02, 0.0, 0.005); envs[0].setRange(0.25, 0.0);
  envs[1].setADSR(0.002, 0.045, 0.0, 0.015); envs[1].setRange(0.35, 0.0);
  envs[2].setADSR(0.01, 0.12, 0.8, 0.05); envs[2].setRange(0.25, 0.0); oscBoot.freq(800);
  oscs.forEach((osc, i) => { osc.setType(modes[i]); osc.disconnect(); osc.connect(); osc.start(); osc.amp(envs[i]); });
}

function playCyberClick() {
  userStartAudio();
  if (!hasBooted) { envBoot.play(oscBoot); hasBooted = true; return; }
  let jitter = random(-12, 12);
  oscClick.freq(380 + jitter); oscClack.freq(110 + jitter); oscClack.freq(30, 0.02);
  envClick.play(oscClick); envClack.play(oscClack);
}

// ==========================================
// 4. LOGICA INTERFACCIA E COMANDI TERMINALE
// ==========================================
function centerInput() {
  let wrapper = select("#terminal-input-wrapper");
  if (!wrapper) return;
  
  let currentW = 415, currentX = 35;
  let writtenText = systemLog.substring(0, bootTimer);
  let lineCount = writtenText.split("\n").length;
  let currentY = 35 + (lineCount * 24) + 20;
  
  if (["INPUT", "GENERATIVE", "CONFIRM_EXIT"].includes(state)) {
    currentY += showPlaceholderLabel ? 30 : 15;
  }
  
  if (width < 600) {
    currentW = width * 0.8; 
    currentX = width / 2 - min(200, width * 0.4); 
    currentY = height - 120;
  }
  wrapper.position(currentX, currentY).style("width", currentW + "px");
}

function triggerUNDO() {
  if (visualStack.length > 0 && !visualStack[0].isPlaceholder) {
    visualStack.pop();
    systemLog = ">  UNDO EXECUTED\n>  LAST PARAMETER LAYER REMOVED. CURRENT STACK COUNT: " + visualStack.length;
  }
  if (visualStack.length === 0) systemLog = ">  SYSTEM RESET\n>  CANVAS EMPTY. AWAITING MOLECULAR SYNTAX INPUT...";
  bootTimer = 0; inputField.value(""); centerInput();
}

function generateShareLink() {
  if (visualStack.length === 0 || visualStack[0].isPlaceholder) {
    systemLog = ">  SHARE FAILED: STACK IS EMPTY OR INVALID"; bootTimer = 0; centerInput(); return;
  }
  try {
    let shareURL = window.location.origin + window.location.pathname + "?state=" + btoa(encodeURIComponent(JSON.stringify(visualStack)));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareURL).then(() => {
        systemLog = ">  SHARE URL GENERATED!\n>  LINK SUCCESSFULLY EXPANDED INTO SYSTEM CLIPBOARD.";
        bootTimer = 0; centerInput();
      });
    } else fallbackCopyText(shareURL);
  } catch (e) { systemLog = ">  SHARE MODULE CRITICAL ERROR"; bootTimer = 0; centerInput(); }
}

function fallbackCopyText(text) {
  let textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea);
  textArea.select(); let successful = document.execCommand("copy"); document.body.removeChild(textArea);
  systemLog = successful ? ">  SHARE URL COPIED TO LOCAL BUFFER." : ">  SHARE CRITICAL ERROR: BROWSER HOST ACCESSIBILITY DENIED.";
  bootTimer = 0; centerInput();
}

function processText() {
  let val = inputField.value().trim(), lowerVal = val.toLowerCase();
  
  if (state === "CONFIRM_EXIT") {
    let save = ["y", "yes"].includes(lowerVal), noSave = ["n", "no"].includes(lowerVal);
    if (save || noSave) {
      if (save) saveToArchive();
      visualStack = []; state = "MENU"; bootTimer = 0; inputField.value("");
      systemLog = ">  WAVE SYSTEM V.1.8\n>  STATUS: AWAITING INPUT";
      let container = select("#archive-container"); if (container) container.hide();
    } else {
      systemLog = ">  INVALID TERMINAL RESPONSE.\n>  DO YOU WANT TO ARCHIVE SAMPLES TO TERMINAL LOGS? (Y/N)";
      bootTimer = 0; inputField.value(""); centerInput();
    }
    return;
  }

  if (val.length > 0) {
    if (lowerVal === "help") {
      showPlaceholderLabel = false;
      systemLog = ">  SYSTEM COMMANDS MANUAL:\n   >  UNDO      : REMOVE THE LAST GENERATED PARAMETER NODE\n   >  SAVE      : ARCHIVE THE ACTIVE GEOMETRIC STACK TO REGISTER\n   >  SHARE     : GENERATE DECRYPTED URL EXPORT LINK FOR VISUALS\n   >  ESC       : ABORT GENERATION AND RETURN FORWARD TO TERMINAL MENU\n   >  SHIFT + F : FLIP FULLSCREEN CRT OSCILLOSCOPE MONITOR ENVIRONMENT";
      bootTimer = 0; inputField.value(""); centerInput(); return;
    }
    let container = select("#archive-container"); if (container) container.show();
    if (lowerVal === "undo" || val === "UNDO") { triggerUNDO(); return; }
    if (lowerVal === "save" || val === "SAVE") { saveToArchive(); inputField.value(""); return; }
    if (lowerVal === "share" || val === "SHARE") { generateShareLink(); inputField.value(""); return; }

    if (/\b(save|undo|share)\b/i.test(val)) {
      systemLog = ">  SYNTAX ERROR: CORE EXECUTION COMMAND WORDS RESERVED.\n>  AWAITING UNPROTECTED EMOTIONAL STRINGS...";
      bootTimer = 0; inputField.value(""); centerInput(); return;
    }

    showPlaceholderLabel = false;
    if (visualStack.length === 1 && visualStack[0].isPlaceholder) visualStack = [];

    let words = RiTa.tokenize(val), phones = RiTa.phones(val), tags = RiTa.pos(val), verbCount = 0, nounCount = 0;
    tags.forEach((t) => { if (t.startsWith("v")) verbCount++; if (t.startsWith("n")) nounCount++; });

    let glitchTriggered = random(100) < 30;
    let newLayer = {
      text: val.toUpperCase(), axes: words.length + 2, verbs: verbCount, energy: val.length, complexity: phones.length, nounsCount: nounCount, seed: random(1000),
      isPlaceholder: false, isParticles: false, extraThickness: 0, glitchActive: glitchTriggered, glitchWord: glitchTriggered && words.length > 0 ? random(words) : "", neonParamActive: false
    };

    if (nounCount > 0) {
      if (nounCount % 2 === 0) newLayer.isParticles = true;
      else newLayer.extraThickness += nounCount * 0.4; // Ridotto l'incremento di spessore basato sui sostantivi
    }

    let shortText = val.length > 40 ? val.substring(0, 37).toUpperCase() + "..." : val.toUpperCase();
    systemLog = visualStack.length > 0 ? ">  LAYER ADDED & EVOLVED WITH: " + shortText : ">  LAYER MESHED: " + shortText + "\n>  COMPILING PHOSPHORS...";
    if (visualStack.length > 0 && verbCount > 0) newLayer.neonParamActive = true;

    visualStack.push(newLayer); state = "GENERATIVE"; bootTimer = 0; centerInput(); inputField.value("");
  }
}

// ==========================================
// 5. SELEZIONE ARCHIVIO E TASTIERA
// ==========================================
function saveToArchive() {
  if (visualStack.length === 0 || visualStack[0].isPlaceholder) { systemLog = ">  SAVE FAILED: GEOMETRIC STRUCTURAL NODES NOT DETECTED."; bootTimer = 0; centerInput(); return; }
  let item = createDiv("").addClass("archive-item");
  createElement("img").attribute("src", get(width / 2 - 150, height / 2 - 150, 300, 300).canvas.toDataURL()).parent(item);
  archiveItems.push({ element: item, stack: [...visualStack] });
  select("#archive-container").child(item);
  systemLog = ">  STACK SUCCESSFUL REGISTERED\n>  TOTAL ACTIVE OPERATIONAL CORES: " + visualStack.length; bootTimer = 0; centerInput();
}

function moveSelection(direction) {
  if (archiveItems.length === 0) return;
  if (selectedArchiveIndex >= 0) archiveItems[selectedArchiveIndex].element.removeClass("selected-item");
  selectedArchiveIndex = selectedArchiveIndex === -1 && direction === -1 ? archiveItems.length - 1 : (selectedArchiveIndex + direction + archiveItems.length) % archiveItems.length;
  archiveItems[selectedArchiveIndex].element.addClass("selected-item");
}

function keyPressed() {
  if (![SHIFT, CONTROL, ALT].includes(keyCode)) playCyberClick();
  if (keyCode === ESCAPE) {
    if (["ABOUT", "TOUR", "SKIP_BOOT"].includes(state)) { state = "MENU"; return; }
    if (["INPUT", "GENERATIVE"].includes(state)) {
      state = "CONFIRM_EXIT"; systemLog = ">  DO YOU WANT TO ARCHIVE SAMPLES TO LOGS BEFORE QUITTING? (Y/N)"; bootTimer = 0; inputField.value(""); centerInput(); return;
    }
  }

  if (state === "MENU") {
    if (keyCode === DOWN_ARROW) menuStep = (menuStep + 1) % menuOptions.length;
    else if (keyCode === UP_ARROW) menuStep = (menuStep - 1 + menuOptions.length) % menuOptions.length;
    else if (keyCode === ENTER) {
      if (menuStep === 0) { state = "TOUR"; tourStep = 0; arcadeBootFrame = 0; holdTimer = 0; showPlaceholderLabel = true; } 
      else if (menuStep === 1) { state = "ABOUT"; aboutStep = 0; scanLineY = 0; }
      return;
    }
  }

  if (state === "ABOUT") {
    if (keyCode === RIGHT_ARROW && aboutStep < aboutPages.length - 1) { aboutStep++; scanLineY = 0; } 
    else if (keyCode === LEFT_ARROW) { if (aboutStep > 0) { aboutStep--; scanLineY = 0; } else state = "MENU"; }
    return;
  }

  if (state === "TOUR") {
    if (keyCode === 32) { state = "SKIP_BOOT"; skipTimer = 0; return false; }
    if (tourStep === tourPages.length - 1) return;
    if (keyCode === RIGHT_ARROW && tourStep < tourPages.length - 1) { tourStep++; if (tourStep === tourPages.length - 1) { arcadeBootFrame = 0; holdTimer = 0; } } 
    else if (keyCode === LEFT_ARROW) { if (tourStep > 0) tourStep--; else state = "MENU"; }
    return;
  }

  let wrapper = select("#terminal-input-wrapper");
  if ((key === "F" || key === "f") && keyIsDown(SHIFT)) {
    isFullscreen = !isFullscreen;
    let act = isFullscreen ? 'addClass' : 'removeClass';
    select("#archive-container")[act]("hidden-ui"); if (wrapper) wrapper[act]("hidden-ui");
    if (isFullscreen) inputField.elt.blur();
    return false;
  }

  let isTyping = document.activeElement === inputField.elt;
  if (keyCode === UP_ARROW && !isTyping && !isFullscreen) {
    if (selectedArchiveIndex >= 0) archiveItems[selectedArchiveIndex].element.removeClass("selected-item");
    selectedArchiveIndex = -1; inputField.elt.focus();
  }

  if (!isTyping) {
    if (keyCode === RIGHT_ARROW) moveSelection(1);
    else if (keyCode === LEFT_ARROW) moveSelection(-1);
    else if (keyCode === ENTER && selectedArchiveIndex >= 0) {
      visualStack = [...archiveItems[selectedArchiveIndex].stack]; 
      state = "INPUT"; // CORRETTO: Imposta lo stato su INPUT invece di GENERATIVE per mantenere attivo il terminale
      systemLog = ">  RESTORING COMPLEX STACK FROM STORAGE CLUSTER\n>  LOADED LAYER COUNT: " + visualStack.length + "\n>  READY FOR MOLECULAR SYNTAX OVERLAY..."; 
      bootTimer = 0; 
      centerInput();
      inputField.value("");
      inputField.elt.focus(); // Forza il focus sul campo di testo per scrivere subito
    }
  }
}
// ==========================================
// 6. DRAW LOOP ED INTERFACCE TERMINALE
// ==========================================
function draw() {
  let wrapper = select("#terminal-input-wrapper");
  
  if (["MENU", "ABOUT", "TOUR", "SKIP_BOOT"].includes(state) || visualStack.length === 0) {
    if (wrapper) wrapper.hide(); 
    background(2, 6, 2); 
  } else {
    background(2, 6, 2, visualStack.some((l) => l.neonParamActive) ? 10 : 40);
  }

  if (state === "MENU") { drawMenu(); return; }
  if (state === "ABOUT") { drawAbout(); return; }
  if (state === "TOUR") { drawTour(); return; }
  if (state === "SKIP_BOOT") { drawSkipBoot(); return; }

  if (!isFullscreen) {
    drawInterface();
    if (wrapper && ["INPUT", "GENERATIVE", "CONFIRM_EXIT"].includes(state)) {
      wrapper.show(); if (document.activeElement !== inputField.elt) inputField.elt.focus();
    }
  }

  if (["INPUT", "GENERATIVE", "CONFIRM_EXIT"].includes(state) && visualStack.length > 0) {
    push(); translate(width / 2, height / 2);
    let scaleFactor = min(width / 900, height / 700); if (width < 600) scaleFactor *= 0.75;
    scale(scaleFactor); blendMode(SCREEN);
    for (let layer of visualStack) renderLayer(layer, false);
    blendMode(BLEND); pop();
  }
}

function drawMenu() {
  stroke(0, 255, 65, 40); noFill(); rect(30, 30, width - 60, height - 60);
  fill(0, 255, 65); noStroke(); textAlign(CENTER, CENTER);
  textSize(min(36, width * 0.05)); text("░ WAVE SYSTEM V.1.8 ░", width / 2, height / 2 - 80);
  textSize(min(22, width * 0.04));
  for (let i = 0; i < menuOptions.length; i++) {
    if (i === menuStep) text("> " + menuOptions[i] + " <", width / 2, height / 2 + i * 40);
    else { fill(0, 255, 65, 100); text(menuOptions[i], width / 2, height / 2 + i * 40); fill(0, 255, 65); }
  }
  textAlign(CENTER, BOTTOM); textSize(min(18, width * 0.03)); fill(0, 255, 65, 140);
  text("(Use the UP/DOWN arrows to select and press ENTER to start)", width / 2, height - 60);
}

function drawAbout() {
  stroke(0, 255, 65, 40); noFill(); rect(30, 30, width - 60, height - 60);
  fill(0, 255, 65); noStroke(); textAlign(LEFT, TOP);
  let paddingX = max(50, width * 0.08), maxTextWidth = width - paddingX * 2, maxTextHeight = height - 180;
  textSize(min(26, width * 0.05)); text(aboutPages[aboutStep].title, paddingX, 60);

  let baseTextSize = min(19, width * 0.032); textSize(baseTextSize); textLeading(baseTextSize * 1.3);
  let leftColumnWidth = maxTextWidth * 0.55;

  if (aboutStep === 2) {
    text(aboutPages[aboutStep].content, paddingX, 115, leftColumnWidth, maxTextHeight);
    if (imgLoaded && imgLaposky) {
      let renderW = maxTextWidth * 0.45 - 40, renderH = renderW / (imgLaposky.width / imgLaposky.height);
      if (renderH > height - 220) { renderH = height - 220; renderW = renderH * (imgLaposky.width / imgLaposky.height); }
      if (scanLineY < renderH) scanLineY += 4;
      let visibleHeight = min(scanLineY, renderH);
      if (visibleHeight > 0) {
        image(imgLaposky, paddingX + leftColumnWidth + 40, 115, renderW, visibleHeight, 0, 0, imgLaposky.width, visibleHeight * (imgLaposky.height / renderH));
        if (scanLineY < renderH) makeLineNeon(paddingX + leftColumnWidth + 40, 115 + visibleHeight, renderW);
      }
    }
  } else text(aboutPages[aboutStep].content, paddingX, 115, leftColumnWidth, maxTextHeight);
  
  textAlign(LEFT, BOTTOM); textSize(min(18, width * 0.03)); fill(0, 255, 65, 140);
  text("[ PAGE " + (aboutStep + 1) + " DI " + aboutPages.length + " ]  •  (L/R to flip - ESC to exit)", paddingX, height - 60);
}

function makeLineNeon(x, y, w) {
  let weights = [16, 8, 3.5, 1.2], alphas = [40, 80, 180, 245], colors = [color(0, 255, 65), color(0, 255, 65), color(0, 255, 65), color(230, 255, 235)];
  weights.forEach((wt, i) => { stroke(colors[i].levels[0], colors[i].levels[1], colors[i].levels[2], alphas[i]); strokeWeight(wt); line(x, y, x + w, y); });
  noStroke();
}

function drawUnifiedProgressBar(progress, holdActive, messageText) {
  stroke(0, 255, 65, 40); noFill(); rect(30, 30, width - 60, height - 60);
  fill(0, 255, 65); noStroke(); textAlign(CENTER, CENTER);
  let displayPct = floor(progress * 100); textSize(min(22, width * 0.04));

  if (holdActive) fill(255, 60, 60); else if (frameCount % 30 >= 15) fill(0, 255, 65, 80);
  text(messageText, width / 2, height / 2 - 90); fill(0, 255, 65);

  textSize(min(16, width * 0.03)); textAlign(LEFT, CENTER); let logX = width / 2 - 150;
  if (displayPct > 15) text("ROM CHECK: OK", logX, height / 2 - 50);
  if (displayPct > 40) text("RITA.JS CORE ENGINE: MOUNTED", logX, height / 2 - 30);
  if (displayPct > 70) text("CRT PHOSPHOR LAYER: ACTIVE", logX, height / 2 - 10);

  textAlign(CENTER, CENTER);
  let barLength = 20, numBlocks = floor(progress * barLength), barString = "█".repeat(numBlocks) + "▒".repeat(barLength - numBlocks);
  textSize(min(28, width * 0.05)); text("[" + barString + "] " + displayPct + "%", width / 2, height / 2 + 40);
  textSize(min(18, width * 0.03)); fill(0, 255, 65, 150); text("PLEASE WAIT... DO NOT TURN OFF TERMINAL", width / 2, height / 2 + 90);
}

function drawTour() {
  if (tourStep === tourPages.length - 1) {
    let currentPct = floor((arcadeBootFrame / ARCADE_BOOT_DURATION) * 100), holdActive = false, holdMessage = ">  INITIALIZING WAVE SYSTEM PROCESSORS...";
    if (currentPct >= 80 && currentPct < 85 && holdTimer < 120) { holdActive = true; holdTimer++; holdMessage = ">  WARNING: HOLDING FOR BUFFER COMPILATION..."; } 
    else if (currentPct >= 98 && currentPct < 100 && holdTimer < 240) { holdActive = true; holdTimer++; holdMessage = ">  CRITICAL WARNING: MEMORY DUMP SYNC..."; } 
    else arcadeBootFrame++;

    let progress = min(1, arcadeBootFrame / ARCADE_BOOT_DURATION);
    drawUnifiedProgressBar(progress, holdActive, holdMessage);

    if (progress >= 1) { state = "INPUT"; let wrapper = select("#terminal-input-wrapper"); if (wrapper) wrapper.show(); centerInput(); inputField.elt.focus(); }
  } else {
    stroke(0, 255, 65, 40); noFill(); rect(30, 30, width - 60, height - 60);
    fill(0, 255, 65); noStroke(); textAlign(LEFT, TOP);
    let paddingX = max(60, width * 0.08), baseTextSize = min(20, width * 0.034);
    textSize(min(26, width * 0.05)); text(tourPages[tourStep].title, paddingX, 60);
    textSize(baseTextSize); textLeading(baseTextSize * 1.4); text(tourPages[tourStep].content, paddingX, 130, (width - paddingX * 2) * 0.55, height - 180);
    textAlign(LEFT, BOTTOM); textSize(min(18, width * 0.03)); fill(0, 255, 65, 140);
    text("[ PAGE " + (tourStep + 1) + " DI " + tourPages.length + " ]  •  (L/R to flip - SPACE TO SKIP)", paddingX, height - 60);
  }
}

function drawSkipBoot() {
  let progress = min(1, skipTimer / SKIP_DURATION);
  drawUnifiedProgressBar(progress, false, ">  BYPASS DETECTED: CONNECTING INTERACTIVE FLOW...");
  if (++skipTimer >= SKIP_DURATION) { state = "INPUT"; let wrapper = select("#terminal-input-wrapper"); if (wrapper) wrapper.show(); centerInput(); inputField.elt.focus(); }
}

function drawInterface() {
  stroke(0, 255, 65, 40); noFill(); rect(15, 15, width - 30, height - 30);
  fill(0, 255, 65); noStroke(); textAlign(LEFT, TOP); textSize(20);
  
  text(systemLog.substring(0, bootTimer), 35, 35, width - 60);
  
  if (bootTimer < systemLog.length) {
    if (systemLog.startsWith(">  SYSTEM COMMANDS")) {
      bootTimer += 2; 
    } else {
      bootTimer += 1; 
    }
    centerInput(); 
  }
  
  let linesArray = systemLog.substring(0, bootTimer).split("\n");
  let labelY = 35 + linesArray.length * 24 + 16;
  if (width >= 600 && showPlaceholderLabel) { textSize(18); fill(0, 255, 65, 160); text(">  " + currentPlaceholder, 35, labelY); }
}

// ==========================================
// 7. ENGINE DI RENDERING GRAFICO
// ==========================================
function renderLayer(layerData, globalNeonActive) {
  noFill();
  
  // MODIFICATO: Ricalibrati i pesi per rendere i punti e le linee elegantemente filiformi
  let baseWeight = layerData.isPlaceholder ? 0.6 : map(layerData.energy, 1, 50, 0.4, 1.5);
  let finalWeight = Math.pow(baseWeight, 2) * 0.35 + layerData.extraThickness;
  if (layerData.neonParamActive) finalWeight += 0.4;
  strokeWeight(finalWeight);

  let angle = TWO_PI / layerData.axes, baseHue = (layerData.seed * 137.5) % 360;
  let glitchOffset = layerData.glitchActive ? sin(frameCount * 0.2) * (layerData.glitchWord.length * 0.5) : 0;

  for (let i = 0; i < layerData.axes; i++) {
    push(); rotate(i * angle + frameCount * (layerData.glitchActive ? 0.03 : 0.002) + glitchOffset);

    if (layerData.verbs === 0) stroke(255, layerData.isPlaceholder ? 40 : 120);
    else {
      colorMode(HSB, 360, 100, 100, 100);
      let colorStep = 360 / (layerData.verbs + 1);
      stroke((baseHue + (floor(i / 2) % (layerData.verbs + 1)) * colorStep + (i % 2 === 1 ? 180 : 0)) % 360, layerData.neonParamActive ? 100 : 85, 100, layerData.isPlaceholder ? 20 : layerData.neonParamActive ? 90 : 60);
    }

    let isP = layerData.isParticles, step = isP ? 0.04 : 0.015;
    let prevX = null, prevY = null;

    for (let j = 0; j <= 1; j += step) {
      let n = noise(j * 1.5, frameCount * 0.005 + layerData.seed + i);
      if (layerData.glitchActive) n += isP ? random(-0.1, 0.1) : sin(frameCount * 0.5) * 0.08;
      
      let r = map(n, 0, 1, isP ? 50 : 40, layerData.energy * 7) + sin(j * layerData.complexity + frameCount * 0.05) * 12;
      let cx = r * cos(j * TWO_PI), cy = r * sin(j * TWO_PI * (layerData.verbs + 1));

      // MODIFICATO: Anche la dimensione del punto (particella) si adatta condizionalmente per essere più sottile
      if (isP) { strokeWeight(finalWeight * 1.8); point(cx, cy); } 
      else {
        if (prevX !== null && floor(j * 100) % 2 === 0) line(prevX, prevY, cx, cy);
        prevX = cx; prevY = cy;
      }
    }
    pop(); colorMode(RGB);
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); centerInput(); }
