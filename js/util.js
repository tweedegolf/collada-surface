const mRandom = Math.random;
const mRound = Math.round;
const mPow = Math.pow; // eslint-disable-line no-restricted-properties

const getRandom = (min = 0, max = 10) => (mRandom() * (max - min)) + min;

const getRandomCoordinate = (constraints) => {
  let min = constraints.min.x;
  let max = constraints.max.x;
  const x = getRandom(min, max);

  min = constraints.min.y;
  max = constraints.max.y;
  const y = getRandom(min, max);

  min = constraints.min.z;
  max = constraints.max.z;
  const z = getRandom(min, max);

  return {
    x,
    y,
    z,
  };
};

const getRandomCoordinatesInsideShape = (constraints, shape, max) => {
  const coordinates = [];
  let i = 0;
  let check;
  let coordinate;

  const m = max || 25;

  while (i < m) {
    check = true;
    while (check) {
      coordinate = getRandomCoordinate(constraints);
      if (shape.isPointInPath(coordinate.x, coordinate.y)) {
        coordinates.push(coordinate);
        i += 1;
        check = false;
      }
    }
  }
  return coordinates;
};

const getRandomCoordinatesInsideShapeGrid =
  (constraints, shape, s = 30, o = 0, m = 0, optimise = false) => {
    const spread = parseInt(s, 10);
    const offset = parseInt(o, 10);
    const margin = parseInt(m, 10);

    // console.log(spread,offset,margin,constraints.max, constraints.min);

    const coordinates = [];
    const spreadY = spread;
    let spreadX = spread;
    let { x, y } = constraints.max;
    const w = x - constraints.min.x;
    const h = y - constraints.min.y;
    let row = 0;
    let posX = constraints.min.x + margin;
    let maxX = constraints.max.x - margin;
    let posY = constraints.min.y + margin;
    let minY = posY;
    let maxY = constraints.max.y - margin;


    if (optimise === true) {
    // needs some more work
    // spreadX = w/(Math.floor(w/spread));
    // spreadX = h/(Math.floor(h/spread));
      spreadX = w / (Math.floor(w / spread));
      spreadX = h / (Math.floor(h / spread));
      posX = constraints.min.x + (spreadX / 2);
      maxX = constraints.max.x - (spreadX / 2);
      posY = constraints.min.y + (spreadX / 2);
      minY = posY;
      maxY = constraints.max.y - (spreadX / 2);
    }

    // let i = 0;

    while (posY <= maxY) {
      x = posX + (mRandom() * offset);
      y = posY + (mRandom() * offset);
      if (shape.isPointInPath(x, y)) {
        coordinates.push({
          x, y, z: 0, r: row,
        });
      }

      posY += spreadY;

      // if(i > 3){
      //   break;
      // }
      // console.log(posY, spreadY);
      // i++;

      if (posY >= maxY) {
        row += 1;
        posY = minY;
        posX += spreadX;
        if (posX >= maxX) {
          break;
        }
      }
    }
    return coordinates;
  };


const round = (value, decimals = 0) => {
  if (decimals <= 0) {
    return mRound(value);
  }
  const p = mPow(10, decimals);
  // console.log(p, decimals)
  return mRound(value * p) / p;
};


export {
  round,
  getRandom,
  getRandomCoordinate,
  getRandomCoordinatesInsideShape,
  getRandomCoordinatesInsideShapeGrid,
};
