import firebase from 'firebase/app';
import { currentUser, dataKeeper } from './dataManager';
import { fbConfig } from '.';
import { updateCommentSidebar } from './annotationDashboard/commentBar';
import { renderTimeline } from './annotationDashboard/timeline';
import { addCommentButton } from './annotationDashboard/topbar';

require('firebase/auth');
require('firebase/database');
const firebaseui = require('firebaseui');

export const userLoggedIn = {
  loggedInBool: false,
  uid: null,
  displayName: null,
  admin: false,
  email: null,
};

function loginSuccess(user) {
  addUser(user);
}

export function userLogin() {
  if (!firebase.apps.length) {
    firebase.initializeApp(fbConfig[0]);
  }

  const ui = new firebaseui.auth.AuthUI(firebase.default.auth());

  ui.start('#sign-in-container', {
    callbacks: {
      signInSuccessWithAuthResult(authResult, redirectUrl) {
        const { user } = authResult;
        const { credential } = authResult;
        const { isNewUser } = authResult.additionalUserInfo;
        const { providerId } = authResult.additionalUserInfo;
        const { operationType } = authResult;

        // Do something with the returned AuthResult.
        // Return type determines whether we continue the redirect
        // automatically or whether we leave that to developer to handle.
        // return true;
        return loginSuccess(user);
      },

      signInFailure(error) {
        // Some unrecoverable error occurred during sign-in.
        // Return a promise when error handling is completed and FirebaseUI
        // will reset, clearing any UI. This commonly occurs for error code
        // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
        // occurs. Check below for more details on this.
        return handleUIError(error);
      },
      uiShown() {
        // The widget is rendered.
        // Hide the loader.
        // document.getElementById('loader').style.display = 'none';
      },
    },
    signInFlow: 'popup',
    // signInSuccessUrl:"{{url_for('dashboard.index', user=currentUser)}}",
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        clientId: '632575175956-49a1hie4ab4gr69vak5onr307fg67bb0.apps.googleusercontent.com',
      },
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
    ],
    // Other config options...
  });
}

export function addUser(user) {
  if (user != null) {
    userLoggedIn.uid = user.uid;
    userLoggedIn.displayName = user.displayName;
    userLoggedIn.email = user.email;
    userLoggedIn.loggedInBool = true;
    userLoggedIn.admin = false;
  } else {
    userLoggedIn.uid = null;
    userLoggedIn.displayName = null;
    userLoggedIn.email = null;
    userLoggedIn.loggedInBool = false;
    userLoggedIn.admin = false;
  }
}

export async function checkUser(callbackArray) {
  if (!firebase.apps.length) {
    firebase.initializeApp(fbConfig[0]);
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      currentUser.push(user);
      addUser(user);
      // console.log('userrrr', user)
      callbackArray.forEach((fun) => {
        fun(user);
      });
      checkDatabase([addCommentButton, updateCommentSidebar, renderTimeline]);
      // User is signed in.
    } else {
      console.log('NO USER', user);
      checkDatabase([addCommentButton, updateCommentSidebar, renderTimeline]);
      // No user is signed in.
    }
  });
  return currentUser;
}

export function checkDatabase(callbackArray) {
  const ref = firebase.database().ref();
  ref.on('value', (snapshot) => {
    // extraArgs != null ? callback(snapshot.val(), extraArgs) : callback(snapshot.val());
    dataKeeper.push({ ...snapshot.val() });

    // console.log('snapshooot',snapshot.val());

    callbackArray.forEach((fun) => {
      fun(snapshot.val());
    });
  }, (error) => {
    console.log(`Error: ${error.code}`);
  });
}
