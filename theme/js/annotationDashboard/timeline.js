import { annotationData } from "..";
import * as d3 from 'd3';
import { dataKeeper, formatAnnotationTime } from "../dataManager";

function structureTooltip(coord, d, type){
    if(type === "comments"){
        d3.select('#timeline-tooltip')
        .style('position', 'absolute')
        .style("opacity", 1)
        .html(`
        <h7>${d.range[0]}-${d.range[1]} seconds</h7><br>
        <h7>${d.data.length} comments</h7>
        `)
        .style("left", (coord[0]) + "px")
        .style("top", "-60px");
    }else{
        d3.select('#timeline-tooltip')
        .style('position', 'absolute')
        .style("opacity", 1)
        .html(`
        <h7>Type: ${d.annotation_type}</h7><br>
        `)
        .style("left", (coord[0]) + "px")
        .style("top", (coord[1]) +"px");
    }
      
  
}
export function renderTimeline(commentData){

    let xScale = d3.scaleLinear().range([0, 950]).domain([0, 89]);
    let div = d3.select('#main');
   
    let timelineWrap = div.select('.timeline-wrap');
    timelineWrap.style('position', 'absolute');
    timelineWrap.style('top', (560 + 60) + "px");
    let timeSVG = timelineWrap.append('svg');
    timeSVG.style('width', (970) + "px");
    let comments = Object.entries(commentData.comments).map(m=> {
        m[1].key = m[0];
        return m[1]});

    function binThings(){
        let binCount = 90 / 5;
        let keeper = [];
        for(let i = 0; i  < binCount;  i++ ){
            keeper[i] = {range: [(i*5), ((i+1)*5)], data: comments.filter(f=> f.videoTime >= (i*5) && f.videoTime <= ((i+1) * 5))};
        }
        return keeper;
    } 

    let commentBins =  binThings();

    let binScale = d3.scaleLinear().range([0, 1]).domain([0, d3.max(commentBins.map(m => m.data.length))])
  
    let commentGroup = timeSVG.append('g').classed('comm-group', true);
    let comBins = commentGroup.selectAll('g.comm-bin').data(commentBins).join('g').classed('comm-bin', true);
    comBins.attr('transform', (d, i)=> `translate(${xScale((i*5))} 2)`);
    let commentBinRect = comBins.selectAll('rect').data(d=> [d]).join('rect');
    commentBinRect.attr('height', 10).attr('width',(950/commentBins.length));
 
    commentBinRect.style('fill-opacity', (d, i)=> binScale(d.data.length));

    comBins.on('mouseover', (event, d)=> commentBinTimelineMouseover(event, d));
    comBins.on('mouseout', (event, d)=> commentBinTimelineMouseout(event, d));

    commentBins.map((m, i)=> m.data.length);
    
    let annoGroup = timeSVG.append('g').classed('anno-group', true);
    annoGroup.attr('transform', 'translate(0, 30)');
    let annos = annoGroup.selectAll('g.anno').data(annotationData[annotationData.length - 1]).join('g').classed('anno', true);
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
   
    annos.on('mouseover', function(event, d){
        timelineMouseover(event, d)})
        .on('mouseout', function(event, d){ 
            timelineMouseout(event, d)});
}

export function highlightTimelineBars(timeRange){
   
    d3.select('.timeline-wrap').selectAll('.anno')
        .filter(f=> (f.seconds[0] >= timeRange[0] && f.seconds[0] <= timeRange[1]) || (f.seconds[1] <= timeRange[1] && f.seconds[1] >= timeRange[0]))
        .classed('current', true);

    d3.select('.timeline-wrap').selectAll('.anno')
        .filter(f=> f.seconds[1] < timeRange[0] || f.seconds[0] > timeRange[1])
        .classed('current', false);
}

export function commentBinTimelineMouseover(event, d){
    d3.select(event.target.parentNode).classed('current-hover', true);
    console.log('d on mouseover', d)
    if(d.data.length > 0){
        let comments = d3.select('#right-sidebar').select('#comment-wrap').selectAll('.memo');
        let filComm = comments.filter(f=> d.data.map(m=> m.key).indexOf(f.key) > -1);
        filComm.classed('selected', true);
        filComm.nodes()[0].scrollIntoView({behavior: "smooth"});

        structureTooltip([(event.target.getBoundingClientRect().x - 300)], d, "comments");
    }
}

export function commentBinTimelineMouseout(event, d){
    d3.select(event.target.parentNode).classed('current-hover', false);
    let comments = d3.select('#right-sidebar').select('#comment-wrap').selectAll('.memo');
    comments.filter(f=> d.data.map(m=> m.key).indexOf(f.key) > -1).classed('selected', false);
    d3.select('#timeline-tooltip').style('opacity', 0);
}

export function timelineMouseover(event, d){
    d3.select(event.target.parentNode).classed('current-hover', true);
    let filAnn = d3.select('#left-sidebar').selectAll('.anno').filter(f=> f.index === d.index).classed('selected', true);
    filAnn.nodes()[0].scrollIntoView({behavior: "smooth"});
    let coord = d3.pointer(event);
    console.log('d i anno', d)
    structureTooltip([(event.target.getBoundingClientRect().x - 300)+coord[0], coord[1]], d, "anno");
}

export function timelineMouseout(event, d){
    d3.select(event.target.parentNode).classed('current-hover', false);
    d3.select('#left-sidebar').selectAll('.anno').filter(f=> f.index === d.index).classed('selected', false);
}