export class ControlStick {

    static get DEFAULT_STATE() {
        return {dx: 0, dy: 0, magnitude: 0}
    }

    constructor(deadzone=0.1, maxzone=2.0) {
        this.deadzone = deadzone
        this.maxzone = maxzone
        this.div = document.createElement('div')
        this.div.onpointerdown = this.pointerDown.bind(this)
        this.div.onpointermove = this.pointerMove.bind(this)
        this.div.onpointerup = this.pointerUp.bind(this)
        this.div.onpointercancel = this.pointerUp.bind(this)
        this.div.onpointerleave = this.pointerUp.bind(this)
        this.div.onpointerout = this.pointerUp.bind(this)
        this.div.lostpointercapture = this.pointerUp.bind(this)
        this.pointerId = null
        this.state = this.constructor.DEFAULT_STATE
    }

    get isPressed() {
        return this.pointerId !== null
    }

    stateEqual(state1, state2) {
        return state1.dx === state2.dx && state1.dy === state2.dy
    }

    getPartialState(dx, dy) {
        return {dx: dx, dy: dy}
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

    pointerDown(e) {
        if (this.pointerId === null) {
            this.pointerId = e.pointerId
            this.state = this.getStateFromXY(e.clientX, e.clientY)
            this.div.setPointerCapture(e.pointerId)
            this.div.dispatchEvent(new CustomEvent('stickdown',
                {'detail': this.state}
            ))
        }
    }

    pointerMove(e) {
        if (e.pointerId === this.pointerId) {
            const state = this.getStateFromXY(e.clientX, e.clientY)
            if (!this.stateEqual(state, this.state)) {
                this.div.dispatchEvent(new CustomEvent('stickmove',
                    {'detail': state}
                ))
            }
            this.state = state
        }
    }

    pointerUp(e) {
        if (e.pointerId === this.pointerId) {
            this.pointerId = null
            const state = this.getStateFromXY(e.clientX, e.clientY)
            this.state = this.constructor.DEFAULT_STATE
            this.div.dispatchEvent(new CustomEvent('stickup',
                {'detail': state}
            ))
        }
    }
}

class ControlStickNotched extends ControlStick {

    static get DEFAULT_STATE() {
        return {direction: 'neutral', magnitude: 0}
    }

    stateEqual(state1, state2) {
        return state1.direction === state2.direction
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
        return {dx: 0, dy: 0, angle: null, magnitude: 0}
    }

    getPartialState(dx, dy) {
        const angle = Math.atan2(dy, dx)
        return {dx: dx, dy: dy, angle: angle}
    }
}