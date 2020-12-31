import * as d3 from 'd3';
import { select } from 'd3';
import firebase from 'firebase/app';
import { currentUser, dataKeeper, formatVideoTime } from '../dataManager';
import { checkDatabase, userLoggedIn } from '../firebaseUtil';
import { colorDictionary, structureSelected, doodleKeeper } from './imageDataUtil';
import { commentClicked } from './video';

require('firebase/auth');
require('firebase/database');

export function clearRightSidebar() {
  d3.select('#comment-wrap').selectAll('*').remove();
}

export function updateCommentSidebar(dbRef) {
  console.log('updateCommentSidebar', userLoggedIn);
  const wrap = d3.select('#right-sidebar').select('#comment-wrap').select('.general-comm-wrap');
  // clearRightSidebar();
  // renderCommentDisplayStructure();

  const nestReplies = formatCommentData(dbRef);

  drawCommentBoxes(nestReplies, wrap);
}

function recurse(parent, replyArray, level) {
  parent.level = level;
  parent.replyBool = false;

  const replies = replyArray.filter((f) => f.replies.toString() === parent.key);

  if (replies.length > 0) {
    parent.replyKeeper = replies;
    const nextlevel = ++level;
    parent.replyKeeper.map((m) => recurse(m, replyArray, nextlevel));
    return parent;
  }
  parent.replyKeeper = [];
  return parent;
}

function replyInputBox(d, i, n, user) {
  
  const inputDiv = d3.select(n.parentNode.parentNode).select('.reply-space').append('div').classed('text-input-sidebar', true);
  inputDiv.append('text').text(`${userLoggedIn.displayName}:`);
  inputDiv.append('textarea').attr('id', 'text-area-id').attr('placeholder', 'Comment Here');
  const submit = inputDiv.append('button').text('Add').classed('btn btn-secondary', true);

  submit.on('click', (event) => {
    event.stopPropagation();// user, currentTime, mark, tag, coords, replyTo, quote
    console.log(userLoggedIn)
    const dataPush = formatComment2Send(userLoggedIn, d3.select('video').node().currentTime, 'none', 'none', null, d.key, null);
    const ref = firebase.database().ref('comments');
    d3.select(n.parentNode.parentNode).select('.reply-space').select('.text-input-sidebar').remove();
    ref.push(dataPush);
  });
}

export function formatCommentData(dbRef) {
  const dataAnno = Object.entries(dbRef.comments)
    .map((m) => {
      const value = m[1];
      value.key = m[0];
      return value;
    });

  const unresolved = dataAnno.filter((f) => f.resolved === false);

  const data = unresolved.filter((f) => f.replies === 'null').sort((a, b) => a.videoTime - b.videoTime);

  const replyData = unresolved.filter((f) => f.replies != 'null');

  const nestReplies = data.map((d, i, n) => recurse(d, replyData, 0));

  return nestReplies;

  // }else{

  //     let replyData = unresolved.filter(f=> (f.reply === true));
  //     let nestReplies = annotations.map((d, i, n)=>{
  //     return recurse(d, replyData, 0);
  //     });
  //     return nestReplies;
  // }
}

export function highlightCommentBoxes(timeRange) {
  const memoDivs = d3.select('#right-sidebar').select('#comment-wrap').selectAll('.memo');
  memoDivs.classed('selected', false);
  const selectedMemoDivs = memoDivs.filter((f) => f.videoTime <= timeRange[1] && f.videoTime >= timeRange[0]).classed('selected', true);
  if (!selectedMemoDivs.empty()) {
    // selectedMemoDivs.nodes()[0].scrollIntoView({behavior: "smooth"});
    selectedMemoDivs.nodes()[0].scrollIntoView();
  }
}

function updateTags(node, tagWrap, tagArray) {
  tagArray.push(node.value);

  const tags = tagWrap.selectAll('span.badge').data(tagArray).join('span').classed('badge badge-secondary', true);
  tags.text((d) => `${d}  `);
  const x = tags.append('text').text('X');
  x.style('padding', '5px');
  x.style('cursor', 'pointer');
  x.on('click', (event, d) => {
    d3.select(event.target.parentNode).remove();
    tagArray = tagArray.filter((f) => f != d);
  });

  node.value = '';
}

