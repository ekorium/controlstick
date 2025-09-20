import ControlStick from './ControlStick.js'
import * as utils from './utils.js'

function stringifyState(state) {
    let string = `nx: ${state.nx.toFixed(3)}<br>ny: ${state.ny.toFixed(3)}`
    string += `<br>norm: ${state.norm.toFixed(3)}<br>magnitude: ${state.magnitude.toFixed(3)}`
    string += `<br>dir4: ${JSON.stringify(state.dir4)} (${utils.stringifyDir8(state.dir4)})`
    string += `<br>dir8: ${JSON.stringify(state.dir8)} (${utils.stringifyDir8(state.dir8)})`
    return string
}

window.addEventListener('load', () => {

    const info = document.createElement('div')
    const stick = new ControlStick({useEvents: true, maxzone: 1.5, knobzone: 1.2})
    const knob = stick.createKnob()
    const player = document.createElement('div')
    
    info.innerHTML = stringifyState(ControlStick.DEFAULT_STATE)
    info.id = 'info'
    stick.div.id = 'stick'
    knob.id = 'knob'
    player.id = 'player'

    document.body.appendChild(info)
    document.body.appendChild(stick.div)
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
})