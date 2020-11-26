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

export default class Seventh extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    return (
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, {marginBottom: 0}]}>or Do You Know</Text>
            <Text style={styles.title}>Somebody?</Text>
            <View style={styles.itemContainer}>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man1.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Ragers</Text>
              </View>
              <View style={styles.btnContainer}>
                <Text style={styles.btnText}>Follow</Text>
              </View>
            </View>
            <View style={styles.itemContainer}>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man2.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Ragers</Text>
              </View>
              <View style={styles.btnContainer}>
                <Text style={styles.btnText}>Follow</Text>
              </View>
            </View>
            <View style={styles.itemContainer}>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man3.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Randal</Text>
              </View>
              <View style={styles.btnContainer}>
                <Text style={styles.btnText}>Follow</Text>
              </View>
            </View>
            <View style={styles.itemContainer}>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man1.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Robson</Text>
              </View>
              <View style={styles.btnContainer}>
                <Text style={styles.btnText}>Follow</Text>
              </View>
            </View>
            <View style={styles.itemContainer}>
              <View style={styles.rowContainer}>
                <Image source={require("./../../../assets/onboarding/man2.png")} style={styles.image} />
                <Text style={styles.searchDesc}>David Ragers</Text>
              </View>
              <View style={styles.btnContainer}>
                <Text style={styles.btnText}>Follow</Text>
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
    paddingVertical: 50,
    flexDirection: 'column',
    justifyContent: 'space-between'
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30
  },  
  image: {
    height: 40,
    width: 40,
    borderRadius: 20
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 50,
    marginBottom: 5
  },
  btnContainer: {
    height: 30,
    width: 80,
    backgroundColor: '#e7e8f4',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchDesc: {
    fontSize: 22,
    fontFamily:'PoppinsRegular',
    marginLeft: 5,
    color: colors.dusk
  },
  btnText: {
    fontSize: 14,
    fontFamily:'PoppinsRegular',
    color: colors.dusk
  }
});
