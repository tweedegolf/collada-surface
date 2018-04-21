/*
  Creates a 3D scene and sets the right renderer and controls dependent on the device.
*/

import THREE from 'three';
import '../lib/OrbitControls';
import { createCollada } from './collada';
import { getRandom, getRandomCoordinatesInsideShapeGrid, getRandomCoordinatesInsideShape } from './util';


let timestamp;
const mRound = Math.round;
const mFloor = Math.floor;


const divContainer = document.getElementById('canvas3d');

const renderer = new THREE.WebGLRenderer({ autoClear: true });
renderer.setClearColor(0xffffff, 1);
const element = renderer.domElement;
divContainer.appendChild(element);

const scene = new THREE.Scene();

// correct aspect of camera is set in resize method, see below
const camera = new THREE.PerspectiveCamera(50, 1, 1, 3000);
camera.position.z = 500;
camera.position.x = 0;
camera.position.y = 200;
camera.lookAt(new THREE.Vector3(0, 0, 0));

const world = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200, 20, 20),
  new THREE.MeshBasicMaterial({ wireframe: true, color: 0x000000 })
);
world.rotation.x -= Math.PI / 2;
world.position.z = 50;
scene.add(world);

const light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
scene.add(light);

const render = () => {
  renderer.render(scene, camera);
};

const resize = () => {
  const width = divContainer.offsetWidth;
  const height = divContainer.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  render();
};

function clear() {
  while (world.children.length > 0) {
    world.remove(world.children[0]);
  }
  render();
}


window.addEventListener('resize', resize, false);

const controls = new THREE.OrbitControls(camera, divContainer);
controls.keys = {};
controls.addEventListener('change', () => {
  render();
});

resize();
/*
function addColladas(name, url, config){

  function executor(resolve, reject){
    clear();
    console.time('loading');
    timestamp = window.performance.now();

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let coordinates;

    context.beginPath();
    context.moveTo(-100, -100);
    context.lineTo(-100, 100);
    context.lineTo(100, 100);
    context.lineTo(100, -100);
    context.stroke();

    world.geometry.computeBoundingBox();
    let bb = world.geometry.boundingBox;

    if(config.type === 'grid'){
      coordinates = getRandomCoordinatesInsideShapeGrid(bb, context, config.spread, config.offset, config.margin);
    }else{
      coordinates = getRandomCoordinatesInsideShape(bb, context, config.number);
    }

    //console.log(coordinates);


    function loop(i){
      let maxi = coordinates.length;
      if(i < maxi){
        createCollada(name, url).then(function(collada){
          collada.position.x = coordinates[i].x;
          collada.position.y = coordinates[i].y;
          collada.position.z = 0;
          collada.scale.set(1, 1, 1);
          world.add(collada);
          loop(++i);
        });
      }else{
        // ready
        render();
        console.timeEnd('loading');
        resolve({
          took: window.performance.now() - timestamp,
          numColladas: maxi
        });
      }
    }
    loop(0);
  }

  return new Promise(executor);
}
*/


function createColladaSurface(config) {
  function executor(resolve, reject) {
    clear();
    console.time('loading');
    timestamp = window.performance.now();

    const models = [];
    const ratios = [];
    const numElements = config.models.length;

    config.models.forEach((cfg, i) => {
      models.push(cfg.url);
      if (cfg.ratio) {
        ratios.push(parseInt(cfg.ratio, 10));
      }
    });

    let total = 0;
    ratios.forEach((ratio) => {
      total += ratio;
    });

    ratios.forEach((ratio, i) => {
      ratios[i] = ratio / total;
    });

    // if no ratios are given, just spread evenly
    if (ratios.length === 0) {
      let i = 0;
      const r = 1 / numElements;
      const total = 0;
      while (i < numElements) {
        ratios.push(r);
        i++;
      }
    }

    // console.log(ratios);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let coordinates;

    context.beginPath();
    context.moveTo(-100, -100);
    context.lineTo(-100, 100);
    context.lineTo(100, 100);
    context.lineTo(100, -100);
    context.stroke();

    world.geometry.computeBoundingBox();
    const bb = world.geometry.boundingBox;

    if (config.type === 'grid') {
      coordinates = getRandomCoordinatesInsideShapeGrid(bb, context, config.spread, config.offset, config.margin);
    } else {
      console.log(config.number);
      coordinates = getRandomCoordinatesInsideShape(bb, context, config.number);
    }

    const numModels = coordinates.length;
    const colladas = [];
    let i;
    let j = 0;
    const amounts = [];
    let amount;

    total = 0;
    for (i = 0; i < numElements; i++) {
      amount = mRound(ratios[i] * numModels);
      amounts.push(amount);
      total += amount;
    }


    // console.log(numModels, amounts);

    let diff = i = numModels - total;
    while (diff > 0) {
      colladas.push(models[0]);
      // console.log('fill');
      diff--;
    }

    amount = amounts[j];
    i = i > 0 ? i : 0;
    for (; i < numModels; i++) {
      if (i === amount) {
        amount += amounts[++j];
        if (j === numElements) {
          break;
        }
        // console.log('increase j', j, amount);
      }
      colladas.push(models[j]);
    }

    // console.log(colladas.length, colladas);
    // console.log(coordinates);

    const scale = config.scale / 100;
    function loop(i) {
      if (i < numModels) {
        createCollada(getRandomCollada(colladas)).then((collada) => {
          collada.position.x = coordinates[i].x;
          collada.position.y = coordinates[i].y;
          collada.position.z = 0;
          collada.rotation.z = getRandom(0, 360);
          collada.scale.set(scale, scale, scale);
          world.add(collada);
          loop(++i);
        });
      } else {
        // ready
        render();
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


function getRandomCollada(colladas) {
  const r = mFloor(getRandom(0, colladas.length));
  const c = colladas[r];
  colladas = colladas.slice(r, 1);
  // console.log(c, colladas.length, r)
  return c;
}


export default {
  init,
  clear,
  // addColladas: addColladas,
  createColladaSurface,
};
