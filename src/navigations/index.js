import React from "react";
import { createSwitchNavigator, createAppContainer } from "react-navigation";

import { SplashScreen } from "../screens";
import { SettingConsumer } from "@context/settings";

import Auth from "./auth";
import App from "./app";

const Splash = {
  screen: SplashScreen
};

const initialRouteName = "Splash";

const AppNavigator = createSwitchNavigator(
  {
    Splash,
    Auth,
    App
  },
  {
    initialRouteName
  }
);

const WrappedWithContainer = createAppContainer(AppNavigator);

export default class AppContainer extends React.PureComponent {
  render() {
    return (
      <SettingConsumer>
        {({ language, handleNavigationChange }) => (
          <WrappedWithContainer
            screenProps={{ language }}
            onNavigationStateChange={handleNavigationChange}
          />
        )}
      </SettingConsumer>
    );
  }
}
