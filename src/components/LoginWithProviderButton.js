import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import * as colors from "@constants/colors";
import translate from "@utils/translate";

const LoginWithProviderButton = props => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: props.backgroundColor }]}
      onPress={props.onPress}
    >
      <FontAwesome name={props.name} size={23.3} style={{ color: colors.mainPurple }} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {translate("signin-with")} {props.provider}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 4,
    width: "100%",
    height: 52,
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: colors.whiteThree
  },
  textContainer: {
    flex: 1,
    alignItems: "center"
  },
  text: {
    fontFamily: "PoppinsBold",
    color: colors.mainPurple,
    textAlign: "center",
    fontSize: 12
  }
});

const FACEBOOK = "Facebook";
const GOOGLE = "Google";
const facebook = "facebook-official";
const google = "google";

const LogInWithFacebookButton = props => {
  return (
    <LoginWithProviderButton
      name={facebook}
      provider={FACEBOOK}
      backgroundColor={colors.tab_background}
      onPress={props.onPress}
    />
  );
};

const LogInWithGoogleButton = props => {
  return (
    <LoginWithProviderButton
      name={google}
      provider={GOOGLE}
      backgroundColor={colors.tab_background}
      onPress={props.onPress}
    />
  );
};

export { LogInWithGoogleButton, LogInWithFacebookButton };
export default LoginWithProviderButton;
