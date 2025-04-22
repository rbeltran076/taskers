const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Get the current directory
const appDir = process.cwd();
const desktopDir = path.join(os.homedir(), 'Desktop');
const appName = 'Prompt Selector';

// Windows shortcut creation
if (process.platform === 'win32') {
    const shortcutPath = path.join(desktopDir, `${appName}.lnk`);
    const nodePath = process.execPath;
    const electronPath = path.join(appDir, 'node_modules', 'electron', 'dist', 'electron.exe');
    
    // Create a Windows shortcut file using PowerShell
    const ps = `
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
    $Shortcut.TargetPath = "${electronPath.replace(/\\/g, '\\\\')}"
    $Shortcut.Arguments = "${appDir.replace(/\\/g, '\\\\')}"
    $Shortcut.WorkingDirectory = "${appDir.replace(/\\/g, '\\\\')}"
    $Shortcut.IconLocation = "${electronPath.replace(/\\/g, '\\\\')}"
    $Shortcut.Description = "Launch ${appName}"
    $Shortcut.Save()
    `;
    
    try {
        fs.writeFileSync('create-shortcut.ps1', ps);
        execSync('powershell -ExecutionPolicy Bypass -File create-shortcut.ps1');
        fs.unlinkSync('create-shortcut.ps1');
        console.log(`Shortcut created successfully at ${shortcutPath}`);
    } catch (error) {
        console.error('Error creating shortcut:', error);
    }
}
// macOS shortcut creation
else if (process.platform === 'darwin') {
    console.log('macOS shortcut creation not implemented yet');
}
// Linux shortcut creation
else if (process.platform === 'linux') {
    console.log('Linux shortcut creation not implemented yet');
}
else {
    console.log('Unsupported platform for shortcut creation');
} 