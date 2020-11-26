import React, { Component } from "react";

import AppContainer from "./src/navigations";
import { SettingProvider } from "./src/context/settings";
import { AuthProvider } from "./src/context/auth";
import { AppLoading} from 'expo';
import * as Font from 'expo-font';
import {decode, encode} from 'base-64'

if (!global.btoa) {  global.btoa = encode }

if (!global.atob) { global.atob = decode }
export default class App extends Component {

  async componentDidMount() {
    try {
      await Font.loadAsync({
        PoppinsBold: require('./assets/fonts/Poppins-Bold.ttf'),
        PoppinsRegular: require('./assets/fonts/Poppins-Regular.otf')
      })
    } catch(error) {
      console.log('error loading fonts ',  error);
    }
  }

  render() {
    return (
      <SettingProvider>
        <AuthProvider>
          <AppContainer />
        </AuthProvider>
      </SettingProvider>
    );
  }
}
