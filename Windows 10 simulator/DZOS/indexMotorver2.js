/* TODO:
 * Wifi bar, battery perc icons (already mostly implemented, just ensure styling is good)
 * Add "reset time" option (already implemented)
 * Add power menu (implemented within start menu)
 * Fix index=-1 bug on icon select (needs testing)
 * Sort programs in programbar (implemented in start menu "All Apps")
 * Make anything work in IE (not a priority for modern web apps)
 */

//contents.json

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
  [8, 9, 10], // Desktop background context menu: Fullscreen, Enable context menu, Change wallpaper (now opens settings)
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
var colors = [
  // Existing 7 color schemes (indices 0-6)
  ["#600", "#d42", "#d77", "linear-gradient(135deg, #ff5e5e 0%,#bd1929 38%,#0e0000 100%)"],
  ["#060", "#3a2", "#7f5", "linear-gradient(135deg, #64e25e 0%,#098022 38%,#051700 100%)"],
  ["#005", "#53f", "#29f", "linear-gradient(135deg, #64a4c4 0%,#1c5d9e 38%,#1c0935 100%)"],
  ["#a40", "#d72", "#da4", "linear-gradient(135deg, #ffbb5e 0%,#b14b03 38%,#350f00 100%)"],
  ["#317", "#74a", "#85f", "linear-gradient(135deg, #ae41cc 0%,#53136d 38%,#000000 100%)"],
  ["#222", "#333", "#777", "linear-gradient(135deg, #696969 0%,#232323 50%,#000000 100%)"],
  ["#999", "#aaa", "#ddd", "linear-gradient(135deg, #e8e8e8 0%,#a0a0a0 50%,#1f1f1f 100%)"],
  // New light blue scheme (index 7)
  ["#1affff", "#00cccc", "#e0ffff", "linear-gradient(135deg, #1affff 0%, #009999 50%, #003333 100%)"]
];
var specCols = ["#68c464 0%,#1c5d9e 38%,#50005f 100%"]; // This seems unused now with CSS variables
var backgrounds = ["Abstract.jpg", "Bouncy.jpg", "Gimignano.jpg", "Flower.jpg", "Bucks.jpg", "Leaf.jpg", "LonelyRoad.jpg", "Flowers.jpg", "Mandelbrot.png", "Match.jpg"];
contextShow = false, next = null;

//load variables from localStorage
var taskArr = [0, 2], // Default pinned apps (Home, Mandelbrot)
  oftenUsed = []; // Stores usage count for programs
var tzIndex = localStorage.getItem("tzIndex") || 0,
  tzOffset = localStorage.getItem("tzOffset") || 0;
var tmpArr = localStorage.getItem("taskArr");
taskArr = tmpArr != null ? tmpArr.split(",").map(Number) : taskArr; // Ensure taskArr is numbers
var DEF_WIN_W = parseInt(localStorage.getItem("winW")) || 60;
var DEF_WIN_H = parseInt(localStorage.getItem("winH")) || 35;
var ou = localStorage.getItem("oftenUsed");
if (ou != null) {
  oftenUsed = ou.split(",").map(Number); // Ensure oftenUsed is numbers
}
var colId = parseInt(localStorage.getItem("colId")) || 7; // Set default colId to 7 for Light Blue
var backId = parseInt(localStorage.getItem("backId")) || 0; // Default background is gradient (index 0)
lockTaskbar = localStorage.getItem("lockTaskbar") != "0";
document.body.classList.add(localStorage.getItem("viewmode") || "grid");

var programData = [
  // FIX: 'keywords' moved inside the object
  {
    name: "Home",
    url: "index.html",
    icon: {
      url: "home"
    },
    keywords: "home,homepage,index,information"
  },
  {
    name: "Sudoku Solver",
    url: "sudokuSolver.html", // Changed to local path
    icon: {
      url: "sudokusolver"
    },
    keywords: "sudoku,solver,games,interactive"
  },
  {
    name: "Mandelbrot",
    url: "mandelbrot.html", // Changed to local path
    icon: {
      url: "mandelbrot"
    },
    keywords: "mandelbrot,julia,set,generator,fractal,interactive,math,canvas"
  },
  {
    name: "Pitchfork Emporium",
    url: "pitchforkEmporium.html", // Changed to local path
    icon: {
      url: "pitchforkemporium"
    },
    keywords: "pitchfork,emporium,store,webshop,reddit,api"
  },
  {
    name: "Boids",
    url: "https://aquaplexus.net/fishSim", // Kept as external, as it's not picturelements.github.io
    icon: {
      url: "boids"
    },
    keywords: "boids,craig,reynolds,interactive,fish,simulation"
  },
  {
    name: "HTML Editor",
    url: "editor.html", // Changed to local path
    icon: {
      url: "htmleditor"
    },
    keywords: "html,editor,css,interactive,gadget"
  },
  {
    name: "Bézier",
    url: "bezier.html", // Changed to local path
    icon: {
      url: "bezier"
    },
    keywords: "bezier,bézier,interactive,gadget"
  },
  {
    name: "Is it Prime?",
    url: "isitprime/index.html", // Changed to local path
    icon: {
      url: "isitprime"
    },
    keywords: "prime,generator,math,information"
  },
  {
    name: "N:th Prime",
    url: "nthPrime.html", // Changed to local path
    icon: {
      url: "nthprime"
    },
    keywords: "nth,prime,generator,math,information"
  },
  {
    name: "reddit Live 2.0",
    url: "redditLive.html", // Changed to local path
    icon: {
      url: "redditlive"
    },
    keywords: "reddit,live,api,information"
  },
  // {name: "Egg Hunt", url: "https://picturelements.github.io/egghunt", icon: {url:"egghunt"}, keywords: "egg,hunt,confused,travolta,game,reddit,easter"},
  {
    name: "Game of Life",
    url: "https://aquaplexus.net/gameoflife", // Kept as external
    icon: {
      url: "gameoflife"
    },
    keywords: "game,life,interactive,simulation,conway"
  },
  {
    name: "Hit Lawyer",
    url: "hitLawyer.html", // Changed to local path
    icon: {
      url: "hitlawyer"
    },
    keywords: "hit,lawyer,gadget"
  },
  {
    name: "Fractal",
    url: "https://aquaplexus.net/fractal", // Kept as external
    icon: {
      url: "fractal"
    },
    keywords: "fractal,generator,interactive,math"
  },
  {
    name: "Multiples",
    url: "multiples.html", // Changed to local path
    icon: {
      url: "multiples"
    },
    keywords: "multiples,math,interactive"
  },
  {
    name: "Fireworks",
    url: "https://aquaplexus.net/firework", // Kept as external
    icon: {
      url: "fireworks"
    },
    keywords: "fireworks,interactive,gadget,canvas"
  },
  {
    name: "Phone Snake",
    url: "phonesnake.html", // Changed to local path
    icon: {
      url: "phonesnake"
    },
    keywords: "phone,snake,game,interactive"
  },
  // {name: "Back Dropper", url: "https://picturelements.github.io/backdropper", icon: {url:"backdropper"}, keywords: "back,dropper,library,background,canvas"},
  {
    name: "Parrots",
    url: "parrots.html", // Changed to local path
    icon: {
      url: "parrots"
    },
    keywords: "parrots,dank,reddit,party,epilepsy"
  },
  // {name: "Smoke", url: "https://picturelements.github.io/smoke", icon: {url:"smoke"}, keywords: "smoke,3d,canvas,math"},
  {
    name: "404.html",
    url: "404.html", // Changed to local path
    icon: {
      url: "404"
    },
    keywords: "404,terminal,console,greentext"
  },
  {
    name: "Matrix",
    url: "matrix.html", // Changed to local path
    icon: {
      url: "matrix"
    },
    keywords: "matrix,math,multiplication"
  },
  {
    name: "Sweeper",
    url: "games/minesweeper/index.html", // Changed to local path
    icon: {
      url: "minesweeper"
    },
    keywords: "mine,sweeper,game,interactive"
  },
  {
    name: "Dodge",
    url: "games/dodge/index.html", // Changed to local path
    icon: {
      url: "dodge"
    },
    keywords: "game,reddit,cursor,slide"
  },
  {
    name: "Emojifuck",
    url: "emojifuck/index.html", // Changed to local path
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
    },
    keywords: ""
  },
  {
    name: "Settings",
    url: "",
    icon: {
      url: "cogbig"
    }, // Changed to cogbig.png
    keywords: ""
  },
  {
    name: "File Explorer",
    url: "",
    icon: {
      url: "explorer"
    },
    keywords: ""
  }
];
pl = programData.length; // Total number of programs
var viewerID = pl - 5,
  consoleID = pl - 4,
  errID = pl - 3,
  setID = pl - 2,
  explorerID = pl - 1,
  emojifuckID = pl - 7;
var defaultPage = "contents.json";

// NEW: Get references to new UI elements
const startButton = document.getElementById('start-button');
const startIcon = document.getElementById('start-icon'); // Get start icon element
const startMenu = document.getElementById('start-menu');
const searchButton = document.getElementById('search-button'); // Get search button
const searchIcon = document.getElementById('search-icon'); // Get search icon element
const searchInput = document.getElementById('search-input');
const searchOverlay = document.getElementById('search-overlay');
const searchResultsDiv = document.getElementById('search-results');
const settingsWindow = document.getElementById('settings-window');
const closeSettingsBtn = document.querySelector('#settings-window .close-settings-btn');
const settingsSidebarItems = document.querySelectorAll('.settings-sidebar-item');
const settingsSections = document.querySelectorAll('.settings-section');
const taskbar = document.getElementById('taskbar');
const alignLeftBtn = document.getElementById('align-left-btn');
const alignCenterBtn = document.getElementById('align-center-btn');
const powerButton = document.getElementById('power-button'); // New power button in start menu
const powerMenu = document.getElementById('power-menu'); // Power menu
const restartBtn = document.getElementById('restart-btn');
const shutdownBtn = document.getElementById('shutdown-btn');
const taskbarTransparencySlider = document.getElementById('taskbar-transparency-slider');
const taskbarTransparencyValue = document.getElementById('taskbar-transparency-value');
const lightModeBtn = document.getElementById('light-mode-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const desktopWrapper = document.getElementById('desktopwrapper'); // For wallpaper
const allAppsList = document.getElementById('all-apps-list'); // New element for all apps list

// Event Listeners for global interactions
document.body.addEventListener("mousedown", function(event) {
  winSelect = true;
  xStart = event.clientX;
  yStart = event.clientY;
  // Hide all overlays/menus if click is outside, unless clicking within an open overlay
  if (!startMenu.contains(event.target) && !searchOverlay.contains(event.target) && !settingsWindow.contains(event.target) && !powerMenu.contains(event.target)) {
    startMenu.classList.add('hidden');
    searchOverlay.classList.add('hidden');
    settingsWindow.classList.add('hidden');
    powerMenu.classList.add('hidden');
    // Reset start button icon when start menu closes
    if (startIcon) {
      startIcon.src = 'images/win_icons/home.png';
    }
  }
});
document.body.addEventListener("mousemove", function(event) {
  try {
    moveWindow(event);
  } catch (e) {
    // console.error("Error in moveWindow:", e); // For debugging
  }
});
document.body.addEventListener("mouseup", function(event) {
  try {
    release(event);
  } catch (e) {
    // console.error("Error in release:", e); // For debugging
  }
});

// NEW: Event listeners for Windows 11 UI elements
if (startButton) {
  startButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent body mousedown from immediately closing
    toggleStartMenu();
  });
}

if (searchButton) {
  searchButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent body mousedown from immediately closing
    toggleSearchOverlay();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', search); // Call search function on input
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleSearchOverlay(); // Close search on Escape
    }
  });
}

if (searchOverlay) {
  searchOverlay.addEventListener('click', (event) => {
    // Only close if clicking the overlay itself, not content within it
    if (event.target === searchOverlay) {
      toggleSearchOverlay();
    }
  });
}

if (closeSettingsBtn) {
  closeSettingsBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent body mousedown from closing it immediately
    openSettingsWin(); // Toggle to close
  });
}

settingsSidebarItems.forEach(item => {
  item.addEventListener('click', function() {
    settingsSidebarItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    const targetSectionId = this.getAttribute('data-section') + '-section';
    settingsSections.forEach(section => {
      if (section.id === targetSectionId) {
        section.classList.add('active');
        section.style.display = 'block'; // Ensure it's visible
      } else {
        section.classList.remove('active');
        section.style.display = 'none'; // Hide other sections
      }
    });
  });
});

