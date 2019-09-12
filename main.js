// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const shell = require('electron').shell;
const globalShortcut = require('electron').globalShortcut
const url = require('url');
var fs = require('fs');
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;

function createWindow() {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: false, // 不集成 Nodejs
      webSecurity: false,
      resizable:false,
      devTools: true,
      preload: path.join(__dirname, './public/renderer.js'), // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
    },
  });
  const template = [
    // { role: 'appMenu' }
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },

        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
        },
      ],
    },
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          click() {
            mainWindow.webContents.send('new');
          },
          accelerator: 'CmdOrCtrl+N',
        },
        {
          label: '打开',
          click() {
            mainWindow.webContents.send('open');
          },
          accelerator: 'CmdOrCtrl+O',
        },
        {
          label: '保存',
          click() {
            mainWindow.webContents.send('save');
          },
          accelerator: 'CmdOrCtrl+S',
        },
      ],
    },
    {
      label: '开发者工具',
      submenu: [
        {
          label: '新建',
          click() {
            mainWindow.webContents.openDevTools();
          },
          accelerator: 'CmdOrCtrl+I',
        },
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://github.com/hoc2019');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  /* 
   * 加载应用-----  electron-quick-start中默认的加载入口
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  */
  // 加载应用----适用于 react 项目
  mainWindow.loadURL('http://localhost:3000/');

  // 打开开发者工具，默认不打开
  mainWindow.webContents.openDevTools();

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  globalShortcut.register('Cmd+D',()=>{
    console.log('fuzhi')
    mainWindow.webContents.send('copyline');
  })

}

app.on('ready', createWindow);

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function() {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});
