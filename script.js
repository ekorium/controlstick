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

let playerX = 0
let playerY = 0

function render() {
    player.style.transform = `translate(${playerX}px, ${playerY}px)`
}

stick.on('stickmove', (state) => {
    const {nx, ny, magnitude} = state
    playerX += 4 * nx * magnitude
    playerY += 4 * ny * magnitude
    playerX = utils.clamp(playerX, 0, window.innerWidth - 120)
    playerY = utils.clamp(playerY, 0, window.innerHeight - 120)
    requestAnimationFrame(render)
})