function upvoteIcon(div, db) {
  // UPVOTE
  const upVote = div.selectAll('.upvote-span').data((d) => [d]).join('span').classed('upvote-span', true);
  upVote.selectAll('.upvote').data((d) => [d]).join('i').classed('upvote fas fa-thumbs-up fa-sm', true);
  upVote.selectAll('.up-text').data((d) => [d]).join('text').classed('up-text', true)
    .text((d) => `: ${d.upvote} `);

  upVote.on('click', (event, d) => {
    const newUp = ++d.upvote;
    db.ref(`comments/${d.key}/upvote`).set(`${newUp}`);
  });
}

function downvoteIcon(div, db) {
  // DOWNVOTE
  const downvote = div.selectAll('.downvote-span').data((d) => [d]).join('span').classed('downvote-span', true);
  downvote.selectAll('.downvote').data((d) => [d]).join('i').classed('downvote fas fa-thumbs-down fa-sm', true);
  downvote.selectAll('.down-text').data((d) => [d]).join('text').classed('down-text', true)
    .text((d) => `: ${d.downvote}`);

  downvote.on('click', (event, d) => {
    const newDown = ++d.downvote;
    db.ref(`comments/${d.key}/downvote`).set(`${newDown}`);
  });
}

export function drawCommentBoxes(nestedData, wrap) {
 
  const testWrap = wrap.empty() ? d3.select('#right-sidebar').append('div') : wrap;
  const db = firebase.database();

  const memoDivs = wrap.selectAll('.memo').data(nestedData).join('div').classed('memo', true);
  memoDivs.selectAll('.name').data((d) => [d]).join('span').classed('name', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => `${d.displayName}:`);
  memoDivs.selectAll('.time').data((d) => [d]).join('span').classed('time', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => formatVideoTime(d.videoTime));

  const tags = memoDivs.selectAll('.tag-span').data((d) => [d]).join('span').classed('tag-span', true);
  tags.selectAll('.badge').data((d) => d.tags.split(',').filter((f) => f != 'none')).join('span').classed('badge badge-secondary', true)
    .text((d) => d);

  const typeOf = memoDivs.selectAll('i.fas').data((d) => [d]).join('i').attr('class', (d) => {
    if (d.commentMark === 'push') {
      return 'fas fa-map-marker-alt';
    } 
    if (d.commentMark === 'doodle') {
      return 'fas fa-paint-brush';
    }
    return 'hidden';
  });

  memoDivs.selectAll('.comment').data((d) => [d]).join('span').classed('comment', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => d.comment);

  memoDivs.selectAll('.post-time').data((d) => [d]).join('span').classed('post-time', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => {
      const test = new Date(d.postTime);
      return `on ${test.toUTCString()}`;
    });

  memoDivs.style('border', (d) => '1px solid gray');

  upvoteIcon(memoDivs, db);

  downvoteIcon(memoDivs, db);

  if (userLoggedIn.loggedInBool) {
    // RESOLVE
    const resolve = memoDivs.filter((f) => f.uid === currentUser[currentUser.length - 1].uid).selectAll('.resolve-span').data((d) => [d]).join('span')
      .classed('resolve-span', true)
      .text('Resolve ');
    resolve.selectAll('.resolve').data((d) => [d]).join('i').classed('resolve', true)
      .classed('resolve fas fa-check', true);
    resolve.on('click', (d) => {
      db.ref(`comments/${d.key}/resolved`).set('true');
    });
    // REPLY
    const reply = memoDivs.selectAll('.reply-span').data((d) => [d]).join('span').classed('reply-span', true)
      .text('Reply ');
    reply.selectAll('.reply').data((d) => [d]).join('i').classed('far fa-comment-dots fa-lg reply', true);// .style('float', 'right')//.text('Reply');

    reply.on('click', function (event, d) {
      event.stopPropagation();
      const e = reply.nodes();
      const i = e.indexOf(this);

      if (d.replyBool === false) {
        d.replyBool = true;

        replyInputBox(d, i, event.target, user);

      } else {
        d.replyBool = false;
        d3.select(event.target.parentNode.parentNode).select('.reply-space').select('.text-input-sidebar').remove();
      }
    });
  }

  memoDivs.selectAll('div.reply-space').data(d=> [d]).join('div').classed('reply-space', true);

  memoDivs.on('click', (event, d) => {
    if (event.target.tagName.toLowerCase() === 'textarea'
          || event.target.tagName.toLowerCase() === 'button'
          || event.target.tagName.toLowerCase() === 'a'
          || event.target.tagName.toLowerCase() === 'svg') {
      console.log('not clicked on div');
    } else {
      commentClicked(event, d);
    }
  });

  memoDivs.each((d, i, n) => {
    if (d.replyKeeper.length > 0) {
      recurseDraw(d3.select(n[i]));
    }
  });

  const questionMemos = memoDivs.filter((f) => f.comment.includes('?'));
  questionMemos.classed('question', true);
  const qs = questionMemos.selectAll('div.question').data((d) => [d]).join('div').classed('question', true);
  qs.selectAll('i.fas.question').data((d) => [d]).join('i').classed('fas question fa-exclamation-circle', true);
}

