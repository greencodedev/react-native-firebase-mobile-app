import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import translate from "@utils/translate";

import * as colors from "@constants/colors";
import axios from "axios";
import Constants from 'expo-constants';
axios.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

export default class SelectDataScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loading: false,
      claimedProfiles: [],
      achievements: [],
      racerId: [],
      singlePickerVisible: false,
      isClaimed: true,
    };
    
  }

  componentDidMount() {
    let temp = this.props.navigation.getParam("claimedProfiles");
    let temp2 = this.props.navigation.getParam("achievements");
    this.setState({
      claimedProfiles: temp
    });
    this.setState({
      achievements: temp2
    });
  }

  showLoading() {
    this.setState({loading: true});
  }
  dismissLoading() {
    this.setState({ loading: false });
  }
  renderItem = ({ item }) => {
    let param = {
      nextRoute: "Welcome",
      racerId: item.racerId,
      achievements: this.state.achievements
    }
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={()=>{
            this.props.navigation.navigate("PastRace", {nextRoute: "Welcome", racerId: item.racerId, achievements: this.state.achievements})}}
        >
          <View>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={ item.name == 'None'?styles.displaynone:styles.itemText}>{item.age} year-old, from {item.city}, {item.state}, {item.country}</Text>
          </View>
          <FontAwesome
            name="chevron-right"
            size={20}
            style={{ color: colors.dusk,  right: 0, position: 'absolute' }}
          />
        </TouchableOpacity>
      );
  };
  render() {
    let pastNav = (!typeof this.props.navigation.getParam('pastNav') === 'undefined')
    ? this.props.navigation.getParam('pastNav')
    : "CreateProfile";
    return (
      <View style={styles.container}>
        <View style={styles.titleStyle}>
            <TouchableOpacity style={styles.backBtnStyle} onPress={() =>{ 
                this.props.navigation.navigate(pastNav)}}>
              <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
              <Text style={styles.backTxtStyle}>Back</Text>
            </TouchableOpacity>
            <View style={{marginTop: 20}}>
              <Text style={styles.titleTxtStyle}>{translate("select-data")}</Text>
            </View>
        </View>
        <Text style={styles.descText}>
          {translate("select-your-data-desc")}
        </Text>
        { this.state.loading ? (
          <ActivityIndicator style={{flex: 1, marginTop: 20}} />
        ): (
          <FlatList
            extraData={this.props.screenProps}
            data={this.state.claimedProfiles}
            renderItem={this.renderItem}
            style = {styles.list}
          />
        )}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 4,
    paddingRight: 5,
    alignItems: 'center'
  },
  nameText: {
    flex: 1,
    fontFamily: "PoppinsBold",
    fontSize: 14,
    color: colors.mediumGrey,
  },
  itemText:{
    fontFamily: "PoppinsBold",
    fontSize: 12,
    color: colors.mainPurple,
  },
  backBtnStyle: {
    flexDirection: "row", 
    color: colors.mediumGrey,
    marginTop: 3,
    alignContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    paddingTop: Constants.statusBarHeight
  },
  titleStyle: {
    marginBottom: 20,
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
    fontSize: 30,
    color: colors.dusk,
    fontFamily: "PoppinsBold",
  },
  descText : {
    fontSize: 12,
    color: colors.mediumGrey,
    fontFamily: "PoppinsBold",
    marginBottom: 50
  },
  displaynone: {
    color: 'white'
  }
});
