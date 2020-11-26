import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Button } from "react-native";
import { Agenda } from "react-native-calendars";
import * as R from "ramda";
import moment from "moment";
import SwitchSelector from "react-native-switch-selector";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import StackActions from 'react-navigation';
import { userStore } from "@stores";
import * as colors from "@constants/colors";
import { ProfileImage, RacesCalendarList } from "@components";
import translate from "@utils/translate";
import { getUser } from "@logics/auth";
import Constants from 'expo-constants';

const extractYear = str => {
  return str.substring(0, 4);
};

export default class AgendaScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      selectedItem: '',
      year: 0,
      type: '',
    };
  }
  getSelectedSwitchValue(value) {
    this.setState({ selectedItem: value });
    this.props.navigation.navigate(value);
  }
  render() {
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const {
      params: { type = "achievements" } = {}
    } = this.props.navigation.state;
    console.log("type1 => " + type);
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
      this.state.year !== 0 ? R.filter(filter, achievements) : achievements;

    const flag = 1;
    return (
      <View style={styles.container}>
        <View style={styles.headerStyle}>
          <TouchableOpacity style={{ justifyContent: 'flex-start', width: '10%'}} onPress={() => this.props.navigation.navigate('Profile')}>
            <MaterialIcons name="arrow-back" color={colors.mainPurple} style={{ fontSize: 25 }} />
          </TouchableOpacity>
          <View style={{ justifyContent: 'center', width: '80%'}}>
            <Text style={styles.titleStyle}>{translate("header-calendar")}</Text>
          </View>
          <View style={{ flexDirection: 'row', position: 'absolute', right: 5, top: 5, width: '10%'}}>
            <TouchableOpacity>
              <MaterialIcons name="share" color={colors.mainPurple} style={{ fontSize: 25 }} />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialIcons name="add" color={colors.mainPurple} style={ flag ? { fontSize: 25, display: 'flex' }: { display: 'none' }} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent: 'center'}}>
          <SwitchSelector
            initial={0}
            onPress={this.getSelectedSwitchValue.bind(this)}
            textColor={colors.mainPurple}
            selectedColor={colors.whiteTwo}
            buttonColor={colors.mainPurple}
            borderColor={colors.mainPurple}
            hasPadding
            options={[
              {label: 'List', value: 'CalendarList'},
              {label: 'Map', value: 'CalendarMap'},
            ]}
            animationDuration='100'
            style={styles.switchSelectorStyle}
            height={30}
          />
        </View>
        <RacesCalendarList
          onPress={this.handleAchievementPress.bind(this)}
          data={races}
        />
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
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', 
    marginLeft: 16, 
    marginRight: 16, 
    backgroundColor: colors.white, 
    paddingTop: Constants.statusBarHeight
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    flexDirection: "row",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  itemText: {
    color: "#005872",
    fontWeight: "bold"
  },
  itemLocation: {
    color: colors.primary
  },
  itemComment: {
    marginTop: 15
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  },
  headerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 5,
    paddingBottom: 5,
  },
  titleStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 19,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple,
    textAlign: 'center', 
  },
  switchSelectorStyle: {
    width: '40%', 
    fontSize: 13, 
    fontWeight: "600", 
    justifyContent: 'center', 
    alignSelf: 'center',
    marginBottom: 10,
  },
});
