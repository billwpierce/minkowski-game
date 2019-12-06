"use strict";

//Create a Pixi Application

const app = new PIXI.Application({width: 256, height: 256});

let t = new Tink(PIXI, app.renderer.view);

let pointer = t.makePointer();

pointer.press = () => click(pointer.x, pointer.y);

let circlePoints = [];

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

  for (var i = 0; i < 3; i++){


    let point_x = circlePoints[i*2];
    let point_y = circlePoints[i*2 + 1];

    if (Math.abs(point_x - x) < 5 && Math.abs(point_y - y) < 5){
      circleClicked(i + 1);
      break;
    }


  }

}

function circleClicked(index){

  console.log(index);

  let nextNumber = {1: 2, 2:3, 3:1};

  let num = 2*index - 1;

  let currentText = app.stage.children[num].text;

  app.stage.children[num].text = nextNumber[currentText];

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


  for (let i = 0; i < 3; i++){

    let rand_x = Math.floor(Math.random() * ((window.innerHeight - 5)  - (5) + 1)) + 5;
    let rand_y = Math.floor(Math.random() * ((window.innerHeight - 5) - (5) + 1)) + 5;

    circlePoints.push(rand_x, rand_y);

    drawCircle(rand_x, rand_y);

  }


  let angle = _degreesToRadians(90 - Math.floor(Math.random() * Math.floor(45)));

  let x_point = window.innerHeight / Math.tan(angle);

  drawLine(x_point,0);
}

main();
