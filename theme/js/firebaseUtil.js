import firebase from 'firebase/app';
require('firebase/auth');
require('firebase/database');
import { currentUser, dataKeeper } from './dataManager';
import { fbConfig } from '.';
import { updateCommentSidebar } from './annotationDashboard/commentBar';


export async function checkUser(callbackArray){

  if (!firebase.apps.length) { 
    firebase.initializeApp(fbConfig[0]);
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      currentUser.push(user);
      callbackArray.forEach(fun=> {
        fun(user);
      });
      checkDatabase([updateCommentSidebar])
          // User is signed in.
    } else {
      console.log("NO USER", user);
          // No user is signed in.
    }
    
  });
  return currentUser;
}

export function checkDatabase(callbackArray){
  let ref = firebase.database().ref(); 
  ref.on("value", function(snapshot) {

      //extraArgs != null ? callback(snapshot.val(), extraArgs) : callback(snapshot.val());
      dataKeeper.push(snapshot.val());

      console.log('snapshooot',snapshot.val());

      callbackArray.forEach(fun=> {
        fun(snapshot.val());
      });
      
  }, function (error) {
      console.log("Error: " + error.code);
  });

}