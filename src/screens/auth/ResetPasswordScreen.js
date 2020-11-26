import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Button,
  ActivityIndicator,
  KeyboardAvoidingView,
  BackHandler
} from "react-native";
import Constants from 'expo-constants';

import { AuthConsumer } from "@context/auth";
import * as colors from "@constants/colors";
import { TextField } from 'react-native-material-textfield';
import { LogInWithGoogleButton, LogInWithFacebookButton } from "@components";
import { loginWithGoogle, loginWithFacebook, getUser } from "@logics/auth";
import { Ionicons } from "@expo/vector-icons";
import { getUserPromises } from "@logics/data-logic";
import { userStore } from "@stores";

const GOOGLE = "Google";
const FACEBOOK = "Facebook";

export default class ResetPasswordScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      "didFocus",
      payload =>
        BackHandler.addEventListener(
          "hardwareBackPress",
          this.handleBackButtonPress
        )
    );
    this.state = {
      finished: false
    };
  }

  componentDidMount() {
    this._willBlurSubscription = this.props.navigation.addListener(
      "willBlur",
      payload =>
        BackHandler.removeEventListener(
          "hardwareBackPress",
          this.handleBackButtonPress
        )
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  handleBackButtonPress = () => {
    return false;
  };

  showLoading() {
    this.setState({ loading: true });
  }

  dismissLoading() {
    this.setState({ loading: false });
  }

  handleLoginWithProvider(provider) {
    console.log("handle login")
    const providers = [GOOGLE, FACEBOOK];
    if (providers.indexOf(provider) === -1) {
      // TODO: Show error
      return;
    }
    this.showLoading();
    const self = this;
    new Promise((resolve, reject) => {
      if (provider === GOOGLE) {
        loginWithGoogle(resolve, reject);
      } else {
        loginWithFacebook(resolve, reject);
      }
    })
      .then(async () => {
        const user = getUser();
        const hasProfile = userStore.hasProfile;
        const promises = getUserPromises(user);
        await Promise.all(promises);
        console.log("User Info => " + user);
        const routeName = hasProfile ? "App" : "EditProfile";
        this.props.navigation.navigate(routeName, {nextRoute:"SelectData"});
      })
      .catch(status => {
        self.dismissLoading();
        console.log("An error occurred", status);
      });
  }

  render() {
    let flag = true;
    if (getUser() != null)
      flag = false;
    const EMAIL = "Email";
    const SUBMITTITLE = "Reset Password";
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <AuthConsumer>
          {({
            email,
            changeEmail,
            loading,
            error,
            errorMessage,
            resetPassword
          }) => (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.titleStyle}>
                { flag ? (
                  <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.props.navigation.goBack()}>
                    <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
                    <Text style={styles.backTxtStyle}>Back</Text>
                  </TouchableOpacity>) :
                (
                  <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.props.navigation.navigate("EditProfile")}>
                    <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
                    <Text style={styles.backTxtStyle}>Back</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{marginTop: 20}}>
                <Text style={styles.headerText}>Reset Your Password</Text>
              </View>
              {!this.state.finished && (
                <TextField
                  style={styles.inputText}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={email.value}
                  onChangeText={changeEmail}
                  label={EMAIL}
                  tintColor={colors.dusk}
                  baseColor={colors.mediumGrey}
                />
              )}
              {loading ? (
                <ActivityIndicator style={{ marginTop: 10 }} />
              ) : this.state.finished ? (
                <React.Fragment>
                  <Text>Check your email</Text>
                  <Button
                    title={"Go back to login"}
                    onPress={() => this.props.navigation.navigate("Login")}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <TouchableOpacity
                    onPress={() =>
                      resetPassword()
                        .then(() => this.setState({ finished: true }))
                        .catch(() => {})
                    }
                    style={styles.button}
                  >
                    <Text style={{color: 'white', fontSize: 12, fontFamily: "PoppinsBold",}}>{SUBMITTITLE}</Text>
                  </TouchableOpacity>
                  {error && (
                    <Text style={{ color: "red" }}>{errorMessage}</Text>
                  )}
                </React.Fragment>
              )}
              { flag ? 
              ( <View>
                  <View style={styles.divider}>
                    <View
                        style={[
                            styles.line,
                            { borderColor: colors.whiteThree },
                            false && styles.dashed,
                            { flex: 1 }
                        ]}
                    />
                    <Text style={[styles.divTxt, { color: colors.mainPurple }]}>OR</Text>
                    <View
                        style={[
                          styles.line,
                          { borderColor: colors.whiteThree },
                          false && styles.dashed,
                          { flex: 1 }
                        ]}
                    />
                  </View>
                  <View style={styles.socialButton}>
                      <LogInWithGoogleButton
                        onPress={e => {
                          this.handleLoginWithProvider(GOOGLE);
                        }}
                      />
                  </View>
                  <View style={styles.socialButton}>
                    <LogInWithFacebookButton
                      onPress={e => {
                        this.handleLoginWithProvider(FACEBOOK);
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View></View>
              )}
            </ScrollView>
          )}
        </AuthConsumer>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: Constants.statusBarHeight,
    backgroundColor: 'white'
  },
  container: {
    flex: 1
  },
  item: {
    marginTop: 10
  },
  button: {
    marginTop: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.mainPurple
  },
  headerText: {
    fontSize: 30,
    color: colors.dusk,
    fontFamily: "PoppinsBold",
  },
  socialButton: {
    marginTop: 20,
  },
  or_border: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderColor: colors.whiteThree,
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  titleStyle: {
    marginBottom: 2,
  },
  backBtnStyle: {
      flexDirection: "row", 
      color: colors.mediumGrey,
      marginTop: 3,
      alignContent: 'center',
      alignItems: 'center'
  },
  backTxtStyle: {
      fontFamily: "PoppinsBold",
      fontSize: 16,
      fontStyle: "normal",
      letterSpacing: 0,
      color: colors.mediumGrey,
      marginLeft: 8
  },
  divider: {
    height: 24,
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 6
  },
  line: {
      height: 24,
      borderBottomWidth: 1,
      transform: [{ translateY: -12 }]
  },
  shortWidth: {
    width: 20
  },
  dashed: {
      borderStyle: 'dashed'
  },
  divTxt: {
      paddingHorizontal: 24,
      fontSize: 12,
      fontWeight: '500',
      fontFamily: "PoppinsBold",
  },
  inputText: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
  }
});
