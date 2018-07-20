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
var flower = 'Anemoon';
var config = {
  number: rangeColladas.value,
  spread: rangeSpread.value,
  offset: rangeOffset.value,
  type: type,
  scale: 100,
  models: [{
    url: 'models/' + flower + '_short.dae',
    ratio: rangeShort.value
  }, {
    url: 'models/' + flower + '_mid.dae',
    ratio: rangeMid.value
  }, {
    url: 'models/' + flower + '_tall.dae',
    ratio: rangeTall.value
  }]
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
      models: [{
        url: 'models/' + flower + '_short.dae',
        ratio: rangeShort.value
      }, {
        url: 'models/' + flower + '_mid.dae',
        ratio: rangeShort.value
      }, {
        url: 'models/' + flower + '_tall.dae',
        ratio: rangeTall.value
      }]
    };
  };

  function updateScene3d() {

    config.models = [{
      url: 'models/' + flower + '_short.dae',
      ratio: rangeShort.value
    }, {
      url: 'models/' + flower + '_mid.dae',
      ratio: rangeMid.value
    }, {
      url: 'models/' + flower + '_tall.dae',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb2xsYWRhLmpzIiwianMvY29udHJvbHMuanMiLCJqcy9tYWluLmpzIiwianMvc2NlbmUzZC5qcyIsImpzL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7UUErRGdCLGEsR0FBQSxhOzs7O0FBN0RoQixJQUFJLGlCQUFpQixJQUFJLEdBQUosRUFBckI7O0lBRWEsTyxXQUFBLE87QUFFWCxtQkFBWSxHQUFaLEVBQWdCO0FBQUE7O0FBQ2QsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNEOzs7O3lCQUVJLEUsRUFBRztBQUFBOztBQUNOLFVBQUksZUFBSjtBQUFBLFVBQ0UsY0FERjtBQUFBLFVBRUUsT0FBTyxlQUFlLEdBQWYsQ0FBbUIsS0FBSyxHQUF4QixDQUZUOztBQUlBLFVBQUcsU0FBUyxTQUFaLEVBQXVCO0FBQ3JCLGdCQUFRLEtBQUssS0FBTCxDQUFXLEtBQUssUUFBaEIsQ0FBUjtBQUNBLFdBQUcsS0FBSDtBQUNBO0FBQ0E7QUFDRDs7QUFFRCxlQUFTLElBQUksTUFBTSxhQUFWLEVBQVQ7QUFDQSxhQUFPLElBQVAsQ0FBWSxLQUFLLEdBQWpCLEVBQXNCLFVBQUMsT0FBRCxFQUFhO0FBQ2pDLHVCQUFlLEdBQWYsQ0FBbUIsTUFBSyxHQUF4QixFQUE0QjtBQUMxQixtQkFBUyxPQURpQjtBQUUxQixvQkFBVSxRQUFRLEtBQVIsQ0FBYztBQUZFLFNBQTVCO0FBSUEsY0FBSyxRQUFMLEdBQWdCLFFBQVEsS0FBUixDQUFjLFFBQTlCO0FBQ0EsY0FBSyxJQUFMLEdBQVksUUFBUSxLQUFSLENBQWMsQ0FBZCxDQUFaO0FBQ0E7QUFDQSxXQUFHLFFBQVEsS0FBWDtBQUNELE9BVEQ7QUFVRDs7OzBCQUdLLFEsRUFBUztBQUNiLFVBQUksT0FBTyxJQUFJLE1BQU0sUUFBVixFQUFYO0FBQ0E7O0FBRUEsZUFBUyxPQUFULENBQWlCLFVBQVUsS0FBVixF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VyxHQUFHLENBQWQsRUFBaUIsR0FBRyxHQUFwQixFQUFqQjtBQUNEOztBQUVELFdBQU8sT0FBTyxPQUFkOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBRyxRQUFRLElBQVgsRUFBZ0I7QUFDZCxhQUFPLENBQVA7QUFDQSxhQUFPLElBQVA7QUFDQSxhQUFPLE9BQU8sT0FBZDtBQUNBLFVBQUcsUUFBUSxJQUFYLEVBQWdCO0FBQ2Q7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxTQUFPLFdBQVA7QUFDRDs7QUFHTSxTQUFTLEtBQVQsQ0FBZSxLQUFmLEVBQW1DO0FBQUEsTUFBYixRQUFhLHVFQUFGLENBQUU7O0FBQ3hDLE1BQUcsWUFBWSxDQUFmLEVBQWlCO0FBQ2YsV0FBTyxPQUFPLEtBQVAsQ0FBUDtBQUNEO0FBQ0QsTUFBSSxJQUFJLEtBQUssRUFBTCxFQUFTLFFBQVQsQ0FBUjtBQUNBO0FBQ0EsU0FBTyxPQUFPLFFBQVEsQ0FBZixJQUFrQixDQUF6QjtBQUNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgbG9hZGVkQ29sbGFkYXMgPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBjbGFzcyBDb2xsYWRhe1xuXG4gIGNvbnN0cnVjdG9yKHVybCl7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gIH1cblxuICBsb2FkKGNiKXtcbiAgICBsZXQgbG9hZGVyLFxuICAgICAgY2xvbmUsXG4gICAgICBkYXRhID0gbG9hZGVkQ29sbGFkYXMuZ2V0KHRoaXMudXJsKTtcblxuICAgIGlmKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xvbmUgPSB0aGlzLmNsb25lKGRhdGEuY2hpbGRyZW4pO1xuICAgICAgY2IoY2xvbmUpO1xuICAgICAgLy9zZXRUaW1lb3V0KCgpPT57Y2IoY2xvbmUpfSwgMTAwMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9hZGVyID0gbmV3IFRIUkVFLkNvbGxhZGFMb2FkZXIoKTtcbiAgICBsb2FkZXIubG9hZCh0aGlzLnVybCwgKGNvbGxhZGEpID0+IHtcbiAgICAgIGxvYWRlZENvbGxhZGFzLnNldCh0aGlzLnVybCx7XG4gICAgICAgIGNvbGxhZGE6IGNvbGxhZGEsXG4gICAgICAgIGNoaWxkcmVuOiBjb2xsYWRhLnNjZW5lLmNoaWxkcmVuXG4gICAgICB9KTtcbiAgICAgIHRoaXMuY2hpbGRyZW4gPSBjb2xsYWRhLnNjZW5lLmNoaWxkcmVuO1xuICAgICAgdGhpcy5za2luID0gY29sbGFkYS5za2luc1swXTtcbiAgICAgIC8vc2V0VGltZW91dCgoKT0+e2NiKGNvbGxhZGEuc2NlbmUpfSwgMTAwMCk7XG4gICAgICBjYihjb2xsYWRhLnNjZW5lKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgY2xvbmUoY2hpbGRyZW4pe1xuICAgIGxldCBtZXNoID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gICAgLy9sZXQgbWVzaCA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuXG4gICAgY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIGxldCBjaGlsZE1lc2ggPSBuZXcgVEhSRUUuTWVzaChjaGlsZC5nZW9tZXRyeSwgY2hpbGQubWF0ZXJpYWwpO1xuICAgICAgLy9sZXQgY2hpbGRNZXNoID0gbmV3IFRIUkVFLk9iamVjdDNEKGNoaWxkLmdlb21ldHJ5LCBjaGlsZC5tYXRlcmlhbCk7XG4gICAgICBjaGlsZE1lc2guZ2VvbWV0cnkuZHluYW1pYyA9IGZhbHNlO1xuICAgICAgY2hpbGRNZXNoLmNhc3RTaGFkb3cgPSBmYWxzZTtcbiAgICAgIGNoaWxkTWVzaC5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XG4gICAgICBjaGlsZE1lc2guc2NhbGUueCA9IGNoaWxkLnNjYWxlLng7XG4gICAgICBjaGlsZE1lc2guc2NhbGUueSA9IGNoaWxkLnNjYWxlLnk7XG4gICAgICBjaGlsZE1lc2guc2NhbGUueiA9IGNoaWxkLnNjYWxlLno7XG4gICAgICBjaGlsZE1lc2gucG9zaXRpb24ueCA9IGNoaWxkLnBvc2l0aW9uLng7XG4gICAgICBjaGlsZE1lc2gucG9zaXRpb24ueSA9IGNoaWxkLnBvc2l0aW9uLnk7XG4gICAgICBjaGlsZE1lc2gucG9zaXRpb24ueiA9IGNoaWxkLnBvc2l0aW9uLno7XG4gICAgICBjaGlsZE1lc2gucm90YXRpb24ueCA9IGNoaWxkLnJvdGF0aW9uLng7XG4gICAgICBjaGlsZE1lc2gucm90YXRpb24ueSA9IGNoaWxkLnJvdGF0aW9uLnk7XG4gICAgICBjaGlsZE1lc2gucm90YXRpb24ueiA9IGNoaWxkLnJvdGF0aW9uLno7XG4gICAgICBtZXNoLmFkZChjaGlsZE1lc2gpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1lc2g7XG4gIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29sbGFkYSh1cmwpe1xuICBsZXQgY29sbGFkYSA9IG5ldyBDb2xsYWRhKHVybCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLCByZWplY3Qpe1xuICAgIGNvbGxhZGEubG9hZChmdW5jdGlvbihkYXRhKXtcbiAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgfSk7XG4gIH0pO1xufSIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtyb3VuZH0gZnJvbSAnLi91dGlsLmpzJztcblxubGV0IG1GbG9vciA9IE1hdGguZmxvb3I7XG5sZXQgc2VsZWN0Rmxvd2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zsb3dlcicpO1xubGV0IHJhbmdlQ29sbGFkYXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtYmVyJyk7XG5sZXQgcmFuZ2VTcHJlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByZWFkJyk7XG5sZXQgcmFuZ2VPZmZzZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2Zmc2V0Jyk7XG5sZXQgcmFuZ2VTY2FsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY2FsZScpO1xubGV0IHJhbmdlU2hvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvcnQnKTtcbmxldCByYW5nZU1pZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaWQnKTtcbmxldCByYW5nZVRhbGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFsbCcpO1xubGV0IHJhZGlvR3JpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncmlkJyk7XG5sZXQgcmFkaW9SYW5kb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmFuZG9tJyk7XG5sZXQgZGl2R3JpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cm9scy1ncmlkJyk7XG5sZXQgZGl2UmFuZG9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyb2xzLXJhbmRvbScpO1xubGV0IGRpdkxvYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpO1xubGV0IHVwZGF0ZVNsaWRlclZhbHVlO1xubGV0IHR5cGUgPSAnZ3JpZCc7XG5sZXQgZmxvd2VyID0gJ0FuZW1vb24nO1xubGV0IGNvbmZpZyA9IHtcbiAgbnVtYmVyOiByYW5nZUNvbGxhZGFzLnZhbHVlLFxuICBzcHJlYWQ6IHJhbmdlU3ByZWFkLnZhbHVlLFxuICBvZmZzZXQ6IHJhbmdlT2Zmc2V0LnZhbHVlLFxuICB0eXBlOiB0eXBlLFxuICBzY2FsZTogMTAwLFxuICBtb2RlbHM6IFt7XG4gICAgICB1cmw6IGBtb2RlbHMvJHtmbG93ZXJ9X3Nob3J0LmRhZWAsXG4gICAgICByYXRpbzogcmFuZ2VTaG9ydC52YWx1ZVxuICAgIH0se1xuICAgICAgdXJsOiBgbW9kZWxzLyR7Zmxvd2VyfV9taWQuZGFlYCxcbiAgICAgIHJhdGlvOiByYW5nZU1pZC52YWx1ZVxuICAgIH0se1xuICAgICAgdXJsOiBgbW9kZWxzLyR7Zmxvd2VyfV90YWxsLmRhZWAsXG4gICAgICByYXRpbzogcmFuZ2VUYWxsLnZhbHVlXG4gICAgfVxuICBdXG59O1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUNvbnRyb2xzKHNjZW5lM2Qpe1xuXG4gIGxldCByYW5nZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwicmFuZ2VcIicpO1xuXG4gIEFycmF5LmZyb20ocmFuZ2VzKS5mb3JFYWNoKGZ1bmN0aW9uKHJhbmdlKXtcbiAgICByYW5nZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB1cGRhdGVTbGlkZXJWYWx1ZSk7XG4gICAgfSk7XG4gICAgcmFuZ2UuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHVwZGF0ZVNsaWRlclZhbHVlKTtcbiAgICB9KTtcbiAgICByYW5nZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAgICAgdXBkYXRlU2NlbmUzZCgpO1xuICAgIH0pO1xuICB9KTtcblxuICBzZWxlY3RGbG93ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICBmbG93ZXIgPSB0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZEluZGV4XS52YWx1ZTtcbiAgICBjb25maWcuc2NhbGUgPSAxMDA7XG4gICAgcmFuZ2VTY2FsZS52YWx1ZSA9IDEwMDtcbiAgICByYW5nZVNjYWxlLnByZXZpb3VzU2libGluZy5pbm5lclRleHQgPSAnc2NhbGU6IDEwMCUnO1xuICAgIHVwZGF0ZVNjZW5lM2QoKTtcbiAgfSwgZmFsc2UpO1xuXG4gIHJhZGlvR3JpZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgZGl2R3JpZC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBkaXZSYW5kb20uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0eXBlID0gJ2dyaWQnO1xuICAgIHVwZGF0ZVNjZW5lM2QoKTtcbiAgfSwgZmFsc2UpO1xuXG4gIHJhZGlvUmFuZG9tLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBkaXZHcmlkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgZGl2UmFuZG9tLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIHR5cGUgPSAncmFuZG9tJztcbiAgICB1cGRhdGVTY2VuZTNkKCk7XG4gIH0sIGZhbHNlKTtcblxuXG5cbiAgdXBkYXRlU2xpZGVyVmFsdWUgPSBmdW5jdGlvbigpe1xuICAgIGlmKHRoaXMuaWQgPT09ICdzcHJlYWQnIHx8IHRoaXMuaWQgPT09ICdvZmZzZXQnKXtcbiAgICAgIHRoaXMucHJldmlvdXNTaWJsaW5nLmlubmVyVGV4dCA9IGAke3RoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWxhYmVsJyl9OiAke3RoaXMudmFsdWV9YDtcbiAgICB9ZWxzZSBpZih0aGlzLmlkID09PSAnc2NhbGUnKXtcbiAgICAgIHRoaXMucHJldmlvdXNTaWJsaW5nLmlubmVyVGV4dCA9IGAke3RoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWxhYmVsJyl9OlxcdTAwQTAke3RoaXMudmFsdWVBc051bWJlcn0lYDtcbiAgICB9ZWxzZXtcbiAgICAgIGxldCB0b3RhbCA9IHBhcnNlSW50KHJhbmdlU2hvcnQudmFsdWUsIDEwKSArIHBhcnNlSW50KHJhbmdlTWlkLnZhbHVlLCAxMCkgKyBwYXJzZUludChyYW5nZVRhbGwudmFsdWUsIDEwKTtcbiAgICAgIC8vdGhpcy5wcmV2aW91c1NpYmxpbmcuaW5uZXJUZXh0ID0gYCR7dGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFiZWwnKX06ICR7cm91bmQodGhpcy52YWx1ZUFzTnVtYmVyL3RvdGFsLCAyKX1gO1xuICAgICAgcmFuZ2VTaG9ydC5wcmV2aW91c1NpYmxpbmcuaW5uZXJUZXh0ID0gYCR7cmFuZ2VTaG9ydC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFiZWwnKX06XFx1MDBBMCR7cm91bmQocmFuZ2VTaG9ydC52YWx1ZUFzTnVtYmVyICogMTAwL3RvdGFsKX0lYDtcbiAgICAgIHJhbmdlTWlkLnByZXZpb3VzU2libGluZy5pbm5lclRleHQgPSBgJHtyYW5nZU1pZC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFiZWwnKX06XFx1MDBBMCR7cm91bmQocmFuZ2VNaWQudmFsdWVBc051bWJlciAqIDEwMC90b3RhbCl9JWA7XG4gICAgICByYW5nZVRhbGwucHJldmlvdXNTaWJsaW5nLmlubmVyVGV4dCA9IGAke3JhbmdlVGFsbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGFiZWwnKX06XFx1MDBBMCR7cm91bmQocmFuZ2VUYWxsLnZhbHVlQXNOdW1iZXIgKiAxMDAvdG90YWwpfSVgO1xuICAgIH1cbiAgICBjb25maWcgPSB7XG4gICAgICBudW1iZXI6IHJhbmdlQ29sbGFkYXMudmFsdWUsXG4gICAgICBzcHJlYWQ6IHJhbmdlU3ByZWFkLnZhbHVlLFxuICAgICAgb2Zmc2V0OiByYW5nZU9mZnNldC52YWx1ZSxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBzY2FsZTogcmFuZ2VTY2FsZS52YWx1ZUFzTnVtYmVyLFxuICAgICAgbW9kZWxzOiBbe1xuICAgICAgICAgIHVybDogYG1vZGVscy8ke2Zsb3dlcn1fc2hvcnQuZGFlYCxcbiAgICAgICAgICByYXRpbzogcmFuZ2VTaG9ydC52YWx1ZVxuICAgICAgICB9LHtcbiAgICAgICAgICB1cmw6IGBtb2RlbHMvJHtmbG93ZXJ9X21pZC5kYWVgLFxuICAgICAgICAgIHJhdGlvOiByYW5nZVNob3J0LnZhbHVlXG4gICAgICAgIH0se1xuICAgICAgICAgIHVybDogYG1vZGVscy8ke2Zsb3dlcn1fdGFsbC5kYWVgLFxuICAgICAgICAgIHJhdGlvOiByYW5nZVRhbGwudmFsdWVcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiB1cGRhdGVTY2VuZTNkKCl7XG5cbiAgICBjb25maWcubW9kZWxzID0gW3tcbiAgICAgICAgdXJsOiBgbW9kZWxzLyR7Zmxvd2VyfV9zaG9ydC5kYWVgLFxuICAgICAgICByYXRpbzogcmFuZ2VTaG9ydC52YWx1ZVxuICAgICAgfSx7XG4gICAgICAgIHVybDogYG1vZGVscy8ke2Zsb3dlcn1fbWlkLmRhZWAsXG4gICAgICAgIHJhdGlvOiByYW5nZU1pZC52YWx1ZVxuICAgICAgfSx7XG4gICAgICAgIHVybDogYG1vZGVscy8ke2Zsb3dlcn1fdGFsbC5kYWVgLFxuICAgICAgICByYXRpbzogcmFuZ2VUYWxsLnZhbHVlXG4gICAgICB9XG4gICAgXVxuICAgIC8vY29uc29sZS5sb2coY29uZmlnKVxuXG4gICAgc2NlbmUzZC5jcmVhdGVDb2xsYWRhU3VyZmFjZShjb25maWcpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICBsZXQgaHRtbCA9ICcnO1xuICAgICAgaHRtbCArPSBgbnVtYmVyIG9mIGNvbGxhZGFzOiAke2RhdGEubnVtQ29sbGFkYXN9YDtcbiAgICAgIGh0bWwgKz0gJzxicj4nO1xuICAgICAgaHRtbCArPSBgbG9hZGluZyBhbmQgcGFyc2luZzogJHtNYXRoLnJvdW5kKGRhdGEudG9vaywgMTApfW1zYDtcbiAgICAgIC8vIGlmKGNvbmZpZy50eXBlID09PSAnZ3JpZCcpe1xuICAgICAgLy8gIGh0bWwgKz0gYDxicj5udW1iZXIgb2YgY29sbGFkYXM6ICR7ZGF0YS5udW1Db2xsYWRhc31gO1xuICAgICAgLy8gfVxuICAgICAgZGl2TG9hZGluZy5pbm5lckhUTUwgPSBodG1sO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gaW5pdFxuICB1cGRhdGVTY2VuZTNkKCk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyByZXF1aXJlKCdiYWJlbGlmeS9wb2x5ZmlsbCcpO1xuXG5pbXBvcnQgc2NlbmUzZCBmcm9tICcuL3NjZW5lM2QnO1xuaW1wb3J0IGNyZWF0ZUNvbnRyb2xzIGZyb20gJy4vY29udHJvbHMnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKXtcblxuICBzY2VuZTNkLmluaXQoKTtcbiAgY3JlYXRlQ29udHJvbHMoc2NlbmUzZCk7XG5cbn07XG4iLCIgIC8qXG4gIENyZWF0ZXMgYSAzRCBzY2VuZSBhbmQgc2V0cyB0aGUgcmlnaHQgcmVuZGVyZXIgYW5kIGNvbnRyb2xzIGRlcGVuZGVudCBvbiB0aGUgZGV2aWNlLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2NyZWF0ZUNvbGxhZGF9IGZyb20gJy4vY29sbGFkYSc7XG5pbXBvcnQge2dldFJhbmRvbSwgZ2V0UmFuZG9tQ29vcmRpbmF0ZXNJbnNpZGVTaGFwZUdyaWQsIGdldFJhbmRvbUNvb3JkaW5hdGVzSW5zaWRlU2hhcGV9IGZyb20gJy4vdXRpbCc7XG5cblxubGV0IGRpdkNvbnRhaW5lciwgYm9keTtcbmxldCBjYW1lcmEsIHNjZW5lLCBlbGVtZW50O1xubGV0IHJlbmRlcmVyLCBjb250cm9scztcbmxldCB3b3JsZDtcbmxldCB0aW1lc3RhbXA7XG5sZXQgbVJvdW5kID0gTWF0aC5yb3VuZDtcbmxldCBtRmxvb3IgPSBNYXRoLmZsb29yO1xuXG5cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gIGRpdkNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMzZCcpO1xuXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2F1dG9DbGVhcjp0cnVlfSk7XG4gIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHhmZmZmZmYsIDEpO1xuICBlbGVtZW50ID0gcmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgZGl2Q29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDUwLCAxLCAxLCAzMDAwKTsgLy8gY29ycmVjdCBhc3BlY3Qgb2YgY2FtZXJhIGlzIHNldCBpbiByZXNpemUgbWV0aG9kLCBzZWUgYmVsb3dcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSA1MDA7XG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gMDtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSAyMDA7XG4gIGNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwwLDApKTtcblxuICB3b3JsZCA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDIwMCwgMjAwLCAyMCwgMjApLCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe3dpcmVmcmFtZTp0cnVlLCBjb2xvcjogMHgwMDAwMDB9KSk7XG4gIHdvcmxkLnJvdGF0aW9uLnggLT0gTWF0aC5QSS8yO1xuICB3b3JsZC5wb3NpdGlvbi56ID0gNTA7XG4gIHNjZW5lLmFkZCh3b3JsZCk7XG5cbiAgbGV0IGxpZ2h0ID0gbmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweDc3Nzc3NywgMHgwMDAwMDAsIDAuNik7XG4gIHNjZW5lLmFkZChsaWdodCk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSwgZmFsc2UpO1xuXG4gIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhLCBkaXZDb250YWluZXIpO1xuICBjb250cm9scy5rZXlzID0ge307XG4gIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gICAgcmVuZGVyKCk7XG4gIH0pO1xuICByZXNpemUoKTtcbn1cblxuXG5mdW5jdGlvbiByZXNpemUoKSB7XG4gIGxldCB3aWR0aCA9IGRpdkNvbnRhaW5lci5vZmZzZXRXaWR0aDtcbiAgbGV0IGhlaWdodCA9IGRpdkNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gIGNhbWVyYS5hc3BlY3QgPSB3aWR0aCAvIGhlaWdodDtcbiAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgcmVuZGVyKCk7XG59XG5cblxuZnVuY3Rpb24gcmVuZGVyKCl7XG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cblxuXG5mdW5jdGlvbiBjbGVhcigpe1xuICB3aGlsZSh3b3JsZC5jaGlsZHJlbi5sZW5ndGggPiAwKXtcbiAgICB3b3JsZC5yZW1vdmUod29ybGQuY2hpbGRyZW5bMF0pO1xuICB9XG4gIHJlbmRlcigpO1xufVxuXG4vKlxuZnVuY3Rpb24gYWRkQ29sbGFkYXMobmFtZSwgdXJsLCBjb25maWcpe1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG4gICAgY2xlYXIoKTtcbiAgICBjb25zb2xlLnRpbWUoJ2xvYWRpbmcnKTtcbiAgICB0aW1lc3RhbXAgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBsZXQgY29vcmRpbmF0ZXM7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKC0xMDAsIC0xMDApO1xuICAgIGNvbnRleHQubGluZVRvKC0xMDAsIDEwMCk7XG4gICAgY29udGV4dC5saW5lVG8oMTAwLCAxMDApO1xuICAgIGNvbnRleHQubGluZVRvKDEwMCwgLTEwMCk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcblxuICAgIHdvcmxkLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xuICAgIGxldCBiYiA9IHdvcmxkLmdlb21ldHJ5LmJvdW5kaW5nQm94O1xuXG4gICAgaWYoY29uZmlnLnR5cGUgPT09ICdncmlkJyl7XG4gICAgICBjb29yZGluYXRlcyA9IGdldFJhbmRvbUNvb3JkaW5hdGVzSW5zaWRlU2hhcGVHcmlkKGJiLCBjb250ZXh0LCBjb25maWcuc3ByZWFkLCBjb25maWcub2Zmc2V0LCBjb25maWcubWFyZ2luKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvb3JkaW5hdGVzID0gZ2V0UmFuZG9tQ29vcmRpbmF0ZXNJbnNpZGVTaGFwZShiYiwgY29udGV4dCwgY29uZmlnLm51bWJlcik7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyhjb29yZGluYXRlcyk7XG5cblxuICAgIGZ1bmN0aW9uIGxvb3AoaSl7XG4gICAgICBsZXQgbWF4aSA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICAgIGlmKGkgPCBtYXhpKXtcbiAgICAgICAgY3JlYXRlQ29sbGFkYShuYW1lLCB1cmwpLnRoZW4oZnVuY3Rpb24oY29sbGFkYSl7XG4gICAgICAgICAgY29sbGFkYS5wb3NpdGlvbi54ID0gY29vcmRpbmF0ZXNbaV0ueDtcbiAgICAgICAgICBjb2xsYWRhLnBvc2l0aW9uLnkgPSBjb29yZGluYXRlc1tpXS55O1xuICAgICAgICAgIGNvbGxhZGEucG9zaXRpb24ueiA9IDA7XG4gICAgICAgICAgY29sbGFkYS5zY2FsZS5zZXQoMSwgMSwgMSk7XG4gICAgICAgICAgd29ybGQuYWRkKGNvbGxhZGEpO1xuICAgICAgICAgIGxvb3AoKytpKTtcbiAgICAgICAgfSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gcmVhZHlcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIGNvbnNvbGUudGltZUVuZCgnbG9hZGluZycpO1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICB0b29rOiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgLSB0aW1lc3RhbXAsXG4gICAgICAgICAgbnVtQ29sbGFkYXM6IG1heGlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxvb3AoMCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVDb2xsYWRhU3VyZmFjZShjb25maWcpe1xuXG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBjbGVhcigpO1xuICAgIGNvbnNvbGUudGltZSgnbG9hZGluZycpO1xuICAgIHRpbWVzdGFtcCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGxldCBtb2RlbHMgPSBbXTtcbiAgICBsZXQgcmF0aW9zID0gW107XG4gICAgbGV0IG51bUVsZW1lbnRzID0gY29uZmlnLm1vZGVscy5sZW5ndGg7XG5cbiAgICBjb25maWcubW9kZWxzLmZvckVhY2goZnVuY3Rpb24oY2ZnLCBpKXtcbiAgICAgIG1vZGVscy5wdXNoKGNmZy51cmwpO1xuICAgICAgaWYoY2ZnLnJhdGlvKXtcbiAgICAgICAgcmF0aW9zLnB1c2gocGFyc2VJbnQoY2ZnLnJhdGlvLCAxMCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHRvdGFsID0gMDtcbiAgICByYXRpb3MuZm9yRWFjaChmdW5jdGlvbihyYXRpbyl7XG4gICAgICB0b3RhbCArPSByYXRpbztcbiAgICB9KTtcblxuICAgIHJhdGlvcy5mb3JFYWNoKGZ1bmN0aW9uKHJhdGlvLCBpKXtcbiAgICAgIHJhdGlvc1tpXSA9IHJhdGlvL3RvdGFsO1xuICAgIH0pO1xuXG4gICAgLy8gaWYgbm8gcmF0aW9zIGFyZSBnaXZlbiwganVzdCBzcHJlYWQgZXZlbmx5XG4gICAgaWYocmF0aW9zLmxlbmd0aCA9PT0gMCl7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBsZXQgciA9IDEvbnVtRWxlbWVudHM7XG4gICAgICBsZXQgdG90YWwgPSAwO1xuICAgICAgd2hpbGUoaSA8IG51bUVsZW1lbnRzKXtcbiAgICAgICAgcmF0aW9zLnB1c2gocik7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKHJhdGlvcyk7XG5cbiAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBsZXQgY29vcmRpbmF0ZXM7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKC0xMDAsIC0xMDApO1xuICAgIGNvbnRleHQubGluZVRvKC0xMDAsIDEwMCk7XG4gICAgY29udGV4dC5saW5lVG8oMTAwLCAxMDApO1xuICAgIGNvbnRleHQubGluZVRvKDEwMCwgLTEwMCk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcblxuICAgIHdvcmxkLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xuICAgIGxldCBiYiA9IHdvcmxkLmdlb21ldHJ5LmJvdW5kaW5nQm94O1xuXG4gICAgaWYoY29uZmlnLnR5cGUgPT09ICdncmlkJyl7XG4gICAgICBjb29yZGluYXRlcyA9IGdldFJhbmRvbUNvb3JkaW5hdGVzSW5zaWRlU2hhcGVHcmlkKGJiLCBjb250ZXh0LCBjb25maWcuc3ByZWFkLCBjb25maWcub2Zmc2V0LCBjb25maWcubWFyZ2luKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKGNvbmZpZy5udW1iZXIpO1xuICAgICAgY29vcmRpbmF0ZXMgPSBnZXRSYW5kb21Db29yZGluYXRlc0luc2lkZVNoYXBlKGJiLCBjb250ZXh0LCBjb25maWcubnVtYmVyKTtcbiAgICB9XG5cbiAgICBsZXQgbnVtTW9kZWxzID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIGxldCBjb2xsYWRhcyA9IFtdO1xuICAgIGxldCBpO1xuICAgIGxldCBqID0gMDtcbiAgICBsZXQgYW1vdW50cyA9IFtdO1xuICAgIGxldCBhbW91bnQ7XG5cbiAgICB0b3RhbCA9IDA7XG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtRWxlbWVudHM7IGkrKyl7XG4gICAgICBhbW91bnQgPSBtUm91bmQocmF0aW9zW2ldICogbnVtTW9kZWxzKTtcbiAgICAgIGFtb3VudHMucHVzaChhbW91bnQpO1xuICAgICAgdG90YWwgKz0gYW1vdW50O1xuICAgIH1cblxuXG4gICAgLy9jb25zb2xlLmxvZyhudW1Nb2RlbHMsIGFtb3VudHMpO1xuXG4gICAgbGV0IGRpZmYgPSBpID0gbnVtTW9kZWxzIC0gdG90YWw7XG4gICAgd2hpbGUoZGlmZiA+IDApe1xuICAgICAgY29sbGFkYXMucHVzaChtb2RlbHNbMF0pO1xuICAgICAgLy9jb25zb2xlLmxvZygnZmlsbCcpO1xuICAgICAgZGlmZi0tO1xuICAgIH1cblxuICAgIGFtb3VudCA9IGFtb3VudHNbal07XG4gICAgaSA9IGkgPiAwID8gaSA6IDA7XG4gICAgZm9yKDsgaSA8IG51bU1vZGVsczsgaSsrKXtcbiAgICAgIGlmKGkgPT09IGFtb3VudCl7XG4gICAgICAgIGFtb3VudCArPSBhbW91bnRzWysral07XG4gICAgICAgIGlmKGogPT09IG51bUVsZW1lbnRzKXtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKCdpbmNyZWFzZSBqJywgaiwgYW1vdW50KTtcbiAgICAgIH1cbiAgICAgIGNvbGxhZGFzLnB1c2gobW9kZWxzW2pdKTtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKGNvbGxhZGFzLmxlbmd0aCwgY29sbGFkYXMpO1xuICAgIC8vY29uc29sZS5sb2coY29vcmRpbmF0ZXMpO1xuXG4gICAgbGV0IHNjYWxlID0gY29uZmlnLnNjYWxlLzEwMDtcbiAgICBmdW5jdGlvbiBsb29wKGkpe1xuICAgICAgaWYoaSA8IG51bU1vZGVscyl7XG4gICAgICAgIGNyZWF0ZUNvbGxhZGEoZ2V0UmFuZG9tQ29sbGFkYShjb2xsYWRhcykpLnRoZW4oZnVuY3Rpb24oY29sbGFkYSl7XG4gICAgICAgICAgY29sbGFkYS5wb3NpdGlvbi54ID0gY29vcmRpbmF0ZXNbaV0ueDtcbiAgICAgICAgICBjb2xsYWRhLnBvc2l0aW9uLnkgPSBjb29yZGluYXRlc1tpXS55O1xuICAgICAgICAgIGNvbGxhZGEucG9zaXRpb24ueiA9IDA7XG4gICAgICAgICAgY29sbGFkYS5yb3RhdGlvbi56ID0gZ2V0UmFuZG9tKDAsIDM2MCk7XG4gICAgICAgICAgY29sbGFkYS5zY2FsZS5zZXQoc2NhbGUsIHNjYWxlLCBzY2FsZSk7XG4gICAgICAgICAgd29ybGQuYWRkKGNvbGxhZGEpO1xuICAgICAgICAgIGxvb3AoKytpKTtcbiAgICAgICAgfSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8gcmVhZHlcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIGNvbnNvbGUudGltZUVuZCgnbG9hZGluZycpO1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICB0b29rOiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgLSB0aW1lc3RhbXAsXG4gICAgICAgICAgbnVtQ29sbGFkYXM6IG51bU1vZGVsc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgbG9vcCgwKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG59XG5cblxuZnVuY3Rpb24gZ2V0UmFuZG9tQ29sbGFkYShjb2xsYWRhcyl7XG4gIGxldCByID0gbUZsb29yKGdldFJhbmRvbSgwLCBjb2xsYWRhcy5sZW5ndGgpKTtcbiAgbGV0IGMgPSBjb2xsYWRhc1tyXTtcbiAgY29sbGFkYXMgPSBjb2xsYWRhcy5zbGljZShyLCAxKTtcbiAgLy9jb25zb2xlLmxvZyhjLCBjb2xsYWRhcy5sZW5ndGgsIHIpXG4gIHJldHVybiBjO1xufVxuXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBpbml0OmluaXQsXG4gIGNsZWFyOiBjbGVhcixcbiAgLy9hZGRDb2xsYWRhczogYWRkQ29sbGFkYXMsXG4gIGNyZWF0ZUNvbGxhZGFTdXJmYWNlOiBjcmVhdGVDb2xsYWRhU3VyZmFjZVxufTsiLCIndXNlIHN0cmljdCc7XG5cbmxldCBtUmFuZG9tID0gTWF0aC5yYW5kb207XG5sZXQgbVJvdW5kID0gTWF0aC5yb3VuZDtcbmxldCBtUG93ID0gTWF0aC5wb3c7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21Db29yZGluYXRlKGNvbnN0cmFpbnRzKXtcbiAgbGV0IHgseSx6LG1pbixtYXg7XG5cbiAgbWluID0gY29uc3RyYWludHMubWluLng7XG4gIG1heCA9IGNvbnN0cmFpbnRzLm1heC54O1xuICB4ID0gZ2V0UmFuZG9tKG1pbiwgbWF4KTtcblxuICBtaW4gPSBjb25zdHJhaW50cy5taW4ueTtcbiAgbWF4ID0gY29uc3RyYWludHMubWF4Lnk7XG4gIHkgPSBnZXRSYW5kb20obWluLCBtYXgpO1xuXG4gIG1pbiA9IGNvbnN0cmFpbnRzLm1pbi56O1xuICBtYXggPSBjb25zdHJhaW50cy5tYXguejtcbiAgeiA9IGdldFJhbmRvbShtaW4sIG1heCk7XG5cbiAgcmV0dXJuIHtcbiAgICB4OngsXG4gICAgeTp5LFxuICAgIHo6elxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tKG1pbiA9IDAsIG1heCA9IDEwKXtcbiAgcmV0dXJuIG1SYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21Db29yZGluYXRlc0luc2lkZVNoYXBlKGNvbnN0cmFpbnRzLCBzaGFwZSwgbWF4KXtcbiAgbGV0IGkgPSAwLFxuICAgIGNoZWNrLFxuICAgIGNvb3JkaW5hdGVzID0gW10sXG4gICAgY29vcmRpbmF0ZTtcblxuICBtYXggPSBtYXggfHwgMjU7XG5cbiAgd2hpbGUoaSA8IG1heCl7XG4gICAgY2hlY2sgPSB0cnVlO1xuICAgIHdoaWxlKGNoZWNrKXtcbiAgICAgIGNvb3JkaW5hdGUgPSBnZXRSYW5kb21Db29yZGluYXRlKGNvbnN0cmFpbnRzKTtcbiAgICAgIGlmKHNoYXBlLmlzUG9pbnRJblBhdGgoY29vcmRpbmF0ZS54LCBjb29yZGluYXRlLnkpKXtcbiAgICAgICAgY29vcmRpbmF0ZXMucHVzaChjb29yZGluYXRlKTtcbiAgICAgICAgaSsrO1xuICAgICAgICBjaGVjayA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY29vcmRpbmF0ZXM7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbUNvb3JkaW5hdGVzSW5zaWRlU2hhcGVHcmlkKGNvbnN0cmFpbnRzLCBzaGFwZSwgc3ByZWFkID0gMzAsIG9mZnNldCA9IDAsIG1hcmdpbiA9IDAsIG9wdGltaXNlID0gZmFsc2Upe1xuXG4gIHNwcmVhZCA9IHBhcnNlSW50KHNwcmVhZCwgMTApO1xuICBvZmZzZXQgPSBwYXJzZUludChvZmZzZXQsIDEwKTtcbiAgbWFyZ2luID0gcGFyc2VJbnQobWFyZ2luLCAxMCk7XG5cbiAgLy9jb25zb2xlLmxvZyhzcHJlYWQsb2Zmc2V0LG1hcmdpbixjb25zdHJhaW50cy5tYXgsIGNvbnN0cmFpbnRzLm1pbik7XG5cbiAgbGV0IHggPSBjb25zdHJhaW50cy5tYXgueCxcbiAgICB5ID0gY29uc3RyYWludHMubWF4LnksXG4gICAgdyA9IHggLSBjb25zdHJhaW50cy5taW4ueCxcbiAgICBoID0geSAtIGNvbnN0cmFpbnRzLm1pbi55LFxuICAgIHJvdyA9IDAsXG4gICAgY29vcmRpbmF0ZXMgPSBbXSxcbiAgICBzcHJlYWRYID0gc3ByZWFkLFxuICAgIHNwcmVhZFkgPSBzcHJlYWQsXG4gICAgcG9zWCA9IGNvbnN0cmFpbnRzLm1pbi54ICsgbWFyZ2luLFxuICAgIG1pblggPSBwb3NYLFxuICAgIG1heFggPSBjb25zdHJhaW50cy5tYXgueCAtIG1hcmdpbixcbiAgICBwb3NZID0gY29uc3RyYWludHMubWluLnkgKyBtYXJnaW4sXG4gICAgbWluWSA9IHBvc1ksXG4gICAgbWF4WSA9IGNvbnN0cmFpbnRzLm1heC55IC0gbWFyZ2luO1xuXG5cbiAgaWYob3B0aW1pc2UgPT09IHRydWUpe1xuICAgIC8vIG5lZWRzIHNvbWUgbW9yZSB3b3JrXG4gICAgLy9zcHJlYWRYID0gdy8oTWF0aC5mbG9vcih3L3NwcmVhZCkpO1xuICAgIC8vc3ByZWFkWCA9IGgvKE1hdGguZmxvb3IoaC9zcHJlYWQpKTtcbiAgICBzcHJlYWRYID0gdy8oTWF0aC5mbG9vcih3L3NwcmVhZCkpO1xuICAgIHNwcmVhZFggPSBoLyhNYXRoLmZsb29yKGgvc3ByZWFkKSk7XG4gICAgcG9zWCA9IGNvbnN0cmFpbnRzLm1pbi54ICsgc3ByZWFkWC8yO1xuICAgIG1pblggPSBwb3NYO1xuICAgIG1heFggPSBjb25zdHJhaW50cy5tYXgueCAtIHNwcmVhZFgvMjtcbiAgICBwb3NZID0gY29uc3RyYWludHMubWluLnkgKyBzcHJlYWRYLzI7XG4gICAgbWluWSA9IHBvc1k7XG4gICAgbWF4WSA9IGNvbnN0cmFpbnRzLm1heC55IC0gc3ByZWFkWC8yO1xuICB9XG5cbiAgLy9sZXQgaSA9IDA7XG5cbiAgd2hpbGUocG9zWSA8PSBtYXhZKXtcbiAgICB4ID0gcG9zWCArIChtUmFuZG9tKCkgKiBvZmZzZXQpO1xuICAgIHkgPSBwb3NZICsgKG1SYW5kb20oKSAqIG9mZnNldCk7XG4gICAgaWYoc2hhcGUuaXNQb2ludEluUGF0aCh4LCB5KSl7XG4gICAgICBjb29yZGluYXRlcy5wdXNoKHt4OngsIHk6eSwgejogMCwgcjogcm93fSk7XG4gICAgfVxuXG4gICAgcG9zWSA9IHBvc1kgKyBzcHJlYWRZO1xuXG4gICAgLy8gaWYoaSA+IDMpe1xuICAgIC8vICAgYnJlYWs7XG4gICAgLy8gfVxuICAgIC8vIGNvbnNvbGUubG9nKHBvc1ksIHNwcmVhZFkpO1xuICAgIC8vIGkrKztcblxuICAgIGlmKHBvc1kgPj0gbWF4WSl7XG4gICAgICByb3cgKz0gMTtcbiAgICAgIHBvc1kgPSBtaW5ZO1xuICAgICAgcG9zWCA9IHBvc1ggKyBzcHJlYWRYO1xuICAgICAgaWYocG9zWCA+PSBtYXhYKXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb29yZGluYXRlcztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQodmFsdWUsIGRlY2ltYWxzID0gMCl7XG4gIGlmKGRlY2ltYWxzIDw9IDApe1xuICAgIHJldHVybiBtUm91bmQodmFsdWUpO1xuICB9XG4gIHZhciBwID0gbVBvdygxMCwgZGVjaW1hbHMpO1xuICAvL2NvbnNvbGUubG9nKHAsIGRlY2ltYWxzKVxuICByZXR1cm4gbVJvdW5kKHZhbHVlICogcCkvcDtcbn1cbiJdfQ==
