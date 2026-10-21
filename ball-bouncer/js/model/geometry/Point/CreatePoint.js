import { Point } from "./Point.js";

/**
 * Visszaadja az origópontot.
 * 
 * @returns {Point} az origópont
 */
function origin() {
    return createPoint(0, 0, 0);
}

/**
 * Létrehoz és visszaad egy pontot.
 * 
 * @param {number} x koordináta
 * @param {number} y koordináta
 * @param {number} z koordináta
 * @returns {Point} a létrehozott pont objektum
 */
function createPoint(x, y, z) {
    return new Point(x, y, z);
}

/**
 * Létrehoz és visszaad egy adott irányba mutató egységvektort.
 * 
 * @param {number} phi x-y síkban az x tengellyel bezárt szög
 * @param {number} theta az x-y síkkal bezárt szög
 * @returns {Point} a létrehozott objektum
 */
function createUnitVector(phi, theta) {
    return createPoint(
        Math.cos(phi) * Math.cos(theta),
        Math.sin(phi) * Math.cos(theta),
        Math.sin(theta)
    );
}

/**
 * Pont létrehozó és egységvektor létrehozó függvények gyűjteménye.
 */
export const CreatePoint = {
    createPoint,
    createUnitVector
};