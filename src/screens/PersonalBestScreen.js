import React, { Component } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Share,
} from "react-native";
import * as R from "ramda";
import moment from "moment";
import SwitchSelector from "react-native-switch-selector";
import { MaterialIcons } from "@expo/vector-icons";
// import ChartView from './../components/react-native-highcharts';
import ChartView from 'react-native-highcharts';
// import HighchartsReactNative from '@highcharts/highcharts-react-native';
import { StackActions } from "react-navigation";
import { withLoading } from "../HOC";
import * as colors from "../constants/colors";
import { userStore } from "../stores";
import translate from "@utils/translate";
import { convert } from "@utils";
import { AchievementFilterView } from "../components";
import Constants from 'expo-constants';
import { captureRef } from 'react-native-view-shot';
import { calculateTime, calculateTimestamp } from "../utils";
import { getUser } from "@logics/auth";

const racelist = ["5 K", "10 K", "HM", "M", "50 K", "50 M", "100 K", "100 M"];
export default class PersonalBestScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      datacharts: [],
      data: [],
      groups: [],
      selectedItem: 'PersonalBestChart',
      selectedCategory: 0,
      selectedAchiev: [],
      selectedNode:[],
      selectedSeries: [],
      tableData: [],
      tempChartData: [],
      selectedPB: '',
      categorylist: [],
      visible: false,
    };
  }
  handleChangeCategory(category) {
    let selectedAchiev = [], temp = category;
    this.state.categorylist.map(element => {
      if (element.key == temp) {
        category = element.value;
      }
    })
    this.state.data.map(element => {
      if (element.key === category)
        selectedAchiev = element
    })
    this.setState({selectedAchiev, selectedCategory: category, selectedNode: [], tableData: []});
  }
  fetch() {
    if (this.props.navigation.state.params) {
      this.setState({ loading: true });
      const { uid } = this.props.navigation.state.params;
      let achievements = R.filter(
        R.compose(
          R.not,
          R.isNil,
          R.prop("courseDistance")
        ),
        R.pathOr([], ["achievements", uid], userStore)
      );
      achievements = R.sortBy(
        R.prop("courseDistance"), 
        achievements
      );
      const groups = R.groupBy(a => convert(a.courseDistance))(achievements);
      const data = [];
      Object.keys(groups).map(key => {
        let pbTime = 100000000000000; // max time in seconds
        let pbRace = null;
        let pb;
        groups[key].map(ach => {
          let resultTime = ach.result.split('.');
          let raceTime = moment.duration(resultTime[0]).asSeconds();
          if (raceTime < pbTime) {
            pbTime = raceTime;
            pb = ach.result;
            pbRace = ach;
          }
        });
        let groupData = [];
        let temp = [];
        groups[key].map(ach => {
          var date;
          let raceTime = calculateTimestamp(ach.result);
          date = ach.eventDate.split('T');
          var year = date[0].split('-')[0];
          var month = date[0].split('-')[1];
          var day = date[0].split('-')[2];
          var hours = date[1].split(':')[0];
          var mins = date[1].split(':')[1];
          var seconds = date[1].split(':')[2];
          groupData.push([Date.UTC(year, month, day, hours, mins, seconds), raceTime]);
          temp.push({x: Date.UTC(year, month, day, hours, mins, seconds), y:raceTime});
        });
        this.state.datacharts.push({ key: key, data: groupData, pbTime: pb });  // pb: pbRace
        this.setState({
          tempChartData: JSON.stringify(temp)
        });
        data.push({ key, pb, pbRace });
      });
      this.setState({ data, groups, loading: false });
    }
  }
  componentDidMount() {
    this.fetch();
  }
  getSelectedSwitchValue(value) {
    this.setState({ selectedItem: value});
    this.fetch();
  }

  _toggleBotttomFilterView = () => {
    this.setState({visible: !this.state.visible});
  };
  _shareSocial = async() => {
    let message = "https://itunes.apple.com/us/app/OnRun";
    let title = "Share";
    try {
      await captureRef(this._container, {
        format: 'png',
      }).then(result=> {
        Share.share({
          title: title,
          message: message,
          url: result
        });
      })
    }
    catch(error) {
      console.log(error);
    }
  }
  clickpoint(message) {
    let data = JSON.parse(message.nativeEvent.data);
    if (data.type == 'point' && this.state.selectedCategory != '0' && this.state.selectedCategory) {
      this.state.groups[this.state.selectedCategory].map(element => {
        var date = element.eventDate.split('T');
        var year = date[0].split('-')[0];
        var month = date[0].split('-')[1];
        var day = date[0].split('-')[2];
        var hours = date[1].split(':')[0];
        var mins = date[1].split(':')[1];
        var seconds = date[1].split(':')[2];
        var eventDate = Date.UTC(year, month, day, hours, mins, seconds);
        if (eventDate == parseInt(data.x)) {
          if (data.y !== calculateTimestamp(this.state.selectedAchiev.pb))
            this.setState({selectedNode: element});
          else
            this.setState({selectedNode: []})
        }
      })
    } else {
      if (data.name == undefined) {
        return;
      }
      var numSeries = parseInt((data.name.split(' '))[1]);
      this.setState({selectedSeries: this.state.data[numSeries - 1]});
    }
  }
  goBackProfile() {
    const uid = R.pathOr(
      getUser().uid,
      ["navigation", "state", "params", "uid"],
      this.props
    );
    const user = R.pathOr(
      "",
      ["navigation", "state", "params", "user"],
      this.props
    );
    const pushAction = StackActions.push({
      routeName: "Profile",
      params: {
        uid,
        user
      }
    });
    this.props.navigation.dispatch(pushAction);
  }
  renderItem() {
    return (
      <View style={styles.pbinfostyle}>
      {this.state.selectedAchiev.length === 0 ? 
        <View>
          <Text style={styles.pbInfoTextStyle}>No achievement</Text>
        </View> :
        <View>
          <View>
            <Image ></Image>
            <Text style={styles.pbInfoTextStyle}>
              <Text>{'Your '}</Text><Text style={styles.boldText}>{this.state.selectedCategory}</Text><Text>{' Personal Best achieved on '}</Text>
              <Text style={styles.boldText}>{this.state.selectedAchiev.pbRace.eventDate.replace('T', ' ')}</Text><Text>{' at '}</Text><Text style={styles.boldText}> {this.state.selectedAchiev.pbRace.eventName}</Text>
              {'\n'}
              <Text style={styles.pbTimeText}>{this.state.selectedAchiev.pb}</Text>
            </Text>
          </View>
          {this.state.selectedNode.length === 0 ?
            <View></View>
            :
            <View>
              <View style={styles.lineStyle}></View>
              <Text style={styles.infoTextStyle}>
                <Text>{'Your '}</Text><Text style={styles.boldText}>{this.state.selectedCategory}</Text><Text>{' result achieved on '}</Text>
                <Text style={styles.boldText}>{this.state.selectedNode.eventDate.replace('T', ' ')}</Text><Text>{' at '}</Text>
                <Text style={styles.boldText}>{this.state.selectedNode.eventName + ' '}</Text>
                <Text>{calculateTime(calculateTimestamp(this.state.selectedNode.result) - calculateTimestamp(this.state.selectedAchiev.pb)) + ' '}</Text>
                <Text> min slower.</Text>
              </Text>
            </View>
          }
        </View>
      }
      </View>
    )
  }
  renderItemCategory() {
    if (this.state.selectedSeries == undefined || this.state.selectedSeries.length == 0) {
      this.state.selectedSeries = this.state.data[0];
      return;
    }
    return (
      <View style={styles.pbinfostyle}>
        <View>
          <Image ></Image>
          <Text style={styles.pbInfoTextStyle}>
            <Text>{'Your '}</Text><Text style={styles.boldText}>{this.state.selectedSeries.key}</Text><Text>{' Personal Best achieved on '}</Text>
            <Text style={styles.boldText}>{this.state.selectedSeries.pbRace.eventDate.replace('T', ' ')}</Text><Text>{' at '}</Text><Text style={styles.boldText}> {this.state.selectedSeries.pbRace.eventName}</Text>
            {'\n'}
            <Text style={styles.pbTimeText}>{this.state.selectedSeries.pb}</Text>
          </Text>
        </View>
      </View>
    )
  }
  renderHeaderRow(item) {
    return (
      <View style={styles.rowStyle}>
        <View style={{ width: '18%', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle, {color: colors.dusk}}> {item[0]} </Text>
        </View>
        <View style={{ width: '25%', color: colors.mainPurple, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle}> {item[1]} </Text>
        </View>
        <View style={{ width: '20%', color: colors.mainPurple, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle}> {item[2]} </Text>
        </View>
        <View style={{ width: '37%', color: colors.mainPurple, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle}> {item[3]} </Text>
        </View>
      </View>
    );
  }
  renderRow(item, index) {
    let color_text = colors.mediumGrey;
    if (this.state.selectedCategory != '0' && item.pb == this.state.selectedPB) {
      color_text = colors.dusk;
    }
    return (
      <View style={styles.rowStyle} key={item.index}>
        <View style={{ width: '18%', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle, {color: color_text}}> {item.key} </Text>
        </View>
        <View style={{ width: '25%', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle, {color: color_text}}> {item.pb} </Text>
        </View>
        <View style={{ width: '27%', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle, {color: color_text}}> {item.pbRace.eventDate.replace('T', ' ')} </Text>
        </View>
        <View style={{ width: '30%', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.rowTextStyle, {color: color_text}}> {item.pbRace.eventName} </Text>
        </View>
      </View>
    );
  }
  render() {
    const headerTitles = ["Distance", "Personal Best", "Date", "Name Race"];
    let category = [];
    let chartData = [];
    this.state.tableData = [];
    var Highcharts='Highcharts';
    if (this.state.selectedCategory !== '0' && this.state.selectedCategory !== 0) {
      this.state.datacharts.map(element => {
        if (element.key === this.state.selectedCategory) {
          chartData = [{"key": element.key, "data": element.data, "pbTime": element.pbTime}];
        }
      })
      if (chartData.length != 0) {
        this.state.groups[this.state.selectedCategory].map(element => {
          this.state.tableData.push({"key": this.state.selectedCategory, "pb": element.result, "pbRace": element});
        })
        this.state.data.map(element => {
          if (element.key == this.state.selectedCategory) {
            this.state.selectedPB = element.pb;
          }
        });
      }
    } else {
      chartData = this.state.datacharts;
      this.state.tableData = this.state.data;
    }
    var conf={
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
        },
        title: {
            text: ''
        },
        xAxis: {
          type: 'datetime',
          labels: {
            format: '{value:%Y-%b}'
          },
        },
        yAxis: {
          title: {
            text: ''
          },
          labels: {
            formatter: function () {
              var time = this.value;
              var hours=parseInt(time/3600000);
              var mins=parseInt((parseInt(time%3600000))/60000);
              var secs=parseInt((parseInt((parseInt(time%3600000))%60000))/1000)
              return hours + ':' + mins + ':' + secs;
            }
          }
        },
        tooltip: {
          formatter: function () {
            var time = this.y;
            var hours=parseInt(time/3600000);
            var mins=parseInt((parseInt(time%3600000))/60000);
            var secs=parseInt((parseInt((parseInt(time%3600000))%60000))/1000)
            var times = hours.toString() + ':' + mins.toString() + ':' + secs.toString();
            return '<b>Start: </b>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                   '<b>Record: </b>' + times;
          }
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        plotOptions: {
          series: {
            marker: {
              enabled: true
            },
            cursor: 'pointer',
            point: {
                events: {
                    click: function () {
                      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'point', x: this.category, y: this.y, name: this.name}))
                    }
                }
            },
            events: {
              click: function (event) {  //__REACT_WEB_VIEW_BRIDGE.
                window.ReactNativeWebView.postMessage(JSON.stringify({name: this.name, type: 'series'}))
              }
            }
          },
          area: {
            events: {
              click: function (event) {
                window.ReactNativeWebView.postMessage(JSON.stringify({name: this.name, type: 'area'}))
              }
            }
          }
        },
        series: chartData
        // series: [
        //   {
        //     animation: {
        //       duration: 2000
        //     },
        //     data: chartData,
        //   }
        // ]
    };
    const options = {
      global: {
          useUTC: false
      },
      lang: {
          decimalPoint: ',',
          thousandsSep: '.'
      }
    };
    
    racelist.map((item) => {
      category.push(item);
    })
    this.state.data.map(({key}) => {
      let flag = true;
      let cate = key;
      if (key == "Half marathon")
        cate = "HM";
      else if (key == "Marathon")
        cate = "MA";
      else if (key.length > 6)
        cate = Number(key.substring(0, 5)).toFixed(2) + key.substring(key.length - 2); //Number("4.533332").toFixed(2)
      else
        cate = key;

      racelist.map((item) => {
        if (item == cate) 
          flag = false;
      });
      if (flag)
        category.push(cate);
      this.state.categorylist.push({key: cate, value: key});
    });
    category = category.reverse();
    if (this.state.selectedItem === "PersonalBestChart" && this.state.tempChartData.length > 0) {
      return (
        <View collapsable={false}
                    ref={view => {
                      this._container = view;
                    }} style={ styles.container }>
          <ScrollView>
          <View style={styles.headerStyle}>
            <TouchableOpacity style={{ justifyContent: 'flex-start', width: "10%" }} onPress={this.goBackProfile.bind(this)}>
              <MaterialIcons name="arrow-back" color={colors.mainPurple} style={{ fontSize: 25 }} />
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', width: '80%' }}>
              <Text style={styles.titleStyle}>{translate("header-personal-best")}</Text>
            </View>
            <TouchableOpacity style={{ width: "10%", flexDirection:'row', justifyContent: 'flex-end' }} onPress={this._shareSocial}>
              <MaterialIcons name="share" color={colors.mainPurple} style={{ fontSize: 25 }}/>
            </TouchableOpacity>
          </View>
          <View style={styles.centerPosition}>
            <SwitchSelector
              initial={1}
              onPress={this.getSelectedSwitchValue.bind(this)}
              textColor={colors.mainPurple}
              selectedColor={colors.whiteTwo}
              buttonColor={colors.mainPurple}
              borderColor={colors.mainPurple}
              hasPadding
              options={[
                {label: 'Plot', value: 'PersonalBestChart'},
                {label: 'Table', value: 'PersonalBestTable'},
              ]}
              animationDuration='100'
              style={styles.switchSelectorStyle}
              height={30}
            />
          </View>
          <View style={styles.centerPosition}>
            <AchievementFilterView
              data={category}
              init={0}
              onChangeItem={this.handleChangeCategory.bind(this)}
              type="raceCategory"
            />
          </View>
          <View style={styles.pbinfoViewStyle}>
            {(this.state.selectedCategory !== '0' && this.state.selectedCategory) ? this.renderItem() : this.renderItemCategory()}
          </View>
          <ChartView
            style={{height: 300}}
            config={conf}
            options={options}
            onMessage={m => {
              this.clickpoint(m)
            }}
            originWhitelist={['']}
          />
          {/* <HighchartsReactNative
            styles={{height: 300}}
            // options={conf}
            options={{
                series: [{
                    data: [1, 2, 3]
                }]
            }}
            modules={null}
            onMessage={m => {this.clickpoint(m)}}
          /> */}
        </ScrollView>
        </View>
      );
    } else {
      return (
        <View
          collapsable={false}
          ref={view => {
            this._container = view;
          }}
          style={styles.container}
        >
          <ScrollView>
            <View style={styles.headerStyle}>
              <TouchableOpacity
                style={{ justifyContent: "flex-start", width: "10%" }}
                onPress={() => this.props.navigation.navigate("Profile")}
              >
                <MaterialIcons
                  name="arrow-back"
                  color={colors.mainPurple}
                  style={{ fontSize: 25 }}
                />
              </TouchableOpacity>
              <View style={{ justifyContent: "center", width: "80%" }}>
                <Text style={styles.titleStyle}>
                  {translate("header-personal-best")}
                </Text>
              </View>
              <TouchableOpacity
                // style={{ width: "10%", justifyContent: "flex-end" }}
                style={{
                  width: "10%",
                  flexDirection: "row",
                  justifyContent: "flex-end"
                }}
                onPress={this._shareSocial}
              >
                <MaterialIcons
                  name="share"
                  color={colors.mainPurple}
                  style={{ fontSize: 25 }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.centerPosition}>
              <SwitchSelector
                initial={0}
                onPress={this.getSelectedSwitchValue.bind(this)}
                textColor={colors.mainPurple}
                selectedColor={colors.whiteTwo}
                buttonColor={colors.mainPurple}
                borderColor={colors.mainPurple}
                hasPadding
                options={[
                  { label: "Plot", value: "PersonalBestChart" },
                  { label: "Table", value: "PersonalBestTable" }
                ]}
                animationDuration="100"
                style={styles.switchSelectorStyle}
                height={30}
              />
            </View>
            <View style={styles.centerPosition}>
              <AchievementFilterView
                data={category}
                init={0}
                onChangeItem={this.handleChangeCategory.bind(this)}
                type="raceCategory"
              />
            </View>
            <View style={styles.centerPosition}>
              <View style={{ overflow: "scroll" }}>
                <View style={{ marginTop: 10 }}>
                  {this.renderHeaderRow(headerTitles)}
                </View>
                <View>
                  { this.state.tableData.length == 0 ? (<Text style={styles.pbInfoTextStyle}>no achievement</Text>) :
                  this.state.tableData.map((item, index) => {
                    return this.renderRow(item, index);
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  centerPosition: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopWidth: 0,
    marginTop: Constants.statusBarHeight,
    marginLeft: 16,
    marginRight: 16,
  },
  headerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 5,
    paddingBottom: 5,
  },
  titleStyle: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple,
    textAlign: 'center',
  },
  switchSelectorStyle: {
    width: '40%',
    fontSize: 13,
    fontWeight: "600",
    height: 28,
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    fontFamily: "PoppinsBold",
  },
  pbinfostyle: {
    textAlign: "center",
    width: "80%"
  },
  pbinfoViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: 250,
  },
  infoTextStyle: {
    fontSize: 14,
    color: colors.mainPurple,
    textAlign: "center",
    fontFamily: "PoppinsBold",
  },
  pbTimeText: {
    fontFamily: "PoppinsBold",
    fontSize: 35,
    color: colors.dusk,
    fontWeight: "800",
  },
  boldText: {
    fontWeight: "800"
  },
  lineStyle: {
    borderBottomColor: colors.whiteThree,
    borderBottomWidth: 1,
    borderStyle: "solid",
    marginTop: 10,
    marginBottom: 10,
  },
  pbInfoTextStyle: {
    fontSize: 18,
    color: colors.mainPurple,
    textAlign: "center",
  },
  rowStyle: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    borderBottomColor: colors.whiteThree,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 10,
  },
  rowItemStyle: {
    // flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    // alignContent: 'stretch',
  },
  rowTextStyle: {
    fontSize: 12,
    // fontFamily: 'PoppinBold',
    letterSpacing: 0,
    textAlign: 'center'
  }
});
