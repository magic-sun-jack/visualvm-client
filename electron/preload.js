import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  startJavaService: () => ipcRenderer.invoke('start-java-service'),
  checkJavaService: () => ipcRenderer.invoke('check-java-service'),
  onJavaServiceStatus: (callback) => {
    ipcRenderer.on('java-service-status', (_, status) => callback(status))
  },
  exitApp: () => ipcRenderer.invoke('exit-app')
})
