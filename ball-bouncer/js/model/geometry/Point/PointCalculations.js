import { CreatePoint } from "./CreatePoint.js";
import { Point } from "./Point.js";
import { ReducerFunctions } from "../../../math/ReducerFunctions.js";

/**
 * Kiszámolja két pont között a távolságot.
 * 
 * @param {Point} p1 Egyik pont
 * @param {Point} p2 Másik pont
 * @returns {number}, a két pont közötti távolság
 */
function calculateDistance(p1, p2) {
    const deltaX = p2.x - p1.x;
    const deltaY = p2.y - p1.y;
    const deltaZ = p2.z - p1.z;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY * deltaZ * deltaZ);
}

/**
 * Kiszámolja a megadott pont és az origó közötti távolságot.
 * 
 * @param {Point} p Egyik pont
 * @returns {number}, a két pont közötti távolság
 */
function calculateDistanceFromOrigin(p) {
    return calculateDistance(ApplicationState.originPoint, p);
}

/** 
 * Egy listában szereplő pontokat összeadja és visszaadja az eredményt.
 * 
 * @param {Point[]} points
 * @returns {Point} 
 */
function addPoints(points) {
    const x = points.map(p => p.x).reduce(ReducerFunctions.sumFunction);
    const y = points.map(p => p.y).reduce(ReducerFunctions.sumFunction);
    return CreatePoint.createPoint(x, y);
}

/**
 * Egy pont konstanssal való összeszorzását végzi el és visszaadja az eredményt.
 *  
 * @param {Point} point, 
 * @param {Number} mul, 
 * @returns {Point} 
 */
function multiplyPoint(point, mul) {
    return CreatePoint.createPoint(point.x * mul, point.y * mul);
}

/** 
 * Egy pont elforgatása az origó körül a megadott szöggel (radiánban) és visszaadja az eredményt.
 * 
 * @param {Point} point 
 * @param {Number} angleRad 
 * @returns {Point} 
 */
function rotatePoint(point, angleRad) {
    const absValue = calculateDistanceFromOrigin(point);
    const x = point.x;
    const y = point.y;

    let angle;
    if (x === 0) {
        if (y >= 0) {
            angle = HALF_PI;
        } else {
            angle = HALF_PI * 3;
        }
    } else {
        angle = Math.atan(y / x);
        if (x < 0) {
            angle += PI;
        }
    }

    angle += angleRad;
    return multiplyPoint(CreatePoint.createUnitVector(angle), absValue);
}

/**
 * Kiszámolja a paraméterül kapott pont képernyőn lévő pozícióját.
 * 
 * @param {Point} point 
 * @returns {Point}
 */
function calculateScreenPositionOfPoint(point) {
    const currentDragValue = ScreenActions.getCurrentDragValue();
    const canvasSize = DocumentData.getCanvasSize();

    const sumDrag = ApplicationState.screenSumDrag;
    const screenZoom = ApplicationState.screenZoom;

    return CreatePoint.createPoint(
        (point.x + sumDrag.x) * screenZoom + canvasSize.x / 2 + currentDragValue.x,
        (point.y + sumDrag.y) * screenZoom + canvasSize.y / 2 + currentDragValue.y
    );
}

/**
 * Pontokkal kapcsolatos számítások gyűjteménye.
 */
export const PointCalculations = {
    calculateDistance,
    calculateDistanceFromOrigin,
    addPoints,
    multiplyPoint,
    rotatePoint,
    calculateScreenPositionOfPoint
};