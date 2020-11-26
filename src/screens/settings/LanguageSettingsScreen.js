import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import translate from "@utils/translate";
import { StackActions, NavigationActions } from "react-navigation";

import * as colors from "../../constants/colors";
import { SettingConsumer } from "../../context/settings";
import { FlatList } from "react-native-gesture-handler";
import { languages } from "@utils/translate";
import Constants from 'expo-constants';

export default class SupportScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: translate("header-change-language")
  });
  render() {
    return (
      <SettingConsumer>
        {({ changeLanguage }) => (
          <FlatList
            data={languages}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.element}
                onPress={() =>
                  this.handleLanguageChange(changeLanguage, item.code)
                }
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SettingConsumer>
    );
  }
  handleLanguageChange(action, value) {
    console.log({ value });
    action(value);
    this.props.navigation.goBack();
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: Constants.statusBarHeight
  },
  element: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.primary
  },
  text: {
    color: "#FFFFFF",
    fontSize: 20
  },
  link: {
    color: "black"
  }
});
