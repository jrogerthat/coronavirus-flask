import * as d3 from 'd3';
import { clearBoard, clearRightSidebar, formatCommentBox, renderCommentDisplayStructure, updateCommentSidebar  } from './commentBar';
require("regenerator-runtime/runtime");
import firebase from 'firebase/app';
import { checkDatabase } from '../firebaseUtil';
import { dataKeeper } from '../dataManager';
import { clearCanvas } from './imageDataUtil';
import { updateAnnotationSidebar } from './annotationBar';
import { annotationData } from '..';
require('firebase/auth');
require('firebase/database');

export function toggleSort(event){
  
   if(event.target.checked){
      let sortedStructureData = annotationData[annotationData.length - 1].filter(f=> f.has_unkown === "TRUE").concat(annotationData[annotationData.length - 1].filter(f=> f.has_unkown === "FALSE"));
      updateAnnotationSidebar(annotationData[annotationData.length - 1], sortedStructureData, null);
      
      //let stackedData = structureData.filter(f=> f.has_unkown == "TRUE").concat(structureData.filter(f=> f.has_unkown == "FALSE"));

    //UNCOMMENT AFTER
    //   let nestReplies = formatCommentData(dataKeeper[dataKeeper.length -1], null);

    //   let test = nestReplies.filter((f)=> f.comment.includes('?'));

    //   let commentWrap = d3.select('#comment-wrap').select('.top');
    //   let genComWrap = d3.select('#comment-wrap').select('.general-comm-wrap');
    //   let selectedComWrap = d3.select('#comment-wrap').select('.selected-comm-wrap');
    //   clearRightSidebar();

    //   drawCommentBoxes(test, selectedComWrap);
    //   drawCommentBoxes(nestReplies, genComWrap);
   }else{
    updateAnnotationSidebar(annotationData[annotationData.length - 1], null, null);
   }
}



export function renderIssueButton(wrap){
    let bugLink = wrap.append('a');
    bugLink.attr('href', 'https://github.com/jrogerthat/coronavirus_flask/issues');
    bugLink.attr('target', "_blank");
    bugLink.append('span').classed("fas fa-bug", true);
}

export function renderUser(userData){
    let displayName = userData.displayName != null ? userData.displayName : userData.isAnonymous == false ? userData.email : "Guest";
    let div = d3.select('#top-bar').select('#user');
    div.selectAll('text.user_name').data([displayName]).join('text').classed('user_name', true).text(displayName);
    renderIssueButton(div);
}

export function addStructureLabelFromButton(structure){
    d3.select('#top-bar').select('.add-comment').select('button').text(`Add Comment for ${structure}`);
  }

export function goBackButton(){
    let button = d3.select('#top-bar').select('.add-comment').select('button')
    button.text('Go back');
    button.on('click', (event)=> {
        clearRightSidebar();
        renderCommentDisplayStructure();
        updateCommentSidebar(dataKeeper[dataKeeper.length - 1]);
        updateAnnotationSidebar(annotationData[annotationData.length - 1], null, null);
        addCommentButton();
        clearCanvas();
        d3.select('.tooltip').style('opacity', 0);
    });
}

export function addCommentButton(){
    let button = d3.select('#top-bar').select('.add-comment').select('button');
    button.text('Add Comment');
    button.on('click', (event)=>{
        clearRightSidebar();
        d3.select('#interaction').style('pointer-events', 'all');
        //MAYBE ADD THIS TO clear right sidebar function
        let wrap = d3.select('#right-sidebar').select('#comment-wrap');
        wrap.selectAll('*').remove();
        formatCommentBox(wrap);
        goBackButton();
    });
}

// export function addCommentButton(d, event){
   
//     if(event.target.value === 'off'){
//         event.target.value = 'on';
//         d3.select(event.target).text('Go back');
//         let sideWrap = d3.select('#right-sidebar').select('#comment-wrap');
//         // sideWrap.selectAll('*').remove();
//         clearRightSidebar();
//         d3.select('#interaction').style('pointer-events', 'all');
//         //formatTimeControl(sideWrap);
//          formatCommentBox(sideWrap);

//     }else{
//         clearBoard();
//         event.target.value = 'off';
//         d3.select(event.target).text('Add Comment');
//         d3.select('#right-sidebar').select('#comment-wrap').selectAll('*').remove();
//         d3.select('#interaction').style('pointer-events', 'all');
//         checkDatabase([updateCommentSidebar]);
//     }
// }