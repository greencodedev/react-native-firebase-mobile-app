import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground
} from "react-native";
import * as R from "ramda";
import moment from "moment";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import { StackActions } from "react-navigation";
import { withLoading } from "../HOC";
import translate from "@utils/translate";
import * as colors from "../constants/colors";
import { userStore } from "../stores";
import { convert, calculateTimestamp, calculateTime, calPace } from "../utils";
import { SliderBox } from "react-native-image-slider-box";
import Constants from "expo-constants";

const IconWithLabel = props => (
  <View style={{ alignItems: "center" }}>
    <props.Icon name={props.name} size={props.size} color={props.color} />
    {props.valueTotal ? (
      <Text style={props.valueStyle}>
        {props.value} of {props.valueTotal}
      </Text>
    ) : (
      <Text style={props.valueStyle}>{props.value}</Text>
    )}
    <Text style={props.lblStyle}>{props.label}</Text>
  </View>
);

const Slider = withLoading(SliderBox)(
  "images",
  "Please wait for the photo to be uploaded."
);

const bgImages = [
  require("../../assets/background/background-1.jpg"),
  require("../../assets/background/background-2.jpg"),
  require("../../assets/background/background-3.jpg"),
  require("../../assets/background/background-4.jpg"),
  require("../../assets/background/background-5.jpg"),
  require("../../assets/background/background-6.jpg"),
  require("../../assets/background/background-7.jpg"),
  require("../../assets/background/background-8.jpg"),
  require("../../assets/background/background-9.jpg"),
  require("../../assets/background/background-10.jpg"),
  require("../../assets/background/background-11.jpg"),
  require("../../assets/background/background-12.jpg")
];

