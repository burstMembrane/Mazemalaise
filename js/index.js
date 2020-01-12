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



// GAME UTILITY FUNCTIONS //

// allow mouse control
const addMouseControl = () => {
    // add mouse control


}

const logForTenSeconds = (data) => {


    const logInterval = setInterval(() => {
        console.log(data);
    }, 10000);

    setTimeout(() => {

        clearInterval(logInterval);
    })


}
addMouseControl();


const flashWall = (wall) => {


    wall.render.strokeStyle = 'rgb(127,127,127)';
    setTimeout(() => {
        wall.render.strokeStyle = wallStroke;
    }, 100);

}



// detect collision event with goal
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['Ball', 'Goal'];
        const wallCollision = ['Ball', 'Wall'];

        // if collision with wall
        if(wallCollision.includes(collision.bodyA.label) && wallCollision.includes(collision.bodyB.label)) {
            flashWall(collision.bodyA);
        }
        // if collision with goal
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label) && !hasWon) {
            onWin();
        }
    });
});


const initBall = () => {
    const goal = Bodies.rectangle(
        width - unitLengthX / 2, height - unitLengthY / 2, unitLengthX * 0.5, unitLengthX * 0.5, {
            isStatic: true,
            label: "Goal",
            render: { fillStyle: goalFill, strokeStyle: goalStroke, lineWidth: goalStrokeWidth }
        }
    );
    World.add(world, goal);
    const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, unitLengthX / 4, { restitution: 0.8, label: "Ball", render: { fillStyle: ballFill, strokeStyle: ballStroke, lineWidth: ballStrokeWidth } });
    World.add(world, ball);

    document.addEventListener('keydown', event => {


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

const rotateBody = (body) => {
    Body.rotate(body, Math.PI / 128);
}

const updateScore = (score) => {
    scoreButton.innerText = `SCORE: ${score}`;
}

const playRandomWinAnimation = () => {
    if(Math.random > 0.5) {
        engine.world.gravity.y = 0.005;
    } else {
        world.bodies.forEach((body) => {
            if(body.label === 'Ball') {
                body.restitution = 1.5;
            }
        })
    }


}
const onWin = () => {
    // increment score by current difficulty
    userScore += currDifficulty;
    updateScore(userScore);
    console.log('YOU WIN!!');
    hasWon = true;
    playRandomWinAnimation();

    world.bodies.forEach((body) => {

        // FLASH GOAL ON COLLISION
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

        }

        winBox.classList.remove('hidden');
        randWinText();
    });

}


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
    initBall();
    let foundGoal = findGoal();

    setInterval(() => {
        rotateBody(foundGoal);
    }, 33);
}

const makeHarder = () => {
    cellsHorizontal += 2;
    cellsVertical += 2;
    currDifficulty++
    if(cellsHorizontal === 20 && cellsVertical === 20) {
        currDifficulty = 1;
        cellsHorizontal = 4;
        cellsVertical = 4;
    }
    unitLengthX = width / cellsHorizontal;
    unitLengthY = height / cellsVertical;

    harderButton.innerText = `DIFFICULTY: ${currDifficulty}`
    reset();
};


// =============== 
// EVENT LISTENERS 
// =============== 


newButton.addEventListener('click', reset);
harderButton.addEventListener('click', makeHarder);
fasterButton.addEventListener('click', () => {
    if(ballVelocity < 6) { ballVelocity = (ballVelocity + 1) % 6; }
    if(ballVelocity == 0) { ballVelocity = 1 }
    fasterButton.innerText = `VELOCITY ${ballVelocity}`;
});

closeButton.addEventListener('click', () => {
    winBox.classList.add('hidden');
});

// SHOW INSTRUCTIONS

bannerText.addEventListener("mouseover", () => bannerText.innerText = "BY L.P 2020");
bannerText.addEventListener("mouseout", () => bannerText.innerText = " MAZE MALAISE");

bannerText.innerText = "W A S D >> MOVE";

setTimeout(() => {
    bannerText.innerText = ` MAZE MALAISE `;
    return;
}, 5000);



// make the walls
updateScore(0);
reset();