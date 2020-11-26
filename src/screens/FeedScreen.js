import React, { Component } from "react";
import { FlatList,
         View, 
         StyleSheet, 
         ScrollView, 
         Text 
        } from "react-native";
import { observer } from "mobx-react/native";
import * as colors from "@constants/colors";
import  { MyPostFeed }  from "../components";
import { fetchFeeds } from "@logics/data-logic";
import { getUser } from "@logics/auth";
import Constants from 'expo-constants';
@observer
export default class FeedScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    }
  };

  state = {
    isFetching: false,
    feeds: [  
      {
        "uid": "1",
        "title": "California International Marathon",
        "content": "But here’s the thing—we expect it from them, because that’s what they’re paid to do. Everyday runners? They face the same emotional ups and downs in nearly every race. Some may take longer to finish, or run their miles in honor of someone. ",
        "comments": 12,
        "liked"  : 43,
        "shared": 3
      },{
        "uid": "2",
        "title": "Run The Parkway",
        "content": "But here’s the thing—we expect it from them, because that’s what they’re paid to do. Everyday runners? They face the same emotional ups and downs in nearly every race. Some may take longer to finish, or run their miles in honor of someone. ",
        "comments": 12,
        "liked"  : 43,
        "shared": 3
      }
    ],

    user:{ "displayName" : "Hi Benyamin", "photoURL": ""},
    date: '',
    name: '',
  };

  componentDidMount() {
    var date = new Date().getDate();
    var month = new Date().getMonth();
    var day = new Date().getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June",   "July", "August", "September", "October", "November", "December"  ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    this.setState({date: dayNames[day] + ', ' + monthNames[month] + ' ' + date});
    this.handleRefresh();
    this.setState({
      name: getUser().firstName,
    })
  }

  setDayOfWeek(param) {
    let result = '';
    switch (param) {
      case 1:
        result = "Mon"
        break;
      case 2:
        result = "Tue"
        break;
      case 3:
        result = "Wed"
        break;
      case 4:
        result = "Thu"
        break;
      case 5:
        result = "Fri"
        break;
      case 6:
        result = "Sat"
        break;
      case 7:
        result = "Sun"
        break;  
      default:
        break;
    }
    return result;
  }

  renderItem(row) {
    const { item, index } = row;
    return <MyPostFeed post={item} itemIdx = {index}/>;
  }
  handleRefresh() {
    this.setState({ isFetching: true }, () => {
      fetchFeeds()
        .then(feeds => {
          this.setState({ isFetching: false });
        })
        .catch(err => {
          reject(err);
          this.setState({ isFetching: false });
        });
    });
  }
  render() {
    return (
      <View style={ styles.container }>
        <ScrollView>
          <View>
            <Text style={styles.headerName}>
                Hi { this.state.name }
            </Text>
            <Text style={styles.headerDate}>
                { this.state.date }
            </Text>
          </View>
          <FlatList
            refreshing={this.state.isFetching}
            onRefresh={() => this.handleRefresh()}
            data={this.state.feeds}
            keyExtractor={item => item.id}
            renderItem={this.renderItem.bind(this)}
          />
        </ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 16,
    paddingTop: Constants.statusBarHeight
  },
  displayName:{
    fontFamily: "PoppinsBold",
    fontSize: 30,
    fontWeight: "800",
    fontStyle: "normal",
    letterSpacing: -0.4,
    color: colors.mainPurple
  },
  displayDate:{
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mediumGrey
  },
  headerName: {
    color: colors.mainPurple,
    fontFamily: "PoppinsBold",
    fontSize: 30,
    paddingTop: 20
  },
  headerDate: {
    fontSize: 12,
    color: colors.mediumGrey,
    fontFamily: "PoppinsBold",
  }

}) 