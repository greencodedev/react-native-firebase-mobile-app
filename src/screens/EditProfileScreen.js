import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Picker,
  Image,
  Alert
} from "react-native";
import { TextInput } from "react-native-paper";
import * as R from "ramda";
import { ImagePicker, Permissions } from "expo";
import { Calendar } from "react-native-calendars";
import DatePicker from "react-native-datepicker";
import { observer } from "mobx-react/native";
import { Ionicons } from "@expo/vector-icons";

import translate from "@utils/translate";
import * as colors from "../constants/colors";
import {
  uploadUserProfileImage,
  getUser,
  fetchUser,
  updateUserProfile
} from "../logics/auth";
import { userStore } from "../stores";
import Constants from "expo-constants";

const countries = require("../../assets/data/countries");

const ProgressBar = props => (
  <ActivityIndicator {...props} size="large" color="#0000ff" />
);

@observer
export default class EditProfileScreen extends Component {
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
      bio: "defulat bio",
      country: "US",
      countryIndex: 1,
      email: "",
      modalVisible: false,
      birthday: "",
      image:
        "https://dgtzuqphqg23d.cloudfront.net/UscoKxvxNJL4MbbWYIxluvm3sESCPo9sP9xHQZnADdI-2048x1536.jpg",
      loading: false,
      loaded: false
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
    const fields = [
      ["firstName"],
      ["lastName"],
      ["country"],
      ["bio"],
      ["email"]
    ];
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
    const fields = [
      ["displayName"],
      ["firstName"],
      ["lastName"],
      ["country"],
      ["birthday"],
      ["bio"],
      ["email"]
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
          this.dissmisLoading();
          console.log("success");
          this.props.navigation.navigate("App");
        })
        .catch(e => {
          console.log(e);
          this.setState({
            loading: false,
            error: true,
            errorMessage: "An error occurred!"
          });
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
    console.log("Did mount");
    const user = userStore.user;
    let country_info;
    let {
      displayName,
      firstName,
      lastName,
      country,
      bio,
      email,
      photoURL,
      birthday
    } = user;
    if (country === undefined) {
      country = "US";
    }
    if (firstName === undefined) firstName = "";
    if (lastName === undefined) lastName = "";

    const countryIndex = R.findIndex(R.propEq("code", country))(countries);
    this.setState({
      displayName,
      firstName,
      lastName,
      email,
      bio,
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
    // const statesItem = statesOfUS.map(item=> {
    //   return (
    //     <Picker.Item key={item.abbreviation} label={item.name} value={item.name} />
    //   );
    // });
    this.countriesItem = countriesItem;
    // this.statesItem = statesItem;
  }
  saveUserInfo() {
    console.log(this.checkValidity());
    if (this.checkValidity())
      this.calculateDisplayName().then(this.handleSubmit.bind(this));
    else {
      Alert.alert(
        "Error! All fields must be filled. Please fill out all fields."
      );
    }
  }
  render() {
    // let cities_temp = this.getCitiesOfState(this.state.cities, this.state.stateOfUS);
    // let cities_temp = this.getCitiesOfState(this.state.cities, this.state.state);
    // const cities = cities_temp.map(item=> {
    //   return (
    //     <Picker.Item key={item} label={item} value={item} />
    //   );
    // });
    // this.citiesItem = cities;

    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.5,
            backgroundColor: colors.white
          }}
        >
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.titleStyle}>
          <TouchableOpacity
            style={styles.backBtnStyle}
            onPress={() => this.props.navigation.navigate("Settings")}
          >
            <Ionicons
              name="md-arrow-back"
              color={colors.mediumGrey}
              style={{ fontSize: 20 }}
            />
            <Text style={styles.backTxtStyle}>Back</Text>
          </TouchableOpacity>
          <View style={styles.titleViewStyle}>
            <Text style={styles.titleTxtStyle}>
              {translate("setting-item-profile")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.saveBtnStyle}
            onPress={() => this.saveUserInfo()}
          >
            <Text style={styles.saveTxtStyle}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.imageContainer}>
              {/* {this.state.loading ? (
              <ProgressBar style={{ marginLeft: 20 }} />
            ) : ( */}
              <TouchableOpacity
                onPress={this.handleImageChangePress.bind(this)}
                style={styles.imageEditButton}
              >
                <Image
                  source={
                    this.state.image
                      ? { uri: this.state.image }
                      : require("../../assets/profile-blank.png")
                  }
                  style={styles.image}
                />
              </TouchableOpacity>
              {/* )} */}
            </View>
            <View style={styles.coverImgContainer}>
              <Image
                source={require("./../../assets/profile-cover.png")}
                style={styles.coverImg}
              />
            </View>
          </View>
          <View>
            <View style={styles.textField}>
              <TextInput
                mode="outlined"
                errorMessage={"Error"}
                value={this.state.firstName}
                label={translate("firstname")}
                onChangeText={text =>
                  this.setState({
                    firstName: text,
                    displayName: text + " " + this.state.lastName
                  })
                }
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
                value={this.state.lastName}
                label={translate("lastname")}
                onChangeText={text =>
                  this.setState({
                    lastName: text,
                    displayName: this.state.firstName + " " + text
                  })
                }
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
                value={this.state.displayName}
                label={translate("nickname")}
                style={styles.inputTxt}
                onChangeText={text => this.setState({ displayName: text })}
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
                value={this.state.bio}
                label={"Bio"}
                errorMessage={"Email Error"}
                onChangeText={text => this.setState({ bio: text })}
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
                    format="YYYY-MM-DD"
                    confirmBtnText={translate("confirm")}
                    cancelBtnText={translate("cancel")}
                    date={this.state.birthday}
                    mode="date"
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
                // value={this.state.country_info}
                value={this.state.country}
                label={"Country"}
                errorMessage={"Country Error"}
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
            <View style={styles.textField}>
              <TextInput
                mode="outlined"
                value={this.state.email}
                label={"Email"}
                errorMessage={"Email Error"}
                onChangeText={text => this.setState({ email: text })}
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
          </View>
          {/* <View style={styles.divider}>
            <View
              style={[
                styles.line,
                { borderColor: colors.whiteThree },
                false && styles.dashed,
                { flex: 1 }
              ]}
            />
            <Text style={[styles.divTxt, { color: colors.mainPurple }]}>
              AND
            </Text>
            <View
              style={[
                styles.line,
                { borderColor: colors.whiteThree },
                false && styles.dashed,
                { flex: 1 }
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.resultBtn}
            onPress={() => {
              this.props.navigation.navigate("NewResult", {
                pastNav: "EditProfile"
              });
            }}
          >
            <Text style={styles.resultTxt}>
              {translate("setting-add-results")}
            </Text>
          </TouchableOpacity> */}
          <View style={styles.divider}>
            <View
              style={[
                styles.line,
                { borderColor: colors.whiteThree },
                false && styles.dashed,
                { flex: 1 }
              ]}
            />
            <Text style={[styles.divTxt, { color: colors.mainPurple }]}>
              AND
            </Text>
            <View
              style={[
                styles.line,
                { borderColor: colors.whiteThree },
                false && styles.dashed,
                { flex: 1 }
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.resultBtn}
            onPress={() => {
              this.props.navigation.navigate("ResetPassword");
            }}
          >
            <Text style={styles.pwdTxt}>Change Password</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    // marginTop: 8,
    marginTop: Constants.statusBarHeight
  },
  scrollContainer: {
    // padding: 30
  },
  button: {
    marginTop: 20,
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  countryContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginTop: 10,
    borderRadius: 4,
    borderWidth: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 15,
    backgroundColor: "#FFFFFF"
  },
  country: {
    flex: 1,
    color: "#005872"
  },
  buttonText: {
    color: "#005872"
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.whiteThree,
    backgroundColor: colors.white,
    width: 80,
    height: 80,
    justifyContent: "center"
  },
  coverImgContainer: {
    flex: 1,
    flexDirection: "row",
    marginLeft: 16,
    height: 80,
    // alignItems: "flex-end",
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.whiteThree,
    backgroundColor: colors.white,
    justifyContent: "flex-end"
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
  titleStyle: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  titleViewStyle: {
    justifyContent: "center",
    textAlign: "center",
    width: "60%"
  },
  backBtnStyle: {
    flexDirection: "row",
    alignItems: "center",
    color: colors.mediumGrey,
    width: "20%"
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8
  },
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    textAlign: "center",
    fontSize: 19,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  saveBtnStyle: {
    width: "20%",
    color: colors.mediumGrey,
    alignContent: "flex-end",
    alignItems: "flex-end"
  },
  saveTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  },
  image: {
    width: 72,
    height: 72
  },
  coverImg: {
    width: "100%",
    height: 72
  },
  textField: {
    marginTop: 10
  },
  hrLine: {
    borderColor: colors.whiteThree,
    borderStyle: "solid",
    // borderBottomWidth: 1,
    borderWidth: 1,
    flex: 1,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16
  },
  resultBtn: {
    flex: 1,
    borderRadius: 4,
    height: 52,
    borderRadius: 4,
    backgroundColor: colors.dusk,
    alignItems: "center",
    justifyContent: "center"
  },
  resultTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.white
  },
  pwdBtn: {
    flex: 1,
    height: 52,
    borderRadius: 4,
    backgroundColor: colors.white,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: colors.whiteThree,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 66
  },
  pwdTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  divider: {
    height: 24,
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 6
  },
  line: {
    height: 24,
    borderBottomWidth: 1,
    transform: [{ translateY: -12 }]
  },
  shortWidth: {
    width: 20
  },
  dashed: {
    borderStyle: "dashed"
  },
  divTxt: {
    paddingHorizontal: 24,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "PoppinsBold"
  },
  labelTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey
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
  },
  calendar: {
    width: "100%",
    marginTop: 12
  }
});
