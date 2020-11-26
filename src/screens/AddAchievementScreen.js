import React, { Component } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Image
} from "react-native";
import DatePicker from "react-native-datepicker";
import * as R from "ramda";
import MapView from 'react-native-maps';

import * as colors from "../constants/colors";
import { CountDownPicker } from "../components";
import { getUser } from "../logics/auth";
import {
  fetchAchievements,
  addAchievement,
  updateAchievement,
  uploadImageForAchievement
} from "../logics/data-logic";
import { userStore } from "../stores";
import translate from "@utils/translate";
import { FontAwesome } from "@expo/vector-icons";
import { TextInput } from 'react-native-paper';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
const { Marker } = MapView;

export default class AddAchievementScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: translate(
      R.pathOr("add", ["state", "params", "type"], navigation) === "add"
        ? "header-add-achievement"
        : "header-edit-achievement"
    ),
    headerStyle: {
      backgroundColor: colors.white,
      color: colors.mediumGrey,
    },
    headerTintColor: colors.mediumGrey,
    headerTitleStyle: {
      fontFamily: "PoppinsBold",
      color: colors.mainPurple,
      alignSelf: 'center',
      textAlign: 'center',
      width: '90%',
    },
    headerBackTitle: "",
    headerRight: null,
    headerRight: R.hasPath(["state", "params"], navigation) ? (
      <TouchableOpacity
        style={{paddingRight: 12 }}
        onPress={() => {
          let loading = false;
          const state = navigation.state.params.getState();
          const { changeState } = navigation.state.params;
          const fields = [["eventName"], ["eventDate"]];
          let info = {},
            valid = true;
          fields.map(f => {
            const value = R.pathOr(null, f, state);
            const isCurValid = R.not(R.or(R.isNil(value), R.isEmpty(value)));
            valid = valid && isCurValid;
            info[f] = value;
          });

          if (valid) {
            const user = getUser();
            const {
              eventName,
              eventDate,
              result,
              oveRank,
              genRank,
              ageRank,
              courseDistance,
              report = "",
              map
            } = state;
            const event = {
              eventName,
              eventDate,
              result,
              report
            };
            if (oveRank) event["oveRank"] = parseInt(oveRank);
            if (genRank) event["genRank"] = parseInt(genRank);
            if (ageRank) event["ageRank"] = parseInt(ageRank);
            if (courseDistance)
              event["courseDistance"] = parseInt(courseDistance);
            if (map.location) event["location"] = map.location;
            const type = R.pathOr(
              null,
              ["state", "params", "type"],
              navigation
            );

            if (type === "edit") {
              const id = R.pathOr(
                null,
                ["state", "params", "achievement"],
                navigation
              );
              updateAchievement(id, event)
                .then(() => fetchAchievements(user.uid))
                .then(achievements =>
                  userStore.setAchievements(
                    user.uid,
                    achievements.map(item => ({ ...item, user }))
                  )
                )
                .then(() => {
                  loading = true;
                  navigation.pop();
                });
            } else {
              addAchievement(event)
                .then(() => fetchAchievements(user.uid))
                .then(achievements =>
                  userStore.setAchievements(
                    user.uid,
                    achievements.map(item => ({ ...item, user }))
                  )
                )
                .then(() => navigation.pop());
            }
          } else {
            changeState({ error: true, errorMessage: "Enter the fields" });
          }
        }} 
      >
      <Text style={{ color: colors.dusk, fontFamily: "PoppinsBold"}}>{translate("save")}</Text> 
      </TouchableOpacity>
    ) : null
  });

  constructor(props) {
    super(props);
    this.state = {
      private: false,
      eventName: "",
      eventDate: "2018-05-11",
      result: "",
      country: "",
      state: "",
      city: "",
      courseDistance: "",
      oveRank: "",
      oveRankError: "",
      oveRankErrorShow: false,
      genRank: "",
      genRankError: "",
      genRankErrorShow: false,
      ageRank: "",
      report: "",
      map: {
        region: {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }
      },
      loading: false,
    };
  }
  getState = () => {
    return this.state;
  };
  showLoading = () => {
    this.setState({ loading: true });
  };
  dissmisLoading = () => {
    this.setState({ loading: false });
  };
  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    );
    const type = R.pathOr(
      null,
      ["navigation", "state", "params", "type"],
      this.props
    );

    if (type == "edit") {
      const id = R.pathOr(
        null,
        ["navigation", "state", "params", "achievement"],
        this.props
      );
      const uid = R.pathOr(
        null,
        ["navigation", "state", "params", "uid"],
        this.props
      );
      this.id = id;
      this.uid = uid;
      const achievement = userStore.achievements[uid].find(a => a.id === id);
      const {
        eventName,
        eventDate,
        result,
        country,
        state,
        city,
        courseDistance,
        oveRank,
        genRank,
        report,
        ageRank,
        location
      } = achievement;

      const { latitude, longitude } = location ? location : {};
      this.setState({
        // ...this.state,
        eventName,
        eventDate,
        result,
        country,
        state,
        city,
        courseDistance: courseDistance + "",
        oveRank: oveRank + "",
        genRank: genRank + "",
        ageRank: ageRank + "",
        report,
        map: {
          region:
            latitude && longitude
              ? {
                  latitude,
                  longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                }
              : {
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                },
          location:
            latitude && longitude
              ? {
                  latitude,
                  longitude
                }
              : null
        }
      });
    }
    this.props.navigation.setParams({
      getState: this.getState,
      changeState: this.setState.bind(this)
    });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  _keyboardDidShow() {}

  _keyboardDidHide() {}
  handleCourseDistanceChange = courseDistance => {
    this.setState({ courseDistance });
  };
  render() {
    let achievement = {};
    const type = R.pathOr(
      null,
      ["state", "params", "type"],
      this.props.navigation
    );
    if (type == "edit") {
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

      achievement = userStore.achievements[uid].find(a => a.id === id);
      if (typeof achievement === "undefined") achievement = {};
    }
    const { width } = Dimensions.get("window");
    const height = width;
    if (this.state.loading) {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <Text>Wait until the photo is loaded</Text>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <View>
            <Text style={{ fontSize: 12, color: colors.mediumGrey, paddingLeft: 12 }}>
              {translate("add-image")}
            </Text>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity onPress={this.handleAddPhoto.bind(this)}>
                  <FontAwesome
                    name="camera"
                    size={40}
                    style={{ color: colors.mediumGrey }}
                  />
              </TouchableOpacity>
            </View>
          </View>
          {achievement.images ? (
            <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
              <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                <Text style={{ marginTop: 20, fontSize: 12, color: colors.mediumGrey, paddingLeft: 12 }}>
                  {translate("cover-image")}
                </Text>
                <View style={styles.itemContainer}>
                  <Image style={styles.photoItem} source={{ uri: achievement.images[0] }} />
                </View>
              </View>
              <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                <Text style={{ marginTop: 20, fontSize: 12, color: colors.mediumGrey, paddingLeft: 12 }}>
                  {translate("medal-image")}
                </Text>
                <View style={styles.itemContainer}>
                  <Image style={styles.photoItem} source={{ uri: achievement.images[1] }} />
                </View>
              </View>
            </View>
          ) : (
              <View></View>
          )}
        </View>
        {this.state.error && (
          <Text style={{ width: "100%", alignItems: "center", color: "red" }}>
            {this.state.errorMessage}
          </Text>
        )}
        <View style={styles.textField}>
          <TextInput
            mode="outlined"
            value={this.state.eventName}
            label={translate('race-name')}
            style={styles.inputTxt}
            onChangeText={this.handleEventNameChange.bind(this)}
            theme={{
              roundness: 2,
              colors: {
                primary: colors.dusk,
                background: colors.white,
                underlineColor: 'transparent',       
                text: colors.dusk    
              }
            }}
          />
        </View>
        <Text style={{ marginTop: 20, fontSize: 12, color: colors.mediumGrey, paddingLeft: 12 }}>
          {translate("date")}
        </Text>
        <DatePicker
          style={{ width: '100%' }}
          date={this.state.eventDate}
          mode="date"
          placeholder="select date"
          format="YYYY-MM-DD"
          confirmBtnText={translate("confirm")}
          cancelBtnText={translate("cancel")}
          customStyles={{
            dateIcon: {
              position: "absolute",
              right: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              borderColor: 'white',
              borderBottomColor: colors.mediumGrey
            },
            placeholderText: {
              alignSelf: 'flex-start',
              color: colors.mediumGrey,
              paddingLeft: 12
            },
            dateText: {
              alignSelf: 'flex-start',
              paddingLeft: 12
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={eventDate => {
            this.setState({ eventDate, error: false });
          }}
        />
        <Text style={{ marginTop: 20, fontSize: 12, color: colors.mediumGrey, paddingLeft: 12 }}>
          {translate("finishing-time")}:{" "}
        </Text>
        <CountDownPicker
          onChange={this.handleResultChange.bind(this)}
          style={{ marginTop: 10 }}
          initialValue={this.state.result}
        />
        <View style={styles.textField}>
          <TextInput
            mode="outlined"
            keyboardType="numeric"
            value={this.state.courseDistance}
            label={translate("course-distance")}
            style={styles.inputTxt}
            onChangeText={this.handleCourseDistanceChange}
            theme={{
              roundness: 2,
              colors: {
                primary: colors.dusk,
                background: colors.white,
                underlineColor: 'transparent',       
                text: colors.dusk    
              }
            }}
          />
        </View>
        <View style={styles.textField}>
          <TextInput
            mode="outlined"
            keyboardType="numeric"
            value={this.state.oveRank}
            label={translate("overal-rank")}
            style={styles.inputTxt}
            onChangeText={this.handleOveralRankChange.bind(this)}
            theme={{
              roundness: 2,
              colors: {
                primary: colors.dusk,
                background: colors.white,
                underlineColor: 'transparent',       
                text: colors.dusk    
              }
            }}
          />
        </View>
        {this.state.oveRankErrorShow && <Text>{this.state.oveRankError}</Text>}
        <View style={styles.textField}>
          <TextInput
            mode="outlined"
            keyboardType="numeric"
            value={this.state.genRank}
            label={translate("sex-rank")}
            style={styles.inputTxt}
            onChangeText={this.handleGenRankChange.bind(this)}
            theme={{
              roundness: 2,
              colors: {
                primary: colors.dusk,
                background: colors.white,
                underlineColor: 'transparent',       
                text: colors.dusk    
              }
            }}
          />
        </View>
        {this.state.genRankErrorShow && <Text>{this.state.genRankError}</Text>}
        <View style={styles.textField}>
          <TextInput
            mode="outlined"
            textAlignVertical="top"
            keyboardType="numeric"
            value={this.state.ageRank}
            label={translate("age-rank")}
            style={styles.inputTxt}
            onChangeText={this.handleAgeRankChange.bind(this)}
            theme={{
              roundness: 2,
              colors: {
                primary: colors.dusk,
                background: colors.white,
                underlineColor: 'transparent',       
                text: colors.dusk    
              }
            }}
          />
        </View>
        <View style={styles.textField}>
          <TextInput
            mode="outlined"
            textAlignVertical="top"
            value={this.state.report}
            label={translate("race-report")}
            style={styles.inputTxt}
            onChangeText={this.handleReportChange.bind(this)}
            theme={{
              roundness: 2,
              colors: {
                primary: colors.dusk,
                background: colors.white,
                underlineColor: 'transparent',       
                text: colors.dusk    
              }
            }}
          />
        </View>
        <Text style={{ marginTop: 20, fontSize: 15, color: "white" }}>
          {translate("finishing-place")}:{" "}
        </Text>
        <MapView
          onLongPress={e => this.handleMapLongPress(e.nativeEvent.coordinate)}
          zoomEnabled={true}
          region={this.state.map.region}
          style={{ width, height, marginLeft: -30, marginTop: 10 }}
          onRegionChangeComplete={this.handleRegionChange.bind(this)}
        >
          {this.state.map.location && (
            <Marker coordinate={this.state.map.location} />
          )}
        </MapView>
      </ScrollView>
    );
  }

  handleAddPhoto = () => {
    this.showLoading();
    return Permissions.askAsync(Permissions.CAMERA_ROLL)
      .then(({ status }) => {
        if (status === "granted") {
          return ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            base64: true
          });
        }
        throw Error("permission not granted", status);
      })
      .then(({ uri, cancelled }) => {
        if (!cancelled) {
          return uploadImageForAchievement(this.uid, this.id, uri);
        }
        throw Error("cancelled");
      })
      .catch(({ message }) => console.log(message))
      .then(() => {
          this.dissmisLoading();
          navigation.setParams({
              loading: false
            });
        }
      );
  }

  handleGoBack() {
    this.props.navigation.pop();
  }
  handleRegionChange(region) {
    this.setState({ map: { ...this.state.map, region } });
  }
  handleMapLongPress(location) {
    this.setState({ map: { ...this.state.map, location } });
  }
  handleReportChange(report) {
    this.setState({ report });
  }
  handleAgeRankChange(value) {
    this.setState({ ageRank: value });
  }
  handlePrivacyChange(value) {
    this.setState({ private: value });
  }

  handleEventNameChange(text) {
    this.setState({ eventName: text });
  }

  handleEventNameChange(text) {
    this.setState({ eventName: text });
  }

  handleStartDatePress({ dateString }) {
    this.setState({ eventDate: dateString });
  }
  handleResultChange(text) {
    this.setState({ result: text });
  }
  handleCityChange(text) {
    this.setState({ city: text });
  }
  handleCountryChange(text) {
    this.setState({ country: text });
  }
  handleStateChange(text) {
    this.setState({ state: text });
  }
  handleGenRankChange(text) {
    if (isNaN(text)) {
      const message = translate("validator-must-number", {
        field: translate("sex-rank")
      });
      this.setState({ genRankError: message, genRankErrorShow: true });
    } else {
      this.setState({ genRank: text, genRankErrorShow: false });
    }
  }
  handleOveralRankChange(text) {
    if (isNaN(text)) {
      const message = translate("validator-must-number", {
        field: translate("overal-rank")
      });
      this.setState({ oveRankError: message, oveRankErrorShow: true });
    } else {
      this.setState({ oveRank: text, oveRankErrorShow: false });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 30,
    paddingTop: Constants.statusBarHeight
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
  buttonText: {
    color: "#005872"
  },
  labelTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
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
  lblText: {
    fontSize: 12,
    paddingLeft: 12,
    color: colors.mediumGrey,
  },
  rankTxt: {
    paddingLeft: 12
  },
  item: {
    flex: 1,
    backgroundColor: "black"
  },
  itemContainer: {
    width: 80,
    height: 80,
    borderColor: colors.mediumGrey,
    borderWidth: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoItem: {
    width: '90%',
    height: '90%'
  },
  textField:{
    marginTop: 10,
  },
});
