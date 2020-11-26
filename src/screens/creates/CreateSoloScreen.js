import React, { Component } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Keyboard
} from "react-native";
import { Calendar } from "react-native-calendars";

import * as colors from "@constants/colors";
import { TextInput, LabelSwitch, CheckBox } from "@components";
import { userStore } from "@stores";
import { createEvent } from "../../logics/data-logic";
import Constants from 'expo-constants';

const RACE_NAME = "Race Name";
const WEBSITE = "Website";
const ORGANISER = "Organiser";
const TIME_RACE = "Time Race";
const DISTANCE = "Distance";
const DATE = "Date";
const COMMENT = "Comment";
const I_AM_ORGANISER = "I am the organiser?";

export default class CreateSoloScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      date: "2018-05-11",
      starttime: null,
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
      website: "",
      organiser: "",
      oragniserMe: true,
      comment: "",
      share: {
        facebook: false
      }
    };
    this.handleTextInputChange = this.handleTextInputChange.bind(this);
    this.handleOragniserMeChange = this.handleOragniserMeChange.bind(this);
    this.handleStartDatePress = this.handleStartDatePress.bind(this);
    this.handleTimeRaceChange = this.handleTimeRaceChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  textInputHandler = key => value => this.handleTextInputChange(key, value);
  handleTextInputChange(key, value) {
    this.setState({ [key]: value });
  }
  handleOragniserMeChange(value) {
    this.setState({ oragniserMe: value });
  }
  handleStartDatePress({ dateString }) {
    this.setState({ date: dateString });
  }
  handleTimeRaceChange(value) {
    this.setState({ timerace: value });
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
    const type = "solo";
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
    return (
      <ScrollView style={styles.container}>
        <TextInput
          onChangeText={this.textInputHandler("name")}
          value={this.state.name}
          textAlignVertical="center"
          width={null}
          placeholder={RACE_NAME}
        />
        <Text style={[styles.label, { width: "100%", textAlign: "center" }]}>
          {DATE}
        </Text>
        <Calendar
          style={{ marginTop: 10 }}
          current={"2018-05-10"}
          markedDates={{
            [this.state.date]: { selected: true, selectedColor: colors.primary }
          }}
          minDate={"2018-05-10"}
          maxDate={"2032-05-30"}
          onDayPress={day => this.handleStartDatePress(day)}
          monthFormat={"MMM yyyy"}
        />
        <TextInput
          onChangeText={this.textInputHandler("starttime")}
          value={this.state.starttime}
          keyboardType={"numeric"}
          marginTop={10}
          textAlignVertical="center"
          width={null}
          placeholder={"6 PM"}
        />
        <TextInput
          onChangeText={this.textInputHandler("distance")}
          value={this.state.distance}
          keyboardType={"numeric"}
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
