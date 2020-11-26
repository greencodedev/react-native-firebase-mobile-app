import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image
} from "react-native";
import translate from "@utils/translate";
import * as colors from "@constants/colors";

export default class Sixth extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    return (
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Search</Text>
            <Text style={styles.desc}>
              This is <Text style={styles.descBold}>People</Text> search
            </Text>
            <Text style={styles.desc}>Find registred athletes and then</Text>
            <Text style={styles.desc}>follow them</Text>
            <Text style={styles.desc}>Check other atheles' race results</Text>
            <Text style={styles.desc}>and the personal bests</Text>
            <View style={styles.searchContainer}>
              <Text style={[styles.searchDesc, {fontSize: 22}]}>
                David R
              </Text>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man1.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Ragers</Text>
              </View>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man2.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Randal</Text>
              </View>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man3.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Robson</Text>
              </View>
            </View>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1 
  },
  textContainer: {
    paddingHorizontal: 55,
    paddingVertical: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },  
  image: {
    height: 40,
    width: 40,
    borderRadius: 20
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
  },
  searchContainer: {
    marginTop: 30,
    borderBottomColor: colors.dusk,
    borderBottomWidth: 1,
    height: 40,
    paddingLeft: 20,
    width: '80%',
    alignSelf: 'center'
  },
  searchDesc: {
    fontSize: 20,
    fontFamily:'PoppinsRegular',
    marginLeft: 5
  }
  
});
