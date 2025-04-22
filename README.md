# Prompt Selector

A simple desktop app for storing and quickly accessing text snippets and prompts. Great for anyone who regularly reuses text templates.

## Features

- Store prompts in one place and copy them with a single click
- Add, edit, and delete your prompts
- Dark/Light mode toggle
- Keyboard shortcuts for faster usage
- Desktop shortcut integration

## Keyboard Shortcuts

| Shortcut   | Action                  |
| ---------- | ----------------------- |
| `Ctrl+C` | Copy selected prompt    |
| `Ctrl+D` | Toggle dark/light mode  |
| `1-9`    | Select prompt by number |

## Project Structure

```
prompt-selector/
├── src/
│   ├── css/         # Styles
│   ├── js/          # App logic
│   └── html/        # Page templates
├── package.json     # Dependencies & scripts
├── index.js         # App entry point
└── create-shortcut.js  # Creates desktop shortcut
```

## Setup Instructions

1. **Prerequisites**

   - Node.js installed on your computer
   - A terminal/command prompt
2. **Installation**

   ```
   # Clone the repo
   git clone https://github.com/yourusername/prompt-selector.git
   cd prompt-selector

   # Install dependencies
   npm install

   # Run the app
   npm start
   ```
3. **Desktop Shortcut (Optional)**

   ```
   npm run make-desktop-shortcut
   ```

That's it! The app stores your prompts in your user data folder. Click "Manage Prompts" to add new ones.