export default class AchievementScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  state = {
    edit: false,
    loading: false,
    randomID: 0
  };
  onEdit() {
    const uid = R.pathOr(
      null,
      ["state", "params", "uid"],
      this.props.navigation
    );
    const id = R.pathOr(
      null,
      ["state", "params", "achievement"],
      this.props.navigation
    );
    const achievement = userStore.achievements[uid].find(a => a.id === id);
    const pushAction = StackActions.push({
      routeName: "EditAchievement",
      params: {
        navigator: this.props.navigation,
        achievement: id,
        uid,
        type: "edit"
      }
    });
    this.props.navigation.dispatch(pushAction);
  }
  componentDidMount() {
    this.state.randomID = Math.floor(Math.random() * 10);
  }
  render() {
    const uid = R.pathOr(
      null,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const id = R.pathOr(
      null,
      ["navigation", "state", "params", "achievement"],
      this.props
    );
    let achievement = userStore.achievements[uid].find(a => a.id === id);
    if (typeof achievement === "undefined") achievement = {};
    const user = userStore.users[uid];
    const userImageUri = R.pathOr("", ["photoURL"], user);
    const {
      eventName,
      eventDate,
      courseDistance,
      result,
      report = "Such a wonderful experience! :)",
      ageRank,
      ageRankTotal,
      genRank,
      genRankTotal,
      oveRank,
      oveRankTotal
    } = achievement;
    const date = moment(eventDate);
    const displayDate = date.format("MMMM Do YYYY, h:mm:ss a");
    const displayDistance = convert(courseDistance);
    const displayPace = calPace(result, courseDistance); //calculateTime(calculateTimestamp(result)/meter2mile(courseDistance));
    const displayTime = result;
    const displayOverRoll = oveRank;
    const displayOverRollTotal = oveRankTotal;
    const displayAgeRank = ageRank;
    const displayAgeRankTotal = ageRankTotal;
    const displayGenderRank = genRank;
    const displayGenderRankTotal = genRankTotal;
    const displayReport = report;
    // console.log("result, courseDistance, calculateTimestamp(result), displayPace ", result, courseDistance, calculateTimestamp(result), displayPace);

    console.log("random id => ", this.state.randomID);
    return (
      <ScrollView style={styles.container}>
        <Spinner
          visible={R.pathOr(
            false,
            ["navigation", "state", "params", "loading"],
            this.props
          )}
          textContent={"Loading..."}
          textStyle={styles.spinnerTextStyle}
        />
        {achievement.images ? (
          <Slider
            loading={this.state.loading}
            images={achievement.images}
            sliderBoxHeight={600}
            dotColor={colors.dusk}
            onCurrentImagePressed={index => {
              const pushAction = StackActions.push({
                routeName: "AchievementPhoto",
                params: {
                  uri: achievement.images[index]
                }
              });
              this.props.navigation.dispatch(pushAction);
            }}
          />
        ) : (
          <ImageBackground
            style={styles.bgImage}
            source={bgImages[this.state.randomID]}
          />
        )}
        <View style={styles.titleStyle}>
          <TouchableOpacity
            style={styles.backBtnStyle}
            onPress={() => this.props.navigation.goBack()}
          >
            <Ionicons
              name="md-arrow-back"
              color={colors.login_welcome}
              style={{ fontSize: 20 }}
            />
            <Text style={styles.backTxtStyle}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={this.onEdit.bind(this)}
          >
            <Text style={styles.EditTxtStyle}>Edit</Text>
          </TouchableOpacity>
        </View>
        {/* { achievement.images ? ( */}
        <View style={styles.existImage}>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "flex-end"
            }}
          >
            <View>
              <Text style={styles.blueTitle}>Distance: {displayDistance}</Text>
            </View>
            <View>
              <Text style={styles.logDetail}>Time: {displayTime}</Text>
            </View>
            <View>
              <Text style={styles.lastTitle}>Pace: {displayPace} min/mile</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {achievement.images ? (
                <Text style={styles.slideText}>
                  {" "}
                  {achievement.images.length} Photos
                </Text>
              ) : (
                <Text style={styles.slideText}>
                  {" "}
                  Edit to add your own race photos
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* ) : (
          <View style={styles.overviewArea}>
            <View style={styles.listContent}>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.italicTitle}>Distance</Text>
                <Text style={styles.itemContent}>{ displayDistance }</Text>
              </View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.italicTitle}>Duration</Text>
                <Text style={styles.itemContent}>{ displayTime }</Text>
              </View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.italicTitle}>Overall</Text>
                <Text style={styles.itemContent}>{ displayOverRoll + " of " + displayOverRollTotal}</Text>
              </View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.italicTitle}>Gender</Text>
                <Text style={styles.itemContent}>{ displayGenderRank + " of " + displayGenderRankTotal }</Text>
              </View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.italicTitle}>Age Group</Text>
                <Text style={styles.itemContent}>{ displayAgeRank + " of " + displayAgeRankTotal }</Text>
              </View>
            </View>
          </View>
        )} */}
        <View style={styles.mainContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.eventTitleContainer}>
              <Text numberOfLines={3} style={styles.eventName}>
                {eventName}
              </Text>
              <Text style={styles.eventDate}>{displayDate}</Text>
            </View>
          </View>
          <View style={styles.overviewContainer}>
            <IconWithLabel
              Icon={Ionicons}
              name="md-pin"
              size={30}
              color={colors.mainPurple}
              valueStyle={styles.iconLabel}
              value={displayDistance}
              label={translate("distance")}
              lblStyle={styles.lblStyle}
            />
            <IconWithLabel
              Icon={Ionicons}
              name="md-alarm"
              size={30}
              color={colors.mainPurple}
              valueStyle={styles.iconLabel}
              value={displayTime}
              label={translate("duration")}
              lblStyle={styles.lblStyle}
            />
            <IconWithLabel
              Icon={MaterialIcons}
              name="list"
              size={30}
              color={colors.mainPurple}
              valueStyle={styles.iconLabel}
              value={displayOverRoll}
              valueTotal={displayOverRollTotal}
              label={translate("overall")}
              lblStyle={styles.lblStyle}
            />
            <IconWithLabel
              Icon={Ionicons}
              name="ios-people"
              size={30}
              color={colors.mainPurple}
              valueStyle={styles.iconLabel}
              value={displayGenderRank}
              valueTotal={displayGenderRankTotal}
              label={translate("gender")}
              lblStyle={styles.lblStyle}
            />
            <IconWithLabel
              Icon={MaterialIcons}
              name="face"
              size={30}
              color={colors.mainPurple}
              valueStyle={styles.iconLabel}
              value={displayAgeRank}
              valueTotal={displayAgeRankTotal}
              label={translate("agegroup")}
              lblStyle={styles.lblStyle}
            />
          </View>
          <View style={styles.reportContainer}>
            <Text
              style={{
                marginBottom: 10,
                fontFamily: "PoppinsBold",
                color: colors.mediumGrey,
                width: "100%",
                textAlign: "center"
              }}
            >
              {translate("race-report")}
            </Text>
            <Text style={styles.report}>{displayReport}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const size = Dimensions.get("window").width / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.login_welcome
  },
  mainContainer: {
    flex: 1,
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    borderBottomColor: colors.whiteThree,
    borderBottomWidth: 1
  },
  eventTitleContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: "column",
    flex: 1
  },
  eventName: {
    color: colors.mainPurple,
    fontFamily: "PoppinsBold",
    fontSize: 20
  },
  eventDate: {
    color: colors.mediumGrey,
    fontFamily: "PoppinsBold",
    fontSize: 14
  },
  reportContainer: {
    padding: 10
  },
  overviewContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    justifyContent: "space-around",
    borderBottomColor: colors.whiteThree,
    borderBottomWidth: 1
  },
  iconLabel: {
    color: colors.dusk,
    fontSize: 14,
    fontFamily: "PoppinsBold"
  },
  itemContainer: {
    width: size,
    height: size
  },
  item: {
    flex: 1,
    backgroundColor: "black"
  },
  titleStyle: {
    position: "absolute",
    flexDirection: "row",
    width: "100%",
    marginTop: Constants.statusBarHeight
  },
  backBtnStyle: {
    flexDirection: "row",
    color: colors.login_welcome,
    marginTop: 3,
    alignContent: "center",
    alignItems: "center",
    left: 16
    // paddingTop: Constants.statusBarHeight
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.login_welcome,
    marginLeft: 8
  },
  EditTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.login_welcome
  },
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    color: colors.login_welcome
  },
  bgImage: {
    width: "100%",
    height: 600
  },
  editBtn: {
    marginTop: 3,
    right: 16,
    position: "absolute"
    // paddingTop: Constants.statusBarHeight
  },
  lblStyle: {
    fontSize: 14,
    color: colors.mediumGrey,
    fontStyle: "italic",
    fontFamily: "PoppinsBold",
    opacity: 0.6
  },
  existImage: {
    position: "absolute",
    paddingLeft: 16,
    paddingRight: 16,
    top: 400,
    width: "100%",
    flex: 1
  },
  logDetail: {
    backgroundColor: colors.mediumGrey,
    opacity: 0.9,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5,
    paddingTop: 5,
    fontFamily: "PoppinsBold",
    marginBottom: 5,
    fontSize: 18,
    color: colors.white,
    alignSelf: "flex-start"
  },
  blueTitle: {
    backgroundColor: "#0077CF",
    alignSelf: "flex-start",
    fontFamily: "PoppinsBold",
    // width: 'auto',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5,
    paddingTop: 5,
    fontSize: 18,
    marginBottom: 5,
    color: colors.white
  },
  lastTitle: {
    backgroundColor: "#0077CF",
    alignSelf: "flex-start",
    fontFamily: "PoppinsBold",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5,
    paddingTop: 5,
    fontSize: 18,
    marginBottom: 40,
    color: colors.white
  },
  slideText: {
    fontSize: 16,
    color: colors.white
  },
  overviewArea: {
    marginTop: -100,
    marginBottom: 50,
    paddingLeft: 16,
    paddingRight: 16
  },
  listContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  italicTitle: {
    textAlign: "center",
    color: colors.white,
    opacity: 0.6,
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 10
  },
  itemContent: {
    textAlign: "center",
    color: colors.white,
    fontSize: 17
  }
});
