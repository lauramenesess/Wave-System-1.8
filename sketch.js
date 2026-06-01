// 1. VARIABILI DI STATO E CONFIGURAZIONE INTERFACCIA
// ==========================================
let inputField;
let state = "MENU";
let visualStack = [];
let systemLog = ">  WAVE SYSTEM V.1.8\n>  STATUS: AWAITING INPUT";
let bootTimer = 0;
let isFullscreen = false;

let archiveItems = [];
let selectedArchiveIndex = -1;

let oscClick, oscClack, oscBoot, envClick, envClack, envBoot; 
let hasBooted = true; 

// Variabili per l'immagine dell'oscilloscopio ed effetti CRT
let imgLaposky;
let imgLoaded = false; // Flag di controllo caricamento sicuro
let scanLineY = 0;     // Controlla l'altezza del caricamento a strisce

let menuStep = 0;
const menuOptions = ["START", "INFO"];

// Variabili per la barra di caricamento Arcade con temporizzatore di blocco pulito
let arcadeBootFrame = 0;
let holdTimer = 0; // Gestisce il tempo esatto di stop (120 frame = 2 secondi)
const ARCADE_BOOT_DURATION = 300; 

let tourStep = 0;
const tourPages = [
  {
    title: "=== WAVE SYSTEM V.1.8 ===",
    content:
      "Welcome.\n\nThis interface is a parametric generation system that translates language structure into animated visual forms.",
  },
  {
    title: "=== WHAT DOES IT ANALYZE? ===",
    content:
      "The system dissects your sentence in real time:\n" +
      "- The number of WORDS defines the symmetrical axes of the shape.\n" +
      "- The quantity of VERBS alters the COLOR.\n" +
      "- PHONEMES alter the SHARPNESS of the lines.\n" +
      "- SENTIMENTS/EMOTIONS generate the ROTATION or TRIGGER of the shape.\n" +
      "- NOUNS equal the SIZE of the shape.\n" +
      "- THE GLITCH: The system inserts a random disturbance with a 30% probability to break the geometric perfection. A randomly extracted word destabilizes the mathematical calculation by introducing imperfect oscillations and variations in the Perlin Noise, simulating a transmission error of the CRT terminal."
  },
  {
    title: "=== NAVIGATION ===",
    content:
      "Type HELP to see available commands.",
  },
  {
    title: "=== ARCADE BOOT ===", 
    content: "LOADING...",
  },
];

