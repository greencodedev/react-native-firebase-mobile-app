import React from "react";
import { AsyncStorage } from "react-native";
import { setLanguage } from "@utils/translate";
import { getUser } from "@logics/auth";

const SettingContext = React.createContext("setting");
const { Consumer, Provider } = SettingContext;

export const notificationSettings = [
  { title: "setting-notification-item-new-follower", key: "newfollowerNotification" },
  { title: "setting-notification-item-mention", key: "mentionedNotification" },
  {
    title: "setting-notification-item-post-follow",
    key: "postUserFollowingNotification"
  },
  {
    title: "setting-notification-item-post-user-following",
    key: "postRaceFollowingNotification"
  },
  {
    title: "setting-notification-item-post-race-following",
    key: "postClubFollowingNotification"
  },
  {
    title: "setting-notification-item-post-club-following",
    key: "eventVicinityNotification"
  }
].map(({ title, key }) => {
  return {
    title,
    key,
    options: [
      { label: "turnon-notification", value: "1" },
      { label: "turnoff-notification", value: "0" }
    ]
  };
});

export const privacySettings = [
  { title: "setting-privacy-item-achievements", key: "achievePrivacy" },
  { title: "setting-privacy-item-personal-best", key: "pbPrivacy" },
  { title: "setting-privacy-item-podiums", key: "podiumPrivacy" },
  {
    title: "setting-privacy-item-followings-followers",
    key: "followPrivacy"
  },
  {
    title: "setting-privacy-item-post-club-following",
    key: "clubPrivacy"
  },
  { title: "setting-privacy-item-calendar", key: "calenderPrivacy" }
].map(({ title, key }) => {
  return {
    title,
    key,
    options: [
      { label: "setting-privacy-options-public", value: "0" },
      { label: "setting-privacy-options-me", value: "1" }
    ]
  };
});
export const unitSettings = [
  {
    title: "setting-unit-item-length",
    key: "length",
    options: [
      { label: "setting-unit-options-ft", value: "0" },
      { label: "setting-unit-options-meter", value: "1" }
    ]
  },
  {
    title: "setting-unit-item-weight",
    key: "weight",
    options: [
      { label: "setting-unit-options-lb", value: "0" },
      { label: "setting-unit-options-kg", value: "1" }
    ]
  },
  {
    title: "setting-unit-item-pace",
    key: "pace",
    options: [
      { label: "setting-unit-options-min/mile", value: "0" },
      { label: "setting-unit-options-min/km", value: "1" }
    ]
  }
];

export class SettingConsumer extends React.PureComponent {
  render() {
    return <Consumer>{this.props.children}</Consumer>;
  }
}

export class SettingProvider extends React.Component {
  constructor(props) {
    super(props);
    const notification = {};
    const privacy = {};
    const unit = {};
    
    this.state = {
      language: "en",
      notification,
      privacy,
      unit,
      navigation: {}
    };
  }
  UNSAFE_componentWillMount() {
    notificationSettings.map(
      (item, index) => (this.state.notification[item.key] = notificationSettings[index].options[0].value)
    );
    privacySettings.map(
      (item, index) => (this.state.privacy[item.key] = privacySettings[index].options[0].value)
    );
    unitSettings.map(
      (item, index) => (this.state.unit[item.key] = unitSettings[index].options[0].value)
    );
    this.loadUnit()
    this.loadNotification()
    this.loadPrivacy()
  }
  async loadUnit() {
    try {
      unitSettings.map((item, index) => {        
          let data = AsyncStorage.getItem(item.title);
          this.state.unit[item.key] =  data ? data : unitSettings[index].options[0].value;
      });
    } catch (e) {
      console.log(e);
    }
  }
  async loadNotification() {
    try {
      const userData = getUser();
      notificationSettings.map((item, index) => {   
          this.state.notification[item.key] = userData[item.key];
      });
    } catch (e) {
      console.log(e);
    }
  }
  async loadPrivacy() {
    try {
      const userData = getUser();
      privacySettings.map((item, index) => {        
        this.state.privacy[item.key] = userData[item.key];
      });
    } catch (e) {
      console.log("privacy error => ", e);
    }
  }
  changeLanguage = language => {
    this.setState({ language });
  };
  changeNotification = (key, value) => {
    this.setState({
      notification: { ...this.state.notification, [key]: value }
    });
    try {
      notificationSettings.map((item) => {        
        AsyncStorage.setItem(item.title, this.state.notification[item.key]);  
      });
    } catch(e) {
      console.log("notification error => ", e);
    }
  };
  changePrivacy = (key, value) => {
    this.setState({
      privacy: { ...this.state.privacy, [key]: value }
    });
    try {
      privacySettings.map((item) => {        
        AsyncStorage.setItem(item.title, this.state.privacy[item.key]);  
      });
    } catch(e) {
      console.log(e)
    }
  };
  changeUnit = (key, value) => {
    this.setState({
      unit: { ...this.state.unit, [key]: value }
    });
    try {
      unitSettings.map((item) => {        
        AsyncStorage.setItem(item.title, this.state.unit[item.key]);  
      });
    } catch(e) {
      console.log(e)
    }
  };
  handleNavigationChange = (newState) => {
    this.setState({
      navigation: newState
    });
  };
  render() {
    const { children, ...otherProps } = this.props;
    setLanguage(this.state.language);
    return (
      <Provider
        value={{
          language: this.state.language,
          notification: this.state.notification,
          privacy: this.state.privacy,
          unit: this.state.unit,
          changeLanguage: this.changeLanguage,
          changeNotification: this.changeNotification,
          changePrivacy: this.changePrivacy,
          changeUnit: this.changeUnit,
          handleNavigationChange: this.handleNavigationChange
        }}
        {...otherProps}
      >
        {children}
      </Provider>
    );
  }
}

export default SettingContext;
