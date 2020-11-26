import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground
} from "react-native";
import translate from "@utils/translate";

import * as colors from "@constants/colors";
import { getUser } from "@logics/auth";

export default class WelcomeScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };


  render() {
    let displayname = getUser().displayName;
    return (
        <ScrollView>
            <ImageBackground style={styles.bgImage} source={require("./../../assets/welcome.png")}>
                <Text style={styles.headerText}>onRun</Text>
            </ImageBackground>
        
            <View style={styles.container}>
                <Text style={styles.hi_txt}>
                    {translate("hi")} {displayname}
                </Text>
                <Text  style={styles.welcomeText}>
                    {translate("welcome-txt")}
                </Text>
                <Text style={styles.descText}>
                    {translate("welcome-desc")}
                </Text>
                <TouchableOpacity onPress={()=> this.props.navigation.navigate("App")} style={styles.startBtn}>
                {/* <TouchableOpacity onPress={()=> this.props.navigation.navigate("Onboarding")} style={styles.startBtn}> */}
                    <Text style={styles.startTxt}>{translate("start-journey")}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
  },
  bgImage:{
    width: '100%',
    height: 350
  },
  headerText: {
    fontSize: 40,
    color: colors.login_welcome,
    paddingLeft: 32,
    paddingTop: 20,
    fontFamily: "PoppinsBold"
  },
  startBtn: {
        backgroundColor: colors.dusk,
        height: 50,
        borderRadius: 5,
        width: '100%',
        marginTop: 35,
        justifyContent: 'center',
        alignItems: 'center'
  },
  startTxt: {
      color: colors.login_welcome,
      fontSize: 12,
      fontFamily: "PoppinsBold",
      
  },
  descText:{
    color: colors.mediumGrey,
    fontSize: 12,
    fontFamily: "PoppinsBold",
    marginTop: 32
  },
  hi_txt: {
    color: colors.mainPurple,
    fontSize: 30,
    fontFamily: "PoppinsBold",
    marginTop: 16  
  }, 
  welcomeText:{
    color: colors.mainPurple,
    fontSize: 30,
    fontFamily: "PoppinsBold",
  }
});