let aboutStep = 0;
const aboutPages = [
  {
    title: "1. WHAT IS WAVE SYSTEM V.1.8?",
    content: "WAVE SYSTEM V.1.8 is an interactive artwork that brings code, language, and visual art into dialogue.\nIt’s not just about typing commands: here, you are the one feeding the algorithm with your own words.\nThe system takes your sentences, deconstructs them in real time, and transforms them into abstract geometric shapes, moving symmetries, and flows of light.\nIn this way, the invisible meaning of your words comes to life, becoming a visual piece of art to watch unfold."
  },
  {
    title: "2. THE LINGUISTIC ENGINE: RITA.JS",
    content: "The core of the system is RiTa.js, an open-source JavaScript library designed for natural language processing and digital literature.\nThe code uses this library as an analyzer that extracts mathematical data from your sentences across three levels:\n\n• Syntactic Level (Verbs):\nMaps the grammar of the sentence. The more verbs you use, the more the shape's color palette (HSB system) changes.\n\n• Phonetic Level (Sounds):\nAnalyzes the phonemes of the sentence. Harsher sounds and complex combinations increase the jaggedness and noise of the lines.\n\n• Quantitative Level (Words):\nCounts the exact number of words to define the geometric structure, determining how many axes of symmetry the artwork will have."
  },
  {
    title: "3. VISUAL GENERATION AND INTERACTIVE GRAPHICS",
    content: "The images are not static; they are generated in real time through the mathematical computations of p5.js.\n\nThe aesthetic shapes and the system's name itself are a direct tribute to mathematician and pioneer Ben Laposky and his historic analog oscillations.\n\n• The Inspirations:\nThe project is deeply rooted in the Computer Art of the 1960s and 1970s. Alongside Laposky's pioneering vision, it draws inspiration from the mathematical rigor of Max Bense, the early algorithmic experiments of Nees and Nake, and the motion graphics of John Whitney.\n\n• The Process:\nEach shape combines trigonometric equations with Perlin Noise (harmonic computational noise). The artwork lives in a continuous rendering loop: the data from the sentence modifies the geometry in real time, creating a unique, layered visual flow that is then saved to the system's archive."
  },
  {
    title: "*** CREDITS ***",
    content: "PROGRAMMERS & DESIGNERS:\n" +
             "- L. J. MENESES SANTANDER  [MEDIA ART DIVISION]\n" +
             "- R. FIORETTI              [GRAPHIC DESIGN UNIT]\n\n" +
             "PROJECT: INTEGRATED NEW MEDIA TECHNIQUES\n" +
             "SUPERVISOR: PROF. A. BELLUSCIO\n" +
             "SCHOOL: ABAFR (ACCADEMIA DI BELLE ARTI FROSINONE)\n" +
             "CHRONO: A.A. 2025/2026\n\n" +
             "----------------------------------------------------\n" +
             "*** DISTRIBUTION & LEGAL NOTICE ***\n" +
             "THIS SOFTWARE IS LICENSED UNDER A CREATIVE COMMONS\n" +
             "ATTRIBUTION-NONCOMMERCIAL-SHAREALIKE 4.0 INTERNATIONAL\n" +
             "LICENSE (CC BY-NC-SA 4.0).\n\n" +
             "YOU ARE FREE TO:\n" +
             "- SHARE: COPY AND REDISTRIBUTE THE MATERIAL.\n" +
             "- ADAPT: REMIX, TRANSFORM, AND BUILD UPON THE CODE.\n\n" +
             "UNDER THE FOLLOWING TERMS:\n" +
             "- BY (ATTRIBUTION): YOU MUST GIVE APPROPRIATE CREDIT.\n" +
             "- NC (NON-COMMERCIAL): COMMERCIAL USE IS PROHIBITED.\n" +
             "- SA (SHAREALIKE): DISTRIBUTE UNDER THE SAME LICENCE.\n\n" +
             "DIGITAL IDENTIFIER CODE: CC-BY-NC-SA-4.0-INT"
  }
];

// ==========================================
// 2. CARICAMENTO ASSET E SETUP
// ==========================================
function preload() {
  imgLaposky = loadImage('visual2.jpeg', 
    () => { imgLoaded = true; }, 
    () => { console.warn("Immagine 'visual2.jpeg' non trovata. Uso del layout testuale standard."); }
  ); 
}

function setup() {
  // CONTROLLO PARAMETRI URL IN CIMA ASSOLUTA AL SETUP
  let params = getURLParams();
  if (params.state) {
    try {
      let decodedData = decodeURIComponent(atob(params.state));
      visualStack = JSON.parse(decodedData);
      state = "GENERATIVE";
      systemLog = ">  SHARED STACK INJECTED SUCCESSFULLY\n>  LOGGED PARAMETERS RESTORED. STACK: " + visualStack.length;
    } catch (err) {
      console.error("Errore nella decodifica dello stato condiviso:", err);
      state = "MENU";
      systemLog = ">  SYSTEM RESET\n>  CANVAS EMPTY. AWAITING INPUT...";
    }
  } else {
    state = "MENU";
    systemLog = ">  SYSTEM RESET\n>  CANVAS EMPTY. AWAITING INPUT...";
  }

  // INIZIALIZZAZIONE AMBIENTE GRAFICO E STRUTTURE DOM
  createCanvas(windowWidth, windowHeight);
  textFont("VT323");

  initCyberSound();

  let arcDiv = createDiv("");
  arcDiv.id("archive-container");

  let inputWrapper = createDiv("");
  inputWrapper.id("terminal-input-wrapper");
  inputWrapper.style("position", "absolute");
  inputWrapper.style("display", "flex");
  inputWrapper.style("align-items", "center");
  inputWrapper.style("z-index", "999");
  
  let prefix = createSpan("> ");
  prefix.style("font-family", "'VT323', monospace");
  prefix.style("font-size", "20px"); 
  prefix.style("color","#00ff41" );
  prefix.style("margin-right", "8px");
  prefix.style("user-select", "none");
  inputWrapper.child(prefix);

  inputField = createInput("");
  inputField.addClass("input-style");
  inputWrapper.child(inputField);
  inputField.attribute("maxlength", "50"); 
  
  inputWrapper.show(); 

  centerInput();

  inputField.elt.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault(); 
      triggerUndo();
      return;
    }

    if (e.key === "Enter") {
      processText();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      inputField.elt.blur();
      if (archiveItems.length > 0) {
        moveSelection(1);
      }
    }
  });

  inputField.elt.focus();
}

