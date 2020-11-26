import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ToggleSwitch from 'rn-toggle-switch';

import translate from "@utils/translate";
import { Row } from "@components";
import { unitSettings, SettingConsumer } from "../../context/settings";
import * as colors from "@constants/colors";
import Constants from 'expo-constants';

export default class UnitsSettingsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      unit: [],
    };
  }
  renderItem = (unit, changeUnit, { item }) => {
    item.options.map((option, index) => {
      if(option.value == 0)
        activeText = translate(option.label);
      else
        inactiveText = translate(option.label);
    })
    activeColor = "rgba(237, 27, 93, 0.05)";
    inactiveColor = "rgba(237, 27, 93, 0.05)";
    activeBorderColor = colors.dusk;
    inactiveBorderColor = colors.dusk;
    sliderColor = 'white';
    width = 50;
    radius = 11.5;
    // initialActiveState = false;
    initialActiveState = unit[item.key] == 1 ? false : true;
    disabled = false;
    return (
      <Row style={styles.item} key={item.key}>
        <Text style={styles.itemText}>{translate(item.title)}</Text>
        <View style={{
            flex: 1,
            marginLeft: 4,
            height: 23,
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}>
          <ToggleSwitch
              text={{ on: activeText, off: inactiveText, activeTextColor: colors.dusk, inactiveTextColor: colors.dusk}}
              textStyle={styles.switchTxt}
              color={{
                indicator: sliderColor,
                active: activeColor,
                inactive: inactiveColor,
                activeBorder: activeBorderColor,
                inactiveBorder: inactiveBorderColor
              }}
              active={initialActiveState}
              disabled={disabled}
              width={width}
              radius={radius}
              onValueChange={(val) => {
                val == true ? value = 0 : value = 1
                this.state.unit[item.key] = value
                changeUnit(item.key, value)
              }}
            />
        </View>
      </Row>
    );
  };

  async saveUnit() {
    try{
      unitSettings.map(item, async() => {        
        await AsyncStorage.setItem(item.title, this.state.unit[item.key]);  
      });
    } catch(e) {
      console.log(e)
    }
  }
  render() {
    return (
      <View style = {styles.container}>
        <View style = {styles.titleStyle}>
            <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.props.navigation.goBack()}>
              <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
              <Text style={styles.backTxtStyle}>Back</Text>
            </TouchableOpacity>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTxtStyle}>Units</Text>
            </View>
            {/* <TouchableOpacity style={styles.saveBtnStyle} onPress={() => this.saveUnit()}>
              <Text style={styles.saveTxtStyle}>Save</Text>
            </TouchableOpacity> */}
        </View>
        <SettingConsumer>
          {({ unit, changeUnit }) => (
            <FlatList
              extraData={unit}
              data={unitSettings}
              renderItem={row => this.renderItem(unit, changeUnit, row)}
              style={{flex: 1}}
            />
          )}
        </SettingConsumer>
        
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
    paddingTop: Constants.statusBarHeight
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingLeft: 4,
    borderTopWidth: 1,
    borderColor: colors.whiteThree,
    height: 55,
  },
  itemText: {
    flex: 1,
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey
  },
  titleStyle: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleViewStyle: {
    justifyContent: 'center', 
    textAlign: 'center', 
    width: '60%', 
  },
  backBtnStyle: {
    flexDirection: "row", 
    alignItems: 'center',
    color: colors.mediumGrey,
    width: '20%',
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
    textAlign: 'center',
    fontSize: 19, 
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  saveBtnStyle: {
    width: '20%',
    color: colors.mediumGrey,
    alignContent: 'flex-end',
    alignItems: 'flex-end'
  },
  saveTxtStyle: {
    opacity: 1,
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  },
  switchTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 8,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
  }

});
