/* TODO:
 * Wifi bar, battery perc icons (already mostly implemented, just ensure styling is good)
 * Add "reset time" option (already implemented)
 * Add power menu (implemented within start menu)
 * Fix index=-1 bug on icon select (needs testing)
 * Sort programs in programbar (implemented in start menu "All Apps")
 * Make anything work in IE (not a priority for modern web apps)
 */

// Global variables for UI state and data
var xStart = 0,
  yStart = 0,
  selWin = 0;
var prevX = 0,
  prevY = 0;
var clicked = false,
  resize = false,
  setFullscreen = 0,
  attr,
  select = false,
  preventEvents = false,
  expanded = false,
  slide = false;
var lockTaskbar = true, // This primarily affects max/fullscreen window height calculation
  lockTaskbah = false, // This controls the "taskbah" sound
  hide = true, // This variable is largely unused now as taskbar is always visible
  preventHide = false;
var windows = [],
  origNames = [],
  winCount = 0,
  hiddenApps = 5, // Number of system apps at the end of programData not to be shown on desktop
  permaStickied = 3; // Denotes the taskbar icons that cannot be unpinned (Explorer, Console, Emojifuck)
var last = 0; // For double-click detection
var contextAssort = [
  [0, 1, 2, 3], // Desktop icon context menu: Open, Open All, Rename, Pin to taskbar
  [4, 5, 6, 7], // Taskbar icon context menu (dynamic app): Pin, Unpin, Open new, Close
  [8, 9, 10, 17], // Desktop background context menu: Fullscreen, Enable context menu, Change wallpaper, System Configuration (NEW)
  [11, 12], // Taskbar background context menu: Lock taskbar, Lock the taskbah
  [6, 7], // Taskbar icon context menu (system app): Open new, Close
  [7], // Taskbar icon context menu (error/settings window): Close
  [13, 14, 15, 16] // File Explorer item context menu: Open, Go to directory, Open in new explorer, Open as HTML
];
var types = {
  doc: ["css", "Cascading Style Sheet file", "js", "JavaScript file", "html", "HTML document", "json", "JavaScript Object Notation file", "ahk", "AutoHotKey script", "txt", "Plain text document", "zip", "Compressed archive", "hs", "Haskell file", "java", "Java file", "py", "Python script file"],
  img: ["jpg", "JPEG image", "jpeg", "JPEG image", "png", "PNG image", "bmp", "BMP image", "gif", "GIF image"],
  audio: ["mp3", "MP3 audio file", "wav", "Waveform file"],
  font: ["otf", "OpenType font file", "ttf", "TrueType font file"]
};

// Color schemes for personalization
var colors = [
  // Existing 7 color schemes (indices 0-6)
  ["#600", "#d42", "#d77", "linear-gradient(135deg, #ff5e5e 0%,#bd1929 38%,#0e0000 100%)"],
  ["#060", "#3a2", "#7f5", "linear-gradient(135deg, #64e25e 0%,#098022 38%,#051700 100%)"],
  ["#005", "#53f", "#29f", "linear-gradient(135deg, #64a4c4 0%,#1c5d9e 38%,#1c0935 100%)"],
  ["#a40", "#d72", "#da4", "linear-gradient(135deg, #ffbb5e 0%,#b14b03 38%,#350f00 100%)"],
  ["#317", "#74a", "#85f", "linear-gradient(135deg, #ae41cc 0%,#53136d 38%,#000000 100%)"],
  ["#222", "#333", "#777", "linear-gradient(135deg, #696969 0%,#232323 50%,#000000 100%)"],
  ["#999", "#aaa", "#ddd", "linear-gradient(135deg, #e8e8e8 0%,#a0a0a0 50%,#1f1f1f 100%)"],
  // Light blue scheme (index 7), default - Adjusted to be more "cyanblue"
  ["#00bfff", "#009acd", "#87ceeb", "linear-gradient(135deg, #00bfff 0%, #007bb6 50%, #003366 100%)"]
];
var backgrounds = ["Abstract.jpg", "Bouncy.jpg", "Gimignano.jpg", "Flower.jpg", "Bucks.jpg", "Leaf.jpg", "LonelyRoad.jpg", "Flowers.jpg", "Mandelbrot.png", "Match.jpg"];
contextShow = false, next = null;

// Load variables from localStorage or set defaults
var taskArr = [0, 2], // Default pinned apps (Home, Mandelbrot)
  oftenUsed = []; // Stores usage count for programs
var tzIndex = parseInt(localStorage.getItem("tzIndex")) || 0,
  tzOffset = parseInt(localStorage.getItem("tzOffset")) || 0;