// ==========================================
// 3. MOTORE AUDIO MECCANICO (SINTESI SONORA)
// ==========================================
function initCyberSound() {
  oscClick = new p5.Oscillator("triangle");
  envClick = new p5.Envelope();
  envClick.setADSR(0.001, 0.02, 0.0, 0.005);
  envClick.setRange(0.25, 0.0);
  oscClick.disconnect();
  oscClick.connect();
  oscClick.start();
  oscClick.amp(envClick);

  oscClack = new p5.Oscillator("triangle");
  envClack = new p5.Envelope();
  envClack.setADSR(0.002, 0.045, 0.0, 0.015);
  envClack.setRange(0.35, 0.0);
  oscClack.disconnect();
  oscClack.connect();
  oscClack.start();
  oscClack.amp(envClack);

  oscBoot = new p5.Oscillator("square"); 
  envBoot = new p5.Envelope();
  envBoot.setADSR(0.01, 0.12, 0.8, 0.05); 
  envBoot.setRange(0.25, 0.0);
  oscBoot.freq(800); 
  oscBoot.disconnect();
  oscBoot.connect();
  oscBoot.start();
  oscBoot.amp(envBoot);
}

function playCyberClick() {
  userStartAudio();

  if (!hasBooted) {
    envBoot.play(oscBoot);
    hasBooted = true;
    return; 
  }

  let jitter = random(-12, 12);
  oscClick.freq(380 + jitter);
  let baseClack = 110 + jitter;
  oscClack.freq(baseClack);
  oscClack.freq(30, 0.02);

  envClick.play(oscClick);
  envClack.play(oscClack);
}

// ==========================================
// 4. LOGICA DI ELABORAZIONE TESTO E COMANDI
// ==========================================
function generatePlaceholderLayer() {
  let newLayer = {
    text: "START", 
    axes: 6, 
    verbs: 1, 
    energy: 25, 
    complexity: 12, 
    nounsCount: 2,
    seed: 42, 
    isPlaceholder: true,
    isParticles: false,
    extraThickness: 0,
    glitchActive: false,
    glitchWord: "",
    neonParamActive: false 
  };
  visualStack.push(newLayer);
}

function centerInput() {
  let wrapper = select("#terminal-input-wrapper");
  if (!wrapper) return;

  let currentW = 415;
  let currentX = 35;
  
  let linesArray = systemLog.split("\n");
  let lineCount = linesArray.length;
  let currentY = 35 + (lineCount * 24) + 20;

  if (width < 600) {
    currentW = width * 0.8;
    currentX = width / 2 - min(200, width * 0.4);
    currentY = height - 120; 
  }

  wrapper.position(currentX, currentY);
  wrapper.style("width", currentW + "px");
}

function triggerUndo() {
  if (visualStack.length > 0 && !visualStack[0].isPlaceholder) {
    visualStack.pop(); 
    systemLog = ">  UNDO EXECUTED\n>  LAST PARAMETER LAYER REMOVED. STACK: " + visualStack.length;
  }
  
  if (visualStack.length === 0) {
    systemLog = ">  SYSTEM RESET\n>  CANVAS EMPTY. AWAITING INPUT...";
  }
  
  bootTimer = 0;
  inputField.value("");
  centerInput();
}

