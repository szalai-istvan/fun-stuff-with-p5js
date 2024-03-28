const CELL_SIZE = 80;
const WALL_WIDTH = 12;
const WALL_HEIGHT = 40;

const BALL_RADIUS = 0.4 * (CELL_SIZE / 2);
const BALL_ACCELERATION = 0.05;
const BALL_DECELERATION_RATE = 0.3;
const BALL_MAX_VELOCITY = 10;
const BOUNCE_BACK = -1.01;

const colorBackground = () => background(128);
const wallColor = () => fill('blue');
const columnColor = () => fill('orange');
const ballColor = () => fill(250, 0, 0);
const floorColor = () => fill('yellow');
const goalColor = () => {
    let c = color(0, 190, 0);
    c.setAlpha(64);
    fill(c);
};
const colorBackgroundWhenWon = (millisSinceLastWin) => {
    if (millisSinceLastWin % 400 < 200) {
        background(250, 0, 0);
    } else {
        background(0, 250, 0);
    }
};