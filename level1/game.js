"use strict";

const app = new PIXI.Application({width: 256, height: 256, antialias: true});

const t = new Tink(PIXI, app.renderer.view);

let pointer = t.makePointer();

pointer.press = () => click(pointer.x, pointer.y);

let circlePoints = [];
let angle = _degreesToRadians(80 - Math.floor(Math.random() * Math.floor(25)));

let line_spacing = 100;
let max_y = window.innerHeight;
let max_x = window.innerHeight;

let inter_point_x = 0;
let inter_point_y = window.innerHeight;

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x061639;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

PIXI.loader
  .add("images/submit.png")
  .add("images/reload.png")
  .load(setup);

function setup() {

  let submitButton = new PIXI.Sprite(PIXI.loader.resources["images/submit.png"].texture);

  submitButton.x = window.innerWidth - 200;
  submitButton.y = window.innerHeight - 100;
  submitButton.width = 200;
  submitButton.height = 100;


  app.stage.addChild(submitButton);

  let reloadButton = new PIXI.Sprite(PIXI.loader.resources["images/reload.png"].texture);

  reloadButton.x = window.innerWidth - 150;
  reloadButton.y = 25;
  reloadButton.width = 100;
  reloadButton.height = 100;


  app.stage.addChild(reloadButton);
}

function click(x, y){

  let submitButtonX = window.innerWidth - 100;
  let submitButtonY = window.innerHeight - 50;

  let reloadButtonX = window.innerWidth - 100;
  let reloadButtonY = 75;

  if (Math.abs(submitButtonX - x) < 50 && Math.abs(submitButtonY - y) < 50)
    evaluateWinner();

  if (Math.abs(reloadButtonX - x) < 50 && Math.abs(reloadButtonY - y) < 50)
    reload();


  for (var i = 0; i < 3; i++){


    let point_x = circlePoints[i*2];
    let point_y = window.innerHeight - circlePoints[i*2 + 1];

    if (Math.abs(point_x - x) < 5 && Math.abs(point_y - y) < 5){
      circleClicked(i + 1);
      break;
    }


  }

}

function reload(){
  const len = app.stage.children.length;

  const submitButton = app.stage.children[7];
  const reloadButton = app.stage.children[8];
  for (let i = 0; i < len; i++){

    try{
      app.stage.children.shift();
    }catch(error){
      continue;
    }
  }


  circlePoints = [];
  angle = _degreesToRadians(80 - Math.floor(Math.random() * Math.floor(25)));

  main();

  app.stage.addChild(submitButton);
  app.stage.addChild(reloadButton);

}

function evaluateWinner(){
  let userOrder = findOrder();
  let actualOrder = calculateOrder();
  if (arraysMatch(userOrder,actualOrder)){

    window.alert("Correct!");
    plot_mink(Math.tan(Math.PI/2 - angle));
    //reload();

  }
  else{
    window.alert("Incorrect! Please Try Again");
  }

}

function arraysMatch (arr1, arr2) {

	if (arr1.length !== arr2.length) return false;

	for (var i = 0; i < arr1.length; i++)
		if (arr1[i] !== arr2[i]) return false;

	return true;

}

function circleClicked(index){

  let nextNumber = {1: 2, 2:3, 3:1};

  let num = 2*index - 1;

  let currentText = app.stage.children[num].text;

  app.stage.children[num].text = nextNumber[currentText];

}

function findOrder(){

  let children = app.stage.children;
  let yVals = [];
  for (let i = 0; i < 3; i++){
    let y = children[2*i + 1].text;
    yVals.push(parseInt(y));
  }

  let len = yVals.length;
  let order = new Array(len);
  for (var i = 0; i < len; ++i) order[i] = i + 1;
  order.sort((a, b) => { return yVals[a - 1] < yVals[b - 1] ? -1 : yVals[a - 1] < yVals[b - 1] ? 1 : 0; });

  return order;


}

