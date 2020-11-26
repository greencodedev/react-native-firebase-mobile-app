import React, { Component } from "react";
import { View } from "react-native";
import { createSwitchNavigator, createStackNavigator } from "react-navigation";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

import * as colors from "@constants/colors";
import { HeaderTabs } from "../components";
import {
  CreateSoloScreen,
  CreateClubScreen,
  CreateRaceScreen
} from "../screens";

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

const AchievementsNavigations = createSwitchNavigator(
  {
    Solo: { screen: mapNavigationStateParamsToProps(CreateSoloScreen) },
    Club: { screen: mapNavigationStateParamsToProps(CreateClubScreen) },
    Race: { screen: mapNavigationStateParamsToProps(CreateRaceScreen) }
  },
  {
    headerMode: "none"
  }
);

export const Creates = {
  screen: AchievementsNavigations,
  navigationOptions: ({ navigation }) => {
    const tabsArray = [
      { id: 0, title: "Solo", screen: "Solo" },
      { id: 1, title: "Club", screen: "Club" },
      { id: 2, title: "Race", screen: "Race" }
    ];
    const headerTitle = (
      <HeaderTabs
        onPress={id => navigation.navigate(tabsArray[id].screen)}
        tabsArray={tabsArray}
      />
    );
    return {
      headerTitle
    };
  }
};

const CreateNavigations = createStackNavigator(
  {
    Creates
  },
  {
    initialRouteName: "Creates",
    headerMode: "screen",
    defaultNavigationOptions: {
      gesturesEnabled: false,
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerTintColor: "#FFFFFF",
      headerTitleStyle: {
        fontSize: 17,
        color: "#FFFFFF",
        fontWeight: "normal"
      }
    },
    navigationOptions: {
      tabBarIcon: ({tintColor}) => {
        return (
          <View style={{position: 'absolute', bottom: 5}}>
            <FontAwesome size={50} name="plus-circle" color={tintColor} />
          </View>
        )
      }
    }
  }
);

export default CreateNavigations;
