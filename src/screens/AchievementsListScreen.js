import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Share,
  ActivityIndicator
} from "react-native";
import { observer } from "mobx-react/native";
import * as R from "ramda";
import { StackActions } from "react-navigation";
import moment from "moment";
import SwitchSelector from "react-native-switch-selector";
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import * as Print from "expo-print";

import { userStore } from "@stores";
import {
  getUser,
  updateUserPushToken,
  updateUserNotification
} from "@logics/auth";
import * as colors from "@constants/colors";
import { RacesResultsList, AchievementFilterView } from "../components";
import { BottomSheet } from "react-native-btr";
import { convert } from "@utils";
import translate from "@utils/translate";
import { captureRef } from "react-native-view-shot";
import * as Expo from "expo";
import { withLoading } from "../HOC";
// import { notificationSettings} from "../context/settings";
import { uploadPDFForAchievement } from "../logics/data-logic";
import Constants from "expo-constants";

const extractYear = str => {
  return str.substring(0, 4);
};

@observer
export default class App extends Component {
  state = {
    year: 0,
    temp_year: 0,
    selectedItem: "",
    type: "",
    seeResult: 1,
    searchItems: [
      { title: "distance", items: ["All"] },
      { title: "type", items: ["All", "Run", "TrailRun", "Relay", "stair"] },
      { title: "date", items: ["All"] }
    ],
    seleDistance: "All",
    seleType: "All",
    seleDate: 0,
    visible: false,
    additional_filter: false,
    loading: false,
    loadingShare: false,
    filePath: "",
    notification: ""
  };
  getSelectedSwitchValue(value) {
    this.setState({ selectedItem: value });
    this.props.navigation.navigate(value, { type: this.state.type });
  }
  setSelectDistance(param) {
    if (this.state.year == 1) this.state.year = 0;
    console.log("in AchieveList", param, convert(param));
    this.setState({ seleDistance: convert(param) });
  }
  setSelectDate(param) {
    this.setState({ year: param, seleDate: param });
  }
  renderSearchDistance = ({ item }) => {
    const selected = this.state.seleDistance === item;
    const stylesSearch = StyleSheet.create({
      container: {
        height: 52,
        width: "auto",
        borderStyle: "solid",
        borderColor: selected ? colors.dusk : colors.whiteThree,
        borderWidth: 1,
        backgroundColor: selected ? colors.dusk : colors.white,
        alignItems: "center",
        justifyContent: "center"
      },
      text: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 18,
        marginTop: 18,
        color: selected ? "#FFFFFF" : colors.mediumGrey,
        opacity: selected ? 1.0 : 0.42,
        fontSize: 12,
        letterSpacing: 0,
        fontWeight: "bold"
      }
    });

