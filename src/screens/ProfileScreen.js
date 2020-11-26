import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import translate from "@utils/translate";
import { getUser, followUser, unFollowUser } from "@logics/auth";
import * as colors from "@constants/colors";
import Constants from "expo-constants";
import { userStore } from "@stores";
import { observer } from "mobx-react/native";
import * as R from "ramda";
import { StackActions } from "react-navigation";
import ActionSheet from "react-native-actionsheet";
import { convert } from "@utils";

import {
  getUserPromises,
  fetchEventsByUserId,
  fetchEventByStatus,
  fetchUsersById,
  fetchEventsById
} from "../logics/data-logic";
import { fetchFollowings, fetchFollowers, fetchUser } from "../logics/auth";
import { createCancelablePromise } from "../utils";
import { NavigationEvents } from "react-navigation";
import Geocoder from "react-native-geocoding";
import * as firebase from "firebase";

const countries = require("../../assets/data/countries");

@observer
export default class ProfileScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      events: null,
      pb: [],
      status: [],
      userID: "",
      loading: false,
      _isMounted: false,
      isOwnProfile: !props.navigation.getParam("user") ? true : null,
      stateFollow: props.navigation.getParam("state")
        ? props.navigation.getParam("state")
        : false
    };
    this.handlePressItem = this.handlePressItem.bind(this);
    this._isMounted = false;
  }

  async componentDidMount() {
    this.state._isMounted = true;
    this.setState({ loading: true });
    Geocoder.init("AIzaSyCMOlzsK0_sscqyeqq2KBS9bKosOvKW130");
    const user = this.props.navigation.getParam("user", getUser());
    const { uid } = user;
    this.setState({ userID: uid });
    const db = firebase.firestore();
    if (this.state._isMounted) {
      db.collection("events_user").onSnapshot(async () => {
        const events = await fetchEventsByUserId(uid);
        this.setState({ events });
      });
      db.collection("onrun_users")
        .doc(uid)
        .onSnapshot(async () => {
          const status = await fetchEventByStatus(uid);
          this.customStatus(status);
          // this.setState({status});
        });
    }
    const hasAchievements = R.hasPath(["achievements", uid], userStore);
    const hasFollowings = R.hasPath(["followings", uid], userStore);
    const hasFollowers = R.hasPath(["followers", uid], userStore);
    const achievements = R.pathOr([], ["achievements", uid], userStore);
    const achievements_pb = R.filter(
      R.compose(R.not, R.isNil, R.prop("courseDistance")),
      achievements
    );
    let pb = [];
    let temp = {};
    const groups = R.groupBy(a => convert(a.courseDistance))(achievements_pb);
    for (let [key, value] of Object.entries(groups)) {
      temp = {
        key: key,
        value: {
          eventDate: value[0].eventDate,
          eventName: value[0].eventName,
          pace: value[0].pace,
          distance: value[0].courseDistance
        }
      };
      pb.push(temp);
    }
    this.setState({ pb });
    if (!(hasAchievements && hasFollowers && hasFollowings)) {
      const promises = getUserPromises(user);
      this.task = createCancelablePromise(Promise.all(promises));
      this.task.promise.then(() => {
        this.setState({
          isOwnProfile: user.uid === getUser().uid
        });
      });
    } else {
      this.setState({
        isOwnProfile: user.uid === getUser().uid
      });
    }
  }

  async initValues() {
    this.setState({ _isMounted: true });
    const user = this.props.navigation.getParam("user", getUser());
    const { uid } = user;
    if (this._isMounted) {
      const events = await fetchEventsByUserId(uid);
      const status = await fetchEventByStatus(uid);
      this.customStatus(status);
      this.setState({ events, status });
    }
  }

  blurValues() {
    this.setState({ _isMounted: false });
  }

  async customStatus(status) {
    this.setState({ loading: true });
    let result = [];
    if (status.going.length > 0) {
      let temp;
      for (let res of status.going) {
        temp = await fetchEventsById(res);
        temp.user = await fetchUsersById(temp.uid);
        temp.status = "going";
      }
      result.push(temp);
    }
    if (status.interesting.length > 0) {
      let temp;
      for (let res of status.interesting) {
        temp = await fetchEventsById(res);
        temp.user = await fetchUsersById(temp.uid);
        temp.status = "interested";
      }
      result.push(temp);
    }
    if (status.not.length > 0) {
      let temp;
      for (let res of status.not) {
        temp = await fetchEventsById(res);
        temp.user = await fetchUsersById(temp.uid);
        temp.status = "not";
      }
      result.push(temp);
    }

    this.setState({ loading: false, status: result });
  }

  splitString = string => {
    var res = string.split(",");
    return res[1] + "," + "\n" + res[2];
  };

  componentWillUnmount() {
    this.setState({ _isMounted: false });
    this.task && this.task.cancel();
  }

  handleFollowPress(following, uid) {
    const user = this.props.navigation.getParam("user", getUser());
    const { push_token, newfollowerNotification } = user;
    const myUid = getUser().uid;
    const promise = following === "Following" ? unFollowUser : followUser;
    const promises = [];
    promises.push(
      new Promise((resolve, reject) => {
        return fetchFollowings(myUid)
          .then(followings => userStore.setFollowings(myUid, followings))
          .then(resolve)
          .catch(reject);
      })
    );
    promises.push(
      new Promise((resolve, reject) => {
        return fetchFollowers(uid)
          .then(followers => userStore.setFollowers(uid, followers))
          .then(resolve)
          .catch(reject);
      })
    );
    promise(uid)
      .then(Promise.all(promises))
      .then(() => {
        this.setState({ stateFollow: !this.state.stateFollow });
        if (newfollowerNotification == 1 && this.state.stateFollow == true) {
          this.sendPushNotification(getUser().displayName, push_token);
        }
      });
  }

  sendPushNotification(username, token) {
    let response = fetch("https://expopushserver.herokuapp.com/message", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title: "Follow you",
        message: username + " follows you"
      })
    });
  }

  handleBarPress() {
    const pushAction = StackActions.push({
      routeName: "PersonalBest",
      params: {}
    });
    return this.props.navigation.dispatch(pushAction);
  }

  handleAchievementsPress() {
    const user = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    const { uid } = user;
    const pushAction = StackActions.push({
      routeName: "Achievements",
      params: {
        type: "achievement",
        uid,
        user
      }
    });
    return this.props.navigation.dispatch(pushAction);
  }

  handlePodiumsPress() {
    const user = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    const { uid } = user;
    const pushAction = StackActions.push({
      routeName: "Trophies", //// 09-15
      params: {
        type: "podium",
        uid
      }
    });
    return this.props.navigation.dispatch(pushAction);
  }

  handleCalendarPress() {
    const pushAction = StackActions.push({
      routeName: "Calendar",
      params: {}
    });
    return this.props.navigation.dispatch(pushAction);
  }

  handleAchievementPress() {
    const pushAction = StackActions.push({
      routeName: "Achievements",
      params: {
        type: "achievement"
      }
    });
    return this.props.navigation.dispatch(pushAction);
  }

  handleNotification() {
    const user = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    const { uid } = user;
    let params = {
      route: "Followers",
      type: "follower",
      uid
    };

    this.props.navigation.navigate("Notification", params);
  }

  handleFollowersPress() {
    const user = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    const { uid } = user;
    const pushAction = StackActions.push({
      routeName: "Connections",
      params: {
        route: "Followers",
        type: "follower",
        uid
      }
    });
    this.props.navigation.dispatch(pushAction);
  }

  handleFollowingsPress() {
    const user = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    const { uid } = user;
    const pushAction = StackActions.push({
      routeName: "Connections",
      params: {
        route: "Followings",
        type: "following",
        uid
      }
    });
    this.props.navigation.dispatch(pushAction);
  }

  handlePersonalBestPress() {
    const { uid } = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    const pushAction = StackActions.push({
      routeName: "PersonalBest",
      params: {
        uid
      }
    });
    return this.props.navigation.dispatch(pushAction);
  }

  showActionSheet = () => {
    //To show the Bottom ActionSheet
    this.ActionSheet.show();
  };

  convertRealDateTime = timeStamp => {
    const months = [
      "January",
      "Febrary",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "Octorber",
      "November",
      "December"
    ];
    var theDate;
    // if(type == 'filter') {
    theDate = new Date(timeStamp * 1000);
    // }else if(type == 'create') {
    //     theDate = timeStamp;
    // }
    var day = theDate.getDate();
    var month = theDate.getMonth();
    var year = theDate.getFullYear();
    var hh = theDate.getHours();
    hh = hh < 10 ? "0" + hh : hh;
    var mm = theDate.getMinutes();
    mm = mm < 10 ? "0" + mm : mm;
    return day + " " + months[month] + " " + year + " " + hh + ":" + mm;
  };

  convertDiatanceToString = index => {
    let str = "";
    let bgColor = "";
    let color = "";
    if (index < 3000) {
      str = "Less 3K";
      bgColor = colors.K3;
      color = colors.black;
    } else if (index > 1000000) {
      str = "More 100M";
      bgColor = colors.M100;
      color = colors.white;
    }
    switch (index) {
      case 5000:
        str = "5K";
        bgColor = colors.K5;
        color = colors.black;
        break;
      case 10000:
        str = "10K";
        bgColor = colors.K10;
        color = colors.black;
        break;
      case 21000:
        str = "HM";
        bgColor = colors.HM;
        color = colors.black;
        break;
      case 42000:
        str = "M";
        bgColor = colors.M;
        color = colors.white;
        break;
      case 50000:
        str = "50K";
        bgColor = colors.K50;
        color = colors.white;
        break;
      case 500000:
        str = "50M";
        bgColor = colors.M50;
        color = colors.white;
        break;
      case 100000:
        str = "100K";
        bgColor = colors.K100;
        color = colors.white;
        break;
      case 1000000:
        str = "100M";
        bgColor = colors.M100;
        color = colors.white;
        break;
      default:
        str = index > 1000 ? index / 1000 + "K" : index;
        bgColor = colors.cerise;
        color = colors.black;
        break;
    }
    return {
      str: str,
      backgroundColor: bgColor,
      color: color
    };
  };

  handlePressItem(item, status) {
    this.props.navigation.push("UserEvent", { item: item, route: status });
  }

  render() {
    const { status, userID, pb } = this.state;
    if (this.state.isOwnProfile === null) {
      return <ActivityIndicator />;
    }
    const user = R.pathOr(
      getUser(),
      ["navigation", "state", "params", "user"],
      this.props
    );
    // var seen = [];
    // console.log("selected user ===> " + JSON.stringify(user, function(key, val) {
    //     if (val != null && typeof val == "object") {
    //         if (seen.indexOf(val) >= 0) {
    //             return;
    //         }
    //         seen.push(val);
    //     }
    //     return val;
    // }));
    const { uid, bio } = user;
    const name = R.pathOr("", ["displayName"], user);
    const country = R.pathOr("US", ["country"], user).split(" ")[
      R.pathOr("US", ["country"], user).split(" ").length - 1
    ];
    const countryFlagUri = `https://www.countryflags.io/${country}/shiny/64.png`;
    const profileUri = R.pathOr("", ["photoURL"], user);
    const followers = R.pathOr([], ["followers", uid], userStore);
    const followings = R.pathOr([], ["followings", uid], userStore);
    const numOfFollowers = followers.length;
    const numOfFollowings = followings.length;
    const achievements = R.pathOr([], ["achievements", uid], userStore);
    const podiums = R.filter(a => a.oveRank <= 3, achievements);
    const numOfPodiums = podiums.length;
    const numOfAchievements = achievements.length;
    const isAchievePrivacy = R.pathOr(0, ["achievePrivacy"], user);
    const isPbPrivacy = R.pathOr(0, ["pbPrivacy"], user);
    const isPodiumPrivacy = R.pathOr(0, ["podiumPrivacy"], user);
    const isFollowPrivacy = R.pathOr(0, ["followPrivacy"], user);
    const achievements_pb = R.filter(
      R.compose(R.not, R.isNil, R.prop("courseDistance")),
      achievements
    );
    const groups = R.groupBy(a => convert(a.courseDistance))(achievements_pb);
    let group_length = 0;
    Object.keys(groups).map(key => {
      group_length++;
    });
    const numOfPersonalBests = group_length;
    const numOfCalendar = 12;
    let following = "";
    let following_you = -1;
    if (!this.state.isOwnProfile) {
      following =
        userStore.followings[getUser().uid].findIndex(user => user === uid) !=
        -1
          ? "Following"
          : "Follow";
      this.state.stateFollow = following != "Follow";
      if (userStore.followings[uid] != null)
        following_you = userStore.followings[uid].findIndex(
          user => user === getUser().uid
        );
    }

    const tabs = [
      {
        key: "raceCalendar",
        labelBottom: translate("profile-tab-race-calendar"),
        labelTop: numOfCalendar,
        onPress: this.handleCalendarPress.bind(this)
      },
      {
        key: "achievements",
        labelBottom: translate("profile-tab-achievements"),
        labelTop: numOfAchievements,
        onPress: this.handleAchievementsPress.bind(this)
      },
      {
        key: "personalBests",
        labelBottom: translate("profile-tab-personal-bests"),
        labelTop: numOfPersonalBests,
        onPress: this.handlePersonalBestPress.bind(this)
      },
      {
        key: "podiums",
        labelBottom: translate("profile-tab-podiums"),
        labelTop: numOfPodiums,
        onPress: this.handlePodiumsPress.bind(this)
      },
      {
        key: "followers",
        labelBottom: translate("profile-tab-followers"),
        labelTop: numOfFollowers,
        backgroundColor: "#005872",
        onPress: this.handleFollowersPress.bind(this)
      },
      {
        key: "followings",
        labelBottom: translate("profile-tab-followings"),
        labelTop: numOfFollowings,
        backgroundColor: "#005872",
        onPress: this.handleFollowingsPress.bind(this)
      }
    ];
    var optionArray = ["Block", "Report", "Share Profile", "Cancel"];
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.backgroundImg}>
          {/* <ImageBackground style={styles.backgroundImg}> */}
          <NavigationEvents
            onDidFocus={this.initValues.bind(this)}
            onDidBlur={this.blurValues.bind(this)}
          />
          <View style={styles.background}>
            <Image
              source={require("./../../assets/profile.png")}
              style={styles.markColor}
            />
            {following === "" ? (
              // <TouchableOpacity
              //   style={styles.alarmButton}
              //   onPress={() => {
              //     this.handleNotification();
              //   }}
              // >
              //   <FontAwesome name="bell" size={25} color={colors.white} />
              // </TouchableOpacity>
              <View />
            ) : (
              <View style={styles.backBtnStyle}>
                <Ionicons
                  name="md-arrow-back"
                  color={colors.white}
                  style={{ fontSize: 20 }}
                  onPress={() => this.props.navigation.navigate("Search")}
                />
                <Text
                  style={styles.backTxtStyle}
                  onPress={() => this.props.navigation.navigate("Search")}
                >
                  Back
                </Text>
                <View style={{ justifyContent: "center", width: "75%" }}>
                  <Text style={styles.titleStyle}>Explore</Text>
                </View>
              </View>
            )}
            {following === "" ? (
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  const pushAction = StackActions.push({
                    routeName: "Settings",
                    params: {
                      navigator: this.props.navigation
                    }
                  });
                  return this.props.navigation.dispatch(pushAction);
                }}
              >
                <FontAwesome name="ellipsis-h" size={25} color={colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={this.showActionSheet}
              >
                {/* // TODO: hide the ... menu until it is implemented
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={40}
                color={colors.white}
              /> */}
              </TouchableOpacity>
            )}

            <Image
              source={{ uri: countryFlagUri }}
              style={[styles.flagStyle, { height: following === "" ? 39 : 20 }]}
            />
            <Image
              style={
                following === ""
                  ? styles.profileImage
                  : styles.profileImageFollowing
              }
              source={
                profileUri
                  ? { uri: profileUri }
                  : require("../../assets/profile-blank.png")
              }
            />
          </View>
          <View style={{ padding: 20, flexDirection: "column", marginTop: 50 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.bio}>{bio}</Text>
          </View>
          <View
            style={
              following === ""
                ? styles.profileView
                : styles.profileViewFollowing
            }
          >
            {/* <Image source={{ uri: countryFlagUri }} style={styles.flagStyle} /> */}
            {!this.state.isOwnProfile && (
              <TouchableOpacity
                style={styles.followBtnStyle}
                onPress={() => this.handleFollowPress(following, uid)}
              >
                <Text
                  style={{ color: colors.white, fontFamily: "PoppinsBold" }}
                >
                  {following}
                </Text>
              </TouchableOpacity>
            )}
            {following_you != -1 ? (
              <View style={styles.rectView}>
                <Text style={styles.checkedTxt}>Follows you</Text>
              </View>
            ) : null}
            <View style={styles.tabWrapper}>
              <View style={styles.tabWrapperContent}>
                {tabs[0].labelTop == 12 ? null : ( // TODO: race calendar is not implemented.
                  <TouchableOpacity
                    key={tabs[0].key}
                    onPress={tabs[0].onPress}
                    backgroundColor={tabs[0].backgroundColor}
                    style={styles.profileTab}
                  >
                    <Text style={styles.numberTab}>{tabs[0].labelTop}</Text>
                    <Text style={styles.titleTab}>{tabs[0].labelBottom}</Text>
                  </TouchableOpacity>
                )}
                {following == "Following" ||
                isAchievePrivacy == 0 ||
                this.state.isOwnProfile ? (
                  <TouchableOpacity
                    key={tabs[1].key}
                    onPress={tabs[1].onPress}
                    backgroundColor={tabs[1].backgroundColor}
                    style={
                      (styles.profileTab,
                      {
                        // borderColor: colors.whiteThree,
                        // borderLeftWidth: 1,
                        // borderRightWidth: 1
                      })
                    }
                  >
                    <Text style={styles.numberTab}>{tabs[1].labelTop}</Text>
                    <Text style={styles.titleTab}>{tabs[1].labelBottom}</Text>
                  </TouchableOpacity>
                ) : null}
                {following == "Following" ||
                isPbPrivacy == 0 ||
                this.state.isOwnProfile ? (
                  <TouchableOpacity
                    key={tabs[2].key}
                    onPress={tabs[2].onPress}
                    backgroundColor={tabs[2].backgroundColor}
                    style={styles.profileTab}
                  >
                    <Text style={styles.numberTab}>{tabs[2].labelTop}</Text>
                    <Text style={styles.titleTab}>{tabs[2].labelBottom}</Text>
                  </TouchableOpacity>
                ) : null}
                {following == "Following" ||
                isPodiumPrivacy == 0 ||
                this.state.isOwnProfile ? (
                  tabs[3].labelTop == 0 ? null : (
                    <TouchableOpacity
                      key={tabs[3].key}
                      onPress={tabs[3].onPress}
                      backgroundColor={tabs[3].backgroundColor}
                      style={
                        (styles.profileTab,
                        {
                          paddingLeft: 10,
                          paddingRight: 10
                          // borderColor: colors.whiteThree,
                          // borderRightWidth: 1,
                          // borderTopWidth: 1
                        })
                      }
                    >
                      <Text style={styles.numberTab}>{tabs[3].labelTop}</Text>
                      <Text style={styles.titleTab}>{tabs[3].labelBottom}</Text>
                    </TouchableOpacity>
                  )
                ) : null}
                {following == "Following" ||
                isFollowPrivacy == 0 ||
                this.state.isOwnProfile ? (
                  <TouchableOpacity
                    key={tabs[4].key}
                    onPress={tabs[4].onPress}
                    backgroundColor={tabs[4].backgroundColor}
                    style={
                      (styles.profileTab,
                      {
                        paddingLeft: 10,
                        paddingRight: 10
                        // borderColor: colors.whiteThree,
                        // borderTopWidth: 1,
                        // borderRightWidth: 1
                      })
                    }
                  >
                    <Text style={styles.numberTab}>{tabs[4].labelTop}</Text>
                    <Text style={styles.titleTab}>{tabs[4].labelBottom}</Text>
                  </TouchableOpacity>
                ) : null}
                {following == "Following" ||
                isFollowPrivacy == 0 ||
                this.state.isOwnProfile ? (
                  <TouchableOpacity
                    key={tabs[5].key}
                    onPress={tabs[5].onPress}
                    backgroundColor={tabs[5].backgroundColor}
                    style={
                      (styles.profileTab,
                      {
                        paddingLeft: 10,
                        paddingRight: 10
                        // borderColor: colors.whiteThree,
                        // borderTopWidth: 1
                      })
                    }
                  >
                    <Text style={styles.numberTab}>{tabs[5].labelTop}</Text>
                    <Text style={styles.titleTab}>{tabs[5].labelBottom}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.runsContainer}>
            <View style={{ paddingVertical: 5 }} />
            <Text style={styles.titleTxt}>Personal Best</Text>
            {pb && pb.length > 0 ? (
              pb.map((item, index) => (
                <View style={styles.itemContainer} key={index}>
                  <View
                    style={[
                      styles.distanceContainer,
                      {
                        backgroundColor: this.convertDiatanceToString(
                          item.value.distance
                        ).backgroundColor
                      }
                    ]}
                  >
                    <Text style={styles.itemTitle}>{item.key}</Text>
                  </View>
                  <View style={styles.itemContent}>
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        width: "80%"
                      }}
                    >
                      <Text
                        style={[
                          styles.itemTitle,
                          { fontWeight: "bold", fontSize: 14 }
                        ]}
                      >
                        {this.convertRealDateTime(
                          new Date(item.value.eventDate) / 1000
                        )}
                      </Text>
                      <Text style={styles.itemTitle}>
                        {item.value.eventName}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.itemTitle,
                        { fontSize: 14, fontWeight: "bold" }
                      ]}
                    >
                      {item.value.pace}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.shareBtn}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: colors.mainPurple, fontWeight: "bold" }
                      ]}
                    >
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={[styles.itemTitle, { paddingHorizontal: 20 }]}>
                No Data
              </Text>
            )}
          </View>
          <View style={styles.runsContainer}>
            <View style={{ paddingVertical: 5 }} />
            <Text style={styles.titleTxt}>Runs</Text>
            {status &&
              status.length > 0 &&
              status.map((item, index) => (
                <View style={styles.itemContainer} key={index}>
                  <View
                    style={[
                      styles.distanceContainer,
                      {
                        backgroundColor: this.convertDiatanceToString(
                          item.distance
                        ).backgroundColor
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemTitle,
                        {
                          fontWeight: "bold",
                          fontSize: 12,
                          color: this.convertDiatanceToString(item.distance)
                            .color
                        }
                      ]}
                    >
                      {this.convertDiatanceToString(item.distance).str}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() =>
                      this.handlePressItem(
                        item,
                        userID == item.uid ? "update" : "view"
                      )
                    }
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start"
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={[
                            styles.itemTitle,
                            { fontWeight: "bold", fontSize: 14 }
                          ]}
                        >
                          {item.name}
                        </Text>
                        {userID == item.uid && (
                          <Text style={styles.statusTxt}>Host</Text>
                        )}
                        <Text style={styles.statusTxt}>{item.status}</Text>
                      </View>
                      <Text style={styles.itemTitle}>
                        {this.convertRealDateTime(item.datetime.seconds)}
                      </Text>
                    </View>
                    {/* <Text style={[styles.itemTitle, {fontSize: 11}]}>{this.splitString(item.address)}</Text> */}
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "center",
                        width: "30%"
                      }}
                    >
                      <Image
                        style={{ width: 30, height: 30, borderRadius: 15 }}
                        source={
                          item.user.photoURL
                            ? { uri: item.user.photoURL }
                            : require("../../assets/profile-blank.png")
                        }
                      />
                      <Text style={[styles.itemTitle, { fontSize: 11 }]}>
                        {item.user.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareBtn}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: colors.mainPurple, fontWeight: "bold" }
                      ]}
                    >
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            {status == [] ||
              (status.length == 0 && (
                <Text style={[styles.itemTitle, { paddingHorizontal: 20 }]}>
                  No runs
                </Text>
              ))}
          </View>
          <ActionSheet
            ref={item => (this.ActionSheet = item)}
            options={optionArray}
            cancelButtonIndex={3}
            destructiveButtonIndex={0}
            onPress={index => {
              Alert.alert(optionArray[index]);
            }}
          />
          {/* </ImageBackground> */}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    alignItems: "center",
    justifyContent: "flex-end"
  },
  backgroundImg: {
    width: "100%",
    flex: 1,
    backgroundColor: colors.paleGray
  },
  markColor: {
    width: "100%",
    height: 140
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    letterSpacing: 0,
    color: colors.white,
    marginLeft: 8
  },
  backBtnStyle: {
    flexDirection: "row",
    color: colors.white,
    position: "absolute",
    top: 16,
    left: 12,
    alignItems: "center",
    height: 60
  },
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingTop: Constants.statusBarHeight, //5
    paddingBottom: 5
  },
  alarmButton: {
    paddingTop: Constants.statusBarHeight,
    color: colors.white,
    position: "absolute",
    top: 2,
    left: 12
  },
  settingsButton: {
    paddingTop: Constants.statusBarHeight,
    color: colors.white,
    position: "absolute",
    top: 2,
    right: 12,
    width: 35,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  profileImage: {
    height: 135,
    width: 135,
    borderRadius: 135 / 2,
    position: "absolute",
    top: 70,
    zIndex: 1,
    left: 20
  },
  profileImageFollowing: {
    height: 120,
    width: 120,
    borderRadius: 120 / 2,
    position: "absolute",
    top: 70,
    zIndex: 1,
    left: 20
  },
  followBtnStyle: {
    flexDirection: "row",
    width: 104,
    height: 41,
    borderRadius: 4,
    backgroundColor: colors.dusk,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8
  },
  rectView: {
    width: 82,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.whiteThree,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8
  },
  checkedTxt: {
    opacity: 0.4,
    fontFamily: "PoppinsBold",
    fontSize: 10,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  },
  profileView: {
    backgroundColor: colors.deepPaleGray,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    // height: "64.5%",
    width: "100%",
    // paddingTop: Constants.statusBarHeight //50
    paddingVertical: 30
  },
  checkTxt: {
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0
  },
  profileViewFollowing: {
    backgroundColor: colors.deepPaleGray,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    // height: "71.5%",
    width: "100%",
    paddingTop: Constants.statusBarHeight //50
  },
  name: {
    fontFamily: "PoppinsBold",
    fontSize: 24,
    fontWeight: "500",
    color: colors.dusk
  },
  country: {
    fontSize: 12,
    textAlign: "center"
  },
  tabWrapper: {
    flexDirection: "column",
    // flexWrap: "wrap",
    flexGrow: 5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 21.5,
    marginRight: 21.5
  },
  tabWrapperContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    // flexGrow: 5,
    justifyContent: "center",
    alignContent: "center",
    marginLeft: 21.5,
    marginRight: 21.5
  },
  profileTab: {
    color: colors.dusk,
    height: 80,
    alignItems: "center",
    // borderWidth: 1,
    borderColor: colors.mediumGrey
  },
  numberTab: {
    color: colors.dusk,
    fontSize: 30,
    textAlign: "center",
    fontWeight: "700",
    fontFamily: "PoppinsBold"
  },
  titleTab: {
    color: colors.dusk,
    fontSize: 11,
    paddingLeft: 12.5,
    paddingRight: 12.5,
    fontFamily: "PoppinsBold"
  },
  titleStyle: {
    color: colors.white,
    fontFamily: "PoppinsBold",
    fontSize: 20,
    letterSpacing: 0,
    textAlign: "center",
    // marginLeft: 8
    fontStyle: "normal"
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    letterSpacing: 0,
    color: colors.white,
    marginLeft: 8
  },
  bio: {
    marginTop: 5,
    fontSize: 16,
    textAlign: "center",
    color: colors.mediumGrey,
    fontFamily: "PoppinsBold"
  },
  flagStyle: {
    marginTop: 5,
    width: 30,
    height: 39,
    justifyContent: "center",
    position: "absolute",
    top: 170,
    left: 120,
    zIndex: 99
  },
  runsContainer: {
    width: "100%",
    borderTopColor: colors.inactiveText,
    borderTopWidth: 1,
    marginVertical: 20
  },
  itemTitle: {
    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: colors.dusk
  },
  statusTxt: {
    color: colors.paleGray,
    marginLeft: 5,
    backgroundColor: colors.dusk,
    opacity: 0.4,
    fontSize: 10,
    borderRadius: 10,
    overflow: "hidden",
    height: 15,
    fontFamily: "PoppinsBold",
    paddingHorizontal: 3
  },
  titleTxt: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: colors.dusk,
    position: "absolute",
    // left: 20,
    top: -10,
    backgroundColor: colors.paleGray,
    paddingRight: 10,
    paddingLeft: 20,
    marginBottom: 10
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    backgroundColor: colors.deepPaleGray,
    marginTop: 6
  },
  distanceContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: 50
  },
  itemContent: {
    paddingHorizontal: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    width: "70%",
    alignItems: "center"
  },
  shareBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: "15%",
    borderLeftColor: colors.paleGray,
    borderLeftWidth: 6,
    height: "100%"
  }
});
