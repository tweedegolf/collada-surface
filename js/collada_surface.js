import { createCollada } from './collada';
import { getRandom, getRandomCoordinatesInsideShapeGrid, getRandomCoordinatesInsideShape } from './util';

let timestamp;

const getRandomCollada = (colladas) => {
  const r = getRandom(0, colladas.length);
  const c = colladas[r];
  colladas = colladas.slice(r);
  return c;
};


export default function createColladaSurface(config) {
  const mRound = Math.round;

  function executor(resolve) {
    console.time('loading');
    timestamp = window.performance.now();

    const models = [];
    const ratios = [];
    const numElements = config.models.length;
    let coordinates;

    config.models.forEach((cfg) => {
      models.push(cfg.url);
      ratios.push(cfg.ratio);
    });

    // if no ratios are given, just spread evenly
    if (ratios.length === 0) {
      let i = 0;
      const r = mRound(100 / numElements);
      while (i < numElements) {
        ratios.push(r);
        i += 1;
      }
    }

    if (config.type === 'grid') {
      coordinates = getRandomCoordinatesInsideShapeGrid(config.bb, config.context, config.spread, config.offset, config.margin);
    } else {
      coordinates = getRandomCoordinatesInsideShape(config.bb, config.context, config.number);
    }

    const numModels = coordinates.length;
    const colladas = [];
    let j = 0;
    for (let i = 0; i < numElements; i += 1) {
      colladas.push(models[j]);
      if (i === ratios[j]) {
        j += 1;
      }
    }

    // console.log(coordinates);

    function loop(i) {
      if (i < numModels) {
        createCollada(getRandomCollada(colladas)).then((collada) => {
          collada.position.x = coordinates[i].x;
          collada.position.y = coordinates[i].y;
          collada.position.z = 0;
          collada.rotation.z = getRandom(0, 360);
          collada.scale.set(1, 1, 1);
          world.add(collada);
          loop(++i);
        });
      } else {
        // ready
        console.timeEnd('loading');
        resolve({
          took: window.performance.now() - timestamp,
          numColladas: numModels,
        });
      }
    }
    loop(0);
  }

  return new Promise(executor);
}