if (alignLeftBtn) {
  alignLeftBtn.addEventListener('click', () => setTaskbarAlignment('left'));
}
if (alignCenterBtn) {
  alignCenterBtn.addEventListener('click', () => setTaskbarAlignment('center'));
}

if (powerButton) {
  powerButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent start menu from closing power menu
    powerMenu.classList.toggle('hidden'); // Toggle power menu visibility
  });
}

if (restartBtn) {
  restartBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    openPrompt("Restart System?", "Are you sure you want to restart the system?", "restart");
    powerMenu.classList.add('hidden'); // Hide power menu after click
  });
}

if (shutdownBtn) {
  shutdownBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    openPrompt("Shut Down System?", "Are you sure you want to shut down the system?", "powerOff");
    powerMenu.classList.add('hidden'); // Hide power menu after click
  });
}

if (taskbarTransparencySlider) {
  taskbarTransparencySlider.addEventListener('input', (event) => {
    const opacity = event.target.value / 100;
    document.documentElement.style.setProperty('--taskbar-opacity', opacity);
    taskbarTransparencyValue.textContent = `${event.target.value}%`;
    localStorage.setItem('taskbarTransparency', event.target.value); // Persist transparency
  });
}

if (lightModeBtn) {
  lightModeBtn.addEventListener('click', () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  });
}

if (darkModeBtn) {
  darkModeBtn.addEventListener('click', () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  });
}

// Apply saved theme on load
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
} else {
  document.body.classList.remove('dark-mode');
}

// Apply saved taskbar transparency on load
const savedTransparency = localStorage.getItem('taskbarTransparency');
if (savedTransparency !== null) {
  document.documentElement.style.setProperty('--taskbar-opacity', savedTransparency / 100);
  if (taskbarTransparencySlider) {
    taskbarTransparencySlider.value = savedTransparency;
  }
  if (taskbarTransparencyValue) {
    taskbarTransparencyValue.textContent = `${savedTransparency}%`;
  }
}


// Context Menu Event Listeners
document.getElementById("taskbar").addEventListener("mousedown", function(event) {
  showContext(event, 3);
});
document.getElementsByClassName("contextitem")[0].addEventListener("mousedown", function(event) {
  contextOpen(event, false);
});
document.getElementsByClassName("contextitem")[1].addEventListener("mousedown", function(event) {
  contextOpen(event, true);
});
document.getElementsByClassName("contextitem")[2].addEventListener("mousedown", function(event) {
  contextEdit();
});
document.getElementsByClassName("contextitem")[3].addEventListener("mousedown", function(event) {
  contextPin(0);
});
document.getElementsByClassName("contextitem")[4].addEventListener("mousedown", function(event) {
  contextPin(1);
});
document.getElementsByClassName("contextitem")[5].addEventListener("mousedown", function() {
  contextUnpin();
});
document.getElementsByClassName("contextitem")[6].addEventListener("mousedown", function(event) {
  contextAddWin(event);
});
document.getElementsByClassName("contextitem")[7].addEventListener("mousedown", function() {
  contextClose();
});
document.getElementsByClassName("contextitem")[8].addEventListener("mousedown", function() {
  toggleFullscreen();
});
document.getElementsByClassName("contextitem")[9].addEventListener("mousedown", function() {
  contextShow = !contextShow;
});
document.getElementsByClassName("contextitem")[10].addEventListener("mousedown", function() {
  openSettingsWin("personalization-section"); // Open settings to Personalization
});
document.getElementsByClassName("contextitem")[11].addEventListener("mousedown", function() {
  lockTaskbar = !lockTaskbar;
  localStorage.setItem("lockTaskbar", lockTaskbar ? 1 : 0);
  // Re-calculate window sizes if taskbar lock state changes
  for (let i = 0; i < windows.length; i++) {
    windows[i].sizeY[1] = window.innerHeight / window.innerWidth * 100 - (lockTaskbar ? (56 / window.innerWidth * 100) : 0); // 56px taskbar height
    // If window is currently maximized, re-apply its size
    if (windows[i].edit === 1) {
      const elem = document.getElementsByClassName("window")[i];
      elem.style.height = windows[i].sizeY[1] + "em";
    }
  }
});
document.getElementsByClassName("contextitem")[12].addEventListener("mousedown", function() {
  toggleTaskbah(); // Controls the "taskbah" sound effect
});
document.getElementsByClassName("contextitem")[13].addEventListener("mousedown", function() {
  contextOpenFile();
});
document.getElementsByClassName("contextitem")[14].addEventListener("mousedown", function() {
  contextNewDir(false);
});
document.getElementsByClassName("contextitem")[15].addEventListener("mousedown", function() {
  contextNewDir(true);
});
document.getElementsByClassName("contextitem")[16].addEventListener("mousedown", function() {
  contextOpenHTML();
});

document.getElementById("context").addEventListener("mousedown", function(event) {
  event.stopPropagation(); // Prevent body mousedown from immediately closing context menu
  document.getElementById("context").style.display = "none";
  preventHide = false;
});
document.getElementById("desktop").addEventListener("mousedown", function(event) {
  xStart = event.clientX;
  yStart = event.clientY;
  if (!clicked) {
    select = true;
  }
  var elem = document.getElementsByClassName("desktoplink");
  for (var i = 0; i < elem.length; i++) {
    elem[i].setAttribute("selected", false);
  }
  document.getElementById("context").style.display = "none";
  preventHide = false;
  // Hide all overlays/menus if click is on desktop
  startMenu.classList.add('hidden');
  searchOverlay.classList.add('hidden');
  settingsWindow.classList.add('hidden');
  powerMenu.classList.add('hidden');
  // Reset start button icon when start menu closes
  if (startIcon) {
    startIcon.src = 'images/win_icons/home.png';
  }
  showContext(event, 2); // Show desktop context menu
  event.stopPropagation();
});

document.getElementById("taskbar").addEventListener("mousemove", function(event) {
  event.stopPropagation(); // Prevent taskbar interaction from affecting window dragging
});

function setup() {
  var parent = document.getElementById("desktop");
  for (var i = 0; i < programData.length - hiddenApps; i++) {
    // Initialize oftenUsed array if not enough elements
    if (i >= oftenUsed.length) {
      oftenUsed.push(0);
    } else {
      oftenUsed[i] = parseInt(oftenUsed[i]);
    }
    origNames.push(programData[i].name);
    if (localStorage.getItem("customTitle" + i) != null) {
      programData[i].name = localStorage.getItem("customTitle" + i);
    }
    var el = document.createElement("div");
    el.className = "desktoplink";
    el.title = programData[i].name;
    el.setAttribute("selected", "false");
    el.setAttribute("onclick", "selectIcon(event," + i + ",false)");
    el.addEventListener("mousedown", function(event) {
      showContext(event, 0)
    });
    el.innerHTML = "<div class='icon'></div> <p class='ddesc'>" + programData[i].name + "</p>";
    setIcon(programData[i].icon, el.getElementsByClassName("icon")[0]);
    parent.appendChild(el);
  }

  // Add permanent taskbar icons to the center-aligned area
  // These are inserted at the beginning of the dynamic icons
  addTaskbarIcon(explorerID, "null", 0, programData[explorerID].name, programData[explorerID].icon, true);
  addTaskbarIcon(consoleID, "null", 0, programData[consoleID].name, programData[consoleID].icon, true);
  addTaskbarIcon(emojifuckID, "null", 0, programData[emojifuckID].name, programData[emojifuckID].icon, true);

  // Add user-pinned taskbar icons
  for (var i = 0; i < taskArr.length; i++) {
    // Ensure programData[taskArr[i]] exists before accessing its properties
    if (programData[taskArr[i]]) {
      addTaskbarIcon(taskArr[i], "null", 0, programData[taskArr[i]].name, programData[taskArr[i]].icon, true);
    } else {
      console.warn(`Program ID ${taskArr[i]} from taskArr is invalid and will be skipped.`);
    }
  }

  // Populate timezone options
  const timezoneSelect = document.getElementById("timezone");
  if (timezoneSelect) { // Check if element exists
    for (var i = -14; i < 15; i++) {
      var el = document.createElement("option");
      el.innerHTML = "UTC" + (i < 1 ? "" : "+") + "" + (i != 0 ? i : "");
      timezoneSelect.appendChild(el);
    }
    var tz = new Date().getTimezoneOffset() / -60;
    timezoneSelect.getElementsByTagName("option")[0].innerHTML = "Local (UTC" + (tz < 0 ? "" : "+") + "" + (tz != 0 ? tz : "") + ")";
  }
  setCols(); // Apply theme colors
  setWallpaper(); // Apply saved wallpaper

  setTimeout(function() {
    var elem = document.getElementById("loadscreen");
    // Ensure loadscreenbuffer content is correctly loaded
    if (document.getElementById("loadscreenbuffer")) {
      elem.innerHTML = document.getElementById("loadscreenbuffer").innerHTML;
    }
    if (elem) { // Check if elem exists before setting style
      elem.style.backgroundColor = "#268eee"; // This color is part of the old loading screen animation
    }
  }, 500);
  loadRepos();

  // Removed problematic lines related to old cog icon generation
  // document.getElementById("cog").setAttribute("d", genCog(19));
  // var ci = document.getElementsByClassName("cog_icon")[0];
  // ci.getElementsByTagName("path")[0].setAttribute("d", genCog(40));

  // Create clock face (for old clockbar, might be removed if not used)
  var clock = document.getElementById("clocksvg");
  var rOuter = 45,
    ri = 37,
    ri2 = 43;
  if (clock) { // Added a check to ensure clock element exists
    for (var i = 0; i < 60; i++) {
      var rad = i % 5 == 0 ? ri : ri2;
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      var sin = Math.sin(i / 30 * Math.PI),
        cos = Math.cos(i / 30 * Math.PI)
      line.setAttribute("x1", round(50 - sin * rOuter, 2));
      line.setAttribute("y1", round(50 - cos * rOuter, 2));
      line.setAttribute("x2", round(50 - sin * rad, 2));
      line.setAttribute("y2", round(50 - cos * rad, 2));
      line.setAttribute("stroke", "#888");
      clock.appendChild(line);
    }
  }

  // Set initial taskbar alignment (default to center)
  setTaskbarAlignment(localStorage.getItem('taskbarAlignment') || 'center');

  // Activate default settings section
  // This ensures the Personalization section is active when settings open
  const defaultSettingsItem = document.querySelector('.settings-sidebar-item[data-section="personalization"]');
  if (defaultSettingsItem) {
    defaultSettingsItem.click();
  }
}
setup();

function genCog(r) {
  var dimple = 0.8,
    pins = 8,
    part = 0.8,
    step = 1 / pins;
  var angle = -0.5 / pins * Math.PI;
  var out = "M" + (round(45 + Math.sin(angle) * r, 2)) + " " + (round(45 + Math.cos(angle) * r, 2));
  for (var i = 1; i < pins * 4; i++) {
    var newStep = i % 2 == 0 ? 1 - part : part;
    var rad = i % 4 < 2 ? r : dimple * r;
    angle += newStep * step * Math.PI;
    out += (" L" + (round(45 + Math.sin(angle) * rad, 2)) + " " + (round(45 + Math.cos(angle) * rad, 2)));
  }
  return out + "Z";
}

function setCols() {
  // Update CSS variables for colors based on selected scheme
  const root = document.documentElement;
  const selectedColors = colors[colId];

  // This function now primarily sets the CSS variables for the color scheme
  // The old inline style injection is less necessary with proper CSS variables
  // However, `specCols` is still used for the old `grad` class, so we'll keep that part.
  root.style.setProperty('--window-active-header-bg', selectedColors[1]);
  root.style.setProperty('--button-bg', selectedColors[1]);
  root.style.setProperty('--button-hover-bg', selectedColors[0]); // Using first color as a darker hover
  root.style.setProperty('--settings-sidebar-item-active-text', selectedColors[1]); // Accent color for active settings item

  const specColsElem = document.getElementById("specCols");
  if (specColsElem) { // Check if element exists
    specColsElem.innerHTML = `.specColor{background-color:${selectedColors[0]}; border-color:${selectedColors[0]};}\n.window[active='true'] .infoCol, .normCol{background-color:${selectedColors[1]};}\n.borderCol{border-color:${selectedColors[2]} !important;}\n.grad{background: ${selectedColors[3]};}`;
  }

  setWallpaper(); // Ensure wallpaper is re-applied to reflect theme changes if any
}

