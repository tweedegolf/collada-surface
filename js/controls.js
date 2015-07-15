'use strict';

import {round} from './util.js';

let mFloor = Math.floor;
let selectFlower = document.getElementById('flower');
let rangeColladas = document.getElementById('number');
let rangeSpread = document.getElementById('spread');
let rangeOffset = document.getElementById('offset');
let rangeScale = document.getElementById('scale');
let rangeShort = document.getElementById('short');
let rangeMid = document.getElementById('mid');
let rangeTall = document.getElementById('tall');
let radioGrid = document.getElementById('grid');
let radioRandom = document.getElementById('random');
let divGrid = document.getElementById('controls-grid');
let divRandom = document.getElementById('controls-random');
let divLoading = document.getElementById('loading');
let updateSliderValue;
let type = 'grid';
let flower = 'Anemoon';
let config = {
  number: rangeColladas.value,
  spread: rangeSpread.value,
  offset: rangeOffset.value,
  type: type,
  scale: 100,
  models: [{
      url: `models/${flower}_short.dae`,
      ratio: rangeShort.value
    },{
      url: `models/${flower}_mid.dae`,
      ratio: rangeMid.value
    },{
      url: `models/${flower}_tall.dae`,
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

  selectFlower.addEventListener('click', function(e){
    flower = this.options[this.selectedIndex].value;
    config.scale = 100;
    rangeScale.value = 100;
    rangeScale.previousSibling.innerText = 'scale: 100%';
    updateScene3d();
  }, false);

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
    if(this.id === 'spread' || this.id === 'offset'){
      this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${this.value}`;
    }else if(this.id === 'scale'){
      this.previousSibling.innerText = `${this.getAttribute('data-label')}:\u00A0${this.valueAsNumber}%`;
    }else{
      let total = parseInt(rangeShort.value, 10) + parseInt(rangeMid.value, 10) + parseInt(rangeTall.value, 10);
      //this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${round(this.valueAsNumber/total, 2)}`;
      rangeShort.previousSibling.innerText = `${rangeShort.getAttribute('data-label')}:\u00A0${round(rangeShort.valueAsNumber * 100/total)}%`;
      rangeMid.previousSibling.innerText = `${rangeMid.getAttribute('data-label')}:\u00A0${round(rangeMid.valueAsNumber * 100/total)}%`;
      rangeTall.previousSibling.innerText = `${rangeTall.getAttribute('data-label')}:\u00A0${round(rangeTall.valueAsNumber * 100/total)}%`;
    }
    config = {
      number: rangeColladas.value,
      spread: rangeSpread.value,
      offset: rangeOffset.value,
      type: type,
      scale: rangeScale.valueAsNumber,
      models: [{
          url: `models/${flower}_short.dae`,
          ratio: rangeShort.value
        },{
          url: `models/${flower}_mid.dae`,
          ratio: rangeShort.value
        },{
          url: `models/${flower}_tall.dae`,
          ratio: rangeTall.value
        }
      ]
    }
  };

  function updateScene3d(){

    config.models = [{
        url: `models/${flower}_short.dae`,
        ratio: rangeShort.value
      },{
        url: `models/${flower}_mid.dae`,
        ratio: rangeMid.value
      },{
        url: `models/${flower}_tall.dae`,
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