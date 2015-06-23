'use strict';

let mRandom = Math.random;
let mRound = Math.round;
let mPow = Math.pow;

export function getRandomCoordinate(constraints){
  let x,y,z,min,max;

  min = constraints.min.x;
  max = constraints.max.x;
  x = getRandom(min, max);

  min = constraints.min.y;
  max = constraints.max.y;
  y = getRandom(min, max);

  min = constraints.min.z;
  max = constraints.max.z;
  z = getRandom(min, max);

  return {
    x:x,
    y:y,
    z:z
  };
}

export function getRandom(min = 0, max = 10){
  return mRandom() * (max - min) + min;
}


export function getRandomCoordinatesInsideShape(constraints, shape, max){
  let i = 0,
    check,
    coordinates = [],
    coordinate;

  max = max || 25;

  while(i < max){
    check = true;
    while(check){
      coordinate = getRandomCoordinate(constraints);
      if(shape.isPointInPath(coordinate.x, coordinate.y)){
        coordinates.push(coordinate);
        i++;
        check = false;
      }
    }
  }
  return coordinates;
}


export function getRandomCoordinatesInsideShapeGrid(constraints, shape, spread = 30, offset = 0, margin = 0, optimise = false){

  spread = parseInt(spread, 10);
  offset = parseInt(offset, 10);
  margin = parseInt(margin, 10);

  //console.log(spread,offset,margin,constraints.max, constraints.min);

  let x = constraints.max.x,
    y = constraints.max.y,
    w = x - constraints.min.x,
    h = y - constraints.min.y,
    row = 0,
    coordinates = [],
    spreadX = spread,
    spreadY = spread,
    posX = constraints.min.x + margin,
    minX = posX,
    maxX = constraints.max.x - margin,
    posY = constraints.min.y + margin,
    minY = posY,
    maxY = constraints.max.y - margin;


  if(optimise === true){
    // needs some more work
    //spreadX = w/(Math.floor(w/spread));
    //spreadX = h/(Math.floor(h/spread));
    spreadX = w/(Math.floor(w/spread));
    spreadX = h/(Math.floor(h/spread));
    posX = constraints.min.x + spreadX/2;
    minX = posX;
    maxX = constraints.max.x - spreadX/2;
    posY = constraints.min.y + spreadX/2;
    minY = posY;
    maxY = constraints.max.y - spreadX/2;
  }

  //let i = 0;

  while(posY <= maxY){
    x = posX + (mRandom() * offset);
    y = posY + (mRandom() * offset);
    if(shape.isPointInPath(x, y)){
      coordinates.push({x:x, y:y, z: 0, r: row});
    }

    posY = posY + spreadY;

    // if(i > 3){
    //   break;
    // }
    // console.log(posY, spreadY);
    // i++;

    if(posY >= maxY){
      row += 1;
      posY = minY;
      posX = posX + spreadX;
      if(posX >= maxX){
        break;
      }
    }
  }
  return coordinates;
}


export function round(value, decimals = 0){
  if(decimals <= 0){
    return mRound(value);
  }
  var p = mPow(10, decimals);
  //console.log(p, decimals)
  return mRound(value * p)/p;
}
