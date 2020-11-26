import React, { Component } from "react";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { FontAwesome } from "@expo/vector-icons";
import { Text, View } from "react-native";
import * as colors from "@constants/colors";
import { FeedScreen } from "../screens";

const initialRouteName = "Feed";
const headerMode = "screen";

const HomeStack = createStackNavigator(
  {
    Feed: { screen: FeedScreen }
  },
  {
    initialRouteName,
    headerMode,
    navigationOptions: {
      gesturesEnabled: false,
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerBackTitle: null,
      headerTintColor: "#FFFFFF",
      headerTitleStyle: {
        fontSize: 17,
        color: "#FFFFFF",
        fontFamily: "PoppinsBold",
      }
    }
  }
);

HomeStack.navigationOptions = {
  tabBarIcon: ({ tintColor }) => {
    return(
      <View style={{flex:1, justifyContent: 'center', alignItems: 'center' , width: 50}}>
          <FontAwesome size={24} name="home" color={tintColor} />
            <Text style={{fontSize: 12, color: tintColor, fontFamily: "PoppinsBold"}}>Home</Text>
      </View>
    );
  },
  // tabBarVisible: false
};

export default HomeStack;