export function recurseDraw(selectDiv) {
  const replyDivs = selectDiv.selectAll('.reply-memo').data((d) => d.replyKeeper).join('div').classed('reply-memo', true);
  replyDivs.style('margin-left', (d) => `${d.level * 10}px`);

  replyDivs.each((d, i, n) => {
    replyRender(d3.select(n[i]));
    if (d.replyKeeper.length > 0) {
      recurseDraw(d3.select(n[i]));
    }
  });
}

export const tagOptions = [
  { key: 'question', color: '#2E86C1' },
  { key: 'suggestion', color: '#2ECC71' },
  { key: 'issue', color: '#F1C40F' },
  { key: 'context', color: '#F10F42' },
  { key: 'other', color: 'black' },
];

export function renderStructureKnowns(topCommentWrap) {
  const questions = structureSelected.annotations.filter((f) => f.has_unkown === 'TRUE').length + structureSelected.comments.filter((f) => f.comment.includes('?')).length;
  const refs = structureSelected.annotations.filter((f) => f.url != '').length + structureSelected.comments.filter((f) => f.comment.includes('http')).length;

  topCommentWrap.append('div').classed('found-info', true)
    .html(`<h4>${structureSelected.structure}</h4>
    <span class="badge badge-pill badge-info"><h7>${structureSelected.annotations.length}</h7></span> annotations for this structure. <br>
    <span class="badge badge-pill badge-danger">${questions}</span> Questions. <br>
    <span class="badge badge-pill badge-warning">${refs}</span> Refs. <br>
    <br>
    `);

  const infoButton = topCommentWrap.append('button').classed('btn btn-outline-secondary add-comment-structure', true);
  if (userLoggedIn.loggedInBool) {
    infoButton.text('Add comment for this structure')
      .on('click', (event, d) => {
        topCommentWrap.selectAll('*').remove();
        const structArray = [structureSelected.structure.toString()];
        formatToComment(topCommentWrap, structArray);
      });
  } else {
    infoButton.text('Log in to comment on this')
      .on('click', (event, d) => {
        topCommentWrap.selectAll('*').remove();
        const structArray = [structureSelected.structure.toString()];
        formatToComment(topCommentWrap, structArray);
      });
  }
}

export function defaultTemplate(div, tagArray) {
  const { currentTime } = document.getElementById('video');

  const inputDiv = div.select('.template-wrap');// .append('div');//.classed('text-input', true);
  // inputDiv.append('text').text(`${user.displayName}@ ${formatVideoTime(currentTime)} :`);

  const templatehtml = `
    <br>
    <p>Add a comment here - comments can be suggestions for the tool, critiques of the animation, questions on biology, etc.</p>
    <p>Please include as any tags that describe the comment you are making</p> 
    `;

  inputDiv.append('div').classed('temp-text', true).html(templatehtml);

  inputDiv.append('textarea').attr('id', 'text-area-id').attr('placeholder', 'Comment Here');

  addTagFunctionality(inputDiv, tagArray);
}