function generateShareLink() {
  if (visualStack.length === 0 || (visualStack.length === 1 && visualStack[0].isPlaceholder)) {
    systemLog = ">  SHARE FAILED: STACK IS EMPTY OR INVALID";
    bootTimer = 0;
    centerInput();
    return;
  }
  try {
    let jsonStr = JSON.stringify(visualStack);
    let base64Str = btoa(encodeURIComponent(jsonStr));
    
    // Prende automaticamente l'indirizzo del tuo sito reale (es. laura.github.io/wave-system/)
    let shareURL = window.location.origin + window.location.pathname + "?state=" + base64Str;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareURL).then(() => {
        systemLog = ">  SHARE URL GENERATED & COPIED TO CLIPBOARD!";
        bootTimer = 0;
        centerInput();
      }).catch(err => {
        fallbackCopyText(shareURL);
      });
    } else {
      fallbackCopyText(shareURL);
    }
  } catch (e) {
    console.error(e);
    systemLog = ">  SHARE MODULE CRITICAL ERROR";
    bootTimer = 0;
    centerInput();
  }
}
function fallbackCopyText(text) {
  try {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      systemLog = ">  SHARE URL GENERATED:\n>  COPY TO CLIPBOARD";
    } else {
      systemLog = ">  SHARE FAILED: BROWSER PERMISSION DENIED";
    }
  } catch (err) {
    console.error("Fallback fallito:", err);
    systemLog = ">  SHARE FAILED: COPIER UNAVAILABLE";
  }
  bootTimer = 0;
  centerInput();
}

function processText() {
  let val = inputField.value().trim();
  if (val.length > 0) {
    let lowerVal = val.toLowerCase();
    
    if (lowerVal === "help") {
      systemLog = ">  SYSTEM COMMANDS MANUAL:\n" +
                  "   >  CLEAN   : UNDO LAST PARAMETER LAYER\n" +
                  "   >  SAVE    : ARCHIVE MESH STACK TO LOGS\n" +
                  "   >  SHARE   : EXPORT LINK TO GENERATIVE LAYER STACK\n" +
                  "   >  SHIFT + F : TOGGLE FULLSCREEN CRT MODE";
      bootTimer = 0;
      inputField.value("");
      centerInput(); 
      return;
    }

    let container = select("#archive-container");
    if (container) container.show();

    if (lowerVal === "clean") {
      triggerUndo();
      return;
    }

    if (lowerVal === "save") {
      saveToArchive();
      inputField.value("");
      return;
    }

    if (lowerVal === "share") {
      generateShareLink();
      inputField.value("");
      return;
    }

    let hasReservedWords = /\b(save|clean|share)\b/i.test(val);
    if (hasReservedWords) {
      systemLog = ">  SYNTAX ERROR: COMMAND WORDS RESERVED\n>  AWAITING VALID ENCRYPTED SENTENCE...";
      bootTimer = 0;
      inputField.value("");
      centerInput();
      return;
    }

    if (visualStack.length === 1 && visualStack[0].isPlaceholder) visualStack = [];

    let words = RiTa.tokenize(val);
    let phones = RiTa.phones(val);
    let tags = RiTa.pos(val);
    
    let verbCount = 0;
    let nounCount = 0;
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].startsWith("v")) verbCount++;
      if (tags[i].startsWith("n")) nounCount++;
    }

    let glitchTriggered = random(100) < 30;
    let chosenGlitchWord = "";
    if (glitchTriggered && words.length > 0) {
      chosenGlitchWord = random(words);
    }

    let isEvolutionMode = visualStack.length > 0;

    let newLayer = {
      text: val.toUpperCase(), 
      axes: words.length + 2, 
      verbs: verbCount, 
      energy: val.length, 
      complexity: phones.length, 
      nounsCount: nounCount,
      seed: random(1000), 
      isPlaceholder: false,
      isParticles: false,
      extraThickness: 0,
      glitchActive: glitchTriggered,
      glitchWord: chosenGlitchWord,
      neonParamActive: false
    };

    if (nounCount > 0) {
      if (nounCount % 2 === 0) {
        newLayer.isParticles = true; 
      } else {
        newLayer.extraThickness += nounCount * 1.5; 
      }
    }

    if (isEvolutionMode) {
      if (verbCount > 0) {
        newLayer.neonParamActive = true; 
      }
      systemLog = ">  LAYER ADDED & EVOLVED WITH: " + val.toUpperCase();
    } else {
      systemLog = ">  LAYER MESHED: " + newLayer.text + "\n>  COMPILING PHOSPHORS...";
    }

    visualStack.push(newLayer);

    state = "GENERATIVE";
    bootTimer = 0;
    centerInput(); 
    inputField.value("");
  }
}

