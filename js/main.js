import scene3d from './scene3d';
import createControls from './controls';

window.onload = () => {
  scene3d.init();
  createControls(scene3d);
};