export function addTagFunctionality(inputDiv, tagArray) {
  const inputWrap = inputDiv.append('div').classed('tag-input-wrap', true);

  const tagWrap = inputWrap.append('div').classed('tag-wrap', true);

  const tags = tagWrap.selectAll('span.badge').data(tagArray).join('span').classed('badge badge-secondary', true);
  if (tagArray.length > 0) {
    tags.text((d) => `${d}  `);
    const x = tags.append('text').text('X');
    x.style('padding', '5px');
    x.style('cursor', 'pointer');
    x.on('click', (event, d) => {
      d3.select(event.target.parentNode).remove();
      tagArray = tagArray.filter((f) => f != d);
    });
  }

  const tagText = inputWrap.append('input').attr('id', 'tag-input');
  tagText.classed('form-control', true);
  tagText.node().type = 'text';
  tagText.node()['aria-label'] = 'tag add';
  tagText.node().placeholder = 'Type to add tag...';

  const node = document.getElementById('tag-input');
  node.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      if (node.value != '') {
        updateTags(node, tagWrap, tagArray);
      } else {
        console.log('nothing to add');
      }
    }
  });

  const array = ({ ...dataKeeper[dataKeeper.length - 1] }).comments;
  const test = Object.entries(array).map((m) => m[1]).flatMap((m) => m.tags.split(','));

  autocomplete(node, Array.from(new Set(test)));
}

export function radioBlob(div, t1Ob, t2Ob, t3Ob, className) {
  const form = div.append('form').classed(className, true);
  const labelOne = form.append('label').classed('container', true);
  labelOne.text(t1Ob.label);
  labelOne.node().for = 't1';

  const inputOne = labelOne.append('input').attr('id', 't1');
  inputOne.node().name = 'radio';
  inputOne.node().type = 'radio';
  inputOne.node().checked = true;

  const inputCheck1 = labelOne.append('span').classed('checkmark', true);
  form.node().value = 't1';

  const labelTwo = form.append('label').classed('container', true).text(t2Ob.label);
  labelTwo.node().for = 't2';

  const inputTwo = labelTwo.append('input').attr('id', 't2');
  inputTwo.node().name = 'radio';
  inputTwo.node().type = 'radio';
  inputTwo.node().checked = false;

  const inputCheck2 = labelTwo.append('span').classed('checkmark', true);

  const labelThree = form.append('label').classed('container', true).text(t3Ob.label);
  labelThree.node().for = 't3';

  const inputThree = labelThree.append('input').attr('id', 't3');
  inputThree.node().name = 'radio';// .attr('name', 'comment')
  inputThree.node().type = 'radio';// .attr('type', 'radio');
  inputThree.node().checked = false;

  const inputCheck3 = labelThree.append('span').classed('checkmark', true);

  inputOne.on('click', (event) => {
    inputOne.node().checked = true;
    inputTwo.node().checked = false;
    form.node().value = 't1';
    t1Ob.callBack();
  });

  inputTwo.on('click', (event) => {
    inputOne.node().checked = false;
    inputTwo.node().checked = true;
    form.node().value = 't2';
    t2Ob.callBack();
    // }
  });

  inputThree.on('click', (event) => {
    inputOne.node().checked = false;
    inputTwo.node().checked = false;
    inputThree.node().checked = true;
    form.node().value = 't3';
    t3Ob.callBack();
    // }
  });

  return form;
}

export function doodleSubmit(commentType, user, tags, currentTime) {
  const storage = firebase.storage();
  const storageRef = storage.ref();

  const message = doodleKeeper[doodleKeeper.length - 1].data;

  const imagesRef = storageRef.child(`images/im-${user.uid}-${doodleKeeper[doodleKeeper.length - 1].index}.png`);

  imagesRef.putString(message, 'data_url').then((snapshot) => {
    const coords = !d3.select('#push-div').empty() ? [d3.select('#push-div').style('left'), d3.select('#push-div').style('top')] : null;

    const dataPush = formatComment2Send(user, currentTime, 'doodle', tags.data().toString(), coords, null, null);
    dataPush.doodle = true;
    dataPush.doodleName = snapshot.metadata.name;

    const refCom = firebase.database().ref(commentType);

    refCom.push(dataPush);

    checkDatabase([updateCommentSidebar]);
  });
}