var tmpArr = localStorage.getItem("taskArr");
taskArr = tmpArr != null ? tmpArr.split(",").map(Number) : taskArr; // Ensure taskArr is numbers
var DEF_WIN_W = parseInt(localStorage.getItem("winW")) || 60;
var DEF_WIN_H = parseInt(localStorage.getItem("winH")) || 35;
var ou = localStorage.getItem("oftenUsed");
if (ou != null) {
  oftenUsed = ou.split(",").map(Number); // Ensure oftenUsed is numbers
}
var colId = parseInt(localStorage.getItem("colId")) || 7; // Default colId to 7 for Light Blue (now cyan blue)
var backId = parseInt(localStorage.getItem("backId")) || 0; // Default background is gradient (index 0)
lockTaskbar = localStorage.getItem("lockTaskbar") != "0"; // Default to locked
document.body.classList.add(localStorage.getItem("viewmode") || "grid"); // Default view mode

// Program data defining all available applications
var programData = [{
    name: "Home",
    url: "index.html",
    icon: {
      url: "home"
    },
    keywords: "home,homepage,index,information"
  },
  {
    name: "Sudoku Solver",
    url: "sudokuSolver.html",
    icon: {
      url: "sudokusolver"
    },
    keywords: "sudoku,solver,games,interactive"
  },
  {
    name: "Mandelbrot",
    url: "mandelbrot.html",
    icon: {
      url: "mandelbrot"
    },
    keywords: "mandelbrot,julia,set,generator,fractal,interactive,math,canvas"
  },
  {
    name: "Pitchfork Emporium",
    url: "pitchforkEmporium.html",
    icon: {
      url: "pitchforkemporium"
    },
    keywords: "pitchfork,emporium,store,webshop,reddit,api"
  },
  {
    name: "Boids",
    url: "https://aquaplexus.net/fishSim",
    icon: {
      url: "boids"
    },
    keywords: "boids,craig,reynolds,interactive,fish,simulation"
  },
  {
    name: "HTML Editor",
    url: "editor.html",
    icon: {
      url: "htmleditor"
    },
    keywords: "html,editor,css,interactive,gadget"
  },
  {
    name: "Bézier",
    url: "bezier.html",
    icon: {
      url: "bezier"
    },
    keywords: "bezier,bézier,interactive,gadget"
  },
  {
    name: "Is it Prime?",
    url: "isitprime/index.html",
    icon: {
      url: "isitprime"
    },
    keywords: "prime,generator,math,information"
  },
  {
    name: "N:th Prime",
    url: "nthPrime.html",
    icon: {
      url: "nthprime"
    },
    keywords: "nth,prime,generator,math,information"
  },
  {
    name: "reddit Live 2.0",
    url: "redditLive.html",
    icon: {
      url: "redditlive"
    },
    keywords: "reddit,live,api,information"
  },
  {
    name: "Game of Life",
    url: "https://aquaplexus.net/gameoflife",
    icon: {
      url: "gameoflife"
    },
    keywords: "game,life,interactive,simulation,conway"
  },
  {
    name: "Hit Lawyer",
    url: "hitLawyer.html",
    icon: {
      url: "hitlawyer"
    },
    keywords: "hit,lawyer,gadget"
  },
  {
    name: "Fractal",
    url: "https://aquaplexus.net/fractal",
    icon: {
      url: "fractal"
    },
    keywords: "fractal,generator,interactive,math"
  },
  {
    name: "Multiples",
    url: "multiples.html",
    icon: {
      url: "multiples"
    },
    keywords: "multiples,math,interactive"
  },
  {
    name: "Fireworks",
    url: "https://aquaplexus.net/firework",
    icon: {
      url: "fireworks"
    },
    keywords: "fireworks,interactive,gadget,canvas"
  },
  {
    name: "Phone Snake",
    url: "phonesnake.html",
    icon: {
      url: "phonesnake"
    },
    keywords: "phone,snake,game,interactive"
  },
  {
    name: "Parrots",
    url: "parrots.html",
    icon: {
      url: "parrots"
    },
    keywords: "parrots,dank,reddit,party,epilepsy"
  },
  {
    name: "404.html",
    url: "404.html",
    icon: {
      url: "404"
    },
    keywords: "404,terminal,console,greentext"
  },
  {
    name: "Matrix",
    url: "matrix.html",
    icon: {
      url: "matrix"
    },
    keywords: "matrix,math,multiplication"
  },
  {
    name: "Sweeper",
    url: "games/minesweeper/index.html",
    icon: {
      url: "minesweeper"
    },
    keywords: "mine,sweeper,game,interactive"
  },
  {
    name: "Dodge",
    url: "games/dodge/index.html",
    icon: {
      url: "dodge"
    },
    keywords: "game,reddit,cursor,slide"
  },
  {
    name: "Emojifuck",
    url: "emojifuck/index.html",
    icon: {
      url: "emojifuck"
    },
    keywords: "emoji,brainfuck,esolang,interpreter"
  },
  {
    name: "about.txt",
    url: "about.txt",
    icon: {
      file: "txt"
    },
    keywords: "about,meta,info,text,document,txt,DzOS"
  },
  {
    name: "Viewer",
    url: "",
    icon: {
      url: "viewer"
    },
    keywords: ""
  },
  {
    name: "Console",
    url: "",
    icon: {
      url: "console"
    },
    keywords: ""
  },
  {
    name: "Prompt",
    url: "",
    icon: {
      svg: "info_icon"
    }, // This is an SVG icon
    keywords: ""
  },
  {
    name: "Settings",
    url: "",
    icon: {
      url: "cogbig"
    }, // This is a PNG icon
    keywords: ""
  },
  {
    name: "File Explorer",
    url: "",
    icon: {
      url: "explorer"
    },
    keywords: ""
  },
  { // New entry for the Power button icon
    name: "Power",
    url: "",
    icon: {
      url: "power"
    },
    keywords: ""
  }
];
const pl = programData.length; // Total number of programs
const viewerID = pl - 6; // Adjusted due to new Power entry
const consoleID = pl - 5; // Adjusted
const errID = pl - 4; // Adjusted
const setID = pl - 3; // Adjusted // Settings app ID
const explorerID = pl - 2; // Adjusted
const powerIconID = pl - 1; // ID for the new Power icon
const emojifuckID = pl - 8; // Adjusted
const defaultPage = "contents.json";

