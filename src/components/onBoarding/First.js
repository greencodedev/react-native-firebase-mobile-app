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
export default class First extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    return (
        <View style={styles.container}>
            <ImageBackground source={require("../../../assets/onboarding/back1.png")} style={styles.image}>
            <View style={styles.textContainer}>
              <Text style={[styles.desc, {marginBottom: 20}]}>
                <Text style={styles.descBold}>Please wait</Text> for onRun to collect
              </Text>
              <Text style={[styles.desc, {marginBottom: 20}]}>This may take several minites!</Text>
              <Text style={styles.desc}>The more races done, the more</Text>
              <Text style={styles.desc}>it takes, and <Text style={styles.descBold}>you have raced</Text></Text>
              <Text style={[styles.descBold, {marginBottom: 20}]}>quite a bid ;) Bravo! :)</Text>
              <Text style={styles.desc}>Meanwhile, please familiarize</Text>
              <Text style={styles.desc}>yourself with onRun features!</Text>
            </View>
            </ImageBackground>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
  image: {
    height: height,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  textContainer: {
    paddingHorizontal: 55,
    paddingVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 18,
    alignItems: 'center',
    marginTop: 5
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
    color: colors.dusk
  },
  descBold: {
    fontSize: 16,
    fontFamily:'PoppinsBold',
    lineHeight: 21,
    color: colors.dusk
  }
  
});