export function clearBoard() {
  const canvas = d3.select('canvas').node();
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  const interactionDiv = d3.select('#interaction');
  interactionDiv.selectAll('*').remove();
}

export function formatDoodleCanvas() {
  const frame = 'video';
  const div = document.getElementById('main');

  clearBoard();

  // let interactionDiv = d3.select('#interaction');
  const interactionDiv = d3.select('#video-wrap').append('div').attr('id', 'add-mark');
  const video = document.getElementById('video');
  interactionDiv.node().style.width = `${Math.round(video.videoWidth)}px`;
  interactionDiv.node().style.height = `${video.videoHeight}px`;

  interactionDiv.on('mouseenter', (event) => {
    const coords = d3.pointer(event);

    if (d3.select('#push-div').empty() && d3.select('.media-tabber').node().value === 't3') {
      const pushDiv = interactionDiv.append('div').attr('id', 'push-div');
      pushDiv.style('position', 'absolute');
      pushDiv.style('top', (d) => `${coords[1]}px`);
      pushDiv.style('left', (d) => `${coords[0]}px`);
      const push = pushDiv.append('div').classed('push', true);
      push.append('i').classed('fas fa-paint-brush', true);
    }
  });

  const leftSpace = d3.select('#left-sidebar').node().getBoundingClientRect().width;

  interactionDiv.on('mousemove', (event) => {
    const coords = d3.pointer(event);
    const pushDiv = d3.select('#push-div');
    if (!pushDiv.empty()) {
      pushDiv.style('top', (d) => `${coords[1]}px`);
      pushDiv.style('left', (d) => `${coords[0]}px`);
    }
  });

  interactionDiv.on('mouseleave', () => {
    d3.select('#push-div').remove();
  });

  const canvas = d3.select(div).select('canvas').node();

  const context = canvas.getContext('2d');
  const videoDim = document.getElementById(frame).getBoundingClientRect();

  canvas.width = videoDim.width;
  canvas.height = videoDim.height;

  context.strokeStyle = 'red';
  context.lineWidth = 5;

  let oldX; let
    oldY;
  let draw = false;

  div.onmousedown = function (e) {
    const sideWidth = document.getElementById('right-sidebar').getBoundingClientRect();

    oldX = (e.pageX - (sideWidth.width + 11));
    oldY = (e.pageY - 40);

    draw = true;
  };
  div.onmousemove = function (e) {
    const sideWidth = document.getElementById('right-sidebar').getBoundingClientRect();

    // var mouseX = (e.pageX - sideWidth.width);
    const mouseX = (e.pageX - (sideWidth.width + 11));
    const mouseY = (e.pageY - 40);

    if (draw) {
      context.beginPath();
      context.moveTo(oldX, oldY);
      context.lineTo(mouseX, mouseY);
      context.stroke();
      context.closePath();
      oldX = mouseX;
      oldY = mouseY;
    }
  };
  div.onmouseup = async function (e) {
    draw = false;
    // shapeArray.push(context.save());

    const urlTest = canvas.toDataURL('image/png');

    const storage = firebase.storage();
    const storageRef = storage.ref();

    const message = urlTest;
    const listPromis = await Promise.resolve(storageRef.child('images/').listAll());

    doodleKeeper.push({ index: listPromis.items.length, data: message });
  };

  return div;
}

