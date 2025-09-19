import ControlStick from './ControlStick.js'
import * as utils from './utils.js'

const stick = new ControlStick()
stick.div.id = 'stick'
document.body.appendChild(stick.div)

const player = document.createElement('div')
player.id = 'player'
document.body.appendChild(player)

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

stick.on('stickmove', (state) => {
    const [dx, dy] = utils.normalizeDir8(state.dir8, 4 * state.magnitude)
    const rect = player.getBoundingClientRect()
    const border = 10
    const limX = window.innerWidth - rect.width - border
    const limY = window.innerHeight - rect.height - border
    player.style.left = clamp(rect.left + dx, border, limX) + 'px'
    player.style.top = clamp(rect.top + dy, border, limY) + 'px'
})