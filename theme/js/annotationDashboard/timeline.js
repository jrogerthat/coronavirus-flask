import { annotationData } from "..";
import * as d3 from 'd3';
import { formatAnnotationTime } from "../dataManager";


export function renderTimeline(div){

    let xScale = d3.scaleLinear().range([0, 960]).domain([0, 89]);
   
    let timelineWrap = div.append('div').classed('timeline-wrap', true);
    console.log(document.getElementById('canvas').height, document.getElementById('video-controls').getBoundingClientRect());
    timelineWrap.style('position', 'absolute');
    timelineWrap.style('top', (560 + 60) + "px");
    let timeSVG = timelineWrap.append('svg');
    timeSVG.style('width', (960) + "px");
    let annos = timeSVG.selectAll('g.anno').data(annotationData[annotationData.length - 1]).join('g').classed('anno', true);
    let rects = annos.selectAll('rect').data(d=> [d]).join('rect');
    rects.attr('height', 6).attr('width', (d)=> {
        return (xScale(d.seconds[1]) - xScale(d.seconds[0]))});
    annos.attr("transform", (d, i, n)=> {
        if(i > 0){
            let chosen = d3.selectAll(n).data().filter((f, j)=> {
                return j < i && f.seconds[1] > d.seconds[0];
            });
            return `translate(${xScale(d.seconds[0])} ${(7 * chosen.length)})`;
        }else{
            return `translate(${xScale(d.seconds[0])} 0)`;
        }
    });
    rects.style('opacity', 0.3);
}