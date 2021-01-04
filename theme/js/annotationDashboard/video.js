import * as d3 from 'd3';
import firebase from 'firebase/app';
import { annotationData } from '..';
import { dataKeeper, formatAnnotationTime, formatTime } from '../dataManager';
import { addStructureLabelFromButton, addCommentButton, goBackButton } from './topbar';
import {
  clearCanvas, colorDictionary, currentImageData, drawFrameOnPause, endDrawTime, getCoordColor, makeNewImageData, parseArray, structureSelected, structureSelectedToggle,
} from './imageDataUtil';
import {
  drawCommentBoxes, formatCommentData, updateCommentSidebar, clearRightSidebar, highlightCommentBoxes, renderCommentDisplayStructure, renderStructureKnowns,
} from './commentBar';
import { highlightAnnotationbar, updateAnnotationSidebar } from './annotationBar';
import { highlightTimelineBars } from './timeline';
import 'firebase/storage';

let canPlay;

const currentColorCodes = [];

const canvas = document.getElementById('canvas');
canvas.setAttribute('pointer-events', 'none');

function resizeVideoElements() {
  const video = document.getElementById('video');
  document.getElementById('interaction').style.width = `${Math.round(video.videoWidth)}px`;
  document.getElementById('interaction').style.height = `${video.videoHeight}px`;

  canvas.style.width = `${Math.round(video.videoWidth)}px`;
  canvas.style.height = `${video.videoHeight}px`;

  document.getElementById('video-controls').style.top = `${video.videoHeight + 7}px`;

  d3.select('.progress-bar').node().style.width = `${Math.round(video.videoWidth)}px`;
}

function initializeVideo() {
  const videoDuration = Math.round(document.getElementById('video').duration);
  const time = formatTime(videoDuration);
  const duration = document.getElementById('duration');
  duration.innerText = `${time.minutes}:${time.seconds}`;
  duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
}

export function formatVidPlayer(isInteractive) {
  const video = document.getElementById('video');
  video.muted = true;

  Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get() {
      return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    },
  });

  video.oncanplay = function () {
    if (video.readyState >= 3) {
      canPlay = true;
      resizeVideoElements();
      drawFrameOnPause(video);

      d3.select('#interaction').on('click', (event) => mouseClickVideo(d3.pointer(event), video))
        .on('mousemove', (event) => mouseMoveVideo(d3.pointer(event), video));

      d3.select('#video-controls').select('.play-pause').on('click', () => togglePlay());
      d3.select('.progress-bar').on('click', progressClicked);
    } else {
      video.addEventListener('canplay', canPlay = true);
    }
  };

  video.addEventListener('timeupdate', updateTimeElapsed);
  video.addEventListener('loadedmetadata', initializeVideo);
}
function updateTimeElapsed() {
  const time = formatTime(Math.round(document.getElementById('video').currentTime));
  const timeElapsed = document.getElementById('time-elapsed');
  timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
  timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
  d3.select('.progress-bar-fill').style('width', `${scaleVideoTime(document.getElementById('video').currentTime)}px`);
}
function progressClicked(mouse) {
  document.getElementById('video').currentTime = Math.round(scaleVideoTime(mouse.offsetX, true));
  updateTimeElapsed();
}

export function commentClicked(event, d) {
  document.getElementById('video').currentTime = d.videoTime;
  updateTimeElapsed();
}
function scaleVideoTime(currentTime, invert) {
  const { duration } = document.getElementById('video');
  const scale = d3.scaleLinear().range([0, video.videoWidth]).domain([0, duration]);
  return invert ? scale.invert(currentTime) : scale(currentTime);
}
export function playButtonChange() {
  const div = d3.select('#video-controls').select('.play-pause');
  if (div.classed('play')) {
    div.classed('play', false);
    div.classed('pause', true);
    div.selectAll('*').remove();
    const button = div.append('span');
    button.attr('class', 'fas fa-pause-circle fa-2x');
  } else {
    div.classed('play', true);
    div.classed('pause', false);
    div.selectAll('*').remove();
    const button = div.append('span');
    button.attr('class', 'fas fa-play-circle fa-2x');
  }
}

// togglePlay toggles the playback state of the video.
// If the video playback is paused or ended, the video is played
// otherwise, the video is paused
export function togglePlay() {
  playButtonChange();
  if (video.playing) {
    video.pause();
    drawFrameOnPause(video);
  } else {
    clearCanvas();
    video.play();
  }
}

