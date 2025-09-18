import * as sticks from './ControlStick.js'

const stick = new sticks.ControlStick8()
stick.div.id = 'stick'
document.body.appendChild(stick.div)

const player = document.createElement('div')
player.id = 'player'
document.body.appendChild(player)

function update() {
    const d = stick.state.direction
    if (d !== 'neutral') {
        let dx = d.includes('right') ? 1 : (d.includes('left') ? -1 : 0)
        let dy = d.includes('down') ? 1 : (d.includes('up') ? -1 : 0)
        dx *= 5 * stick.state.magnitude
        dy *= 5 * stick.state.magnitude
        const rect = player.getBoundingClientRect()
        player.style.left = rect.left + dx + 'px'
        player.style.top = rect.top + dy + 'px'
    }
}

setInterval(update, 20)