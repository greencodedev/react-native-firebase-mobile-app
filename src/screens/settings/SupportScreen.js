import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import translate from "@utils/translate";
import Constants from "expo-constants";
import * as colors from "@constants/colors";

const settingsScreens = [
  { key: "contact", label: "support-item-contact", routeName: "Contact" },
  { key: "help", label: "support-item-help", routeName: "Help" },
  { key: "version", label: "support-item-version", routeName: "Version" },
  // { key: "legal", label: "support-item-legal", routeName: "Legal" },
  { key: "terms", label: "support-item-terms", routeName: "TermsAgreement" },
  { key: "privacy", label: "support-item-privacy", routeName: "PrivacyPolicy" }
];

export default class SettingsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };

  renderItem = ({ item }) => {
    const { label, routeName } = item;
    const onPress = () => this.props.navigation.navigate(routeName);
    return (
      <TouchableOpacity
        style={[styles.item, item.style]}
        onPress={onPress.bind(this)}
      >
        <Text style={styles.itemText}>{translate(label)}</Text>
        <FontAwesome
          name="chevron-right"
          size={10}
          style={{ color: colors.mainPurple }}
        />
      </TouchableOpacity>
    );
  };
  render() {
    return (
      <View style={styles.container}>
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
          <View style={styles.titleViewStyle}>
            <Text style={styles.titleTxtStyle}>Support</Text>
          </View>
        </View>
        <FlatList
          extraData={this.props.screenProps}
          data={settingsScreens}
          renderItem={this.renderItem}
          style={styles.list}
        />
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
    borderColor: colors.whiteThree
  },
  itemText: {
    flex: 1,
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    // marginTop: 8,
    paddingTop: Constants.statusBarHeight
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8
  },
  titleStyle: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  backBtnStyle: {
    flexDirection: "row",
    alignItems: "center",
    color: colors.mediumGrey,
    width: "20%"
  },
  titleViewStyle: {
    justifyContent: "center",
    textAlign: "center",
    width: "60%"
  },
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    textAlign: "center",
    fontSize: 19,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  }
});
