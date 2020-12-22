import { annotationData } from "..";
import * as d3 from 'd3';
import { formatAnnotationTime } from "../dataManager";


export function renderTimeline(div){
   
    let timelineWrap = div.append('div').classed('timeline-wrap', true);
    console.log(document.getElementById('canvas').height, document.getElementById('video-controls').getBoundingClientRect());
    timelineWrap.style('position', 'absolute');
    timelineWrap.style('top', (560 + 60) + "px");
    timelineWrap.style('width', (960) + "px");
    let timeSVG = timelineWrap.append('svg');
    let annos = timeSVG.selectAll('g.anno').data(annotationData[annotationData.length - 1]).join('g').classed('anno', true);
}