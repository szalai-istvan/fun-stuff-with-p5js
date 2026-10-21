const CELL_OPERATIONS = {
    up: { row: -1, col: 0, opposite: 'down' },
    left: { row: 0, col: -1, opposite: 'right' },
    down: { row: 1, col: 0, opposite: 'up' },
    right: { row: 0, col: 1, opposite: 'left' }
};

class Labirinth {
    constructor(size) {
        this.size = size;
        this.cellMatrix = new LabirinthCellMatrix(size);
        this.ball = new Ball(this);
        this.win = false;
    }

    generateLayout() {
        let node = { row: 0, col: 0 };
        const queue = [];

        while (true) {
            queue.push(node);
            const cell = this.cellMatrix.cellAt(node.row, node.col);
            cell.isVisited = true;

            let randomUnvisitedNeighbor = this.cellMatrix.randomUnvisitedNeighbor(node.row, node.col);
            while (!randomUnvisitedNeighbor && queue.length > 0) {
                node = queue.shift();
                randomUnvisitedNeighbor = this.cellMatrix.randomUnvisitedNeighbor(node.row, node.col);
            }

            if (!randomUnvisitedNeighbor && queue.length === 0) {
                break;
            }

            this.cellMatrix.removeWall(node.row, node.col, randomUnvisitedNeighbor.dir);
            node = { row: randomUnvisitedNeighbor.row, col: randomUnvisitedNeighbor.col };

        }
    }

    render(cellSize = CELL_SIZE) {
        strokeWeight(2);

        const length = this.size * cellSize;

        wallColor();
        horizontalWall(length, (length) / 2, 0);
        verticalWall(length, 0, (length) / 2);
        horizontalWall(length, (length) / 2, length);
        verticalWall(length, length, (length) / 2);
        
        columnColor();
        column(0, 0);
        column(0, length);
        column(length, 0);
        column(length, length);

        floorColor();
        const translateZ = -(WALL_HEIGHT + WALL_WIDTH) / 2 - 1;
        translate(length/2, length/2, translateZ);
        box(length + WALL_WIDTH, length + WALL_WIDTH, -WALL_WIDTH);
        translate(-length/2, -length/2, -translateZ);
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.cellMatrix.renderCell(row, col, cellSize);
            }
        }

        strokeWeight(0);
        this.ball.render();
        goalColor();

        translate(CELL_SIZE * (this.size - 1 / 2), CELL_SIZE * (this.size - 1 / 2), 0);
        box(CELL_SIZE - WALL_WIDTH - 2, CELL_SIZE - WALL_WIDTH - 2, WALL_HEIGHT);
    }

    accelerateBall(x, y) {
        this.ball.setAcceleration(x, y);
    }

    declareWin() {
        this.win = true;
    }
}

class LabirinthCellMatrix {
    constructor(size) {
        this.matrix = arrayOfLabirinthCells(size);
        this.size = size;
        this.cellCount = size * size;
        this.toProcess = size * size;
    }

    removeWall(row, col, direction) {
        const neighbor = getNeighbor(row, col, direction);
        const neighborDirection = neighbor.direction;
        const neighborCell = this.cellAt(neighbor.row, neighbor.col);

        let cell = this.cellAt(row, col);
        cell.removeWall(direction);

        if (neighborCell) {
            neighborCell.removeWall(neighborDirection);
        }
    }

    cellAt(row, col) {
        if (validIndex([row, col], this.size)) {
            return this.matrix[row * this.size + col];
        }
        return undefined;
    }

    randomUnvisitedNeighbor(row, col) {
        const options = [];
        for (let dir in CELL_OPERATIONS) {
            const neighbor = getNeighbor(row, col, dir);
            const neighborCell = this.cellAt(neighbor.row, neighbor.col);
            if (neighborCell && !neighborCell.isVisited) {
                options.push({ row: neighbor.row, col: neighbor.col, dir: dir });
            }
        }
        if (options.length === 0) {
            return undefined;
        }
        return options[Math.floor(Math.random() * options.length)];
    }

    renderCell(row, col, cellSize) {

        const cell = this.cellAt(row, col);

        const rightDown = { x: (col + 1) * cellSize, y: (row + 1) * cellSize };
        const downCenter = { x: col * cellSize + cellSize / 2, y: (row + 1) * cellSize };
        const rightCenter = { x: (col + 1) * cellSize, y: row * cellSize + cellSize / 2 };

        const rightNeighbor = getNeighbor(row, col, 'right');
        const downNeighbor = getNeighbor(row, col, 'down');
        const rightNeighborCell = this.cellAt(rightNeighbor.row, rightNeighbor.col);
        const downNeighborCell = this.cellAt(downNeighbor.row, downNeighbor.col);

        wallColor();
        if (cell.isWall('right') && rightNeighborCell) {
            verticalWall(cellSize, rightCenter.x, rightCenter.y);
        }

        if (cell.isWall('down') && downNeighborCell) {
            horizontalWall(cellSize, downCenter.x, downCenter.y);
        }

        const needColumnAtRightDown =  (validIndex([row+1,col+1], this.size));

        columnColor();
        if (needColumnAtRightDown) {
            column(rightDown.x, rightDown.y);
        }
    }
}

