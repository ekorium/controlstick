export class ControlStick {

    static get DEFAULT_STATE() {
        return {dx: 0, dy: 0, magnitude: 0}
    }

    constructor(useEvents=true, delay=0, interval=10, deadzone=0.1, maxzone=2.0) {
        this.useEvents = useEvents
        this.delay = delay
        this.interval = interval
        this.deadzone = deadzone
        this.maxzone = maxzone
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
        clearTimeout(this.delayTimer)
        clearInterval(this.intervalTimer)
        this.delayTimer = null
        this.intervalTimer = null
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

    getPartialState(dx, dy) {
        return {dx, dy}
    }

    getStateFromXY(x, y) {
        const rect = this.div.getBoundingClientRect()
        const rx = rect.width / 2
        const ry = rect.height / 2
        const dx = x - (rect.left + rx)
        const dy = y - (rect.top + ry)
        const mx = Math.abs(dx / rx)
        const my = Math.abs(dy / ry)
        const magnitude = Math.min(1, (mx * mx + my * my) / this.maxzone)
        if (magnitude < this.deadzone) {
            return this.constructor.DEFAULT_STATE
        }
        const state = this.getPartialState(dx, dy)
        state.magnitude = magnitude
        return state
    }

    on(type, callback) {
        this.div.addEventListener(type, (e) => {
            callback(e.detail)
        })
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
            this.div.setPointerCapture(e.pointerId)
            this.dispatchEvent('stickdown', this.state)
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

class ControlStickNotched extends ControlStick {

    static get DEFAULT_STATE() {
        return {direction: 'neutral', magnitude: 0}
    }
}

export class ControlStick4 extends ControlStickNotched {

    getPartialState(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return {direction: dx > 0 ? 'right' : 'left'}
        } else {
            return {direction: dy > 0 ? 'down' : 'up'}
        }
    }
}

export class ControlStick8 extends ControlStickNotched {

    getPartialState(dx, dy) {
        const sx = dx > 0 ? 'right' : 'left'
        const sy = dy > 0 ? 'down' : 'up'
        if (Math.abs(dx) > 2 * Math.abs(dy)) {
            return {direction: sx}
        } else if (Math.abs(dy) > 2 * Math.abs(dx)){
            return {direction: sy}
        } else {
            return {direction: `${sx}-${sy}`}
        }
    }
}

export class ControlStickPolar extends ControlStick {

    static get DEFAULT_STATE() {
        return {angle: null, magnitude: 0}
    }

    getPartialState(dx, dy) {
        return {angle: Math.atan2(dy, dx)}
    }
}