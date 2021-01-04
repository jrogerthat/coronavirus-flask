import * as d3 from 'd3';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { annotationData } from '..';

library.add(faCheck, fas, far, fab);
dom.i2svg();
dom.watch();

export const colorArray = ['#2E86C1', '#2ECC71', '#F1C40F', '#F10F42', 'black'];

export function annoTypes() {
  const data = annotationData[annotationData.length - 1];
  return Array.from(new Set(data.map((m) => m.annotation_type))).map((m, i) => ({ type: m, color: colorArray[i] }));
}

export function clearAnnotationSidebar() {
  const annoWrap = d3.select('#left-sidebar');
  annoWrap.select('.top').selectAll('*').remove();
  annoWrap.select('.sel-anno-wrap').selectAll('*').remove();
  annoWrap.select('.anno-wrap').selectAll('*').remove();
}

function renderAnnotationBoxes(divs){

  divs.filter(f=> f.has_unkown === 'TRUE').classed('question', true);

  const annoTime = divs.selectAll('text.time').data((d) => [d]).join('text').classed('time', true)
    .text((d) => d.video_time);

  const annoTypeHeader = divs.selectAll('h6').data((d) => [d]).join('h6');

  const annoHeadSpan = annoTypeHeader.selectAll('span').data((d) => [d]).join('span').text((d) => d.annotation_type);
  annoHeadSpan.classed('badge badge-secondary', true);

  annoTypeHeader.filter((f) => f.has_unkown === 'TRUE').selectAll('i.question').data((d) => [d]).join('i')
    .classed('fas fa-exclamation-circle question', true);


    annoTypeHeader.filter((f) => f.ref != '' && f.ref != 'na').selectAll('i.reference').data((d) => [d]).join('i')
    .classed('fas fa-book-open reference', true);
 
  annoHeadSpan.style('background-color', (d) => 'gray');

  const annoText = divs.selectAll('text.anno-text').data((d) => [d]).join('text').text((d) => d.text_description)
    .classed('anno-text', true);

  const annoRefDiv = divs.filter((f) => f.ref != '' && f.ref != 'na').selectAll('div.ref').data(d=> [d].map(m=> {
    m.expanded = false;
    return m;
  })).join('div').classed('ref', true);

  let refButton = annoRefDiv.selectAll('button').data(d=> [d]).join('button').classed('btn btn-outline-secondary btn-sm', true);
  refButton.text('See Citation');

  refButton.on('click', (event, d)=> {
   
    if(d.expanded === false){
      d.expanded = true;
      d3.select(event.target.parentNode).selectAll('text.ref').data((r) => [r]).join('text')
      .classed('ref', true)
      .text((t) => t.ref);
      d3.select(event.target).text("Hide Citation");
    }else{

    d.expanded = false;
    d3.selectAll('text.ref').remove();
    d3.select(event.target).text("See Citation");
  }
});



    const annoLink = divs.filter((f) => f.url != '' && f.url != 'na').selectAll('a.link').data((d) => [d]).join('a')
      .classed('link', true)
      .text((d) => d.url);

    annoLink.attr('href', (d) => d.url);
    annoLink.attr('target', '_blank');

}

export async function updateAnnotationSidebar(data, stackedData) {
  const annoType = annoTypes();
  /// start drawing annotation
  const annoWrap = d3.select('#left-sidebar');
  clearAnnotationSidebar();

  console.log('stacleked data',stackedData)

  if (stackedData != null) {
    const structAnnoDivs = annoWrap.select('.sel-anno-wrap').selectAll('div.structure-anno').data(stackedData).join('div')
      .classed('structure-anno', true);

    renderAnnotationBoxes(structAnnoDivs);
    
  }

  const annoDiv = annoWrap.select('.anno-wrap').selectAll('div.anno').data(data).join('div')
    .classed('anno', true);

  renderAnnotationBoxes(annoDiv);

  d3.select('.annotation-wrap').selectAll('rect').filter((f) => {
    const currentData = filteredAnno.map((m) => m.text_description);
    return currentData.indexOf(f.text_description) > -1;
  }).style('fill-opacity', '1');

  d3.select('.annotation-wrap').selectAll('rect').filter((f) => {
    const currentData = filteredAnno.map((m) => m.text_description);
    return currentData.indexOf(f.text_description) === -1;
  }).style('fill-opacity', '.4');

  if (stackedData != null) annoDiv.style('opacity', 0.3);
}

export function highlightAnnotationbar(currentTime) {
  const annos = d3.selectAll('#left-sidebar').select('.anno-wrap').selectAll('div.anno');
  const test = Array.from(new Set(annos.data().map((m) => m.seconds[0]))).filter((f) => f <= currentTime);

  const selectedAnno = annos.filter((f) => f.seconds[0] == test[test.length - 1]).classed('selected', true);
  selectedAnno.nodes()[0].scrollIntoView({ behavior: 'smooth' });
}
