import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { parse } from './cloud'
import * as THREE from 'three'
import icon from '../../resources/icon.png?asset'
import ros from 'rosnodejs'
import Subscriber from 'rosnodejs/dist/lib/Subscriber'
import { exo } from './tf2'

/**
 * Electron
 */
function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ros.initNode('/ares_electron_gui').then((nh) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sub: Subscriber<'sensor_msgs/PointCloud2'> = nh.subscribe(
      '/cloud',
      'sensor_msgs/PointCloud2',
      (msg) => {
        const cloud_mesh: THREE.Points = parse(msg)
        mainWindow.webContents.send('cloud', cloud_mesh.toJSON())
      }
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sub2: Subscriber<'tf2_msgs/TFMessage'> = nh.subscribe(
      '/tf',
      'tf2_msgs/TFMessage',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (msg: any) => {
        // eslint-disable-next-line prettier/prettier
        if (msg.transforms[0].header.frame_id === 'map' && msg.transforms[0].child_frame_id === 'base_link') {
          mainWindow.webContents.send('tf_static', msg.transforms[0])
        }
      }
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sub3: Subscriber<'geometry_msgs/TransformStamped'> = nh.subscribe(
      '/cmd_vel',
      'geometry_msgs/Twist',
      (msg) => {
        //  mainWindow.webContents.send('cmd_vel', msg)
        mainWindow.webContents.send('cmd_vel', msg)
      }
    )
    // erc-odomerty-node
    console.log('sub4')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sub4 : Subscriber<'geometry_msgs/TransforStamped'> = nh.subscribe(
      '/ground_truth',
      (msg) => {
        const cloud_mesh: THREE.Points = parse(msg)
        console.log(cloud_mesh.toJSON())
        mainWindow.webContents.send('erc', cloud_mesh.toJSON())
      }
    )

    exo(nh)
    //find()
  })
  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
