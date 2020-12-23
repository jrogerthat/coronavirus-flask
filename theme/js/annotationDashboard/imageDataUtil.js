export const endDrawTime = 84;

export const colorDictionary = {
  'blue': {'code':[0, 0, 255], 'structure': ['Cell Membrane']},
  'purple':{'code':[102, 0, 204], 'structure': ['ACE2']},
  'magenta':{'code':[255, 0, 255], 'structure': ['ACE2']},
  'red':{'code':[255,0,0], 'structure': ['Envelope protein, e protein']},
  'green':{'code':[0,255,0], 'structure': ['Spike Protein', 's protein']},
 // 'RNA orange':{'code':[255,128,0], 'structure': ['RNA']},
  'orange':{'code':[255,128,0], 'structure': ['Furin, RNA']},
  'yellow':{'code':[255,255,0], 'structure': ['Membrane Protein']},
  'aqua':{'code':[0,255,255], 'structure': ['Furin']},
  'teal':{'code':[10,160,140], 'structure': ['Spike Protein', 's protein']},
  'light gray':{'code':[200,200,200], 'structure': ['Virus Membrane']},
  'unknown' :{'code':[200,200,200], 'structure': ['Spike Protein', 's protein']},
}

export const getColorIndicesForCoord = (x, y, width) => {
  let red = y * (width * 4) + (x * 4);
  return [red, red + 1, red + 2, red + 3];
};

export let currentImageData = {};

const canvas = document.getElementById('canvas');

function check(pull){
    if(pull < 10){
        return "000" + pull;
    }else if(pull < 100){
        return "00" + pull;
    }else if(pull < 1000){
        return "0" + pull;
    }else{
      return pull;
    }
}

export function clearCanvas(){
  let cxt =  canvas.getContext('2d');
  cxt.clearRect(0, 0, canvas.width, canvas.height);
}
export async function loadPngForFrame(){

  let video = document.getElementById('video');
  let pullFrame = (Math.floor((video.currentTime) * 29.8941176));

  let pathImg = '../static/assets/stills/120120_entry_flat/entry_flat'; 
    //The path to the image that we want to add
  var imgPath = pathImg + (check(pullFrame)) + '.png';
    //Create a new Image object.
  var imgObj = new Image();
    //Set the src of this Image object.
  imgObj.src = imgPath;  

  imgObj.onload = function() {
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    let cxt = canvas.getContext('2d');
    cxt.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
      
    var _data = cxt.getImageData(0, 0, canvas.width, canvas.height);
  
    currentImageData.data = _data.data.map((m,i)=> {
      if((i+1) % 4 === 0) m = 0;
      return m;
    });
    currentImageData.width = _data.width;
    currentImageData.height = _data.height;
   
    cxt.putImageData(new ImageData(new Uint8ClampedArray(currentImageData.data), canvas.width, canvas.height), 0, 0);
  }

}
  
export function drawFrameOnPause(video) {
  
  if(video.currentTime < endDrawTime){
    let imgObj = loadPngForFrame();
  }else{
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
    }else if(code[0] < code[1] && code[1] > 196 && code[2] < code[1]){
      return 'green';
    }else if(code[0] > 250 && code[1] > 200 && code[2] < 100){
        return 'yellow';
    }else if(code[0] > 240 && code[1] > 240  && code[2] > 240){
      return 'white';
    }else if(code[0] < 250 && code[0] > 200 && code[1] < 250 && code[1] > 200 && code[2] < 250 &&  code[2] > 200){
      return 'light gray';
    }else if(code[2] < 70 && code[0] > 200 && code[2] < code[0] && code[1] < code[0] && code[1] < 80){
        return 'red';
    }else if(code[0] > 250 && code[1] < 10 && code[2] > 250){
      return 'magenta';
    }else if(code[2] < 70 && code[0] > 50 && code[2] < code[0] && code[1] < code[0] && code[1] > 80){
      return 'orange';
    }else if(code[0] < 10 && code[1] > 250 && code[2] > 250){
      return 'aqua';
    }else if(code[2] > 70 && code[0] < 100 && code[2] > code[0] && code[2] > code[1]){
      return 'blue';
    }else{
      return "unknown";
    }
  
  }

  export function parseArray(hoverColor){

    let newData = Object.assign({}, currentImageData);
    newData.data = Uint8ClampedArray.from([...currentImageData.data]);
  
      for(let i = 0; i < newData.data.length; i = i + 4){
        
        let end = i + 4;
        let snip = newData.data.slice(i, end);
        let color = colorChecker(snip);

        if(color != hoverColor){
          newData.data[i] = 255;
          newData.data[i + 1] = 255;
          newData.data[i + 2] = 255;
          newData.data[i + 3] = 150;
        }else if(color === hoverColor){
          if(!colorDictionary[color].code){
            console.log('not found', color, colorDictionary)
          }
          newData.data[i] = colorDictionary[color].code[0];
          newData.data[i + 1] = colorDictionary[color].code[1];
          newData.data[i + 2] = colorDictionary[color].code[2];
          newData.data[i + 3] = 100;
        }
      }
      let  cxt  = canvas.getContext('2d');
      const myimg = new ImageData(newData.data, currentImageData.width, currentImageData.height);
      cxt.putImageData(myimg, 0, 0);
  
  }

  export function makeNewImageData(){
    let cxt = canvas.getContext('2d');
    const myimg = new ImageData(currentImageData.data, currentImageData.width, currentImageData.height);
    cxt.putImageData(myimg, 0, 0);
  }

  export function getCoordColor(coord){

    const colorIndices = getColorIndicesForCoord(Math.round(coord[0]), (coord[1]), currentImageData.width);
    const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;

    var redForCoord = currentImageData.data[redIndex];
    var greenForCoord = currentImageData.data[greenIndex];
    var blueForCoord = currentImageData.data[blueIndex];
    var alphaForCoord = currentImageData.data[alphaIndex];
    var new_rgb = 'rgba(' + redForCoord +","+ greenForCoord +","+ blueForCoord +', 1.0)';
  
    let snip = colorChecker([redForCoord, greenForCoord, blueForCoord, alphaForCoord]);
  
    return snip;
  
  }


  
  