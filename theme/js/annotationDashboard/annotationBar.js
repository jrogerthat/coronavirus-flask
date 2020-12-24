import * as d3 from 'd3';
import { annotationData } from '..';
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(faCheck, fas, far, fab) 
dom.i2svg() 
dom.watch();

export const colorArray = ['#2E86C1','#2ECC71','#F1C40F','#F10F42','black'];

export function annoTypes(){
  let data = annotationData[annotationData.length - 1];
  return Array.from(new Set(data.map(m=> m.annotation_type))).map((m, i)=> { return {type: m, color: colorArray[i]}});
}

export function clearAnnotationSidebar(){
    let annoWrap = d3.select('#left-sidebar');
    annoWrap.select('.top').selectAll('*').remove();
    annoWrap.select('.sel-anno-wrap').selectAll('*').remove();
    annoWrap.select('.anno-wrap').selectAll('*').remove();
}

export async function updateAnnotationSidebar(data, stackedData){

    let annoType = annoTypes();
    ///start drawing annotation 
    let annoWrap = d3.select('#left-sidebar');
    clearAnnotationSidebar();

   if(stackedData != null){
    let structAnnoDivs = annoWrap.select('.sel-anno-wrap').selectAll('div.structure-anno').data(stackedData).join('div').classed('structure-anno', true);
    let annoTime = structAnnoDivs.selectAll('text.time').data(d=> [d]).join('text').classed('time', true).text(d=> d.video_time);
    let annoTypeHeader = structAnnoDivs.selectAll('h6').data(d=> [d]).join('h6');
   
    let annoHeadSpan = annoTypeHeader.selectAll('span').data(d=> [d]).join('span').text(d=> d.annotation_type);
        annoHeadSpan.classed('badge badge-secondary', true);
        annoTypeHeader.filter(f=> f.has_unkown === "TRUE").selectAll('i.fas').data(d=> [d]).join('i').classed('fas fa-exclamation-circle', true);
        //annoHeadSpan.style('background-color', (d)=> annoType.filter(f=> f.type === d.annotation_type)[0].color)
        annoHeadSpan.style('background-color', (d)=> 'gray')
    let annoText = structAnnoDivs.selectAll('text.anno-text').data(d=> [d]).join('text').text(d=> d.text_description).classed('anno-text', true);
    let annoRef = structAnnoDivs.filter(f=> f.ref != "" && f.ref != "na").selectAll('text.ref').data(d=> [d]).join('text').classed('ref', true).text(d=> d.ref);
    let annoLink = structAnnoDivs.filter(f=> f.url != "" && f.url != "na").selectAll('a.link').data(d=> [d]).join('a').classed('link', true).text(d=> d.url);
        annoLink.attr('href', d=> d.url);
        annoLink.attr('target', '_blank');
   }
    
    let annoDiv = annoWrap.select('.anno-wrap').selectAll('div.anno').data(data).join('div').classed('anno', true);
    let annoTime = annoDiv.selectAll('text.time').data(d=> [d]).join('text').classed('time', true).text(d=> d.video_time);
    let annoTypeHeader = annoDiv.selectAll('h6').data(d=> [d]).join('h6');
    
    let annoHeadSpan = annoTypeHeader.selectAll('span').data(d=> [d]).join('span').text(d=> d.annotation_type);
    annoHeadSpan.classed('badge badge-secondary', true);
    //annoHeadSpan.style('background-color', (d)=> annoType.filter(f=> f.type === d.annotation_type)[0].color)
    annoHeadSpan.style('background-color', (d)=> 'gray')
    annoTypeHeader.filter(f=> f.has_unkown === "TRUE").selectAll('i.fas').data(d=> [d]).join('i').classed('fas fa-exclamation-circle', true);
    let annoText = annoDiv.selectAll('text.anno-text').data(d=> [d]).join('text').text(d=> d.text_description).classed('anno-text', true);

    let annoRef = annoDiv.filter(f=> f.ref != "" && f.ref != "na").selectAll('text.ref').data(d=> [d]).join('text').classed('ref', true).text(d=> d.ref);

    let annoLink = annoDiv.filter(f=> f.url != "" && f.url != "na").selectAll('a.link').data(d=> [d]).join('a').classed('link', true).text(d=> d.url);
    annoLink.attr('href', d=> d.url);
    annoLink.attr('target', '_blank');

    d3.select('.annotation-wrap').selectAll('rect').filter(f=> {
        let currentData = filteredAnno.map(m=> m.text_description);
        return currentData.indexOf(f.text_description) > -1;
    }).style('fill-opacity', '1');

    d3.select('.annotation-wrap').selectAll('rect').filter(f=> {
        let currentData = filteredAnno.map(m=> m.text_description);
        return currentData.indexOf(f.text_description) === -1;
    }).style('fill-opacity', '.4');

    if(stackedData != null) annoDiv.style('opacity', 0.3);

}