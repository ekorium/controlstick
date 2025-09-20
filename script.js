import ControlStick from './ControlStick.js'
import * as utils from './utils.js'

function stringifyState(state) {
    let string = `nx: ${state.nx.toFixed(3)}<br>ny: ${state.ny.toFixed(3)}`
    string += `<br>norm: ${state.norm.toFixed(3)}<br>magnitude: ${state.magnitude.toFixed(3)}`
    string += `<br>dir4: ${JSON.stringify(state.dir4)} (${utils.stringifyDir8(state.dir4)})`
    string += `<br>dir8: ${JSON.stringify(state.dir8)} (${utils.stringifyDir8(state.dir8)})`
    return string
}

const info = document.createElement('div')
info.id = 'info'
info.innerHTML = stringifyState(ControlStick.DEFAULT_STATE)
document.body.appendChild(info)
const stick = new ControlStick({useEvents: true, maxzone: 1.5, knobzone: 1.2})
stick.div.id = 'stick'
document.body.appendChild(stick.div)
const knob = stick.createKnob()
knob.id = 'knob'
const player = document.createElement('div')
player.id = 'player'
document.body.appendChild(player)

function render() {
    player.style.transform = `translate(${playerX}px, ${playerY}px)`
}

let playerX = 100
let playerY = 150
render()

stick.on('stickmove', (state) => {
    info.innerHTML = stringifyState(state)
    const {nx, ny, magnitude} = state
    playerX += 4 * nx * magnitude
    playerY += 4 * ny * magnitude
    playerX = utils.clamp(playerX, 0, window.innerWidth - 100)
    playerY = utils.clamp(playerY, 0, window.innerHeight - 100)
    requestAnimationFrame(render)
})

stick.on('stickup', (state) => {
    info.innerHTML = stringifyState(state)
})