import { round } from './util';

const mFloor = Math.floor;
const selectFlower = document.getElementById('flower');
const rangeColladas = document.getElementById('number');
const rangeSpread = document.getElementById('spread');
const rangeOffset = document.getElementById('offset');
const rangeScale = document.getElementById('scale');
const rangeShort = document.getElementById('short');
const rangeMid = document.getElementById('mid');
const rangeTall = document.getElementById('tall');
const radioGrid = document.getElementById('grid');
const radioRandom = document.getElementById('random');
const divGrid = document.getElementById('controls-grid');
const divRandom = document.getElementById('controls-random');
const divLoading = document.getElementById('loading');
let updateSliderValue;
let type = 'grid';
let flower = 'Anemoon';
let config = {
  number: rangeColladas.value,
  spread: rangeSpread.value,
  offset: rangeOffset.value,
  type,
  scale: 100,
  models: [{
    url: `models/${flower}_short.dae`,
    ratio: rangeShort.value,
  }, {
    url: `models/${flower}_mid.dae`,
    ratio: rangeMid.value,
  }, {
    url: `models/${flower}_tall.dae`,
    ratio: rangeTall.value,
  },
  ],
};


export default function createControls(scene3d) {
  const ranges = document.querySelectorAll('input[type="range"');

  Array.from(ranges).forEach((range) => {
    range.addEventListener('mousedown', function () {
      this.addEventListener('mousemove', updateSliderValue);
    });
    range.addEventListener('mouseup', function () {
      this.removeEventListener('mousemove', updateSliderValue);
    });
    range.addEventListener('change', () => {
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

  radioGrid.addEventListener('click', () => {
    divGrid.style.display = 'block';
    divRandom.style.display = 'none';
    type = 'grid';
    updateScene3d();
  }, false);

  radioRandom.addEventListener('click', () => {
    divGrid.style.display = 'none';
    divRandom.style.display = 'block';
    type = 'random';
    updateScene3d();
  }, false);


  updateSliderValue = function () {
    if (this.id === 'spread' || this.id === 'offset') {
      this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${this.value}`;
    } else if (this.id === 'scale') {
      this.previousSibling.innerText = `${this.getAttribute('data-label')}:\u00A0${this.valueAsNumber}%`;
    } else {
      const total = parseInt(rangeShort.value, 10) + parseInt(rangeMid.value, 10) + parseInt(rangeTall.value, 10);
      // this.previousSibling.innerText = `${this.getAttribute('data-label')}: ${round(this.valueAsNumber/total, 2)}`;
      rangeShort.previousSibling.innerText = `${rangeShort.getAttribute('data-label')}:\u00A0${round(rangeShort.valueAsNumber * 100 / total)}%`;
      rangeMid.previousSibling.innerText = `${rangeMid.getAttribute('data-label')}:\u00A0${round(rangeMid.valueAsNumber * 100 / total)}%`;
      rangeTall.previousSibling.innerText = `${rangeTall.getAttribute('data-label')}:\u00A0${round(rangeTall.valueAsNumber * 100 / total)}%`;
    }
    config = {
      number: rangeColladas.value,
      spread: rangeSpread.value,
      offset: rangeOffset.value,
      type,
      scale: rangeScale.valueAsNumber,
      models: [{
        url: `models/${flower}_short.dae`,
        ratio: rangeShort.value,
      }, {
        url: `models/${flower}_mid.dae`,
        ratio: rangeShort.value,
      }, {
        url: `models/${flower}_tall.dae`,
        ratio: rangeTall.value,
      },
      ],
    };
  };

  function updateScene3d() {
    config.models = [{
      url: `models/${flower}_short.dae`,
      ratio: rangeShort.value,
    }, {
      url: `models/${flower}_mid.dae`,
      ratio: rangeMid.value,
    }, {
      url: `models/${flower}_tall.dae`,
      ratio: rangeTall.value,
    },
    ];
    // console.log(config)

    scene3d.createColladaSurface(config).then((data) => {
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