export async function mouseMoveVideo(coord, video) {
  if (video.playing) {
      console.log('video playing');
  } else if (structureSelected.selected === true || video.currentTime >= endDrawTime) {
      console.log('struct selected');
  } else {
    const snip = getCoordColor(coord);

    if (snip != currentColorCodes[currentColorCodes.length - 1] && !video.playing && snip != 'black' && snip != 'unknown') {
      currentColorCodes.push(snip);
      parseArray(snip);
      const structFromDict = (snip === 'orange' && video.currentTime > 16) ? colorDictionary[snip].structure[1].toUpperCase() : colorDictionary[snip].structure[0].toUpperCase();
      const structureData = annotationData[annotationData.length - 1].filter((f) => {
        //console.log('f in mouseover', f);
        return f.associated_structures.split(', ').map((m) => m.toUpperCase()).indexOf(structFromDict) > -1});
      structureTooltip(structureData, coord, snip, true);
    } else if (snip === 'black') {
      d3.select('.tooltip').style('opacity', 0);

      makeNewImageData();
    }
  }
}
export async function mouseClickVideo(coord, video) {
  const commentData = { ...dataKeeper[dataKeeper.length - 1] };

  if (video.playing) {
    structureSelectedToggle(null);
    togglePlay();
  } else {
    /**
     * VIDEO PAUSED - CLICKED NOT ON STRUCTURE
     */
    const snip = getCoordColor(coord);

    if (snip === 'black' || snip === 'unknown') {
      structureSelectedToggle(null);

      togglePlay();
      addCommentButton();
      clearRightSidebar();
      renderCommentDisplayStructure();
      updateCommentSidebar(commentData);
      updateAnnotationSidebar(annotationData[annotationData.length - 1], null, null);

      d3.select('.tooltip')
        .style('position', 'absolute')
        .style('opacity', 0);
    } else {
      /**
       * VIDEO PAUSED - CLICKED ON STRUCTURE
       */
      structureSelectedToggle(colorDictionary[snip].structure[0]);
      parseArray(snip);

      console.log('snip', snip);

      const nestReplies = formatCommentData({ ...commentData }, null);

      structureSelected.comments = nestReplies.filter((f) => {
        if (snip === 'orange') { //it  could be furin or rna - check time
          if(video.currentTime < 15){
            let struct = colorDictionary[snip].structure[0].toUpperCase();
            let reply = f.replyKeeper.filter(r=> {
              r.comment.toUpperCase().includes(struct);
              return rTest.length > 0;
            });
            
            return f.comment.toUpperCase().includes(colorDictionary).includes(struct) || reply.length > 0;
          }else{
            let struct = colorDictionary[snip].structure[1].toUpperCase();
            return f.comment.toUpperCase().includes(colorDictionary).includes(struct);
          }
        }else{
          let tags = f.tags.split(',').filter(m=> {
            return colorDictionary[snip].other_names.map(on=> on.toUpperCase()).indexOf(m.toUpperCase()) > -1;
          });
          let test = colorDictionary[snip].other_names.filter(n=> f.comment.toUpperCase().includes(n.toUpperCase()));
            let reply = f.replyKeeper.filter(r=> {
              let rTest = colorDictionary[snip].other_names.filter(n=> r.comment.toUpperCase().includes(n.toUpperCase()));
              return rTest.length > 0;
            });
          return test.length > 0 || reply.length > 0 || tags.length > 0;
        }
       
      });

      const structureAnnotations = annotationData[annotationData.length - 1].filter((f) => {
        let structsAnno = f.associated_structures.split(', ').filter((m) => {
          let otherNames = colorDictionary[snip].other_names.map(on=> on.toUpperCase()).indexOf(m.toUpperCase());
          return otherNames > -1;
        });
        return structsAnno.length > 0;
      });

      structureSelected.annotations = structureAnnotations.filter((f) => f.has_unkown === 'TRUE').concat(structureAnnotations.filter((f) => f.has_unkown === 'FALSE'));

      structureTooltip(structureAnnotations, coord, snip, false);
      const annoWrap = d3.select('#left-sidebar');

      goBackButton();
      // clearRightSidebar();
      renderCommentDisplayStructure();

      const genComWrap = d3.select('#comment-wrap').select('.general-comm-wrap');
      const selectedComWrap = d3.select('#comment-wrap').select('.selected-comm-wrap');
      const topCommentWrap = d3.select('#comment-wrap').select('.top');
      // NEED TO CLEAR THIS UP - LOOKS LIKE YOU ARE REPEATING WORK IN UPDATE COMMENT SIDEBAR AND DRAW COMMETN BOXES
      updateCommentSidebar(commentData, structureSelected.comments);
      updateAnnotationSidebar(annotationData[annotationData.length - 1], structureSelected.annotations, null);
      annoWrap.select('.top').append('h6').text('   Associated Annotations: ');

      renderStructureKnowns(topCommentWrap);

      const stackedData = structureSelected.annotations.filter((f) => f.has_unkown == 'TRUE').concat(structureSelected.annotations.filter((f) => f.has_unkown == 'FALSE'));
      const annos = topCommentWrap.selectAll('.anno').data(stackedData).join('div').classed('anno', true);

      const unknowns = annos.filter((f) => f.has_unkown === 'TRUE');
      unknowns.classed('unknown', true);

      selectedComWrap.append('h7').text('Associated Comments: ');

      topCommentWrap.node().scrollIntoView();
      annoWrap.select('.top').node().scrollIntoView();

      // MIGHT BE REPEATING WORK - ALREADY HAVE UPDATE COMMENT SIDEBAR ABOVE
      drawCommentBoxes(structureSelected.comments, selectedComWrap);
      drawCommentBoxes(nestReplies, genComWrap);
      genComWrap.selectAll('.memo').style('opacity', 0.3);
    }
  }
}
function structureTooltip(structureData, coord, snip, hoverBool) {
  const commentData = { ...dataKeeper[dataKeeper.length - 1] };

  const nestReplies = formatCommentData({ ...commentData }, null);

  const structureComments = nestReplies.filter((f) => {
    if (colorDictionary[snip].structure[1]) {
      return f.comment.toUpperCase().includes(colorDictionary[snip].structure[0].toUpperCase()) || f.comment.toUpperCase().includes(colorDictionary[snip].structure[1].toUpperCase);
    }
    return f.comment.includes(colorDictionary[snip].structure[0]);
  });
  if (hoverBool) {
    const question = structureData.filter((f) => f.has_unkown === 'TRUE').length + structureComments.filter((f) => f.comment.includes('?')).length;
    const refs = structureData.filter((f) => f.url != '').length + structureComments.filter((f) => f.comment.includes('http')).length;

    d3.select('.tooltip')
      .style('position', 'absolute')
      .style('opacity', 1)
      .html(`<h4>${colorDictionary[snip].structure[0]}</h4>
    <span class="badge badge-pill badge-info"><h7>${structureData.length}</h7></span> annotations for this structure. <br>
    <span class="badge badge-pill badge-danger">${question}</span> Questions. <br>
    <span class="badge badge-pill badge-warning">${refs}</span> Refs. <br>
    <br>
    <h7>Click Structure for more Info</h7>
    `)
      .style('left', `${coord[0]}px`)
      .style('top', `${coord[1]}px`);
  } else {
    d3.select('.tooltip')
      .style('position', 'absolute')
      .style('opacity', 1)
      .html(`<h4>${colorDictionary[snip].structure[0]}</h4>
    `)
      .style('left', `${coord[0]}px`)
      .style('top', `${coord[1]}px`);
  }
}

