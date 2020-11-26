import React, { Component } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  DatePickerIOS,
  TouchableOpacity,
  Modal,
  TimePickerAndroid,
  Platform
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";

import * as colors from "@constants/colors";
import { TextInput, LabelSwitch, CheckBox } from "@components";
import { userStore } from "@stores";
import { createEvent } from "../../logics/data-logic";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from 'expo-constants';

const RACE_NAME = "Race Name";
const WEBSITE = "Website";
const TIME_RACE = "Time Race";
const COMMENT = "Comment";
const I_AM_ORGANISER = "I am the organiser?";

export default class CreateClubScreen extends Component {
  constructor(props) {
    super(props);
    this.state = this.generateInitialState();
    this.handleTextInputChange = this.handleTextInputChange.bind(this);
    this.handleOragniserMeChange = this.handleOragniserMeChange.bind(this);
    this.handleStartDatePress = this.handleStartDatePress.bind(this);
    this.handleTimeRaceChange = this.handleTimeRaceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTimePickerPress = this.handleTimePickerPress.bind(this);
  }

  generateInitialState = () => ({
    name: "",
    date: "2018-05-11",
    starttime: new Date(),
    distance: "",
    distUnit: "km",
    timerace: false,
    city: "",
    state: "",
    country: "",
    surface: {
      asphalt: 0,
      trail: 0,
      gravel: 0,
      unspecified: 0
    },
    calendarVisible: false,
    timepickerVisible: false,
    website: "",
    organiser: "",
    oragniserMe: true,
    comment: "",
    share: {
      facebook: false
    }
  });

  textInputHandler = key => value => this.handleTextInputChange(key, value);
  handleTextInputChange(key, value) {
    this.setState({ [key]: value });
  }
  handleOragniserMeChange(value) {
    this.setState({ oragniserMe: value });
  }
  handleStartDatePress({ dateString }) {
    this.setState({
      calendarVisible: false,
      date: dateString
    });
  }
  handleTimeRaceChange(value) {
    this.setState({ timerace: value });
  }
  async handleTimePickerPress() {
    if (Platform.OS === "ios")
      return this.setState({ timepickerVisible: true });
    try {
      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: 14,
        minute: 0,
        is24Hour: false // Will display '2 PM'
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        // Selected hour (0-23), minute (0-59)
      }
    } catch ({ code, message }) {
      console.warn("Cannot open time picker", message);
    }
  }
  handleSubmit() {
    // TODO: Show loading, send event to server, then navigate to Event's page!
    // TODO: Validation
    const {
      name,
      date,
      starttime,
      distance,
      distUnit,
      timerace,
      city,
      state,
      country,
      surface,
      website,
      comment
    } = this.state;
    const type = "club";
    const organiser = "SyhEA9HsWJaLR8osdc9jRDLK1Gu2";
    const event = {
      name,
      date,
      starttime,
      distance,
      distUnit,
      timerace,
      city,
      state,
      country,
      surface,
      website,
      comment,
      type,
      organiser
    };
    createEvent(event).then(docRef => {
      console.log("Document written with ID: ", docRef.id);
    });
  }
  render() {
    const user = userStore.user;
    console.log(this.state.date);
    return (
      <ScrollView style={styles.container}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            color: "#FFFFFF",
            width: "100%"
          }}
        >
          Create Run Event
        </Text>
        <TextInput
          marginTop={10}
          onChangeText={this.textInputHandler("name")}
          value={this.state.name}
          textAlignVertical="center"
          width={null}
          placeholder={RACE_NAME}
        />
        <View style={{ flexDirection: "row", marginTop: 10, width: "100%" }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start"
            }}
          >
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() => this.setState({ calendarVisible: true })}
            >
              <FontAwesome name="calendar" size={24} />
            </TouchableOpacity>
            <TextInput
              value={moment(this.state.date).format("MMMM Do YYYY")}
              textAlignVertical="center"
              width={null}
              editable={false}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={this.handleTimePickerPress}
            >
              <FontAwesome name="clock-o" size={24} />
            </TouchableOpacity>
            <TextInput
              value={moment(this.state.starttime).format("h:mm:ss a")}
              textAlignVertical="center"
              width={null}
              editable={false}
            />
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.calendarVisible}
        >
          <View style={{ marginTop: 22, flex: 1, alignItems: "center" }}>
            <Calendar
              style={{ marginTop: 10 }}
              current={"2018-05-10"}
              markedDates={{
                [this.state.date]: {
                  selected: true,
                  selectedColor: colors.primary
                }
              }}
              minDate={"2018-05-10"}
              maxDate={"2032-05-30"}
              onDayPress={day => this.handleStartDatePress(day)}
              monthFormat={"MMM yyyy"}
            />
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.timepickerVisible}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              padding: 30,
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <DatePickerIOS
              mode={"time"}
              date={this.state.starttime}
              onDateChange={time => this.setState({ starttime: time })}
              style={{ flex: 1, width: "100%" }}
            />
            <TouchableOpacity
              style={{
                padding: 10,
                borderRadius: 5,
                backgroundColor: "#FFFFFF",
                marginTop: 10
              }}
              onPress={() => this.setState({ timepickerVisible: false })}
            >
              <Text>Submit</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <TextInput
          onChangeText={this.textInputHandler("distance")}
          value={this.state.distance}
          keyboardType={"decimal-pad"}
          marginTop={10}
          textAlignVertical="center"
          width={null}
          placeholder={"16 mile"}
        />
        <LabelSwitch
          label={TIME_RACE}
          onValueChange={this.handleTimeRaceChange.bind(this)}
          value={this.state.timerace}
        />
        <TextInput
          onChangeText={this.textInputHandler("country")}
          value={this.state.country}
          marginTop={10}
          textAlignVertical="center"
          width={null}
          placeholder={"United States"}
        />
        <TextInput
          onChangeText={this.textInputHandler("state")}
          value={this.state.state}
          marginTop={10}
          textAlignVertical="center"
          width={null}
          placeholder={"California"}
        />
        <TextInput
          onChangeText={this.textInputHandler("city")}
          value={this.state.city}
          marginTop={10}
          textAlignVertical="center"
          width={null}
          placeholder={"San Farncisco"}
        />
        <TextInput
          onChangeText={this.textInputHandler("website")}
          value={this.state.website}
          marginTop={10}
          textAlignVertical="center"
          width={null}
          placeholder={WEBSITE}
        />
        <LabelSwitch
          label={I_AM_ORGANISER}
          onValueChange={this.handleOragniserMeChange.bind(this)}
          value={this.state.oragniserMe}
        />
        {!this.state.oragniserMe && (
          <TextInput
            onChangeText={this.textInputHandler("organiser")}
            value={this.state.organiser}
            marginTop={10}
            textAlignVertical="center"
            width={null}
            placeholder={"Rojyar Gandomi"}
          />
        )}
        <TextInput
          onChangeText={this.textInputHandler("comment")}
          value={this.state.comment}
          marginTop={10}
          textAlignVertical="center"
          multiline={true}
          numberOfLines={4}
          style={{ height: null }}
          width={null}
          placeholder={COMMENT}
        />
        <TouchableOpacity onPress={this.handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    padding: 30,
    flex: 1,
    paddingTop: Constants.statusBarHeight
  },
  label: {
    color: "#FFFFFF",
    marginTop: 10
  },
  organiserLabel: {
    color: "#FFFFFF",
    flex: 1
  },
  oragniserMeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  button: {
    marginTop: 20,
    marginBottom: 40,
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#005872"
  }
});
