let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});

//Create a tink
let t = new Tink(PIXI, app.renderer.view);
let pointer = t.makePointer();

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x061639;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

PIXI.loader.load(setup);

let line_spacing = 40;
let num_vert_lines = 9;
let bold_line_v = 2;
let vert_line_length = (num_vert_lines+1)*line_spacing;
let num_hori_lines = 9;
let bold_line_h = 8-2;
let hori_line_length = (num_hori_lines+1)*line_spacing;
let vertical_offset = -100;

function plot_graph(){
    for (i = 0; i < num_hori_lines; i++) {
        let line = new PIXI.Graphics();
        if (i == bold_line_h){
            line.lineStyle(4, 0xFFFFFF, 1);
        }else{
            line.lineStyle(1, 0xFFFFFF, 1);
        }
        x_start = window.innerWidth/2 - line_spacing*(num_hori_lines/2 + .5);
        y_start = vertical_offset + line_spacing * (i - num_hori_lines/2 + .5) + window.innerHeight/2;
        line.moveTo(x_start, y_start);
        line.lineTo(x_start+hori_line_length, y_start);
        app.stage.addChild(line);
    }
    for (i = 0; i < num_vert_lines; i++) {
        let line = new PIXI.Graphics();
        if (i == bold_line_v){
            line.lineStyle(4, 0xFFFFFF, 1);
        }else{
            line.lineStyle(1, 0xFFFFFF, 1);
        }
        x_start = line_spacing * (i - num_vert_lines/2 + .5) + window.innerWidth/2;
        y_start = vertical_offset + window.innerHeight/2 - line_spacing*(num_vert_lines/2 + .5);
        line.moveTo(x_start, y_start);
        line.lineTo(x_start, y_start+vert_line_length);
        app.stage.addChild(line);
    }
}

function plot_sol(){
    let line = new PIXI.Graphics();
    line.lineStyle(2, 0xe2f026, 1);
    x_start = window.innerWidth/2 - line_spacing*(num_hori_lines/2 + .5);
    y_start = vertical_offset + window.innerHeight/2 + line_spacing*(num_vert_lines/2 + .5);
    line.moveTo(x_start, y_start);
    line.lineTo(x_start+hori_line_length, y_start-vert_line_length);
    app.stage.addChild(line);
}

function plot_mink(velocity){ // velocity as v * c.
    inter_point_x = line_spacing * (bold_line_v - num_vert_lines/2 + .5) + window.innerWidth/2;
    inter_point_y = vertical_offset + line_spacing * (bold_line_h - num_hori_lines/2 + .5) + window.innerHeight/2;
    console.log("ix " + inter_point_x);
    console.log("iy " + inter_point_y);
    m = 1/velocity;
    b = m * inter_point_x + inter_point_y;
    for(i = 0; i < num_vert_lines; i++){
        vert_down = -line_spacing*(num_hori_lines-bold_line_h);
        start_p = intersection_of(m, -m*line_spacing*i, 1/m, 0);
        d_start = inter_point_x + start_p[0];
        t_start = inter_point_y - start_p[1];
        _b = m * d_start + d_start;
        console.log(start_p);
        let line = new PIXI.Graphics();
        line.lineStyle(2, 0x5ff026, 1);
        line.moveTo(d_start, t_start);
        delta_d = (((num_hori_lines+1)*line_spacing)/m)+(vert_down/m)-((1/m)*line_spacing*i/m);
        console.log(delta_d);
        line.lineTo(d_start + delta_d, t_start - m*(delta_d));
        app.stage.addChild(line);
    }
    for(i = 0; i < num_hori_lines; i++){

    }
}

function fl_y(value){
    return window.innerHeight - value;
}

function intersection_of(m1, b1, m2, b2){
    if(m1 == m2){
        return [0,0]; // silent error i guess...
    }else{
        let x = (b2-b1)/(m1-m2);
        let y = m1 * x + b1;
        return [x,y];
    }
}

plot_graph();
plot_sol();
plot_mink(.3);

function setup() {
    //Set the game state
    state = play;
    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta){
    //Update the current game state:
    state(delta);
}

function play(delta) {
    t.update();
    if(pointer.isDown){
        console.log("X: " + pointer.x + " | Y: " + pointer.y);
    }
}