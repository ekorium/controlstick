export default class ControlStick extends HTMLElement {

    constructor(deadZone = 0, maxZone = 1, autoUpdateRect = false) {
        super()
        this.deadZone = deadZone
        this.maxZone = maxZone
        this.autoUpdateRect = autoUpdateRect
        this.onpointerdown = this.pointerDown.bind(this)
        this.onpointermove = this.pointerMove.bind(this)
        this.onpointerup = this.pointerUp.bind(this)
        this.onpointercancel = this.pointerUp.bind(this)
        this.onlostpointercapture = this.pointerUp.bind(this)
        this.setActive(true)
        this.updateRect()
        this.reset()
    }

    connectedCallback() {
        this.updateRect()
    }

    setActive(active) {
        this.active = active
        if (active) {
            this.style.pointerEvents = 'auto'
        } else {
            this.style.pointerEvents = 'none'
            this.reset()
        }
    }

    updateRect() {
        const rect = this.getBoundingClientRect()
        const rx = rect.width / 2
        const ry = rect.height / 2
        const cx = rect.left + rx
        const cy = rect.top + ry
        this.rect = {rx, ry, cx, cy}
    }

    reset() {
        this.pointerId = null
        this.updateState(0, 0)
    }

    updateState(x, y) {
        if (this.autoUpdateRect) {
            this.updateRect()
        }
        const z = this.isPressed ? 1 : 0
        const {rx, ry, cx, cy} = this.rect
        const dx = (rx > 0 && z) ? (x - cx) / rx : 0
        const dy = (ry > 0 && z) ? (y - cy) / ry : 0
        const norm = Math.hypot(dx, dy)
        const nx = (norm > 0) ? dx / norm : 0
        const ny = (norm > 0) ? dy / norm : 0
        const magnitude = this.computeMagnitude(norm)
        const mx = Math.abs(dx)
        const my = Math.abs(dy)
        const s = (norm > this.deadZone) ? 1 : 0
        const sx = (dx < 0) ? -s : s
        const sy = (dy < 0) ? -s : s
        const xy4 = (mx > my) ? [sx, 0] : [0, sy]
        const xy8 = (mx > 2 * my || my > 2 * mx) ? xy4 : [sx, sy]
        this.state = {z, nx, ny, norm, magnitude, xy4, xy8}
        this.updateKnob()
    }

    get isPressed() {
        return this.pointerId !== null
    }

    computeMagnitude(norm) {
        if (norm <= this.deadZone) {
            return 0
        }
        if (norm >= this.maxZone) {
            return 1
        }
        return (norm - this.deadZone) / (this.maxZone - this.deadZone)
    }

    createKnob(knobZone = 1) {
        this.knobZone = knobZone
        if (!this.knob) {
            this.knob = document.createElement('div')
            this.knob.style.pointerEvents = 'none'
            this.knob.style.position = 'absolute'
            this.knob.style.left = '50%'
            this.knob.style.top = '50%'
            this.knob.style.transform = 'translate(-50%, -50%)'
            this.appendChild(this.knob)
            this.animateKnob = this.animateKnob.bind(this)
        }
        return this.knob
    }

    updateKnob() {
        if (this.knob) {
            if (!this.knobScheduled) {
                requestAnimationFrame(this.animateKnob)
            }
            this.knobScheduled = true
        }
    }

    animateKnob() {
        const c = Math.min(this.state.norm, this.knobZone)
        const mx = 50 * c * this.state.nx
        const my = 50 * c * this.state.ny
        this.knob.style.transform = `translate(${mx - 50}%, ${my - 50}%)`
        this.knobScheduled = false
    }

    on(type, callback) {
        const handler = (e) => callback(e.detail)
        this.addEventListener(type, handler)
        return () => this.removeEventListener(type, handler)
    }

    dispatch(type) {
        this.dispatchEvent(new CustomEvent(type, {detail: this.state}))
    }

    pointerDown(e) {
        if (this.active && !this.isPressed) {
            this.pointerId = e.pointerId
            this.setPointerCapture(e.pointerId)
            this.updateState(e.clientX, e.clientY)
            this.dispatch('stickdown')
        }
    }

    pointerMove(e) {
        if (e.pointerId === this.pointerId) {
            this.updateState(e.clientX, e.clientY)
            this.dispatch('stickmove')
        }
    }

    pointerUp(e) {
        if (e.pointerId === this.pointerId) {
            this.reset()
            this.dispatch('stickup')
        }
    }

    repeatInput(callback, delay, interval, inputOnDown = true, inputOnUp = true) {
        let delayTimer, intervalTimer
        const removeDown = this.on('stickdown', (state) => {
            if (inputOnDown) {
                callback(state)
            }
            delayTimer = setTimeout(() => {
                intervalTimer = setInterval(() => {
                    callback(this.state)
                }, interval)
            }, delay)
        })
        const removeUp = this.on('stickup', (state) => {
            clearTimeout(delayTimer)
            clearInterval(intervalTimer)
            if (inputOnUp) {
                callback(state)
            }
        })
        return () => {
            removeDown()
            removeUp()
        }
    }
}

customElements.define('control-stick', ControlStick)