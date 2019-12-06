let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x061639;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

PIXI.loader.load(setup);

let circle_t;

circle_t = new PIXI.Graphics();
circle_t.beginFill(0xfeffb3);
circle_t.drawCircle(100, 100, 10);
circle_t.endFill();
circle_t.x = 0;
circle_t.y = 0;
circle_t.vx = 0;
circle_t.vy = 0;
app.stage.addChild(circle_t);

function setup() {
    let left = keyboard("ArrowLeft"), up = keyboard("ArrowUp"), right = keyboard("ArrowRight"), down = keyboard("ArrowDown");
    //Set the game state
    state = play;

    //Left arrow key `press` method
    left.press = () => {
        //Change the circle's velocity when the key is pressed
        circle_t.vx = -5;
        circle_t.vy = 0;
    };
  
    //Left arrow key `release` method
    left.release = () => {
        //If the left arrow has been released, and the right arrow isn't down,
        //and the circle isn't moving vertically:
        //Stop the cat
        if (!right.isDown && circle_t.vy === 0) {
        circle_t.vx = 0;
        }
    };

    //Up
    up.press = () => {
        circle_t.vy = -5;
        circle_t.vx = 0;
    };
    up.release = () => {
        if (!down.isDown && circle_t.vx === 0) {
            circle_t.vy = 0;
        }
    };

    //Right
    right.press = () => {
        circle_t.vx = 5;
        circle_t.vy = 0;
    };
    right.release = () => {
        if (!left.isDown && circle_t.vy === 0) {
            circle_t.vx = 0;
        }
    };

    //Down
    down.press = () => {
        circle_t.vy = 5;
        circle_t.vx = 0;
    };
    down.release = () => {
        if (!up.isDown && circle_t.vx === 0) {
            circle_t.vy = 0;
        }
    };

    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){
    //Update the current game state:
    state(delta);
}

function play(delta) {
    //Use the circle's velocity to make it move
    circle_t.x += circle_t.vx;
    circle_t.y += circle_t.vy
    console.log("X: " + circle_t.x + " | Y: " + circle_t.y);
    console.log("dX: " + circle_t.vx + " | dY: " + circle_t.vy);
}

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }   
  };

  //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
  
    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );
    
    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };
  
    return key;
}