function calculateOrder(){

  let gamma = Math.tan(Math.PI/2 - angle);

  let points_x = [];
  let points_y = [];
  for (let i = 0; i < 6; i++){
    if (i % 2 === 0)
      points_x.push(circlePoints[i]);
    else
      points_y.push(circlePoints[i]);

  }

  let yPrime = [];

  for (let i = 0; i < 3; i++){

    let x = points_x[i];
    let y = points_y[i];


    let yVal = (y - x*gamma)/(Math.sqrt(1 - Math.pow(gamma, 2)));

    yPrime.push(yVal);

  }

  var len = yPrime.length;
  var indices = new Array(len);
  for (var i = 0; i < len; ++i) indices[i] = i + 1;
  indices.sort((a, b) => { return yPrime[a - 1] < yPrime[b - 1] ? -1 : yPrime[a - 1] > yPrime[b - 1] ? 1 : 0; });


  return indices;

}

function drawCircle(x, y){
  let circle = new PIXI.Graphics();
  circle.beginFill(0xfeffb3);
  circle.drawCircle(0, 0, 10);
  circle.endFill();
  circle.x = x;
  circle.y = y;
  app.stage.addChild(circle);


  let style = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 32,
  fill: "white"

  });

  let index = circlePoints.length / 2;

  let message = new PIXI.Text(index, style);
  app.stage.addChild(message);
  message.position.set(x, y);
}

function drawLine(x1, y1, x2, y2){
  let line = new PIXI.Graphics();
  line.lineStyle(4, 0xFFFFFF, 1);
  line.moveTo(x1, y1);
  line.lineTo(x2, y2);


  app.stage.addChild(line);
}

function _degreesToRadians(x){
  return (x/180 * Math.PI);
}

function r2a(x, y){
    return [inter_point_x + x, inter_point_y - y];
}

function graph_line_r2a(start_p, end_p, color, line_width){
    let line = new PIXI.Graphics();
    line.lineStyle(line_width, color, 1);
    let graphable_start = r2a(start_p[0], start_p[1]);
    let graphable_end = r2a(end_p[0], end_p[1]);



    line.moveTo(graphable_start[0], graphable_start[1]);
    line.lineTo(graphable_end[0], graphable_end[1]);
    app.stage.addChild(line);
}

function plot_mink(velocity){ // velocity as v * c.
    let m = 1/velocity;
    let b = m * inter_point_x + inter_point_y;
    let angled_delta = 1/Math.sqrt(1-Math.pow(velocity, 2));
    let d_theta = Math.atan(velocity);
    let i = 0;

    while (true){

        let start_p = [i * Math.cos(d_theta) * line_spacing, i * Math.sin(d_theta) * line_spacing];
        let delta_y = max_y - start_p[1];
        let delta_x = delta_y/m;
        let end_p = [delta_x + start_p[0], delta_y + start_p[1]];
        if(end_p[0] > max_x){
            delta_x = max_x - start_p[0];
            delta_y = m * delta_x;
            end_p[1] = delta_y + start_p[1];
            end_p[0] = max_x;
         }

     if (start_p[0] > max_y)
       break;

     i += 1;
     graph_line_r2a(start_p, end_p, 0x5ff026, 2);

     }

     i = 0;

     while (true){

         let start_p = [i * Math.sin(d_theta) * line_spacing, i * Math.cos(d_theta) * line_spacing];
         let delta_x = max_x - start_p[0];
         let delta_y = delta_x*velocity;
         let end_p = [delta_x + start_p[0], delta_y + start_p[1]];
         if(end_p[1] > max_y){
             delta_y = max_y - start_p[1];
             delta_x = delta_y/velocity;
             end_p[0] = delta_x + start_p[0];
             end_p[1] = max_y;
         }

     if (start_p[1] > max_x)
       break;

     graph_line_r2a(start_p, end_p, 0x5ff026, 2);
     i += 1;

    }
}

function generatePoint(){
  let rand_x = Math.floor(Math.random() * ((window.innerHeight - 5)  - (5) + 1)) + 5;
  let rand_y = Math.floor(Math.random() * ((window.innerHeight - 5) - (5) + 1)) + 5;

  let point_angle = Math.atan((window.innerHeight - rand_y)/rand_x);

  if (point_angle > angle || point_angle < Math.PI/2 - angle)
    return generatePoint();

  return [rand_x, rand_y];

}

function main(){

  for (let i = 0; i < 3; i++){

    let [x_point, y_point] = generatePoint();

    circlePoints.push(x_point, window.innerHeight - y_point);

    drawCircle(x_point, y_point);

  }

  let x_point = window.innerHeight / Math.tan(angle);

  drawLine(0, window.innerHeight, x_point,0);

}

main();
