// ========= //
// MAZE GAME //
// ========= //

// destructure functions out of Matter object
const {
    Engine,
    Render,
    Body,
    Bodies,
    Events,
    Runner,
    World,
} = Matter;

// selectors

const bannerText = document.querySelector('#bannertext');
const newButton = document.querySelector('#new');
const harderButton = document.querySelector('#harder');
const fasterButton = document.querySelector('#faster');
const scoreButton = document.querySelector('#score');
const closeButton = document.querySelector('.closebutton');
closeButton.addEventListener('click', () => {
    winBox.classList.add('hidden');
});

bannerText.innerText = "W A S D => MOVE";
setTimeout(() => {
    bannerText.innerText = `|||||| MAZE MALAISE ||||||`;
    return;
}, 5000);




const wallStroke = "#fff";
const wallFill = "#000";
const wallStrokeWidth = 2;
const wallWidth = 5;

const ballStroke = "#f00";
const ballFill = "#000";
const ballStrokeWidth = 2;

const goalStroke = "#0f0";
const goalFill = "#000";
const goalStrokeWidth = 1;


//  create engine variable
const engine = Engine.create();
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

const matterCanvas = document.querySelector('#matterCanvas');

// destructure world from engine object
const { world } = engine;

// init renderer
const render = Render.create({
    canvas: matterCanvas,
    engine: engine,
    options: {
        wireframes: false,
        width: 800,
        height: 800,
        background: 'rgb(15,15,19)'

    }
});



// select canvas
cnv = document.querySelector('canvas');
winBox = document.querySelector('.winner');

const config = {
    width: cnv.width,
    height: cnv.height,
    cellsHorizontal: 4,
    cellsVertical: 4,
    get unitLengthX() { return this.width / this.cellsHorizontal },
    get unitLengthY() { return this.height / this.cellsVertical },

}

let { width, height, cellsHorizontal, cellsVertical, unitLengthX, unitLengthY } = config;


let hasWon = false;
let userScore = 0;


// start renderer
Render.run(render);
Runner.run(Runner.create(), engine);

// =============== //
// WALL GENERATION //
// =============== //

const makeWalls = (w, h, wallWidth = 2) => {
    // make wall variables
    const wallL = Bodies.rectangle(0, h / 2, wallWidth, h, { isStatic: true });
    const wallR = Bodies.rectangle(w, h / 2, wallWidth, h, { isStatic: true });
    const floor = Bodies.rectangle(w / 2, h, w, wallWidth, { isStatic: true });
    const ceiling = Bodies.rectangle(w / 2, 0, w, wallWidth, { isStatic: true });
    World.add(world, [wallL, wallR, floor, ceiling]);
};



// =============== //
// GRID GENERATION //
// =============== //

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const tmp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = tmp;

    }

    return arr;
};

const newMaze = () => {

    const grid = Array(cellsVertical).fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
    // map is like a foreach function on each element of array?

    // 2 vertices, 3 horizontals
    const verticals = Array(cellsVertical).fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(false));

    // 3 horizontals, 2 verticals
    const horizontals = Array(cellsVertical - 1).fill(null)
        .map(() => Array(cellsHorizontal).fill(false));




    const startRow = Math.floor(Math.random() * cellsVertical);
    const startColumn = Math.floor(Math.random() * cellsHorizontal);

    stepThoughCell(startRow, startColumn, grid, horizontals, verticals);


    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            }
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY, unitLengthX, wallWidth, { isStatic: true, label: 'Wall', render: { fillStyle: wallFill, strokeStyle: wallStroke, lineWidth: wallStrokeWidth } }
            );
            World.add(world, wall);
        });

    });



    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if(open) {
                return;
            }

            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY / 2,
                wallWidth,
                unitLengthY, { isStatic: true, label: 'Wall', render: { fillStyle: wallFill, strokeStyle: wallStroke, lineWidth: wallStrokeWidth } }
            );
            World.add(world, wall);
        });

    });

}

const findGoal = () => {
    let goalBody;

    world.bodies.forEach((body) => {
        if(body.label === 'Goal') {
            goalBody = body;


        }

    });

    if(goalBody) {
        return goalBody;
    }
}

