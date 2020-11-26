import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions
} from "react-native";
import translate from "@utils/translate";
import * as colors from "@constants/colors";
const height = Dimensions.get('screen').height;

export default class Fifth extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    return (
        <View style={styles.container}>
          <ImageBackground source={require("../../../assets/onboarding/back5.png")} style={styles.image}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Personal Best</Text>
              <Text style={styles.desc}>List, filter, or share your best</Text>
              <Text style={styles.desc}>results</Text>
              <Text style={styles.desc}>Show your personal best plot</Text>
            </View>
          </ImageBackground>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: height,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  textContainer: {
    alignSelf: 'center',
    marginBottom: height / 6
  },
  title: {
    fontFamily: "PoppinsBold",
    fontSize: 30,
    fontStyle: "normal",
    lineHeight: 46,
    letterSpacing: 0,
    textAlign: "left",
    color: colors.dusk,
    marginBottom: 20
  },
  desc: {
    fontSize: 16,
    fontFamily:'PoppinsRegular',
    lineHeight: 21,
    color: colors.dusk,
    marginBottom: 5
  },
  
});
