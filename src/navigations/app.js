import React from "react";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";

import * as colors from "@constants/colors";
import SearchNavigations from "./search";
import AchievementsNavigations from "./achieve";
import CreateNavigations from "./create";
import ProfileNavigations from "./profile";
import HomeNavigations from "./home";

const initialRouteName = "Achievements";

export default createMaterialBottomTabNavigator(
  {
    Home: HomeNavigations, // TODO: For next version
    Search: SearchNavigations,
    Create: CreateNavigations, // TODO: For next version
    Achievements: AchievementsNavigations,
    Profile: ProfileNavigations
  },
  {
    initialRouteName,
    labeled: false,
    activeTintColor: '#7b6fcf',
    inactiveTintColor: colors.tab_inactive,
    barStyle: { backgroundColor: colors.tab_background },
    navigationOptions: {
      gesturesEnabled: false
    }
  }
);
