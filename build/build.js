(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createCollada = createCollada;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var loadedColladas = new Map();

var Collada = exports.Collada = function () {
  function Collada(url) {
    _classCallCheck(this, Collada);

    this.url = url;
  }

  _createClass(Collada, [{
    key: 'load',
    value: function load(cb) {
      var _this = this;

      var loader = void 0,
          clone = void 0,
          data = loadedColladas.get(this.url);

      if (data !== undefined) {
        clone = this.clone(data.children);
        cb(clone);
        //setTimeout(()=>{cb(clone)}, 1000);
        return;
      }

      loader = new THREE.ColladaLoader();
      loader.load(this.url, function (collada) {
        loadedColladas.set(_this.url, {
          collada: collada,
          children: collada.scene.children
        });
        _this.children = collada.scene.children;
        _this.skin = collada.skins[0];
        //setTimeout(()=>{cb(collada.scene)}, 1000);
        cb(collada.scene);
      });
    }
  }, {
    key: 'clone',
    value: function clone(children) {
      var mesh = new THREE.Object3D();
      //let mesh = new THREE.Group();

      children.forEach(function (child) {
        var childMesh = new THREE.Mesh(child.geometry, child.material);
        //let childMesh = new THREE.Object3D(child.geometry, child.material);
        childMesh.geometry.dynamic = false;
        childMesh.castShadow = false;
        childMesh.receiveShadow = false;
        childMesh.scale.x = child.scale.x;
        childMesh.scale.y = child.scale.y;
        childMesh.scale.z = child.scale.z;
        childMesh.position.x = child.position.x;
        childMesh.position.y = child.position.y;
        childMesh.position.z = child.position.z;
        childMesh.rotation.x = child.rotation.x;
        childMesh.rotation.y = child.rotation.y;
        childMesh.rotation.z = child.rotation.z;
        mesh.add(childMesh);
      });

      return mesh;
    }
  }]);

  return Collada;
}();

function createCollada(url) {
  var collada = new Collada(url);
  return new Promise(function executor(resolve, reject) {
    collada.load(function (data) {
      resolve(data);
    });
  });
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createControls;

var _util = require('./util.js');

var mFloor = Math.floor;
var selectFlower = document.getElementById('flower');
var rangeColladas = document.getElementById('number');
var rangeSpread = document.getElementById('spread');
var rangeOffset = document.getElementById('offset');
var rangeScale = document.getElementById('scale');
var rangeShort = document.getElementById('short');
var rangeMid = document.getElementById('mid');
var rangeTall = document.getElementById('tall');
var radioGrid = document.getElementById('grid');
var radioRandom = document.getElementById('random');
var divGrid = document.getElementById('controls-grid');
var divRandom = document.getElementById('controls-random');
var divLoading = document.getElementById('loading');
var updateSliderValue = void 0;
var type = 'grid';
// let flower = 'Anemoon';
var flower = 'Bloemen-los';
var config = {
  number: rangeColladas.value,
  spread: rangeSpread.value,
  offset: rangeOffset.value,
  type: type,
  scale: 100,
  models: [{
    url: 'models/' + flower + '-groot-roze.dae',
    ratio: rangeShort.value
  }, {
    url: 'models/' + flower + '-middel-roze.dae',
    ratio: rangeMid.value
  }, {
    url: 'models/' + flower + '-klein-roze.dae',
    ratio: rangeTall.value
  }]
  // models: [{
  //     url: `models/${flower}_short.dae`,
  //     ratio: rangeShort.value
  //   },{
  //     url: `models/${flower}_mid.dae`,
  //     ratio: rangeMid.value
  //   },{
  //     url: `models/${flower}_tall.dae`,
  //     ratio: rangeTall.value
  //   }
  // ]
};

function createControls(scene3d) {

  var ranges = document.querySelectorAll('input[type="range"');

  Array.from(ranges).forEach(function (range) {
    range.addEventListener('mousedown', function () {
      this.addEventListener('mousemove', updateSliderValue);
    });
    range.addEventListener('mouseup', function () {
      this.removeEventListener('mousemove', updateSliderValue);
    });
    range.addEventListener('change', function () {
      updateScene3d();
    });
  });

  selectFlower.addEventListener('click', function (e) {
    flower = this.options[this.selectedIndex].value;
    config.scale = 100;
    rangeScale.value = 100;
    rangeScale.previousSibling.innerText = 'scale: 100%';
    updateScene3d();
  }, false);

  radioGrid.addEventListener('click', function () {
    divGrid.style.display = 'block';
    divRandom.style.display = 'none';
    type = 'grid';
    updateScene3d();
  }, false);

  radioRandom.addEventListener('click', function () {
    divGrid.style.display = 'none';
    divRandom.style.display = 'block';
    type = 'random';
    updateScene3d();
  }, false);

  updateSliderValue = function updateSliderValue() {
    if (this.id === 'spread' || this.id === 'offset') {
      this.previousSibling.innerText = this.getAttribute('data-label') + ': ' + this.value;
    } else if (this.id === 'scale') {
      this.previousSibling.innerText = this.getAttribute('data-label') + ':\xA0' + this.valueAsNumber + '%';
    } else {
      var total = parseInt(rangeShort.value, 10) + parseInt(rangeMid.value, 10) + parseInt(rangeTall.value, 10);
      //this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${round(this.valueAsNumber/total, 2)}`;
      rangeShort.previousSibling.innerText = rangeShort.getAttribute('data-label') + ':\xA0' + (0, _util.round)(rangeShort.valueAsNumber * 100 / total) + '%';
      rangeMid.previousSibling.innerText = rangeMid.getAttribute('data-label') + ':\xA0' + (0, _util.round)(rangeMid.valueAsNumber * 100 / total) + '%';
      rangeTall.previousSibling.innerText = rangeTall.getAttribute('data-label') + ':\xA0' + (0, _util.round)(rangeTall.valueAsNumber * 100 / total) + '%';
    }
    config = {
      number: rangeColladas.value,
      spread: rangeSpread.value,
      offset: rangeOffset.value,
      type: type,
      scale: rangeScale.valueAsNumber,
      // models: [{
      //     url: `models/${flower}_short.dae`,
      //     ratio: rangeShort.value
      //   },{
      //     url: `models/${flower}_mid.dae`,
      //     ratio: rangeShort.value
      //   },{
      //     url: `models/${flower}_tall.dae`,
      //     ratio: rangeTall.value
      //   }
      // ]
      models: [{
        url: 'models/' + flower + '-groot-roze.dae',
        ratio: rangeShort.value
      }, {
        url: 'models/' + flower + '-middel-roze.dae',
        ratio: rangeMid.value
      }, {
        url: 'models/' + flower + '-klein-roze.dae',
        ratio: rangeTall.value
      }]
    };
  };

  function updateScene3d() {

    // config.models = [{
    //     url: `models/${flower}_short.dae`,
    //     ratio: rangeShort.value
    //   },{
    //     url: `models/${flower}_mid.dae`,
    //     ratio: rangeMid.value
    //   },{
    //     url: `models/${flower}_tall.dae`,
    //     ratio: rangeTall.value
    //   }
    // ]

    config.models = [{
      url: 'models/' + flower + '-groot-roze.dae',
      ratio: rangeShort.value
    }, {
      url: 'models/' + flower + '-middel-roze.dae',
      ratio: rangeMid.value
    }, {
      url: 'models/' + flower + '-klein-roze.dae',
      ratio: rangeTall.value
    }];

    //console.log(config)

    scene3d.createColladaSurface(config).then(function (data) {
      var html = '';
      html += 'number of colladas: ' + data.numColladas;
      html += '<br>';
      html += 'loading and parsing: ' + Math.round(data.took, 10) + 'ms';
      // if(config.type === 'grid'){
      //  html += `<br>number of colladas: ${data.numColladas}`;
      // }
      divLoading.innerHTML = html;
    });
  }

  // init
  updateScene3d();
}

},{"./util.js":5}],3:[function(require,module,exports){
'use strict';

// require('babelify/polyfill');

var _scene3d = require('./scene3d');

var _scene3d2 = _interopRequireDefault(_scene3d);

var _controls = require('./controls');

var _controls2 = _interopRequireDefault(_controls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.onload = function () {

  _scene3d2.default.init();
  (0, _controls2.default)(_scene3d2.default);
};

},{"./controls":2,"./scene3d":4}],4:[function(require,module,exports){
/*
Creates a 3D scene and sets the right renderer and controls dependent on the device.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collada = require('./collada');

var _util = require('./util');

var divContainer = void 0,
    body = void 0;
var camera = void 0,
    scene = void 0,
    element = void 0;
var renderer = void 0,
    controls = void 0;
var world = void 0;
var timestamp = void 0;
var mRound = Math.round;
var mFloor = Math.floor;

function init() {
  body = document.body;
  divContainer = document.getElementById('canvas3d');

  renderer = new THREE.WebGLRenderer({ autoClear: true });
  renderer.setClearColor(0xffffff, 1);
  element = renderer.domElement;
  divContainer.appendChild(element);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, 1, 1, 3000); // correct aspect of camera is set in resize method, see below
  camera.position.z = 500;
  camera.position.x = 0;
  camera.position.y = 200;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  world = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 20, 20), new THREE.MeshBasicMaterial({ wireframe: true, color: 0x000000 }));
  world.rotation.x -= Math.PI / 2;
  world.position.z = 50;
  scene.add(world);

  var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
  scene.add(light);

  window.addEventListener('resize', resize, false);

  controls = new THREE.OrbitControls(camera, divContainer);
  controls.keys = {};
  controls.addEventListener('change', function () {
    render();
  });
  resize();
}

function resize() {
  var width = divContainer.offsetWidth;
  var height = divContainer.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  render();
}

function render() {
  renderer.render(scene, camera);
}

function clear() {
  while (world.children.length > 0) {
    world.remove(world.children[0]);
  }
  render();
}

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

    var models = [];
    var ratios = [];
    var numElements = config.models.length;

    config.models.forEach(function (cfg, i) {
      models.push(cfg.url);
      if (cfg.ratio) {
        ratios.push(parseInt(cfg.ratio, 10));
      }
    });

    var total = 0;
    ratios.forEach(function (ratio) {
      total += ratio;
    });

    ratios.forEach(function (ratio, i) {
      ratios[i] = ratio / total;
    });

    // if no ratios are given, just spread evenly
    if (ratios.length === 0) {
      var _i = 0;
      var r = 1 / numElements;
      var _total = 0;
      while (_i < numElements) {
        ratios.push(r);
        _i++;
      }
    }

    //console.log(ratios);

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var coordinates = void 0;

    context.beginPath();
    context.moveTo(-100, -100);
    context.lineTo(-100, 100);
    context.lineTo(100, 100);
    context.lineTo(100, -100);
    context.stroke();

    world.geometry.computeBoundingBox();
    var bb = world.geometry.boundingBox;

    if (config.type === 'grid') {
      coordinates = (0, _util.getRandomCoordinatesInsideShapeGrid)(bb, context, config.spread, config.offset, config.margin);
    } else {
      console.log(config.number);
      coordinates = (0, _util.getRandomCoordinatesInsideShape)(bb, context, config.number);
    }

    var numModels = coordinates.length;
    var colladas = [];
    var i = void 0;
    var j = 0;
    var amounts = [];
    var amount = void 0;

    total = 0;
    for (i = 0; i < numElements; i++) {
      amount = mRound(ratios[i] * numModels);
      amounts.push(amount);
      total += amount;
    }

    //console.log(numModels, amounts);

    var diff = i = numModels - total;
    while (diff > 0) {
      colladas.push(models[0]);
      //console.log('fill');
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
        //console.log('increase j', j, amount);
      }
      colladas.push(models[j]);
    }

    //console.log(colladas.length, colladas);
    //console.log(coordinates);

    var scale = config.scale / 100;
    function loop(i) {
      if (i < numModels) {
        (0, _collada.createCollada)(getRandomCollada(colladas)).then(function (collada) {
          collada.position.x = coordinates[i].x;
          collada.position.y = coordinates[i].y;
          collada.position.z = 0;
          collada.rotation.z = (0, _util.getRandom)(0, 360);
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
          numColladas: numModels
        });
      }
    }
    loop(0);
  }

  return new Promise(executor);
}

function getRandomCollada(colladas) {
  var r = mFloor((0, _util.getRandom)(0, colladas.length));
  var c = colladas[r];
  colladas = colladas.slice(r, 1);
  //console.log(c, colladas.length, r)
  return c;
}

exports.default = {
  init: init,
  clear: clear,
  //addColladas: addColladas,
  createColladaSurface: createColladaSurface
};

},{"./collada":1,"./util":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRandomCoordinate = getRandomCoordinate;
exports.getRandom = getRandom;
exports.getRandomCoordinatesInsideShape = getRandomCoordinatesInsideShape;
exports.getRandomCoordinatesInsideShapeGrid = getRandomCoordinatesInsideShapeGrid;
exports.round = round;
var mRandom = Math.random;
var mRound = Math.round;
var mPow = Math.pow;

function getRandomCoordinate(constraints) {
  var x = void 0,
      y = void 0,
      z = void 0,
      min = void 0,
      max = void 0;

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
    x: x,
    y: y,
    z: z
  };
}

function getRandom() {
  var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

  return mRandom() * (max - min) + min;
}

function getRandomCoordinatesInsideShape(constraints, shape, max) {
  var i = 0,
      check = void 0,
      coordinates = [],
      coordinate = void 0;

  max = max || 25;

  while (i < max) {
    check = true;
    while (check) {
      coordinate = getRandomCoordinate(constraints);
      if (shape.isPointInPath(coordinate.x, coordinate.y)) {
        coordinates.push(coordinate);
        i++;
        check = false;
      }
    }
  }
  return coordinates;
}

function getRandomCoordinatesInsideShapeGrid(constraints, shape) {
  var spread = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var margin = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var optimise = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;


  spread = parseInt(spread, 10);
  offset = parseInt(offset, 10);
  margin = parseInt(margin, 10);

  //console.log(spread,offset,margin,constraints.max, constraints.min);

  var x = constraints.max.x,
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

  if (optimise === true) {
    // needs some more work
    //spreadX = w/(Math.floor(w/spread));
    //spreadX = h/(Math.floor(h/spread));
    spreadX = w / Math.floor(w / spread);
    spreadX = h / Math.floor(h / spread);
    posX = constraints.min.x + spreadX / 2;
    minX = posX;
    maxX = constraints.max.x - spreadX / 2;
    posY = constraints.min.y + spreadX / 2;
    minY = posY;
    maxY = constraints.max.y - spreadX / 2;
  }

  //let i = 0;

  while (posY <= maxY) {
    x = posX + mRandom() * offset;
    y = posY + mRandom() * offset;
    if (shape.isPointInPath(x, y)) {
      coordinates.push({ x: x, y: y, z: 0, r: row });
    }

    posY = posY + spreadY;

    // if(i > 3){
    //   break;
    // }
    // console.log(posY, spreadY);
    // i++;

    if (posY >= maxY) {
      row += 1;
      posY = minY;
      posX = posX + spreadX;
      if (posX >= maxX) {
        break;
      }
    }
  }
  return coordinates;
}

function round(value) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (decimals <= 0) {
    return mRound(value);
  }
  var p = mPow(10, decimals);
  //console.log(p, decimals)
  return mRound(value * p) / p;
}

},{}]},{},[3])
//# sourceMappingURL=build.js.map
