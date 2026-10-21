var DOC_WIDTH = document.body.clientWidth - 30;
var DOC_HEIGHT = document.body.clientHeight - 30;
var DOC_SIZE = Math.min(DOC_WIDTH, DOC_HEIGHT);

let pressedKeys = [];
let labirinth;
let camera;
let rotate = { x: 0, y: 0 };
let size = 1;
let timeOfWin = -1_000_000;

function setup() {
  createCanvas(DOC_WIDTH, DOC_HEIGHT, WEBGL);
  angleMode(DEGREES);
  camera = createCamera();
  newLabirinth();

};

function draw() {
  orbitControl(0, 1, 1);
  manageStageRotation();

  const millisSinceLastWin = millis() - timeOfWin;
  addBackground(millisSinceLastWin);
  addLights(millisSinceLastWin);
  if (labirinth) {
    labirinth.render();
    if (labirinth.win) {
      timeOfWin = millis();
      newLabirinth();
    }
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    if (pressedKeys.includes(LEFT_ARROW)) {
      return;
    }
    pressedKeys.push(keyCode);
    updateAcceleration();
  } else if (keyCode === LEFT_ARROW) {
    if (pressedKeys.includes(RIGHT_ARROW)) {
      return;
    }
    pressedKeys.push(keyCode);
    updateAcceleration();
  } else if (keyCode === UP_ARROW) {
    if (pressedKeys.includes(DOWN_ARROW)) {
      return;
    }
    pressedKeys.push(keyCode);
    updateAcceleration();
  } else if (keyCode === DOWN_ARROW) {
    if (pressedKeys.includes(UP_ARROW)) {
      return;
    }
    pressedKeys.push(keyCode);
    updateAcceleration();
  }
}

function keyReleased() {
  pressedKeys = pressedKeys.filter(k => k !== keyCode);
  updateAcceleration();
}

function updateAcceleration() {
  let x = 0;
  let y = 0;
  if (pressedKeys.includes(UP_ARROW)) {
    y--;
  } else if (pressedKeys.includes(DOWN_ARROW)) {
    y++;
  }

  if (pressedKeys.includes(LEFT_ARROW)) {
    x--;
  } else if (pressedKeys.includes(RIGHT_ARROW)) {
    x++;
  }
  labirinth.accelerateBall(x, y);
}

function manageStageRotation() {
  const translateBy = labirinth.size * CELL_SIZE / 2;

  if (pressedKeys.includes(RIGHT_ARROW)) {
    rotate.x = Math.min(rotate.x + 0.5, 10);
  } else if (pressedKeys.includes(LEFT_ARROW)) {
    rotate.x = Math.max(rotate.x - 0.5, -10);
  }

  if (pressedKeys.includes(DOWN_ARROW)) {
    rotate.y = Math.max(rotate.y - 0.5, -10);
  } else if (pressedKeys.includes(UP_ARROW)) {
    rotate.y = Math.min(rotate.y + 0.5, 10);
  }

  if (!(pressedKeys.includes(RIGHT_ARROW) || pressedKeys.includes(LEFT_ARROW))) {
    rotate.x += -0.5 * Math.sign(rotate.x);
  }

  if (!(pressedKeys.includes(UP_ARROW) || pressedKeys.includes(DOWN_ARROW))) {
    rotate.y += -0.5 * Math.sign(rotate.y);
  }

  rotateY(rotate.x);
  rotateX(rotate.y);

  translate(-translateBy, -translateBy);

}

function newLabirinth() {
  size = Math.min(MAX_SIZE, size + 1);
  const camPosMul = size / (size - 1);
  const camHeight = (size * DOC_SIZE) / 10;
  camera.camera(
    (camera.eyeX * camPosMul),
    (camera.eyeY * camPosMul),
    camHeight,

    0,
    0,
    0
  );

  labirinth = new Labirinth(size);
  labirinth.generateLayout();
  updateAcceleration();
}

function addBackground(millisSinceLastWin) {
  colorBackground();
}

function addLights(millisSinceLastWin) {
  ambientLight(64);

  let r = 255;
  let g = 255;
  let b = 255;

  if (millisSinceLastWin < MILLIS_WIN_ANIMATION) {
    r = Math.abs(r - 2*r*millisSinceLastWin/MILLIS_WIN_ANIMATION);
    b = r;
  }
  pointLight(r, g, b, 0, 0, 150);
  
}
