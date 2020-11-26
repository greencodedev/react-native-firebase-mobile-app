import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Picker,
  Alert
} from "react-native";
import * as R from "ramda";
import { TextInput } from "react-native-paper";
import { observer } from "mobx-react/native";
import DatePicker from "react-native-datepicker";
import Constants from "expo-constants";
import translate from "@utils/translate";
import { createCancelablePromise } from "@utils";
import axios from "axios";
import { saveUserAchievements, fetchAchievements } from "../logics/data-logic";
import * as colors from "../constants/colors";
import { getUser, fetchUser, updateUserProfile } from "../logics/auth";
import { userStore } from "../stores";
import Ionicons from "@expo/vector-icons/Ionicons";

const countries = require("../../assets/data/countries");

const ProgressBar = props => (
  <ActivityIndicator {...props} size="large" color="#0000ff" />
);

@observer
export default class NewResultScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      displayName: "",
      firstName: "",
      lastName: "",
      country: "US",
      countryIndex: 1,
      birthday: "",
      loading: false,
      loaded: false,
      simpleDate: ""
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  handleInputChange(key, value) {
    this.setState({ [key]: value, error: false });
  }
  calculateDisplayName = async () => {
    const text = this.state.firstName + " " + this.state.lastName;
    const nick = R.pathOr(null, ["displayName"], this.state);
    if (R.or(R.isNil(nick), R.isEmpty(nick))) {
      return this.setState({ displayName: text });
    }
  };
  checkValidity = () => {
    const fields = [["firstName"], ["lastName"], ["country"], ["birthday"]];
    let info = {},
      valid = true;
    fields.map(f => {
      const value = R.pathOr(null, f, this.state);
      let isCurValid = R.not(R.or(R.isNil(value), R.isEmpty(value)));
      valid = valid && isCurValid;
      info[f] = value;
    });
    if (!valid) {
      this.setState({
        error: true,
        errorMessage: translate("error-1"),
        loading: false
      });
    }
    return valid;
  };
  handleSubmit = () => {
    const user = getUser();
    const fields = [
      ["displayName"],
      ["firstName"],
      ["lastName"],
      ["country"],
      ["birthday"]
    ];
    let info = {},
      valid = true;
    fields.map(f => {
      const value = R.pathOr(null, f, this.state);
      let isCurValid = R.not(R.or(R.isNil(value), R.isEmpty(value)));
      valid = valid && isCurValid;
      info[f] = value;
    });
    if (valid) {
      this.showLoading();
      updateUserProfile(info)
        .then(async () => {
          if (fetch) await fetchUser(getUser().uid, true);
          const unclaimLoad = {
            first: this.state.firstName,
            last: this.state.lastName,
            raceLoc: "",
            raceStart: "",
            raceEnd: ""
          };
          // TODO: there are things to check:
          // 1. is unclaimed called before claim? make the order right
          // 4. the ELSE part of this routine should be replicated in all files
          // 2. state.isOnlyuser, this.state.isMultiuser: are undefined and not set. Why?
          // 3. this code is repeated in 4 files
          this.task = createCancelablePromise(
            new Promise((resolve, reject) => {
              return axios
                .post(
                  "https://us-central1-sportify-188108.cloudfunctions.net/unclaim",
                  unclaimLoad
                )
                .then(function(response) {
                  resolve(response.data);
                })
                .catch(function(error) {
                  reject(error);
                })
                .then(function() {});
            })
          );
          this.setState({ loading: true, loaded: false });
          this.task.promise.then(achievements => {
            console.log("achievements", achievements);
            console.log(
              "this.state.isOnlyuser, this.state.isMultiuser: ",
              this.state.isOnlyuser,
              this.state.isMultiuser
            );
            if (achievements.length === 0) {
              return saveUserAchievements([])
                .then(() => fetchAchievements(user.uid))
                .then(temp => {
                  achievements = temp;
                })
                .then(() => {
                  Alert.alert("No achievements!");
                  userStore.setAchievements(user.uid, achievements);
                  this.dissmisLoading();
                  this.props.navigation.navigate("Settings");
                })
                .catch(e => {
                  console.log(e.errorMessage);
                  this.setState({
                    loading: false,
                    error: true,
                    errorMessage: "An error occurred!"
                  });
                });
            } else if (this.state.isMultiuser) {
              this.setState({
                loading: false,
                loaded: true,
                achievements: achievements
              });
              this.state.claimedProfiles.push({
                name: "None",
                racerId: -1000
              });
              this.props.navigation.navigate("SelectData", {
                claimedProfiles: this.state.claimedProfiles,
                achievements: achievements,
                pastNav: "NewResult"
              });
            } else if (this.state.isOnlyuser) {
              this.setState({
                loading: false,
                loaded: true,
                achievements: achievements
              });
              this.props.navigation.navigate("PastRace", {
                racerId: this.state.claimedProfiles[0].racerId,
                achievements: achievements,
                pastNav: "NewResult"
              });
            } else {
              this.setState({
                loading: false,
                loaded: true,
                achievements: achievements
              });
              this.props.navigation.navigate("PastRace", {
                racerId: -1000, //no claim result found or None is chosen in multiUser case
                achievements: achievements,
                pastNav: "NewResult"
              });
            }
            this.dissmisLoading();
          });
        })
        .catch(e => {
          console.log(e);
          this.setState({
            loading: false,
            error: true,
            errorMessage: "An error occurred!"
          });
        });

      const claimLoad = {
        first: this.state.firstName,
        last: this.state.lastName,
        userLoc: "",
        userAgeFrom: "",
        userAgeTo: ""
      };
      console.log("OUTside claimed", claimLoad);
      this.claimed = createCancelablePromise(
        new Promise((resolve, reject) => {
          console.log("inside claimed", claimLoad);
          return axios
            .post(
              "https://us-central1-sportify-188108.cloudfunctions.net/claimed",
              claimLoad
            )
            .then(function(response) {
              resolve(response.data);
            })
            .catch(function(error) {
              reject(error);
            })
            .then(function() {});
        })
      );
      this.claimed.promise.then(claimedProfiles => {
        if (claimedProfiles.length == 0) {
          console.log("no matched name");
        } else if (claimedProfiles.length == 1) {
          this.setState({
            claimedProfiles: claimedProfiles
          });
          this.setState({ isOnlyuser: true });
        } else if (claimedProfiles[0].multiUser == "true") {
          this.setState({
            claimedProfiles: claimedProfiles
          });
          this.setState({ isMultiuser: true });
        }
      });
      // this.dissmisLoading();
      // this.props.navigation.navigate("App");
    }
  };
  handleChangeCountry(country, countryIndex) {
    if (country == "US")
      this.setState({
        country,
        countryIndex
        // state: "Alabama",
        // city: "Birmingham"
      });
    else
      this.setState({
        country,
        countryIndex
        // state: "",
        // city: ""
      });
  }
  handleChangeStatesOfUS(state, stateIndex) {
    this.setState({
      state,
      stateIndex
    });
  }
  handleChangeCitisOfUS(city, cityIndex) {
    this.setState({
      city,
      cityIndex
    });
  }
  showLoading = () => {
    this.setState({ loading: true });
  };
  dissmisLoading = () => {
    this.setState({ loading: false });
  };
  toggleModal() {
    this.setState({ modalVisible: !this.state.modalVisible });
  }
  getCitiesOfState(obj, key) {
    if (obj[key] instanceof Array) {
      // the key property is an array
      return obj[key];
    }
    // not an array
    return [];
  }
  componentDidMount() {
    console.log("Did mount");
    const user = userStore.user;
    let {
      displayName,
      firstName,
      lastName,
      country,
      // city,
      // state,
      // photoURL,
      birthday
    } = user;
    if (country === undefined) {
      country = "US";
      // city = "Birmingham";
      // state = "Alabama";
    }
    if (firstName === undefined) firstName = "";
    if (lastName === undefined) lastName = "";
    const countryIndex = R.findIndex(R.propEq("code", country))(countries);
    this.setState({
      displayName,
      firstName,
      lastName,
      country,
      // city,
      // state,
      birthday,
      countryIndex,
      loaded: true
    });
    const countriesItem = countries.map(item => {
      return (
        <Picker.Item key={item.code} label={item.name} value={item.code} />
      );
    });
    this.countriesItem = countriesItem;
  }

  render() {
    if (!this.state.loaded) {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      );
    }
    // console.log("in NewResultScreen");
    // console.log("this.props.navigation.getParam('pastNav'", this.props.navigation.getParam('pastNav'));

    let pastNav = this.props.navigation.getParam('pastNav')
      ? this.props.navigation.getParam('pastNav')
      : "CreateProfile";
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.titleStyle}>
            <TouchableOpacity
              style={styles.backBtnStyle}
              onPress={() => this.props.navigation.navigate(pastNav)}
            >
              <Ionicons
                name="md-arrow-back"
                color={colors.mediumGrey}
                style={{ fontSize: 20 }}
              />
              <Text style={styles.backTxtStyle}>Back</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.titleTxtStyle}>
                {translate("setting-profile-item-result")}
              </Text>
            </View>
          </View>
          <View style={styles.textField}>
            <TextInput
              mode="outlined"
              errorMessage={"Error"}
              value={this.state.firstName}
              label={translate("firstname")}
              onChangeText={text => this.handleInputChange("firstName", text)}
              style={styles.inputTxt}
              theme={{
                roundness: 2,
                colors: {
                  primary: colors.dusk,
                  background: colors.white,
                  underlineColor: "transparent",
                  text: colors.dusk
                }
              }}
            />
          </View>
          <View style={styles.textField}>
            <TextInput
              mode="outlined"
              errorMessage={"Error"}
              value={this.state.lastName}
              label={translate("lastname")}
              onChangeText={text => this.handleInputChange("lastName", text)}
              style={styles.inputTxt}
              theme={{
                roundness: 2,
                colors: {
                  primary: colors.dusk,
                  background: colors.white,
                  underlineColor: "transparent",
                  text: colors.dusk
                }
              }}
            />
          </View>
          <DatePicker
            style={styles.calendar}
            date={this.state.birthday}
            mode="date"
            placeholder={translate("birthday-placeholder")}
            format="YYYY-MM-DD"
            confirmBtnText={translate("confirm")}
            cancelBtnText={translate("cancel")}
            customStyles={{
              dateIcon: {
                position: "absolute",
                right: 0,
                top: 4
              },
              dateInput: {
                borderColor: "white",
                borderBottomColor: colors.mediumGrey
              },
              placeholderText: styles.placeholder,
              dateText: styles.date
            }}
            onDateChange={birthday => {
              this.setState({ birthday, error: false });
            }}
          />
          <View style={styles.textField}>
            <TextInput
              mode="outlined"
              value={this.state.country}
              label={"Country"}
              errorMessage={"Email Error"}
              onChangeText={text => this.setState({ country: text })}
              style={styles.inputTxt}
              theme={{
                roundness: 2,
                colors: {
                  primary: colors.dusk,
                  background: colors.white,
                  underlineColor: "transparent",
                  text: colors.dusk
                }
              }}
              render={props => (
                <Picker
                  style={styles.pickerTxt}
                  selectedValue={this.state.country}
                  onValueChange={(value, index) =>
                    this.handleChangeCountry(value, index)
                  }
                >
                  {this.countriesItem}
                </Picker>
              )}
            />
          </View>
          {this.state.loading ? (
            <ProgressBar style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (this.checkValidity()) this.handleSubmit();
              }}
              style={styles.btn}
            >
              <Text style={styles.btnTxt}>{translate("continue")}</Text>
            </TouchableOpacity>
          )}
          {this.state.error && (
            <Text style={{ marginTop: 5, color: "red" }}>
              {this.state.errorMessage}
            </Text>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textField: {
    marginTop: 10
  },
  scrollContainer: {
    padding: Constants.statusBarHeight,
    backgroundColor: "white",
    flex: 1
  },
  btn: {
    marginTop: 16,
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 4,
    backgroundColor: colors.mainPurple
  },
  btnTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.white
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  imageEditButton: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10
  },
  imageEditButtonText: {
    color: colors.primary
  },
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 30,
    fontWeight: "800",
    fontStyle: "normal",
    letterSpacing: -0.4,
    color: colors.dusk
  },
  titleStyle: {
    marginBottom: 2
  },
  backBtnStyle: {
    flexDirection: "row",
    color: colors.mediumGrey,
    marginTop: 3,
    alignContent: "center",
    alignItems: "center"
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8
  },
  labelTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    paddingLeft: 12
  },
  inputTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
    paddingLeft: 12
  },
  calendar: {
    width: "100%",
    height: 52,
    marginTop: 16
  },
  placeholder: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    alignSelf: "flex-start",
    paddingLeft: 12
  },
  date: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
    alignSelf: "flex-start",
    paddingLeft: 12
  },
  countryPicker: {
    width: "100%",
    marginTop: 12,
    borderBottomColor: colors.mediumGrey,
    borderBottomWidth: 1,
    flexDirection: "row",
    borderBottomColor: colors.mediumGrey,
    borderBottomWidth: 1,
    alignItems: "center"
  },
  countryItem: {
    backgroundColor: colors.white,
    width: "90%",
    marginLeft: 0,
    color: colors.dusk
  },
  countryName: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  },
  countryIcon: {
    fontSize: 30,
    alignSelf: "flex-end"
  },
  inputTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
    paddingLeft: 24
  },
  pickerTxt: {
    color: colors.dusk,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 5,
    marginBottom: 5,
    width: "90%",
    marginLeft: 5
    // backgroundColor: colors.white,
  }
});