// Get references to UI elements
const startButton = document.getElementById('start-button');
const startIcon = document.getElementById('start-icon');
const startMenu = document.getElementById('start-menu');
const closeStartMenuBtn = document.getElementById('close-start-menu');
const searchButton = document.getElementById('search-button');
const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');
const searchOverlay = document.getElementById('search-overlay');
const searchResultsDiv = document.getElementById('search-results');
const settingsWindow = document.getElementById('settings-window');
const closeSettingsBtn = document.querySelector('#settings-window .close-settings-btn');
const settingsSidebarItems = document.querySelectorAll('.settings-sidebar-item');
const settingsSections = document.querySelectorAll('.settings-section');
const taskbar = document.getElementById('taskbar');
const taskbarMainSection = document.getElementById('taskbar-main-section');
const programbar = document.getElementById('programbar');
const alignLeftBtn = document.getElementById('align-left-btn');
const alignCenterBtn = document.getElementById('align-center-btn');
const taskbarPowerButton = document.getElementById('taskbar-power-button');
const powerMenu = document.getElementById('power-menu');
const restartBtn = document.getElementById('restart-option');
const shutdownBtn = document.getElementById('shutdown-option');
const taskbarTransparencySlider = document.getElementById('taskbar-transparency-slider');
const taskbarTransparencyValue = document.getElementById('taskbar-transparency-value');
const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const desktopWrapper = document.getElementById('desktopwrapper');
const notificationArea = document.getElementById('notification-area');
const notificationAreaToggle = document.getElementById('notification-area-toggle');
const calendarContainer = document.getElementById('calendar-container');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const currentMonthYearSpan = document.getElementById('current-month-year');
const calendarDaysGrid = document.getElementById('calendar-days');
const volumeIcon = document.getElementById('volume-icon');
const volumeSliderContainer = document.getElementById('volume-slider-container');
const volumeSlider = document.getElementById('volume-slider');
const volumeValueSpan = document.getElementById('volume-value');
const resetNamesBtn = document.getElementById('reset-names-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const pinnedAppsList = document.getElementById('pinned-apps-list');
const oftenUsedList = document.getElementById('often-used-list');
const allAppsList = document.getElementById('all-apps-list');
const wallpaperThumbnailsDiv = document.getElementById('wallpaper-thumbnails');
const desktop = document.getElementById('desktop');
const contextMenu = document.getElementById('context'); // Reference to the context menu
const startMenuSettingsButton = document.getElementById('start-menu-settings-button');
const startMenuPowerButton = document.getElementById('start-menu-power-button');


// Global variable to keep track of the currently displayed month in the calendar
let currentCalendarDate = new Date();
let activeWindow = null; // Track the currently active window

// --- Helper Functions ---
function getParent(el, className) {
  while (el && el.parentNode) {
    if (el.classList && el.classList.contains(className)) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

function getIconPath(program) {
  if (program.icon.url) {
    return `images/win_icons/${program.icon.url}.png`;
  } else if (program.icon.svg) {
    // For SVG icons, you might embed them or use a different path
    // For now, assuming SVGs are handled via Font Awesome or similar
    return ''; // Or return a placeholder if not handled
  } else if (program.icon.file) {
    // For file-type icons, you might have generic icons for doc, img, etc.
    return `images/win_icons/file_${program.icon.file}.png`; // Example
  }
  return ''; // Default empty
}


// --- Window Management (Simplified) ---
function createWindow(programId, initialX = 100, initialY = 100, width = DEF_WIN_W * 10, height = DEF_WIN_H * 10) {
  const program = programData[programId];
  if (!program) {
    console.error("Program not found:", programId);
    return;
  }

  const winId = `win-${Date.now()}`;
  const windowElement = document.createElement('div');
  windowElement.className = 'window';
  windowElement.id = winId;
  windowElement.style.left = `${initialX}px`;
  windowElement.style.top = `${initialY}px`;
  windowElement.style.width = `${width}px`;
  windowElement.style.height = `${height}px`;
  windowElement.setAttribute('data-program-id', programId);

  windowElement.innerHTML = `
        <div class="header">
            <img src="${getIconPath(program)}" alt="${program.name} Icon" class="window-icon">
            <span class="title">${program.name}</span>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="content">
            <iframe src="${program.url}" frameborder="0"></iframe>
        </div>
    `;

  document.getElementById('window-container').appendChild(windowElement);

  const header = windowElement.querySelector('.header');
  const closeButton = windowElement.querySelector('.close-btn');

  // Make window draggable
  header.addEventListener('mousedown', function(e) {
    if (e.target === closeButton || e.button !== 0) return; // Prevent drag on close button or right-click
    let offsetX = e.clientX - windowElement.getBoundingClientRect().left;
    let offsetY = e.clientY - windowElement.getBoundingClientRect().top;

    function moveWindow(e) {
      windowElement.style.left = `${e.clientX - offsetX}px`;
      windowElement.style.top = `${e.clientY - offsetY}px`;
    }

    function stopMove() {
      document.removeEventListener('mousemove', moveWindow);
      document.removeEventListener('mouseup', stopMove);
    }

    document.addEventListener('mousemove', moveWindow);
    document.addEventListener('mouseup', stopMove);
  });

  // Make window resizable (handled by CSS `resize: both;`)

  // Close window
  closeButton.addEventListener('click', () => {
    windowElement.remove();
    updateTaskbar(); // Refresh taskbar to remove closed app
  });

  // Bring to front on click
  windowElement.addEventListener('mousedown', () => {
    bringToFront(windowElement);
  });

  bringToFront(windowElement); // Bring newly created window to front
  updateTaskbar(); // Update taskbar to show new open app
  incrementOftenUsed(programId);
}

function bringToFront(windowElement) {
  document.querySelectorAll('.window').forEach(win => {
    win.style.zIndex = '10'; // Reset z-index
    win.classList.remove('active');
  });
  windowElement.style.zIndex = '100'; // Bring to front
  windowElement.classList.add('active');
  activeWindow = windowElement;
}

// --- Taskbar and Programbar Management ---
function updateTaskbar() {
  if (!programbar) return; // Null check
  programbar.innerHTML = ''; // Clear current taskbar icons

  // Add pinned apps
  taskArr.forEach(programId => {
    const program = programData[programId];
    if (program) {
      const iconContainer = document.createElement('div');
      iconContainer.className = 'program-icon-container';
      iconContainer.setAttribute('data-program-id', programId);
      iconContainer.innerHTML = `<img src="${getIconPath(program)}" alt="${program.name}">`;
      programbar.appendChild(iconContainer);

      iconContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isProgramOpen(programId)) {
          // If already open, bring to front or minimize/restore
          const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
          if (openWin) {
            if (openWin.classList.contains('hidden')) { // Simple minimize/restore toggle
              openWin.classList.remove('hidden');
              bringToFront(openWin);
            } else if (activeWindow === openWin) {
              openWin.classList.add('hidden'); // Minimize if active
            } else {
              bringToFront(openWin);
            }
          }
        } else {
          createWindow(programId);
        }
      });

      // Context menu for taskbar icons
      iconContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, programId, 'taskbar-icon');
      });

      // Highlight active window on taskbar
      const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
      if (openWin && !openWin.classList.contains('hidden')) {
        iconContainer.classList.add('active');
      }
    }
  });

  // Add currently open windows that are not pinned
  windows.forEach(win => {
    const programId = parseInt(win.getAttribute('data-program-id'));
    if (!taskArr.includes(programId)) { // If not already pinned
      const program = programData[programId];
      if (program) {
        const iconContainer = document.createElement('div');
        iconContainer.className = 'program-icon-container';
        iconContainer.setAttribute('data-program-id', programId);
        iconContainer.innerHTML = `<img src="${getIconPath(program)}" alt="${program.name}">`;
        programbar.appendChild(iconContainer);

        iconContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          // Same logic as above for opening/minimizing/bringing to front
          const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
          if (openWin) {
            if (openWin.classList.contains('hidden')) {
              openWin.classList.remove('hidden');
              bringToFront(openWin);
            } else if (activeWindow === openWin) {
              openWin.classList.add('hidden');
            } else {
              bringToFront(openWin);
            }
          }
        });

        iconContainer.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          showContextMenu(e, programId, 'taskbar-icon');
        });

        if (activeWindow === win && !win.classList.contains('hidden')) {
          iconContainer.classList.add('active');
        }
      }
    }
  });
}

