import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import * as R from "ramda";
import SwitchSelector from "react-native-switch-selector";
import { MaterialIcons } from "@expo/vector-icons";
import { StackActions } from "react-navigation";
// import { MapView } from "expo";
import MapView from 'react-native-maps';
import moment from "moment";

const { Marker } = MapView;

import { getUser } from "@logics/auth";

import { userStore } from "@stores";
import * as colors from "@constants/colors";
import translate from "@utils/translate";
import Constants from 'expo-constants';

const extractYear = str => {
  return str.substring(0, 4);
};

export default class AchievementsMapScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: null,
        };
    };
    constructor(props) {
        super(props);
        this.state = {
        year: 0,
        selectedItem: '',
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
        return (
            <View style={styles.containerStyle}>
                <View style={{ height: '14.5%'}}>
                    <View style={styles.headerStyle}>
                        <TouchableOpacity style={{ justifyContent: 'flex-start'}} onPress={() => this.props.navigation.navigate('Profile')}>
                            <MaterialIcons name="arrow-back" color={colors.mainPurple} style={{ fontSize: 25 }} />
                        </TouchableOpacity>
                        <View style={{ justifyContent: 'center', width: '90%'}}>
                            <Text style={styles.titleStyle}>{translate("header-calendar")}</Text>
                        </View>
                        <TouchableOpacity style={{ position: 'absolute', right: 0, top: 5}}>
                            <MaterialIcons name="share" color={colors.mainPurple} style={{ fontSize: 25 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                        <SwitchSelector
                            initial={1}
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
                </View>
                <View style={styles.map}>
                    <MapView
                        style={StyleSheet.absoluteFillObject}
                        onPress={e => console.log(e.nativeEvent.coordinate)}
                        zoomEnabled={true}
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
        this.setState({ year });
    }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: 'center', 
    marginLeft: 16, 
    marginRight: 16, 
    paddingTop: Constants.statusBarHeight
  },
  map: {
    backgroundColor: "#FFFFFF",
    height: '85.5%',
    marginLeft: -16,
    marginRight: -16,
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
