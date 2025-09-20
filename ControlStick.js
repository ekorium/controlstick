export default class ControlStick {

    static get DEFAULT_STATE() {
        return {nx: 0, ny: 0, norm: 0, magnitude: 0, dir4: [0, 0], dir8: [0, 0]}
    }

    constructor({useEvents=false, moveOnDown=true, delay=10, interval=10, minzone=0.1, maxzone=1.0, knobzone=1.0}={}) {
        this.useEvents = useEvents
        this.moveOnDown = moveOnDown
        this.delay = delay
        this.interval = interval
        this.minzone = minzone
        this.maxzone = maxzone
        this.knobzone = knobzone
        this.knob = null
        this.reset()
        this.div = document.createElement('div')
        this.div.onpointerdown = this.pointerDown.bind(this)
        this.div.onpointermove = this.pointerMove.bind(this)
        this.div.onpointerup = this.pointerUp.bind(this)
        this.div.onpointercancel = this.pointerUp.bind(this)
        this.div.onlostpointercapture = this.pointerUp.bind(this)
        this.setActive(true)
    }

    reset() {
        this.pointerId = null
        this.state = this.constructor.DEFAULT_STATE
        this.updateKnob()
        clearTimeout(this.delayTimer)
        clearInterval(this.intervalTimer)
        this.delayTimer = null
        this.intervalTimer = null
    }

    createKnob() {
        if (!this.knob) {
            this.knob = document.createElement('div')
            this.knob.style.position = 'absolute'
            this.knob.style.left = '50%'
            this.knob.style.top = '50%'
            this.knob.style.transform = 'translate(-50%, -50%)'
            this.knob.style.pointerEvents = 'none'
            this.div.appendChild(this.knob)
        }
        return this.knob
    }

    updateKnob() {
        if (this.knob) {
            requestAnimationFrame(this.animateKnob.bind(this))
        }
    }

    animateKnob() {
        const c = Math.min(this.state.norm, this.knobzone)
        const mx = 50 * c * this.state.nx
        const my = 50 * c * this.state.ny
        this.knob.style.transform = `translate(${mx - 50}%, ${my - 50}%)`
    }

    setActive(active) {
        this.active = active
        if (active) {
            this.div.style.pointerEvents = 'auto'
        } else {
            this.div.style.pointerEvents = 'none'
            this.reset()
        }
    }

    get isPressed() {
        return this.pointerId !== null
    }

    computeMagnitude(norm) {
        if (this.minzone >= this.maxzone) {
            return 1
        }
        const value = (norm - this.minzone) / (this.maxzone - this.minzone)
        return Math.min(1, value)
    }

    getStateFromXY(x, y) {
        const rect = this.div.getBoundingClientRect()
        const rx = rect.width / 2
        const ry = rect.height / 2
        const dx = (rx > 0) ? (x - (rect.left + rx)) / rx : 0
        const dy = (ry > 0) ? (y - (rect.top + ry)) / ry : 0
        const norm = Math.hypot(dx, dy)
        const nx = (norm > 0) ? dx / norm : 0
        const ny = (norm > 0) ? dy / norm : 0
        if (norm < this.minzone) {
            return {...this.constructor.DEFAULT_STATE, nx, ny, norm}
        }
        const magnitude = this.computeMagnitude(norm)
        const mx = Math.abs(nx)
        const my = Math.abs(ny)
        const sx = (nx > 0) ? 1 : -1
        const sy = (ny > 0) ? 1 : -1
        const dir4 = (mx > my) ? [sx, 0] : [0, sy]
        const dir8 = (mx > 2 * my || my > 2 * mx) ? dir4 : [sx, sy]
        return {nx, ny, norm, magnitude, dir4, dir8}
    }

    on(type, callback) {
        const handler = (e) => callback(e.detail)
        this.div.addEventListener(type, handler)
        return () => this.div.removeEventListener(type, handler)
    }

    dispatchEvent(type, state) {
        if (this.useEvents) {
            this.div.dispatchEvent(new CustomEvent(type, {detail: state}))
        }
    }

    pointerDown(e) {
        if (this.active && !this.isPressed) {
            this.pointerId = e.pointerId
            this.state = this.getStateFromXY(e.clientX, e.clientY)
            this.updateKnob()
            this.div.setPointerCapture(e.pointerId)
            this.dispatchEvent('stickdown', this.state)
            if (this.moveOnDown) {
                this.dispatchEvent('stickmove', this.state)
            }
            this.delayTimer = setTimeout(() => {
                this.intervalTimer = setInterval(() => {
                    this.dispatchEvent('stickmove', this.state)
                }, this.interval)
            }, this.delay)
        }
    }

    pointerMove(e) {
        if (e.pointerId === this.pointerId) {
            this.state = this.getStateFromXY(e.clientX, e.clientY)
            this.updateKnob()
        }
    }

    pointerUp(e) {
        if (e.pointerId === this.pointerId) {
            const state = this.getStateFromXY(e.clientX, e.clientY)
            this.dispatchEvent('stickup', state)
            this.reset()
        }
    }
}