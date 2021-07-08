import { ProgressCanvas } from './progress-canvas'

/**
 * @param {string | HTMLDivElement} elementOrSelector
 * @param {import('./progress-canvas').ProgressCanvasOptions | undefined} options
 *
 * @returns {ProgressCanvas}
 */
export function mountProgressCanvas(elementOrSelector, options) {
  let element = elementOrSelector
  const isSelector = typeof elementOrSelector === 'string'

  if (isSelector) {
    element = document.querySelector(elementOrSelector)
  }

  if (!element) {
    console.warn(
      'Tried to mount progress canvas without valid element or selector',
    )
    return
  }

  return new ProgressCanvas(element, options)
}
