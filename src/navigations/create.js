import React, { Component } from "react";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import * as colors from "@constants/colors";
import { CreateGroupRunScreen, EditGroupRunScreen } from "../screens";

const initialRouteName = "CreateGroupRun";
const headerMode = "screen";

const CreateStack = createStackNavigator(
  {
    CreateGroupRun: { screen: CreateGroupRunScreen },
    EditGroupRun: { screen: EditGroupRunScreen }
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

CreateStack.navigationOptions = {
  tabBarIcon: ({ tintColor }) => {
    return(
      <View style={{flex:1, 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    width: 80}}>
          <Ionicons size={25} name="md-add" color={tintColor} />
          <Text style={{fontSize: 12, color: tintColor, fontFamily: "PoppinsBold"}}>Create</Text>
      </View>
    );
  },
  // tabBarVisible: false
};

export default CreateStack;
