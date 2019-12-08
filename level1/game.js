"use strict";

//Create a Pixi Application

const app = new PIXI.Application({width: 256, height: 256});

let t = new Tink(PIXI, app.renderer.view);

let pointer = t.makePointer();

pointer.press = () => click(pointer.x, pointer.y);




let circlePoints = [];
const angle = _degreesToRadians(90 - Math.floor(Math.random() * Math.floor(45)));

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

app.renderer.backgroundColor = 0x061639;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

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
  fontSize: 36,
  fill: "white"

  });

  let index = circlePoints.length / 2;

  let message = new PIXI.Text(index, style);
  app.stage.addChild(message);
  message.position.set(x, y);
  message.style.fontSize = 32;
}

function click(x, y){

  let button_x = window.innerWidth - 100;
  let button_y = window.innerHeight - 50;

  if (Math.abs(button_x - x) < 50 && Math.abs(button_y - y) < 50)
    evaluateWinner();


  for (var i = 0; i < 3; i++){


    let point_x = circlePoints[i*2];
    let point_y = window.innerHeight - circlePoints[i*2 + 1];

    if (Math.abs(point_x - x) < 5 && Math.abs(point_y - y) < 5){
      circleClicked(i + 1);
      break;
    }


  }

}

function evaluateWinner(){
  let userOrder = findOrder();
  let actualOrder = calculateOrder();
  if (arraysMatch(userOrder,actualOrder))
    {window.alert("Correct!");}
  else{
    window.alert("Incorrect! Please Try Again");
    console.log(actualOrder);
    console.log(userOrder);
  }



}

function arraysMatch (arr1, arr2) {

	// Check if the arrays are the same length
	if (arr1.length !== arr2.length) return false;

	// Check if all items exist and are in the same order
	for (var i = 0; i < arr1.length; i++)
		if (arr1[i] !== arr2[i]) return false;


	// Otherwise, return true
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



  // var len = yVals.length;
  // var indices = new Array(len);
  // for (var i = 0; i < len; ++i) indices[i] = i + 1;
  // indices.sort((a, b) => { return yVals[a - 1] > yVals[b - 1] ? -1 : yVals[a - 1] < yVals[b - 1] ? 1 : 0; });
  //
  // let order = [];
  // for (let i = 0; i < 3; i ++)
  //   order.push(parseInt(children[2 * indices[i] - 1].text));


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

function drawLine(x,y){
  let line = new PIXI.Graphics();
  line.lineStyle(4, 0xFFFFFF, 1);
  line.moveTo(0, window.innerHeight);
  line.lineTo(x, y);


  app.stage.addChild(line);
}

function _degreesToRadians(x){
  return (x/180 * Math.PI);
}

function main(){

  console.log("ok");

  PIXI.loader
    .add("images/button.png")
    .load(setup);

  //This `setup` function will run when the image has loaded
  function setup() {

    //Create the cat sprite
    let button = new PIXI.Sprite(PIXI.loader.resources["images/button.png"].texture);

    button.x = window.innerWidth - 200;
    button.y = window.innerHeight - 100;
    button.width = 200;
    button.height = 100;

    //Add the cat to the stage
    app.stage.addChild(button);
  }


  for (let i = 0; i < 3; i++){

    let rand_x = Math.floor(Math.random() * ((window.innerHeight - 5)  - (5) + 1)) + 5;
    let rand_y = Math.floor(Math.random() * ((window.innerHeight - 5) - (5) + 1)) + 5;

    circlePoints.push(rand_x, window.innerHeight - rand_y);

    drawCircle(rand_x, rand_y);

  }

  let x_point = window.innerHeight / Math.tan(angle);

  drawLine(x_point,0);
}

main();
