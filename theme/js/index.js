import firebase from 'firebase/app';
const { renderUser, addCommentButton, toggleSort } = require("./annotationDashboard/topbar");
const { dataKeeper, currentUser, formatAnnotationTime } = require("./dataManager");
const { checkUser, pullDataFromDatabase } = require("./firebaseUtil");
import "core-js/stable";
import "regenerator-runtime/runtime";
import * as d3 from 'd3';
import { formatVidPlayer, videoUpdates } from './annotationDashboard/video';
import { updateAnnotationSidebar } from './annotationDashboard/annotationBar';

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { renderTimeline } from './annotationDashboard/timeline';

library.add(faCheck, fas, far, fab) 
dom.i2svg() 
dom.watch();

export const fbConfig = [];
export const annotationData = [];

init();

async function init(){

    let config = await d3.json("../static/assets/firebase_data.json");
    fbConfig.push(config[0]);
    let anno = formatAnnotationTime(await d3.csv('../static/assets/annotation_2.csv')).map((m, i)=> {
        m.index = i;
        return m;
    });
    annotationData.push(anno);

    if (!firebase.apps.length) { firebase.initializeApp(fbConfig[0]);}

    checkUser([renderUser]);
    updateAnnotationSidebar(anno, null, null);
    formatVidPlayer(true);
    videoUpdates();

          // // create a tooltip
    var tooltipTest = d3.select('#main').select('div.tooltip');
    var tooltip = tooltipTest.empty() ? d3.select('#main').append('div').classed('tooltip', true): tooltipTest;
    
    tooltip.style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    addCommentButton();
    d3.select('#sort-by').select('input').on('click', (event)=> toggleSort(event));

}







