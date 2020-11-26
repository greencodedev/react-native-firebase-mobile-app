import { Platform, Alert } from "react-native";
import * as Google from 'expo-google-app-auth';
// import * as Google from 'expo-google-sign-in';
import * as Facebook from 'expo-facebook';
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

// import * as GoogleSignIn from 'expo-google-sign-in';
// import { AppAuth } from 'expo-app-auth';

// const { URLSchemes } = AppAuth;

import { userStore } from "@stores";
import { engine } from "./index";

const androidClientId =
  "338959907607-9v4ndfi2dltgds75r7rstbada0id36gl.apps.googleusercontent.com";
const androidStandaloneAppClientId = 
  "1043312187899-7e6uptjgvebjrvk705c5f3v59oa99c8n.apps.googleusercontent.com";  /// Google Auth0 client ID
const iosClientId =
  "338959907607-jka7tup3uciqehtju34k7vummbarijle.apps.googleusercontent.com";
const iosStandaloneAppClientId = 
  "1043312187899-6kfp2cg70da5427slbrqclc0i75i149r.apps.googleusercontent.com";

const config = {
  iosClientId: iosClientId,
  androidClientId: androidClientId,
  iosStandaloneAppClientId: iosStandaloneAppClientId,
  androidStandaloneAppClientId: androidStandaloneAppClientId,
};

const facebookAppId = "678787762557509";
                       
export function isUserLoggedIn() {
  return engine.isUserLoggedIn();
}

export async function loginWithGoogle(onSuccess, onFailure, status) {
  // try {    
  //   const clientID = Platform.select({
  //     ios: () => {return iosStandaloneAppClientId},
  //     android: () => {return androidStandaloneAppClientId},
  //   })();
  //   Google.initAsync({ clientId: clientID });
  // } catch (e) {
  //   alert('GoogleSignIn.initAsync(): ' + e.message);
  // }
  
  try {
    // await Google.askForPlayServicesAsync();
  
    const {accessToken, idToken, user, type} = await Google.logInAsync(config);
    if (type === "success") {
      await engine.loginWithGoogle(
        user,
        idToken,
        accessToken,
        onSuccess,
        onFailure,
        status
      );
      // userStore.setGoogleAccessToken(user.auth.accessToken);
      userStore.setUserId(getUser().uid);
    } else {
      onFailure({ cancelled: true });
    }
  } catch (e) {
    onFailure({ error: e.message });
  }
  // await engine.loginWithGoogle();
}

export async function logout(onSuccess, onFailure) {
  try {
    await engine.logout();
    userStore.clear();
    onSuccess();
  } catch (e) {
    onFailure({ error: e.message });
  }
}

export async function loginWithApple(onSuccess, onFailure, status) {
  try {
    const csrf = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256, '');
    const {authorizationCode, identityToken, realUserStatus, user } = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ],
    });

    if(realUserStatus === 1 && user) {
      await engine.loginWithApple(authorizationCode, identityToken, nonce, onSuccess, onFailure, status);
      userStore.setUserId(getUser().uid);
    }else {
      onFailure({cancelled: true});
    }
  }catch(e) {
    onFailure({error: e.message});
  }
}

export async function loginWithFacebook(onSuccess, onFailure, status) {
  try {
    await Facebook.initializeAsync(facebookAppId);
    const { type, token } = await Facebook.logInWithReadPermissionsAsync(
      facebookAppId,
      { permissions: ["public_profile", "email"] }
    );
    if (__DEV__) {
      // TODO: { type, token} can be read from .expo/config.js
    }

    if (type === "success") {
      await engine.loginWithFacebook(token, onSuccess, onFailure, status);
      const user = engine.getUser();
      // userStore.setFacebookAccessToken(token);
      userStore.setUserId(getUser().uid);
    } else {
      onFailure({ cancelled: true });
    }
  } catch (e) {
    onFailure({ error: e.message });
  }
}

// TODO: Should be managed with userStore
export function getUser() {
  return userStore.user;
}

export async function updateUserProfile(vcard) {
  return engine.updateUserProfile(vcard);
}

export async function hasProfile(uid) {
  return engine.hasProfile(uid);
}

export async function uploadUserProfileImage(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  let metadata = {
    contentType: "image/jpeg"
  };
  return engine.uploadUserProfileImage(blob, metadata);
}

export async function followUser(uid) {
  return engine.followUser(uid);
}

export async function unFollowUser(uid) {
  return engine.unFollowUser(uid);
}

export async function fetchFollowers(uid) {
  return engine.fetchFollowers(uid);
}
export async function fetchFollowings(uid) {
  return engine.fetchFollowings(uid);
}

export async function fetchUser(uid, sub = false) {
  return engine.fetchUser(uid, sub);
}

export async function updateUserPrivacy(vcard) {
  return engine.updateUserPrivacy(vcard);
}

// for push notification
export async function updateUserPushToken(push_token) {
  return engine.updateUserPushToken(push_token);
}

export async function updateUserNotification(vcard) {
  return engine.updateUserNotification(vcard);
}