'use strict';

require('babelify/polyfill');

import scene3d from './scene3d';
import createControls from './controls';

window.onload = function(){

  scene3d.init();
  createControls(scene3d);

};
