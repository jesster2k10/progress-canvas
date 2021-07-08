import interpolate from 'interpolate-range'
import { css } from '@emotion/css'

/**
 * @typedef {object} ProgressCanvasBlock
 * @property {string} message
 * @property {'top-right' | 'bottom-center' | 'top-left'} position
 * @property {number} animateWhenProgress
 */

/**
 * @typedef {object} ClassNames
 * @property {string} block
 * @property {string} canvas
 * @property {string} overlay
 * @property {string} text
 * @property {string} container
 */

/**
 * @typedef {object} ProgressCanvasOptions
 * @property {number} width – the width of the canvas
 * @property {number} maxWidth – the width of the canvas
 * @property {number} height – the height of the canvas
 * @property {number} radius – the radius of he circle
 * @property {string} trackColor
 * @property {string} fillColor
 * @property {string} borderColor
 * @property {number} borderWidth
 * @property {number} startAnimatingFraction
 * @property {number} endAnimatingFraction
 * @property {string | undefined} title
 * @property {ProgressCanvasBlock[] | undefined} blocks
 * @property {ClassNames} classNames
 * @property {ClassNames} css
 */

export class ProgressCanvas {
  /** @type {ProgressCanvasOptions} */
  static defaultOptions = {
    width: 200,
    height: 200,
    radius: 70,
    maxWidth: '100%',
    trackColor: 'lightgrey',
    fillColor: 'green',
    borderColor: 'green',
    accentColor: 'red',
    borderWidth: 2,
    startAnimatingFraction: 10,
    endAnimatingFraction: 1.5,
    blocks: [],
    css: {},
    classNames: {},
  }

  /**
   * @param {HTMLDivElement} container
   * @param {ProgressCanvasOptions} options
   */
  constructor(container, options) {
    this.container = container
    this.options = {
      ...ProgressCanvas.defaultOptions,
      ...(options || {}),
    }
    this.createCanvas = this.createCanvas.bind(this)
    this.canvas = this.createCanvas()
    this.context = this.canvas.getContext('2d')
    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2
    this.radius = this.options.radius

    this.renderProgress = this.renderProgress.bind(this)
    this._renderCircle = this._renderCircle.bind(this)
    this.onScroll = this.onScroll.bind(this)
    this.setupIntersectionObserver = this.setupIntersectionObserver.bind(this)
    this.setupOverlayElements = this.setupOverlayElements.bind(this)

    this.renderProgress(0)
    this.setupOverlayElements()
    this.setupIntersectionObserver()

    this.container.classList.add(
      css`
        position: relative;
        max-width: ${typeof this.options.maxWidth === 'string'
          ? this.options.maxWidth
          : `${this.options.maxWidth}px`};
        margin-left: auto;
        margin-right: auto;
        ${this.options.css.container}
      `,
      this.options.classNames.container,
    )
  }

  get id() {
    return `ProgressCanvas-${new Date().getTime()}`
  }

  get activeBlockClass() {
    return css`
      opacity: 1;
      transform: translateY(0);
    `
  }

  onScroll() {
    const { scrollY } = window
    const rect = this.container.getBoundingClientRect()
    const offsetY = rect.top + scrollY
    const startAnimating = offsetY / this.options.startAnimatingFraction
    const endAnimating = offsetY / this.options.endAnimatingFraction
    const progress = interpolate({
      inputRange: [startAnimating, endAnimating],
      outputRange: [0, 100],
      clamp: true,
    })(scrollY)

    this.blocks.forEach(({ element, block }) => {
      const { animateWhenProgress } = block
      if (progress >= animateWhenProgress) {
        element.classList.add(this.activeBlockClass)
      } else {
        element.classList.remove(this.activeBlockClass)
      }
    })

    requestAnimationFrame(() => {
      this.renderProgress(progress)

      if (progress >= 75) {
        this.text.style.color = 'white'
      } else {
        this.text.style.color = this.options.fillColor
      }
    })
  }

  setupIntersectionObserver() {
    this.intersctionObserver = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        if (isIntersecting) {
          window.addEventListener('scroll', this.onScroll)
        } else {
          window.removeEventListener('scroll', this.onScroll)
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 0,
      },
    )

