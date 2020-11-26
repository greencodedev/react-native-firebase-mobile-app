import { observable, action, toJS, computed, has } from "mobx";
import { persist } from "mobx-persist";
import firebase from "firebase";
import moment from "moment";

export default class SettingsStore {
  @observable
  unit = {};

  @observable
  @persist
  settingsId;

  @observable
  notification = {};

  clear() {
    this.settingsId = 1;
    this.unit = {
        length: true,
        weight: true,
        pace: true
    };
    this.notification = {};
  }

  @action
  setUnitLength(unit_value) {
    this.unit = unit_value;
  }

  @action
  setUnitWeight(notification_value) {
    this.notification = notification_value;
  }
}
