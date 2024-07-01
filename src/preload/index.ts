import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      onCloud: (callback) => ipcRenderer.on('cloud', (_, cloud) => callback(cloud)),
      onTFStatic: (callback) => ipcRenderer.on('tf_static', (_, tf_static) => callback(tf_static)),
      oncmdVel: (callback) => ipcRenderer.on('cmd_vel', (_, cmd_vel) => callback(cmd_vel)),
      onERC: (callback) => ipcRenderer.on('erc', (_, erc) => callback(erc))
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
