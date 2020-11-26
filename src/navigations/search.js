import React, { Component } from "react";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { FontAwesome } from "@expo/vector-icons";
import { Text, View } from "react-native";
import * as colors from "@constants/colors";
import { SearchUserScreen, EventScreen, UserEventScreen, EventStatusScreen } from "../screens";

const initialRouteName = "Search";
const headerMode = "screen";

const HomeStack = createStackNavigator(
  {
    Search: { screen: SearchUserScreen },
    Event: { screen: EventScreen },
    UserEvent: { screen: UserEventScreen },
    EventStatus: { screen: EventStatusScreen }
  },
  {
    initialRouteName,
    headerMode,
    navigationOptions: ({ navigation }) => ({
      gesturesEnabled: false,
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerBackTitle: null,
      headerTintColor: "#FFFFFF",
      headerTitleStyle: {
        fontSize: 17,
        color: "#FFFFFF",
        fontFamily: "PoppinsBold"
      }
    })
  }
);

HomeStack.navigationOptions = {
  tabBarIcon: ({ tintColor }) => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: 50
        }}
      >
        <FontAwesome size={24} name="search" color={tintColor} />
        <Text
          style={{
            fontSize: 12,
            color: tintColor,
            fontFamily: "PoppinsBold"
          }}
        >
          Search
        </Text>
      </View>
    );
  }
  // tabBarVisible: false
};

export default HomeStack;
