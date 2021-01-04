export const endDrawTime = 84;

export const structureSelected = {
  selected: false,
  structure: null,
  annotations: null,
  comments: null,
};

export function structureSelectedToggle(datum) {
  structureSelected.structure = datum;

  if (datum === null) {
    structureSelected.annotations = null;
    structureSelected.comments = null;
    structureSelected.selected = false;
  } else {
    structureSelected.selected = true;
  }
}

export const doodleKeeper = [];

export const colorDictionary = {
  blue: { code: [0, 0, 255], structure: ['Cell Membrane'], other_names:['Cell Membrane', 'plasma membrane'] },
  purple: { code: [102, 0, 204], structure: ['ACE2'], other_names:['ACE2'] },
  magenta: { code: [255, 0, 255], structure: ['ACE2'], other_names:['ACE2'] },
  red: { code: [255, 0, 0], structure: ['Envelope protein'], other_names:['Envelope protein', 'e protein'] },
  green: { code: [0, 255, 0], structure: ['Spike Protein'], other_names:['Spike Protein', 's protein', 'spike', 'spikes'] },
  orange: { code: [255, 128, 0], structure: ['RNA', 'Furin'], other_names:[] },
  yellow: { code: [255, 255, 0], structure: ['Membrane Protein'], other_names:['Membrane Protein','membrane'] },
  aqua: { code: [0, 255, 255], structure: ['Furin'], other_names:['Furin'] },
  teal: { code: [10, 160, 140], structure: ['Spike Protein'], other_names:['Spike Protein', 's protein', 'spike', 'spikes'] },
  'light gray': { code: [200, 200, 200], structure: ['Virus Membrane'], other_names:['Virus Membrane'] },
  unknown: { code: [200, 200, 200], structure: ['Spike Protein'], other_names:['Spike Protein', 's protein', 'spike', 'spikes'] },
};

export const getColorIndicesForCoord = (x, y, width) => {
  const red = y * (width * 4) + (x * 4);
  return [red, red + 1, red + 2, red + 3];
};

export const currentImageData = {};

const canvas = document.getElementById('canvas');

function check(pull) {
  if (pull < 10) {
    return `000${pull}`;
  } if (pull < 100) {
    return `00${pull}`;
  } if (pull < 1000) {
    return `0${pull}`;
  }
  return pull;
}

export function clearCanvas() {
  const cxt = canvas.getContext('2d');
  cxt.clearRect(0, 0, canvas.width, canvas.height);
}
export async function loadPngForFrame() {
  const video = document.getElementById('video');
  const pullFrame = (Math.floor((video.currentTime) * 29.8941176));

  const pathImg = '../static/assets/stills/120120_entry_flat/entry_flat';
  // The path to the image that we want to add
  const imgPath = `${pathImg + (check(pullFrame))}.png`;
  // Create a new Image object.
  const imgObj = new Image();
  // Set the src of this Image object.
  imgObj.src = imgPath;

  imgObj.onload = function () {
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const cxt = canvas.getContext('2d');
    cxt.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

    const _data = cxt.getImageData(0, 0, canvas.width, canvas.height);

    currentImageData.data = _data.data.map((m, i) => {
      if ((i + 1) % 4 === 0) m = 0;
      return m;
    });
    currentImageData.width = _data.width;
    currentImageData.height = _data.height;

    cxt.putImageData(new ImageData(new Uint8ClampedArray(currentImageData.data), canvas.width, canvas.height), 0, 0);
  };
}

export function drawFrameOnPause(video) {
  if (video.currentTime < endDrawTime) {
    const imgObj = loadPngForFrame();
  } else {
    console.log('credits are playing');
  }
}

