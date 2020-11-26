import * as firebase from "firebase";
import "firebase/firestore";
import * as R from "ramda";
import {Alert} from 'react-native';
import { isValue } from "@utils";
import { userStore } from "@stores";
// import { ConnectableObservable } from "rx-core";
var jwtDecode = require('jwt-decode');

const firebaseConfig = {
  apiKey: "AIzaSyBWrF50LU-OflwtBpef47rZlSLg-CMhkOE",
  authDomain: "sportify-api.firebaseapp.com",
  databaseURL: "https://sportify-api.firebaseio.com",
  projectId: "sportify-api",
  storageBucket: "sportify-api.appspot.com",
  messagingSenderId: "338959907607"
};
class FirebaseClass {
  async init(onSuccess, onFailure) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const firestore = firebase.firestore();

    this.initAuthListener(onSuccess);
  }

  isUserLoggedIn() {
    return firebase.auth().currentUser != null;
  }

  async initAuthListener(onSuccess) {
    firebase.auth().onAuthStateChanged(async user => {
      if (user != null) {
        await this.fetchUser();
      }
      onSuccess(user != null);
    });
  }

  getUser() {
    return firebase.auth().currentUser;
  }

  async loginWithGoogle(user, idToken, accessToken, onSuccess, onFailure, status) {
    const { email, name, photoUrl, givenName, familyName } = user;
    const providers = await firebase.auth().fetchSignInMethodsForEmail(email);
    const isCreatedAlready = !R.isEmpty(providers);

    const GOOGLE_PROVIDER = "google.com";
    const linked = R.contains(GOOGLE_PROVIDER, providers);
    if (!linked) {
      const password = email;
      if (!isCreatedAlready) {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        const { uid } = firebase.auth().currentUser;
        const newUser = {
          firstName: givenName,
          lastName: familyName,
          displayName: name,
          email: email,
          photoURL: photoUrl,
          pdfUrl: "",
          followers: [],
          followings: [],
          bookmarks: [],
          country: "US",
          language: "en-us",
          type: "person",
          state: "",
          city: "",
          type: "person",
          bio: "",
          verified: false,
          achievePrivacy: 0,
          pbPrivacy: 0,
          podiumPrivacy: 0,
          followPrivacy: 0,
          clubPrivacy: 0,
          calenderPrivacy: 0,
          push_token: "",   // token for push notification
          newfollowerNotification: 1,
          mentionedNotification: 1,
          postUserFollowingNotification: 1,
          postRaceFollowingNotification: 1,
          postClubFollowingNotification: 1,
          eventVicinityNotification: 1,
          going: [],
          interesting: [],
          not: []
        };
        await firebase
          .firestore()
          .collection("onrun_users")
          .doc(uid)
          .set(newUser);
      } else {
        if(status == 'login') {
          Alert.alert(
            'Reset Password',
            'Do you want reset password?',
            [
              {text: 'No', onPress: () => {onSuccess()}},
              {text: 'Yes', onPress: () => {firebase.auth().sendPasswordResetEmail(email).then(function() {
                alert("We sent reset password link to your email address. Please check your email address.");
                onSuccess();
              })}},
            ],
            { cancelable: false }
          )
        }
      }
    }

    const credential = firebase.auth.GoogleAuthProvider.credential(
      idToken,
      accessToken
    );
    if (isCreatedAlready) {
      await firebase
        .auth()
        .signInWithCredential(credential)
        .then(async userAuth => {
          console.log(userAuth);
          await this.fetchUser();
          onSuccess();
        })
        .catch(error => {
          onFailure(error);
        });
    } else {
      await firebase
        .auth()
        .currentUser.linkAndRetrieveDataWithCredential(credential)
        .then(async () => {
          await this.fetchUser();
          onSuccess();
        })
        .catch(error => {
          onFailure(error);
        });
    }
  }

  async loginWithFacebook(token, onSuccess, onFailure, status) {
    console.log(`fetch user's name and email from facebook`);
    
    // Get Info from FB
    const fields = R.join(",", ["email", "name"]);
    const response = await fetch(
      `https://graph.facebook.com/me?fields=${fields}&access_token=${token}`
    );
    const result = await response.json();
    const photoURL = await fetch(`https://graph.facebook.com/${result.id}/picture`);
    const { email, name } = result;

    console.log("name", name);
    console.log("email", email);

    const names = name.split(" ");
    console.log("names" + JSON.stringify(names));
    // Fetch Providers
    console.log(`fetch providers for ${email}`);
    const providers = await firebase.auth().fetchSignInMethodsForEmail(email);
    console.log("providers", providers);

    // CHeck if user exists
    const isCreatedAlready = !R.isEmpty(providers);
    
    // TODO: Should be reconsidered!!!
    // Check if FB is linked
    console.log("check if user is linked to facebook");
    const FACEBOOK_PROVIDER = "facebook.com";
    const linked = R.contains(FACEBOOK_PROVIDER, providers);

    console.log("iscreated", isCreatedAlready);
    console.log("linked", linked);

    if (!linked) {
      const password = email;
      if (!isCreatedAlready) {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        const { uid } = firebase.auth().currentUser;
        console.log("uid", uid);
        const newUser = {
          firstName: names[0],
          lastName: names[1],
          displayName: name,
          email: email,
          photoURL: photoURL.url,
          followers: [],
          followings: [],
          bookmarks: [],
          country: "US",
          language: "en-us",
          type: "person",
          state: "",
          city: "",
          type: "person",
          bio: "",
          verified: false,
          achievePrivacy: 0,
          pbPrivacy: 0,
          podiumPrivacy: 0,
          followPrivacy: 0,
          clubPrivacy: 0,
          calenderPrivacy: 0,
          push_token: "",   // token for push notification
          newfollowerNotification: 1,
          mentionedNotification: 1,
          postUserFollowingNotification: 1,
          postRaceFollowingNotification: 1,
          postClubFollowingNotification: 1,
          eventVicinityNotification: 1,
          going: [],
          interesting: [],
          not: []
        };
        await firebase
          .firestore()
          .collection("onrun_users")
          .doc(uid)
          .set(newUser);
      } else {
        if(status == 'login') {
          Alert.alert(
            'Reset Password',
            'Do you want reset password?',
            [
              {text: 'No', onPress: () => {onSuccess()}},
              {text: 'Yes', onPress: () => {firebase.auth().sendPasswordResetEmail(email).then(function() {
                alert("We sent reset password link to your email address. Please check your email address.");
                onSuccess();
              })}},
            ],
            { cancelable: false }
          )
        }
      }
    }

    // GET FB credentials
    console.log("get credential from facebook");
    const credential = firebase.auth.FacebookAuthProvider.credential(token);

    if (isCreatedAlready) {
      console.log("let log in with facebook");
      firebase
        .auth()
        .signInWithCredential(credential)
        .then(async () => {
          console.log("signed in with facebook");
          await this.fetchUser();
          // userStore.setEmail(email);
          onSuccess();
        })
        .catch(error => {
          console.log("Error authenticating with Facebook");
          console.log(error);
          console.log(error.message);
          onFailure(error);
        });
    } else {
      console.log("lets link to facebook");
      firebase
        .auth()
        .currentUser.linkAndRetrieveDataWithCredential(credential)
        .then(async () => {
          console.log("linked with facebook");
          await this.fetchUser();
          // userStore.setEmail(email);
          onSuccess();
        })
        .catch(error => {
          console.log("Error authenticating with Facebook");
          console.log(error);
          console.log(error.message);
          onFailure(error);
        });
    }
  }

  async loginWithApple(authorizationCode, identity_token, nonce, onSuccess, onFailure, status) {
    const jwt_res = jwtDecode(identity_token);
    const email = jwt_res.email;
    const emailCheck = await firebase.auth().fetchSignInMethodsForEmail(email);
    const isCreatedAlready = !R.isEmpty(emailCheck);

    const APPLE_PROVIDER = "apple.com";
    const linked = R.contains(APPLE_PROVIDER, emailCheck);
    if(!linked) {
      const password = email;
      if(!isCreatedAlready) {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        const { uid } = firebase.auth().currentUser;
          const newUser = {
            firstName: '',
            lastName: '',
            displayName: '',
            email: email,
            photoURL: '',
            pdfUrl: "",
            followers: [],
            followings: [],
            bookmarks: [],
            country: "US",
            language: "en-us",
            type: "person",
            state: "",
            city: "",
            type: "person",
            bio: "",
            verified: false,
            achievePrivacy: 0,
            pbPrivacy: 0,
            podiumPrivacy: 0,
            followPrivacy: 0,
            clubPrivacy: 0,
            calenderPrivacy: 0,
            push_token: "",   // token for push notification
            newfollowerNotification: 1,
            mentionedNotification: 1,
            postUserFollowingNotification: 1,
            postRaceFollowingNotification: 1,
            postClubFollowingNotification: 1,
            eventVicinityNotification: 1,
            going: [],
            interesting: [],
            not: []
          };
          await firebase
            .firestore()
            .collection("onrun_users")
            .doc(uid)
            .set(newUser);
      }else {
        if(status == 'login') {
          Alert.alert(
            'Reset Password',
            'Do you want reset password?',
            [
              {text: 'No', onPress: () => {onSuccess()}},
              {text: 'Yes', onPress: () => {firebase.auth().sendPasswordResetEmail(email).then(function() {
                alert("We sent reset password link to your email address. Please check your email address.");
                onSuccess();
              })}},
            ],
            { cancelable: false }
          )
        }
      }
    }

    const provider = new firebase.auth.OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: identity_token,
      rawNonce: nonce
    })

    alert(credential);
    if(isCreatedAlready) {
      await firebase.auth().signInWithCredential(credential).then(async userAuth => {
        await this.fetchUser();
        onSuccess();
      })
      .catch(error => {
        onFailure(error)
      })
    } else {
      await firebase
        .auth()
        .currentUser.linkWithCredential(credential)
        .then(async()=>{
          await this.fetchUser();
          onSuccess();
        })
        .catch(error=>{
          onFailure(error);
        });
    }


  }

  async updateUserProfile({
    displayName,
    firstName,
    lastName,
    country,
    bio="",
    // city,
    // state,
    birthday
  }) {
    const user = firebase.auth().currentUser;
    const { uid, email, photoURL } = user;
    const db = firebase.firestore();
    const exists = await db
      .collection("onrun_users")
      .doc(uid)
      .get()
      .then(s => s.exists);
    if (exists) {
      console.log(uid, "exists");
      await db
        .collection("onrun_users")
        .doc(uid)
        .update({
          displayName,
          firstName,
          lastName,
          country,
          bio,
          // city,
          // state,
          birthday
        });
    } else {
      console.log(uid, "not exists");
      await db
        .collection("onrun_users")
        .doc(uid)
        .set({
          firstName,
          lastName,
          displayName,
          email: email,
          photoURL: photoURL ? photoURL : "",
          followers: [],
          followings: [],
          bookmarks: [],
          country: country ? country : "US",
          language: "en-us",
          type: "person",
          // state,
          // city,
          type: "person",
          verified: false,
          birthday,
          bio,
          fetched: false,
          achievePrivacy: 0,
          pbPrivacy: 0,
          podiumPrivacy: 0,
          followPrivacy: 0,
          clubPrivacy: 0,
          calenderPrivacy: 0,
          push_token: "",   // token for push notification
          newfollowerNotification: 1,
          mentionedNotification: 1,
          postUserFollowingNotification: 1,
          postRaceFollowingNotification: 1,
          postClubFollowingNotification: 1,
          eventVicinityNotification: 1,
          going: [],
          interesting: [],
          not: []
        });
    }
    await this.fetchUser();
  }

  async updateUserPushToken(push_token) {
    const user = firebase.auth().currentUser;
    const { uid } = user;
    const db = firebase.firestore();
    const exists = await db
      .collection("onrun_users")
      .doc(uid)
      .get()
      .then(s => s.exists);
    if (exists) {
      console.log(uid, "exists");
      await db
        .collection("onrun_users")
        .doc(uid)
        .update({
          push_token
        });
    }
    await this.fetchUser(); 
  }
  
  async updateUserPrivacy({
    achievePrivacy,
    pbPrivacy,
    podiumPrivacy,
    followPrivacy,
    clubPrivacy,
    calenderPrivacy
  }) {
    const user = firebase.auth().currentUser;
    const { uid, email, photoURL } = user;
    const db = firebase.firestore();
    const exists = await db
      .collection("onrun_users")
      .doc(uid)
      .get()
      .then(s => s.exists);
    if (exists) {
      console.log(uid, "exists");
      await db
        .collection("onrun_users")
        .doc(uid)
        .update({
          achievePrivacy,
          pbPrivacy,
          podiumPrivacy,
          followPrivacy,
          clubPrivacy,
          calenderPrivacy
        });
    }
    await this.fetchUser(); 
  }

  async updateUserNotification({
    newfollowerNotification,
    mentionedNotification,
    postUserFollowingNotification,
    postRaceFollowingNotification,
    postClubFollowingNotification,
    eventVicinityNotification,
  }) {
    const user = firebase.auth().currentUser;
    const { uid } = user;
    const db = firebase.firestore();
    const exists = await db
      .collection("onrun_users")
      .doc(uid)
      .get()
      .then(s => s.exists);
    if (exists) {
      console.log(uid, "exists");
      await db
        .collection("onrun_users")
        .doc(uid)
        .update({
          newfollowerNotification,
          mentionedNotification,
          postUserFollowingNotification,
          postRaceFollowingNotification,
          postClubFollowingNotification,
          eventVicinityNotification,
        });
    }
    await this.fetchUser(); 
  }

  async uploadUserProfileImage(blob, metadata, onProgress) {
    const user = firebase.auth().currentUser;
    const { uid } = user;
    const name = `${uid}.jpg`;
    const ref = firebase
      .app()
      .storage("gs://sportify-api.appspot.com")
      .ref()
      .child("profile-images/" + name);
    const task = ref.put(blob, metadata);
    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        snapshot => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          onProgress && onProgress(progress);
        },
        error => reject(error),
        () => {
          task.snapshot.ref.getDownloadURL().then(async downloadURL => {
            const db = firebase.firestore();
            db.collection("onrun_users")
              .doc(uid)
              .update({
                photoURL: downloadURL
              })
              .then(this.fetchUser.bind(this))
              .then(() => resolve());
          });
        }
      );
    });
  }
  async uploadImageForAchievement(uid, id, blob, metadata) {
    // TODO: SHould be rewriten
    const name = `${id}-${parseInt(Math.random() * 10000)}.jpg`;
    const ref = firebase
      .app()
      .storage("gs://sportify-api.appspot.com")
      .ref()
      .child(`users/${uid}/images/achievements/${name}`);
    const task = ref.put(blob, metadata);
    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        snapshot => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          onProgress && onProgress(progress);
        },
        error => reject(error),
        () => {
          task.snapshot.ref.getDownloadURL().then(async downloadURL => {
            const db = firebase.firestore();
            db.collection("onrun_users")
              .doc(uid)
              .collection("achievements")
              .doc(id)
              .update({
                images: firebase.firestore.FieldValue.arrayUnion(downloadURL)
              })
              .then(() => this.fetchAchievements(uid))
              .then(achievements =>
                userStore.setAchievements(uid, achievements)
              )
              .then(() => resolve());
          });
        }
      );
    });
  }
  async uploadPDFForAchievement(uid, blob, metadata) {
    // TODO: SHould be rewriten
    const name = `myAchievement`;
    const ref = firebase
      .app()
      .storage("gs://sportify-api.appspot.com")
      .ref()
      .child(`users/${uid}/pdf/${name}-${parseInt(Math.random() * 1000000)}.pdf`);   /// random
    const task = ref.put(blob, metadata);
    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        snapshot => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          onProgress && onProgress(progress);
        },
        error => reject(error),
        () => {
          task.snapshot.ref.getDownloadURL().then(async downloadURL => {
            const db = firebase.firestore();
            db.collection("onrun_users")
              .doc(uid)
              .update({
                pdfUrl: downloadURL
              })
              .then(() => this.fetchUser())
              .then(() => resolve());
          });
        }
      );
    });
  }
  async fetchUser(passedUid = null, fetchCollections = false) {
    const user = firebase.auth().currentUser;
    const uid = passedUid !== null ? passedUid : user.uid;
    const snapshot = await firebase
      .firestore()
      .collection("onrun_users")
      .doc(uid)
      .get();
    let hasProfile = snapshot.exists;
    if (!hasProfile) {
      userStore.setAuthUser(user, hasProfile);
      return user;
    }
    const snapshotVal = snapshot.data();
    const {
      displayName,
      firstName,
      lastName,
      country,
      city,
      state,
      photoURL,
      pdfUrl = "",
      email,
      birthday,
      bio,
      fetched = false,
      followers = [],
      followings = [],
      achievePrivacy = 0,
      pbPrivacy = 0,
      podiumPrivacy = 0,
      followPrivacy = 0,
      clubPrivacy = 0,
      calenderPrivacy = 0,
      push_token = "",   // token for push notification
      newfollowerNotification = 1,
      mentionedNotification = 1,
      postUserFollowingNotification = 1,
      postRaceFollowingNotification = 1,
      postClubFollowingNotification = 1,
      eventVicinityNotification = 1,
      going = [],
      interesting = [],
      not = [],
    } = snapshotVal;
    const newUser = {
      uid,
      displayName,
      firstName,
      lastName,
      country,
      city,
      state,
      photoURL,
      pdfUrl,
      email,
      birthday,
      bio,
      fetched,
      followers,
      followings,      
      achievePrivacy,
      pbPrivacy,
      podiumPrivacy,
      followPrivacy,
      clubPrivacy,
      calenderPrivacy,
      push_token,   // token for push notification
      newfollowerNotification,
      mentionedNotification,
      postUserFollowingNotification,
      postRaceFollowingNotification,
      postClubFollowingNotification,
      eventVicinityNotification,
      going,
      interesting,
      not
    };
    hasProfile = isValue(birthday);
    if (fetchCollections) {
      await this.fetchAchievements(uid).then(achievements =>
        userStore.setAchievements(uid, achievements)
      );
      await this.fetchFollowers(uid).then(followers =>
        userStore.setFollowers(uid, followers)
      );
      await this.fetchFollowings(uid).then(followings =>
        userStore.setFollowings(uid, followings)
      );
    }
    if (user.uid === uid) userStore.setAuthUser(newUser, hasProfile);
    return newUser;
  }
  async hasProfile(uid) {
    const snapshot = await firebase
      .database()
      .ref("/users/" + uid + "/profile/")
      .once("value");
    return snapshot.val() != undefined;
  }
  async createEvent(event) {
    const db = firebase.firestore();
    const user = this.getUser();
    return db
      .collection("onrun_users")
      .doc(user.uid)
      .collection("onrun_events")
      .add(event);
  }

  fetchConnections = type => async uid => {
    const db = firebase.firestore();
    const userRef = await db
      .collection("onrun_users")
      .doc(uid)
      .get();
    const connectionsRefs = userRef.data()[type];
    let connections = [];
    connectionsRefs.forEach(ref => connections.push(ref.id));
    return connections;
  };
  async fetchFollowers(uid) {
    return this.fetchConnections("followers")(uid);
  }
  async fetchFollowings(uid) {
    return this.fetchConnections("followings")(uid);
  }
  async searchForUsers(text) {
    const db = firebase.firestore();
    return db
      .collection("onrun_users")
      .get()
      .then(function(querySnapshot) {
        let users = [];
        querySnapshot.forEach(function(doc) {
          if (text != doc.id) {
            const user = {
              uid: doc.id,
              displayName: doc.get("displayName"),
              photoURL: doc.get("photoURL"), 
              achievePrivacy: doc.get("achievePrivacy") == undefined ? 0 : doc.get("achievePrivacy"),
              pbPrivacy: doc.get("pbPrivacy") == undefined ? 0 : doc.get("pbPrivacy"),
              podiumPrivacy: doc.get("podiumPrivacy") == undefined ? 0 : doc.get("podiumPrivacy"),
              followPrivacy: doc.get("followPrivacy") == undefined ? 0 : doc.get("followPrivacy"),
              clubPrivacy: doc.get("clubPrivacy") == undefined ? 0 : doc.get("clubPrivacy"),
              calenderPrivacy: doc.get("calenderPrivacy") == undefined ? 0 : doc.get("calenderPrivacy"),
              push_token: doc.get("push_token"),
              newfollowerNotification: doc.get("newfollowerNotification") == undefined ? 1 : doc.get("newfollowerNotification"),
              mentionedNotification: doc.get("mentionedNotification") == undefined ? 1 : doc.get("mentionedNotification"),
              postUserFollowingNotification: doc.get("postUserFollowingNotification") == undefined ? 1 : doc.get("postUserFollowingNotification"),
              postRaceFollowingNotification: doc.get("postRaceFollowingNotification") == undefined ? 1 : doc.get("postRaceFollowingNotification"),
              postClubFollowingNotification: doc.get("postClubFollowingNotification") == undefined ? 1 : doc.get("postClubFollowingNotification"),
              eventVicinityNotification: doc.get("eventVicinityNotification") == undefined ? 1 : doc.get("eventVicinityNotification"),
            };
            users.push(user);
          }
        });
        return users;
      });
  }

  async getAllUsers() {
    const db = firebase.firestore();
    return db
      .collection("onrun_users")
      .get()
      .then(function(querySnapshot) {
        let users = [];
        querySnapshot.forEach(function(doc) {
          const user = {
            uid: doc.id,
            displayName: doc.get("displayName"),
            birthday: doc.get("birthday"),
            country: doc.get("country")
          };
          users.push(user);
        });
        return users;
      });
  }

  async saveUserAchievements(achievements) {
    const db = firebase.firestore();
    const { uid } = this.getUser();
    const eventsRef = db
      .collection("onrun_users")
      .doc(uid)
      .collection("achievements");
    const userRef = db.collection("onrun_users").doc(uid);
    const batch = db.batch();
    achievements.map(achievement => {
      const { EntryId, confirm = false, ...otherFields } = achievement;
      const newDoc = EntryId ? eventsRef.doc(EntryId + "") : eventsRef.doc();
      if (confirm)
        batch.set(newDoc, { EntryId, ...otherFields }, { merge: true });
      else batch.delete(newDoc);
    });
    batch.update(userRef, { fetched: true });
    return batch.commit();
  }
  async fetchAchievements(uid) {
    const db = firebase.firestore();
    const eventsRef = db
      .collection("onrun_users")
      .doc(uid)
      .collection("achievements");
    return eventsRef.get().then(querySnapshot => {
      const achievements = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        achievements.push({
          ...data,
          ref: doc.ref,
          id: doc.id
        });
      });
      return achievements;
    });
  }

  async fetchPosts() {
    const db = firebase.firestore();
    const { uid } = this.getUser();
    const { displayName, photoURL } = userStore.user;
    return db
      .collection("onrun_users")
      .doc(uid)
      .collection("onrun_events")
      .get()
      .then(snapshot => {
        posts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          posts.push({
            ...data,
            id: doc.id,
            user: {
              uid,
              displayName,
              photoURL
            }
          });
        });
        return posts;
      });
  }
  async fetchBookmarks(uid) {
    const db = firebase.firestore();
    return db
      .collection("onrun_users")
      .doc(uid)
      .collection("bookmarks")
      .get();
  }

  async unFollowUser(uid) {
    const db = firebase.firestore();
    let batch = db.batch();
    const myUid = this.getUser().uid;
    console.log(myUid, "wants to unfollow", uid);
    const myRef = db.collection("onrun_users").doc(myUid);
    const userRef = db.collection("onrun_users").doc(uid);
    batch.update(myRef, {
      followings: firebase.firestore.FieldValue.arrayRemove(userRef)
    });
    batch.update(userRef, {
      followers: firebase.firestore.FieldValue.arrayRemove(myRef)
    });
    return batch.commit();
    // .then(() => {
    //   return this.fetchFollowings(myUid);
    // }).then(followings => userStore.setFollowings(myUid,followings));
  }
  async followUser(uid) {
    const db = firebase.firestore();
    let batch = db.batch();
    const myUid = this.getUser().uid;
    console.log(myUid, "wants to follow", uid);
    const myRef = db.collection("onrun_users").doc(myUid);
    const userRef = db.collection("onrun_users").doc(uid);
    batch.update(myRef, {
      followings: firebase.firestore.FieldValue.arrayUnion(userRef)
    });
    batch.update(userRef, {
      followers: firebase.firestore.FieldValue.arrayUnion(myRef)
    });
    return batch.commit();
    // .then(() => {
    //   return this.fetchFollowings(myUid);
    // }).then(followings => userStore.setFollowings(myUid, followings));
  }

  async fetchEvents() {
    let events = [];
    const db = firebase.firestore();
    const eventsRef = db
      .collection("events");
    return eventsRef.get()
      .then(docs => {
        docs.forEach(event => {
          const data = event.data();
          events.push({ id: event.id, ...data });
        });
        return events;
      })     
  }

  async fetchEventsById(eventId) {
    const db = firebase.firestore();
    return db.collection("events_user").doc(eventId).get().then(event=>{
      return {
        ...event.data(),
        id: event.id
      }      
    })
  }

  async fetchGroupRun() {
    let groupRuns = [];
    var startTime = firebase.firestore.Timestamp.fromDate(new Date());
    const db = firebase.firestore();
    const groupRunRef = db.collection("events_user").where('datetime', '>=', startTime);
    return groupRunRef.get().then(
      docs => {
        docs.forEach(event => {
          const data = event.data();
          groupRuns.push({id: event.id, ...data});
        });
        return groupRuns;
      }
    )
  }

  async fetchCommentsById(uid) {
    let comments = [];
    const db = firebase.firestore();
      return  db.collection("comments")
              .where("eventID", "==", uid)
              .get()
              .then(docs => {
                docs.forEach(comment => {
                  const data = comment.data();
                  comments.push({id: comment.id, ...data});
                });
                return comments;
              })
  }

  async fetchUpdatedEventRealTime(oldEvent) {
    let len_go = oldEvent.going.length;
    let len_int = oldEvent.interesting.length;
    let len_not = oldEvent.not.length;
    const db = firebase.firestore();
    return db.collection("events_user").doc(oldEvent.id).get().then(event=>{
      if(len_go != event.data().going.length || len_int != event.data().interesting.length || len_not != event.data().not.length) {
        return true;
      }else {
        return false;
      }
    })
  }