function setWallpaper() {
  // Update the wallpaper based on backId
  if (desktopWrapper) { // Check if element exists
    if (backId === 0) {
      desktopWrapper.style.backgroundImage = 'none'; // No background image for default
      desktopWrapper.classList.add('grad'); // Apply gradient if it's the default
    } else {
      desktopWrapper.style.backgroundImage = `url('images/wallpapers/${backgrounds[backId - 1]}')`;
      desktopWrapper.classList.remove('grad'); // Remove gradient if a specific image is selected
    }
  }
  // Also update the preview in settings
  const previewElement = document.getElementById('preview');
  if (previewElement) { // Check if element exists
    if (backId === 0) {
      previewElement.style.backgroundImage = 'none';
      previewElement.classList.add('grad');
    } else {
      previewElement.style.backgroundImage = `url('images/wallpapers/icons/${backgrounds[backId - 1].replace(".", "Ico.")}')`;
      previewElement.classList.remove('grad');
    }
  }
}


function addWindow(id, title, contStr, w, h, type) {
  // Ensure oftenUsed[id] is a number before incrementing
  oftenUsed[id] = (oftenUsed[id] ? parseInt(oftenUsed[id]) : 0) + 1;
  localStorage.setItem("oftenUsed", oftenUsed.join(',')); // Save as comma-separated string
  var tmpUrl = id == viewerID ? contStr : (id == 0 ? programData[id].url + "?" + (new Date().getTime()) : programData[id].url);
  var elem = document.createElement("div");
  elem.className = "window init"; // Add app-frame class here for rounded corners
  var data = {
    icon: type != null ? type + "-viewer" : programData[id].icon,
    name: title != null ? title : programData[id].name
  };

  //prevents multiple settings panels
  if (id == setID) {
    var wins = document.getElementsByClassName("window");
    for (var i = 0; i < wins.length; i++) {
      if (wins[i].getAttribute("type") == "settings") {
        windows[i].collapsed = false;
        moveToTop(i);
        return;
      }
    }
  }

  elem.setAttribute("type", id);
  var inner = "<div class='infobar infoCol' id='" + winCount + "'><div class='close' title='Close' onclick=closeWin(" + winCount + ")>✕</div><div class='max' title='Toggle' onclick=toggle(" + winCount + ")>◻</div><div class='min' title='Minimize' onclick=minWin(" + winCount + ")>_</div><div class='reload' title='Reload' onclick=reloadWin(" + winCount + ")>↻</div><div class='icon'></div><div class='wintitle'>" + data.name + "</div></div><div class='contentwrapper'><div class='content'><iframe class='frame'></iframe><div class='loadingoverlay'><div class='loader'></div><div class='loader2'></div><div class='loader3'></div></div></div><div class='resize' scale='lw'></div><div class='resize' scale='h'></div><div class='resize' scale='w'></div><div class='resize' scale='th'></div><div class='resize' scale='lwh'></div><div class='resize' scale='wh'></div><div class='resize' scale='thw'></div><div class='resize' scale='thlw'></div></div></div>";
  elem.innerHTML = inner;
  elem.setAttribute("active", true);
  elem.id = winCount;
  setIcon(programData[id].icon, elem.getElementsByClassName("icon")[0]);
  document.getElementById("desktop").appendChild(elem);
  if (id == 0) {
    document.getElementById("desktop").lastChild.addEventListener("mousedown", function(event) {
      event.stopPropagation();
    });
  }
  var resizers = elem.getElementsByClassName("resize");
  for (var i = 0; i < resizers.length; i++) {
    resizers[i].addEventListener("mousedown", function(event) {
      try {
        press(event, true);
      } catch (e) {
        // console.error("resize error:", e); // Changed alert to console.error
      }
    });
  }
  var elm = elem.getElementsByClassName("infobar")[0];
  elm.addEventListener("mousedown", function(event) {
    try {
      press(event, false);
    } catch (e) {
      // console.error("infobar error:", e); // Changed alert to console.error
    }
  });
  elem.style.width = w + "em";
  elem.style.height = h + "em";
  elem.style.left = ((100 - w) / 200) * window.innerWidth + "px";
  elem.style.top = Math.abs(window.innerHeight / 2 - (h / 200) * window.innerWidth) + "px";
  windows.push({
    xPos: [((100 - w) / 200) * window.innerWidth, 0],
    yPos: [Math.abs(window.innerHeight / 2 - (h / 200) * window.innerWidth), 0],
    z: winCount - 1, //I'm not entirely sure why this works...
    sizeX: [w, 100],
    sizeY: [h, (window.innerHeight / window.innerWidth) * 100 - (lockTaskbar ? (56 / window.innerWidth * 100) : 0)], // Adjusted for 56px taskbar
    edit: 0,
    collapsed: false
  });

  if (id == errID || id == setID || id == explorerID || id == consoleID) {
    elem.addEventListener("mousedown", function(event) {
      var win = getParent(event.target, "window");
      moveToTop(parseInt(win.id));
      document.getElementById("context").style.display = "none";
      event.stopPropagation();
    });
  }

  if (id >= viewerID) {
    elem.classList.add("system_window");
  }

  if (id == errID) {
    addContent(elem, "<div class='errimg'></div><div class='errmsg'>" + contStr + "</div>");
    setIcon(programData[errID].icon, elem.getElementsByClassName("errimg")[0]);
    elem.setAttribute("type", "error");
    elem.classList.add("icons_hidden");
  } else if (id == setID) {
    // The main settings window is a distinct element, not created here.
    // This branch is for the *old* settings window, which is now hidden by default.
    // We should not be adding a new window for settings if the new settings window is used.
    // However, if we need to fall back to an old window-based settings, this would be the place.
    // For now, ensure this doesn't create a duplicate settings window if openSettingsWin is called.
    // The `openSettingsWin()` function directly toggles the visibility of the pre-existing #settings-window element.
    // So, if addWindow is called with setID, it means a window-based settings is desired, which is not the current Win11 design.
    // Let's ensure it just opens the main settings window instead.
    openSettingsWin(); // Call the new function to open the main settings window
    return; // Prevent further window creation for settings
  } else if (id == explorerID) {
    addContent(elem, document.getElementById("explorerbuffer").innerHTML);
    elem.setAttribute("type", "explorer");
    elem.getElementsByClassName("path")[0].addEventListener("keydown", function(event) {
      if (event.keyCode == 13) {
        parseGeneralURL(event.target, event.target.value);
      }
    });
    elem.getElementsByClassName("filecontent")[0].addEventListener("mousedown", function(event) {
      showContext(event, 6);
    });
    windows[winCount].history = [];
    windows[winCount].histPointer = -2;
    var btns = elem.getElementsByClassName("histbtn");
    btns[0].setAttribute("onclick", "moveHist(" + winCount + ",-1)");
    btns[1].setAttribute("onclick", "moveHist(" + winCount + ",1)");
    parseGeneralURL(elem, contStr != null ? contStr : defaultPage);
    elem.getElementsByClassName("path")[0].addEventListener("focus", function(event) {
      event.target.select();
    });
  } else if (id == consoleID) {
    var content = elem.getElementsByClassName("content")[0];
    addContent(elem, document.getElementById("consolebuffer").innerHTML);
    content.style = "background-color:black; color:white";
    new Console(content);
  } else if (type != null) {
    elem.classList.add(data.icon);
    elem.setAttribute("type", viewerID);
    id = viewerID;
  }

  setTimeout(function() {
    elem.classList.remove("init");
  }, 200);
  addTaskbarIcon(id, winCount, 2, data.name, data.icon, false);
  moveToTop(winCount);
  if (id < consoleID) {
    delayIframe(elem, tmpUrl);
  }
  winCount++;
  return elem;
}

function delayIframe(elem, src) {
  setTimeout(function() {
    var iframe = elem.getElementsByClassName("frame")[0];
    if (iframe) { // Check if iframe exists
      iframe.src = src;
      iframe.onload = function() {
        const loadingOverlay = elem.getElementsByClassName("loadingoverlay")[0];
        if (loadingOverlay) { // Check if loadingOverlay exists
          loadingOverlay.style = "opacity: 0; background-color:transparent";
        }
      };
    }
  }, 500);
}

function addContent(elem, html) {
  var content = elem.getElementsByClassName("content")[0];
  if (content) { // Check if content element exists
    content.innerHTML = html;
  }
}