export function formatPush() {
  clearBoard();

  const interactionDiv = d3.select('#video-wrap').append('div').attr('id', 'add-mark');
  const video = document.getElementById('video');
  interactionDiv.node().style.width = `${Math.round(video.videoWidth)}px`;
  interactionDiv.node().style.height = `${video.videoHeight}px`;

  let clickedBool = false;

  if (d3.select('.media-tabber').node().value === 't2') {
    interactionDiv.on('mouseenter', (event) => {
      const coords = d3.pointer(event);

      if (d3.select('#push-div').empty()) {
        const dims = interactionDiv.node().getBoundingClientRect();

        const pushDiv = interactionDiv.append('div').attr('id', 'push-div');
        pushDiv.style('position', 'absolute');
        pushDiv.style('top', (d) => `${coords[1] - (dims.top - 50)}px`);
        pushDiv.style('left', (d) => `${coords[0]}px`);
        const push = pushDiv.append('div').classed('push', true);
        push.append('i').classed('fas fa-map-marker-alt fa-3x', true);
      }
    });

    interactionDiv.on('mousemove', (event) => {
      const dims = document.getElementById('video').getBoundingClientRect();
      const coords = d3.pointer(event);
      const pushDiv = d3.select('#push-div');
      if (!pushDiv.empty() && !clickedBool) {
        pushDiv.style('top', (d) => `${coords[1] - (dims.top - 50)}px`);
        pushDiv.style('left', (d) => `${coords[0] - 10}px`);
      }
    });

    interactionDiv.on('mouseleave', (event) => {
      if (!clickedBool) {
        d3.select('#push-div').remove();
      }
    });
  }

  interactionDiv.on('click', (event) => {
    event.stopPropagation();

    if (clickedBool === false && d3.select('.media-tabber').node().value === 't2') {
      const inputDiv = d3.select('#push-div').append('div').classed('comment-initiated', true);
      inputDiv.append('h6').text('Comment for this spot');
      inputDiv.style('margin-left', '15px');
      inputDiv.style('margin-top', '5px');
    } else {
      d3.select('#push-div').select('.comment-initiated').remove();
    }
    clickedBool === true ? clickedBool = false : clickedBool = true;
  });
}

export function noMarkFormat() {
  const canvas = d3.select('canvas').node();
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  const interactionDiv = d3.select('#interaction');
  interactionDiv.selectAll('*').remove();
}

export function renderCommentDisplayStructure() {
  const wrap = d3.select('#right-sidebar').select('#comment-wrap');
  wrap.select('.template-wrap').remove();
  const topTest = wrap.select('.top');
  const top = topTest.empty() ? wrap.append('div').classed('top', true) : topTest;
  const selTest = wrap.select('.selected-comm-wrap');
  const sel = selTest.empty() ? wrap.append('div').classed('selected-comm-wrap', true) : selTest;
  const genTest = wrap.select('.general-comm-wrap');
  const gen = genTest.empty() ? wrap.append('div').classed('general-comm-wrap', true) : genTest;
}

export function formatComment2Send(user, currentTime, mark, tag, coords, replyTo, quote) {
  console.log('user', user);
  return {
    uid: user.uid,
    displayName: user.displayName,

    videoTime: currentTime,
    postTime: new Date().toString(),

    comment: d3.select('#text-area-id').node().value,
    commentMark: mark,
    tags: tag === '' ? 'none' : tag,

    posTop: coords != null ? coords[1] : null,
    posLeft: coords != null ? coords[0] : null,

    upvote: 0,
    downvote: 0,

    replies: replyTo === null ? 'null' : replyTo,
    quotes: quote === null ? 'null' : quote,
    resolved: false,
  };
}