function renderPushpinMarks(commentsInTimeframe, svg) {
  const pushes = commentsInTimeframe.filter((f) => f.commentMark === 'push');
  const pushedG = svg.selectAll('g.pushed').data(pushes).join('g').classed('pushed', true);
  pushedG.attr('transform', (d) => `translate(${(960 * d.posLeft)}, ${(540 * d.posTop)})`);

  const circ = pushedG.selectAll('circle').data((d) => [d]).join('circle');
  circ.attr('r', 10);

  circ.attr('cx', (d) => 0);
  circ.attr('cy', (d) => 0);
  circ.attr('fill', 'red');

  circ.on('mouseover', (d) => {
    const wrap = d3.select('#right-sidebar').select('#comment-wrap');
    const memoDivs = wrap.selectAll('.memo').filter((f) => f.key === d.key);
    memoDivs.classed('selected', true);
    memoDivs.nodes()[0].scrollIntoView({ behavior: 'smooth' });
  }).on('mouseout', (d) => {
    const wrap = d3.select('#right-sidebar').select('#annotation-wrap');
    const memoDivs = wrap.selectAll('.memo').classed('selected', false);
  });

  const annotationGroup = pushedG.selectAll('g.annotations').data((d) => [d]).join('g').classed('annotations', true);

  const labelRect = annotationGroup.selectAll('rect').data((d) => [d]).join('rect')
    .attr('x', 17)
    .attr('y', -20)
    .attr('width', 100)
    .attr('height', 30)
    .attr('fill', '#fff');

  const annotationText = annotationGroup.selectAll('text').data((d) => [d]).join('text')
    .text((d) => d.displayName)
    .classed('annotation-label', true)
    .attr('x', (d) => 22)
    .attr('y', (d) => 0);
}
async function renderDoodles(commentsInTimeframe, div) {
  const storageRef = firebase.storage().ref();

  const doods = await storageRef.child('images/').listAll();

  const doodles = commentsInTimeframe.filter((f) => f.commentMark === 'doodle');

  const doodFromStorage = doodles.map(async (dood) => {
    const urlDood = await doods.items.filter((f) => f._delegate._location.path_ === `images/${dood.doodleName}`)[0].getDownloadURL();
    return urlDood;
  });

  const images = div.selectAll('.doodles').data(await Promise.all(doodFromStorage)).join('img').classed('doodles', true);
  images.attr('src', (d) => d);
}

