const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

// Give Windows a unique identity for InvoiceLite
if (process.platform === "win32") {
    app.setAppUserModelId("com.invoicelite.app");
}

function createWindow() {
    const iconPath = path.join(__dirname, "assets", "invoicelite.ico");

    console.log("Icon path:", iconPath);
    console.log("Icon exists:", fs.existsSync(iconPath));

    const window = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,

        title: "InvoiceLite",

        webPreferences: {
            contextIsolation: true
        }
    });

    // Explicitly set the Windows window icon
    if (process.platform === "win32" && fs.existsSync(iconPath)) {
        window.setIcon(iconPath);
    }

    window.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});