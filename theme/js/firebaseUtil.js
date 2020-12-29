import firebase from 'firebase/app';
require('firebase/auth');
require('firebase/database');
import { currentUser, dataKeeper } from './dataManager';
import { fbConfig } from '.';
import { updateCommentSidebar } from './annotationDashboard/commentBar';
import { renderTimeline } from './annotationDashboard/timeline';

export const userLoggedIn = {
  loggedInBool : false,
  uid : null,
  displayName : null,
  admin : false,
  email : null
}

export function addUser(user){
  if(user != null){
    userLoggedIn.uid = user.uid;
    userLoggedIn.displayName = user.displayName;
    userLoggedIn.email = user.email;
    userLoggedIn.loggedInBool = true;
    userLoggedIn.admin = false;
  }else{
    userLoggedIn.uid = null;
    userLoggedIn.displayName = null;
    userLoggedIn.email = null;
    userLoggedIn.loggedInBool = false;
    userLoggedIn.admin = false;
  }
}

export async function checkUser(callbackArray){

  if (!firebase.apps.length) { 
    firebase.initializeApp(fbConfig[0]);
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser.push(user);
      console.log('userrrr', user)
      callbackArray.forEach(fun=> {
        fun(user);
      });
      checkDatabase([updateCommentSidebar, renderTimeline])
          // User is signed in.
    } else {
      console.log("NO USER", user);
      checkDatabase([updateCommentSidebar, renderTimeline])
          // No user is signed in.
    }
    
  });
  return currentUser;
}

export function checkDatabase(callbackArray){
  let ref = firebase.database().ref(); 
  ref.on("value", function(snapshot) {

      //extraArgs != null ? callback(snapshot.val(), extraArgs) : callback(snapshot.val());
      dataKeeper.push(Object.assign({}, snapshot.val()));

      console.log('snapshooot',snapshot.val());

      callbackArray.forEach(fun=> {
        fun(snapshot.val());
      });
      
  }, function (error) {
      console.log("Error: " + error.code);
  });

}