function isProgramOpen(programId) {
  return document.querySelector(`.window[data-program-id="${programId}"]`) !== null;
}

function pinToTaskbar(programId) {
  if (!taskArr.includes(programId)) {
    taskArr.push(programId);
    localStorage.setItem("taskArr", taskArr.join(","));
    updateTaskbar();
    renderPinnedApps();
  }
}

function unpinFromTaskbar(programId) {
  taskArr = taskArr.filter(id => id !== programId);
  localStorage.setItem("taskArr", taskArr.join(","));
  updateTaskbar();
  renderPinnedApps();
}

// --- Start Menu Functions ---
function toggleStartMenu() {
  if (startMenu) {
    startMenu.classList.toggle('hidden');
    startMenu.classList.toggle('show');
    if (!startMenu.classList.contains('hidden')) {
      renderPinnedApps();
      renderOftenUsedApps();
      renderAllApps();
      // Placeholder for puzzle image logic
      // if (puzzleImageElement) {
      //    puzzleImageElement.src = `images/puzzles/${getRandomPuzzleImage()}`;
      // }
    }
  }
  // Ensure other overlays are hidden
  if (searchOverlay) searchOverlay.classList.add('hidden');
  if (powerMenu) powerMenu.classList.add('hidden');
  if (notificationArea) notificationArea.classList.add('hidden');
  if (volumeSliderContainer) volumeSliderContainer.classList.add('hidden');
}

