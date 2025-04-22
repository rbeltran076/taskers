const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep global references to prevent garbage collection
let mainWindow;
let promptManagerWindow;

// Define the path for the prompts file
const promptsFilePath = path.join(app.getPath('userData'), 'prompts.json');

// Store current buttons for sharing between windows
let currentPrompts = [
  { title: 'Button 1', content: 'This is the content for Button 1' },
  { title: 'Button 2', content: 'This is the content for Button 2' },
  { title: 'Button 3', content: 'This is the content for Button 3' },
  { title: 'Button 4', content: 'This is the content for Button 4' },
  { title: 'Button 5', content: 'This is the content for Button 5' }
];

// Track dark mode state
let isDarkMode = false;

// Load prompts from file if it exists
function loadPromptsFromFile() {
  try {
    if (fs.existsSync(promptsFilePath)) {
      const fileContent = fs.readFileSync(promptsFilePath, 'utf8');
      const loadedPrompts = JSON.parse(fileContent);
      console.log('Loaded prompts from file:', loadedPrompts);
      return loadedPrompts;
    }
  } catch (error) {
    console.error('Error loading prompts from file:', error);
  }
  
  // Return default prompts if file doesn't exist or there's an error
  return currentPrompts;
}

// Save prompts to file
function savePromptsToFile(prompts) {
  try {
    const jsonData = JSON.stringify(prompts, null, 2);
    fs.writeFileSync(promptsFilePath, jsonData, 'utf8');
    console.log('Prompts saved to:', promptsFilePath);
    return true;
  } catch (error) {
    console.error('Error saving prompts to file:', error);
    return false;
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, '../html/index.html'));

  // Uncomment this to open DevTools on startup
//   mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    // Close prompt manager if open
    if (promptManagerWindow && !promptManagerWindow.isDestroyed()) {
      promptManagerWindow.close();
    }
    mainWindow = null;
  });
}

function createPromptManagerWindow() {
  // Don't create multiple instances
  if (promptManagerWindow && !promptManagerWindow.isDestroyed()) {
    promptManagerWindow.focus();
    return;
  }

  console.log('Creating prompt manager window');

  // Create the prompt manager window
  promptManagerWindow = new BrowserWindow({
    width: 500,
    height: 500,
    parent: mainWindow,
    modal: false, // Changed to false for easier debugging
    title: 'Manage Prompts',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the prompt manager HTML
  promptManagerWindow.loadFile(path.join(__dirname, '../html/prompt-manager.html'));

  // Open DevTools for the prompt manager
//   promptManagerWindow.webContents.openDevTools();

  // Remove menu bar
  promptManagerWindow.setMenuBarVisibility(false);

  // Handle close
  promptManagerWindow.on('closed', () => {
    promptManagerWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Load prompts from file before creating the window
  currentPrompts = loadPromptsFromFile();
  
  createWindow();
  
  // Set up IPC handlers after window creation
  setupIpcHandlers();
});

function setupIpcHandlers() {
  // IPC handler for opening prompt manager
  ipcMain.on('open-prompt-manager', (event) => {
    console.log('Received open-prompt-manager message');
    createPromptManagerWindow();
  });

  // Get button data from the main window
  ipcMain.on('get-button-data', (event) => {
    console.log('Received get-button-data request');
    if (promptManagerWindow && !promptManagerWindow.isDestroyed()) {
      promptManagerWindow.webContents.send('button-data', currentPrompts);
    }
  });
  
  // Add handler for get-prompts request from renderer
  ipcMain.on('get-prompts', (event) => {
    console.log('Received get-prompts request from renderer');
    event.sender.send('receive-prompts', currentPrompts);
  });

  // Handle button updates from the prompt manager
  ipcMain.on('update-buttons', (event, prompts) => {
    console.log('Received updated prompts in main process:', prompts);
    
    // Update our stored prompts
    currentPrompts = prompts;
    
    // Save prompts to JSON file
    const saveResult = savePromptsToFile(prompts);
    console.log('Save result:', saveResult);
    
    // Send the updated prompts to the main window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('buttons-updated', prompts);
    }
  });
  
  // Handle theme changes
  ipcMain.on('theme-changed', (event, darkMode) => {
    console.log('Theme changed to dark mode:', darkMode);
    
    // Update the dark mode state
    isDarkMode = darkMode;
    
    // Propagate the theme change to the prompt manager window if it exists
    if (promptManagerWindow && !promptManagerWindow.isDestroyed()) {
      promptManagerWindow.webContents.send('theme-update', isDarkMode);
    }
  });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (mainWindow === null) createWindow();
}); 