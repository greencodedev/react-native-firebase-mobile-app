import React, { Component } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import {
  createSwitchNavigator,
  createStackNavigator,
  StackActions
} from "react-navigation";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

import * as colors from "@constants/colors";
import { HeaderTabs } from "../components";
import {
  AchievementsListScreen,
  AchievementsMapScreen,
  AddAchievementScreen,
  AchievementScreen,
  PhotoScreen
} from "../screens";
import translate from "@utils/translate";

const mapNavigationStateParamsToProps = Screen => {
  return class extends Component {
    render() {
      const { navigation } = this.props;
      const {
        state: { params }
      } = navigation;
      return <Screen {...this.props} {...params} />;
    }
  };
};

const ListMapNavigations = createSwitchNavigator(
  {
    AchievementsList: {
      screen: mapNavigationStateParamsToProps(AchievementsListScreen)
    },
    AchievementsMap: { 
      screen: mapNavigationStateParamsToProps(AchievementsMapScreen) 
    }
  },
  {
    headerMode: "none"
  }
);

export const Achievements = {
  screen: ListMapNavigations,
  navigationOptions: {
    header: null
  }
};

const AchievementsNavigations = createStackNavigator(
  {
    Achievements,
    AddAchievement: { screen: AddAchievementScreen },
    Achievement: { screen: AchievementScreen },
    EditAchievement: { screen: AddAchievementScreen },
    AchievementPhoto: { screen: PhotoScreen }
  },
  {
    initialRouteName: "Achievements",
    headerMode: "screen",
    defaultNavigationOptions: {
      gesturesEnabled: false,
      headerBackTitle: null,
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerTintColor: "#FFFFFF",
      headerTitleStyle: {
        fontSize: 17,
        color: "#FFFFFF",
        fontFamily: "PoppinsBold",
      }
    },
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => {
        return(
          <View style={{flex:1, justifyContent: 'center', alignItems: 'center' , width: 100}}>
              <FontAwesome size={24} name="trophy" color={tintColor} />
              <Text style={{fontSize: 12, color: tintColor, fontFamily: "PoppinsBold"}}>Achievements</Text>        
          </View>
        );
      }
    }
  }
);

export default AchievementsNavigations;
