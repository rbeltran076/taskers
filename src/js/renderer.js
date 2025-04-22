const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Prompt Selector is ready!');
  
  // UI Elements
  const buttonContainer = document.getElementById('button-container');
  const textDisplay = document.getElementById('text-display');
  const copyButton = document.getElementById('copy-button');
  const managePromptsButton = document.getElementById('manage-prompts-button');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  // State variables
  let selectedPrompt = null;
  let prompts = [
    { title: 'Button 1', content: 'This is the content for Button 1' },
    { title: 'Button 2', content: 'This is the content for Button 2' },
    { title: 'Button 3', content: 'This is the content for Button 3' },
    { title: 'Button 4', content: 'This is the content for Button 4' },
    { title: 'Button 5', content: 'This is the content for Button 5' }
  ];
  
  // Initialize
  renderButtons();
  updateButtonListeners();
  loadThemePreference();
  
  // Function to render buttons
  function renderButtons() {
    buttonContainer.innerHTML = '';
    
    prompts.forEach(prompt => {
      const button = document.createElement('button');
      button.classList.add('prompt-button');
      button.dataset.content = prompt.content; // Store content in data attribute
      button.textContent = prompt.title;
      buttonContainer.appendChild(button);
    });
  }
  
  // Function to update button event listeners
  function updateButtonListeners() {
    const promptButtons = document.querySelectorAll('.prompt-button');
    
    promptButtons.forEach(button => {
      button.addEventListener('click', () => {
        selectButton(button);
      });
    });
  }
  
  // Function to select a button
  function selectButton(button) {
    // Update selected button reference
    selectedPrompt = button;
    
    // Remove selected class from all buttons
    document.querySelectorAll('.prompt-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Add selected class to clicked button
    button.classList.add('selected');
    
    // Display the button content in the right panel
    textDisplay.textContent = button.dataset.content;
  }
  
  // Manage prompts button functionality
  managePromptsButton.addEventListener('click', () => {
    console.log('Manage Prompts button clicked');
    // Open the prompt manager window
    ipcRenderer.send('open-prompt-manager');
  });
  
  // Dark mode toggle functionality
  darkModeToggle.addEventListener('click', () => {
    // Toggle dark/light theme
    const isDarkMode = document.body.classList.contains('dark-theme');
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      saveThemePreference('light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      saveThemePreference('dark');
    }
    
    // Notify main process to update other windows
    ipcRenderer.send('theme-changed', !isDarkMode);
  });
  
  // Save theme preference to localStorage
  function saveThemePreference(theme) {
    localStorage.setItem('theme', theme);
  }
  
  // Load theme preference from localStorage
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
  
  // Listen for button updates from the prompt manager
  ipcRenderer.on('buttons-updated', (event, updatedPrompts) => {
    console.log('Received updated prompts:', updatedPrompts);
    
    // Update our prompts
    prompts = updatedPrompts;
    
    // Render the updated buttons
    renderButtons();
    
    // Add event listeners
    updateButtonListeners();
    
    // Clear selection
    selectedPrompt = null;
    textDisplay.textContent = 'Select a button to display its text here.';
  });
  
  // Listen for theme updates from other windows
  ipcRenderer.on('theme-update', (event, isDarkMode) => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      saveThemePreference('dark');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      saveThemePreference('light');
    }
  });
  
  // Add copy functionality
  copyButton.addEventListener('click', () => {
    if (textDisplay.textContent === 'Select a button to display its text here.') {
      return; // Nothing to copy
    }
    
    // Copy the text using clipboard API
    navigator.clipboard.writeText(textDisplay.textContent).then(() => {
      // Provide visual feedback
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      
      // Show success message
      const successMessage = document.querySelector('.success-message') || createSuccessMessage();
      successMessage.textContent = 'Copied to clipboard!';
      successMessage.classList.add('show');
      
      // Reset button text and hide message after short delay
      setTimeout(() => {
        copyButton.textContent = originalText;
        successMessage.classList.remove('show');
      }, 1500);
    });
  });
  
  // Create success message element if it doesn't exist
  function createSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    document.body.appendChild(successMessage);
    return successMessage;
  }
  
  // Add keyboard shortcut functionality
  document.addEventListener('keydown', (e) => {
    // Copy shortcut (Ctrl+C or Cmd+C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      if (copyButton) copyButton.click();
    }
    
    // Toggle dark mode (Ctrl+D or Cmd+D)
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); // Prevent browser's default bookmark action
      if (darkModeToggle) darkModeToggle.click();
    }
    
    // Number keys 1-9 to select prompts
    if (!isNaN(parseInt(e.key)) && e.key >= '1' && e.key <= '9' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      const buttons = document.querySelectorAll('.prompt-button');
      const index = parseInt(e.key) - 1;
      if (index < buttons.length) {
        buttons[index].click();
      }
    }
  });
  
  // Add tooltips to buttons
  copyButton.setAttribute('data-tooltip', 'Copy to clipboard (Ctrl+C)');
  copyButton.classList.add('tooltip');
  darkModeToggle.setAttribute('data-tooltip', 'Toggle dark mode (Ctrl+D)');
  darkModeToggle.classList.add('tooltip');
}); 