// ==========================================
// 5. GESTIONE ARCHIVIO
// ==========================================
function saveToArchive() {
  if (visualStack.length === 0 || (visualStack.length === 1 && visualStack[0].isPlaceholder)) {
    systemLog = ">  SAVE FAILED: STACK IS EMPTY OR INVALID";
    bootTimer = 0;
    centerInput();
    return;
  }
  let img = get(width / 2 - 150, height / 2 - 150, 300, 300);
  let container = select("#archive-container");
  let item = createDiv("");
  item.addClass("archive-item");
  let thumbnail = createElement("img");
  thumbnail.attribute("src", img.canvas.toDataURL());
  item.child(thumbnail);

  let savedStack = [...visualStack];
  archiveItems.push({ element: item, stack: savedStack });
  container.child(item);
  systemLog = ">  STACK ARCHIVED\n>  NODES: " + visualStack.length;
  bootTimer = 0;
  centerInput();
}

// ==========================================
// 6. INPUT TASTIERA
// ==========================================
function moveSelection(direction) {
  if (archiveItems.length === 0) return;
  if (selectedArchiveIndex >= 0) archiveItems[selectedArchiveIndex].element.removeClass("selected-item");
  if (selectedArchiveIndex === -1 && direction === -1) {
    selectedArchiveIndex = archiveItems.length - 1;
  } else {
    selectedArchiveIndex = (selectedArchiveIndex + direction + archiveItems.length) % archiveItems.length;
  }
  archiveItems[selectedArchiveIndex].element.addClass("selected-item");
}

function keyPressed() {
  if (keyCode !== SHIFT && keyCode !== CONTROL && keyCode !== ALT) playCyberClick();

  if (keyCode === ESCAPE) {
    if (state === "ABOUT" || state === "TOUR") {
      state = "MENU";
      return;
    }
  }

  if (state === "MENU") {
    if (keyCode === DOWN_ARROW) menuStep = (menuStep + 1) % menuOptions.length;
    else if (keyCode === UP_ARROW) menuStep = (menuStep - 1 + menuOptions.length) % menuOptions.length;
    else if (keyCode === ENTER) {
      if (menuStep === 0) { state = "TOUR"; tourStep = 0; arcadeBootFrame = 0; holdTimer = 0; }
      else if (menuStep === 1) { state = "ABOUT"; aboutStep = 0; scanLineY = 0; }
    }
    return;
  }

  if (state === "ABOUT") {
    if (keyCode === RIGHT_ARROW) { 
      if (aboutStep < aboutPages.length - 1) { aboutStep++; scanLineY = 0; } 
    }
    else if (keyCode === LEFT_ARROW) { 
      if (aboutStep > 0) { aboutStep--; scanLineY = 0; } 
      else state = "MENU"; 
    }
    return;
  }

  if (state === "TOUR") {
    if (tourStep === tourPages.length - 1) return;

    if (keyCode === RIGHT_ARROW) {
      if (tourStep < tourPages.length - 1) {
        tourStep++;
        if (tourStep === tourPages.length - 1) { arcadeBootFrame = 0; holdTimer = 0; }
      }
    } else if (keyCode === LEFT_ARROW) { 
      if (tourStep > 0) tourStep--; 
      else state = "MENU"; 
    }
    return;
  }

  let wrapper = select("#terminal-input-wrapper");
  if ((key === "F" || key === "f") && keyIsDown(SHIFT)) {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      select("#archive-container").addClass("hidden-ui");
      if (wrapper) wrapper.addClass("hidden-ui");
      inputField.elt.blur();
    } else {
      select("#archive-container").removeClass("hidden-ui");
      if (wrapper) wrapper.removeClass("hidden-ui");
    }
    return false;
  }

  let isTyping = document.activeElement === inputField.elt;
  if (keyCode === UP_ARROW && !isTyping) {
    if (!isFullscreen) {
      if (selectedArchiveIndex >= 0) archiveItems[selectedArchiveIndex].element.removeClass("selected-item");
      selectedArchiveIndex = -1;
      inputField.elt.focus();
    }
  }

  if (!isTyping) {
    if (keyCode === RIGHT_ARROW) moveSelection(1);
    else if (keyCode === LEFT_ARROW) moveSelection(-1);
    else if (keyCode === ENTER && selectedArchiveIndex >= 0) {
      visualStack = [...archiveItems[selectedArchiveIndex].stack];
      state = "GENERATIVE";
      systemLog = ">  RESTORING COMPLEX STACK\n>  LAYERS: " + visualStack.length;
      bootTimer = 0;
      centerInput();
    }
  }
}