class LabirinthCell {
    constructor() {
        this.up = true;
        this.down = true;
        this.left = true;
        this.right = true;

        this.isVisited = false;
    }

    addWall(direction) {
        this[direction] = true
    }

    removeWall(direction) {
        this[direction] = false;
    }

    isWall(direction) {
        return this[direction];
    }
}

class Ball {
    constructor(labirinth) {
        this.labirinth = labirinth;

        this.position = {x: CELL_SIZE / 2, y: CELL_SIZE / 2};
        this.velocity = {x: 0, y: 0};
        this.acceleration = {x: 0, y: 0};
        
        this.row = undefined;
        this.col = undefined;
        this.boundaryValidators = {};
    }

    setAcceleration(x, y) {
        const x_ = x !== 0 && this.acceleration.x !== 0 ? this.acceleration.x/BALL_ACCELERATION : x;
        const y_ = y !== 0 && this.acceleration.y !== 0 ? this.acceleration.y/BALL_ACCELERATION : y;

        this.acceleration = {
            x: x_*BALL_ACCELERATION,
            y: y_*BALL_ACCELERATION
        };
    }

    updatePosition() {
        this.velocity = {
            x: this.velocity.x + (this.acceleration.x === 0 ? -BALL_DECELERATION_RATE * Math.sign(this.velocity.x) * BALL_ACCELERATION : this.acceleration.x),
            y: this.velocity.y + (this.acceleration.y === 0 ? -BALL_DECELERATION_RATE * Math.sign(this.velocity.y) * BALL_ACCELERATION : this.acceleration.y)
        };
        
        this.validatePosition();

        this.velocity.x = Math.min(Math.abs(this.velocity.x), BALL_MAX_VELOCITY) * Math.sign(this.velocity.x);
        this.velocity.y = Math.min(Math.abs(this.velocity.y), BALL_MAX_VELOCITY) * Math.sign(this.velocity.y);

        this.position = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        };