    this.intersctionObserver.observe(this.container)
  }

  setupOverlayElements() {
    this.text = document.createElement('p')
    this.text.classList.add(
      css`
        color: ${this.options.fillColor};
        max-width: ${this.options.radius * 1.5}px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        transition: all ease-in-out 100ms;
        ${this.options.css.text}
      `,
      this.options.classNames.text,
    )
    this.text.textContent = this.options.title

    this.blocks = this.options.blocks.map((block, index) => {
      const content = document.createElement('p')
      content.innerHTML = block.message.replace('\n', '<br>')
      content.classList.add(this.options.classNames.block)
      content.classList.add(css`
        position: absolute;
        font-size: 1.15rem;
        line-height: 1.5rem;
        font-weight: 600;
        text-align: left;
        display: flex;
        flex-direction: column;
        opacity: 0;
        width: min-content;
        white-space: nowrap;
        transition: all ease-in-out 100ms;
        transform: translateY(-10px);
        &:before {
          content: '${index + 1}.';
          color: ${this.options.accentColor};
          font-size: 2rem;
          line-height: 2rem;
          font-weight: bold;
          margin-right: 0.5rem;
          display: block;
        }

        ${this.options.css.block}
      `)

      this.container.appendChild(content)
      const height = content.getBoundingClientRect().height

      switch (block.position) {
        case 'top-left':
          content.classList.add(css`
            left: 0;
            top: -${height + 25}px;
            margin-left: 15px;
            text-align: right;
          `)
          break
        case 'top-right':
          content.classList.add(css`
            right: 0;
            top: -${height + 25}px;
            margin-right: 15px;
          `)
          break
        case 'bottom-center':
          content.classList.add(css`
            bottom: 0;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            bottom: -${height}px;
            flex-direction: row;
            align-self: center;
          `)
      }
      return {
        element: content,
        block,
      }
    })

    this.overlay = document.createElement('div')
    this.overlay.appendChild(this.text)
    this.overlay.classList.add(css`
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: ${this.options.radius * 2}px;
      ${this.options.css.overlay}
    `)
    this.overlay.classList.add(this.options.classNames.overlay)
    this.container.appendChild(this.overlay)
  }

  createCanvas() {
    let canvas = this.container.querySelector('canvas')
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.setAttribute('width', this.options.width)
      canvas.setAttribute('height', this.options.height)
      canvas.id = this.id
      this.container.appendChild(canvas)
    }
    canvas.classList.add(this.options.classNames.canvas)
    canvas.classList.add(
      css`
        ${this.options.css.canvas}
      `,
    )
    return canvas
  }

  renderProgress(percentage) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this._renderCircle({
      radius: this.radius + this.options.borderWidth - 1,
      fillColor: this.options.borderColor,
    })
    this._renderCircle({
      radius: this.radius - 1,
      fillColor: this.options.trackColor,
    })

    // draw the track
    const startAngle = 1.5 * Math.PI
    const unitValue = (Math.PI - 0.5 * Math.PI) / 25
    let endAngle

    if (percentage >= 0 && percentage <= 25) {
      endAngle = startAngle + percentage * unitValue
    } else if (percentage > 25 && percentage <= 50) {
      endAngle = startAngle + percentage * unitValue
    } else if (percentage > 50 && percentage <= 75) {
      endAngle = startAngle + percentage * unitValue
    } else if (percentage > 75 && percentage <= 100) {
      endAngle = startAngle + percentage * unitValue
    }

    this._renderCircle({
      startAngle,
      endAngle,
      fillColor: this.options.fillColor,
    })
  }

  _renderCircle({
    startAngle = 0,
    endAngle = 2 * Math.PI,
    cx = this.centerX,
    cy = this.centerY,
    x = this.centerX,
    y = this.centerY,
    radius = this.radius,
    fillColor,
  }) {
    this.context.beginPath()
    this.context.lineCap = 'round'
    this.context.moveTo(x, y)
    this.context.arc(cx, cy, radius, startAngle, endAngle, false)
    this.context.closePath()
    this.context.fillStyle = fillColor
    this.context.fill()
  }

  _clearCircle() {
    this.context.clerA
  }

  /**
   * @param {string} text
   * @param {number} maxWidth
   */
  _getLines(text, maxWidth) {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]

    words.forEach((word) => {
      const width = this.context.measureText(`${currentLine} word`).width
      if (width < maxWidth) {
        currentLine = `${currentLine} ${word}`
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    })

    lines.push(currentLine)
    return lines
  }
}
