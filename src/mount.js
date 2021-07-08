import { ProgressCanvas } from './progress-canvas'

export function mountProgressCanvas(elementOrSelector) {
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

  new ProgressCanvas(element)
}
