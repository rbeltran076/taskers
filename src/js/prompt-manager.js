const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Prompt Manager is ready!');
  
  // UI Elements
  const promptList = document.getElementById('prompt-list');
  const promptTitle = document.getElementById('prompt-title');
  const promptText = document.getElementById('prompt-text');
  const addButton = document.getElementById('add-button');
  const updateButton = document.getElementById('update-button');
  const deleteButton = document.getElementById('delete-button');
  const saveButton = document.getElementById('save-button');
  
  // State
  let promptItems = [];
  let selectedPromptIndex = -1;
  
  // Initialize: Get button data from main window
  initPromptsList();
  loadThemePreference();
  
  // Function to load theme preference from localStorage
  function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }
  
  function initPromptsList() {
    console.log('Initializing prompts list');
    
    // Default values if no buttons exist yet
    promptItems = [
      { title: 'Button 1', content: 'This is the content for Button 1' },
      { title: 'Button 2', content: 'This is the content for Button 2' },
      { title: 'Button 3', content: 'This is the content for Button 3' },
      { title: 'Button 4', content: 'This is the content for Button 4' },
      { title: 'Button 5', content: 'This is the content for Button 5' }
    ];
    
    // Request button data from main process
    ipcRenderer.send('get-button-data');
    
    // Render the prompt list with default values initially
    renderPromptList();
  }
  
  // Listen for button data from the main process
  ipcRenderer.on('button-data', (event, buttonData) => {
    console.log('Received button data:', buttonData);
    if (buttonData && buttonData.length > 0) {
      promptItems = buttonData;
      renderPromptList();
    }
  });
  
  // Listen for theme updates
  ipcRenderer.on('theme-update', (event, isDarkMode) => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Render the prompt list
  function renderPromptList() {
    promptList.innerHTML = '';
    
    promptItems.forEach((prompt, index) => {
      const promptItem = document.createElement('div');
      promptItem.classList.add('prompt-item');
      promptItem.textContent = prompt.title;
      
      if (index === selectedPromptIndex) {
        promptItem.classList.add('selected');
      }
      
      promptItem.addEventListener('click', () => {
        selectPrompt(index);
      });
      
      promptList.appendChild(promptItem);
    });
  }
  
  // Select a prompt
  function selectPrompt(index) {
    selectedPromptIndex = index;
    
    // Update the form with the selected prompt data
    promptTitle.value = promptItems[index].title;
    promptText.value = promptItems[index].content;
    
    // Update the UI
    renderPromptList();
  }
  
  // Add a new prompt
  addButton.addEventListener('click', () => {
    const title = promptTitle.value.trim();
    const content = promptText.value.trim();
    
    if (title && content) {
      promptItems.push({
        title: title,
        content: content
      });
      
      selectedPromptIndex = promptItems.length - 1;
      
      // Update the UI
      renderPromptList();
      
      // Clear the inputs
      promptTitle.value = '';
      promptText.value = '';
    }
  });
  
  // Update a prompt
  updateButton.addEventListener('click', () => {
    const title = promptTitle.value.trim();
    const content = promptText.value.trim();
    
    if (selectedPromptIndex >= 0 && title && content) {
      promptItems[selectedPromptIndex] = {
        title: title,
        content: content
      };
      
      // Update the UI
      renderPromptList();
    }
  });
  
  // Delete a prompt
  deleteButton.addEventListener('click', () => {
    if (selectedPromptIndex >= 0) {
      // Remove the selected prompt
      promptItems.splice(selectedPromptIndex, 1);
      
      // Update selection
      if (promptItems.length === 0) {
        selectedPromptIndex = -1;
      } else if (selectedPromptIndex >= promptItems.length) {
        selectedPromptIndex = promptItems.length - 1;
      }
      
      // Update the UI
      renderPromptList();
      
      // Clear the inputs if no selection
      if (selectedPromptIndex === -1) {
        promptTitle.value = '';
        promptText.value = '';
      } else {
        promptTitle.value = promptItems[selectedPromptIndex].title;
        promptText.value = promptItems[selectedPromptIndex].content;
      }
    }
  });
  
  // Save and close
  saveButton.addEventListener('click', () => {
    console.log('Saving and closing. Prompts:', promptItems);
    // Send the updated prompts to the main process
    ipcRenderer.send('update-buttons', promptItems);
    
    // Close the window
    window.close();
  });
}); 