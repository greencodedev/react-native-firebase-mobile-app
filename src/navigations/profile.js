import React, { Component } from "react";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import { FontAwesome } from "@expo/vector-icons";
import { Text, View } from "react-native";
import {
  ProfileScreen,
  ConnectionsScreen,
  PersonalBestScreen,
  SettingsScreen,
  EditProfileScreen,
  NewResultScreen,
  CreateProfileScreen,
  CalendarScreen,
  CalendarMapScreen,
  SupportScreen,
  UnitsSettingsScreen,
  PrivacySettingsScreen,
  SearchUserScreen,
  BookmarkScreen,
  LanguageSettingsScreen,
  RefineScreen,
  UserTermsScreen,
  PrivacyPolicyScreen,
  VersionScreen,
  ContactScreen,
  HelpScreen,
  OpenSourceScreen,
  TrophiesScreen,
  NotificationScreen
} from "../screens";
import * as colors from "@constants/colors";
import { Achievements } from "./achieve";
import NotificationSettingsScreen from "../screens/settings/NotificationsSettingsScreen";

const initialRouteName = "Profile";
const headerMode = "screen";

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
const CalendarNavigations = createSwitchNavigator(
  {
    CalendarList: {
      screen: mapNavigationStateParamsToProps(CalendarScreen)
    },
    CalendarMap: { screen: mapNavigationStateParamsToProps(CalendarMapScreen) }
  },
  {
    headerMode: "none"
  }
);
export const Calendar = {
  screen: CalendarNavigations,
  navigationOptions: {
    header: null
  }
};

const ProfileStack = createStackNavigator(
  {
    Profile: { screen: ProfileScreen },
    Connections: { screen: ConnectionsScreen },
    PersonalBest: { screen: PersonalBestScreen },
    Settings: { screen: SettingsScreen },
    EditProfile: { screen: EditProfileScreen },
    NewResult: { screen: NewResultScreen },
    CreateProfile: { screen: CreateProfileScreen },
    Calendar,
    Bookmark: { screen: BookmarkScreen },
    Support: { screen: SupportScreen },
    NotificationSetting: { screen: NotificationSettingsScreen },
    Language: { screen: LanguageSettingsScreen },
    Units: { screen: UnitsSettingsScreen },
    Privacy: { screen: PrivacySettingsScreen },
    SearchUser: { screen: SearchUserScreen },
    Refine: { screen: RefineScreen },
    TermsAgreement: { screen: UserTermsScreen },
    PrivacyPolicy: { screen: PrivacyPolicyScreen },
    Version: { screen: VersionScreen },
    Contact: { screen: ContactScreen },
    Help: { screen: HelpScreen },
    OpenSource: { screen: OpenSourceScreen },
    Trophies: { screen: TrophiesScreen }, //// 09-15
    Notification: { screen: NotificationScreen }
  },
  {
    initialRouteName,
    headerMode,
    defaultNavigationOptions: {
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
    },
    navigationOptions: {
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
            <FontAwesome size={24} name="user" color={tintColor} />
            <Text
              style={{
                fontSize: 12,
                color: tintColor,
                fontFamily: "PoppinsBold"
              }}
            >
              Profile
            </Text>
          </View>
        );
      }
    }
  }
);

export default ProfileStack;