export function colorChecker(code){
   // console.log('code',code)
    // if((code[0] + code[1] + code[2]) === 0){
    //   return 'black';
    // }else if(code[0]<14 && code[1] > 142 && code[1] < 199 && code[2] > 142 && code[2] < 147){
    //    return 'teal';
    // }else if(code[2] > 70 && code[0] < 100 && code[2] > code[0] && code[2] > code[1]){
    //   return 'blue';
    // }else if(code[2] > 70 && code[0] > 100 && code[2] > code[0] && code[2] > code[1]){
    //   return 'purple';
    // }else if(code[2] < 70 && code[0] > 200 && code[2] < code[0] && code[1] < code[0] && code[1] < 80){
    //   return 'red';
    // }else if(code[2] < 70 && code[0] > 50 && code[2] < code[0] && code[1] < code[0] && code[1] > 80){
    //   return 'orange';
    // }else if(code[1] > code[2] && code[1] > code[0] && code[2] > 49 && code[2] > 110 && code[0] < 120 && code[1] > 200){
    //   return 'mint';
  

    if((code[0] + code[1] + code[2]) === 0){
      return 'black';
    }if(code[0] < code[1] && code[1] > 196 && code[2] < code[1]){
      return 'green';
    }if(code[0] > 250 && code[1] > 200 && code[2] < 100){
        return 'yellow';
    }if(code[0] > 240 && code[1] > 240  && code[2] > 240){
      return 'white';
    }if(code[0] < 250 && code[0] > 200 && code[1] < 250 && code[1] > 200 && code[2] < 250 &&  code[2] > 200){
      return 'light gray';
    }if(code[2] < 70 && code[0] > 200 && code[2] < code[0] && code[1] < code[0] && code[1] < 80){
        return 'red';
    }if(code[0] > 250 && code[1] < 10 && code[2] > 250){
      return 'magenta';
    }if(code[2] < 70 && code[0] > 50 && code[2] < code[0] && code[1] < code[0] && code[1] > 80){
      return 'orange';
    }if(code[0] < 10 && code[1] > 250 && code[2] > 250){
      return 'aqua';
    }if(code[2] > 70 && code[0] < 100 && code[2] > code[0] && code[2] > code[1]){
      return 'blue';
    }
      return "unknown";
    
  
  }

export function parseArray(hoverColor) {
  const newData = { ...currentImageData };
  newData.data = Uint8ClampedArray.from([...currentImageData.data]);

  for (let i = 0; i < newData.data.length; i += 4) {
    const end = i + 4;
    const snip = newData.data.slice(i, end);
    const color = colorChecker(snip);

    if (color != hoverColor) {
      newData.data[i] = 255;
      newData.data[i + 1] = 255;
      newData.data[i + 2] = 255;
      newData.data[i + 3] = 150;
    } else if (color === hoverColor) {
      if (!colorDictionary[color].code) {
        console.log('not found', color, colorDictionary);
      }
      newData.data[i] = colorDictionary[color].code[0];
      newData.data[i + 1] = colorDictionary[color].code[1];
      newData.data[i + 2] = colorDictionary[color].code[2];
      newData.data[i + 3] = 100;
    }
  }
  const cxt = canvas.getContext('2d');
  const myimg = new ImageData(newData.data, currentImageData.width, currentImageData.height);
  cxt.putImageData(myimg, 0, 0);
}

export function makeNewImageData() {
  const cxt = canvas.getContext('2d');
  const myimg = new ImageData(currentImageData.data, currentImageData.width, currentImageData.height);
  cxt.putImageData(myimg, 0, 0);
}

export function getCoordColor(coord) {
  const colorIndices = getColorIndicesForCoord(Math.round(coord[0]), (coord[1]), currentImageData.width);
  const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;

  const redForCoord = currentImageData.data[redIndex];
  const greenForCoord = currentImageData.data[greenIndex];
  const blueForCoord = currentImageData.data[blueIndex];
  const alphaForCoord = currentImageData.data[alphaIndex];
  const new_rgb = `rgba(${redForCoord},${greenForCoord},${blueForCoord}, 1.0)`;

  const snip = colorChecker([redForCoord, greenForCoord, blueForCoord, alphaForCoord]);

  return snip;
}
