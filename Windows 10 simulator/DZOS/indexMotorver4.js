document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
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
        expanded = false, // Used for old searchbar, might be deprecated
        slide = false; // Used for old puzzle, might be deprecated
    var lockTaskbar = true, // This primarily affects max/fullscreen window height calculation
        lockTaskbah = false; // This controls the "taskbah" sound (Windows start sound)

    // Array to store open window states
    var windows = [];
    var origNames = []; // Original names of desktop icons/programs
    var winCount = 0; // Counter for window IDs
    var hiddenApps = 5; // Number of system apps at the end of programData not to be shown on desktop
    var permaStickied = 3; // Denotes the taskbar icons that cannot be unpinned (Explorer, Console, Emojifuck) - now handled by explicit pinning
    var last = 0; // For double-click detection

    // Context menu item indices based on HTML structure
    var contextAssort = [
        [0, 1, 2, 3], // Desktop icon context menu: Open, Open All, Rename, Pin to taskbar
        [4, 5, 6, 7], // Taskbar icon context menu (dynamic app): Pin, Unpin, Open new, Close
        [8, 9, 10, 17], // Desktop background context menu: Fullscreen, Enable context menu, Change wallpaper, System Configuration
        [11, 12], // Taskbar background context menu: Lock taskbar, Lock the taskbah
        [6, 7], // Taskbar icon context menu (system app): Open new, Close
        [7], // Taskbar icon context menu (error/settings window): Close
        [13, 14, 15, 16] // File Explorer item context menu: Open, Go to directory, Open in new explorer, Open as HTML
    ];

    // File types for Explorer
    var types = {
        doc: ["css", "Cascading Style Sheet file", "js", "JavaScript file", "html", "HTML document", "json", "JavaScript Object Notation file", "ahk", "AutoHotKey script", "txt", "Plain text document", "zip", "Compressed archive", "hs", "Haskell file", "java", "Java file", "py", "Python script file"],
        img: ["jpg", "JPEG image", "jpeg", "JPEG image", "png", "PNG image", "bmp", "BMP image", "gif", "GIF image"],
        audio: ["mp3", "MP3 audio file", "wav", "Waveform file"],
        font: ["otf", "OpenType font file", "ttf", "TrueType font file"]
    };

    // Color schemes for personalization
    var colors = [
        ["#600", "#d42", "#d77", "linear-gradient(135deg, #ff5e5e 0%,#bd1929 38%,#0e0000 100%)"], // Red
        ["#060", "#3a2", "#7f5", "linear-gradient(135deg, #64e25e 0%,#098022 38%,#051700 100%)"], // Green
        ["#005", "#53f", "#29f", "linear-gradient(135deg, #64a4c4 0%,#1c5d9e 38%,#1c0935 100%)"], // Blue
        ["#a40", "#d72", "#da4", "linear-gradient(135deg, #ffbb5e 0%,#b14b03 38%,#350f00 100%)"], // Orange
        ["#317", "#74a", "#85f", "linear-gradient(135deg, #ae41cc 0%,#53136d 38%,#000000 100%)"], // Purple
        ["#222", "#333", "#777", "linear-gradient(135deg, #696969 0%,#232323 50%,#000000 100%)"], // Dark Grey
        ["#999", "#aaa", "#ddd", "linear-gradient(135deg, #e8e8e8 0%,#a0a0a0 50%,#1f1f1f 100%)"], // Light Grey
        ["#00bfff", "#009acd", "#87ceeb", "linear-gradient(135deg, #00bfff 0%, #007bb6 50%, #003366 100%)"] // Cianblue (Windows accent)
    ];

    // Background images for personalization
    var backgrounds = ["Abstract.jpg", "Bouncy.jpg", "Gimignano.jpg", "Flower.jpg", "Bucks.jpg", "Leaf.jpg", "LonelyRoad.jpg", "Flowers.jpg", "Mandelbrot.png", "Match.jpg"];

    var contextShow = false; // Controls if context menu is enabled
    var next = null; // For prompt actions

    // Load variables from localStorage or set defaults
    var taskArr = JSON.parse(localStorage.getItem("taskArr")) || [0, 2]; // Default pinned apps (Home, Mandelbrot)
    var oftenUsed = JSON.parse(localStorage.getItem("oftenUsed")) || {}; // Stores usage count for programs as an object

    var tzIndex = parseInt(localStorage.getItem("tzIndex")) || 0;
    var tzOffset = parseInt(localStorage.getItem("tzOffset")) || 0;
    var DEF_WIN_W = parseInt(localStorage.getItem("winW")) || 60;
    var DEF_WIN_H = parseInt(localStorage.getItem("winH")) || 35;
    var colId = parseInt(localStorage.getItem("colId")) || 7; // Default colId to 7 for Cianblue
    var backId = parseInt(localStorage.getItem("backId")) || 0; // Default background is gradient (index 0)
    lockTaskbar = localStorage.getItem("lockTaskbar") != "0"; // Default to locked
    lockTaskbah = localStorage.getItem("lockTaskbah") == "true"; // Load taskbah sound state
    document.body.classList.add(localStorage.getItem("viewmode") || "light"); // Default view mode

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
    const programbar = document.getElementById('programbar'); // This is the container for taskbar icons
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
    const lockTaskbarCheckbox = document.getElementById('lock-taskbar-checkbox');
    const lockTaskbahCheckbox = document.getElementById('lock-taskbah-checkbox');
    const datesetInput = document.getElementById('dateset');
    const timezoneSelect = document.getElementById('timezone');
    const prectzInput = document.getElementById('prectz');
    const tzlblSpan = document.getElementById('tzlbl');
    const winWDisplay = document.getElementById('winW');
    const winHDisplay = document.getElementById('winH');
    const winWSlider = document.getElementById('winW-slider');
    const winHSlider = document.getElementById('winH-slider');
    const taskbahSound = document.getElementById('taskbahSound');


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
        if (program && program.icon && program.icon.url) {
            return `images/win_icons/${program.icon.url}.png`;
        } else if (program && program.icon && program.icon.svg) {
            // For SVG icons, you might embed them or use a different path
            // For now, assuming SVGs are handled via Font Awesome or similar
            return ''; // Or return a placeholder if not handled
        } else if (program && program.icon && program.icon.file) {
            // For file-type icons, you might have generic icons for doc, img, etc.
            return `images/win_icons/file_${program.icon.file}.png`; // Example
        }
        return ''; // Default empty
    }

    // Function to create a draggable window
    function makeDraggable(element, header) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (!header) return; // Ensure header exists

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Get highest z-index for window stacking
    function getHighestZIndex() {
        let highest = 0;
        document.querySelectorAll('.window').forEach(el => {
            const z = parseInt(window.getComputedStyle(el).zIndex);
            if (!isNaN(z) && z > highest) {
                highest = z;
            }
        });
        return highest;
    }

    // --- Window Management ---
    function createWindow(programId, initialX = 100, initialY = 100, width = DEF_WIN_W * 10, height = DEF_WIN_H * 10) {
        const program = programData[programId];
        if (!program) {
            console.error("Program not found:", programId);
            return;
        }

        // Check if the app is already open
        const existingApp = document.querySelector(`.window[data-program-id="${programId}"]`);
        if (existingApp) {
            existingApp.classList.remove('hidden'); // Show it if minimized
            bringToFront(existingApp);
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

        let contentHTML = '';
        let iframeSrc = program.url;

        // Special handling for system apps like Explorer and Console
        if (programId === explorerID) {
            contentHTML = document.getElementById("explorerbuffer").innerHTML;
            iframeSrc = ''; // Explorer content is direct HTML, not an iframe
        } else if (programId === consoleID) {
            contentHTML = document.getElementById("consolebuffer").innerHTML;
            iframeSrc = ''; // Console content is direct HTML, not an iframe
        } else if (program.url) {
            contentHTML = `<iframe src="${iframeSrc}" frameborder="0"></iframe>`;
        } else {
            contentHTML = `<p>Application "${program.name}" has no content defined.</p>`;
        }


        windowElement.innerHTML = `
            <div class="header">
                <img src="${getIconPath(program)}" alt="${program.name} Icon" class="window-icon">
                <span class="title">${program.name}</span>
                <div class="window-controls">
                    <button class="minimize-btn" title="Minimize"><i class="fas fa-minus"></i></button>
                    <button class="maximize-btn" title="Maximize/Restore"><i class="far fa-square"></i></button>
                    <button class="close-btn" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="content">
                ${contentHTML}
            </div>
        `;

        document.getElementById('window-container').appendChild(windowElement);

        const header = windowElement.querySelector('.header');
        const minimizeButton = windowElement.querySelector('.minimize-btn');
        const maximizeButton = windowElement.querySelector('.maximize-btn');
        const closeButton = windowElement.querySelector('.close-btn');
        const contentDiv = windowElement.querySelector('.content');

        // Initialize Console if it's the console window
        if (programId === consoleID && contentDiv) {
            new Console(contentDiv); // Assuming Console class is defined in console.js
        }

        // Initialize Explorer if it's the explorer window
        if (programId === explorerID && contentDiv) {
            const pathInput = contentDiv.querySelector('.path');
            const histBackBtn = contentDiv.querySelector('.histbtn:nth-of-type(2)');
            const histForwardBtn = contentDiv.querySelector('.histbtn:nth-of-type(3)');
            const moveUpBtn = contentDiv.querySelector('.histbtn:nth-of-type(1)');
            const fileContentDiv = contentDiv.querySelector('.filecontent');

            if (pathInput) {
                pathInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        parseGeneralURL(windowElement, pathInput.value);
                    }
                });
            }
            if (histBackBtn) histBackBtn.addEventListener('click', () => moveHist(windows.indexOf(windowElement), -1));
            if (histForwardBtn) histForwardBtn.addEventListener('click', () => moveHist(windows.indexOf(windowElement), 1));
            if (moveUpBtn) moveUpBtn.addEventListener('click', () => moveUp(windowElement));
            if (fileContentDiv) fileContentDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, null, 'explorer-item');
            });

            // Initial load for explorer
            parseGeneralURL(windowElement, defaultPage);
        }

        // Make window draggable
        makeDraggable(windowElement, header);

        // Minimize window
        if (minimizeButton) {
            minimizeButton.addEventListener('click', () => {
                windowElement.classList.add('hidden');
                updateTaskbar();
            });
        }

        // Maximize/Restore window
        if (maximizeButton) {
            maximizeButton.addEventListener('click', () => {
                // Simple maximize/restore toggle
                if (windowElement.style.width === '100vw' && windowElement.style.height === 'calc(100vh - 56px)') {
                    // Restore to previous size/position (if stored) or default
                    windowElement.style.width = `${DEF_WIN_W * 10}px`;
                    windowElement.style.height = `${DEF_WIN_H * 10}px`;
                    windowElement.style.top = 'calc(50% - 150px)';
                    windowElement.style.left = 'calc(50% - 200px)';
                } else {
                    // Maximize
                    windowElement.style.width = '100vw';
                    windowElement.style.height = 'calc(100vh - 56px)'; // Account for taskbar
                    windowElement.style.top = '0';
                    windowElement.style.left = '0';
                }
            });
        }

        // Close window
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                windowElement.remove();
                updateTaskbar(); // Refresh taskbar to remove closed app
            });
        }

        // Bring to front on click
        windowElement.addEventListener('mousedown', () => {
            bringToFront(windowElement);
        });

        bringToFront(windowElement); // Bring newly created window to front
        updateTaskbar(); // Update taskbar to show new open app
        incrementOftenUsed(programId);

        // Add to global windows array for tracking
        windows.push(windowElement);
    }

    function bringToFront(windowElement) {
        document.querySelectorAll('.window').forEach(win => {
            win.style.zIndex = '10'; // Reset z-index
            win.classList.remove('active');
        });
        windowElement.style.zIndex = getHighestZIndex() + 1; // Bring to front
        windowElement.classList.add('active');
        activeWindow = windowElement;
    }

    // --- Taskbar and Programbar Management ---
    function updateTaskbar() {
        if (!programbar) return; // Null check
        programbar.innerHTML = ''; // Clear current taskbar icons

        // Get all currently open windows
        const openWindows = Array.from(document.querySelectorAll('.window'));

        // Add pinned apps first
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
                    const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
                    if (openWin) {
                        if (openWin.classList.contains('hidden')) { // If minimized, restore and bring to front
                            openWin.classList.remove('hidden');
                            bringToFront(openWin);
                        } else if (activeWindow === openWin) { // If active, minimize
                            openWin.classList.add('hidden');
                        } else { // If open but not active, bring to front
                            bringToFront(openWin);
                        }
                    } else { // If not open, create new window
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
                if (openWin && !openWin.classList.contains('hidden') && activeWindow === openWin) {
                    iconContainer.classList.add('active');
                } else {
                    iconContainer.classList.remove('active');
                }
            }
        });

        // Add currently open windows that are NOT pinned
        openWindows.forEach(win => {
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
                        if (win.classList.contains('hidden')) {
                            win.classList.remove('hidden');
                            bringToFront(win);
                        } else if (activeWindow === win) {
                            win.classList.add('hidden');
                        } else {
                            bringToFront(win);
                        }
                    });

                    iconContainer.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        showContextMenu(e, programId, 'taskbar-icon');
                    });

                    if (activeWindow === win && !win.classList.contains('hidden')) {
                        iconContainer.classList.add('active');
                    } else {
                        iconContainer.classList.remove('active');
                    }
                }
            }
        });
    }

    function pinToTaskbar(programId) {
        if (!taskArr.includes(programId)) {
            taskArr.push(programId);
            localStorage.setItem("taskArr", JSON.stringify(taskArr));
            updateTaskbar();
            renderPinnedApps();
        }
    }

    function unpinFromTaskbar(programId) {
        taskArr = taskArr.filter(id => id !== programId);
        localStorage.setItem("taskArr", JSON.stringify(taskArr));
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
                renderPuzzleGrid(); // Render puzzle images
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
        // Only show apps that are actually pinned in taskArr
        taskArr.slice(0, 12).forEach(programId => { // Show up to 12 pinned apps
            const program = programData[programId];
            if (program) {
                const appItem = document.createElement('div');
                appItem.className = 'app-grid-item';
                const iconUrl = getIconPath(program);
                appItem.innerHTML = `
                    <img src="${iconUrl}" alt="${program.name}">
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
                const iconUrl = getIconPath(program);
                appItem.innerHTML = `
                    <img src="${iconUrl}" alt="${program.name}">
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
        localStorage.setItem("oftenUsed", JSON.stringify(oftenUsed));
    }

    function renderAllApps() {
        if (!allAppsList) return;
        allAppsList.innerHTML = '';
        // Filter out system apps (last `hiddenApps` items) and sort alphabetically by name
        const sortedPrograms = programData.slice(0, pl - hiddenApps)
            .sort((a, b) => a.name.localeCompare(b.name));

        sortedPrograms.forEach((program, originalIndex) => {
            // Find the original ID from programData, as sorting might change index
            const actualProgramId = programData.indexOf(program);
            if (actualProgramId !== -1) {
                const appItem = document.createElement('li');
                appItem.className = 'app-list-item';
                appItem.textContent = program.name;
                appItem.addEventListener('click', () => {
                    createWindow(actualProgramId); // Use original index for opening
                    toggleStartMenu();
                });
                allAppsList.appendChild(appItem);
            }
        });
    }

    function renderPuzzleGrid() {
        const puzzleGrid = document.getElementById('puzzle-grid');
        if (!puzzleGrid) return;
        puzzleGrid.innerHTML = '';

        const puzzleImages = [
            "images/puzzles/puzzle1.png",
            "images/puzzles/puzzle2.png",
            "images/puzzles/puzzle3.png",
            "images/puzzles/puzzle4.png",
            "images/puzzles/puzzle5.png",
            "images/puzzles/puzzle6.png"
        ]; // Example puzzle images

        // Select 6 random images for the puzzle grid
        const selectedPuzzles = puzzleImages.sort(() => 0.5 - Math.random()).slice(0, 6);

        selectedPuzzles.forEach(imagePath => {
            const puzzleItem = document.createElement('div');
            puzzleItem.className = 'app-grid-item puzzle-item'; // Add puzzle-item class for specific styling
            puzzleItem.innerHTML = `<img src="${imagePath}" alt="Puzzle Image"><span>Puzzle</span>`;
            // You can add specific game logic here if these puzzles are interactive
            puzzleItem.addEventListener('click', () => {
                alert(`You clicked on a puzzle! (Image: ${imagePath})`);
                // Implement actual puzzle game launch here
            });
            puzzleGrid.appendChild(puzzleItem);
        });
    }


    // --- Search Functions ---
    function toggleSearchOverlay() {
        if (searchOverlay) {
            searchOverlay.classList.toggle('hidden');
            if (!searchOverlay.classList.contains('hidden')) {
                searchInput.focus();
                searchResultsDiv.innerHTML = '<p style="padding: 10px; text-align: center; color: var(--taskbar-text);">Start typing to search for apps, documents, or settings.</p>'; // Initial message
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

        if (query.length < 1) { // Allow search with 1 character
            searchResultsDiv.innerHTML = '<p style="padding: 10px; text-align: center; color: var(--taskbar-text);">Start typing to search for apps, documents, or settings.</p>';
            return;
        }

        const results = programData.filter(program =>
            program && (
                (program.name && program.name.toLowerCase().includes(query)) ||
                (program.keywords && program.keywords.toLowerCase().includes(query))
            )
        );

        if (results.length === 0) {
            searchResultsDiv.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--taskbar-text);">No results found.</div>';
            return;
        }

        results.forEach(program => {
            const programId = programData.indexOf(program); // Get the original ID
            if (programId === -1) return; // Should not happen if filtered correctly

            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';

            let displayName = program.name;
            let displayKeywords = program.keywords ? program.keywords.replace(/,/g, ", ") : '';

            // Highlight matches
            const highlightRegex = new RegExp(`(${query})`, 'gi');
            displayName = displayName.replace(highlightRegex, '<span class="highlight">$1</span>');
            displayKeywords = displayKeywords.replace(highlightRegex, '<span class="highlight">$1</span>');


            resultItem.innerHTML = `
                <img src="${getIconPath(program)}" alt="${program.name} Icon">
                <span>${displayName}</span>
                <span class="kw">${displayKeywords}</span>
            `;
            resultItem.addEventListener('click', () => {
                // Special handling for Settings app
                if (programId === setID) {
                    toggleSettingsWindow();
                } else if (programId === explorerID) {
                    createWindow(explorerID, 200, 100, 800, 600); // Open explorer with default size
                } else if (programId === consoleID) {
                    createWindow(consoleID, 250, 150, 700, 500); // Open console with default size
                } else {
                    createWindow(programId);
                }
                toggleSearchOverlay(); // Close search after opening app
            });
            searchResultsDiv.appendChild(resultItem);
        });
    }

    // --- Settings Window Functions ---
    function toggleSettingsWindow() {
        if (settingsWindow) {
            settingsWindow.classList.toggle('hidden');
            if (!settingsWindow.classList.contains('hidden')) {
                bringToFront(settingsWindow);
                // Activate default section on open
                showSettingsSection('personalization-section');
                // Update settings values on open
                loadSettingsPanelValues();
                renderWallpaperThumbnails();
            }
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
            if (section) section.classList.remove('active');
        });
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        settingsSidebarItems.forEach(item => {
            if (item && item.getAttribute('data-section') + '-section' === sectionId) {
                item.classList.add('active');
            } else if (item) {
                item.classList.remove('active');
            }
        });
    }

    function loadSettingsPanelValues() {
        // Personalization
        if (taskbarTransparencySlider) {
            const savedTransparency = localStorage.getItem('taskbarTransparency') || 90;
            taskbarTransparencySlider.value = savedTransparency;
            updateTaskbarTransparency();
        }
        if (lockTaskbarCheckbox) {
            lockTaskbarCheckbox.checked = lockTaskbar;
        }
        if (lockTaskbahCheckbox) {
            lockTaskbahCheckbox.checked = lockTaskbah;
        }
        if (alignLeftBtn && alignCenterBtn) {
            const savedAlignment = localStorage.getItem('taskbarAlignment') || 'center';
            alignLeftBtn.classList.toggle('active', savedAlignment === 'left');
            alignCenterBtn.classList.toggle('active', savedAlignment === 'center');
        }
        if (document.body.classList.contains('dark-mode')) {
            if (darkModeBtn) darkModeBtn.classList.add('active');
            if (lightModeBtn) lightModeBtn.classList.remove('active');
        } else {
            if (lightModeBtn) lightModeBtn.classList.add('active');
            if (darkModeBtn) darkModeBtn.classList.remove('active');
        }

        // System - Time & Language
        if (datesetInput) {
            const dt = new Date(new Date().getTime() + tzOffset * 60000);
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            datesetInput.value = `${dt.getFullYear()}-${month}-${day}`;
        }
        if (timezoneSelect) {
            timezoneSelect.selectedIndex = tzIndex;
            updateTimezonePreciseInput(); // Call to enable/disable precise input
        }
        newTime(); // Update current time display in settings

        // System - Window Defaults
        if (winWSlider) {
            winWSlider.value = DEF_WIN_W;
            if (winWDisplay) winWDisplay.textContent = DEF_WIN_W;
        }
        if (winHSlider) {
            winHSlider.value = DEF_WIN_H;
            if (winHDisplay) winHDisplay.textContent = DEF_WIN_H;
        }
    }

    function renderWallpaperThumbnails() {
        if (!wallpaperThumbnailsDiv) return;
        wallpaperThumbnailsDiv.innerHTML = '';

        // Add default gradient option
        const defaultThumb = document.createElement('div');
        defaultThumb.className = 'wallpaper-thumbnail';
        defaultThumb.classList.add('grad'); // Apply gradient class
        defaultThumb.setAttribute('data-bg-id', 0); // Index 0 for gradient
        if (backId === 0) {
            defaultThumb.classList.add('selected');
        }
        defaultThumb.addEventListener('click', () => {
            changeWallpaper(0);
            document.querySelectorAll('.wallpaper-thumbnail').forEach(t => t.classList.remove('selected'));
            defaultThumb.classList.add('selected');
        });
        wallpaperThumbnailsDiv.appendChild(defaultThumb);

        // Add image thumbnails
        backgrounds.forEach((bg, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'wallpaper-thumbnail';
            thumb.style.backgroundImage = `url('images/wallpapers/icons/${bg.replace(".", "Ico.")}')`; // Use icon version
            thumb.setAttribute('data-bg-id', index + 1); // +1 because 0 is gradient
            if (index + 1 === backId) {
                thumb.classList.add('selected');
            }
            thumb.addEventListener('click', () => {
                changeWallpaper(index + 1);
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
                desktopWrapper.style.backgroundImage = `url('images/wallpapers/${backgrounds[id - 1]}')`;
            }
        }
    }

    function toggleLightDarkMode(mode) {
        if (document.body) {
            if (mode === 'dark') {
                document.body.classList.add('dark-mode');
                localStorage.setItem('viewmode', 'dark');
                if (darkModeBtn) darkModeBtn.classList.add('active');
                if (lightModeBtn) lightModeBtn.classList.remove('active');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('viewmode', 'light');
                if (lightModeBtn) lightModeBtn.classList.add('active');
                if (darkModeBtn) darkModeBtn.classList.remove('active');
            }
        }
    }

    function updateTaskbarTransparency() {
        if (taskbarTransparencySlider && taskbar) {
            const transparency = taskbarTransparencySlider.value;
            if (taskbarTransparencyValue) taskbarTransparencyValue.textContent = `${transparency}%`;
            const root = document.documentElement;
            const currentRgb = getComputedStyle(root).getPropertyValue('--taskbar-bg-rgb');
            taskbar.style.backgroundColor = `rgba(${currentRgb}, ${transparency / 100})`;
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

    function toggleLockTaskbar() {
        lockTaskbar = !lockTaskbar;
        localStorage.setItem("lockTaskbar", lockTaskbar ? "1" : "0");
        if (lockTaskbarCheckbox) lockTaskbarCheckbox.checked = lockTaskbar;
        // Re-calculate window sizes if taskbar lock state changes
        // This is handled by the window resizing logic, but can be forced here if needed
        console.log("Taskbar locked state:", lockTaskbar);
    }

    function toggleTaskbahSound() {
        lockTaskbah = !lockTaskbah;
        localStorage.setItem("lockTaskbah", lockTaskbah);
        if (lockTaskbahCheckbox) lockTaskbahCheckbox.checked = lockTaskbah;
        if (taskbahSound) {
            if (lockTaskbah) {
                taskbahSound.currentTime = 0;
                taskbahSound.play();
            } else {
                taskbahSound.pause();
            }
        }
    }

    function resetNames() {
        openPrompt("Reset Program Names?", "Do you want to reset all custom program names to default?", "resetNamesAction");
    }

    function resetAll() {
        openPrompt("Reset System?", "This will clear all saved settings, pinned apps, and custom names. Are you sure?", "resetAllAction");
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
        openPrompt(`${action.charAt(0).toUpperCase() + action.slice(1)} System?`, confirmMessage, action);
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
            items = [{
                    text: "Open",
                    action: () => {
                        const selectedIcons = Array.from(document.querySelectorAll('.desktoplink[selected="true"]'));
                        if (selectedIcons.length > 0) {
                            selectedIcons.forEach(icon => {
                                const id = parseInt(icon.getAttribute('onclick').match(/selectIcon\(event,(\d+),false\)/)[1]);
                                createWindow(id);
                            });
                        } else {
                            // If no icon is selected, open the one right-clicked on
                            const targetIcon = getParent(e.target, 'desktoplink');
                            if (targetIcon) {
                                const id = parseInt(targetIcon.getAttribute('onclick').match(/selectIcon\(event,(\d+),false\)/)[1]);
                                createWindow(id);
                            }
                        }
                    }
                },
                {
                    text: "Open All",
                    action: () => {
                        const selectedIcons = Array.from(document.querySelectorAll('.desktoplink[selected="true"]'));
                        if (selectedIcons.length > 0) {
                            let delay = 0;
                            selectedIcons.forEach(icon => {
                                const id = parseInt(icon.getAttribute('onclick').match(/selectIcon\(event,(\d+),false\)/)[1]);
                                setTimeout(() => createWindow(id), delay);
                                delay += 200; // Stagger opening
                            });
                        }
                    }
                },
                {
                    text: "Rename",
                    action: () => {
                        const targetIcon = getParent(e.target, 'desktoplink');
                        if (targetIcon) {
                            const id = parseInt(targetIcon.getAttribute('onclick').match(/selectIcon\(event,(\d+),false\)/)[1]);
                            editName(id);
                        }
                    }
                },
                {
                    text: "Pin to taskbar",
                    action: () => {
                        const targetIcon = getParent(e.target, 'desktoplink');
                        if (targetIcon) {
                            const id = parseInt(targetIcon.getAttribute('onclick').match(/selectIcon\(event,(\d+),false\)/)[1]);
                            pinToTaskbar(id);
                        }
                    }
                },
                {
                    text: "Fullscreen",
                    action: toggleFullscreen
                },
                {
                    text: (contextShow ? "Disable" : "Enable") + " context menu",
                    action: () => contextShow = !contextShow
                },
                {
                    text: "Change wallpaper",
                    action: () => {
                        toggleSettingsWindow();
                        showSettingsSection('personalization-section');
                    }
                },
                {
                    text: "System Configuration",
                    action: () => alert("System Configuration not yet implemented.")
                }
            ];
        } else if (type === 'taskbar-icon') {
            programId = targetId;
            const isOpen = document.querySelector(`.window[data-program-id="${programId}"]`) !== null;

            if (taskArr.includes(programId)) {
                items.push({
                    text: "Unpin from taskbar",
                    action: () => unpinFromTaskbar(programId)
                });
            } else {
                items.push({
                    text: "Pin to taskbar",
                    action: () => pinToTaskbar(programId)
                });
            }

            if (isOpen) {
                items.push({
                    text: "Minimize",
                    action: () => {
                        const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
                        if (openWin) openWin.classList.add('hidden');
                        updateTaskbar();
                    }
                });
                items.push({
                    text: "Close window",
                    action: () => {
                        const openWin = document.querySelector(`.window[data-program-id="${programId}"]`);
                        if (openWin) openWin.remove();
                        updateTaskbar();
                    }
                });
            } else {
                items.push({
                    text: "Open new window",
                    action: () => createWindow(programId)
                });
            }
        } else if (type === 'explorer-item') {
            const targetFileElement = getParent(e.target, 'file');
            if (!targetFileElement) return;

            const isDir = targetFileElement.classList.contains('dir');
            const isHtml = targetFileElement.classList.contains('html');
            const fileName = targetFileElement.querySelector('.title').textContent;
            const fileUrl = targetFileElement.getAttribute('url');
            const windowElement = getParent(e.target, 'window');

            items.push({
                text: "Open",
                action: () => {
                    if (isDir) {
                        parseGeneralURL(windowElement, fileUrl);
                    } else {
                        relayAddWindow(viewerID, fileName, targetFileElement);
                    }
                }
            });
            if (isDir) {
                items.push({
                    text: "Go to directory",
                    action: () => parseGeneralURL(windowElement, fileUrl)
                });
                items.push({
                    text: "Open in new explorer",
                    action: () => createWindow(explorerID, 200, 100, 800, 600, fileUrl)
                });
            }
            if (isHtml) {
                items.push({
                    text: "Open as HTML",
                    action: () => relayAddWindow(viewerID, fileName, targetFileElement)
                });
            }
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


    // --- Core System Functions (from original indexMotor files) ---

    function setup() {
        var parent = document.getElementById("desktop");
        if (!parent) return;

        // Populate desktop icons
        for (var i = 0; i < programData.length - hiddenApps; i++) {
            // Initialize oftenUsed count for program if not exists
            if (typeof oftenUsed[i] === 'undefined') {
                oftenUsed[i] = 0;
            }
            origNames.push(programData[i].name);
            if (localStorage.getItem("customTitle" + i) != null) {
                programData[i].name = localStorage.getItem("customTitle" + i);
            }
            var el = document.createElement("div");
            el.className = "desktoplink";
            el.title = programData[i].name;
            el.setAttribute("selected", "false");
            el.setAttribute("data-program-id", i); // Store program ID
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = parseInt(e.currentTarget.getAttribute('data-program-id'));
                createWindow(id);
            });
            el.addEventListener("contextmenu", function(event) {
                showContextMenu(event, parseInt(event.currentTarget.getAttribute('data-program-id')), 'desktop');
            });
            el.innerHTML = `<div class='icon'></div> <p class='ddesc'>${programData[i].name}</p>`;
            setIcon(programData[i].icon, el.getElementsByClassName("icon")[0]);
            parent.appendChild(el);
        }

        // Populate timezone options in settings
        if (timezoneSelect) {
            for (var i = -14; i < 15; i++) {
                var el = document.createElement("option");
                el.innerHTML = "UTC" + (i < 1 ? "" : "+") + "" + (i != 0 ? i : "");
                timezoneSelect.appendChild(el);
            }
            var tz = new Date().getTimezoneOffset() / -60;
            timezoneSelect.getElementsByTagName("option")[0].innerHTML = "Local (UTC" + (tz < 0 ? "" : "+") + "" + (tz != 0 ? tz : "") + ")";
        }

        setCols(); // Apply theme colors
        changeWallpaper(backId); // Apply saved wallpaper

        loadRepos(); // Load GitHub repositories for Explorer

        // Set initial taskbar alignment (default to center)
        setTaskbarAlignment(localStorage.getItem('taskbarAlignment') || 'center');

        // Set initial lock taskbar checkbox state
        if (lockTaskbarCheckbox) {
            lockTaskbarCheckbox.checked = lockTaskbar;
        }
        // Set initial taskbah sound checkbox state
        if (lockTaskbahCheckbox) {
            lockTaskbahCheckbox.checked = lockTaskbah;
        }

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
    }

    function setCols() {
        const root = document.documentElement;
        const selectedColors = colors[colId];

        root.style.setProperty('--window-active-header-bg', selectedColors[1]);
        root.style.setProperty('--button-bg', selectedColors[1]);
        root.style.setProperty('--button-hover-bg', selectedColors[0]);
        root.style.setProperty('--settings-sidebar-item-active-text', selectedColors[1]);

        const specColsElem = document.getElementById("specCols");
        if (specColsElem) {
            specColsElem.innerHTML = `.specColor{background-color:${selectedColors[0]}; border-color:${selectedColors[0]};}\n.window[active='true'] .infoCol, .normCol{background-color:${selectedColors[1]};}\n.borderCol{border-color:${selectedColors[2]} !important;}\n.grad{background: ${selectedColors[3]};}`;
        }
    }

    function editName(id) {
        var p = document.querySelector(`.desktoplink[data-program-id="${id}"] .ddesc`);
        if (!p) return;

        // Check if already in edit mode
        if (p.querySelector('#nameedit')) {
            return;
        }

        var name = p.innerHTML;
        p.innerHTML = "<div contenteditable spellcheck='false' id='nameedit'>" + name + "</div>";
        var ne = document.getElementById("nameedit");
        if (ne) {
            selectElementContents(ne);
            ne.addEventListener("keydown", function(event) {
                setName(event, id)
            });
            ne.addEventListener("blur", function(event) {
                setName(event, id, true); // Pass true to indicate blur event
            });
        }
    }

    //http://stackoverflow.com/a/6150060
    function selectElementContents(el) {
        var range = document.createRange();
        if (el) {
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    function setName(evt, id, isBlur = false) {
        var elem = document.getElementById("nameedit");
        if (!elem) return;

        if (evt.keyCode == 13 || isBlur) {
            if (evt.keyCode == 13) {
                evt.preventDefault();
            }

            var oldName = programData[id].name;
            var name = elem.textContent.trim();

            if (name === oldName) {
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
            const desktopLink = document.querySelector(`.desktoplink[data-program-id="${id}"]`);
            if (desktopLink) {
                desktopLink.title = name;
                desktopLink.querySelector('.ddesc').innerHTML = name;
            }
            preventEvents = false;
            programData[id].name = name;
            // Update titles of open windows and taskbar items
            document.querySelectorAll('.window[data-program-id="' + id + '"] .title').forEach(titleElem => {
                titleElem.textContent = name;
            });
            document.querySelectorAll(`.program-icon-container[data-program-id="${id}"]`).forEach(taskbarItem => {
                taskbarItem.title = name;
            });
            localStorage.setItem("customTitle" + id, name);
        }
    }

    function resetProgramNamesAction() {
        for (var i = 0; i < origNames.length; i++) {
            programData[i].name = origNames[i];
            localStorage.removeItem("customTitle" + i);
            const desktopLink = document.querySelector(`.desktoplink[data-program-id="${i}"]`);
            if (desktopLink) {
                desktopLink.title = origNames[i];
                desktopLink.querySelector('.ddesc').innerHTML = origNames[i];
            }
        }
        // Update titles of any open windows
        document.querySelectorAll('.window').forEach(win => {
            const programId = parseInt(win.getAttribute('data-program-id'));
            if (programData[programId]) {
                win.querySelector('.title').textContent = programData[programId].name;
            }
        });
        updateTaskbar(); // Refresh taskbar icons to show original names
        renderAllApps(); // Refresh all apps list
        renderPinnedApps(); // Refresh pinned apps list
        renderOftenUsedApps(); // Refresh often used apps list
        alert("Program names have been reset to default.");
    }

    function resetAllAction() {
        localStorage.clear();
        alert("All data has been reset. The system will now restart.");
        window.location.reload();
    }

    function openPopup(errtitle, errStr, icon) {
        // This function creates a simple modal/popup for messages
        // It's a simplified version of the old addWindow(errID)
        const popupId = `popup-${Date.now()}`;
        const popupHtml = `
            <div id="${popupId}" class="window error-popup">
                <div class="header">
                    <span class="title">${errtitle}</span>
                    <button class="close-btn" onclick="document.getElementById('${popupId}').remove();"><i class="fas fa-times"></i></button>
                </div>
                <div class="content">
                    <p>${errStr}</p>
                    <div class="popup-buttons"></div>
                </div>
            </div>
        `;
        document.getElementById('window-container').insertAdjacentHTML('beforeend', popupHtml);
        const newPopup = document.getElementById(popupId);
        makeDraggable(newPopup, newPopup.querySelector('.header'));
        bringToFront(newPopup);
        return newPopup; // Return the new popup element
    }

    function openPrompt(title, msg, action) {
        const popup = openPopup(title, msg);
        const buttonsContainer = popup.querySelector('.popup-buttons');
        if (buttonsContainer) {
            const okBtn = document.createElement('button');
            okBtn.className = 'promptbtn exec';
            okBtn.textContent = 'OK';
            okBtn.onclick = () => {
                execNext(action);
                popup.remove();
            };

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'promptbtn cancel';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => popup.remove();

            buttonsContainer.appendChild(okBtn);
            buttonsContainer.appendChild(cancelBtn);
        }
    }

    function execNext(action) {
        if (action === "resetAllAction") {
            resetAllAction();
        } else if (action === "resetNamesAction") {
            resetProgramNamesAction();
        } else if (action === "restart") {
            window.location.reload(); // Simulate restart
        } else if (action === "shut down") {
            alert("Simulating shutdown. This browser tab may not close automatically.");
            // window.close(); // For actual shutdown, but often blocked by browsers
        }
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

    function moveHist(windowElement, dir) {
        const winIndex = windows.indexOf(windowElement);
        if (winIndex === -1) return;
        const winState = windows[winIndex];

        winState.histPointer = (winState.histPointer || 0) + dir * 2;
        // Ensure histPointer is within bounds
        winState.histPointer = Math.max(0, Math.min(winState.histPointer, winState.history.length - 2));

        const pathInput = windowElement.querySelector('.path');
        if (pathInput) {
            pathInput.value = winState.history[winState.histPointer + 1];
        }
        parseGeneralURL(windowElement, winState.history[winState.histPointer]);
    }

    function loadRepos() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var elem = document.getElementById("explorerbuffer") ? document.getElementById("explorerbuffer").querySelector(".sidelinkwrapper") : null;
                if (elem) {
                    var doc = JSON.parse(this.responseText);
                    for (var i in doc) {
                        var obj = doc[i];
                        var item = document.createElement("div");
                        item.className = "sidelink";
                        item.setAttribute("onclick", "parseGeneralURL(getParent(this, 'window'),'" + obj.url + "/contents')");
                        item.innerHTML = obj.name;
                        elem.appendChild(item);
                    }
                }
            }
        };
        xhttp.open("GET", "https://api.github.com/users/PicturElements/repos", true);
        xhttp.send();
    }

    function parseGeneralURL(windowElement, url) {
        const winIndex = windows.indexOf(windowElement);
        if (winIndex === -1) return;
        const winState = windows[winIndex];

        const pathInput = windowElement.querySelector('.path');
        const fileContentDiv = windowElement.querySelector('.filecontent');

        if (!pathInput || !fileContentDiv) return;

        let apiUrl = url;
        let rootPath = '';

        if (url.startsWith("P:\\")) {
            const parts = url.split('\\');
            rootPath = parts[1];
            apiUrl = `https://api.github.com/repos/PicturElements/${parts[1]}/contents`;
            for (let i = 2; i < parts.length; i++) {
                apiUrl += `/${parts[i]}`;
            }
        } else if (url.includes("github.com")) { // Assume it's a direct GitHub URL or similar
            const urlParts = url.split('/');
            rootPath = urlParts[urlParts.indexOf('repos') + 1]; // Get repo name
        } else {
            // Fallback for unknown URLs, treat as direct file path
            console.warn("Unknown URL format, attempting to load directly:", url);
            fileContentDiv.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;"></iframe>`;
            return;
        }

        winState.root = rootPath; // Store root for path display

        loadFiles(apiUrl, windowElement);
    }

    function loadFiles(url, windowElement, file = null) {
        const winIndex = windows.indexOf(windowElement);
        if (winIndex === -1) return;
        const winState = windows[winIndex];

        const pathInput = windowElement.querySelector('.path');
        const fileContentDiv = windowElement.querySelector('.filecontent');
        const histBtns = windowElement.querySelectorAll('.histbtn');

        if (!pathInput || !fileContentDiv || !histBtns) return;

        fileContentDiv.innerHTML = "<div class='loadwrapper'><div class='loader dark'></div><div class='loader2 dark'></div><div class='loader3 dark'></div></div>";

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let doc = JSON.parse(this.responseText);
                let cutoff = 1; // For path calculation

                if (!Array.isArray(doc)) {
                    doc = [doc];
                    cutoff = 0;
                }

                if (file != null) {
                    var fb = getFileObj(doc, file);
                    if (fb == null) {
                        fileContentDiv.innerHTML = "<div class='fileerror'>Couldn't find file.</div>";
                        return;
                    }
                    url += ("/" + file);
                    doc = [fb];
                    cutoff = 0;
                }

                // Update history
                const currentPath = `P:\\${winState.root || ''}${doc[0] && doc[0].path ? morePath(doc[0].path, cutoff).replace(/\//g, '\\') : ''}`;
                if (winState.history[winState.histPointer] !== url || winState.histPointer === undefined || winState.histPointer === -2) {
                    if (winState.histPointer === undefined || winState.histPointer === -2) {
                        winState.histPointer = 0;
                        winState.history = [];
                    } else {
                        winState.histPointer += 2;
                    }
                    winState.history[winState.histPointer] = url;
                    winState.history[winState.histPointer + 1] = currentPath;
                    winState.history.splice(winState.histPointer + 2, winState.history.length - (winState.histPointer + 2));
                }

                // Update history button states
                if (histBtns[1]) histBtns[1].disabled = !(winState.histPointer > 0); // Back button
                if (histBtns[2]) histBtns[2].disabled = !(winState.histPointer < winState.history.length - 2); // Forward button

                pathInput.value = winState.history[winState.histPointer + 1];

                fileContentDiv.innerHTML = "";
                createLink(fileContentDiv, "file tableheader hideable", "return;", "Name", "File type", "Size");

                // Sort directories first, then files, both alphabetically
                doc.sort((a, b) => {
                    if (a.type === 'dir' && b.type !== 'dir') return -1;
                    if (a.type !== 'dir' && b.type === 'dir') return 1;
                    return a.name.localeCompare(b.name);
                });

                for (var i in doc) {
                    if (doc[i].type == "dir") {
                        createLink(fileContentDiv, "file dir", `loadFilesRelay(this, '${doc[i].url}')`, doc[i].name, "DzOS Folder", "", doc[i].url);
                    }
                }
                for (var i in doc) {
                    if (doc[i].type == "file") {
                        var ext = getExtension(doc[i].name);
                        var type = getType(ext);
                        var func = "";
                        var attrUrl = null;
                        if (type[0] == "doc") {
                            func = `relayAddWindow(${viewerID},'${doc[i].name}',this)`;
                            attrUrl = `https://picturelements.github.io/PeNote2?url=${doc[i].download_url}`;
                        } else {
                            func = `relayAddWindow(${viewerID},'${doc[i].name}',this)`;
                            attrUrl = `https://picturelements.github.io/PeViewer?type=${type[0]}&url=${doc[i].download_url}`;
                        }
                        createLink(fileContentDiv, "file " + type[0] + " " + ext, func, doc[i].name, type[1], getSize(doc[i].size), attrUrl);
                    }
                }
            } else if (this.status == 404) {
                fileContentDiv.innerHTML = "<div class='fileerror'>Couldn't find " + (url.split('/').length === 7 ? "repository" : (url.includes(".") ? "file" : "folder")) + ".</div>";
            } else if (this.status == 403) {
                // If the blob is too large, try looking for the folder
                var newFile = url.split("/").pop();
                var newUrl = url.substring(0, url.lastIndexOf('/'));
                console.warn("GitHub API rate limit or large file detected. Attempting to load folder content instead.");
                loadFiles(newUrl, windowElement, newFile);
                return;
            }
        };
        xhttp.onerror = function() {
            fileContentDiv.innerHTML = "<div class='fileerror'>Couldn't load files.<br>Click to try again.</div>";
            const fileErrorElem = fileContentDiv.querySelector(".fileerror");
            if (fileErrorElem) {
                fileErrorElem.setAttribute("onclick", `loadFiles('${url}', getParent(this, 'window'))`);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }


    function getFileObj(obj, file) {
        for (var elem in obj) {
            if (obj[elem] && obj[elem].name == file) {
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

    function getType(extension) {
        for (var obj in types) {
            for (var i = 0; i < types[obj].length; i += 2) {
                if (types[obj][i] == extension) {
                    return [obj, types[obj][i + 1]];
                }
            }
        }
        return ["doc", `<span class='yell'>${extension}</span> file`];
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
        return round(bytes / 1e9, 1) + " GB";
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

        if (url) {
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
        createWindow(id, 200, 100, 800, 600, url); // Pass URL to createWindow for iframe content
    }

    function loadFilesRelay(elem, url) {
        const windowElement = getParent(elem, 'window');
        if (windowElement) {
            loadFiles(url, windowElement);
        }
    }

    function moveUp(elem) {
        var windowElement = getParent(elem, "window");
        if (!windowElement) return;

        const winIndex = windows.indexOf(windowElement);
        if (winIndex === -1) return;
        const winState = windows[winIndex];

        const pathInput = windowElement.querySelector('.path');
        if (!pathInput) return;

        var pathSplit = pathInput.value.split("\\");
        if (pathSplit.length <= 2) { // Cannot go up from root P:\repo
            return;
        }
        var newPath = pathSplit.slice(0, -1).join("\\");

        // Check if newPath is in history
        const prevHistoryUrl = winState.history[winState.histPointer - 2];
        const prevHistoryPath = winState.history[winState.histPointer - 1];

        if (prevHistoryPath === newPath) {
            moveHist(windowElement, -1);
        } else {
            parseGeneralURL(windowElement, newPath);
        }
    }

    function consoleOpenWin(str) {
        var origStr = str;
        str = str.toLowerCase();
        if (!str.startsWith("http")) {
            for (var i = 0; i < programData.length; i++) {
                if (programData[i] && programData[i].name && programData[i].name.toLowerCase() == str) {
                    if (programData[i].name.toLowerCase() === "settings") {
                        toggleSettingsWindow();
                        return;
                    }
                    createWindow(i);
                    return;
                }
            }
            openPopup("Program Launch Error", "There is no program with name '" + str + "' on this device.");
        } else {
            // Handle opening external URLs directly or in viewer/explorer
            if (str.endsWith(".html") && str.includes("picturelements.github.io")) {
                createWindow(viewerID, 200, 100, 800, 600, origStr); // Use viewer for HTML
            } else {
                createWindow(explorerID, 200, 100, 800, 600, origStr); // Use explorer for other URLs
            }
        }
    }

    function randWifi() {
        // This was for an old wifi icon with levels, not present in new HTML
        // If you add a wifi icon, you'd update its level here.
        // For now, it's a no-op.
    }
    setInterval(randWifi, 3000); // Keep interval for future use if needed

    function setIcon(obj, elem) {
        if (!elem) return;

        if (obj.url != undefined) {
            elem.style.backgroundImage = "url('images/win_icons/" + obj.url + ".png')";
        } else if (obj.svg != undefined) {
            const svgBuffer = document.getElementById("svgbuffer");
            if (svgBuffer) {
                var svgHtml = svgBuffer.querySelector(`.${obj.svg}`) ? svgBuffer.querySelector(`.${obj.svg}`).outerHTML : '';
                elem.innerHTML = svgHtml;
            }
        } else if (obj.file != undefined) {
            // For file-type icons, apply generic file icon class
            elem.style.backgroundImage = `url('images/win_icons/file_${obj.file}.png')`; // Example generic file icon
        }
    }

    // --- Time & Date Functions ---
    function updateClock() {
        const currentTimeElement = document.getElementById('current-time');
        if (currentTimeElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            currentTimeElement.textContent = `${hours}:${minutes}`;
        }
    }

    function getOffset() {
        var dt = new Date();
        var dt2 = new Date(),
            roundedDate = Math.floor((dt.getTime() - 60000 * dt2.getTimezoneOffset()) / 86400000) * 86400000;
        if (datesetInput) {
            return new Date(datesetInput.value).getTime() - roundedDate;
        }
        return 0;
    }

    function setTime() {
        var dt = new Date();
        var offset = getOffset() / 60000;
        var index = timezoneSelect ? timezoneSelect.selectedIndex : 0;

        if (index == 0) {
            tzOffset = offset;
        } else if (index == 1) {
            tzOffset = prectzInput ? parseInt(prectzInput.value) + offset : offset;
        } else {
            tzOffset = (index - 16 + dt.getTimezoneOffset() / 60) * 60 + offset;
        }

        newTime();
        localStorage.setItem("tzIndex", index);
        localStorage.setItem("tzOffset", tzOffset);
    }

    function updateTimezonePreciseInput() {
        if (timezoneSelect && prectzInput) {
            if (timezoneSelect.selectedIndex == 1) {
                prectzInput.removeAttribute("disabled");
            } else {
                prectzInput.setAttribute("disabled", "");
            }
        }
        tzIndex = timezoneSelect ? timezoneSelect.selectedIndex : 0;
        newTime();
    }

    function newTime() {
        var dt = new Date();
        dt.setTime(dt.getTime() + tzOffset * 60000);
        var month = dt.getMonth() + 1,
            day = dt.getDate(),
            hour = dt.getHours(),
            minute = dt.getMinutes();

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
        if (tzlblSpan) tzlblSpan.innerHTML = `Current time: ${dt.toLocaleString()} (${dateStr})`;
    }

    function updateSize(id) {
        const slider = id === 0 ? winWSlider : winHSlider;
        const display = id === 0 ? winWDisplay : winHDisplay;
        if (!slider || !display) return;

        var val = parseInt(slider.value);
        if (id == 0) {
            DEF_WIN_W = val;
        } else {
            DEF_WIN_H = val;
        }
        display.textContent = val;
        localStorage.setItem("winW", DEF_WIN_W);
        localStorage.setItem("winH", DEF_WIN_H);
    }


    // --- Initialization and Event Listeners ---
    setup(); // Initial setup of desktop icons and permanent taskbar icons
    updateClock(); // Initial clock update
    setInterval(updateClock, 1000); // Update time every second

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
        if (settingsWindow && !settingsWindow.contains(event.target) && (!startMenuSettingsButton || !startMenuSettingsButton.contains(event.target))) {
            settingsWindow.classList.add('hidden');
        }
        if (powerMenu && !powerMenu.contains(event.target) && (!taskbarPowerButton || !taskbarPowerButton.contains(event.target)) && (!startMenuPowerButton || !startMenuPowerButton.contains(event.target))) {
            powerMenu.classList.add('hidden');
        }
        if (notificationArea && !notificationArea.contains(event.target) && (!notificationAreaToggle || !notificationAreaToggle.contains(event.target))) {
            notificationArea.classList.add('hidden');
        }
        if (volumeSliderContainer && !volumeSliderContainer.contains(event.target) && (!volumeIcon || !volumeIcon.contains(event.target))) {
            volumeSliderContainer.classList.add('hidden');
        }
        if (contextMenu) contextMenu.style.display = 'none'; // Hide context menu
    });

    // --- Attach all event listeners ---
    if (startButton) startButton.addEventListener('click', toggleStartMenu);
    if (closeStartMenuBtn) closeStartMenuBtn.addEventListener('click', toggleStartMenu);
    if (searchButton) searchButton.addEventListener('click', toggleSearchOverlay);
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);

    if (taskbarPowerButton) {
        taskbarPowerButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from closing it immediately
            togglePowerMenu();
        });
    }
    if (restartBtn) restartBtn.addEventListener('click', () => confirmRestartShutdown('restart'));
    if (shutdownBtn) shutdownBtn.addEventListener('click', () => confirmRestartShutdown('shut down'));

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
    if (volumeSlider) volumeSlider.addEventListener('input', updateVolume);

    // Settings Window Listeners
    if (startMenuSettingsButton) {
        startMenuSettingsButton.addEventListener('click', () => {
            toggleStartMenu(); // Close start menu
            toggleSettingsWindow();
        });
    }
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', toggleSettingsWindow);
    settingsSidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section') + '-section'; // Append '-section'
            showSettingsSection(sectionId);
        });
    });

    if (lightModeBtn) lightModeBtn.addEventListener('click', () => toggleLightDarkMode('light'));
    if (darkModeBtn) darkModeBtn.addEventListener('click', () => toggleLightDarkMode('dark'));
    if (taskbarTransparencySlider) taskbarTransparencySlider.addEventListener('input', updateTaskbarTransparency);
    if (alignLeftBtn) alignLeftBtn.addEventListener('click', () => setTaskbarAlignment('left'));
    if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => setTaskbarAlignment('center'));
    if (lockTaskbarCheckbox) lockTaskbarCheckbox.addEventListener('change', toggleLockTaskbar);
    if (lockTaskbahCheckbox) lockTaskbahCheckbox.addEventListener('change', toggleTaskbahSound);

    if (datesetInput) datesetInput.addEventListener('change', setTime);
    if (timezoneSelect) timezoneSelect.addEventListener('change', updateTimezonePreciseInput);
    if (prectzInput) prectzInput.addEventListener('change', setTime);
    if (winWSlider) winWSlider.addEventListener('input', () => updateSize(0));
    if (winHSlider) winHSlider.addEventListener('input', () => updateSize(1));

    if (resetNamesBtn) resetNamesBtn.addEventListener('click', resetNames);
    if (resetAllBtn) resetAllBtn.addEventListener('click', resetAll);

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

    // Initial setup calls
    setup();
    updateTaskbar(); // Initial taskbar setup
    loadSettingsPanelValues(); // Load settings values on startup
}); // End DOMContentLoaded