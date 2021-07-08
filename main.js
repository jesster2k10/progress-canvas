import { mountProgressCanvas } from './src/mount'
import './style.css'

mountProgressCanvas('.js-progress-canvas', {
  width: 205,
  height: 205,
  radius: 100,
  maxWidth: 390,
  title: 'Less Sugar More Life',
  trackColor: 'white',
  fillColor: '#0a2947',
  borderColor: '#0a2947',
  borderWidth: 2,
  startAnimatingFraction: 10,
  blocks: [
    {
      message: 'Reduce\n sugar\n cravings',
      position: 'top-right',
      animateWhenProgress: 1,
    },
    {
      message: 'Support healthy\n blood sugar',
      position: 'bottom-center',
      animateWhenProgress: 50,
    },
    {
      message: 'Kickstart\n healthy\n habits',
      position: 'top-left',
      animateWhenProgress: 75,
    },
  ],
})
