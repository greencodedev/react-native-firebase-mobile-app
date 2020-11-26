import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  AsyncStorage,
  Button
} from "react-native";
import Constants from "expo-constants";

import TextInput from "../../components/TextInput";
import { withLabel } from "../../HOC";
import { AuthConsumer } from "@context/auth";
import * as colors from "@constants/colors";
import { TextField } from "react-native-material-textfield";
import { LogInWithGoogleButton, LogInWithFacebookButton } from "@components";
import { loginWithGoogle, loginWithFacebook, getUser } from "@logics/auth";
import { loginWithApple } from "./../../logics/auth";
import PasswordInputText from "react-native-hide-show-password-input";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { userStore } from "@stores";
import { getUserPromises } from "@logics/data-logic";
import { fetchUser } from "../../logics/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import { useStore } from "react-redux";

const LabeledTextInput = withLabel(TextInput);
const GOOGLE = "Google";
const FACEBOOK = "Facebook";

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appleUser: null,
      credentials: null,
      isAvailable: false,
      credentialState: 0,
      clientSecret: "",
      clientId: "com.app.onrun"
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  handleBackButtonPress = () => {
    return false;
  };

  showLoading() {
    this.setState({ loading: true });
  }

  dismissLoading() {
    this.setState({ loading: false });
  }

  async componentDidMount() {
    // await this.getClientSecret().then(res=> {
    //   console.log("res-", res);
    //   this.setState({
    //     clientSecret: res
    //   })
    // })
  }

  handleLoginWithProvider(provider) {
    let status = "login";
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
        const routeName = hasProfile ? "App" : "EditProfile";
        this.props.navigation.navigate(routeName, { nextRoute: "SelectData" });
      })
      .catch(status => {
        self.dismissLoading();
        console.log("error->", status);
      });
  }

  async getUserIdentifier(): Promise<string> {
    return (
      (this.state.credentials && this.state.credentials.user) ||
      this.state.credentials.user
    );
  }

  _loginWithApple() {
    console.log("handle apple login");
    this.showLoading();
    let status = "login";
    new Promise((resolve, reject) => {
      loginWithApple(resolve, reject, status);
    })
      .then(async () => {
        const user = getUser();
        const hasProfile = userStore.hasProfile;
        const promises = getUserPromises(user);
        await Promise.all(promises);
        const routeName = hasProfile ? "App" : "EditProfile";
        this.props.navigation.navigate(routeName, { nextRoute: "SelectData" });
      })
      .catch(status => {
        this.dismissLoading();
      })
      .then(async () => {
        const user = getUser();
        const hasProfile = userStore.hasProfile;
        const promises = getUserPromises(user);
        await Promise.all(promises);
        const routeName = hasProfile ? "App" : "EditProfile";
        this.props.navigation.navigate(routeName, { nextRoute: "SelectData" });
      })
      .catch(status => {
        this.dismissLoading();
      });
  }
  render() {
    const EMAIL = "Email";
    const PASSWORD = "Password";
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
            <ScrollView
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.scrollContainer}
            >
              <View style={styles.titleStyle}>
                <TouchableOpacity
                  style={styles.backBtnStyle}
                  onPress={() => this.props.navigation.goBack()}
                >
                  <Ionicons
                    name="md-arrow-back"
                    color={colors.mediumGrey}
                    style={{ fontSize: 20 }}
                  />
                  <Text style={styles.backTxtStyle}>Back</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.headerText}>Sign in With Email</Text>
              </View>
              <TextField
                style={styles.inputText}
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email.value}
                onChangeText={changeEmail}
                label={EMAIL}
                errorMessage={email.errorMessage}
                tintColor={colors.dusk}
                baseColor={colors.mediumGrey}
              />
              <PasswordInputText
                style={styles.inputText}
                containerStyle={styles.item}
                value={password.value}
                onChangeText={changePassword}
                label={PASSWORD}
                secureTextEntry={true}
                textContentType="password"
                errorMessage={password.errorMessage}
                tintColor={colors.dusk}
                baseColor={colors.mediumGrey}
              />
              <View>
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={() =>
                    this.props.navigation.navigate("ResetPassword")
                  }
                >
                  <Text style={styles.forgetText}>Forgot your password?</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator style={{ marginTop: 10 }} />
              ) : (
                <React.Fragment>
                  <TouchableOpacity
                    onPress={() =>
                      submit("signInWithEmailAndPassword")
                        .then(async fetched => {
                          if (userStore.hasProfile) {
                            await fetchUser(null, true);
                            await this.props.navigation.navigate("App");
                            reset();
                          } else {
                            this.props.navigation.navigate("CreateProfile", {
                              nextRoute: "App",
                              backButton: false
                            });
                            reset();
                          }
                        })
                        .catch(({ message }) => {
                          console.log("error: ", message);
                        })
                    }
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Log in</Text>
                  </TouchableOpacity>
                  {error && (
                    <Text style={{ color: "red" }}>{errorMessage}</Text>
                  )}
                  <View style={styles.or_border}>
                    <Text
                      style={{
                        color: colors.mainPurple,
                        fontSize: 12,
                        backgroundColor: "white",
                        fontFamily: "PoppinsBold"
                      }}
                    >
                      OR
                    </Text>
                  </View>
                  {Platform.OS == "ios" && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={
                        AppleAuthentication.AppleAuthenticationButtonType
                          .SIGN_IN
                      }
                      buttonStyle={
                        AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                      }
                      cornerRadius={5}
                      style={{ width: "100%", height: 50 }}
                      onPress={this._loginWithApple.bind(this)}
                    />
                  )}
                  <View style={styles.facebookButton}>
                    <LogInWithGoogleButton
                      onPress={e => {
                        this.handleLoginWithProvider(GOOGLE);
                      }}
                    />
                  </View>
                  <View style={styles.facebookButton}>
                    <LogInWithFacebookButton
                      onPress={e => {
                        this.handleLoginWithProvider(FACEBOOK);
                      }}
                    />
                  </View>
                </React.Fragment>
              )}
            </ScrollView>
          )}
        </AuthConsumer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: Constants.statusBarHeight,
    backgroundColor: "white",
    flex: 1
  },
  container: {
    flex: 1
  },
  item: {
    marginTop: 10
  },
  button: {
    marginTop: 40,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.mainPurple
  },
  buttonText: {
    color: "white",
    fontFamily: "PoppinsBold",
    fontSize: 12
  },
  navigateButton: {
    marginTop: 40
  },
  forgotButton: {
    marginTop: 20
  },
  forgetText: {
    color: colors.dusk,
    textAlign: "right",
    fontFamily: "PoppinsRegular",
    fontSize: 12
  },
  facebookButton: {
    marginTop: 20
  },
  headerText: {
    fontSize: 20,
    color: colors.dusk,
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
    paddingTop: 24
  },
  titleStyle: {
    marginBottom: 2
  },
  backBtnStyle: {
    flexDirection: "row",
    color: colors.mediumGrey,
    marginTop: 3,
    alignContent: "center",
    alignItems: "center"
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8
  },
  inputText: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontFamily: "PoppinsBold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  }
});
