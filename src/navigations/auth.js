import React from "react";
import { createStackNavigator, createSwitchNavigator } from "react-navigation";
import * as colors from "../constants/colors";

import {
  LoginScreen,
  EditProfileScreen,
  RefineScreen,
  RegisterScreen,
  ResetPasswordScreen,
  SignInScreen,
  SignUpWithEmailScreen,
  CreateProfileScreen,
  NewResultScreen,
  SelectDataScreen,
  PastRaceScreen,
  WelcomeScreen,
  UserTermsScreen,
  PrivacyPolicyScreen
} from "../screens";

const headerMode = "screen";

const Register = createSwitchNavigator(
  {
    Login: { screen: LoginScreen },
    Register: { screen: RegisterScreen }
  },
  {
    navigationOptions: {
      header: null
    }
  }
);
export default createStackNavigator(
  {
    Register,
    ResetPassword: { screen: ResetPasswordScreen },
    EditProfile: { screen: EditProfileScreen },
    Refine: { screen: RefineScreen },
    SignIn: { screen: SignInScreen},
    SignUpWithEmail: { screen: SignUpWithEmailScreen},
    CreateProfile: { screen: CreateProfileScreen},
    NewResult: { screen: NewResultScreen },
    SelectData: { screen: SelectDataScreen },
    PastRace: { screen: PastRaceScreen },
    Welcome: { screen: WelcomeScreen },
    TermsAgreement: { screen: UserTermsScreen },
    PrivacyPolicy: { screen: PrivacyPolicyScreen }
  },
  {
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
        fontWeight: "normal"
      }
    }
  }
);