export function formatToComment(div, startingTags) {
  const templateWrap = div.append('div').classed('template-wrap', true);

  defaultTemplate(div, startingTags);

  const t1Ob = { label: 'No spatial reference', callBack: noMarkFormat };
  const t2Ob = { label: 'Mark a Point', callBack: formatPush };
  const t3Ob = { label: 'Draw', callBack: formatDoodleCanvas };

  const form = radioBlob(div, t1Ob, t2Ob, t3Ob, 'media-tabber');
  noMarkFormat();

  const submit = div.append('button').attr('id', 'comment-submit-button').text('Add').classed('btn btn-secondary', true);
  const commentType = 'comments';

  submit.on('click', async (event) => {
    console.log('clicked', event)
    const user = currentUser[currentUser.length - 1];

    const context = canvas.getContext('2d');
    const videoDim = document.getElementById('video').getBoundingClientRect();

    event.stopPropagation();

    if (d3.select('#text-area-id').node().value != '') {
      const tags = d3.select('.tag-wrap').selectAll('.badge');
      const { currentTime } = document.getElementById('video');

      if (form.node().value === 't2') {
        const vidWidth = +d3.select('#push-div').style('left').split('px')[0] / +d3.select('video').node().getBoundingClientRect().width;
        const vidHeight = +d3.select('#push-div').style('top').split('px')[0] / +d3.select('video').node().getBoundingClientRect().height;

        const coords = !d3.select('#push-div').empty() ? [vidWidth, vidHeight] : null;
        const dataPush = formatComment2Send(user, currentTime, 'push', tags.data().toString(), coords, null, null);
        const refCom = firebase.database().ref(commentType);
        refCom.push(dataPush);
        checkDatabase([updateCommentSidebar]);
        d3.select('#add-mark').remove();
      } else if (form.node().value === 't3') {
        doodleSubmit(commentType, user, tags, currentTime);
        d3.select('#add-mark').remove();

        const canvas = d3.select('canvas').node();
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        const coords = null; // user, currentTime, mark, tag, coords, replyTo, quote
        const dataPush = formatComment2Send(user, currentTime, 'none', tags.data().toString(), coords, null, null);
        const refCom = firebase.database().ref(commentType);
        refCom.push(dataPush);
        checkDatabase([updateCommentSidebar]);
        d3.select('#add-mark').remove();
      }

      d3.select('.add-comment').select('button').text('Add Comment');
    } else {
      window.alert('Please add a comment first');
    }
  });
}

export function formatTimeControl(div) {
  const timeWrap = div.append('div').attr('id', 'time-wrap');
  const controlDiv = timeWrap.append('div').attr('id', 'control');
  const svg = controlDiv.append('svg');

  const playR = svg.append('g').attr('id', 'play-r');
  playR.node().viewBox = '0 0 24 24';
  playR.append('path').attr('d', 'M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z');

  const pauseR = svg.append('g').attr('id', 'pause-r').classed('hidden', true);
  pauseR.node().viewBox = '0 0 24 24';
  pauseR.append('path').attr('d', 'M14.016 5.016h3.984v13.969h-3.984v-13.969zM6 18.984v-13.969h3.984v13.969h-3.984z');

  const timeUpdate = timeWrap.append('div').attr('id', 'time-update');
  timeUpdate.append('text').text('00:00');

  updatePlayButton();

}

function replyRender(replyDivs) {
  const db = firebase.database();

  console.log('reply',replyDivs)

  replyDivs.selectAll('.name').data((d) => [d]).join('span').classed('name', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => `${d.displayName} replied:`);
  replyDivs.selectAll('.comment').data((d) => [d]).join('span').classed('comment', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => d.comment);
  replyDivs.selectAll('.post-time').data((d) => [d]).join('span').classed('post-time', true)
    .selectAll('text')
    .data((d) => [d])
    .join('text')
    .text((d) => {
      const test = new Date(d.postTime);
      return `on ${test.toUTCString()}`;
    });

  upvoteIcon(replyDivs, db);
  downvoteIcon(replyDivs, db);

  if (userLoggedIn.loggedInBool) {
    const reply = replyDivs.selectAll('.reply-span').data((d) => [d]).join('span').classed('reply-span', true)
      .text('Reply ');

    replyDivs.selectAll('div.reply-space').data(d => [d]).join('div').classed('reply-space', true);
    reply.selectAll('.reply').data((d) => [d]).join('i').classed('far fa-comment-dots reply', true)
      .style('float', 'right');

    const resolve = replyDivs.selectAll('.resolve-span').data((d) => [d]).join('span').classed('resolve-span', true)
      .text('Resolve ');
    resolve.selectAll('.resolve').data((d) => [d]).join('i').classed('resolve', true)
      .classed('resolve fas fa-check', true);// .text(d=> `${d.displayName}:`);

    resolve.on('click', (event, d) => {
      db.ref(`comments/${d.key}/resolved`).set('true');
    });

    reply.on('click', function (event, d) {
      event.stopPropagation();

      const e = reply.nodes();
      const i = e.indexOf(this);

      console.log('d in reply', d);

      if (!d.replyBool) {
        d.replyBool = true;
        replyInputBox(d, i, event.target, user);

  
      } else {
        d.replyBool = false;
        d3.select(event.target.parentNode.parentNode).select('.reply-space').select('.text-input-sidebar').remove();
      }
    });
  }
}