// ==========================================
// 7. DRAW LOOP PRINCIPALE
// ==========================================
function draw() {
  let wrapper = select("#terminal-input-wrapper");

  if (state === "MENU" || state === "ABOUT" || state === "TOUR") {
    if (wrapper) wrapper.hide();
  }

  if (state === "MENU" || state === "ABOUT" || state === "TOUR") {
    background(2, 6, 2); 
  } else {
    let activeNeon = false;
    for (let layer of visualStack) {
      if (layer.neonParamActive) {
        activeNeon = true;
        break;
      }
    }
    if (activeNeon) {
      background(2, 6, 2, 10); 
    } else {
      background(2, 6, 2, 40); 
    }
  }

  if (state === "MENU") { drawMenu(); return; }
  if (state === "ABOUT") { drawAbout(); return; }
  if (state === "TOUR") { drawTour(); return; }

  if (!isFullscreen) {
    drawInterface();
    if (wrapper && (state === "INPUT" || state === "GENERATIVE")) {
      wrapper.show();
    }
  }

  if ((state === "INPUT" || state === "GENERATIVE") && visualStack.length > 0) {
    push();
    translate(width / 2, height / 2);
    
    let scaleFactor = min(1, width / 1000, height / 800);
    if(width < 600) scaleFactor *= 0.75;
    scale(scaleFactor);
    blendMode(SCREEN);
    for (let layer of visualStack) renderLayer(layer, false); 
    blendMode(BLEND);
    pop();
  }
}

// ==========================================
// 8. INTERFACCE GRAFICHE E MENU
// ==========================================
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
  fill(0, 255, 65); noStroke(); 
  
  textAlign(LEFT, TOP);
  let paddingX = max(50, width * 0.08); 
  let maxTextWidth = width - (paddingX * 2);
  let maxTextHeight = height - 180; 

  textSize(min(26, width * 0.05)); 
  text(aboutPages[aboutStep].title, paddingX, 60);
  
  let fullText = aboutPages[aboutStep].content;
  let baseTextSize = min(19, width * 0.032); 
  textSize(baseTextSize);
  textLeading(baseTextSize * 1.3); 
  
  let textSpaceRatio = 0.55; 
  let leftColumnWidth = maxTextWidth * textSpaceRatio;
  
  if (aboutStep === 2) {
    text(fullText, paddingX, 115, leftColumnWidth, maxTextHeight);
    
    if (imgLoaded && imgLaposky) {
      let rightColumnWidth = maxTextWidth * (1 - textSpaceRatio) - 40;
      let imgX = paddingX + leftColumnWidth + 40;
      let imgY = 115;
      let maxImgW = rightColumnWidth;
      let maxImgH = height - 220;
      
      let imgRatio = imgLaposky.width / imgLaposky.height;
      let renderW = maxImgW;
      let renderH = renderW / imgRatio;
      
      if (renderH > maxImgH) {
        renderH = maxImgH;
        renderW = renderH * imgRatio;
      }
      
      if (scanLineY < renderH) {
        scanLineY += 4; 
      }

      let visibleHeight = min(scanLineY, renderH);
      
      if (visibleHeight > 0) {
        let srcH = visibleHeight * (imgLaposky.height / renderH);
        
        image(imgLaposky, imgX, imgY, renderW, visibleHeight, 0, 0, imgLaposky.width, srcH);
        
        if (scanLineY < renderH) {
          let currentLineY = imgY + visibleHeight;
          
          stroke(0, 255, 65, 30);
          makeLineNeon(imgX, currentLineY, renderW);
          
          noStroke();
        }
      }
    }
  } 
  else {
    if (fullText.includes("---")) {
      let parts = fullText.split("----------------------------------------------------");
      let mainCredits = parts[0]; 
      let legalNotice = "----------------------------------------------------\n" + parts[1].trim();
      
      text(mainCredits, paddingX, 115, leftColumnWidth, maxTextHeight);
      
      let legalTextSize = min(14, width * 0.024); 
      textSize(legalTextSize); 
      textLeading(legalTextSize * 1.3); 
      
      text(legalNotice, paddingX, height - 260, leftColumnWidth, 140);
    } else { 
      text(fullText, paddingX, 115, leftColumnWidth, maxTextHeight); 
    }
  }
  
  textAlign(LEFT, BOTTOM); 
  textSize(min(18, width * 0.03)); 
  fill(0, 255, 65, 140);
  text("[ PAGE " + (aboutStep + 1) + " DI " + aboutPages.length + " ]  •  (L/R to flip - ESC to exit)", paddingX, height - 60);
}

