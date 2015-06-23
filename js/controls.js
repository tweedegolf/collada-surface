'use strict';

import {round} from './util.js';

let rangeColladas = document.getElementById('number');
let rangeSpread = document.getElementById('spread');
let rangeOffset = document.getElementById('offset');
let rangeShort = document.getElementById('tullip-short');
let rangeMid = document.getElementById('tullip-mid');
let rangeTall = document.getElementById('tullip-tall');
let radioGrid = document.getElementById('grid');
let radioRandom = document.getElementById('random');
let divGrid = document.getElementById('controls-grid');
let divRandom = document.getElementById('controls-random');
let divLoading = document.getElementById('loading');
let updateSliderValue;
let type = 'grid';
let config = {
  number: rangeColladas.value,
  spread: rangeSpread.value,
  offset: rangeOffset.value,
  type: type,
  models: [{
      url: 'models/Tulpen_short.dae',
      ratio: rangeShort.value
    },{
      url: 'models/Tulpen_mid.dae',
      ratio: rangeMid.value
    },{
      url: 'models/Tulpen_tall.dae',
      ratio: rangeTall.value
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
    type = 'grid';
    updateScene3d();
  }, false);

  radioRandom.addEventListener('click', function(){
    divGrid.style.display = 'none';
    divRandom.style.display = 'block';
    type = 'random';
    updateScene3d();
  }, false);



  updateSliderValue = function(){
    if(this.id.indexOf('tullip') === -1){
      this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${this.value}`;
    }else{
      let total = parseInt(rangeShort.value, 10) + parseInt(rangeMid.value, 10) + parseInt(rangeTall.value, 10);
      //this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${round(this.valueAsNumber/total, 2)}`;
      rangeShort.previousSibling.innerText = `${rangeShort.getAttribute('data-label')}: ${round(rangeShort.valueAsNumber * 100/total, 2)}%`;
      rangeMid.previousSibling.innerText = `${rangeMid.getAttribute('data-label')}: ${round(rangeMid.valueAsNumber * 100/total, 2)}%`;
      rangeTall.previousSibling.innerText = `${rangeTall.getAttribute('data-label')}: ${round(rangeTall.valueAsNumber * 100/total, 2)}%`;
    }
    config = {
      number: rangeColladas.value,
      spread: rangeSpread.value,
      offset: rangeOffset.value,
      type: type,
      models: [{
          url: 'models/Tulpen_short.dae',
          ratio: rangeShort.value
        },{
          url: 'models/Tulpen_mid.dae',
          ratio: rangeShort.value
        },{
          url: 'models/Tulpen_tall.dae',
          ratio: rangeTall.value
        }
      ]
    }
  };

  function updateScene3d(){

    config.models = [{
        url: 'models/Tulpen_short.dae',
        ratio: rangeShort.value
      },{
        url: 'models/Tulpen_mid.dae',
        ratio: rangeMid.value
      },{
        url: 'models/Tulpen_tall.dae',
        ratio: rangeTall.value
      }
    ]
    //console.log(config)

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