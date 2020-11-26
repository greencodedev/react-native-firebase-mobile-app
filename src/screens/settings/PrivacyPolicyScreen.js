import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as colors from "@constants/colors";
import Constants from "expo-constants";
import translate from "@utils/translate";

const content = translate("privacy-policy");

export default class PrivacyPolicyScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  render() {
    return (
      <View style={styles.container}>
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
        <ScrollView>
          <Text style={styles.titleTxtStyle}>
            {translate("support-item-privacy")}
          </Text>
          <View style={styles.card}>
            <Text>{content}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    fontFamily: "PoppinsBold",
    fontSize: 16
  },
  container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    // marginTop: 8,
    paddingTop: Constants.statusBarHeight
  },
  titleStyle: {
    marginBottom: 20
  },
  backBtnStyle: {
    flexDirection: "row",
    color: colors.mediumGrey,
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
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    width: "100%",
    textAlign: "center",
    fontSize: 19,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  }
});