function renderPinnedApps() {
  if (!pinnedAppsList) return;
  pinnedAppsList.innerHTML = '';
  taskArr.slice(0, 6).forEach(programId => { // Show first 6 pinned apps
    const program = programData[programId];
    if (program) {
      const appItem = document.createElement('div');
      appItem.className = 'app-grid-item';
      appItem.innerHTML = `
                <img src="${getIconPath(program)}" alt="${program.name}">
                <span>${program.name}</span>
            `;
      appItem.addEventListener('click', () => {
        createWindow(programId);
        toggleStartMenu(); // Close start menu after opening app
      });
      pinnedAppsList.appendChild(appItem);
    }
  });
}

function renderOftenUsedApps() {
  if (!oftenUsedList) return;
  oftenUsedList.innerHTML = '';
  // Sort oftenUsed by count (descending) and take top N
  const sortedOftenUsed = Object.entries(oftenUsed)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 6); // Top 6 often used apps

  sortedOftenUsed.forEach(([programIdStr, count]) => {
    const programId = parseInt(programIdStr);
    const program = programData[programId];
    if (program) {
      const appItem = document.createElement('div');
      appItem.className = 'app-grid-item';
      appItem.innerHTML = `
                <img src="${getIconPath(program)}" alt="${program.name}">
                <span>${program.name}</span>
            `;
      appItem.addEventListener('click', () => {
        createWindow(programId);
        toggleStartMenu();
      });
      oftenUsedList.appendChild(appItem);
    }
  });
}

function incrementOftenUsed(programId) {
  if (typeof oftenUsed[programId] === 'undefined') {
    oftenUsed[programId] = 0;
  }
  oftenUsed[programId]++;
  // Store as string in localStorage for simplicity
  localStorage.setItem("oftenUsed", JSON.stringify(oftenUsed));
}


function renderAllApps() {
  if (!allAppsList) return;
  allAppsList.innerHTML = '';
  // Filter out system apps (last `hiddenApps` items) and sort alphabetically by name
  const sortedPrograms = programData.slice(0, pl - hiddenApps)
    .sort((a, b) => a.name.localeCompare(b.name));

  sortedPrograms.forEach((program, index) => {
    const originalIndex = programData.indexOf(program); // Get original ID
    const appItem = document.createElement('li');
    appItem.className = 'app-list-item';
    appItem.textContent = program.name;
    appItem.addEventListener('click', () => {
      createWindow(originalIndex); // Use original index for opening
      toggleStartMenu();
    });
    allAppsList.appendChild(appItem);
  });
}


// --- Search Functions ---
function toggleSearchOverlay() {
  if (searchOverlay) {
    searchOverlay.classList.toggle('hidden');
    if (!searchOverlay.classList.contains('hidden')) {
      searchInput.focus();
      searchResultsDiv.innerHTML = ''; // Clear previous results
    }
  }
  // Ensure other overlays are hidden
  if (startMenu) startMenu.classList.add('hidden');
  if (powerMenu) powerMenu.classList.add('hidden');
  if (notificationArea) notificationArea.classList.add('hidden');
  if (volumeSliderContainer) volumeSliderContainer.classList.add('hidden');
}

