let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

//Create a Pixi Application
let app = new PIXI.Application({width: 256, height: 256});

//Create a tink
let t = new Tink(PIXI, app.renderer.view);
let pointer = t.makePointer();

let guesses = [];

let wasPressed = false;

let data;

let button_created = false;

let submit_button;

const point_one_color = 0xe34b4b;
const point_two_color = 0x4b92e3;
const point_three_color = 0xbd4be3;

const button_radius = 20;

const circle_radius = 10;

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

class circle_wrapper {
    constructor(graphics_object, point){
        this.graphics = graphics_object;
        this.point = point;
    }
}

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

function a2r(x, y){
    return [-inter_point_x + x, inter_point_y - y];
}

function within_bounds(point){
    x = point[0];
    y = point[1];
    if(x > max_x){
        return false;
    }
    if(x < min_x){
        return false;
    }
    if(y > max_y){
        return false;
    }
    if(y < min_y){
        return false;
    }
    return true;
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
        start_p = [i * Math.cos(d_theta) * line_spacing*angled_delta, i * Math.sin(d_theta) * line_spacing*angled_delta];
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
        start_p = [i * Math.sin(d_theta) * line_spacing*angled_delta, i * Math.cos(d_theta) * line_spacing*angled_delta];
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

function point_dist(point0, point1){
    x_diff = point0[0] - point1[0];
    y_diff = point0[1] - point1[1];
    x_squared = Math.pow(x_diff, 2);
    y_squared = Math.pow(y_diff, 2);
    result = Math.sqrt(x_squared + y_squared);
    return result;
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
    plot_min_nor_point(point_one, b, x_start, white_y, green_y, ratio, point_one_color);
    plot_min_nor_point(point_two, b, x_start, white_y, green_y, ratio, point_two_color);
    plot_min_nor_point(point_three, b, x_start, white_y, green_y, ratio, point_three_color);
}

function plot_min_nor_point(point, b, x_offset, white_y, green_y, ratio, color){ // Helper function, used but don't worry about it.
    x = point[0];
    y = point[1];
    mink_x = (x - y*b)/Math.sqrt(1-Math.pow(b, 2));
    mink_y = (y - x*b)/Math.sqrt(1-Math.pow(b, 2));
    white_dash_x = ratio*x + x_offset;
    plot_dash(white_dash_x, white_y, color, 3, 15)
    green_dash_x = ratio*mink_x + x_offset;
    plot_dash(green_dash_x, green_y, color, 3, 15)
}

function plot_dash(x_pos, y_cent, color, line_width, dash_height){
    let dash = new PIXI.Graphics();
    dash.lineStyle(line_width, color, 1);
    dash.moveTo(x_pos, y_cent+dash_height);
    dash.lineTo(x_pos, y_cent-dash_height);
    app.stage.addChild(dash);
}

function generate_all(){
    b = Math.random() * .4 + .05;
    // b = .5;
    while(true){
        point_one = generate_point(b);
        point_two = generate_point(b);
        point_three = generate_point(b);
        min_point_dist = (2*circle_radius)/line_spacing;
        if(Math.min(point_dist(point_one, point_two), point_dist(point_one, point_three), point_dist(point_two, point_three)) > min_point_dist){
            break;
        }
    }
    return [b, point_one, point_two, point_three];
}

function generate_point(b){
    while(true){
        x = Math.random() * (bold_line_h + 1);
        y = Math.random() * (num_vert_lines - bold_line_v);
        mink_x = (x - y*b)/Math.sqrt(1-Math.pow(b, 2));
        mink_y = (y - x*b)/Math.sqrt(1-Math.pow(b, 2));
        if(mink_x >= 0 && mink_y >= 0){
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
    if(!button_created){
        submit_button = createButton();
        button_created = true;
    }
    if(pointer.isUp && wasPressed){
        wasPressed = false;
        button_pressed = test_button_pressed([pointer.x, pointer.y])
        if(button_pressed){
            if(guesses.length == 3){
                for(i = 0; i < 3; i++){
                    new_point = r2a(data[i+1][0]*line_spacing, data[i+1][1]*line_spacing);
                    circle = new PIXI.Graphics();
                    if(i == 0){
                        circle.beginFill(point_one_color);
                    }else if(i == 1){
                        circle.beginFill(point_two_color);
                    }else{
                        circle.beginFill(point_three_color);
                    }
                    circle.drawCircle(new_point[0], new_point[1], circle_radius);
                    app.stage.addChild(circle);
                }
                alert(assign_score());
            }else{
                alert("There should be exactly 3 points...");
            }
        }else{
            removed = test_to_remove_points(pointer.x, pointer.y);
            if(!removed && within_bounds(a2r(pointer.x, pointer.y))){
                circle = new PIXI.Graphics();
                circle.beginFill(0xfeffb3);
                circle.drawCircle(pointer.x, pointer.y, circle_radius);
                app.stage.addChild(circle);
                cir_obj = new circle_wrapper(circle, [pointer.x, pointer.y]);
                guesses.push(cir_obj);
            }
        }
    }else if(pointer.isDown){
        wasPressed = true;
    }
}

function createButton(){
    circle = new PIXI.Graphics();
    circle.beginFill(0xe34b4b);
    x_pos = window.innerWidth * .95;
    y_pos = (innerWidth * .05);
    circle.drawCircle(x_pos, y_pos, button_radius);
    app.stage.addChild(circle);
    button_obj = new circle_wrapper(circle, [x_pos, y_pos])
    return button_obj;
}

function test_to_remove_points(x, y){
    val = false;
    for(i = 0; i < guesses.length; i++){
        if(point_dist(guesses[i].point, [x, y]) <= circle_radius){
            app.stage.removeChild(guesses[i].graphics);
            guesses.splice(i, 1);
            val = true;
        }
    }
    return val;
}

function test_button_pressed(click_point){
    if(point_dist(click_point, submit_button.point) <= button_radius){
        return true;
    }
    return false;
}

function assign_score(){
    let score_orders = {0: [0, 1, 2], 1: [1, 2, 0], 2: [2, 0, 1], 3: [0, 2, 1], 4: [2, 1, 0], 5: [1, 0, 2]};
    let scores = [];
    for(i = 0; i < 6; i++){
        scores.push(evaluate_score(score_orders[i]));
    }
    return Math.min(...scores);
}

function evaluate_score(order){
    data_one = [data[1][0]*line_spacing, data[1][1]*line_spacing];
    data_two = [data[2][0]*line_spacing, data[2][1]*line_spacing];
    data_three = [data[3][0]*line_spacing, data[3][1]*line_spacing];
    guess_one = a2r(guesses[order[0]].point[0], guesses[order[0]].point[1]);
    guess_two = a2r(guesses[order[1]].point[0], guesses[order[1]].point[1]);
    guess_three = a2r(guesses[order[2]].point[0], guesses[order[2]].point[1]);
    val0 = point_dist(guess_one, data_one)/line_spacing;
    val1 = point_dist(guess_two, data_two)/line_spacing;
    val2 = point_dist(guess_three, data_three)/line_spacing;
    score = Math.pow(val0, 2) + Math.pow(val1, 2) + Math.pow(val2, 2);
    return score;
}