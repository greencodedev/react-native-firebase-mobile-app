import React, { Component } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import SwitchSelector from "react-native-switch-selector";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import translate from "@utils/translate";
import * as R from "ramda";
import Constants from 'expo-constants';
import * as colors from "@constants/colors";
import { userStore } from "../stores";
import { SearchInput } from "@components";
import { fetchUser } from "../logics/auth";
import { createCancelablePromise } from "@utils";
import { withLoading } from "../HOC";
import { ProfileImage } from "@components";

export default class ConnectionScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  state = {
    text: "",
    users: [],
    clubs: [],
    events: [],
    loading: false,
    title: '',
    selectedItem: '',
    checked: false,
    follow: '',
  };
  uids = [];
  renderItem(row) {
    const { item, index } = row;
    const onPress = () => {
      const user = item;
      this.props.navigation.push("Profile", { user, state: true });
    };
    const imageSource = {
      uri: item.photoURL
    };
    const { photoURL, displayName, country } = item;
    
    const countryFlagUri = `https://www.countryflags.io/${country}/flat/64.png`;
    return (
      <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
        <View style={{ flexDirection: "row", width: '100%' }}>
          <View style={{ flexDirection: "row", justifyContent: 'flex-start', alignItems: 'center' }}>
            <ProfileImage 
              size={33} 
              source={
                photoURL ? 
                { imageSource }
                : require("../../assets/profile-blank.png")
              } 
              style={styles.userImage} 
            />
            <Text style={styles.userName}>{displayName}</Text>
            <Image source={{ uri: countryFlagUri }} style={styles.flagStyle}/>
          </View>
          <View style={{ alignItems: 'center', position: 'absolute', right: 0, alignSelf: 'center' }}>
            <View style={styles.rectView}>
              { this.state.follow === 'follower' ? 
                <FontAwesome name="check" size={12} color={colors.mainPurple} /> :
                <MaterialIcons name="person-add" size={12} color={colors.dusk} />
              }
              { this.state.follow === 'follower' ?
                <Text style={styles.checkedTxt, {color: colors.mainPurple}}>Follows</Text> :
                <Text style={styles.checkedTxt, {color: colors.dusk}}>Follows</Text>
              }
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  humanifyRacesText(num) {
    const text = num > 1 ? "Races" : "Race";
    return num ? `${num} ${text}` : "No Races";
  }
  handleChangeText(text) {
    this.setState({ text });
  }
  filterData(data) {
    const func = item =>
      item.displayName.toLowerCase().indexOf(this.state.text.toLowerCase()) !=
      -1;
    return R.filter(func, data);
  }
  getSelectedSwitchValue(value) {
    this.setState({ selectedItem: value });
  }
  componentDidMount() {
    this.showLoading();
    const { type, uid } = this.props.navigation.state.params;
    this.setState({follow: type});
    let connections = R.pathOr([], [type + "s", uid], userStore);
    this.setState({title: this.props.navigation.state.params.route});
    let promises = [];
    let users = [];
    connections.map(uid => {
      promises.push(
        new Promise((resolve, reject) => {
          return fetchUser(uid)
            .then(user => {
              users.push(user);
              resolve();
            })
            .catch(e => reject(e));
        })
      );
    });
    this.promise = createCancelablePromise(Promise.all(promises));
    this.promise.promise
      .then(() => {
        this.setState({ users, loading: false }); 
      })
      .catch(reason => this.setState({ loading: false }));
  }
  componentWillUnmount() {
    if (this.promise) {
      this.promise.cancel();
    }
  }
  showLoading() {
    this.setState({ loading: true });
  }
  dissmisLoading() {
    this.setState({ loading: false });
  }
  render() {
    let data;
    const List = withLoading(FlatList)();
    let placeholderTitle = "search";
    let checkTitle = "";
    let checked = this.state.checked;

    if ( this.state.selectedItem == "events" ) {
      placeholderTitle = "search_events_name";
      checkTitle = "follow_nearby_events";
      data = this.state.events;
    }
    else if ( this.state.selectedItem == "clubs" ) {
      placeholderTitle = "search_clubs_name";
      checkTitle = "follow_nearby_clubs";
      data = this.state.clubs;
    }
    else {
      placeholderTitle = "search";
      data = this.state.users;
    }    
    const displayData = this.state.text ? this.filterData(data) : data;
    return (
      <View style={styles.container}>
        <View style={styles.titleStyle}>
          <TouchableOpacity style={styles.backBtnStyle} onPress={() => this.props.navigation.goBack()}>
            <Ionicons name="md-arrow-back" color={colors.mediumGrey} style={{fontSize: 20}}/>
            <Text style={styles.backTxtStyle}>Back</Text>
          </TouchableOpacity>
          <View style={styles.titleViewStyle}>
            <Text style={styles.titleTxtStyle}>{this.state.title}</Text>
          </View>
        </View>
        {
          this.state.title === "Followers" ? 
            <View></View> :        
            <View style={{justifyContent: 'center'}}>
              <SwitchSelector
                initial={0}
                onPress={this.getSelectedSwitchValue.bind(this)}
                textColor={colors.mainPurple}
                selectedColor={colors.whiteTwo}
                buttonColor={colors.mainPurple}
                borderColor={colors.mainPurple}
                hasPadding
                options={[
                  {label: 'People', value: 'people'},
                  {label: 'Clubs', value: 'clubs'},
                  {label: 'Events', value: 'events'},
                ]}
                animationDuration='100'
                style={styles.switchSelectorStyle}
                height={30}
              />
            </View>
        }
        <View>
          <SearchInput
            style={styles.searchInput}
            placeholder={translate(placeholderTitle)}
            onChangeText={this.handleChangeText.bind(this)}
          />
        </View>
        { 
          (checkTitle !== "" && this.state.title !== "Followers") ?
            <TouchableOpacity onPress={() => this.setState({checked: !checked})} style={styles.checkedBlockStyle}>
              <Text style={ checked ? styles.checkedTitleStyle : styles.nonCheckedTitleStyle }>{translate(checkTitle)}</Text>
              <View style={ checked ? styles.checkedBoxStyle : styles.nonCheckedBoxStyle }></View>
            </TouchableOpacity>
          : <View></View>
        }
        <List
          loading={this.state.loading}
          data={displayData}
          keyExtractor={(item, index) => index + ""}
          renderItem={this.renderItem.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    // marginTop: 8,
    paddingTop: Constants.statusBarHeight,
  },
  titleStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTxtStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey,
    marginLeft: 8
  },
  titleViewStyle: {
    justifyContent: 'center', 
    textAlign: 'center', 
    width: '60%', 
  },
  titleTxtStyle: {
    fontFamily: "PoppinsBold",
    textAlign: 'center',
    fontSize: 19,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  backBtnStyle: {
    flexDirection: "row", 
    alignItems: 'center',
    color: colors.mediumGrey,
    width: '20%',
  },
  itemContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 10,
    height: 65,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteThree
  },
  searchInput: {
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 20,
    borderColor: colors.whiteThree,
    borderWidth: 1,  
    borderRadius: 5,
    height: 52,
  },
  searchIcon: {
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 16,
    right: 10,
    marginRight: 14,
  },
  userName: {
    marginLeft: 10,
    color: colors.mainPurple,
    fontWeight: "bold", 
    letterSpacing: 0,
    fontSize: 12,
    marginRight: 10,
  },
  userRaces: {
    alignSelf: "center",
    color: "#005872"
  },
  flagStyle: {
    width: 23,
    height: 20,
    marginTop: 4.5,
    marginBottom: 4.5,
    justifyContent: 'center'
  },
  rectView: {
    flexDirection: 'row',
    width: 82,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.whiteThree,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedTxt: {
    marginLeft: 5,
    fontFamily: "PoppinsBold",
    fontSize: 8,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  checkTxt: {
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk
  },
  switchSelectorStyle: {
    width: '70%', 
    fontSize: 13, 
    fontWeight: "600", 
    height: 28, 
    justifyContent: 'center', 
    alignSelf: 'center',
    marginTop: 10,
  },
  checkedBlockStyle: {

  },
  checkedTitleStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.dusk,
  },
  nonCheckedTitleStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "normal",
    letterSpacing: 0,
    opacity: 0.4,
    color: colors.mediumGrey
  },
  checkedBoxStyle: {
    width: 16,
    height: 16,
    position: 'absolute',
    right: 0,
    borderColor: colors.dusk,
    borderStyle: 'solid',
    borderWidth: 2,
    backgroundColor: colors.dusk
  },
  nonCheckedBoxStyle: {
    width: 16,
    height: 16,
    position: 'absolute',
    right: 0,
    borderColor: colors.mediumGrey,
    borderStyle: 'solid',
    borderWidth: 2,
    opacity: 0.4,
    backgroundColor: colors.white
  },
  checkedBlockStyle: {
    flexDirection: 'row',
    marginTop: 22,
    paddingBottom: 22,
    borderBottomColor: colors.whiteThree,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    alignContent: 'center', 
  }
});