function makeLineNeon(x, y, w) {
  strokeWeight(16);
  line(x, y, x + w, y);
  stroke(0, 255, 65, 80);
  strokeWeight(8);
  line(x, y, x + w, y);
  stroke(0, 255, 65, 180);
  strokeWeight(3.5);
  line(x, y, x + w, y);
  stroke(230, 255, 235, 245);
  strokeWeight(1.2);
  line(x, y, x + w, y);
}

function drawTour() {
  stroke(0, 255, 65, 40); noFill(); rect(30, 30, width - 60, height - 60);
  fill(0, 255, 65); noStroke(); 

  if (tourStep === tourPages.length - 1) {
    let currentPct = floor((arcadeBootFrame / ARCADE_BOOT_DURATION) * 100);
    let holdActive = false;
    let holdMessage = ">  INITIALIZING WAVE SYSTEM PROCESSORS...";

    if (currentPct >= 80 && currentPct < 85 && holdTimer < 120) {
      holdActive = true;
      holdTimer++;
      holdMessage = ">  WARNING: HOLDING FOR BUFFER COMPILATION...";
    } else if (currentPct >= 98 && currentPct < 100 && holdTimer < 240) {
      holdActive = true;
      holdTimer++;
      holdMessage = ">  CRITICAL WARNING: MEMORY DUMP SYNC...";
    } else {
      arcadeBootFrame++;
    }

    let progress = min(1, arcadeBootFrame / ARCADE_BOOT_DURATION); 
    let displayPct = floor(progress * 100);

    textAlign(CENTER, CENTER);
    textSize(min(22, width * 0.04));
    
    if (holdActive) {
      fill(255, 60, 60); 
      text(holdMessage, width / 2, height / 2 - 90);
      fill(0, 255, 65);
    } else {
      if (frameCount % 30 < 15) {
        text(holdMessage, width / 2, height / 2 - 90);
      } else {
        fill(0, 255, 65, 80);
        text(holdMessage, width / 2, height / 2 - 90);
        fill(0, 255, 65);
      }
    }

    textSize(min(16, width * 0.03));
    textAlign(LEFT, CENTER);
    let logX = width / 2 - 150;
    if (displayPct > 15) text("ROM CHECK: OK", logX, height / 2 - 50);
    if (displayPct > 40) text("RITA.JS CORE ENGINE: MOUNTED", logX, height / 2 - 30);
    if (displayPct > 70) text("CRT PHOSPHOR LAYER: ACTIVE", logX, height / 2 - 10);
    
    textAlign(CENTER, CENTER);
    let barLength = 20; 
    let numBlocks = floor(progress * barLength);
    let barString = "";
    for (let b = 0; b < numBlocks; b++) barString += "█";
    for (let s = numBlocks; s < barLength; s++) barString += "░";

    textSize(min(28, width * 0.05));
    text("[" + barString + "] " + displayPct + "%", width / 2, height / 2 + 40);

    textSize(min(18, width * 0.03));
    fill(0, 255, 65, 150);
    text("PLEASE WAIT... DO NOT TURN OFF TERMINAL", width / 2, height / 2 + 90);

    if (displayPct >= 100) {
      state = "INPUT";
      let wrapper = select("#terminal-input-wrapper");
      if (wrapper) wrapper.show();
      centerInput();
      inputField.elt.focus();
    }
  } 
  else {
    textAlign(LEFT, TOP);
    let paddingX = max(60, width * 0.08); 
    textSize(min(26, width * 0.05)); 
    text(tourPages[tourStep].title, paddingX, 60);
    
    let baseTextSize = min(20, width * 0.034); 
    textSize(baseTextSize); 
    textLeading(baseTextSize * 1.40); 
    
    let maxTextWidth = width - (paddingX * 2);
    let textSpaceRatio = 0.55; 
    let leftColumnWidth = maxTextWidth * textSpaceRatio;

    text(tourPages[tourStep].content, paddingX, 130, leftColumnWidth, height - 180);
    
    textAlign(LEFT, BOTTOM); 
    textSize(min(18, width * 0.03)); 
    fill(0, 255, 65, 140);
    text("[ PAGE " + (tourStep + 1) + " DI " + tourPages.length + " ]  •  (L/R to flip - ESC to exit)", paddingX, height - 60);
  }
}

