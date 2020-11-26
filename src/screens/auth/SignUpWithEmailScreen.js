import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from "react-native";
import Constants from "expo-constants";

import { AuthConsumer } from "@context/auth";
import * as colors from "@constants/colors";
import { TextField } from "react-native-material-textfield";
import { loginWithGoogle, loginWithFacebook, getUser } from "@logics/auth";
import PasswordInputText from "react-native-hide-show-password-input";
import { Ionicons } from "@expo/vector-icons";
import { userStore } from "@stores";
import translate from "@utils/translate";

export default class SignUpWithEmailScreen extends React.Component {
  constructor(props) {
    super(props);
  }
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  handleBackButtonPress = () => {
    return false;
  };

  onPressTermsAgreement() {
    this.props.navigation.navigate("TermsAgreement");
  }

  onPressPrivacy() {
    this.props.navigation.navigate("PrivacyPolicy");
  }

  handleLoginWithProvider(provider) {
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
        // console.log("User Info => " + user);
        const routeName = hasProfile ? "NewResult" : "CreateProfile";
        this.props.navigation.navigate(routeName, {
          nextRoute: "SelectData"
        });
      })
      .catch(status => {
        self.dismissLoading();
        console.log("An error occurred", status);
      });
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
                <Text style={styles.headerText}>
                  {translate("signup-with-email")}
                </Text>
              </View>
              <TextField
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email.value}
                onChangeText={changeEmail}
                label={translate("email-help")}
                errorMessage={email.errorMessage}
                tintColor={colors.dusk}
                baseColor={colors.mediumGrey}
                style={styles.inputText}
              />
              <PasswordInputText
                style={styles.inputText}
                containerStyle={styles.item}
                value={password.value}
                onChangeText={changePassword}
                label={translate("password-help")}
                secureTextEntry={true}
                textContentType="password"
                errorMessage={password.errorMessage}
                tintColor={colors.dusk}
                baseColor={colors.mediumGrey}
              />

              {loading ? (
                <ActivityIndicator style={{ marginTop: 10 }} />
              ) : (
                <React.Fragment>
                  <TouchableOpacity
                    onPress={() =>
                      submit("createUserWithEmailAndPassword")
                        .then(async fetched => {
                          if (userStore.hasProfile) {
                            await fetchUser(null, true);
                            await this.props.navigation.navigate(
                              fetched ? "App" : "SelectData"
                            );
                            reset();
                          } else {
                            this.props.navigation.navigate("CreateProfile", {
                              nextRoute: fetched ? "App" : "SelectData",
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
                    <Text style={styles.buttonText}>
                      {translate("signup-button")}
                    </Text>
                  </TouchableOpacity>
                  {error && (
                    <Text style={{ color: "red" }}>{errorMessage}</Text>
                  )}
                </React.Fragment>
              )}
              <View style={{ marginTop: 12 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.descText}>
                    {translate("signup-agree")}
                  </Text>
                  <Text
                    onPress={() => this.onPressTermsAgreement()}
                    style={styles.specText}
                  >
                    {translate("support-item-terms")}
                  </Text>
                  <Text style={styles.descText}> and </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    onPress={() => this.onPressPrivacy()}
                    style={styles.specText}
                  >
                    {translate("support-item-privacy")}.
                  </Text>
                </View>
              </View>
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
    fontSize: 12,
    fontFamily: "PoppinsBold"
  },
  navigateButton: {
    marginTop: 40
  },
  forgotButton: {
    marginTop: 20
  },
  facebookButton: {
    marginTop: 20
  },
  headerText: {
    fontSize: 30,
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
  descText: {
    color: colors.mediumGrey,
    fontSize: 12,
    fontFamily: "PoppinsBold"
  },
  specText: {
    fontSize: 12,
    color: colors.mainPurple,
    textDecorationLine: "underline",
    fontFamily: "PoppinsBold"
  },
  inputText: {
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  }
});
