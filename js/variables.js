// ========= //
// MAZE GAME //
// ========= //
// destructure functions out of Matter object
const { Engine, Render, Body, Bodies, Events, Runner, World, Mouse, MouseConstraint } = Matter;
// =========
// SELECTORS
// =========
const cnv = document.querySelector('canvas');
const winBox = document.querySelector('.winner');
const matterCanvas = document.querySelector('#matterCanvas');
const bannerText = document.querySelector('#bannertext');
const newButton = document.querySelector('#new');
const harderButton = document.querySelector('#harder');
const fasterButton = document.querySelector('#faster');
const scoreButton = document.querySelector('#score');
const closeButton = document.querySelector('.closebutton');
// =====================
// GLOBAL GAME VARIABLES
// =====================
// COLOURS //
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

let hasWon = false;
let userScore = 0;
let ballVelocity = 1;

//  create engine variable
const engine = Engine.create();
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;
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
const config = {
    width: cnv.width,
    height: cnv.height,
    cellsHorizontal: 4,
    cellsVertical: 4,
    get unitLengthX() { return this.width / this.cellsHorizontal; },
    get unitLengthY() { return this.height / this.cellsVertical; },
};
let { width, height, cellsHorizontal, cellsVertical, unitLengthX, unitLengthY } = config;
// start renderer
Render.run(render);
Runner.run(Runner.create(), engine);


let mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;
Events.on(mouseConstraint, "startdrag", (event) => {
    if(event.body.label === "Ball") {
        console.log(event);
    }

})