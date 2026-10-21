/**
 * Pontot reprezentáló osztály.
 */
export class Point {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    z;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}