const CELL_SIZE = 80;
const WALL_WIDTH = 12;
const WALL_HEIGHT = 45;

const BALL_RADIUS = 0.4 * (CELL_SIZE / 2);
const BALL_ACCELERATION = 0.05;
const BALL_DECELERATION_RATE = 0.35;
const BALL_MAX_VELOCITY = 10;
const BOUNCE_BACK = 0.65;
const MILLIS_WIN_ANIMATION = 1_000;

const MAX_SIZE = 20;

const colorBackground = () => background(128, 128, 128);
const wallColor = () => fill(243, 244, 237);
const columnColor = () => fill(83, 97, 98);
const ballColor = () => fill(192, 96, 20);
const floorColor = () => fill(66, 70, 66);
const goalColor = () => {
    let c = color(0, 190, 0);
    c.setAlpha(64);
    fill(c);
};