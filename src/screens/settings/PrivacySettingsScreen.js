import React, { Component } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ToggleSwitch from 'rn-toggle-switch';

import translate from "@utils/translate";
import { Row } from "@components";
import { privacySettings, SettingConsumer } from "../../context/settings";
import * as colors from "@constants/colors";
import Constants from 'expo-constants';
import {
  getUser,
  fetchUser,
  updateUserPrivacy
} from "../../logics/auth";

export default class PrivacySettingsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      privacy: [],
      loading: false,
      flag: false
    };
  }
  renderItem = (privacy, changePrivacy, { item }) => {
    activeColor = "rgba(237, 27, 93, 0.05)";
    inactiveColor = "rgba(237, 27, 93, 0.05)";
    activeBorderColor = colors.dusk;
    inactiveBorderColor = colors.dusk;
    sliderColor = 'white';
    width = 100;
    radius = 11.5;
    initialActiveState = privacy[item.key] == 1 ? true : false;
    this.state.privacy[item.key] = privacy[item.key];
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
              text={{ on: 'Only my Followers', off: 'Public', activeTextColor: colors.dusk, inactiveTextColor: colors.dusk}}
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
                val ? value = 1 : value = 0
                this.state.privacy[item.key] = value
                changePrivacy(item.key, value)
                this.state.flag = true
              }}
            />
        </View>
      </Row>
    );
  };
  async savePrivacy() {
    if (!this.state.flag) this.props.navigation.goBack()
    this.setState({ loading: true });
    const fields = [
      ["achievePrivacy"],
      ["pbPrivacy"],
      ["podiumPrivacy"],
      ["followPrivacy"],
      ["clubPrivacy"],
      ["calenderPrivacy"]
    ];
    let info = {};
    fields.map(f => {
      info[f] = this.state.privacy[f] != undefined ? this.state.privacy[f] : 0;
    });
    updateUserPrivacy(info)
      .then(async () => {
        await fetchUser(getUser().uid, true);
        
        this.props.navigation.goBack()
      })
      .catch(e => {
        console.log(e);
        this.setState({
          loading: false,
          error: true,
          errorMessage: "An error occurred!"
        });
      });
      // this.setState({ loading: false });
  }
  render() {
    if (this.state.loading) {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
          <Text style={{ fontSize: 16 }}>Please wait until privacy settings are saved.</Text>
        </View>
      )
    }
    return (
      <View style = {styles.container}>
        <View style = {styles.titleStyle}>
            <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.savePrivacy()}>
              <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
              <Text style={styles.backTxtStyle}>Back</Text>
            </TouchableOpacity>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTxtStyle}>Privacy</Text>
            </View>
            {/* <TouchableOpacity style={styles.saveBtnStyle} onPress={() => this.savePrivacy()}>
              <Text style={styles.saveTxtStyle}>Save</Text>
            </TouchableOpacity> */}
        </View>
        <SettingConsumer>
        {({ privacy, changePrivacy }) => (
          <FlatList
            extraData={privacy}
            data={privacySettings}
            renderItem={row => this.renderItem(privacy, changePrivacy, row)}
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
    alignContent: 'center',
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
    // position: 'absolute',
    // width: '100%',
    // top: -24,
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
