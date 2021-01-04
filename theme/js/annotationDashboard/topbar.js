import * as d3 from 'd3';
import {
  clearRightSidebar, formatToComment, renderCommentDisplayStructure, renderStructureKnowns, updateCommentSidebar,
} from './commentBar';
import {
  userLoggedIn, userLogin,
} from '../firebaseUtil';
import { dataKeeper } from '../dataManager';
import { clearCanvas, structureSelected, structureSelectedToggle } from './imageDataUtil';
import { updateAnnotationSidebar } from './annotationBar';
import { annotationData } from '..';

require('regenerator-runtime/runtime');
require('firebase/auth');
require('firebase/database');

export const showDoodle = false;
export const showPush = false;

export function toggleSort(event) {
  if (event.target.checked) {
    const sortedStructureData = annotationData[annotationData.length - 1].filter((f) => f.has_unkown === 'TRUE').concat(annotationData[annotationData.length - 1].filter((f) => f.has_unkown === 'FALSE'));
    updateAnnotationSidebar(annotationData[annotationData.length - 1], sortedStructureData, null);

  } else {
    updateAnnotationSidebar(annotationData[annotationData.length - 1], null, null);
  }
}

export function toggleSortRef(event) {
  if (event.target.checked) {
    const sortedStructureData = annotationData[annotationData.length - 1].filter((f) => f.ref != '' && f.ref != 'na').concat(annotationData[annotationData.length - 1].filter((f) => f.ref === '' && f.ref === 'na'));
    updateAnnotationSidebar(annotationData[annotationData.length - 1], sortedStructureData, null);

  } else {
    updateAnnotationSidebar(annotationData[annotationData.length - 1], null, null);
  }
}


export function renderIssueButton(wrap) {
  const bugLink = wrap.append('a');
  bugLink.attr('href', 'https://github.com/jrogerthat/coronavirus_flask/issues');
  bugLink.attr('target', '_blank');
  bugLink.append('span').classed('fas fa-bug', true);
}

export function renderUser(userData) {
  const displayName = userData.displayName != null ? userData.displayName : userData.isAnonymous == false ? userData.email : 'Guest';
  const div = d3.select('#top-bar').select('#user');
  div.selectAll('text.user_name').data([displayName]).join('text').classed('user_name', true)
    .text(`  ${displayName}`);
}

export function addStructureLabelFromButton(structure) {
  d3.select('#top-bar').select('.add-comment').select('button').text(`Add Comment for ${structure}`);
}

export function goBackButton() {
  const button = d3.select('#top-bar').select('.add-comment').select('button');
  button.text('Go back');
  button.on('click', (event) => {
    console.log('button clicked', structureSelected);
    if (structureSelected.structure != null && d3.select('#right-sidebar').select('.top').select('.found-info').empty()) {
      d3.select('#right-sidebar').select('.top').selectAll('*').remove();
      renderStructureKnowns(d3.select('#comment-wrap').select('.top'));
    } else {
      structureSelectedToggle(null);
      // clearRightSidebar();
      renderCommentDisplayStructure();
      updateCommentSidebar(dataKeeper[dataKeeper.length - 1]);
      updateAnnotationSidebar(annotationData[annotationData.length - 1], null, null);
      addCommentButton();
      clearCanvas();
      d3.select('.tooltip').style('opacity', 0);
    }
  });
}

export function addCommentButton() {
  const button = d3.select('#top-bar').select('.add-comment').select('button');

  if (userLoggedIn.loggedInBool === false) {
    button.text('Log in to comment');
    button.on('click', (event) => {
      clearRightSidebar();
      d3.select('#right-sidebar').select('#sign-in-wrap').append('div').attr('id', 'sign-in-container');
      userLogin();
    });
  } else {
    button.text('Add Comment');
    button.on('click', (event) => {
      clearRightSidebar();
      d3.select('#interaction').style('pointer-events', 'all');
      const wrap = d3.select('#right-sidebar').select('#comment-wrap');
      formatToComment(wrap, []);
      goBackButton();
    });
  }
}
