'use strict';

import {round} from './util.js';

let rangeColladas = document.getElementById('number');
let rangeSpread = document.getElementById('spread');
let rangeOffset = document.getElementById('offset');
let radioGrid = document.getElementById('grid');
let radioRandom = document.getElementById('random');
let divGrid = document.getElementById('controls-grid');
let divRandom = document.getElementById('controls-random');
let divLoading = document.getElementById('loading');
let updateSliderValue;
let config = {
  number: rangeColladas.value,
  spread: rangeSpread.value,
  offset: rangeOffset.value,
  type: 'grid',
  models: [{
      url: 'models/Tulpen_short.dae'
    },{
      url: 'models/Tulpen_mid.dae'
    },{
      url: 'models/Tulpen_tall.dae'
    }
  ]
};


export default function createControls(scene3d){

  let ranges = document.querySelectorAll('input[type="range"');

  Array.from(ranges).forEach(function(range){
    range.addEventListener('mousedown', function(){
      this.addEventListener('mousemove', updateSliderValue);
    });
    range.addEventListener('mouseup', function(){
      this.removeEventListener('mousemove', updateSliderValue);
    });
    range.addEventListener('change', function(){
      updateScene3d();
    });
  });


  radioGrid.addEventListener('click', function(){
    divGrid.style.display = 'block';
    divRandom.style.display = 'none';
    config.type = 'grid';
    updateScene3d();
  }, false);

  radioRandom.addEventListener('click', function(){
    divGrid.style.display = 'none';
    divRandom.style.display = 'block';
    config.type = 'random';
    updateScene3d();
  }, false);



  updateSliderValue = function(){
    this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${this.value}`;
    config[this.id] = this.value;
  };

  function updateScene3d(){
    scene3d.createColladaSurface(config).then(function(data){
      let html = '';
      html += `number of colladas: ${data.numColladas}`;
      html += '<br>';
      html += `loading and parsing: ${Math.round(data.took, 10)}ms`;
      // if(config.type === 'grid'){
      //  html += `<br>number of colladas: ${data.numColladas}`;
      // }
      divLoading.innerHTML = html;
    });
  }

  // init
  updateScene3d();
}