import { ProgressCanvas } from './progress-canvas'
import { mountProgressCanvas } from './mount'

window.ProgressCanvas = ProgressCanvas
window.mountProgressCanvas = mountProgressCanvas

if (window.ProgressCanvasCallbacks) {
  window.ProgressCanvasCallbacks.forEach((callback) => {
    if (typeof callback === 'function') {
      callback(window.ProgressCanvas, window.mountProgressCanvas)
    }
  })
}
