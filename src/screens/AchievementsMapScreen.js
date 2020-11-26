import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  ScrollView,
  Share
} from "react-native";
import * as R from "ramda";
import SwitchSelector from "react-native-switch-selector";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { StackActions } from "react-navigation";
import MapView from "react-native-maps";
import moment from "moment";
import { BottomSheet } from "react-native-btr";
import { convert } from "@utils";
const { Marker } = MapView;

import { getUser } from "@logics/auth";
import { AchievementFilterView } from "../components";
import { userStore } from "../stores";
import * as colors from "../constants/colors";
import translate from "@utils/translate";
import { observer } from "mobx-react/native";
import Constants from "expo-constants";
import { captureRef } from "react-native-view-shot";

const extractYear = str => {
  return str.substring(0, 4);
};

@observer
export default class AchievementsMapScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: 0,
      temp_year: 0,
      selectedItem: "",
      type: "",
      seeResult: 1,
      searchItems: [
        { title: "distance", items: ["All"] },
        {
          title: "type",
          items: ["All", "Run", "TrailRun", "Relay", "stair"]
        },
        { title: "date", items: ["All"] }
      ],
      seleDistance: "All",
      seleType: "All",
      seleDate: 0,
      visible: false,
      additional_filter: false
    };
  }
  getSelectedSwitchValue(value) {
    this.setState({ selectedItem: value });
    this.props.navigation.navigate(value, { type: this.state.type });
  }

  setSelectDistance(param) {
    console.log("selected distance ===> ", param);
    if (this.state.year == 1) this.state.year = 0;
    this.setState({ seleDistance: param });
  }

  setSelectDate(param) {
    console.log("selected year ==>", param);
    this.setState({ year: param, seleDate: param });
  }

  renderSearchDistance = ({ item }) => {
    const selected = this.state.seleDistance === item;
    console.log("selected item => ", this.state.seleDistance);
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
    console.log("item of date ==> ", item);
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
  _shareSocial = async () => {
    let message = "https://itunes.apple.com/us/app/OnRun";
    let title = "Share";
    try {
      await captureRef(this._container, {
        format: "png"
      }).then(result => {
        Share.share({
          title: title,
          message: message,
          url: result
        });
      });
    } catch (error) {
      console.log(error);
    }
  };
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
  // TODO: variables races, uid, ... have been calculated twice in the file
  getZoomRegion = () => {
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    let races = R.pathOr([], ["achievements", uid], userStore);
    let longs = Object.keys(races).map(
      (key, index) => races[key].location.longitude
    );
    let lonMax = Math.max(...longs);
    let lonMin = Math.min(...longs);
    console.log("longs", ...longs);
    let lats = Object.keys(races).map(
      (key, index) => races[key].location.latitude
    );
    let latMax = Math.max(...lats);
    let latMin = Math.min(...lats);
    console.log("lats", ...lats);
    console.log(lonMax, lonMin, latMax, latMin);
    let initialRegion = Object.assign({}, this.state.initialRegion);
    initialRegion["latitude"] = (latMax + latMin) / 2.0;
    initialRegion["longitude"] = (lonMax + lonMin) / 2.0;
    initialRegion["latitudeDelta"] =
      latMax - latMin > 0.075
        ? latMax - latMin + 0.15 * (latMax - latMin)
        : 0.075;
    initialRegion["longitudeDelta"] =
      lonMax - lonMin > 0.075
        ? lonMax - lonMin + 0.15 * (lonMax - lonMin)
        : 0.075;
    console.log("initialRegion: ", initialRegion);
    this.mapView.animateToRegion(initialRegion, 2000);
  };

  componentDidMount() {
    // this.getZoomRegion();
  }

  render() {
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
      achievements = R.filter(a => a.oveRank <= 3, achievements);
    }

    const years = R.uniq(achievements.map(e => moment(e.eventDate).year()));
    let races =
      this.state.year == 0 || this.state.year == 1
        ? achievements
        : R.filter(filter, achievements);

    // let groupsForDist = R.groupBy(a => convert(a.courseDistance))(achievements);
    let groupsForDist = R.groupBy(a => convert(a.courseDistance))(races);

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

    return (
      <View
        collapsable={false}
        ref={view => {
          this._container = view;
        }}
        style={styles.containerStyle}
      >
        <View style={{ height: "22%" }}>
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
              initial={1}
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
        </View>
        <View style={styles.map}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            onPress={e => console.log(e.nativeEvent.coordinate)}
            zoomEnabled={true}
            ref={ref => (this.mapView = ref)}
            // initialRegion={this.state.initialRegion}
          >
            {Object.keys(races).map((key, index) => (
              <React.Fragment key={index}>
                {races[key].location && (
                  <Marker
                    key={index}
                    coordinate={{ ...races[key].location }}
                    onPress={() => this.handleAchievementPress(races[key])}
                  />
                )}
              </React.Fragment>
            ))}
          </MapView>
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
                      seleDate: 0,
                      seleType: "All"
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
      </View>
    );
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

  handleChangeYear(year) {
    if (year == 1) {
      this._toggleBotttomFilterView();
    } else {
      this.setState({ year });
      this.state.searchItems[0].items = ["All"];
    }
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 16,
    marginRight: 16,
    paddingTop: Constants.statusBarHeight
  },
  map: {
    backgroundColor: "#FFFFFF",
    height: "78%",
    marginLeft: -16,
    marginRight: -16
  },
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingTop: 5,
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
  switchSelectorStyle: {
    width: "40%",
    fontSize: 13,
    fontWeight: "600",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10
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
    paddingTop: 12,
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
  backBtnStyle: {
    flexDirection: "row",
    alignItems: "center",
    width: "10%",
    justifyContent: "center"
  },
  centerPosition: {
    flexDirection: "row",
    justifyContent: "center"
  }
});