async fetchEventsByUserId(userId) {
  let events = [];
  const db = firebase.firestore();
  return db.collection("events_user")
        .where("uid", "==", userId)
        .get()
        .then(docs => {
          docs.forEach(doc => {
            const data = doc.data();
            events.push({id: doc.id, ...data});
          });
          return events;
        })
}

  async fetchUsersbyId(uid) {
    let users;
    const db = firebase.firestore();
    return db.collection("onrun_users")
          .doc(uid)
          .get()
          .then(function(result) {
            users = {
              name: result.data().displayName,
              country: result.data().country,
              photoURL: result.data().photoURL,
            };
            return users;
        });
  }

  async fetchEventByStatus(uid) {
    let status;
    const db = firebase.firestore();
    return db.collection("onrun_users")
          .doc(uid)
          .get()
          .then(function(result) {
            status = {
              going: result.data().going,
              interesting: result.data().interesting,
              not: result.data().not
            };
            return status
    });
  }

  async fetchFeeds() {
    const db = firebase.firestore();
    const { uid } = this.getUser();
    const userRef = await db
      .collection("onrun_users")
      .doc(uid)
      .get();
    const followersRefs = userRef.data().followers;
    let promises = [];
    let feeds = [];
    followersRefs.forEach(async ref => {
      promises.push(ref.get());
    });
    promises.push(
      db
        .collection("onrun_users")
        .doc(uid)
        .get()
    );
    let docs = await Promise.all(promises);
    const getSingleUserEvents = async doc => {
      const uid = doc.id;
      const userData = doc.data();
      const { displayName, photoURL } = userData;
      console.log("displayName", displayName);
      const eventsDocs = await db
        .collection("onrun_users")
        .doc(uid)
        .collection("onrun_events")
        .get();
      eventsDocs.forEach(doc => {
        const data = doc.data();
        const user = {
          uid,
          displayName,
          photoURL
        };
        feeds.push({ id: doc.id, ...data, user });
      });
    };
    promises = [];
    for (let index = 0; index < docs.length; index++) {
      promises.push(getSingleUserEvents(docs[index], index, docs));
    }
    await Promise.all(promises);
    return feeds;
  }
  async removeAchievement(item) {
    return item.ref.delete();
  }

  async addAchievement(event) {
    const db = firebase.firestore();
    const { uid } = this.getUser();
    const eventsRef = db
      .collection("onrun_users")
      .doc(uid)
      .collection("achievements");
    return eventsRef.add(event);
  }

  toTimestamp(){
    var d1 = new Date();
    var d2 = new Date( d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds() );
    const result = Math.floor(d2.getTime()/ 1000);
    return result;
  }

  async addReview(review, userID, eventID) {
    const db = firebase.firestore();
    
    const commentRef = db.collection("comments").doc();
    return commentRef.set({
      content: review,
      eventID: eventID,
      userID: userID,
      time: this.toTimestamp()
    })
  }

  async createGroupRunEvent(data) {
    const db = firebase.firestore();
    var ref_user = db.collection("onrun_users").doc(data.userID);
    
    const eventRef = await db.collection("events_user").add({
      datetime: data.startTime,
      description: data.description,
      distance: data.distance,
      liked: 0,
      location: data.location,
      name: data.name,
      price: 0,
      shared: 0,
      type: data.type,
      uid: data.userID,
      going: [data.userID],
      interesting: [],
      not: [],
      address: data.address
    });
    const doc = await eventRef.get();
    ref_user.update({
      going: firebase.firestore.FieldValue.arrayUnion(doc.id)
    });
    return {
      ...doc.data(),
      id: doc.id
    }
  }

  async updateGroupRunEvent(data, eventId) {
    const db = firebase.firestore();
    const exists = await db.collection("events_user").doc(eventId).get().then(s=>s.exists);
    if(exists) {
      await db.collection("events_user").doc(eventId).update({
        datetime: data.startTime,
        description: data.description,
        distance: data.distance,
        liked: 0,
        location: data.location,
        name: data.name,
        price: 0,
        shared: 0,
        type: data.type,
        uid: data.userID,
        going: data.going,
        interesting: data.interesting,
        not: data.not,
        address: data.address
      });
    }
    return await this.fetchEventsById(eventId);
  }

  async updateAchievement(id, event) {
    const db = firebase.firestore();
    const { uid } = this.getUser();
    const eventsRef = db
      .collection("onrun_users")
      .doc(uid)
      .collection("achievements")
      .doc(id);
    return eventsRef.update(event);
  }

  async searchEvents(region) {
    const { latitude, latitudeDelta, longitude, longitudeDelta } = region;
    const lessLocation = new firebase.firestore.GeoPoint(
      latitude - latitudeDelta,
      longitude - longitudeDelta
    );
    const greatLocation = new firebase.firestore.GeoPoint(
      latitude + latitudeDelta,
      longitude + longitudeDelta
    );
    const db = firebase.firestore();
    const eventsRef = db.collection("onrun_events");
    return eventsRef
      .where("sport", "==", "run")
      .where("type", "==", "race")
      .where("location", ">=", lessLocation)
      .where("location", "<=", greatLocation)
      .get()
      .then(docs => {
        events = {};
        docs.forEach(doc => {
          const data = doc.data();
          const id = doc.id;
          const { location } = data;
          events[id] = {
            ...data,
            id,
            location: {
              latitude: location._lat,
              longitude: location._long
            }
          };
        });
        return events;
      });
  }
  async deleteUserEventItem(id) {
    await this.deleteCommentById(id);
    await this.deleteStatusOnUser(id);
    const db = firebase.firestore();
    const eventsRef = db.collection("events_user").doc(id);
    return eventsRef.delete();
  }

  async deleteCommentById(id) {
    const db = firebase.firestore();
    const commentRef = db.collection("comments");
    if(commentRef) {
      commentRef
      .where("eventID", "==", id)
      .get()
      .then(res=>{
        res.forEach(doc => {
          db.collection('comments').doc(doc.id).delete();
        });
      });
    }
  }

  async deleteStatusOnUser(eventID) {
    firebase.firestore().collection("onrun_users").get()
    .then(docs=>{
      docs.forEach(ref_user=>{
        ref_user.ref.update({
          not: firebase.firestore.FieldValue.arrayRemove(eventID)
        });
        ref_user.ref.update({
          going: firebase.firestore.FieldValue.arrayRemove(eventID)
        });
        ref_user.ref.update({
          interesting: firebase.firestore.FieldValue.arrayRemove(eventID)
        });
      })
    })
  }

  async updateEventStatus(status, userID, eventID) {
    const db = firebase.firestore();
    var ref_event = db.collection("events_user").doc(eventID);
    var ref_user = db.collection("onrun_users").doc(userID);
    if(status == 1) {
      ref_event.update({
        going: firebase.firestore.FieldValue.arrayUnion(userID)
      });
      ref_event.update({
        not: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_event.update({
        interesting: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_user.update({
        going: firebase.firestore.FieldValue.arrayUnion(eventID)
      });
      ref_user.update({
        not: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
      ref_user.update({
        interesting: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
    }else if(status == 2) {
      ref_event.update({
        interesting: firebase.firestore.FieldValue.arrayUnion(userID)
      });
      ref_event.update({
        not: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_event.update({
        going: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_user.update({
        interesting: firebase.firestore.FieldValue.arrayUnion(eventID)
      });
      ref_user.update({
        not: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
      ref_user.update({
        going: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
    }else if(status == 3) {
      ref_event.update({
        not: firebase.firestore.FieldValue.arrayUnion(userID)
      });
      ref_event.update({
        going: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_event.update({
        interesting: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_user.update({
        not: firebase.firestore.FieldValue.arrayUnion(eventID)
      });
      ref_user.update({
        going: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
      ref_user.update({
        interesting: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
    }else if(status == 0) {
      ref_event.update({
        not: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_event.update({
        going: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_event.update({
        interesting: firebase.firestore.FieldValue.arrayRemove(userID)
      });
      ref_user.update({
        not: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
      ref_user.update({
        going: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
      ref_user.update({
        interesting: firebase.firestore.FieldValue.arrayRemove(eventID)
      });
    }
    return await this.fetchEventsById(eventID);
  }


  async logout() {
    firebase.auth().signOut();
  }
}
const Firebase = new FirebaseClass();
export default Firebase;
