let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});

//Create a tink
let t = new Tink(PIXI, app.renderer.view);
let pointer = t.makePointer();

const line_spacing = 40;
const num_vert_lines = 9;
const bold_line_v = 1;
const vert_line_length = (num_vert_lines+1)*line_spacing;
const num_hori_lines = 9;
const bold_line_h = 8-1;
const hori_line_length = (num_hori_lines+1)*line_spacing;
const vertical_offset = -100;
const max_y = line_spacing * (num_vert_lines - bold_line_v);
const min_y = line_spacing * (- 1 - bold_line_v);
const max_x = line_spacing * (bold_line_h + 1);
const min_x = -1 * line_spacing * (num_hori_lines - bold_line_h);

const inter_point_x = line_spacing * (bold_line_v - num_vert_lines/2 + .5) + window.innerWidth/2;
const inter_point_y = vertical_offset + line_spacing * (bold_line_h - num_hori_lines/2 + .5) + window.innerHeight/2;

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x061639;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

PIXI.loader.load(setup);

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

function r2a(x, y){
    return [inter_point_x + x, inter_point_y - y];
}

function graph_line_r2a(start_p, end_p, color, line_width){
    let line = new PIXI.Graphics();
    line.lineStyle(line_width, color, 1);
    graphable_start = r2a(start_p[0], start_p[1]);
    graphable_end = r2a(end_p[0], end_p[1]);
    line.moveTo(graphable_start[0], graphable_start[1]);
    line.lineTo(graphable_end[0], graphable_end[1]);
    app.stage.addChild(line);
}

function intersection_ps(m0, point0, m1, point1){
    x0 = point0[0];
    y0 = point0[1];
    x1 = point1[0];
    y1 = point1[1];
    x = (m0 * x0 - m1 * x1 + y1 - y0)/(m0-m1);
    y = m0 * (x - x0) + y0;
    return [x, y];
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
    m = 1/velocity;
    b = m * inter_point_x + inter_point_y;
    angled_delta = 1/Math.sqrt(1-Math.pow(velocity, 2));
    d_theta = Math.atan(velocity);
    for(i = 0; i < num_vert_lines; i++){
        start_p = [i * Math.cos(d_theta) * line_spacing, i * Math.sin(d_theta) * line_spacing];
        delta_y = max_y - start_p[1];
        delta_x = delta_y/m;
        end_p = [delta_x + start_p[0], delta_y + start_p[1]];
        if(end_p[0] > max_x){
            delta_x = max_x - start_p[0];
            delta_y = m * delta_x;
            end_p[1] = delta_y + start_p[1];
            end_p[0] = max_x;
        }
        graph_line_r2a(start_p, end_p, 0x5ff026, 2);
    }
    t_theta = Math.atan(velocity);
    for(i = 0; i < num_hori_lines; i++){
        start_p = [i * Math.sin(d_theta) * line_spacing, i * Math.cos(d_theta) * line_spacing];
        delta_x = max_x - start_p[0];
        delta_y = delta_x*velocity;
        end_p = [delta_x + start_p[0], delta_y + start_p[1]];
        if(end_p[1] > max_y){
            delta_y = max_y - start_p[1];
            delta_x = delta_y/velocity;
            end_p[0] = delta_x + start_p[0];
            end_p[1] = max_y;
        }
        graph_line_r2a(start_p, end_p, 0x5ff026, 2);
    }
}

function plot_timelines(generated_data){
    b = generated_data[0];
    point_one = generated_data[1];
    point_two = generated_data[2];
    point_three = generated_data[3];
    // Graph the lines
    let white_line = new PIXI.Graphics();
    let green_line = new PIXI.Graphics();
    white_line.lineStyle(3, 0xFFFFFF, 1);
    green_line.lineStyle(3, 0x5ff026, 1);
    x_start = window.innerWidth * .15;
    x_end = window.innerWidth * .85;
    lower_graph = inter_point_y - min_y;
    delta_y = window.innerHeight - lower_graph;
    white_y = lower_graph + delta_y * .4;
    green_y = lower_graph + delta_y * .7;
    white_line.moveTo(x_start, white_y);
    green_line.moveTo(x_start, green_y);
    white_line.lineTo(x_end, white_y);
    green_line.lineTo(x_end, green_y);
    app.stage.addChild(white_line);
    app.stage.addChild(green_line);

    line_length = x_end - x_start;
    ratio = line_length/(bold_line_h + 1);
    for(i = 0; i < (bold_line_h + 1) + 1; i++){
        plot_dash(x_start + i * ratio, white_y, 0xFFFFFF, 2, 5);
        plot_dash(x_start + i * ratio, green_y, 0x5ff026, 2, 5);
    }
    // Place the points on the timelines.
    plot_min_nor_point(point_one, b, x_start, white_y, green_y, ratio);
    plot_min_nor_point(point_two, b, x_start, white_y, green_y, ratio);
    plot_min_nor_point(point_three, b, x_start, white_y, green_y, ratio);
    console.log("test");
}

function plot_min_nor_point(point, b, x_offset, white_y, green_y, ratio){ // Helper function, used but don't worry about it.
    x = point[0];
    y = point[1];
    mink_x = (x - y*b)/Math.sqrt(1-Math.pow(b, 2));
    mink_y = (y - x*b)/Math.sqrt(1-Math.pow(b, 2));
    white_dash_x = ratio*x + x_offset;
    plot_dash(white_dash_x, white_y, 0xFFFFFF, 2, 10)
    green_dash_x = ratio*mink_x + x_offset;
    plot_dash(green_dash_x, green_y, 0x5ff026, 2, 10)
}

function plot_dash(x_pos, y_cent, color, line_width, dash_height){
    let dash = new PIXI.Graphics();
    dash.lineStyle(line_width, color, 1);
    dash.moveTo(x_pos, y_cent+dash_height);
    dash.lineTo(x_pos, y_cent-dash_height);
    app.stage.addChild(dash);
    console.log(dash_height);
}

function generate_all(){
    b = Math.random() * .4 + .05;
    point_one = generate_point(b);
    point_two = generate_point(b);
    point_three = generate_point(b);
    return [b, point_one, point_two, point_three];
}

function generate_point(b){
    while(true){
        x = Math.random() * (bold_line_h + 1);
        y = Math.random() * (num_vert_lines - bold_line_v);
        mink_x = (x - y*b)/Math.sqrt(1-Math.pow(b, 2));
        mink_y = (y - x*b)/Math.sqrt(1-Math.pow(b, 2));
        if(mink_x >= 0 && mink_y >= 0){
            console.log(mink_x);
            return [x, y];
        }
    }
}

function setup() {
    data = generate_all();
    plot_graph();
    plot_mink(data[0]);
    plot_sol();
    plot_timelines(data);
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