export function videoUpdates(data, annoType) {
  const svgTest = d3.select('#interaction').select('svg');
  const svg = svgTest.empty() ? d3.select('#interaction').append('svg') : svgTest;

  const video = document.querySelector('video');

  const vidDim = video.getBoundingClientRect();

  const interDIV = d3.select('#interaction');

  d3.select('#show-doodle').select('input').on('click', (event, d) => {
    if (!event.target.checked) {
      d3.select('#interaction').selectAll('.doodles').remove();
    } else {
      const commentData = Object.entries(dataKeeper[dataKeeper.length - 1].comments).map((m) => m[1]).filter((f) => f.replies === 'null');

      const timeRange = [video.currentTime < 1.5 ? 0 : Math.floor(video.currentTime - 1.5), video.currentTime + 1.5];
      const commentsInTimeframe = commentData.filter((f, i) => {
        const time = JSON.parse(f.videoTime);
        if (time.length > 1) {
          return time[0] <= video.currentTime && time[1] >= video.currentTime;
        }
        return time <= timeRange[1] && time >= timeRange[0];
      });
      renderDoodles(commentsInTimeframe, interDIV);
    }
  });

  d3.select('#show-push').select('input').on('click', (event, d) => {
    if (!event.target.checked) {
      d3.select('#interaction').selectAll('.pushed').remove();
    } else {
      const commentData = Object.entries(dataKeeper[dataKeeper.length - 1].comments).map((m) => m[1]).filter((f) => f.replies === 'null');
      const timeRange = [video.currentTime < 1.5 ? 0 : Math.floor(video.currentTime - 1.5), video.currentTime + 1.5];
      const commentsInTimeframe = commentData.filter((f, i) => {
        const time = JSON.parse(f.videoTime);
        if (time.length > 1) {
          return time[0] <= video.currentTime && time[1] >= video.currentTime;
        }
        return time <= timeRange[1] && time >= timeRange[0];
      });

      const svgTest = d3.select('#interaction').select('svg');
      const svg = svgTest.empty() ? d3.select('#interaction').append('svg') : svgTest;

      renderPushpinMarks(commentsInTimeframe, svg);
    }
  });

  video.ontimeupdate = async (event) => {
    const timeRange = [video.currentTime < 1.5 ? 0 : Math.floor(video.currentTime - 1.5), video.currentTime + 1.5];

    highlightTimelineBars(timeRange);

    const filteredAnnotations = annotationData[annotationData.length - 1]
      .filter((f) => f.seconds[0] <= timeRange[0] && f.seconds[0] <= timeRange[1]) || (f.seconds[1] <= timeRange[1] && f.seconds[1] >= timeRange[0]);

    /**
     * UPDATE AND HIGHLGIHT ANNOTATION BAR
     */
    updateAnnotationSidebar(filteredAnnotations, null);
    highlightAnnotationbar(video.currentTime);

    /*
    COMMENT MANIPULATION HERE
   */

    highlightCommentBoxes(timeRange);

    const commentData = Object.entries(dataKeeper[dataKeeper.length - 1].comments).map((m) => m[1]).filter((f) => f.replies === 'null');

    const commentsInTimeframe = commentData.filter((f, i) => {
      const time = JSON.parse(f.videoTime);
      if (time.length > 1) {
        return time[0] <= video.currentTime && time[1] >= video.currentTime;
      }
      return time <= timeRange[1] && time >= timeRange[0];
    });

    if (d3.select('#show-doodle').select('input').node().checked) {
      renderDoodles(commentsInTimeframe, interDIV);
    }

    if (d3.select('#show-push').select('input').node().checked) {
      renderPushpinMarks(commentsInTimeframe, svg);
    }
  };
}