const rotateBody = (body) => {
    Body.rotate(body, Math.PI / 128);
}
const stepThoughCell = (row, column, grid, horizontals, verticals) => {
    // if I have visited cell at [row,column], then return
    if(grid[row][column]) { return; }

    // we are at this grid cell, so set to true
    grid[row][column] = true;

    // Assemble coord pairs list of neigbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    for(let neighbour of neighbours) {
        // see if neighbour is out of bounds
        // which row or column will we visit next?
        const [nextRow, nextColumn, direction] = neighbour;

        // if we have visited that neighbour, cotinue to next neighbour
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            // skip to next neighbour;
            continue;
        }
        if(grid[nextRow][nextColumn]) {
            // skip to next neighbour in for loop
            continue;
        }
        // remove wall from horizontals array or vertical array
        if(direction === 'left') {
            verticals[row][column - 1] = true;
        } else if(direction === 'right') {
            verticals[row][column] = true;
        } else if(direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if(direction === 'down') {
            horizontals[row][column] = true;
        }
        // visit next cell
        stepThoughCell(nextRow, nextColumn, grid, horizontals, verticals);

    }
    // call function again until finished
};
let ballVelocity = 1;

const addSprites = () => {
    const goal = Bodies.rectangle(
        width - unitLengthX / 2, height - unitLengthY / 2, unitLengthX * 0.5, unitLengthX * 0.5, {
            isStatic: true,
            label: "Goal",
            render: { fillStyle: goalFill, strokeStyle: goalStroke, lineWidth: goalStrokeWidth }
        }
    );
    World.add(world, goal);
    const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, unitLengthX / 4, { restitution: 0.5, label: "Ball", render: { fillStyle: ballFill, strokeStyle: ballStroke, lineWidth: ballStrokeWidth } });
    World.add(world, ball);



    document.addEventListener('keydown', event => {
        console.log(ballVelocity);

        const { x, y } = ball.velocity;

        if(event.keyCode === 87 || event.keyCode === 38) {
            event.preventDefault();
            Body.setVelocity(ball, { x, y: y - ballVelocity });
        }
        if(event.keyCode === 65 || event.keyCode === 37) {
            event.preventDefault();
            Body.setVelocity(ball, { x: x - ballVelocity, y });
        }
        if(event.keyCode === 68 || event.keyCode === 39) {
            event.preventDefault();
            Body.setVelocity(ball, { x: x + ballVelocity, y });
        }
        if(event.keyCode === 83 || event.keyCode === 40) {
            event.preventDefault();
            Body.setVelocity(ball, { x, y: y + ballVelocity });
        }

    });
}

let isFlashing = false;
const updateScore = (score) => {
    scoreButton.innerText = `SCORE: ${score}`;
}
const onWin = () => {
    userScore += 1;
    updateScore(userScore);
    console.log('YOU WIN!!');
    hasWon = true;

    engine.world.gravity.y = 0.005;
    world.bodies.forEach((body) => {
        if(body.label === 'Goal') {


            var flashInterval = setInterval(() => {
                isFlashing = !isFlashing;
                if(isFlashing) {
                    body.render.strokeStyle = 'yellow';
                } else {
                    body.render.strokeStyle = 'green';
                }
            }, 250);
            setTimeout(() => {

                clearInterval(flashInterval);
            }, 5000);
        }


        if(body.label === 'Wall') {
            Body.setStatic(body, false);
            winBox.classList.remove('hidden');
            randWinText();
        }
    });

}


// detect collision event with goal
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['Ball', 'Goal'];

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label) && !hasWon) {

            onWin();
        }
    });
});

const randWinText = () => {

    const winTextArray = [
        "But winning isn't everything",
        "You win this time, but next time you won't be so lucky",
        "Winners are grinners, losers are cruisers",
        "Winner winner chicken dinner",
        "Bumping up score vector"
    ]

    const winText = document.querySelector('.wintext');
    const randEntry = Math.floor(Math.random() * winTextArray.length)
    winText.innerText = winTextArray[randEntry].toUpperCase();

}

const reset = () => {


    hasWon = false;
    winBox.classList.add('hidden');
    World.clear(world, false);
    makeWalls(cnv.width, cnv.height);
    newMaze();
    addSprites();
    let foundGoal = findGoal();

    setInterval(() => {
        rotateBody(foundGoal);
    }, 33);
}

const makeHarder = () => {
    cellsHorizontal += 1;
    cellsVertical += 1;

    if(cellsHorizontal === 10 && cellsVertical === 10) {
        cellsHorizontal = 4;
        cellsVertical = 4;
    }
    unitLengthX = width / cellsHorizontal;
    unitLengthY = height / cellsVertical;

    console.log(cellsHorizontal, cellsVertical);
    reset();
}
newButton.addEventListener('click', reset);
harderButton.addEventListener('click', makeHarder);
fasterButton.addEventListener('click', () => {

    if(ballVelocity < 5) { ballVelocity = (ballVelocity + 1) % 5; }


    fasterButton.innerText = `VELOCITY ${ballVelocity}`;
})

// make the walls
updateScore(0);
reset();