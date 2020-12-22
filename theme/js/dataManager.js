export const dataKeeper = [];
export const currentUser = [];

export function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  
    return {
      minutes: result.substr(3, 2),
      seconds: result.substr(6, 2),
    };
  }

export function formatVideoTime(videoTime){
    let time = parseInt(videoTime);
    var minutes = Math.floor(time / 60);
    var seconds = (time - (minutes * 60));

    return `${minutes}:${('0' + seconds).slice(-2)}`;
}

  export function formatAnnotationTime(d){

    return d.map(m=> {
        if(m.video_time.includes("-")){

            let range = m.video_time.split("-");
           
            let start = range[0].split(":");
            let startSec = (+start[0] * 60) + +start[1];
              
            let end = range[1].split(":");
            let endSec = (+end[0] * 60) + +end[1];
            m.seconds = [startSec, endSec];

        }else{
          
            let time= m.video_time.split(":");
         
            let seconds = (+time[0] * 60) + +time[1];
    
            m.seconds = [seconds];
        }
            
        return m;
    });
}