function addTaskbarIcon(id, count, actLvl, name, icon, stickied) {
  var iconsContainer = document.getElementById("taskbar-center-icons"); // New container for icons
  if (!iconsContainer) { // Ensure container exists
    console.error("Taskbar center icons container not found.");
    return;
  }
  var elems = iconsContainer.getElementsByClassName("taskbaricon");

  var tbi = document.createElement("div");
  tbi.className = "taskbaritem";
  var iconEl = document.createElement("div");
  iconEl.setAttribute("class", "taskbaricon borderCol " + (stickied ? "stickied" : ""));
  iconEl.setAttribute("id", count); // This will be the window ID if it's an open app
  iconEl.setAttribute("type", id); // This is the programData ID
  iconEl.setAttribute("activelevel", actLvl);
  iconEl.setAttribute("onclick", actLvl == 2 ? "minWin(" + count + ")" : "selectIcon(event," + id + ",true)");
  iconEl.innerHTML = "<div class='icon'></div>";
  iconEl.addEventListener("mousedown", function(event) {
    showContext(event, id < errID ? (id == viewerID || id == consoleID ? 4 : 1) : 4)
  });
  setIcon(icon, iconEl.getElementsByClassName("icon")[0]);
  tbi.setAttribute("data-title", name);
  tbi.appendChild(iconEl);

  // Logic to handle existing stickied icons and new ones
  let inserted = false;
  if (stickied) {
    // Check if this sticky icon already exists (e.g., if it's a permanent one added in setup)
    for (let i = 0; i < elems.length; i++) {
      if (elems[i].classList.contains("stickied") && elems[i].getAttribute("type") == id) {
        if (elems[i].id === "null" && count !== "null") { // Update if it's a permanent icon now opening a window
          elems[i].id = count;
          elems[i].setAttribute("activelevel", actLvl);
          elems[i].setAttribute("onclick", "minWin(" + count + ")");
        }
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      // If it's a new sticky icon, insert it in the correct position among other sticky icons
      let insertBeforeIndex = 0;
      for (let i = 0; i < iconsContainer.children.length; i++) {
        const child = iconsContainer.children[i];
        if (child.querySelector('.taskbaricon.stickied')) {
          insertBeforeIndex++;
        } else {
          break; // Found first non-stickied, insert before it
        }
      }
      iconsContainer.insertBefore(tbi, iconsContainer.children[insertBeforeIndex]);
      inserted = true;
    }
  }

  if (!inserted) {
    iconsContainer.appendChild(tbi); // Append dynamic apps to the end
  }
}

function isStickied(id) {
  for (var i = 0; i < taskArr.length; i++) {
    if (taskArr[i] == id) {
      return i;
    }
  }
  return -1;
}

function press(evt, rez) {
  var id = getParent(evt.target, "window").id;
  selWin = id;
  xStart = evt.clientX;
  yStart = evt.clientY;
  document.body.classList.add("scaling");
  moveToTop(id);
  resize = rez;
  if (resize) {
    attr = evt.target.getAttribute("scale");
  }
  select = false;
  clicked = true;
  document.getElementById("context").style.display = "none";
  // Hide all overlays/menus if click is outside, unless clicking within an open overlay
  // This logic is already handled by the body mousedown listener, no need to duplicate here
  evt.stopPropagation();
}

function release(event) {
  document.body.classList.remove("scaling");
  if (clicked && !preventEvents) {
    var win = windows[selWin];
    var edit = win.edit;
    if (resize) {
      win.sizeX[edit] = Math.max(win.sizeX[edit], 20);
      win.sizeY[edit] = Math.max(win.sizeY[edit], 15);
    } else {
      if (setFullscreen > 0) {
        edit = (setFullscreen == 1 ? 1 : 0);
        win.edit = edit;
        win.xPos[edit] = setFullscreen < 3 ? 0 : window.innerWidth / 2;
        win.yPos[edit] = 0;
        win.sizeX[edit] = (setFullscreen == 1 ? 100 : 50);
        // Ensure fullscreen height accounts for taskbar
        win.sizeY[edit] = (window.innerHeight / window.innerWidth * 100) - (lockTaskbar ? (56 / window.innerWidth * 100) : 0); // 56px taskbar height
        var elem = document.getElementsByClassName("window")[selWin];
        if (elem) { // Check if elem exists
          elem.style.left = (setFullscreen < 3 ? 0 : "50em");
          elem.style.top = 0;
          elem.style.width = (setFullscreen == 1 ? "100em" : "50em");
          elem.style.height = win.sizeY[edit] + "em";
          elem.style.transition = "100ms";
          setTimeout(function() {
            elem.style.transition = "none";
          }, 100);
        }
        const shadowElem = document.getElementById("shadow");
        if (shadowElem) { // Check if shadowElem exists
          shadowElem.style.opacity = 0;
        }
        setFullscreen = 0;
      } else {
        win.xPos[edit] += (event.clientX - xStart);
        win.yPos[edit] += (event.clientY - yStart);
      }
    }
    clicked = false;
  }
  select = false;
  const selectboxElem = document.getElementById("selectbox");
  if (selectboxElem) { // Check if selectboxElem exists
    selectboxElem.style = "display:none";
  }
}

function moveWindow(evt) {
  if (clicked && !preventEvents) {
    var elem = document.getElementsByClassName("window")[selWin];
    if (!elem) return; // Ensure element exists

    var sW = windows[selWin];
    if (resize) {
      var edit = sW.edit;
      var multL = attr.includes("l") ? -1 : 1;
      var multT = attr.includes("t") ? -1 : 1;
      if (attr.includes("w")) {
        sW.sizeX[edit] = (sW.sizeX[edit] + (evt.clientX - xStart) / window.innerWidth * 100 * multL);
        elem.style.width = sW.sizeX[edit] + "em";
      }
      if (attr.includes("h")) {
        sW.sizeY[edit] = (sW.sizeY[edit] + (evt.clientY - yStart) / window.innerWidth * 100 * multT);
        elem.style.height = sW.sizeY[edit] + "em";
      }
      if (multL == -1) {
        var offs = sW.sizeX[edit] > 20 ? 0 : (20 - sW.sizeX[edit]) / 100 * window.innerWidth;
        sW.xPos[edit] = event.clientX - offs;
        elem.style.left = sW.xPos[edit] + "px";
      }
      if (multT == -1) {
        var offs = sW.sizeY[edit] > 15 ? 0 : (15 - sW.sizeY[edit]) / 100 * window.innerWidth;
        sW.yPos[edit] = event.clientY - offs;
        elem.style.top = sW.yPos[edit] + "px";
      }
      xStart = evt.clientX;
      yStart = evt.clientY;
    } else {
      elem.style.left = (sW.xPos[sW.edit] + evt.clientX - xStart) + "px";
      elem.style.top = (sW.yPos[sW.edit] + evt.clientY - yStart) + "px";
      if (elem.getAttribute("type") != "error" && elem.getAttribute("type") != "settings") {
        // Snap to fullscreen/half-screen
        const taskbarHeightEm = (56 / window.innerWidth) * 100; // Convert 56px taskbar height to em
        const shadowElem = document.getElementById("shadow");
        if (shadowElem) { // Check if shadowElem exists
          if (evt.clientY <= window.innerWidth / 100) { // Top edge for fullscreen
            shadowElem.style = "opacity:1; width:100%; left:0; height: calc(100% - " + taskbarHeightEm + "em); bottom: " + taskbarHeightEm + "em;";
            setFullscreen = 1;
          } else if (evt.clientX <= window.innerWidth / 100) { // Left edge for left half
            shadowElem.style = "opacity:1; width:50%; left:0; height: calc(100% - " + taskbarHeightEm + "em); bottom: " + taskbarHeightEm + "em;";
            setFullscreen = 2;
          } else if (evt.clientX >= window.innerWidth / 100 * 99) { // Right edge for right half
            shadowElem.style = "opacity:1; width:50%; left:50%; height: calc(100% - " + taskbarHeightEm + "em); bottom: " + taskbarHeightEm + "em;";
            setFullscreen = 3;
          } else {
            shadowElem.style.opacity = "0";
            setFullscreen = 0;
          }
        }
      }
    }
  } else if (select && !preventEvents) {
    var w = Math.abs(evt.clientX - xStart),
      h = Math.abs(evt.clientY - yStart);
    var x = (evt.clientX - xStart > 0) ? xStart : evt.clientX,
      y = (evt.clientY - yStart > 0) ? yStart : evt.clientY;
    const selectboxElem = document.getElementById("selectbox");
    if (selectboxElem) { // Check if selectboxElem exists
      selectboxElem.style = "display:block; left:" + x + "px; top:" + y + "px; width:" + w + "px; height:" + h + "px";
    }

    var elem = document.getElementsByClassName("desktoplink");
    var iconData = [];
    var iW = window.innerWidth * 0.05,
      iH = window.innerWidth * 0.06;
    for (var i = 0; i < elem.length; i++) {
      elem[i].setAttribute("selected", false);
      var rect = elem[i].getBoundingClientRect();
      iconData.push({
        x: rect.left,
        y: rect.top
      });
    }
    for (var h2 = 0; h2 <= 30; h2++) {
      for (var w2 = 0; w2 <= 30; w2++) {
        var x2 = x + w / 30 * w2,
          y2 = y + h / 30 * h2;
        for (var i = 0; i < elem.length; i++) {
          if (x2 >= iconData[i].x && x2 <= iconData[i].x + iW && y2 >= iconData[i].y && y2 <= iconData[i].y + iH) {
            elem[i].setAttribute("selected", true);
          }
        }
      }
    }
  }

  // Taskbar is now fixed, so hide/show logic is removed.
}

function closeWin(id) {
  var actWin = document.getElementsByClassName("window")[id];
  if (!actWin) return; // Ensure element exists
  actWin.classList.add("closed");
  setTimeout(function() {
    closeWinHelper(id, actWin);
  }, 200);
}

function closeWinHelper(id, actWin) {
  const contentElement = actWin.getElementsByClassName("content")[0];
  if (contentElement) { // Check if contentElement exists
    contentElement.innerHTML = "<iframe id='frame'></iframe>";
  }
  actWin.setAttribute("type", null)
  setTimeout(function() {
    actWin.style.display = "none"
  }, 500);

  var icons = document.getElementsByClassName("taskbaricon");
  for (var i = 0; i < icons.length; i++) {
    if (icons[i].id == id) {
      if (icons[i].classList.contains("stickied")) {
        icons[i].id = "null";
        icons[i].setAttribute("activelevel", 0);
        icons[i].setAttribute("onclick", "selectIcon(event," + icons[i].getAttribute("type") + ",true)");
        for (var n = i + 1; n < icons.length; n++) {
          if (icons[n].getAttribute("type") == icons[i].getAttribute("type")) {
            icons[i].id = icons[n].id;
            icons[n].id = "null";
            icons[n].setAttribute("type", "null");
            icons[n].style.opacity = "0";
            icons[i].setAttribute("onclick", "minWin(" + icons[i].id + ")");
            setTimeout(function() {
              if (icons[n] && icons[n].parentElement && icons[n].parentElement.parentElement) { // Check for parent elements
                icons[n].parentElement.parentElement.removeChild(icons[n].parentElement);
              }
              findTopWin();
            }, 200);
            clicked = false;
            return;
          }
        }
      } else {
        icons[i].style.opacity = "0";
        setTimeout(function() {
          if (icons[i] && icons[i].parentElement && icons[i].parentElement.parentElement) { // Check for parent elements
            icons[i].parentElement.parentElement.removeChild(icons[i].parentElement);
          }
          findTopWin();
        }, 200);
        clicked = false;
        return;
      }
    }
  }
  findTopWin();
  clicked = false;
  select = false;
}

function reloadWin(id) {
  var srcEl = document.getElementsByTagName("iframe")[id];
  if (srcEl) { // Check if srcEl exists
    var src = srcEl.src;
    srcEl.src = src;
  }
  clicked = false;
  select = false;
}

function toggle(id) {
  windows[id].edit = Math.abs(windows[id].edit - 1);
  var elem = document.getElementsByClassName("window")[id];
  if (!elem) return; // Ensure element exists
  var edit = windows[id].edit;
  elem.style.width = windows[id].sizeX[edit] + "em";
  windows[id].sizeY[1] = window.innerHeight / window.innerWidth * 100 - (lockTaskbar ? (56 / window.innerWidth * 100) : 0); // Adjusted for 56px taskbar
  elem.style.height = windows[id].sizeY[edit] + "em";
  elem.style.left = windows[id].xPos[edit] + "px";
  elem.style.top = windows[id].yPos[edit] + "px";
  moveToTop(id);
  findTopWin();
  elem.style.transition = "100ms";
  setTimeout(function() {
    elem.style.transition = "none";
  }, 100);
}

function minWin(id) {
  var winElement = document.getElementsByClassName("window")[id];
  if (!winElement) return; // Ensure element exists

  if (winElement.getAttribute("active") == "true" || windows[id].collapsed) {
    windows[id].collapsed = !windows[id].collapsed;
  }
  moveToTop(id);
  findTopWin();
}

function findTopWin() {
  var max = -10,
    maxId = -1;
  var wins = document.getElementsByClassName("window");
  for (var i in windows) {
    if (wins[i] && !wins[i].classList.contains("closed") && windows[i].z > max) { // Check wins[i] exists
      max = windows[i].z;
      maxId = i;
    }
  }
  if (maxId > -1 && wins[maxId]) { // Check wins[maxId] exists
    wins[maxId].setAttribute("active", true);
  }
  var elems = document.getElementsByClassName("taskbaricon");
  for (var i = 0; i < elems.length; i++) {
    if (elems[i]) { // Check elems[i] exists
      if (elems[i].getAttribute("activelevel") == 2) {
        elems[i].setAttribute("activelevel", 1);
      }
      if (elems[i].id == maxId) {
        elems[i].setAttribute("activelevel", (windows[maxId] && windows[maxId].collapsed ? 1 : 2)); // Fix: Set activelevel based on collapsed state, check windows[maxId]
      }
    }
  }
}

function moveToTop(id) {
  var max = 0;
  var wins = document.getElementsByClassName("window");
  for (var i = 0; i < windows.length; i++) {
    if (windows[i] && windows[i].z > max) { // Check windows[i] exists
      max = windows[i].z;
    }
    if (wins[i]) { // Check wins[i] exists
      wins[i].setAttribute("active", false);
    }
  }
  if (wins[id]) { // Check wins[id] exists
    if (max != windows[id].z) {
      wins[id].style.zIndex = max + 1;
      windows[id].z = max + 1;
    }
    wins[id].setAttribute("active", true);

    var collapsed = windows[id].collapsed;
    var elem = wins[id];
    if (collapsed) {
      elem.classList.add("closed");
    } else {
      elem.classList.remove("closed");
    }
  }
  var taskbarIcons = document.getElementsByClassName("taskbaricon");
  for (var i = 0; i < taskbarIcons.length; i++) {
    if (taskbarIcons[i]) { // Check taskbarIcons[i] exists
      taskbarIcons[i].setAttribute("activelevel", taskbarIcons[i].getAttribute("activelevel") == 0 ? 0 : 1);
      if (taskbarIcons[i].id == id) {
        taskbarIcons[i].setAttribute("activelevel", (collapsed ? 1 : 2));
      }
    }
  }
}

function selectIcon(evt, id, singleClick) {
  if (!preventEvents) {
    var time = new Date().getTime();
    // Check if the target is the settings icon and it's a single click
    if (id === setID) { // For settings, always open the main settings window
      openSettingsWin();
      preventEvents = true; // Prevent further event propagation
      return; // Exit function after handling settings
    } else if (time - last < 500 || singleClick) {
      addWindow(id, null, null, DEF_WIN_W, DEF_WIN_H);
      prevX = -100;
    } else if (evt.target.getAttribute("class") == "ddesc" && time - last < 1000) {
      editName(id);
      preventEvents = true;
    }
    last = time;
  }
  const contextElem = document.getElementById("context");
  if (contextElem) { // Check if element exists
    contextElem.style.display = "none";
  }
  startMenu.classList.add('hidden'); // Hide start menu
  searchOverlay.classList.add('hidden'); // Hide search overlay
  settingsWindow.classList.add('hidden'); // Hide settings window
  // Reset start button icon when start menu closes
  if (startIcon) {
    startIcon.src = 'images/win_icons/home.png';
  }
}

function editName(id) {
  var p = document.getElementsByClassName("ddesc")[id];
  // Check if the element is already in edit mode
  if (p && p.querySelector('#nameedit')) { // Check p exists
    return;
  }
  var name = p ? p.innerHTML : ''; // Check p exists before accessing innerHTML
  if (!p) return; // Exit if p is null

  p.innerHTML = "<div contenteditable spellcheck='false' id='nameedit'>" + name + "</div>";
  var ne = document.getElementById("nameedit");
  if (ne) { // Check ne exists
    selectElementContents(ne);
    ne.addEventListener("keydown", function(event) {
      setName(event, id)
    });
    ne.addEventListener("blur", function(event) { // Add blur event listener
      setName(event, id, true); // Pass true to indicate blur event
    });
  }
}

//http://stackoverflow.com/a/6150060
function selectElementContents(el) {
  var range = document.createRange();
  if (el) { // Check el exists
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function setName(evt, id, isBlur = false) { // Added isBlur parameter
  var elem = document.getElementById("nameedit");
  if (!elem) return; // Exit if elem is null

  if (evt.keyCode == 13 || isBlur) { // Trigger on Enter or blur
    if (evt.keyCode == 13) {
      evt.preventDefault(); // Prevent new line on Enter
    }

    var oldName = programData[id].name;
    var name = elem.textContent.trim(); // Use textContent and trim whitespace

    if (name === oldName) { // If name hasn't changed, just exit edit mode
      elem.parentElement.innerHTML = oldName;
      preventEvents = false;
      return;
    }

    for (var i = 0; i < programData.length; i++) {
      var boolName = (programData[i].name.toLowerCase() === name.toLowerCase() && name.toLowerCase() !== oldName.toLowerCase());
      var boolBlank = (name === "");
      if (boolName || boolBlank) {
        if (boolName) {
          openPopup("Filename Error", "Error: Filename '" + name + "' is already in use. Try another name.");
        }
        if (boolBlank) {
          openPopup("Filename Error", "Error: Filename cannot be blank. Try another name.");
        }
        elem.parentElement.innerHTML = oldName;
        preventEvents = false;
        return;
      }
    }
    if (elem.parentElement && elem.parentElement.parentElement) { // Check parent elements
      elem.parentElement.parentElement.title = name;
      elem.parentElement.innerHTML = name;
    }
    preventEvents = false;
    programData[id].name = name;
    var titles = document.getElementsByClassName("wintitle");
    var items = document.getElementsByClassName("taskbaritem");
    for (var i = 0; i < titles.length; i++) {
      // Update window titles only if they correspond to the program being renamed
      if (titles[i] && titles[i].textContent.includes(oldName)) { // Check if the old name is part of the title
        titles[i].innerHTML = titles[i].innerHTML.replace(oldName, name);
      }
    }
    for (var i = 0; i < items.length; i++) {
      if (items[i] && items[i].getAttribute("data-title") == oldName) {
        items[i].setAttribute("data-title", name);
      }
    }
    localStorage.setItem("customTitle" + id, name);
  }
}

function openPopup(errtitle, errStr, icon) {
  icon = icon || "err";
  programData[errID].icon.svg = icon + "_icon";
  addWindow(errID, errtitle, errStr, 25, 9);
}

// NEW: Toggle Start Menu visibility
function toggleStartMenu() {
  startMenu.classList.toggle('hidden');
  searchOverlay.classList.add('hidden'); // Close search if open
  settingsWindow.classList.add('hidden'); // Close settings if open
  powerMenu.classList.add('hidden'); // Close power menu if open

  if (!startMenu.classList.contains('hidden')) {
    fillStartMenu(); // Populate start menu when opening
    if (startIcon) { // Change start button icon when open
      startIcon.src = 'images/win_icons/started.png';
    }
  } else {
    if (startIcon) { // Reset start button icon when closed
      startIcon.src = 'images/win_icons/home.png';
    }
  }
}

// NEW: Toggle Search Overlay visibility
function toggleSearchOverlay() {
  searchOverlay.classList.toggle('hidden');
  startMenu.classList.add('hidden'); // Close start menu if open
  settingsWindow.classList.add('hidden'); // Close settings if open
  powerMenu.classList.add('hidden'); // Close power menu if open

  if (!searchOverlay.classList.contains('hidden')) {
    searchInput.focus(); // Focus on search input
    searchInput.value = ''; // Clear previous search
    searchResultsDiv.innerHTML = '<p style="color:#999; text-align:center;"><br><br>Start typing to browse programs, documents, or settings.</p>';
  }
  // Reset start button icon if search is opened and start menu was open
  if (startMenu.classList.contains('hidden') && startIcon) {
    startIcon.src = 'images/win_icons/home.png';
  }
}

// NEW: Toggle Settings Window visibility
function openSettingsWin(sectionId = 'personalization-section') {
  settingsWindow.classList.toggle('hidden');
  startMenu.classList.add('hidden'); // Close start menu if open
  searchOverlay.classList.add('hidden'); // Close search if open
  powerMenu.classList.add('hidden'); // Close power menu if open

  // Reset start button icon if settings is opened and start menu was open
  if (startMenu.classList.contains('hidden') && startIcon) {
    startIcon.src = 'images/win_icons/home.png';
  }

  if (!settingsWindow.classList.contains('hidden')) {
    // Activate the specified section in settings
    settingsSidebarItems.forEach(item => {
      if (item.getAttribute('data-section') + '-section' === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    settingsSections.forEach(section => {
      if (section.id === sectionId) {
        section.classList.add('active');
        section.style.display = 'block';
      } else {
        section.classList.remove('active');
        section.style.display = 'none';
      }
    });
    // Update settings content (time, sizes, colors)
    var dt = new Date();
    var date = new Date(dt.setTime(dt.getTime() + tzOffset * 60000));
    var month = date.getMonth() + 1,
      day = date.getDate();
    const datesetElem = document.getElementById("dateset");
    if (datesetElem) { // Check if element exists
      datesetElem.value = date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    }
    const timezoneElem = document.getElementById("timezone");
    if (timezoneElem) { // Check if element exists
      timezoneElem.selectedIndex = tzIndex;
    }
    const precElem = document.getElementById("prectz");
    if (precElem) { // Check if element exists
      if (tzIndex == 1 && precElem.getAttribute("disabled") != null) {
        precElem.removeAttribute("disabled");
        precElem.value = tzOffset;
      }
    }
    newTime();
    const sizeslider0 = document.getElementsByClassName("sizeslider")[0];
    const sizeslider1 = document.getElementsByClassName("sizeslider")[1];
    if (sizeslider0) {
      sizeslider0.value = DEF_WIN_W;
      updateSize(0); // Update display for width
    }
    if (sizeslider1) {
      sizeslider1.value = DEF_WIN_H;
      updateSize(1); // Update display for height
    }
    colorSelect();
  }
}


// Removed old showSearchFull, showSearch, showHome as they are replaced by new toggle functions
// function showSearchFull(evt) { ... }
// function showSearch(evt) { ... }
// function showHome(evt) { ... }

function fillStartMenu() {
  const pinnedAppsGrid = document.querySelector('#start-menu .pinned-apps .app-grid');
  const recommendedFilesList = document.querySelector('#start-menu .recommended-files .file-list');
  const puzzleGrid = document.querySelector('#start-menu .puzzles-section .puzzle-grid'); // Get puzzle grid

  if (!pinnedAppsGrid || !recommendedFilesList || !puzzleGrid || !allAppsList) {
    console.error("One or more start menu elements not found. Cannot populate start menu.");
    return;
  }

  pinnedAppsGrid.innerHTML = ''; // Clear existing pinned apps
  recommendedFilesList.innerHTML = ''; // Clear existing recommended files
  puzzleGrid.innerHTML = ''; // Clear existing puzzles
  allAppsList.innerHTML = ''; // Clear existing all apps

  // Populate Pinned Apps (example: first few programs from programData)
  const pinnedAppIds = [explorerID, consoleID, setID, emojifuckID, 1, 2, 3, 4]; // Example pinned app IDs
  pinnedAppIds.forEach(id => {
    if (programData[id]) { // Ensure programData[id] exists
      const appItem = document.createElement('div');
      appItem.className = 'app-grid-item';
      // Use programData[id].icon.url for image source
      const iconUrl = programData[id].icon.url ? `images/win_icons/${programData[id].icon.url}.png` : '';
      appItem.setAttribute('onclick', `selectIcon(event, ${id}, true); toggleStartMenu();`); // Open app and close start menu
      appItem.innerHTML = `
                <div class="icon" style="background-image: url('${iconUrl}');"></div>
                <span>${programData[id].name}</span>
            `;
      pinnedAppsGrid.appendChild(appItem);
    }
  });

  // Populate Recommended Files (example: dummy data or recent files if available)
  const recommendedFiles = [{
    name: "MyDocument.docx",
    icon: "fas fa-file-word"
  }, {
    name: "ProjectPlan.xlsx",
    icon: "fas fa-file-excel"
  }, {
    name: "HolidayPhotos.jpg",
    icon: "fas fa-image"
  }, ]; // Replace with actual logic to get recent files
  recommendedFiles.forEach(file => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-list-item';
    fileItem.innerHTML = `
                <i class="${file.icon}"></i>
                <span>${file.name}</span>
            `;
    recommendedFilesList.appendChild(fileItem);
  });

  // Populate Puzzles (randomly select a few games)
  const gameAppIds = [1, 10, 15, 16, 20, 21, 22]; // IDs of games in programData
  const shuffledGameAppIds = gameAppIds.sort(() => 0.5 - Math.random()).slice(0, 6); // Get 6 random games
  shuffledGameAppIds.forEach(id => {
    if (programData[id]) { // Ensure programData[id] exists
      const puzzleItem = document.createElement('div');
      puzzleItem.className = 'puzzle-grid-item';
      const iconUrl = programData[id].icon.url ? `images/win_icons/${programData[id].icon.url}.png` : '';
      puzzleItem.setAttribute('onclick', `selectIcon(event, ${id}, true); toggleStartMenu();`);
      puzzleItem.innerHTML = `
                <div class="icon" style="background-image: url('${iconUrl}');"></div>
                <span>${programData[id].name}</span>
            `;
      puzzleGrid.appendChild(puzzleItem);
    }
  });

  // Populate All Apps list (sorted alphabetically)
  const allApps = programData.slice(0, programData.length - hiddenApps).sort((a, b) => a.name.localeCompare(b.name));
  allApps.forEach((app, index) => {
    // Find the original ID from programData
    const originalId = programData.findIndex(p => p.name === app.name && p.url === app.url);
    if (originalId !== -1) {
      const appItem = document.createElement('div');
      appItem.className = 'all-app-item';
      const iconUrl = app.icon.url ? `images/win_icons/${app.icon.url}.png` : '';
      appItem.setAttribute('onclick', `selectIcon(event, ${originalId}, true); toggleStartMenu();`);
      appItem.innerHTML = `
                <div class="icon" style="background-image: url('${iconUrl}');"></div>
                <span>${app.name}</span>
            `;
      allAppsList.appendChild(appItem);
    }
  });
}


function sbbToggle(elem) {
  if (elem && elem.parentElement) { // Check elem and parentElement exist
    elem = elem.parentElement;
    elem.setAttribute("expanded", elem.getAttribute("expanded") == "false");
  }
}

function sbbHome() {
  // This function was for the old searchbar home button, now handled by start menu
  toggleStartMenu(); // Open start menu instead
}

function togglePower() {
  // This function is for the old powerbar, now integrated into start menu
  // Power options are now part of the start menu header
  openPopup("Power Options", "Restart or Power off?", "info");
  const popupButtons = document.querySelectorAll('.promptbtn');
  if (popupButtons.length >= 2) {
    popupButtons[0].textContent = "Restart";
    popupButtons[0].onclick = restart;
    popupButtons[1].textContent = "Power Off";
    popupButtons[1].onclick = powerOff;
  }
}

function restart() {
  var elem = document.getElementById("loadscreen");
  if (elem) { // Check elem exists
    const loadscreenbuffer = document.getElementById("loadscreenbuffer");
    if (loadscreenbuffer) { // Check loadscreenbuffer exists
      elem.innerHTML = loadscreenbuffer.innerHTML;
    }
    const loadmsg = elem.getElementsByClassName("loadmsg")[0];
    if (loadmsg) { // Check loadmsg exists
      loadmsg.innerHTML = "Shutting down";
    }
    elem.style = "display:flex; opacity:0; animation:fadescreen 3500ms forwards 1; animation-delay:250ms;";
    setTimeout(function() {
      elem.innerHTML = ""; // Clear content after animation starts
    }, 500);
    setTimeout(function() {
      elem.style.backgroundColor = "black";
      elem.innerHTML = ""
    }, 3750);
    setTimeout(function() {
      location.reload();
    }, 4000);
  }
}

function powerOff(evt) {
  preventHide = false;
  openPopup("Nope.", "You fool! You can't exit DzOS. DzOS is love. DzOS is life.");
  if (evt) evt.stopPropagation(); // Check if evt exists before stopping propagation
}

function search() {
  var input = new RegExp("" + searchInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "", "gi"); // Escape special characters
  var results = [];
  // Search through all programData, not just a subset
  for (var i = 0; i < programData.length; i++) {
    const program = programData[i];
    // Ensure program and its properties exist
    if (!program || !program.name || !program.keywords) {
      continue;
    }

    // Check if name or keywords match
    const nameMatch = program.name.match(input);
    const keywordsMatch = program.keywords.match(input);

    if (nameMatch || keywordsMatch) {
      let keyws = program.keywords.replace(/,/g, ", ");
      // Highlight matches in keywords
      if (keywordsMatch) {
        keyws = keyws.replace(input, (match) => `<span class='highlight'>${match}</span>`);
      }
      results.push({
        name: program.name,
        keywords: keyws,
        url: program.url,
        icon: program.icon,
        id: i // Store the program ID
      });
    }
  }
  // Sort results alphabetically by name
  results.sort((a, b) => a.name.localeCompare(b.name));

  if (searchResultsDiv) { // Check if searchResultsDiv exists
    searchResultsDiv.innerHTML = ""; // Clear previous results in the new div

    for (var i = 0; i < results.length; i++) {
      var tmpUrl = results[i].url;
      // Pass the program ID to addResult
      addResult(searchResultsDiv, tmpUrl, results[i].icon, results[i].name, results[i].keywords, results[i].id);
    }

    if (results.length == 0) {
      searchResultsDiv.innerHTML = "<p style='color:#999; text-align:center;'><br><br>No results.</p>"
    }
  }
}

function addResult(addTo, url, icon, name, keywords, programId) { // Added programId parameter
  url = url.replace("http:", "https:");
  var result = document.createElement("p"); // Changed to p for simpler display in search results
  result.className = "result";
  // If URL is empty (e.g., for system apps like Settings), use a custom click handler
  if (url === "") {
    result.setAttribute("onclick", `selectIcon(event, ${programId}, true); toggleSearchOverlay();`);
  } else {
    result.setAttribute("onclick", "window.open('" + url + "'); toggleSearchOverlay();"); // Open in new tab and close search
  }

  result.innerHTML = name + "<br><span class='kw'>" + keywords + "</span>"; // Using span for keywords

  addTo.appendChild(result);
  // setIcon(icon, result.getElementsByClassName("resultimg")[0]); // Not using image for simple search results
}

//So many edge cases...
//I'm sorry for this.
function showContext(evt, type) {
  if (evt.which != 1) {
    var items = document.getElementsByClassName("contextitem");
    var context = document.getElementById("context");
    if (!context) return; // Ensure context exists

    for (var i = 0; i < items.length; i++) {
      if (items[i]) { // Check item exists
        items[i].style.display = "none";
      }
    }
    for (var i = 0; i < contextAssort[type].length; i++) {
      if (items[contextAssort[type][i]]) { // Check item exists
        items[contextAssort[type][i]].style.display = "block";
      }
    }

    if (type == 0) {
      var tot = 0;
      var id = -1,
        elem = document.getElementsByClassName("desktoplink");
      var targ = getParent(evt.target, "desktoplink");
      for (var i = 0; i < elem.length; i++) {
        if (elem[i] == targ && id == -1) {
          id = i;
        }
        if (elem[i] && elem[i].getAttribute("selected") == "true") { // Check elem[i] exists
          tot++;
        }
      }
      if (document.getElementsByClassName("contextitem")[1]) { // Check element exists
        document.getElementsByClassName("contextitem")[1].style.display = tot > 1 && id != -1 ? "block" : "none";
        document.getElementsByClassName("contextitem")[1].innerHTML = "Open All (" + tot + ")";
      }
      context.setAttribute("target", id);
      for (var i = 0; i < elem.length; i++) {
        if (elem[i] == evt.target) {
          context.setAttribute("targetIndex", i);
        }
      }
    } else if (type == 1 || type == 4 || type == 5) {
      var icons = document.getElementsByClassName("taskbaricon");
      for (var i = 0; i < icons.length; i++) {
        if (evt.target == icons[i]) {
          var stickied = icons[i].classList.contains("stickied");
          if (items[4]) items[stickied ? 4 : 5].style.display = "none"; // Check items[4] exists
          if (items[6]) items[6].innerHTML = "Open " + (stickied && icons[i].getAttribute("activelevel") == 0 ? "" : "new"); // Check items[6] exists
          //remove "open new" for error messages and settings
          var tgt = icons[i].getAttribute("type"); // Use icons[i] for type
          if (type == 4 && (parseInt(tgt) == errID || parseInt(tgt) == setID)) { // Parse tgt to int
            if (items[6]) items[6].style.display = "none"; // Check items[6] exists
          }
          if (items[7]) items[7].style.display = icons[i].id == "null" ? "none" : "block"; // Check items[7] exists
        }
      }
      context.setAttribute("target", evt.target.getAttribute("type"));
      for (var i = 0; i < icons.length; i++) {
        if (icons[i] == evt.target) {
          context.setAttribute("targetIndex", i);
        }
      }
    } else if (type == 2) {
      if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
        if (items[8]) items[8].innerHTML = "Go fullscreen"; // Check items[8] exists
      } else {
        if (items[8]) items[8].innerHTML = "Exit fullscreen"; // Check items[8] exists
      }
      if (items[9]) items[9].innerHTML = (contextShow ? "Disable" : "Enable") + " context menu"; // Check items[9] exists
    } else if (type == 3) {
      if (items[11]) items[11].setAttribute("ticked", lockTaskbar); // Check items[11] exists
      if (items[12]) items[12].setAttribute("ticked", lockTaskbah); // Check items[12] exists
    } else if (type == 6) {
      var file = getParent(evt.target, "file");
      if (file == null || file.classList.contains("tableheader")) {
        return;
      }
      context.setAttribute("target", getParent(evt.target, "window").id);
      var files = file.parentElement.getElementsByClassName("file");
      for (var i = 0; i < files.length; i++) {
        if (file == files[i]) {
          context.setAttribute("targetIndex", i);
          break;
        }
      }
      if (getParent(evt.target, "file") && !getParent(evt.target, "file").classList.contains("html")) { // Check getParent return
        if (items[16]) items[16].style.display = "none"; // Check items[16] exists
      }
      evt.stopPropagation();
    }

    //Edit context menu styling (width,height,position)
    context.style.display = "block";
    context.style.left = ((evt.clientX + context.offsetWidth < window.innerWidth - window.innerWidth * 0.03) ? (evt.clientX + 2) : (evt.clientX - context.offsetWidth - 2)) + "px";
    context.style.top = ((evt.clientY + context.offsetHeight < window.innerHeight - window.innerWidth * 0.03) ? (evt.clientY + 2) : (evt.clientY - context.offsetHeight - 2)) + "px";
    evt.stopPropagation();
    //preventHide=true;
  }
}

function contextOpen(evt, mult) {
  //mult = multiple windows
  var elem = document.getElementById("context");
  if (!elem) return; // Ensure elem exists

  if (!mult) {
    addWindow(elem.getAttribute("target"), null, null, DEF_WIN_W, DEF_WIN_H);
    elem.style.display = "none";
  } else {
    var count = 0,
      ids = [];
    var desktopLinks = document.getElementsByClassName("desktoplink");
    for (var i = 1; i < desktopLinks.length; i++) {
      if (desktopLinks[i] && desktopLinks[i].getAttribute("selected") == "true") { // Check desktopLinks[i] exists
        ids.push(i);
        setTimeout(function() {
          if (ids.length > 0) { // Ensure ids array is not empty
            addWindow(ids[0], null, null, DEF_WIN_W, DEF_WIN_H);
            ids.splice(0, 1);
          }
        }, 750 * count);
        count++;
      }
    }
    elem.style.display = "none";
  }
  evt.stopPropagation();
}

function contextClose() {
  const contextElem = document.getElementById("context");
  if (!contextElem) return; // Ensure contextElem exists
  contextElem.style.display = "none";
  var toClose = document.getElementsByClassName("taskbaricon")[contextElem.getAttribute("targetIndex")];
  if (toClose) { // Check toClose exists
    closeWin(toClose.id);
  }
}

function contextEdit(evt) {
  var elem = document.getElementById("context");
  if (!elem) return; // Ensure elem exists
  editName(elem.getAttribute("target"));
  preventEvents = true;
  elem.style.display = "none";
}

function contextPin(type) {
  const contextElem = document.getElementById("context");
  if (!contextElem) return; // Ensure contextElem exists
  contextElem.style.display = "none";
  var id = parseInt(contextElem.getAttribute("target")); // Ensure ID is a number
  var index = parseInt(contextElem.getAttribute("targetIndex")); // Ensure index is a number
  for (var i = 0; i < taskArr.length; i++) {
    if (id == taskArr[i]) {
      return; // Already pinned
    }
  }
  if (type == 0) { // Pin from desktop icon
    addTaskbarIcon(id, "null", 0, programData[id].name, programData[id].icon, true);
  } else if (index > -1) { // Pin from taskbar (if it's a running app, make it sticky)
    var icon = document.getElementsByClassName("taskbaricon")[index];
    if (icon) { // Check icon exists
      // Check if it's already a sticky icon or a temporary one
      if (icon.id !== "null") { // It's an open window's icon
        icon.classList.add("stickied");
      } else { // It's a temporary icon that needs to become sticky
        icon.style.opacity = "0";
        if (icon.parentElement && icon.parentElement.parentElement) { // Check parent elements
          icon.parentElement.parentElement.removeChild(icon.parentElement);
        }
        // Re-add it as a sticky icon in the correct position
        addTaskbarIcon(id, "null", 0, programData[id].name, programData[id].icon, true);
      }
    }
  }
  taskArr.push(id);
  localStorage.setItem("taskArr", taskArr.join(',')); // Save as comma-separated string
}

function contextUnpin() {
  const contextElem = document.getElementById("context");
  if (!contextElem) return; // Ensure contextElem exists
  contextElem.style.display = "none";
  var icons = document.getElementsByClassName("taskbaricon");
  var target = parseInt(contextElem.getAttribute("target")); // Ensure target is a number
  for (var i = 0; i < icons.length; i++) {
    if (icons[i] && icons[i].getAttribute("type") == target && icons[i].classList.contains("stickied")) { // Check icons[i] exists
      var id = icons[i].id;
      if (id == "null") { // It's a sticky icon that's not currently an open window
        icons[i].style.opacity = "0";
        setTimeout(function() {
          if (icons[i] && icons[i].parentElement && icons[i].parentElement.parentElement) { // Check parent elements
            icons[i].parentElement.parentElement.removeChild(icons[i].parentElement);
          }
        }, 200);
      } else { // It's a sticky icon that is also an open window
        icons[i].classList.remove("stickied");
      }
      // Remove from taskArr
      const indexInTaskArr = taskArr.indexOf(target);
      if (indexInTaskArr > -1) {
        taskArr.splice(indexInTaskArr, 1);
      }
      break;
    }
  }
  localStorage.setItem("taskArr", taskArr.join(',')); // Save as comma-separated string
}

function contextAddWin(evt) {
  const contextElem = document.getElementById("context");
  if (!contextElem) return; // Ensure contextElem exists
  contextElem.style.display = "none";
  var target = parseInt(contextElem.getAttribute("target")); // Ensure target is a number
  selectIcon(evt, target, true);
}

function toggleTaskbah() {
  lockTaskbah = !lockTaskbah;
  var elem = document.getElementById("taskbahSound");
  if (elem) { // Check elem exists
    if (lockTaskbah) {
      elem.currentTime = 0;
      elem.play();
    } else {
      elem.pause();
    }
  }
}

// Replaced old openSettings with openSettingsWin
// function openSettings(scrTo) { ... }


function colorSelect() {
  var inner = "";
  for (var i = 0; i < colors.length; i++) {
    inner += "<div class='coloroption' " + (i == colId ? "selected" : "") + " onclick=selCol(" + i + ")><div class='col' style='background-color:" + colors[i][0] + "'></div><div class='col' style='background-color:" + colors[i][1] + "'></div><div class='col' style='background-color:" + colors[i][2] + "'></div></div>";
  }
  const colorbarElem = document.getElementById("colorbar");
  if (colorbarElem) { // Check if element exists
    colorbarElem.innerHTML = inner;
  }

  inner = "<div class='backoption grad' " + (backId == 0 ? "selected" : "") + " onclick=selIco(0)></div>";
  for (var i = 1; i < backgrounds.length + 1; i++) {
    inner += "<div class='backoption' " + (i == backId ? "selected" : "") + " onclick=selIco(" + i + ") style='background-image:url(\"images/wallpapers/icons/" + (backgrounds[i - 1].replace(".", "Ico.")) + "\")'></div>";
  }
  const backbarElem = document.getElementById("backbar");
  if (backbarElem) { // Check if element exists
    backbarElem.innerHTML = inner;
  }
}

function selCol(id) {
  colId = id;
  localStorage.setItem("colId", id);
  colorSelect();
  setCols();
}

function selIco(id) {
  backId = id;
  localStorage.setItem("backId", id);
  colorSelect();
  setCols();
  // Update the wallpaper immediately
  if (desktopWrapper) { // Check if element exists
    if (id === 0) {
      desktopWrapper.style.backgroundImage = 'none'; // No background image for default
      desktopWrapper.classList.add('grad'); // Apply gradient if it's the default
    } else {
      desktopWrapper.style.backgroundImage = `url('images/wallpapers/${backgrounds[id - 1]}')`;
      desktopWrapper.classList.remove('grad'); // Remove gradient if a specific image is selected
    }
  }
}

function toggleClock() {
  // This function is for the old clockbar, which is now integrated into the taskbar.
  // The time is always visible in the new design.
  // If you want a popup calendar, you'd implement that here.
  // For now, this function will just log a message.
  console.log("Clock toggle functionality is now integrated into the taskbar. Implement a calendar popup if desired.");
}

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function newTime() {
  var dt = new Date();
  dt.setTime(dt.getTime() + tzOffset * 60000);
  var month = dt.getMonth() + 1,
    day = dt.getDate(),
    hour = dt.getHours(),
    minute = dt.getMinutes();
  const timeElem = document.getElementById("time");
  if (timeElem) { // Check if element exists
    timeElem.innerHTML = "" + (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) + "<br>" + dt.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var suffix = "th";
    if (day < 10 || day > 20) {
      if (day % 10 == 1) {
        suffix = "st";
      } else if (day % 10 == 2) {
        suffix = "nd";
      } else if (day % 10 == 3) {
        suffix = "rd";
      }
    }
    var dateStr = months[dt.getMonth()] + " " + day + "" + suffix + " " + dt.getFullYear();
    timeElem.setAttribute("data-title", dateStr);
  }
  // Old clock hands, might not be relevant for new time display
  // document.getElementById("hour").style = "transform:rotate(" + (hour / 12 * 360 + minute / 2) + "deg)";
  // document.getElementById("minute").style = "transform:rotate(" + (minute * 6 + dt.getSeconds() / 10) + "deg)";
  // document.getElementById("second").style = "transform:rotate(" + dt.getSeconds() * 6 + "deg)";

  var index = document.getElementById("timezone") ? document.getElementById("timezone").selectedIndex : 0; // Check timezone exists
  var offset = getOffset(dt, index);
  if (index > 0) {
    dt = new Date();
    const precTZElem = document.getElementById("prectz");
    dt.setTime(index == 1 && precTZElem ? dt.getTime() + (parseInt(precTZElem.value)) * 60000 + offset : dt.getTime() + ((index - 16 + dt.getTimezoneOffset() / 60) * 60) * 60000 + offset);
  } else {
    dt = new Date();
    dt.setTime(dt.getTime() + offset);
  }
  const tzlblElem = document.getElementById("tzlbl");
  if (tzlblElem) { // Check if element exists
    tzlblElem.innerHTML = "Current time: " + dt.toLocaleString() + "";
  }
}

// Removed old handleTaskbar as the taskbar is now fixed
// function handleTaskbar() { ... }

function getOffset() {
  var dt = new Date();
  var dt2 = new Date(),
    roundedDate = Math.floor((dt.getTime() - 60000 * dt2.getTimezoneOffset()) / 86400000) * 86400000;
  const datesetElem = document.getElementById("dateset");
  if (datesetElem) { // Check if datesetElem exists
    return new Date(datesetElem.value).getTime() - roundedDate;
  }
  return 0; // Return 0 if element not found
}

function setTime() {
  var dt = new Date();
  var offset = getOffset() / 60000;
  var index = document.getElementById("timezone") ? document.getElementById("timezone").selectedIndex : 0; // Check timezone exists

  if (index == 0) {
    tzOffset = offset;
  } else if (index == 1) {
    const precTZElem = document.getElementById("prectz");
    tzOffset = precTZElem ? parseInt(precTZElem.value) + offset : offset; // Check precTZElem exists
  } else {
    tzOffset = (index - 16 + dt.getTimezoneOffset() / 60) * 60 + offset;
  }

  newTime();
  localStorage.setItem("tzIndex", index);
  localStorage.setItem("tzOffset", tzOffset);
  // openClock(); // Old clockbar function, now time is always visible
}

function updateTime() {
  var index = document.getElementById("timezone") ? document.getElementById("timezone").selectedIndex : 0; // Check timezone exists
  var precTZ = document.getElementById("prectz");
  if (precTZ) { // Check precTZ exists
    if (index == 1) {
      precTZ.removeAttribute("disabled");
    } else {
      precTZ.setAttribute("disabled", "");
    }
  }
  tzIndex = index;
  newTime();
}

function updateSize(id) {
  const sizeslider = document.getElementsByClassName("sizeslider")[id];
  if (!sizeslider) return; // Ensure element exists

  var val = parseInt(sizeslider.value);
  if (id == 0) {
    DEF_WIN_W = val;
  } else {
    DEF_WIN_H = val;
  }
  const winWElem = document.getElementById("winW");
  const winHElem = document.getElementById("winH");
  if (winWElem) { // Check winWElem exists
    winWElem.innerHTML = "Window width: " + DEF_WIN_W;
  }
  if (winHElem) { // Check winHElem exists
    winHElem.innerHTML = "Window height: " + DEF_WIN_H;
  }
  localStorage.setItem("winW", DEF_WIN_W);
  localStorage.setItem("winH", DEF_WIN_H);
}

newTime();
setInterval(newTime, 1000);
// setInterval(handleTaskbar, 50); // Removed, taskbar is now fixed
window.onload = function() {
  setTimeout(function() {
    const loadscreenElem = document.getElementById("loadscreen");
    if (loadscreenElem) { // Check loadscreenElem exists
      loadscreenElem.style.opacity = 0;
      setTimeout(function() {
        loadscreenElem.style.display = "none";
      }, 500);
    }
  }, 1500);
};

function openPrompt(title, msg, action) {
  var buttons = "<br><button class='promptbtn exec'>OK</button><button class='promptbtn cancel'>Cancel</button>";
  openPopup(title, msg + buttons);
  var elem = document.getElementById("desktop").lastChild;
  if (elem) { // Check elem exists
    const closeBtn = elem.getElementsByClassName("close")[0];
    const cancelBtn = elem.getElementsByClassName("cancel")[0];
    const execBtn = elem.getElementsByClassName("exec")[0];
    if (closeBtn) closeBtn.setAttribute("onclick", "cancelPrompt(" + elem.id + ")");
    if (cancelBtn) cancelBtn.setAttribute("onclick", "cancelPrompt(" + elem.id + ")");
    if (execBtn) execBtn.setAttribute("onclick", "execNext(" + elem.id + ")");
  }
  next = action;
}

function execNext(id) {
  if (next == "reset") {
    localStorage.clear();
    restart();
  } else if (next == "resetn") {
    resetNames();
  } else if (next == "restart") { // Handle restart action
    restart();
  } else if (next == "powerOff") { // Handle powerOff action
    powerOff();
  }
  cancelPrompt(id);
}

function cancelPrompt(id) {
  next = null;
  closeWin(id);
}

function resetNamesRelay() {
  openPrompt("Reset Names?", "Do you want to reset all file names?", "resetn");
}

function resetAll() {
  openPrompt("Reset System?", "Do you want to reset the system?", "reset");
}

function toggleFullscreen() {
  if (!document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function moveHist(index, dir) {
  var w = windows[index];
  var win = document.getElementsByClassName("window")[index];
  if (!w || !win) return; // Ensure elements exist

  w.histPointer += dir * 2;
  const pathElem = win.getElementsByClassName("path")[0];
  if (pathElem) { // Check pathElem exists
    pathElem.value = w.history[w.histPointer + 1];
  }
  parseGeneralURL(win, w.history[w.histPointer]);
}

function loadRepos() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var elem = document.getElementById("explorerbuffer") ? document.getElementById("explorerbuffer").getElementsByClassName("sidelinkwrapper")[0] : null;
      if (elem) { // Check elem exists
        var doc = JSON.parse(this.responseText);
        for (var i in doc) {
          var obj = doc[i];
          var item = document.createElement("div");
          item.className = "sidelink";
          item.setAttribute("onclick", "parseGeneralURL(this,'" + obj.url + "/contents')");
          item.innerHTML = obj.name;
          elem.appendChild(item);
        }
      }
    }
  };
  xhttp.open("GET", "https://api.github.com/users/PicturElements/repos", true);
  xhttp.send();
}

function parseGeneralURL(elem, url) {
  var win = getParent(elem, "window");
  if (win) { // Check win exists
    loadFiles(dirToUrl(win, url), win);
  }
}

function dirToUrl(win, inp) {
  if (inp.includes("http")) {
    if (win) win.setAttribute("root", inp.split("/")[5]); // Check win exists
    return inp;
  }
  var inputArr = inp.split("\\");
  var url = "https://api.github.com/repos/PicturElements/" + inputArr[1] + "/contents";
  for (var i = 2; i < inputArr.length; i++) {
    url += "/" + inputArr[i];
  }
  if (win) win.setAttribute("root", inputArr[1]); // Check win exists
  return url;
}

function loadFiles(url, elem, file) {
  var arr = url.split("/");
  var w = getParent(elem, "window");
  if (!w) return; // Ensure w exists

  var index = parseInt(w.id),
    win = windows[index];
  if (!win) return; // Ensure win exists

  var btns = w.getElementsByClassName("histbtn");
  if (btns[3]) btns[3].setAttribute("active", arr.length > 7 || file != null); // Check btns[3] exists

  elem = w.getElementsByClassName("filecontent")[0];
  if (!elem) return; // Ensure elem exists

  elem.innerHTML = "<div class='loadwrapper'><div class='loader dark'></div><div class='loader2 dark'></div><div class='loader3 dark'></div></div>";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var doc = JSON.parse(this.responseText),
        cutoff = 1;
      if (!Array.isArray(doc)) {
        doc = [doc];
        cutoff = 0;
      }

      if (file != null) {
        var fb = getFileObj(doc, file);
        if (fb == null) {
          elem.innerHTML = "<div class='fileerror'>Couldn't find file.</div>";
          return;
        }
        url += ("/" + file);
        doc = [fb];
        cutoff = 0;
      }

      if (win.history[win.histPointer] != url || win.histPointer == -2) {
        win.histPointer += 2;
        win.history[win.histPointer] = url;
        win.history[win.histPointer + 1] = "P:\\" + w.getAttribute("root") + (doc[0] && doc[0].path != undefined ? morePath(doc[0].path, cutoff) : "").replace(/\//g, "\\"); // Check doc[0] exists
        win.history.splice(win.histPointer + 2, win.history.length - (win.histPointer + 2));
      }

      if (btns[0]) btns[0].setAttribute("active", (win.histPointer > 0)); // Check btns[0] exists
      if (btns[1]) btns[1].setAttribute("active", (win.histPointer < win.history.length - 2)); // Check btns[1] exists

      const pathElem = w.getElementsByClassName("path")[0];
      if (pathElem) { // Check pathElem exists
        pathElem.value = win.history[win.histPointer + 1];
      }

      elem.innerHTML = "";
      createLink(elem, "file tableheader hideable", "return;", "Name", "File type", "Size");
      for (var i in doc) {
        if (doc[i].type == "dir") {
          createLink(elem, "file dir", "loadFilesRelay(this)", doc[i].name, "DzOS Folder", "", doc[i].url);
        }
      }
      for (var i in doc) {
        if (doc[i].type == "file") {
          var ext = getExtension(doc[i].name);
          var type = getType(ext);
          var func = "";
          var attrUrl = null;
          if (type[0] == "doc") {
            func = "relayAddWindow(" + viewerID + ",'" + doc[i].name + "',this)";
            attrUrl = "https://picturelements.github.io/PeNote2?url=" + doc[i].download_url;
          } else {
            func = "relayAddWindow(" + viewerID + ",'" + doc[i].name + "',this)";
            attrUrl = "https://picturelements.github.io/PeViewer?type=" + type[0] + "&url=" + doc[i].download_url;
          }
          createLink(elem, "file " + type[0] + " " + ext, func, doc[i].name, type[1], getSize(doc[i].size), attrUrl);
        }
      }
    } else if (this.status == 404) {
      elem.innerHTML = "<div class='fileerror'>Couldn't find " + (arr.length == 7 ? "repository" : (arr[arr.length - 1].includes(".") ? "file" : "folder")) + ".</div>";
    } else if (this.status == 403) {
      var newFile = arr[arr.length - 1];
      newUrl = url.split("/" + newFile)[0];
      console.warn("Don't worry. I've got this.");
      loadFiles(newUrl, elem, newFile);
      return;
    }
  };
  xhttp.onerror = function() {
    elem.innerHTML = "<div class='fileerror'>Couldn't load files.<br>Click to try again.</div>";
    const fileErrorElem = elem.getElementsByClassName("fileerror")[0];
    if (fileErrorElem) { // Check fileErrorElem exists
      fileErrorElem.setAttribute("onclick", "loadFiles('" + url + "',this)");
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function getFileObj(obj, file) {
  for (var elem in obj) {
    if (obj[elem] && obj[elem].name == file) { // Check obj[elem] exists
      return obj[elem];
    }
  }
  return null;
}

function morePath(path, cutoff) {
  var arr = path.split("/");
  var result = "";
  for (var i = 0; i < arr.length - cutoff; i++) {
    result += "/" + arr[i];
  }
  return result;
}

function getExtension(filename) {
  var arr = filename.split(".");
  if (arr.length > 1) {
    return arr[arr.length - 1];
  }
  return "";
}

function getType(extension, findType) {
  for (var obj in types) {
    for (var i = 0; i < types[obj].length; i += 2) {
      if (types[obj][i] == extension) {
        return [obj, types[obj][i + 1]];
      }
    }
    // Check if the extension is a substring of any defined type (e.g., "png" in "image/png")
    for (var i = 0; i < types[obj].length; i += 2) {
      if (extension.includes(types[obj][i])) {
        return [obj, types[obj][i + 1]];
      }
    }
  }
  return ["doc", "<span class='yell'>" + extension + "</span> file"];
}

function getSize(bytes) {
  if (bytes < 1000) {
    return bytes + " B";
  }
  if (bytes < 1e6) {
    return round(bytes / 1000, 1) + " kB";
  }
  if (bytes < 1e9) {
    return round(bytes / 1e6, 1) + " MB";
  }
  return round(bytes / 1e9, 1) + " GB"; // Added for larger files
}

function round(num, dec) {
  var dec = Math.pow(10, dec);
  return Math.round(num * dec) / dec;
}

function createLink(elem, cName, func, name, tpe, sze, url) {
  var item = document.createElement("div");
  item.className = cName;
  item.setAttribute("ondblclick", func);
  var wrapper = document.createElement("div");
  wrapper.className = "mainwrapper";
  var infowrapper = document.createElement("div");
  infowrapper.className = "infowrapper hideable";
  var icon = document.createElement("div");
  icon.className = "icon";
  var title = document.createElement("div");
  title.className = "title";
  title.innerHTML = name;
  var type = document.createElement("div");
  type.className = "filetype";
  type.innerHTML = tpe;
  var size = document.createElement("div");
  size.className = "size";
  size.innerHTML = sze;

  if (url) { // Only set url attribute if it's provided
    item.setAttribute("url", url);
  }

  wrapper.appendChild(icon);
  wrapper.appendChild(title);
  infowrapper.appendChild(type);
  infowrapper.appendChild(size);
  item.appendChild(wrapper);
  item.appendChild(infowrapper);
  elem.appendChild(item);
}

function relayAddWindow(id, name, elem) {
  var url = elem.getAttribute("url");
  addWindow(id, name, url, DEF_WIN_W, DEF_WIN_H, getType(getExtension(url))[0])
}

function loadFilesRelay(elem) {
  if (elem) { // Check elem exists
    loadFiles(elem.getAttribute("url"), elem);
  }
}

function getParent(elem, cName) {
  while (elem && !elem.classList.contains(cName)) { // Check elem exists in loop
    elem = elem.parentElement;
    if (elem && elem.tagName == "BODY") { // Check elem exists
      return null;
    }
  }
  return elem;
}

function toggleGT() {
  var cl = document.body.classList;
  if (cl.contains("grid")) {
    cl.remove("grid");
    cl.add("table");
    localStorage.setItem("viewmode", "table");
  } else {
    cl.remove("table");
    cl.add("grid");
    localStorage.setItem("viewmode", "grid");
  }
}

function contextOpenFile() {
  var elem = getExplorerItem();
  if (elem) { // Check elem exists
    var dbl = new MouseEvent("dblclick");
    elem.dispatchEvent(dbl);
  }
}

function contextNewDir(openNew) {
  var elem = getExplorerItem();
  if (!elem) return; // Ensure elem exists

  var windowElem = getParent(elem, "window");
  if (!windowElem) return; // Ensure windowElem exists

  var pathInput = windowElem.getElementsByClassName("path")[0];
  if (!pathInput) return; // Ensure pathInput exists

  var path = pathInput.value;
  var name = elem.getElementsByClassName("title")[0] ? elem.getElementsByClassName("title")[0].innerHTML : ''; // Check title exists
  if (!path.endsWith(name)) {
    path += "\\" + name;
  }
  if (openNew) {
    addWindow(explorerID, null, path, DEF_WIN_W, DEF_WIN_H);
  } else {
    parseGeneralURL(windowElem, path);
  }
}

function contextOpenHTML() {
  var elem = getExplorerItem();
  if (!elem) return; // Ensure elem exists

  var url = elem.getAttribute("url");
  if (!url) return; // Ensure url exists

  url = url.replace("https://raw.githubusercontent.com/PicturElements/", "https://").replace("/master", "").split("=")[1];
  var title = elem.getElementsByClassName("title")[0] ? elem.getElementsByClassName("title")[0].innerHTML : ''; // Check title exists
  addWindow(viewerID, title, url, DEF_WIN_W, DEF_WIN_H, "html");
}

function getExplorerItem() {
  var cont = document.getElementById("context");
  if (!cont) return null; // Ensure cont exists

  var targetId = cont.getAttribute("target");
  var targetIndex = cont.getAttribute("targetIndex");

  var targetWindow = document.getElementById(targetId);
  if (!targetWindow) return null; // Ensure targetWindow exists

  var files = targetWindow.getElementsByClassName("file");
  if (files && files[targetIndex]) { // Check files and targetIndex exists
    return files[targetIndex];
  }
  return null;
}

function moveUp(elem) {
  var windowElem = getParent(elem, "window");
  if (!windowElem) return; // Ensure windowElem exists

  var index = parseInt(windowElem.id),
    win = windows[index];
  if (!win) return; // Ensure win exists

  var pathInput = windowElem.getElementsByClassName("path")[0];
  if (!pathInput) return; // Ensure pathInput exists

  var pathSplit = pathInput.value.split("\\");
  var newUrl = pathSplit[0];
  for (var i = 1; i < pathSplit.length - 1; i++) {
    newUrl += ("\\" + pathSplit[i]);
  }
  if (newUrl == win.history[win.histPointer - 1]) {
    moveHist(index, -1);
  } else {
    parseGeneralURL(windowElem, newUrl);
  }
}

function consoleOpenWin(str) {
  var origStr = str;
  str = str.toLowerCase();
  if (!str.startsWith("http")) {
    for (var i = 0; i < programData.length; i++) { // Iterate through programData
      if (programData[i] && programData[i].name && programData[i].name.toLowerCase() == str) { // Check programData[i] and name exists
        if (str == "settings") {
          openSettingsWin();
          return;
        } // Call new settings function
        addWindow(i, null, null, DEF_WIN_W, DEF_WIN_H);
        return;
      }
    }
    openPopup("Program Launch Error", "There is no program with name '" + str + "' on this device.");
  } else {
    if (str.endsWith(".html") && str.includes("picturelements.github.io")) {
      addWindow(viewerID, urlToDir(origStr), apiToHttps(origStr), DEF_WIN_W, DEF_WIN_H, "html");
    } else {
      addWindow(explorerID, null, origStr, DEF_WIN_W, DEF_WIN_H);
    }
  }
}

function urlToDir(inp) {
  if (inp.startsWith("P:")) {
    return inp;
  }
  inp = inp.split("?")[0].split("/");
  var out = "P:\\" + inp[5];
  for (var i = 7; i < inp.length; i++) {
    out += "\\" + inp[i];
  }
  return out;
}

function apiToRaw(url) {
  return (url.replace("api.github.com/repos", "raw.githubusercontent.com").replace("/contents", "/master")).split("?")[0];
}

function apiToHttps(url) {
  return (url.replace("api.github.com/repos/PicturElements/", "").replace("/contents", "")).split("?")[0];
}

function randWifi() {
  const wifiElem = document.getElementById("wifi");
  if (wifiElem) { // Check wifiElem exists
    wifiElem.setAttribute("level", Math.floor(Math.random() * 4));
  }
}

setInterval(randWifi, 3000);

function setIcon(obj, elem) {
  if (!elem) return; // Ensure elem exists

  if (obj.url != undefined) {
    elem.style.backgroundImage = "url('images/win_icons/" + obj.url + ".png')";
  } else if (obj.svg != undefined) {
    const svgBuffer = document.getElementById("svgbuffer");
    if (svgBuffer) { // Check svgBuffer exists
      var html = svgBuffer.getElementsByClassName(obj.svg)[0] ? svgBuffer.getElementsByClassName(obj.svg)[0].outerHTML : ''; // Check element exists
      elem.innerHTML = html;
    }
  } else {
    if (elem.parentElement) { // Check parentElement exists
      elem.parentElement.classList.add("file", getType(obj.file)[0], obj.file);
    }
  }
}

// NEW: Function to set taskbar alignment
function setTaskbarAlignment(alignment) {
  if (taskbar) {
    taskbar.classList.remove('left-aligned', 'center-aligned');
    taskbar.classList.add(`${alignment}-aligned`);
    localStorage.setItem('taskbarAlignment', alignment); // Persist setting
  }
}

navigator.getBattery().then(function(battery) {
  updateAll();
  battery.addEventListener('chargingchange', function() {
    updateAll();
  });
  battery.addEventListener('levelchange', function() {
    updateAll();
  });

  function updateAll() {
    var batt = document.getElementById("battery");
    var batterywrapper = document.getElementById("batterywrapper");
    var batteryindicator = batt ? batt.getElementsByClassName("batteryindicator")[0] : null; // Check batt exists

    if (batt && batterywrapper && batteryindicator) { // Check all elements exist
      var lvl = Math.floor(battery.level * 100);
      var charging = battery.charging && lvl != 100;
      batt.setAttribute("charging", charging);
      batterywrapper.setAttribute("data-title", lvl + "% charged" + (charging ? " (charging)" : ""));
      batteryindicator.setAttribute("width", lvl);
      if (lvl == 10 && !charging) {
        openPopup("Battery level low", "The battery level is low (10%). It is recommended that you charge your computer.");
      } else if (lvl < 8 && !charging) {
        openPopup("BATTERY LEVEL LOW", "HOLY FUCK! " + lvl + "% REMAINING! CHARGE YOUR DAMN COMPUTER NOW!");
      }
    }
  }
});
