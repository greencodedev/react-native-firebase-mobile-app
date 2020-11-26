import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions
} from "react-native";
import translate from "@utils/translate";
import * as colors from "@constants/colors";

const height = Dimensions.get('screen').height;

export default class Forth extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    return (
        <View style={styles.container}>
          <ImageBackground style={styles.image} source={require("../../../assets/onboarding/back4.png")}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Achievement Map</Text>
              <Text style={styles.desc}>Display your races on the map</Text>
              <Text style={styles.desc}>Click on any achievement to see</Text>
              <Text style={styles.desc}>the details as position</Text>
              <Text style={styles.desc}>
                <Text style={styles.descBold}>Edit</Text> each achievement to add 
              </Text>
              <Text style={styles.desc}>your 
                <Text style={styles.descBold}> race photos</Text> and <Text style={styles.descBold}>race report</Text>
              </Text>
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
    flexDirection: 'column',
  },
  textContainer: {
    alignSelf: 'center',
    marginTop: 60
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
  descBold: {
    fontSize: 16,
    fontFamily:'PoppinsBold',
    lineHeight: 21,
    color: colors.dusk
  }
});