        if (this.row >= this.labirinth.size - 1 && this.col >= this.labirinth.size - 1) {
            this.labirinth.declareWin();
        }
    }
    
    validatePosition() {
        const validators = this.updateBoundaries();
        const x = this.position.x;
        const y = this.position.y;
        if (validators.up && validators.up(x, y)) {
            this.velocity.y = positive(this.velocity.y) * BOUNCE_BACK;
            return;
        } else if (validators.down && validators.down(x, y)) {
            this.velocity.y = negative(this.velocity.y) * BOUNCE_BACK;
            return;
        }

        if (validators.right && validators.right(x, y)) {
            this.velocity.x = negative(this.velocity.x) * BOUNCE_BACK;
            return;
        } else if (validators.left && validators.left(x, y)) {
            this.velocity.x = positive(this.velocity.x) * BOUNCE_BACK;
            return;
        }

        const corners = validators.corners;

        if (corners.downLeft && corners.downLeft(x, y)) {
            this.velocity.x = positive(this.velocity.x) * BOUNCE_BACK;
            this.velocity.y = negative(this.velocity.y) * BOUNCE_BACK;
        }

        if (corners.upLeft && corners.upLeft(x, y)) {
            this.velocity.x = positive(this.velocity.x) * BOUNCE_BACK;
            this.velocity.y = positive(this.velocity.y) * BOUNCE_BACK;
        }
                
        if (corners.downRight && corners.downRight(x, y)) {
            this.velocity.x = negative(this.velocity.x) * BOUNCE_BACK;
            this.velocity.y = negative(this.velocity.y) * BOUNCE_BACK;
        } 

        if (corners.upRight && corners.upRight(x, y)) {
            this.velocity.x = negative(this.velocity.x) * BOUNCE_BACK;
            this.velocity.y = positive(this.velocity.y) * BOUNCE_BACK;
        }
    }

    updateBoundaries() {
        const row = Math.floor(this.position.y / CELL_SIZE);
        const col = Math.floor(this.position.x / CELL_SIZE);
        if ((this.row === row && this.col === col)) {
            return this.boundaryValidators;
        }

        this.row = row;
        this.col = col;
        
        const cell = this.labirinth.cellMatrix.cellAt(row, col);
        const validators = {};
        const cornerValidators = {};

        const leftNeighbor = getNeighbor(row, col, 'left');
        const leftNeighborCell = this.labirinth.cellMatrix.cellAt(leftNeighbor.row, leftNeighbor.col);
        const rightNeighbor = getNeighbor(row, col, 'right');
        const rightNeighborCell = this.labirinth.cellMatrix.cellAt(rightNeighbor.row, rightNeighbor.col);
        const upNeighbor = getNeighbor(row, col, 'up');
        const upNeighborCell = this.labirinth.cellMatrix.cellAt(upNeighbor.row, upNeighbor.col);
        const downNeighbor = getNeighbor(row, col, 'down');
        const downNeighborCell = this.labirinth.cellMatrix.cellAt(downNeighbor.row, downNeighbor.col);

        const upLeft = {x: col * CELL_SIZE, y: row * CELL_SIZE};
        const downLeft = {x: col * CELL_SIZE, y: (row + 1) * CELL_SIZE};
        const upRight = {x: (col + 1) * CELL_SIZE, y: row * CELL_SIZE};
        const downRight = {x: (col + 1) * CELL_SIZE, y: (row + 1) * CELL_SIZE};


        if (cell.isWall('left')) {
            validators.left = (x, y) => x < col * CELL_SIZE + BALL_RADIUS + WALL_WIDTH/2;
        } else {
            if (!cornerValidators.downLeft && (leftNeighborCell && (leftNeighborCell.isWall('down')) || (downNeighborCell && downNeighborCell.isWall('left')))) {
                cornerValidators.downLeft = (x, y) => distance(x, y, downLeft.x, downLeft.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
            if (!cornerValidators.upLeft && ((leftNeighborCell && leftNeighborCell.isWall('up')) || (upNeighborCell && upNeighborCell.isWall('left')))) {
                cornerValidators.upLeft = (x, y) => distance(x, y, upLeft.x, upLeft.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
        }
        
        if (cell.isWall('right')) {
            validators.right = (x, y) => x > (col + 1) * CELL_SIZE - BALL_RADIUS - WALL_WIDTH/2;
        } else {
            if (!cornerValidators.downRight && (rightNeighborCell && rightNeighborCell.isWall('down')) || (downNeighborCell && downNeighborCell.isWall('right'))) {
                cornerValidators.downRight = (x, y) => distance(x, y, downRight.x, downRight.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
            if (!cornerValidators.upRight && ((rightNeighborCell && rightNeighborCell.isWall('up')) || (upNeighborCell && upNeighborCell.isWall('right')))) {
                cornerValidators.upRight = (x, y) => distance(x, y, upRight.x, upRight.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
        }

        if (cell.isWall('up')) {
            validators.up = (x, y) => y < row * CELL_SIZE + BALL_RADIUS + WALL_WIDTH/2;
        } else {
            if (!cornerValidators.upLeft && ((leftNeighborCell && leftNeighborCell.isWall('up')) || (upNeighborCell && upNeighborCell.isWall('left')))) {
                cornerValidators.upLeft = (x, y) => distance(x, y, upLeft.x, upLeft.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
            if (!cornerValidators.upRight && ((rightNeighborCell && rightNeighborCell.isWall('up')) || (upNeighborCell && upNeighborCell.isWall('right')))) {
                cornerValidators.upRight = (x, y) => distance(x, y, upRight.x, upRight.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
        }

        if (cell.isWall('down')) {
            validators.down = (x, y) => y > (row + 1) * CELL_SIZE - BALL_RADIUS - WALL_WIDTH/2;
        } else {
            if (!cornerValidators.downLeft && ((leftNeighborCell && leftNeighborCell.isWall('down')) || (downNeighborCell && downNeighborCell.isWall('left')))) {
                cornerValidators.downLeft = (x, y) => distance(x, y, downLeft.x, downLeft.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
            if (!cornerValidators.downRight && ((rightNeighborCell && rightNeighborCell.isWall('down')) || (downNeighborCell && downNeighborCell.isWall('right')))) {
                cornerValidators.downRight = (x, y) => distance(x, y, downRight.x, downRight.y) < BALL_RADIUS + WALL_WIDTH/2;
            }
        }

        validators.corners = cornerValidators;
        this.boundaryValidators = validators;
        return this.boundaryValidators;
    }

    render() {
        this.updatePosition();
        ballColor();
        translate(this.position.x, this.position.y);
        sphere(BALL_RADIUS);
        translate(-this.position.x, -this.position.y);
    }
}

function arrayOfLabirinthCells(size) {
    const cells = [];
    const cellCount = size * size;
    for (let i = 0; i < cellCount; i++) {
        const cell = new LabirinthCell();
        cells.push(cell);
    }

    return cells;
}

function validIndex(indexes, size) {
    for (let i of indexes) {
        if (i < 0 || i >= size) {
            return false;
        }
    }
    return true;
}

function getNeighbor(row, col, direction) {
    const dir = CELL_OPERATIONS[direction];
    return {
        row: row + dir.row,
        col: col + dir.col,
        direction: dir.opposite
    };
}

function horizontalWall(length, centerX, centerY) {
    translate(centerX, centerY);
    box(length - WALL_WIDTH, WALL_WIDTH, WALL_HEIGHT);
    translate(-centerX, -centerY);
}

function verticalWall(length, centerX, centerY) {
    translate(centerX, centerY);
    box(WALL_WIDTH, length - WALL_WIDTH, WALL_HEIGHT);
    translate(-centerX, -centerY);
}

function column(centerX, centerY) {
    translate(centerX, centerY);
    box(WALL_WIDTH, WALL_WIDTH, WALL_HEIGHT);
    translate(-centerX, -centerY);
}

function distance(x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}

function negative(x) {
    return -1 * Math.abs(x);
}

function positive(x) {
    return Math.abs(x);
}