function handleSearchInput() {
  const query = searchInput.value.toLowerCase();
  searchResultsDiv.innerHTML = ''; // Clear previous results

  if (query.length < 2) return; // Require at least 2 characters for search

  const results = programData.filter(program =>
    program.name.toLowerCase().includes(query) ||
    (program.keywords && program.keywords.toLowerCase().includes(query))
  );

  if (results.length === 0) {
    searchResultsDiv.innerHTML = '<div style="padding: 10px; text-align: center;">No results found.</div>';
    return;
  }

  results.forEach(program => {
    const programId = programData.indexOf(program); // Get the original ID
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
            <img src="${getIconPath(program)}" alt="${program.name} Icon">
            <span>${program.name}</span>
        `;
    resultItem.addEventListener('click', () => {
      createWindow(programId);
      toggleSearchOverlay(); // Close search after opening app
    });
    searchResultsDiv.appendChild(resultItem);
  });
}

// --- Settings Window Functions ---
function toggleSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.classList.toggle('hidden');
    bringToFront(settingsWindow);
  }
  // Hide other overlays
  if (startMenu) startMenu.classList.add('hidden');
  if (searchOverlay) searchOverlay.classList.add('hidden');
  if (powerMenu) powerMenu.classList.add('hidden');
  if (notificationArea) notificationArea.classList.add('hidden');
  if (volumeSliderContainer) volumeSliderContainer.classList.add('hidden');
}

function showSettingsSection(sectionId) {
  settingsSections.forEach(section => {
    section.classList.remove('active');
  });
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  settingsSidebarItems.forEach(item => {
    if (item.getAttribute('data-section') === sectionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function renderWallpaperThumbnails() {
  if (!wallpaperThumbnailsDiv) return;
  wallpaperThumbnailsDiv.innerHTML = '';
  backgrounds.forEach((bg, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'wallpaper-thumbnail';
    thumb.style.backgroundImage = `url('images/wallpapers/${bg}')`;
    thumb.setAttribute('data-bg-id', index);
    if (index === backId) {
      thumb.classList.add('selected');
    }
    thumb.addEventListener('click', () => {
      changeWallpaper(index);
      document.querySelectorAll('.wallpaper-thumbnail').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
    });
    wallpaperThumbnailsDiv.appendChild(thumb);
  });
}

function changeWallpaper(id) {
  backId = id;
  localStorage.setItem("backId", id);
  if (desktopWrapper) {
    if (id === 0) { // Assuming index 0 is the gradient background
      desktopWrapper.classList.add('grad');
      desktopWrapper.style.backgroundImage = 'none';
    } else {
      desktopWrapper.classList.remove('grad');
      desktopWrapper.style.backgroundImage = `url('images/wallpapers/${backgrounds[id]}')`;
    }
  }
}

function toggleLightDarkMode(mode) {
  if (document.body) {
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      localStorage.setItem('viewmode', 'dark');
      darkModeBtn.classList.add('active');
      lightModeBtn.classList.remove('active');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('viewmode', 'light');
      lightModeBtn.classList.add('active');
      darkModeBtn.classList.remove('active');
    }
  }
}

function updateTaskbarTransparency() {
  if (taskbarTransparencySlider && taskbar) {
    const transparency = taskbarTransparencySlider.value;
    taskbarTransparencyValue.textContent = `${transparency}%`;
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--taskbar-bg-rgb');
    taskbar.style.backgroundColor = `rgba(${rgb}, ${transparency / 100})`;
    localStorage.setItem('taskbarTransparency', transparency);
  }
}

function setTaskbarAlignment(alignment) {
  if (taskbarMainSection) {
    taskbarMainSection.classList.remove('align-left', 'align-center');
    taskbarMainSection.classList.add(`align-${alignment}`);
    localStorage.setItem('taskbarAlignment', alignment);
    // Update button active states
    if (alignLeftBtn) alignLeftBtn.classList.toggle('active', alignment === 'left');
    if (alignCenterBtn) alignCenterBtn.classList.toggle('active', alignment === 'center');
  }
}

// --- Power Menu Functions ---
function togglePowerMenu() {
  if (powerMenu) {
    powerMenu.classList.toggle('hidden');
  }
  // Ensure other overlays are hidden
  if (startMenu) startMenu.classList.add('hidden');
  if (searchOverlay) searchOverlay.classList.add('hidden');
  if (settingsWindow) settingsWindow.classList.add('hidden');
  if (notificationArea) notificationArea.classList.add('hidden');
  if (volumeSliderContainer) volumeSliderContainer.classList.add('hidden');
}

function confirmRestartShutdown(action) {
  const confirmMessage = `Are you sure you want to ${action} the system?`;
  if (confirm(confirmMessage)) {
    if (action === 'restart') {
      window.location.reload(); // Reloads the page
    } else if (action === 'shut down') {
      alert("Shutting down... (This browser tab may not close automatically due to security restrictions)");
      // window.close() typically only works if the window was opened by script
      // For a simulation, just alerting is often sufficient.
      // window.close();
    }
  }
  togglePowerMenu(); // Hide menu after action
}

// --- Notification Area & Calendar Functions ---
function toggleNotificationArea() {
  if (notificationArea) {
    notificationArea.classList.toggle('hidden');
    if (!notificationArea.classList.contains('hidden')) {
      renderCalendar(currentCalendarDate);
    }
  }
  // Ensure other overlays are hidden
  if (startMenu) startMenu.classList.add('hidden');
  if (searchOverlay) searchOverlay.classList.add('hidden');
  if (settingsWindow) settingsWindow.classList.add('hidden');
  if (powerMenu) powerMenu.classList.add('hidden');
  if (volumeSliderContainer) volumeSliderContainer.classList.add('hidden');
}

function renderCalendar(date) {
  if (!currentMonthYearSpan || !calendarDaysGrid) return;

  currentMonthYearSpan.textContent = date.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });
  calendarDaysGrid.innerHTML = '';

  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday

  // Add empty days for the beginning of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.classList.add('calendar-day', 'inactive');
    calendarDaysGrid.appendChild(emptyDay);
  }

  // Add days of the month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('calendar-day');
    dayElement.textContent = day;

    if (date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      day === today.getDate()) {
      dayElement.classList.add('today');
    }
    calendarDaysGrid.appendChild(dayElement);
  }
}

// --- Volume Control Functions ---
function toggleVolumeSlider() {
  if (volumeSliderContainer) {
    volumeSliderContainer.classList.toggle('hidden');
    // Ensure other overlays are hidden
    if (startMenu) startMenu.classList.add('hidden');
    if (searchOverlay) searchOverlay.classList.add('hidden');
    if (settingsWindow) settingsWindow.classList.add('hidden');
    if (powerMenu) powerMenu.classList.add('hidden');
    if (notificationArea) notificationArea.classList.add('hidden');
  }
}

function updateVolume() {
  if (volumeSlider && volumeValueSpan) {
    const volume = volumeSlider.value;
    volumeValueSpan.textContent = volume;
    // In a real scenario, this would interact with an audio API
    // For now, it just updates the displayed value
  }
}

// --- Context Menu Functions ---
function showContextMenu(e, targetId = null, type = 'desktop') {
  e.preventDefault();
  if (!contextMenu) return; // Null check

  contextMenu.innerHTML = ''; // Clear previous items

  let items = [];
  let programId = null;

  if (type === 'desktop') {
    items = [
      { text: "Fullscreen", action: () => setFullscreen = (setFullscreen == 0 ? 1 : 0) },
      { text: "Enable context menu", action: () => contextShow = !contextShow, ticked: contextShow },
      { text: "Change wallpaper", action: () => toggleSettingsWindow() || showSettingsSection('personalization') },
      { text: "System Configuration", action: () => alert("System Configuration not yet implemented.") } // Placeholder
    ];
  } else if (type === 'taskbar-icon') {
    programId = targetId;
    // Add Pin/Unpin based on current status
    if (taskArr.includes(programId)) {
      items.push({ text: "Unpin from taskbar", action: () => unpinFromTaskbar(programId) });
    } else {
      items.push({ text: "Pin to taskbar", action: () => pinToTaskbar(programId) });
    }
    items.push(
      { text: "Open new window", action: () => createWindow(programId) },
      { text: "Close", action: () => {
          const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
          if (openWin) openWin.remove();
          updateTaskbar();
        }
      }
    );
  }
  // Add more context menu types as needed

  items.forEach(itemData => {
    const item = document.createElement('div');
    item.className = 'contextitem';
    if (itemData.ticked !== undefined) {
      item.classList.add('tickbox');
      item.setAttribute('ticked', itemData.ticked);
    }
    item.textContent = itemData.text;
    item.addEventListener('click', () => {
      itemData.action();
      contextMenu.style.display = 'none'; // Hide after click
    });
    contextMenu.appendChild(item);
  });

  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.display = 'block';

  // Hide context menu if click outside
  document.addEventListener('mousedown', function hideContext(event) {
    if (!contextMenu.contains(event.target)) {
      contextMenu.style.display = 'none';
      document.removeEventListener('mousedown', hideContext);
    }
  });
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI elements and listeners after DOM is fully loaded
  initUI();
  updateTaskbar(); // Initial taskbar setup
  renderWallpaperThumbnails(); // Render wallpapers in settings
  changeWallpaper(backId); // Apply saved wallpaper

  // Apply saved dark/light mode
  const savedViewMode = localStorage.getItem('viewmode');
  if (savedViewMode) {
    toggleLightDarkMode(savedViewMode);
  } else {
    toggleLightDarkMode('light'); // Default to light mode
  }

  // Apply saved taskbar transparency
  const savedTransparency = localStorage.getItem('taskbarTransparency');
  if (savedTransparency) {
    if (taskbarTransparencySlider) taskbarTransparencySlider.value = savedTransparency;
    updateTaskbarTransparency();
  }

  // Apply saved taskbar alignment
  const savedAlignment = localStorage.getItem('taskbarAlignment');
  if (savedAlignment) {
    setTaskbarAlignment(savedAlignment);
  } else {
    setTaskbarAlignment('center'); // Default to center
  }

  // Initialize oftenUsed as an object if it's not already
  try {
    const ouString = localStorage.getItem("oftenUsed");
    oftenUsed = ouString ? JSON.parse(ouString) : {};
  } catch (e) {
    console.error("Error parsing oftenUsed from localStorage:", e);
    oftenUsed = {}; // Fallback to empty object on error
  }
});


function initUI() {
  if (startButton) {
    startButton.addEventListener('click', toggleStartMenu);
  }
  if (closeStartMenuBtn) {
    closeStartMenuBtn.addEventListener('click', toggleStartMenu);
  }
  if (searchButton) {
    searchButton.addEventListener('click', toggleSearchOverlay);
  }
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }
  if (taskbarPowerButton) {
    taskbarPowerButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent document click from closing it immediately
      togglePowerMenu();
    });
  }
  if (restartBtn) {
    restartBtn.addEventListener('click', () => confirmRestartShutdown('restart'));
  }
  if (shutdownBtn) {
    shutdownBtn.addEventListener('click', () => confirmRestartShutdown('shut down'));
  }
  if (notificationAreaToggle) {
    notificationAreaToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotificationArea();
    });
  }
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar(currentCalendarDate);
    });
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar(currentCalendarDate);
    });
  }
  if (volumeIcon) {
    volumeIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVolumeSlider();
    });
  }
  if (volumeSlider) {
    volumeSlider.addEventListener('input', updateVolume);
  }
  if (taskbarTransparencySlider) {
    taskbarTransparencySlider.addEventListener('input', updateTaskbarTransparency);
  }
  if (lightModeBtn) {
    lightModeBtn.addEventListener('click', () => toggleLightDarkMode('light'));
  }
  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => toggleLightDarkMode('dark'));
  }
  if (alignLeftBtn) {
    alignLeftBtn.addEventListener('click', () => setTaskbarAlignment('left'));
  }
  if (alignCenterBtn) {
    alignCenterBtn.addEventListener('click', () => setTaskbarAlignment('center'));
  }

  // Settings Window Listeners
  if (startMenuSettingsButton) {
    startMenuSettingsButton.addEventListener('click', () => {
      toggleStartMenu(); // Close start menu
      toggleSettingsWindow();
    });
  }
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', toggleSettingsWindow);
  }
  settingsSidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section');
      showSettingsSection(sectionId);
    });
  });

  // Desktop Right-Click Context Menu
  if (desktop) {
    desktop.addEventListener('contextmenu', (e) => {
      showContextMenu(e, null, 'desktop');
    });
  }

  // Handle power button in start menu
  if (startMenuPowerButton) {
    startMenuPowerButton.addEventListener('click', (e) => {
      toggleStartMenu(); // Close start menu
      e.stopPropagation();
      togglePowerMenu();
    });
  }

  // Global click listener to hide menus if clicked outside
  document.body.addEventListener("mousedown", function(event) {
    // Hide all overlays/menus if click is outside
    if (startMenu && !startMenu.contains(event.target) && !startButton.contains(event.target)) {
      startMenu.classList.add('hidden');
      startMenu.classList.remove('show');
    }
    if (searchOverlay && !searchOverlay.contains(event.target) && !searchButton.contains(event.target)) {
      searchOverlay.classList.add('hidden');
    }
    if (settingsWindow && !settingsWindow.contains(event.target) && !startMenuSettingsButton.contains(event.target)) {
      settingsWindow.classList.add('hidden');
    }
    if (powerMenu && !powerMenu.contains(event.target) && !taskbarPowerButton.contains(event.target) && !startMenuPowerButton.contains(event.target)) {
      powerMenu.classList.add('hidden');
    }
    if (notificationArea && !notificationArea.contains(event.target) && !notificationAreaToggle.contains(event.target)) {
      notificationArea.classList.add('hidden');
    }
    if (volumeSliderContainer && !volumeSliderContainer.contains(event.target) && !volumeIcon.contains(event.target)) {
      volumeSliderContainer.classList.add('hidden');
    }
    if (contextMenu) contextMenu.style.display = 'none'; // Hide context menu
  });

  // Initialize current time display
  updateClock();
  setInterval(updateClock, 1000); // Update time every second
}

function updateClock() {
  const currentTimeElement = document.getElementById('current-time');
  if (currentTimeElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    currentTimeElement.textContent = `${hours}:${minutes}`;
  }
}

// Placeholder for getRandomPuzzleImage if you want to implement the puzzle logic
function getRandomPuzzleImage() {
  const puzzleImages = ["puzzle1.png", "puzzle2.png", "puzzle3.png"]; // Example image names
  return puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
}