function drawInterface() {
  stroke(0, 255, 65, 40); noFill(); rect(15, 15, width - 30, height - 30);
  fill(0, 255, 65); noStroke(); textAlign(LEFT, TOP); 
  textSize(20); 
  let currentLog = systemLog.substring(0, bootTimer); text(currentLog, 35, 35, width - 60);
  if (frameCount % 2 == 0 && bootTimer < systemLog.length) bootTimer++;
}

// ==========================================
// 9. ENGINE DI RESA GRAFICA (LAYER PARAMETRICI)
// ==========================================
function renderLayer(layerData, globalNeonActive) {
  noFill();
  
  let baseWeight = layerData.isPlaceholder ? 0.8 : map(layerData.energy, 1, 50, 0.5, 2);
  let finalWeight = baseWeight + layerData.extraThickness;
  if (layerData.neonParamActive) finalWeight += 1.5; 
  strokeWeight(finalWeight);

  let angle = TWO_PI / layerData.axes;
  let baseHue = (layerData.seed * 137.5) % 360;

  let glitchOffset = 0;
  if (layerData.glitchActive) {
    glitchOffset = sin(frameCount * 0.2) * (layerData.glitchWord.length * 0.5);
  }

  for (let i = 0; i < layerData.axes; i++) {
    push();
    
    let rotationalSpeed = layerData.glitchActive ? 0.03 : 0.002;
    rotate(i * angle + frameCount * rotationalSpeed + glitchOffset);
    
    if (layerData.verbs === 0) {
      stroke(255, layerData.isPlaceholder ? 40 : 120);
    } else {
      colorMode(HSB, 360, 100, 100, 100);
      let colorStep = 360 / (layerData.verbs + 1);
      let currentHue = (baseHue + floor(i / 2) % (layerData.verbs + 1) * colorStep + (i % 2 === 1 ? 180 : 0)) % 360;
      
      let sat = layerData.neonParamActive ? 100 : 85;
      let alpha = layerData.isPlaceholder ? 20 : (layerData.neonParamActive ? 90 : 60);
      stroke(currentHue, sat, 100, alpha);
    }
    
    if (layerData.isParticles) {
      for (let j = 0; j < 1; j += 0.04) {
        let n = noise(j * 1.5, frameCount * 0.005 + layerData.seed + i);
        if (layerData.glitchActive) n += random(-0.1, 0.1); 
        
        let r = map(n, 0, 1, 50, layerData.energy * 7) + sin(j * layerData.complexity + frameCount * 0.05) * 12;
        let px = r * cos(j * TWO_PI);
        let py = r * sin(j * TWO_PI * (layerData.verbs + 1));
        
        strokeWeight(finalWeight * 2);
        point(px, py);
      }
    } else {
      beginShape();
      for (let j = 0; j < 1; j += 0.02) {
        let n = noise(j * 1.5, frameCount * 0.005 + layerData.seed + i);
        if (layerData.glitchActive) n += sin(frameCount * 0.5) * 0.08;
        
        let r = map(n, 0, 1, 50, layerData.energy * 7) + sin(j * layerData.complexity + frameCount * 0.05) * 12;
        vertex(r * cos(j * TWO_PI), r * sin(j * TWO_PI * (layerData.verbs + 1)));
      }
      endShape();
    }
    
    pop();
    colorMode(RGB);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerInput();
}