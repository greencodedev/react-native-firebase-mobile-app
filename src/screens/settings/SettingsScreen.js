import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import translate from "@utils/translate";

import * as colors from "@constants/colors";
import { logout, getUser } from "@logics/auth";
import Constants from 'expo-constants';

const handleLogout = navigation => {
  Alert.alert(
    "",
    translate("logout"),
    [
      { text: translate("cancel"), onPress: () => {}, style: "cancel" },
      {
        text: translate("yes"),
        onPress: () => {
          new Promise((resolve, reject) => {
            logout(resolve, reject);
          })
            .then(() => {
              const routeName = "Login";
              navigation.navigate(routeName);
            })
            .catch(status => {
              console.log("An error occurred", status);
            });
        }
      }
    ],
    { cancelable: false }
  );
};

const settingsScreens = [
  { key: "edit", label: "setting-item-profile", routeName: "Edit" },
  { key: "add", label: "setting-add-results", routeName: "Add" },
  { key: "privacy", label: "setting-item-privacy", routeName: "Privacy" },
  { key: "notif", label: "setting-item-notification", routeName: "NotificationSetting" },
  { key: "unit", label: "setting-item-unit", routeName: "Units" },
  { key: "support", label: "setting-item-support", routeName: "Support" },
];

export default class SettingsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  handleEditProfile() {
    const { navigation } = this.props;
    const user = getUser();
    navigation.navigate("EditProfile", {
      navigator: navigation,
      user: user,
      nextRoute: "Profile"
    });
  }
  handleAddResults() {
    const { navigation } = this.props;
    const user = getUser();
    navigation.navigate("NewResult", {
      navigator: navigation,
      user: user,
      nextRoute: "Profile",
      pastNav: "Settings"
    });
  }
  handleShare() {
    Share.share({
      message: "React Native | A framework for building native apps using React"
    });
  }
  renderItem = ({ item }) => {
    const { label, routeName } = item;
    const onPress = () =>
      routeName === "Edit"
        ? this.handleEditProfile()
        : routeName === "Add"
        ? this.handleAddResults()
        : routeName === "Share"
        ? this.handleShare()
        : this.props.navigation.navigate(routeName);
    return (
      <TouchableOpacity
        style={[styles.item, item.style]}
        onPress={onPress.bind(this)}
      >
        <Text style={styles.itemText}>{translate(label)}</Text>
        <FontAwesome
          name="chevron-right"
          size={10}
          style={{ color: colors.mainPurple  }}
        />
      </TouchableOpacity>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleStyle}>
            <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.props.navigation.goBack()}>
              <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
              <Text style={styles.backTxtStyle}>Back</Text>
            </TouchableOpacity>
            <View style={styles.titleViewStyle}>
              <Text style={styles.titleTxtStyle}>Settings</Text>
            </View>
        </View>
        <FlatList
          extraData={this.props.screenProps}
          data={settingsScreens}
          renderItem={this.renderItem}
          style = {styles.list}
        />
        <View style = {styles.logout}>
          <TouchableOpacity style = {styles.logoutBtn} onPress = {() => handleLogout(this.props.navigation)}>
            <Text style = {styles.logoutTxt}>Logout</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 4,
    paddingRight: 5,
    borderTopWidth: 1,
    borderColor: colors.whiteThree,
  },
  itemText: {
    flex: 1,
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple,
  },
  container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    marginTop: Constants.statusBarHeight,
  },
  titleStyle: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnStyle: {
    flexDirection: "row", 
    alignItems: 'center',
    color: colors.mediumGrey,
    width: '20%',
  },
  titleViewStyle: {
    justifyContent: 'center', 
    textAlign: 'center', 
    width: '60%', 
  },
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    textAlign: 'center',
    fontSize: 19,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8,
  },  
  logout: {
    flex: 1,
    paddingBottom: 16,
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  logoutBtn: {
    textAlign: "center",
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: "center",
    borderRadius: 4,
    backgroundColor: colors.dusk,
    height: 52,
  },
  logoutTxt: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.white,
  }
});
