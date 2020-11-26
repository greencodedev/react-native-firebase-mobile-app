import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Modal,
  Picker,
  DatePickerAndroid,
  DatePickerIOS,
  Platform,
  Alert,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import * as R from "ramda";
import { TextInput } from "react-native-paper";
import { ImagePicker, Permissions } from "expo";
import { observer } from "mobx-react/native";
import { Calendar } from "react-native-calendars";
import DatePicker from "react-native-datepicker";
import Constants from "expo-constants";
import translate from "@utils/translate";
// import { TextInput } from "../components";
import * as colors from "../constants/colors";
import Feather from "../../node_modules/@expo/vector-icons/Feather";
import {
  uploadUserProfileImage,
  getUser,
  fetchUser,
  updateUserProfile
} from "../logics/auth";
import { userStore } from "../stores";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextField } from "react-native-material-textfield";
import { createCancelablePromise } from "@utils";
import axios from "axios";
import { saveUserAchievements, fetchAchievements } from "../logics/data-logic";

const countries = require("../../assets/data/countries");
const ProgressBar = props => (
  <ActivityIndicator {...props} size="large" color="#0000ff" />
);

@observer
export default class CreateProfileScreen extends Component {
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
      country: "",
      countryIndex: 1,
      email: "",
      modalVisible: false,
      birthday: "1961-02-01",
      image:
        "https://dgtzuqphqg23d.cloudfront.net/UscoKxvxNJL4MbbWYIxluvm3sESCPo9sP9xHQZnADdI-2048x1536.jpg",
      loading: false,
      loaded: false,
      isMultiuser: false,
      isOnlyuser: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }
  handleInputChange(key, value) {
    this.setState({ [key]: value, error: false });
  }

  calculateDisplayName = async () => {
    console.log(this.state);
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
      const isCurValid = R.not(R.or(R.isNil(value), R.isEmpty(value)));
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
      const isCurValid = R.not(R.or(R.isNil(value), R.isEmpty(value)));
      valid = valid && isCurValid;
      info[f] = value;
    });

    if (valid) {
      this.showLoading();
      updateUserProfile(info)
        .then(async () => {
          const { nextRoute, fetch } = this.props.navigation.state.params;
          if (fetch) await fetchUser(getUser().uid, true);
          const unclaimLoad = {
            first: this.state.firstName,
            last: this.state.lastName,
            raceLoc: "",
            raceStart: "",
            raceEnd: ""
          };
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
            if (achievements.length === 0) {
              return saveUserAchievements([])
                .then(() => fetchAchievements(user.uid))
                .then(temp => {
                  achievements = temp;
                })
                .then(() => {
                  alert("no achievements!");
                  userStore.setAchievements(user.uid, achievements);
                  this.props.navigation.navigate("Welcome");
                })
                .catch(e => console.log("error===>", e.message));
            } else if (this.state.isMultiuser) {
              this.setState({
                loading: false,
                loaded: true,
                achievements: achievements
              });
              this.state.claimedProfiles.push({ name: "None", racerId: -1000 });
              this.props.navigation.navigate("SelectData", {
                claimedProfiles: this.state.claimedProfiles,
                achievements: achievements
              });
            } else if (this.state.isOnlyuser) {
              this.setState({
                loading: false,
                loaded: true,
                achievements: achievements
              });
              this.props.navigation.navigate("PastRace", {
                racerId: this.state.claimedProfiles[0].racerId,
                achievements: achievements
              });
            } else {
              this.setState({
                loading: false,
                loaded: true,
                achievements: achievements
              });
              this.props.navigation.navigate("PastRace", {
                racerId: -1000, //no claim result found or None is chosen in multiUser case
                achievements: achievements
              });
            }
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
      this.claimed = createCancelablePromise(
        new Promise((resolve, reject) => {
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
    }
  };
  handleChangeCountry(country, countryIndex) {
    this.setState({
      country,
      countryIndex
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
  async handleImageChangePress() {
    this.showLoading();
    Permissions.askAsync(Permissions.CAMERA_ROLL)
      .then(({ status }) => {
        if (status === "granted") {
          return ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            base64: true
          });
        }
        throw Error();
      })
      .then(({ uri }) => uploadUserProfileImage(uri))
      .then(() => {
        const user = getUser();
        this.setState({ image: user.photoURL });
      })
      .catch(e => console.log(e.message))
      .then(this.dissmisLoading);
  }
  componentDidMount() {
    const user = userStore.user;
    let {
      displayName,
      firstName,
      lastName,
      country,
      email,
      photoURL,
      birthday
    } = user;
    if (country === undefined) country = "US";
    if (birthday === undefined) birthday = "1961-02-01";
    if (firstName === undefined) firstName = "";
    if (lastName === undefined) lastName = "";
    const countryIndex = R.findIndex(R.propEq("code", country))(countries);
    this.setState({
      displayName,
      firstName,
      lastName,
      email,
      country,
      birthday,
      countryIndex,
      image: photoURL,
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
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.titleStyle}>
            <TouchableOpacity
              style={styles.backBtnStyle}
              onPress={() => this.props.navigation.goBack()}
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
                {translate("create-your-profile")}
              </Text>
            </View>
          </View>

          <TextField
            style={{ paddingLeft: 12 }}
            onChangeText={text => this.handleInputChange("firstName", text)}
            value={this.state.firstName}
            label={translate("firstname-help")}
            tintColor={colors.dusk}
            baseColor={colors.mediumGrey}
            labelTextStyle={{ paddingLeft: 12 }}
          />
          <TextField
            style={{ paddingLeft: 12 }}
            onChangeText={text => this.handleInputChange("lastName", text)}
            value={this.state.lastName}
            label={translate("lastname-help")}
            tintColor={colors.dusk}
            baseColor={colors.mediumGrey}
            labelTextStyle={{ paddingLeft: 12 }}
          />
            <View style={styles.textField}>
              <TextInput
                style={styles.inputTxt}
                value={this.state.birthday}
                mode="outlined"
                label={translate("birthday-placeholder")}
                errorMessage={"Birthday Error"}
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
                  <DatePicker
                    style={styles.calendar}
                    date={this.state.birthday}
                    mode="date"
                    placeholder="BirthDay"
                    format="YYYY-MM-DD"
                    confirmBtnText={translate("confirm")}
                    cancelBtnText={translate("cancel")}
                    customStyles={{
                      dateIcon: {
                        position: "absolute",
                        right: 7,
                        top: 0
                      },
                      dateInput: {
                        borderColor: "transparent",
                        borderBottomColor: colors.mediumGrey
                      },
                      placeholderText: {
                        alignSelf: "flex-start",
                        color: colors.mediumGrey,
                        paddingLeft: 12
                      },
                      dateText: {
                        alignSelf: "flex-start",
                        paddingLeft: 12
                      }
                    }}
                    onDateChange={birthday => {
                      this.setState({ birthday, error: false });
                    }}
                  />
                  )}
              />
            </View>              
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
                <View style={styles.countryPicker}>
                  <Picker
                    style={styles.pickerTxt}
                    selectedValue={this.state.country}
                    onValueChange={(value, index) =>
                      this.handleChangeCountry(value, index)
                    }
                  >
                    {this.countriesItem}
                  </Picker>
                  {/* <Ionicons
                    name="md-globe"
                    color={colors.mediumGrey}
                    style={{ fontSize: 30, alignSelf: "flex-end" }}
                  /> */}
                </View>
              )}
            />
          </View>
          {this.state.loading ? (
            <ProgressBar style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (this.checkValidity())
                  this.calculateDisplayName().then(
                    this.handleSubmit.bind(this)
                  );
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{translate("continue")}</Text>
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
  scrollContainer: {
    padding: Constants.statusBarHeight,
    backgroundColor: "white",
    flex: 1
  },
  button: {
    marginTop: 20,
    height: 48,
    backgroundColor: colors.mainPurple,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  country: {
    flex: 1,
    color: "#005872"
  },
  buttonText: {
    color: colors.login_welcome,
    fontWeight: "bold"
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
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dusk
  },
  titleStyle: {
    marginBottom: 2
  },
  textField: {
    marginTop: 10
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
  calendar: {
    width: "100%",
    marginTop: 12
  },
  countryPicker: {
    width: "100%",
    marginTop: 12,
    borderBottomColor: colors.mediumGrey,
    borderBottomWidth: 1,
    flexDirection: "row",
    borderBottomColor: colors.mediumGrey,
    borderBottomWidth: 1,
    justifyContent: "center"
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
