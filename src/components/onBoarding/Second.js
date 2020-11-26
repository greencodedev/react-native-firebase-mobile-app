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
export default class Second extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    return (
        <View style={styles.container}>
          <ImageBackground style={styles.image} source={require("./../../../assets/onboarding/back2.png")}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Profile</Text>
              <Text style={[styles.desc, {fontStyle: 'italic', fontSize: 18, marginBottom: 10}]}>Access to</Text>
              <View style={styles.rowContainer}>
                <Text style={styles.descBold}>Achievements</Text>
                <Text style={styles.desc}> (race results)</Text>
              </View>
              <View style={styles.rowContainer}>
                <Text style={styles.descBold}>Personal bests,</Text>
                <Text style={styles.desc}> (Via Search screen)</Text>
              </View>
              <View style={styles.rowContainer}>
                <Text style={styles.descBold}>Followers, </Text>
                <Text style={styles.desc}>and </Text>
                <Text style={styles.descBold}>Followings</Text>
              </View>
              <View style={styles.rowContainer}>
                <Text style={styles.descBold}>Home </Text>
                <Text style={styles.desc}>(Feed - under implementation)</Text>
              </View>
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
    paddingHorizontal: 75,
    paddingVertical: 20,
    marginTop: height / 2
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },  
  title: {
      fontFamily: "PoppinsBold",
      fontSize: 30,
      fontStyle: "normal",
      lineHeight: 46,
      letterSpacing: 0,
      textAlign: "left",
      color: colors.dusk,
      marginBottom: 10
  },
  desc: {
    fontSize: 16,
    fontFamily:'PoppinsRegular',
    color: colors.dusk
  },
  descBold: {
    fontSize: 16,
    fontFamily:'PoppinsBold',
    color: colors.dusk
  }
  
});
