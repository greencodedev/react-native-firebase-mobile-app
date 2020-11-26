import { engine } from "./index";
import { userStore } from "@stores";
import { fetchFollowers, fetchFollowings } from "./auth";

export async function findTrophies() {
  const requestUrl =
    "https://us-central1-sportify-api.cloudfunctions.net/findTrophies";
  const requestMethod = "GET";
  const requestHaders = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  const requestBody = {};
  let response = await fetch(requestUrl, {
    method: requestMethod,
    headers: requestHaders
  });
  let data = await response.json();
  return data;
}
export async function createEvent(event) {
  return engine.createEvent(event);
}

export async function searchForUsers(text) {
  return engine.searchForUsers(text);
}

export async function getAllUsers() {
  return engine.getAllUsers();
}

export async function fetchPosts() {
  return engine.fetchPosts();
}

export async function fetchFeeds() {
  return engine.fetchFeeds();
}

export async function fetchBookmarks(uid) {
  return engine.fetchBookmarks(uid);
}

export async function fetchRaces(uid) {
  return engine.fetchRaces(uid);
}

export async function removeAchievement(item) {
  return engine.removeAchievement(item);
}

export async function addAchievement(event) {
  return engine.addAchievement(event);
}

export async function addReview(review, userID, eventID) {
  return engine.addReview(review, userID, eventID);
}

export async function createGroupRunEvent(data) {
  return engine.createGroupRunEvent(data);
}

export async function updateGroupRunEvent(data, eventId) {
  return engine.updateGroupRunEvent(data, eventId);
}

export async function updateAchievement(id, event) {
  return engine.updateAchievement(id, event);
}

export async function searchEvents(region) {
  return engine.searchEvents(region);
}

export async function fetchAchievements(uid) {
  return engine.fetchAchievements(uid);
}

export async function fetchEventsByUserId(userId) {
  return engine.fetchEventsByUserId(userId);
}
export async function uploadImageForAchievement(uid, id, uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  let metadata = {
    contentType: "image/jpeg"
  };
  return engine.uploadImageForAchievement(uid, id, blob, metadata);
}

export async function uploadPDFForAchievement(uid, uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  let metadata = {
    contentType: "application/pdf"
  };
  return engine.uploadPDFForAchievement(uid, blob, metadata);
}

export async function getUserPromises(user) {
  let promises = [];

  promises.push(
    new Promise((resolve, reject) => {
      return fetchFollowers(user.uid)
        .then(followers => {
          userStore.setFollowers(user.uid, followers);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    })
  );

  promises.push(
    new Promise((resolve, reject) => {
      return fetchFollowings(user.uid)
        .then(followings => {
          userStore.setFollowings(user.uid, followings);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    })
  );

  promises.push(
    new Promise((resolve, reject) => {
      return fetchAchievements(user.uid)
        .then(achievements => {
          userStore.setAchievements(user.uid, achievements);
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    })
  );

  return promises;
}

export async function saveUserAchievements(achievements) {
  return engine.saveUserAchievements(achievements);
}

export async function fetchEvents() {
  return engine.fetchEvents();
}

export async function fetchEventsById(eventID) {
  return engine.fetchEventsById(eventID);
}

export async function fetchGroupRun() {
  return engine.fetchGroupRun();
}

export async function fetchCommentsById(uid) {
  return engine.fetchCommentsById(uid);
}

export async function fetchUsersById(uid) {
  return engine.fetchUsersbyId(uid);
}

export async function fetchEventByStatus(uid) {
  return engine.fetchEventByStatus(uid);
}

export async function deleteUserEventItem(eventId) {
  return engine.deleteUserEventItem(eventId);
}

export async function updateEventStatus(status, userID, eventID) {
  return engine.updateEventStatus(status, userID, eventID);
}