const DIAGONAL = 1 / Math.sqrt(2)

export function normalizeXY8([x, y], scale=1) {
    if (x === 0 || y === 0) {
        return [x * scale, y * scale]
    } else {
        return [x * DIAGONAL * scale, y * DIAGONAL * scale]
    }
}

export function stringifyXY8([x, y]) {
    if (x === 0) {
        if (y === 0) return 'neutral'
        if (y === 1) return 'down'
        return 'up'
    } else if (x === 1) {
        if (y === 0) return 'right'
        if (y === 1) return 'down-right'
        return 'up-right'
    } else {
        if (y === 0) return 'left'
        if (y === 1) return 'down-left'
        return 'up-left'
    }
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}