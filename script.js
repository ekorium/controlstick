import ControlStick from './ControlStick.js'
import * as utils from './utils.js'

function stringifyState(state) {
    let string = `z: ${state.z}`
    string += `<br>nx: ${state.nx.toFixed(3)}<br>ny: ${state.ny.toFixed(3)}`
    string += `<br>norm: ${state.norm.toFixed(3)}<br>magnitude: ${state.magnitude.toFixed(3)}`
    string += `<br>dir4: ${JSON.stringify(state.xy4)} (${utils.stringifyXY8(state.xy4)})`
    string += `<br>dir8: ${JSON.stringify(state.xy8)} (${utils.stringifyXY8(state.xy8)})`
    return string
}

window.addEventListener('load', () => {

    const info = document.createElement('div')
    const stick = new ControlStick(0.1, 1.5)
    const knob = stick.createKnob(1.0)
    const player = document.createElement('div')
    
    info.id = 'info'
    stick.id = 'stick'
    knob.id = 'knob'
    player.id = 'player'

    document.body.appendChild(info)
    document.body.appendChild(stick)
    document.body.appendChild(player)

    let playerX = 100
    let playerY = 150
    
    function update(time, dt = 0) {
        const {nx, ny, magnitude} = stick.state
        info.innerHTML = stringifyState(stick.state)
        playerX += 0.25 * dt * nx * magnitude
        playerY += 0.25 * dt * ny * magnitude
        playerX = utils.clamp(playerX, 0, window.innerWidth - 100)
        playerY = utils.clamp(playerY, 0, window.innerHeight - 100)
        player.style.transform = `translate(${playerX}px, ${playerY}px)`
        requestAnimationFrame((nextTime) => update(nextTime, nextTime - time))
    }
    
    update(performance.now())
})