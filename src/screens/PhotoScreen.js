import React from "react";
import { pathOr } from "ramda";
import { Image, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as colors from "../constants/colors";
export default class PhotoScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  render() {
    const uri = pathOr(null, ["state", "params", "uri"], this.props.navigation);
    return (
      <View style = {styles.container}>
        <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.props.navigation.navigate("Achievement")}>
          <Ionicons name="md-arrow-back" color={colors.white} style={{fontSize: 20}}/>
          <Text style={styles.backTxtStyle}>Back</Text>
        </TouchableOpacity>
        
      <Image style={styles.imageContainer} source={{ uri }} />
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: colors.mainPurple
  },
  imageContainer: {
    height: '80%'
  },  
  backBtnStyle: {
    flexDirection: "row", 
    color: colors.white,
    marginLeft: 16,
    marginTop: 4,
    alignContent: 'center',
    alignItems: 'center',
    width: '20%',
    height: 60
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.white,
    marginLeft: 8
  },
})