export function renderNav(div, nav) {
  const buttons = d3.select(div).selectAll('button').data(nav).join('button');
  buttons.text((d) => d.key);
  buttons.classed('btn btn-secondary', true);
  buttons.attr('id', (d) => `button-${d.key}`);
  buttons.on('click', (event, d) => {
    if (d.key === 'draw') {
      if (d.selectedBool === false) {
        d.selectedBool = true;
        document.getElementById('video').setAttribute('pointer-events', 'none');
        d.callback();
      } else {
        d.selectedBool = false;

        d.callback();
      }
    } else {
      d.callback();
    }
  });
}

export function toggleMagic() {
  d3.select('.togg-wrap').selectAll('input')
    .on('click', (event, d) => {
      if (event.target.value === 'draw') {
        formatDoodleCanvas();
      } else {
        // annotateCircle();
        formatPush();
      }
    });
}

function autocomplete(inp, arr) {
  /* the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values: */
  let currentFocus;
  /* execute a function when someone writes in the text field: */
  inp.addEventListener('input', function (e) {
    let a; let b; let i; const
      val = this.value;
    /* close any already open lists of autocompleted values */
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    /* create a DIV element that will contain the items (values): */
    a = document.createElement('DIV');
    a.setAttribute('id', `${this.id}autocomplete-list`);
    a.setAttribute('class', 'autocomplete-items');
    /* append the DIV element as a child of the autocomplete container: */
    this.parentNode.appendChild(a);
    /* for each item in the array... */
    for (i = 0; i < arr.length; i++) {
      /* check if the item starts with the same letters as the text field value: */
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /* create a DIV element for each matching element: */
        b = document.createElement('DIV');

        /* make the matching letters bold: */
        b.innerHTML = `<strong>${arr[i].substr(0, val.length)}</strong>`;
        b.innerHTML += arr[i].substr(val.length);
        /* insert a input field that will hold the current array item's value: */
        b.innerHTML += `<input type='hidden' value='${arr[i]}'>`;
        /* execute a function when someone clicks on the item value (DIV element): */
        b.addEventListener('click', function (e) {
          /* insert the value for the autocomplete text field: */
          inp.value = this.getElementsByTagName('input')[0].value;
          /* close the list of autocompleted values,
                  (or any other open lists of autocompleted values: */
          closeAllLists();
        });
        a.appendChild(b);

        d3.select(b).on('click', () => {
          updateTags(d3.select('#tag-input').node(), d3.select('.tag-wrap'), d3.select('.tag-wrap').selectAll('span').data());
        });
      }
    }
  });
  /* execute a function presses a key on the keyboard: */
  inp.addEventListener('keydown', function (e) {
    let x = document.getElementById(`${this.id}autocomplete-list`);

    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode == 40) {
      /* If the arrow DOWN key is pressed,
          increase the currentFocus variable: */
      currentFocus++;
      /* and and make the current item more visible: */
      addActive(x);
    } else if (e.keyCode == 38) { // up
      /* If the arrow UP key is pressed,
          decrease the currentFocus variable: */
      currentFocus--;
      /* and and make the current item more visible: */
      addActive(x);
    } else if (e.keyCode == 13) {
      /* If the ENTER key is pressed, prevent the form from being submitted, */
      e.preventDefault();
      if (currentFocus > -1) {
        /* and simulate a click on the "active" item: */
        if (x) {
          x[currentFocus].click();
        }
      }
    }
  });
  function addActive(x) {
    ``;
    /* a function to classify an item as "active": */
    if (!x) return false;
    /* start by removing the "active" class on all items: */
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /* add class "autocomplete-active": */
    x[currentFocus].classList.add('autocomplete-active');
  }
  function removeActive(x) {
    /* a function to remove the "active" class from all autocomplete items: */
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }
  function closeAllLists(elmnt) {
    /* close all autocomplete lists in the document,
      except the one passed as an argument: */
    const x = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /* execute a function when someone clicks in the document: */
  document.addEventListener('click', (e) => {
    closeAllLists(e.target);
  });
}
