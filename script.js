import * as sticks from './ControlStick.js'

const stick = new sticks.ControlStick8()
stick.div.id = 'stick'
document.body.appendChild(stick.div)

const player = document.createElement('div')
player.id = 'player'
document.body.appendChild(player)

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

stick.on('stickmove', (state) => {
    const d = state.direction
    if (d !== 'neutral') {
        let dx = d.includes('right') ? 1 : (d.includes('left') ? -1 : 0)
        let dy = d.includes('down') ? 1 : (d.includes('up') ? -1 : 0)
        const m = Math.sqrt(dx * dx + dy * dy)
        dx *= 4 * state.magnitude / m
        dy *= 4 * state.magnitude / m
        const rect = player.getBoundingClientRect()
        const border = 10
        const limX = window.innerWidth - rect.width - border
        const limY = window.innerHeight - rect.height - border
        player.style.left = clamp(rect.left + dx, border, limX) + 'px'
        player.style.top = clamp(rect.top + dy, border, limY) + 'px'
    }
})