    return (
      <TouchableOpacity
        onPress={() => this.setSelectDistance(item)}
        style={stylesSearch.container}
      >
        <Text style={stylesSearch.text}>{item}</Text>
      </TouchableOpacity>
    );
  };
  renderSearchType = ({ item }) => {
    const selected = item === this.state.seleType;
    const styles = StyleSheet.create({
      container: {
        height: 52,
        width: "auto",
        borderStyle: "solid",
        borderColor: selected ? colors.dusk : colors.whiteThree,
        borderWidth: 1,
        backgroundColor: selected ? colors.dusk : colors.white,
        alignItems: "center",
        justifyContent: "center"
      },
      text: {
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 18,
        marginTop: 18,
        color: selected ? "#FFFFFF" : colors.mediumGrey,
        opacity: selected ? 1.0 : 0.42,
        fontSize: 12,
        letterSpacing: 0,
        fontWeight: "bold"
      }
    });

    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ seleType: item });
          console.log("selected type ==> " + this.state.seleType);
        }}
        style={styles.container}
      >
        <Text style={styles.text}>{item}</Text>
      </TouchableOpacity>
    );
  };
  renderSearchDate = ({ item }) => {
    if (item !== 1) {
      const selected = this.state.seleDate === item;
      const styles = StyleSheet.create({
        container: {
          height: 52,
          width: "auto",
          borderStyle: "solid",
          borderColor: selected ? colors.dusk : colors.whiteThree,
          borderWidth: 1,
          backgroundColor: selected ? colors.dusk : colors.white,
          alignItems: "center",
          justifyContent: "center"
        },
        text: {
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 18,
          marginTop: 18,
          color: selected ? "#FFFFFF" : colors.mediumGrey,
          opacity: selected ? 1.0 : 0.42,
          fontSize: 12,
          letterSpacing: 0,
          fontWeight: "bold"
        }
      });

      return (
        <TouchableOpacity
          onPress={() => this.setSelectDate(item)}
          style={styles.container}
        >
          <Text style={styles.text}>{item != 0 ? item : "All"}</Text>
        </TouchableOpacity>
      );
    }
  };
  _toggleBotttomFilterView = () => {
    this.setState({ visible: !this.state.visible });
  };
  _shareSocial = () => {
    this.setState({ loadingShare: true });
    this.makePDFAndShare();
  };
  addAchievement() {
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const pushAction = StackActions.push({
      routeName: "EditAchievement",
      params: {
        uid,
        type: "add"
      }
    });
    this.props.navigation.dispatch(pushAction);
  }
  goBackProfile() {
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const user = R.pathOr(
      "",
      ["navigation", "state", "params", "user"],
      this.props
    );
    const pushAction = StackActions.push({
      routeName: "Profile",
      params: {
        uid,
        user
      }
    });
    this.props.navigation.dispatch(pushAction);
  }
  showLoading() {
    this.setState({ loading: true });
  }
  dissmisLoading() {
    this.setState({ loading: false });
  }
  componentDidMount() {
    this.showLoading();
    this.setNotification();
  }
  setNotification = async () => {
    if (getUser().push_token == "" || getUser().push_token == null) {
      updateUserNotification({
        newfollowerNotification: 1,
        mentionedNotification: 1,
        postUserFollowingNotification: 1,
        postRaceFollowingNotification: 1,
        postClubFollowingNotification: 1,
        eventVicinityNotification: 1
      });
      this.registerForPushNotifications();
    }
  };
  registerForPushNotifications = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = status;

    if (status != "granted") {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus != "granted") {
      console.log("granted");
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();
    this.notificationSubscription = Notifications.addListener(
      this.handleNotification
    );
    console.log(token);
    updateUserPushToken(token);
  };

  handleNotification = notification => {
    this.setState({ notification });
  };

  makePDFAndShare() {
    this.createPDFAndShare();
  }
  makeHTMLForAchievement() {
    let html =
      '<div style="margin: 20px"><h1 style="text-align: center;"><strong>Achievement</strong></h1>';
    this.state.achievements.map((item, index) => {
      const {
        eventDate,
        courseDistance,
        distanceUnit,
        result,
        eventName
      } = item;
      const distance =
        courseDistance + (distanceUnit === "Kilometer" ? "km" : "mile");
      const month = moment.months()[moment(eventDate).month()];
      const day = moment(eventDate).date();
      html +=
        '<div><p style="font-size: 16px; font-weight: bold; color: #ed1b5d; ">' +
        eventName +
        "</p></div>";
      html +=
        '<p style="font-size: 12px; font-weight: bold; margin-bottom: 10px">' +
        month +
        " " +
        day +
        " " +
        result +
        " " +
        distance +
        "</p>";
    });
    html += "</div>";
    return html;
  }
  async createPDFAndShare() {
    let message = "https://itunes.apple.com/us/app/OnRun";
    let title = "Share";
    let htmlforPDF = this.makeHTMLForAchievement();
    let options = {
      //Content to print
      html: htmlforPDF,
      //File Name
      width: 612,
      height: 792,
      base64: false
    };
    let file = await Print.printToFileAsync(options);

    await uploadPDFForAchievement(getUser().uid, file.uri);
    console.log("url of firebase => ", getUser().pdfUrl);
    // this.setState({filePath: getUser().pdfUrl});
    try {
      Share.share({
        title: title,
        message: message + "    " + getUser().pdfUrl,
        url: getUser().pdfUrl
      });
    } catch (error) {
      console.log(error);
    }
    this.setState({ loadingShare: false });
  }
  render() {
    // TODO: These lines should be a separate function
    const List = withLoading(RacesResultsList)();
    let flagOtherUser = false;
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const {
      params: { type = "achievements" } = {}
    } = this.props.navigation.state;
    this.state.type = type;
    const filter = R.pipe(
      R.prop("eventDate"),
      extractYear,
      parseInt,
      R.equals(this.state.year)
    );
    let achievements = R.pathOr([], ["achievements", uid], userStore);
    if (type === "podium") {
      // R.filter();
      achievements = R.filter(a => a.oveRank <= 3, achievements);
    }
    const years = R.uniq(achievements.map(e => moment(e.eventDate).year()));
    let races =
      this.state.year == 0 || this.state.year == 1
        ? achievements
        : R.filter(filter, achievements);
    let groupsForDist = R.groupBy(a => convert(a.courseDistance))(achievements);
    if (this.state.searchItems[0].items.length == 1) {
      Object.keys(groupsForDist).map(key => {
        this.state.searchItems[0].items.push(key);
      });
    }
    if (this.state.seleDistance !== "All") {
      groupsForDist = R.groupBy(a => convert(a.courseDistance))(races);
      races =
        groupsForDist[this.state.seleDistance] === undefined
          ? []
          : groupsForDist[this.state.seleDistance];
    }
    if (uid != getUser().uid) {
      this.flagOtherUser = true;
    }
    this.state.loading = false;
    this.state.achievements = races;

    if (this.state.loadingShare) {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <Text style={{ fontSize: 16 }}>
            Please wait until your achievement is build and uploaded
          </Text>
        </View>
      );
    } else {
      return (
        <View
          collapsable={false}
          ref={view => {
            this._container = view;
          }}
          style={styles.container}
        >
          <View style={styles.headerStyle}>
            {this.flagOtherUser ? (
              <TouchableOpacity
                style={styles.backBtnStyle}
                onPress={this.goBackProfile.bind(this)}
              >
                <Ionicons
                  name="md-arrow-back"
                  color={colors.mainPurple}
                  style={{ fontSize: 25 }}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.backBtnStyle}
                onPress={this.addAchievement.bind(this)}
              >
                <MaterialIcons
                  name="add"
                  color={colors.mainPurple}
                  style={{ fontSize: 25 }}
                />
              </TouchableOpacity>
            )}
            <View style={{ justifyContent: "center", width: "80%" }}>
              <Text style={styles.titleStyle}>Achievement</Text>
            </View>
            <TouchableOpacity
              style={styles.backBtnStyle}
              onPress={this._shareSocial}
            >
              <MaterialIcons
                name="share"
                color={colors.mainPurple}
                style={{ fontSize: 25 }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.centerPosition}>
            <SwitchSelector
              initial={0}
              onPress={this.getSelectedSwitchValue.bind(this)}
              textColor={colors.mainPurple}
              selectedColor={colors.whiteTwo}
              buttonColor={colors.mainPurple}
              borderColor={colors.mainPurple}
              hasPadding
              options={[
                { label: "List", value: "AchievementsList" },
                { label: "Map", value: "AchievementsMap" }
              ]}
              animationDuration="100"
              style={styles.switchSelectorStyle}
              height={30}
            />
          </View>
          <View style={styles.centerPosition}>
            <AchievementFilterView
              data={years}
              init={this.state.year}
              onChangeItem={this.handleChangeYear.bind(this)}
              type="yearSelection"
            />
          </View>
          <List
            loading={this.state.loading}
            extraData={this.state}
            onPress={this.handleAchievementPress.bind(this)}
            data={races}
          />
          <BottomSheet
            visible={this.state.visible}
            onBackButtonPress={this._toggleBotttomFilterView}
            onBackdropPress={this._toggleBotttomFilterView}
          >
            <View
              style={this.state.seeResult ? styles.showView : styles.hideView}
            >
              <View style={styles.btnBorder}>
                <TouchableOpacity
                  style={{ justifyContent: "flex-start" }}
                  onPress={() =>
                    this.setState({
                      visible: false,
                      year: 0,
                      seleDistance: "All",
                      seleType: "All",
                      seleDate: 0
                    })
                  }
                >
                  <Text style={styles.resetBtnStyle}>
                    {translate("filter-reset")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "flex-end",
                    position: "absolute",
                    right: 16,
                    top: 12
                  }}
                  onPress={() =>
                    this.setState({ additional_filter: true, visible: false })
                  }
                >
                  <Text style={styles.resultBtnStyle}>
                    {translate("filter-apply")}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.searchItemsStyle}>
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.searchTitle}>
                    {translate(this.state.searchItems[0].title)}
                  </Text>
                  <FlatList
                    data={this.state.searchItems[0].items}
                    renderItem={this.renderSearchDistance}
                    keyExtractor={item => item + ""}
                    horizontal={true}
                    extraData={this.state}
                  />
                </View>
                {/* TODO: implement Type Filter
                    <View style={{marginBottom: 14}}>
                      <Text style={styles.searchTitle}>{translate(this.state.searchItems[1].title)}</Text>
                      <FlatList
                        data={this.state.searchItems[1].items}
                        renderItem={this.renderSearchType}
                        keyExtractor={item => item + ""}
                        horizontal={true}
                        extraData={this.state}
                      />
                    </View> */}
                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.searchTitle}>
                    {translate(this.state.searchItems[2].title)}
                  </Text>
                  <FlatList
                    data={years}
                    renderItem={this.renderSearchDate}
                    keyExtractor={item => item + ""}
                    horizontal={true}
                    extraData={this.state}
                  />
                </View>
              </ScrollView>
            </View>
          </BottomSheet>
        </View>
      );
    }
  }
  handleChangeYear(year) {
    if (year == 1) {
      this._toggleBotttomFilterView();
    } else {
      // this.setState({ year, seleDistance: 'All' });
      this.setState({ year });
      this.state.searchItems[0].items = ["All"];
    }
  }
  handleAchievementPress(achievement) {
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const navigation = R.pathOr(
      this.props.navigation,
      ["navigator"],
      this.props
    );
    const pushAction = StackActions.push({
      routeName: "Achievement",
      params: {
        achievement: achievement.id,
        uid
      }
    });
    navigation.dispatch(pushAction);
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: colors.white,
    paddingTop: Constants.statusBarHeight
  },
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 5
  },
  titleStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple,
    textAlign: "center"
  },
  backBtnStyle: {
    flexDirection: "row",
    alignItems: "center",
    width: "10%",
    justifyContent: "center"
  },
  switchSelectorStyle: {
    width: "40%",
    fontSize: 13,
    fontWeight: "600",
    height: 28,
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
    fontFamily: "PoppinsBold"
  },
  showView: {
    backgroundColor: colors.white,
    opacity: 1,
    display: "flex",
    position: "absolute",
    bottom: 0,
    height: "52%",
    width: "100%",
    zIndex: 1
  },
  hideView: {
    display: "none"
  },
  resetBtnStyle: {
    opacity: 1,
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey
  },
  resultBtnStyle: {
    opacity: 1,
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  },
  btnBorder: {
    flexDirection: "row",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteThree,
    paddingTop: Constants.statusBarHeight, //12
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16
  },
  searchItemsStyle: {
    margin: 16,
    marginBottom: 0,
    flex: 1,
    overflow: "scroll"
  },
  searchTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginTop: 8,
    marginBottom: 8
  },
  centerPosition: {
    flexDirection: "row",
    justifyContent: "center"
  }
});
