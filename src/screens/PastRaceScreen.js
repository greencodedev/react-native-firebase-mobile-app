import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Share,
  Switch,
  ActivityIndicator
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AppIntro from '../components/rn-falcon-app-intro';
import translate from "@utils/translate";
import { CheckBox } from "react-native-elements";
import * as colors from "@constants/colors";
import { getUser } from "../logics/auth";
import { saveUserAchievements, fetchAchievements } from "../logics/data-logic";
import { withLoading } from "../HOC";
import moment from "moment";
import axios from "axios";
import update from "immutability-helper";
import { observer } from "mobx-react/native";
import * as R from "ramda";
import { userStore } from "../stores";
import Constants from "expo-constants";
import { First, Second, Third, Forth, Fifth, Sixth, Seventh} from './../components/onBoarding/index';
const extractYear = str => {
  return str.substring(0, 4);
};
const extractMonth = str => {
  return str.substring(5, 7);
};
const addGroup = event => {
  return R.assoc("year", extractYear(R.prop("StartDateTime", event)), event);
};

const List = withLoading(FlatList)("data");
axios.interceptors.request.use(
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

@observer
export default class PastRaceScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loading: true,
      achievements: [],
      checked: true,
      year: 0,
      selectedItem: "",
      type: "",
      pickedCnt: 0,
      racerId: 0,
      flagAllBtnClick: false,
      boarding: false
    };
  }
  componentDidMount() {
    let temp = this.props.navigation.getParam("achievements");
    let racerID = this.props.navigation.getParam("racerId");
    this.setState({
      achievements: temp.map(item => ({ ...item, confirm: true })),
      pickedCnt: temp.length,
      loading: false,
      loaded: true,
      racerId: racerID
    });
  }

  renderItem = ({ item, index }) => {
    let isChecked = item.confirm;
    if (this.state.flagAllBtnClick) {
      isChecked = this.state.checked;
      this.state.achievements[index].confirm = isChecked;
    }
    let handleValueChange = value => {
      let cnt = this.state.pickedCnt;
      let flag = true;
      if (isChecked) cnt--;
      else cnt++;
      if (cnt == this.state.achievements.length) flag = true;
      else flag = false;
      this.setState({
        achievements: update(this.state.achievements, {
          [index]: { confirm: { $set: !isChecked } }
        }),
        flagAllBtnClick: false,
        checked: flag,
        pickedCnt: cnt
      });
    };
    const { StartDateTime, Time } = item;
    const isHead = R.contains(index, this.heads);
    const date = moment(StartDateTime);
    const displayDate = date.format("MMMM Do YYYY, h:mm a");
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemIndicatorContainer}>
          <Text style={styles.itemYearIndicator}>
            {isHead ? item.year : ""}
          </Text>
          {isHead ? <View style={styles.itemLineIndicator} /> : null}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.itemName}>{item.Name}</Text>
          <CheckBox
            center
            checkedIcon="stop"
            checked={isChecked}
            uncheckedColor={colors.mediumGrey}
            checkedColor={colors.dusk}
            onPress={handleValueChange}
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.itemText}>
            <MaterialIcons
              name="place"
              color={colors.mediumGrey}
              style={{ fontSize: 14 }}
            />
            {displayDate}
          </Text>
          <Text style={styles.itemText}>
            <MaterialIcons
              name="timer"
              color={colors.mediumGrey}
              style={{ fontSize: 14 }}
            />
            {Time}
          </Text>
        </View>
      </View>
    );
  };

  renderEmptyData = () => {
    return (
      <View style={{ padding: 10, alignItems: "center" }}>
        <Text>{translate("no-achievements")}</Text>
      </View>
    );
  };

  submit() {
    let detailAchievement;
    let allAchievement;
    this.setState({ loading: true, loaded: false, boarding: true });
    let myAchievements = [];
    this.state.achievements.forEach(element => {
      if (element.confirm) myAchievements.push(element);
    });
    if (myAchievements.length == 0) {
      this.setState({ boarding: false, loading: false, loaded: true });
      this.skip();
    } else {
      let racerId = this.state.racerId;
      const achievements = myAchievements;
      const user = getUser();
      const { firstName: first, lastName: last, birthday: birthdayDate } = user;
      const year = moment(birthdayDate).year();
      const month = moment(birthdayDate).month() + 1;
      const day = moment(birthdayDate).date();
      const detailLoad = {
        unclaimRaces: achievements,
        dobY: year,
        dobM: month,
        dobD: day
      };
      const byIdLoad = { racerId: racerId };
      return axios
        .post(
          "https://us-central1-sportify-188108.cloudfunctions.net/unclaimDetail",
          detailLoad
        )
        .then(response => {
          if (achievements.length != 0) {
            const targetAchievements = R.filter(
              a => a.confirm === true,
              achievements
            ).map(a => a.EntryId);
            return response.data.map(a => ({
              ...a,
              confirm: R.contains(a.EntryId, targetAchievements)
            }));
          } else {
            return response.data;
          }
        })
        .then(response => {
          detailAchievement = response; //this variable will be reused in other functions.
          return response;
        })

        .then(() =>
          racerId == -1000
            ? { data: [] }
            : axios.post(
                "https://us-central1-sportify-188108.cloudfunctions.net/claimByID",
                byIdLoad
              )
        )
        .then(claim => {
          claimAchieve = claim.data;
          claimAchieve.map(a => {
            a.confirm = true;
          });
          allAchievement = detailAchievement.concat(claimAchieve);
          return allAchievement;
        })

        .then(res => saveUserAchievements(res))
        .then(() => fetchAchievements(user.uid)) // return a firebase object
        .then(achievements => {
          userStore.setAchievements(user.uid, achievements);
        })

        .then(() =>
          axios.post(
            "https://us-central1-sportify-188108.cloudfunctions.net/fetchGeo",
            allAchievement
          )
        )
        .then(response => {
          return response.data;
        })
        .then(result => {
          result.map(a => {
            a["location"] = {};
            a.location.latitude = a.latitude;
            a.location.longitude = a.longitude;
            a.confirm = true;
          });
          return result;
        })

        .then(res => saveUserAchievements(res))
        .then(() => fetchAchievements(user.uid)) // return a firebase object
        .then(achievements => {
          userStore.setAchievements(user.uid, achievements);
          this.setState({ loaded: true });
          this.finishCreate();
        })

        .catch(err => {
          this.setState({ loaded: true });
          console.error(
            `Error received from axios.post: ${JSON.stringify(err)}`
          );
        });
    }
  }

  finishCreate(flag = false) {
    if (flag) this.state.boarding = false;
    if (this.state.loaded == true && this.state.boarding == false) {
      this.setState({ loading: false });
      this.props.navigation.navigate("Welcome");
    }
  }

  skip = () => {
    this.props.navigation.navigate("Welcome");
  }

  // onboarding
  _renderItem = ({ item, dimensions }) => (
    <ScrollView 
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0, y: 1 }}
        style={[
            styles.contentSlide,
            dimensions
        ]}
    >
      <Image
        source={item.image}
        resizeMode="stretch"
        style={[styles.imageStyle, dimensions]}
      ></Image>
    </ScrollView>
  );
  _renderNextButton = () => {
    return (
      <View style={styles.buttonPagination}>
        <Text style={styles.btnText}>Next</Text>
        <MaterialIcons
          name="chevron-right"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: "transparent" }}
        />
      </View>
    );
  };
  _renderPrevButton = () => {
    return (
      <View style={styles.buttonPagination}>
        <MaterialIcons
          name="chevron-left"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: "transparent" }}
        />
        <Text style={styles.btnText}>Prev</Text>
      </View>
    );
  };
  _renderDoneButton = () => {
    return (
      <View style={styles.buttonPagination}>
        <Text style={styles.btnText}>Finish</Text>
        <MaterialIcons
          name="chevron-right"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: "transparent" }}
        />
      </View>
    );
  };
  _onDone = () => {
    this.setState({ boarding: false });
    this.finishCreate(true);
  };

  render() {
    let data = [];
    let achievements = this.state.achievements;
    if (achievements !== []) {
      data = R.sortBy(
        R.descend(R.prop("StartDateTime")),
        R.map(addGroup, achievements)
      );
      let years = [];
      this.heads = [];
      data.forEach((event, index) => {
        if (!R.contains(event.year, years)) {
          years.push(event.year);
          this.heads.push(index);
        }
      });
    }
    if (this.state.boarding) {
      return (
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View style={styles.onboading_container}>
            {/* <AppIntroSlider
              slides={slides}
              showPrevButton={true}
              renderDoneButton={this._renderDoneButton}
              renderNextButton={this._renderNextButton}
              renderPrevButton={this._renderPrevButton}
              dotStyle={styles.dot}
              activeDotStyle={styles.activeDot}
              paginationStyle={{ marginTop: 50 }}
              onDone={this._onDone}
            /> */}
            <AppIntro
              nextBtnLabel="Next"
              doneBtnLabel="Finish"
              activeDotColor={colors.mainPurple}
              dotColor={colors.white}
              onDoneBtnClick={this.skip}
            >
              <First />
              <Second />
              <Third />
              <Forth />
              <Fifth />
              <Sixth />
              <Seventh />
            </AppIntro>
          </View>
        </View>
      );
    } else {
      if (this.state.loading) {
        return (
          <ImageBackground
            source={require("./../../assets/wait_create.png")}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator size="large" />
            <View
              style={{
                marginTop: 20,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={styles.loadingText}>
                please wait until your profile is created.
              </Text>
              <Text style={styles.loadingText}>
                This may take a few minutes…
              </Text>
            </View>
          </ImageBackground>
        );
      }
      // console.log("in pastRaceScreen 00");
      let pastNav = (!typeof this.props.navigation.getParam('pastNav') === 'undefined')
      ? this.props.navigation.getParam('pastNav')
      : "CreateProfile";
      // console.log(this.props.navigation.getParam('pastNav'), !typeof this.props.navigation.getParam('pastNav') === 'undefined', pastNav);
      return (
        <View style={styles.container}>
          <View style={styles.titleStyle}>
            <TouchableOpacity
              style={styles.backBtnStyle}
              onPress={() => {
                this.props.navigation.navigate(pastNav);
                }}
            >
              <Ionicons
                name="md-arrow-back"
                color={colors.mediumGrey}
                style={{ fontSize: 20 }}
              />
              <Text style={styles.backTxtStyle}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtnStyle}
              onPress={() => this.skip()}
            >
              <Text style={styles.skipTxtStyle}>Skip</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 20 }}>
            <Text style={styles.titleTxtStyle}>
              {translate("pick-past-race-topic")}
            </Text>
          </View>
          <Text style={styles.descText}>
            {translate("pick-past-race-desc")}
          </Text>
          <View style={{ width: "100%" }}>
            <CheckBox
              right
              title={translate("deselect")}
              iconRight
              checkedIcon="stop"
              checked={this.state.checked}
              uncheckedColor={colors.mediumGrey}
              checkedColor={colors.dusk}
              onPress={() => {
                let cnt = this.state.achievements.length;
                if (this.state.checked) cnt = 0;
                this.setState({
                  checked: !this.state.checked,
                  flagAllBtnClick: true,
                  pickedCnt: cnt
                });
              }}
            />
          </View>
          <View style={styles.nondisplay}>
            <List
              extraData={data}
              renderEmptyData={this.renderEmptyData}
              data={data}
              renderItem={this.renderItem}
              keyExtractor={item => "" + item.EntryId}
            />
          </View>
          <View>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => this.submit()}
            >
              <Text style={styles.submitText}>
                {this.state.pickedCnt} Picked & Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  nondisplay: {
    flex: 1,
    marginBottom: 60
  },
  itemText: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    color: colors.mediumGrey,
    marginLeft: 10
  },
  backBtnStyle: {
    color: colors.mediumGrey,
    marginTop: 3,
    flexDirection: "row"
  },
  skipBtnStyle: {
    color: colors.dusk,
    marginTop: 3,
    position: "absolute",
    right: 5
  },
  container: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    paddingTop: Constants.statusBarHeight
  },
  titleStyle: {
    marginBottom: 20,
    flexDirection: "row"
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8
  },
  skipTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
    marginRight: 8
  },
  titleTxtStyle: {
    fontSize: 30,
    color: colors.dusk,
    fontFamily: "PoppinsBold"
  },
  descText: {
    fontSize: 12,
    color: colors.mediumGrey,
    fontFamily: "PoppinsBold",
    marginBottom: 20
  },
  itemContainer: {
    backgroundColor: "#FFFFFF",
    paddingLeft: 20,
    paddingRight: 0
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 10
  },
  itemName: {
    fontSize: 14,
    flex: 1,
    textAlignVertical: "center",
    fontFamily: "PoppinsBold",
    color: colors.dusk
  },
  itemIndicatorContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20
  },
  itemLineIndicator: {
    backgroundColor: colors.whiteThree,
    width: "100%",
    height: 3,
    marginRight: 10
  },
  itemYearIndicator: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.mainPurple,
    width: 40,
    alignSelf: "center",
    marginTop: -10,
    zIndex: 1,
    marginRight: 10
  },
  submitBtn: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.mainPurple,
    height: 52,
    borderRadius: 4,
    marginTop: 5,
    position: "absolute",
    bottom: 10
  },
  submitText: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    letterSpacing: 0,
    color: colors.white,
    textAlign: "center"
  },
  loadingText: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    color: colors.mediumGrey
  },
  onboading_container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.paleGray
  },
  buttonPagination: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  contentSlide: {
    flex: 1,
    justifyContent: "center"
  },
  image: {
    height: "85%",
    width: "90%",
    resizeMode: "contain",
    marginLeft: -32
  },
  imageStyle: {
    height: 750,
    width: 350,
    resizeMode: "contain",
    marginLeft: -32
  },
  btnText: {
    color: colors.white,
    fontSize: 16
  },
  dot: {
    width: 15,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.white
  },
  activeDot: {
    width: 30,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.color_dotBtn
  }
});

