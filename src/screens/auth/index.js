import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  YellowBox,
  ImageBackground,
  Platform
} from "react-native";

import TextInput from "../../components/TextInput";
import { withLabel } from "../../HOC";
import { userStore } from "@stores";
import { AuthConsumer } from "../../context/auth";
import translate from "@utils/translate";
import * as colors from "../../constants/colors";
import { SignUpWithFacebookButton, SignUpWithGoogleButton } from "@components";
import {
  loginWithGoogle,
  loginWithFacebook,
  getUser,
  loginWithApple
} from "@logics/auth";
import { getUserPromises } from "@logics/data-logic";
import * as AppleAuthentication from "expo-apple-authentication";

const GOOGLE = "Google";
const FACEBOOK = "Facebook";

const createAuthScreen = (
  authFunction,
  submitTitle,
  buttonTitle,
  buttonRoute
) => {
  return class AuthScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
      return {
        header: null
      };
    };

    handleLoginWithProvider(provider) {
      let status = "register";
      console.log("handle login");
      const providers = [GOOGLE, FACEBOOK];
      if (providers.indexOf(provider) === -1) {
        // TODO: Show error
        return;
      }
      this.showLoading();
      const self = this;
      new Promise((resolve, reject) => {
        if (provider === GOOGLE) {
          loginWithGoogle(resolve, reject, status);
        } else {
          loginWithFacebook(resolve, reject, status);
        }
      })
        .then(async () => {
          const user = getUser();
          const hasProfile = userStore.hasProfile;
          const promises = getUserPromises(user);
          await Promise.all(promises);
          console.log("User Info => " + user);
          const routeName = hasProfile ? "App" : "CreateProfile";
          this.props.navigation.navigate(routeName, {
            nextRoute: "SelectData"
          });
        })
        .catch(status => {
          self.dismissLoading();
          console.log("An error occurred", status);
        });
    }

    _signupWithApple() {
      console.log("handle apple signup");
      this.showLoading();
      let status = "register";
      new Promise((resolve, reject) => {
        loginWithApple(resolve, reject, status);
      })
        .then(async () => {
          const user = getUser();
          alert("user->", user);
          const hasProfile = userStore.hasProfile;
          const promises = getUserPromises(user);
          await Promise.all(promises);
          const routeName = hasProfile ? "App" : "CreateProfile";
          this.props.navigation.navigate(routeName, {
            nextRoute: "SelectData"
          });
        })
        .catch(status => {
          this.dismissLoading();
        })
        .then(async () => {
          const user = getUser();
          const hasProfile = userStore.hasProfile;
          const promises = getUserPromises(user);
          await Promise.all(promises);
          const routeName = hasProfile ? "App" : "CreateProfile";
          this.props.navigation.navigate(routeName, {
            nextRoute: "SelectData"
          });
        })
        .catch(status => {
          this.dismissLoading();
        })
        .then(async () => {
          const user = getUser();
          const hasProfile = userStore.hasProfile;
          const promises = getUserPromises(user);
          await Promise.all(promises);
          const routeName = hasProfile ? "NewResult" : "CreateProfile";
          this.props.navigation.navigate(routeName, {
            nextRoute: "SelectData"
          });
        })
        .catch(status => {
          this.dismissLoading();
        });
    }

    showLoading() {
      this.setState({ loading: true });
    }
    dismissLoading() {
      this.setState({ loading: false });
    }

    render() {
      return (
        <View style={styles.container} behavior="padding" enabled>
          <AuthConsumer>
            {({
              email,
              password,
              changeEmail,
              changePassword,
              submit,
              loading,
              error,
              errorMessage,
              reset
            }) => (
              <ScrollView>
                <ImageBackground
                  style={styles.bgImage}
                  source={require("./../../../assets/first-state.png")}
                >
                  <Text style={styles.headerText}>onRun</Text>
                </ImageBackground>
                <View style={styles.scrollContainer}>
                  {Platform.OS == "ios" && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={
                        AppleAuthentication.AppleAuthenticationButtonType
                          .CONTINUE
                      }
                      buttonStyle={
                        AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                      }
                      cornerRadius={5}
                      style={{ width: "100%", height: 50 }}
                      onPress={this._signupWithApple.bind(this)}
                    />
                  )}
                  <View style={styles.facebookButton}>
                    <SignUpWithGoogleButton
                      onPress={e => {
                        this.handleLoginWithProvider(GOOGLE);
                      }}
                    />
                  </View>
                  <View style={styles.facebookButton}>
                    <SignUpWithFacebookButton
                      onPress={e => {
                        this.handleLoginWithProvider(FACEBOOK);
                      }}
                    />
                  </View>
                  <View style={styles.or_border}>
                    <Text
                      style={{
                        color: colors.mainPurple,
                        fontSize: 12,
                        backgroundColor: "white",
                        fontWeight: "bold"
                      }}
                    >
                      OR
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("SignUpWithEmail")
                    }
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>
                      {translate("signup-with-email")}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.signInBtn}>
                    <Text style={styles.textFont}>
                      {translate("already-account")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.navigate("SignIn")}
                    >
                      <Text style={styles.forgetText}>
                        {translate("signin-")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </AuthConsumer>
        </View>
      );
    }
  };
};
export const LoginScreen = createAuthScreen(
  "signInWithEmailAndPassword",
  "Login",
  translate("login"),
  "Login"
);
export const RegisterScreen = createAuthScreen(
  "createUserWithEmailAndPassword",
  "Login",
  translate("login"),
  "Register"
);

const styles = StyleSheet.create({
  scrollContainer: {
    margin: 16,
    backgroundColor: "white",
    flex: 1,
    alignItems: "center"
  },
  container: {
    flex: 1
    // paddingTop: Constants.statusBarHeight
  },
  forgetText: {
    color: colors.dusk,
    fontSize: 12,
    fontFamily: "PoppinsBold"
  },
  facebookButton: {
    marginTop: 12
  },
  headerText: {
    fontSize: 40,
    color: colors.login_welcome,
    paddingLeft: 32,
    paddingTop: 24,
    fontFamily: "PoppinsBold"
  },
  or_border: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderColor: colors.whiteThree,
    height: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    width: "100%"
  },
  bgImage: {
    width: "100%",
    height: 372
  },
  signInBtn: {
    marginTop: 20,
    alignContent: "center",
    flex: 1,
    width: 208,
    flexDirection: "row"
  },
  textFont: {
    fontSize: 12,
    color: colors.mediumGrey,
    fontFamily: "PoppinsBold"
  },
  button: {
    marginTop: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.mainPurple,
    width: "100%",
    height: 50
  },
  buttonText: {
    color: "white",
    fontFamily: "PoppinsBold",
    fontSize: 12
  }
});

YellowBox.ignoreWarnings(["Setting a timer", ""]);
