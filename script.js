import ControlStick from './ControlStick.js'
import * as utils from './utils.js'

const stick = new ControlStick({useEvents: true, maxzone: 1.5, knobzone: 1.2})
stick.div.id = 'stick'
document.body.appendChild(stick.div)
const knob = stick.createKnob()
knob.id = 'knob'
const player = document.createElement('div')
player.id = 'player'
document.body.appendChild(player)

stick.on('stickmove', (state) => {
    const [dx, dy] = utils.normalizeDir8(state.dir8, 4 * state.magnitude)
    const rect = player.getBoundingClientRect()
    const border = 10
    const limX = window.innerWidth - rect.width - border
    const limY = window.innerHeight - rect.height - border
    player.style.left = utils.clamp(rect.left + dx, border, limX) + 'px'
    player.style.top = utils.clamp(rect.top + dy, border, limY) + 'px'
})