import firebase from 'firebase/app';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as d3 from 'd3';

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { updateAnnotationSidebar } from './annotationDashboard/annotationBar';
import { formatVidPlayer, videoUpdates } from './annotationDashboard/video';
import { updateCommentSidebar } from './annotationDashboard/commentBar';
import { renderTimeline } from './annotationDashboard/timeline';

const {
  renderUser, addCommentButton, toggleSort, renderIssueButton,
} = require('./annotationDashboard/topbar');
const { formatAnnotationTime } = require('./dataManager');
const { checkUser } = require('./firebaseUtil');

library.add(faCheck, fas, far, fab);
dom.i2svg();
dom.watch();

export const fbConfig = [];
export const annotationData = [];

init();

async function init() {
  const config = await d3.json('../static/assets/firebase_data.json');
  fbConfig.push(config[0]);
  const anno = formatAnnotationTime(await d3.csv('../static/assets/annotation_2.csv')).map((m, i) => {
    m.index = i;
    return m;
  });
  annotationData.push(anno);

  if (!firebase.apps.length) { firebase.initializeApp(fbConfig[0]); }

  checkUser([renderUser], [addCommentButton, updateCommentSidebar, renderTimeline]);
  renderIssueButton(d3.select('#top-bar').select('#user'));
  updateAnnotationSidebar(anno, null, null);
  formatVidPlayer(true);
  videoUpdates();

  // // create a tooltip
  const tooltipTest = d3.select('#main').select('div.tooltip');
  const tooltip = tooltipTest.empty() ? d3.select('#main').append('div').classed('tooltip', true) : tooltipTest;

  tooltip.style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '2px')
    .style('border-radius', '5px')
    .style('padding', '5px');

  d3.select('#sort-by').select('input').on('click', (event) => toggleSort(event));
}
