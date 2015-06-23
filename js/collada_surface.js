'use strict';

import {createCollada} from './collada';
import {getRandom, getRandomCoordinatesInsideShapeGrid, getRandomCoordinatesInsideShape} from './util';

let timestamp;

export default function createColladaSurface(config){

  let mRound = Math.round;

  function executor(resolve, reject){
    console.time('loading');
    timestamp = window.performance.now();

    let models = [];
    let ratios = [];
    let numElements = config.models.length;
    let coordinates;
    let result = [];

    config.models.forEach(function(cfg){
      models.push(cfg.url);
      ratios.push(cfg.ratio);
    });

    // if no ratios are given, just spread evenly
    if(ratios.length === 0){
      let i = 0;
      let r = mRound(100/numElements);
      while(i < numElements){
        ratios.push(r);
        i++;
      }
    }

    if(config.type === 'grid'){
      coordinates = getRandomCoordinatesInsideShapeGrid(config.bb, config.context, config.spread, config.offset, config.margin);
    }else{
      coordinates = getRandomCoordinatesInsideShape(config.bb, config.context, config.number);
    }

    let numModels = coordinates.length;
    let colladas = [];
    let j = 0;
    for(let i = 0; i < numElements; i++){
      colladas.push(models[j]);
      if(i === ratios[j]){
        j++;
      }
    }

    //console.log(coordinates);

    function loop(i){
      if(i < numModels){
        createCollada(getRandomCollada(colladas)).then(function(collada){
          collada.position.x = coordinates[i].x;
          collada.position.y = coordinates[i].y;
          collada.position.z = 0;
          collada.rotation.z = getRandom(0, 360);
          collada.scale.set(1, 1, 1);
          world.add(collada);
          loop(++i);
        });
      }else{
        // ready
        console.timeEnd('loading');
        resolve({
          took: window.performance.now() - timestamp,
          numColladas: numModels
        });
      }
    }
    loop(0);
  }

  return new Promise(executor);
}


function getRandomCollada(colladas){
  let r = getRandom(0, colladas.length);
  let c = colladas[r];
  colladas = colladas.slice(r);
  return c;
}