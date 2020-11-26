import { observable, action, toJS, computed, has } from "mobx";
import { persist } from "mobx-persist";
import firebase from "firebase";
import moment from "moment";

export default class UserStore {
  @observable
  user = {};

  @observable
  @persist
  userId;

  @observable
  hasProfile;

  @observable
  users = {};

  @observable
  hasProfile = false;

  @observable
  achievements = {};

  @observable
  followers = {};

  @observable
  followings = {};

  @observable
  posts = {};

  @observable
  loading = false;

  clear() {
    this.user = {};
    this.userId = null;
    this.hasProfile = false;
    this.users = {};
    this.achievements = {};
    this.followers = {};
    this.followings = {};
    this.loading = false;
  }

  @action
  setAuthUser(user, hasProfile = false) {
    this.user = user;
    this.hasProfile = hasProfile;
    this.setUser(user);
  }

  @action
  setUserId(userId) {
    this.userId = userId;
  }

  @action
  setUser(user) {
    this.users[user.uid] = user;
  }

  @action
  setAchievements(uid, achievements) {
    this.achievements[uid] = achievements
      .sort((a, b) => moment(a.eventDate).diff(moment(b.eventDate)))
      .reverse();
  }

  @action
  setFollowers(uid, followers) {
    this.followers[uid] = followers;
  }

  @action
  setFollowings(uid, followings) {
    this.followings[uid] = followings;
  }

  @action
  startLoading() {
    this.loading = true;
  }

  @action
  dismissLoading() {
    this.loading = false;
  }
}
