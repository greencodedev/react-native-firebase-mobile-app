import React, { Component } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Share
} from "react-native";
import * as R from "ramda";
import moment from "moment";
import SwitchSelector from "react-native-switch-selector";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import ChartView from "react-native-highcharts";
import { withLoading } from "../HOC";

import * as colors from "../constants/colors";
import { userStore } from "../stores";
import translate from "@utils/translate";
import { convert } from "@utils";
import { race } from "rsvp";
import { AchievementFilterView } from "../components";
import { calculateTime, calculateTimestamp } from "../utils";

const HighChart = withLoading(ChartView)("data");
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
      selectedItem: "",
      selectedCategory: "0",
      selectedAchiev: [],
      selectedNode: [],
      selectedSeries: []
    };
  }
  handleChangeCategory(category) {
    let selectedAchiev = [],
      selectedCategory = category;
    this.state.data.map(element => {
      if (element.key === category) selectedAchiev = element;
    });
    this.setState({
      selectedAchiev,
      selectedCategory,
      selectedNode: []
    });
  }
  fetch() {
    let categoryList = [];
    console.log(this.props.navigation.state.params);
    if (this.props.navigation.state.params) {
      this.setState({ loading: true });
      const { uid } = this.props.navigation.state.params;
      const achievements = R.filter(
        R.compose(R.not, R.isNil, R.prop("courseDistance")),
        R.pathOr([], ["achievements", uid], userStore)
      );
      const groups = R.groupBy(a => convert(a.courseDistance))(achievements);
      const data = [];
      Object.keys(groups).map(key => {
        let pbTime = 100000000000000; // max time in seconds
        let pbRace = null;
        let pb;
        groups[key].map(ach => {
          let resultTime = ach.result.split(".");
          let raceTime = moment.duration(resultTime[0]).asSeconds();
          if (raceTime < pbTime) {
            pbTime = raceTime;
            pb = ach.result;
            pbRace = ach;
          }
        });
        let groupData = [];
        groups[key].map(ach => {
          var date;
          let raceTime = calculateTimestamp(ach.result);
          date = new Date(ach.eventDate);
          groupData.push([date.getTime(), raceTime]);
        });
        this.state.datacharts.push({
          key: key,
          data: groupData,
          pbTime: pb
        }); // pb: pbRace
        data.push({ key, pb, pbRace });
      });
      this.setState({ data, groups, loading: false });
    }
  }
  componentDidMount() {
    this.setState({ selectedItem: "" });
    this.fetch();
  }
  getSelectedSwitchValue(value) {
    this.setState({ selectedItem: value });
    this.props.navigation.navigate(value);
  }
  _shareSocial = async () => {
    let message = "https://itunes.apple.com/us/app/OnRun";
    let title = "Share";
    try {
      await captureRef(this._container, {
        format: "png"
      }).then(result => {
        Share.share({
          title: title,
          message: message,
          url: result
        });
      });
    } catch (error) {
      console.log(error);
    }
  };
  clickpoint(message) {
    console.log("message ===> ", message);
    let data = JSON.parse(message.nativeEvent.data);
    if (
      data.type == "point" &&
      this.selectedCategory != "0" &&
      this.selectedCategory
    ) {
      console.log(
        "this.state.groups[this.state.selectedCategory] ==> ",
        this.selectedCategory
      );
      this.state.groups[this.state.selectedCategory].map(element => {
        var eventDate = new Date(element.eventDate);
        eventDate = eventDate.getTime();
        if (eventDate == parseInt(data.x)) {
          if (data.y !== calculateTimestamp(this.state.selectedAchiev.pb))
            this.setState({ selectedNode: element });
          else this.setState({ selectedNode: [] });
        }
      });
    } else {
      if (data.name == undefined) {
        return;
      }
      var numSeries = parseInt(data.name.split(" ")[1]);
      this.setState({
        selectedSeries: this.state.data[numSeries - 1]
      });
    }
  }
  renderItem() {
    return (
      <View style={styles.pbinfostyle}>
        <View>
          <Image></Image>
          <Text style={styles.pbInfoTextStyle}>
            <Text>{"Your "}</Text>
            <Text style={styles.boldText}>{this.state.selectedCategory}</Text>
            <Text>{" Personal Best achieved on "}</Text>
            <Text style={styles.boldText}>
              {this.state.selectedAchiev.pbRace.eventDate.replace("T", " ")}
            </Text>
            <Text>{" at "}</Text>
            <Text style={styles.boldText}>
              {" "}
              {this.state.selectedAchiev.pbRace.eventName}
            </Text>
            {"\n"}
            <Text style={styles.pbTimeText}>
              {this.state.selectedAchiev.pb}
            </Text>
          </Text>
        </View>
        {this.state.selectedNode.length === 0 ? (
          <View></View>
        ) : (
          <View>
            <View style={styles.lineStyle}></View>
            <Text style={styles.infoTextStyle}>
              <Text>{"Your "}</Text>
              <Text style={styles.boldText}>{this.state.selectedCategory}</Text>
              <Text>{" result achieved on "}</Text>
              <Text style={styles.boldText}>
                {this.state.selectedNode.eventDate.replace("T", " ")}
              </Text>
              <Text>{" at "}</Text>
              <Text style={styles.boldText}>
                {this.state.selectedNode.eventName + " "}
              </Text>
              <Text>
                {calculateTime(
                  calculateTimestamp(this.state.selectedNode.result) -
                    calculateTimestamp(this.state.selectedAchiev.pb)
                ) + " "}
              </Text>
              <Text> min slower.</Text>
            </Text>
          </View>
        )}
      </View>
    );
  }
  renderItemCategory() {
    if (
      this.state.selectedSeries == undefined ||
      this.state.selectedSeries.length == 0
    ) {
      this.state.selectedSeries = this.state.data[0];
      return;
    }
    return (
      <View style={styles.pbinfostyle}>
        <View>
          <Image></Image>
          <Text style={styles.pbInfoTextStyle}>
            <Text>{"Your "}</Text>
            <Text style={styles.boldText}>{this.state.selectedSeries.key}</Text>
            <Text>{" Personal Best achieved on "}</Text>
            <Text style={styles.boldText}>
              {this.state.selectedSeries.pbRace.eventDate.replace("T", " ")}
            </Text>
            <Text>{" at "}</Text>
            <Text style={styles.boldText}>
              {" "}
              {this.state.selectedSeries.pbRace.eventName}
            </Text>
            {"\n"}
            <Text style={styles.pbTimeText}>
              {this.state.selectedSeries.pb}
            </Text>
          </Text>
        </View>
      </View>
    );
  }
  render() {
    let category = [];
    let chartData = [];
    var Highcharts = "Highcharts";
    if (
      this.state.selectedCategory !== "0" &&
      this.state.selectedCategory !== 0
    ) {
      this.state.datacharts.map(element => {
        if (element.key === this.state.selectedCategory) {
          chartData = [
            {
              key: element.key,
              data: element.data,
              pbTime: element.pbTime
            }
          ];
        }
      });
    } else {
      chartData = this.state.datacharts;
    }
    var conf = {
      chart: {
        type: "spline",
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10
      },
      title: {
        text: ""
      },
      xAxis: {
        type: "datetime",
        labels: {
          format: "{value:%Y-%b}"
        }
      },
      yAxis: {
        title: {
          text: ""
        },
        labels: {
          formatter: function() {
            var time = this.value;
            var hours = parseInt(time / 3600000);
            var mins = parseInt(parseInt(time % 3600000) / 60000);
            var secs = parseInt(
              parseInt(parseInt(time % 3600000) % 60000) / 1000
            );
            return hours + ":" + mins + ":" + secs;
          }
        }
      },
      tooltip: {
        formatter: function() {
          var time = this.y;
          var hours = parseInt(time / 3600000);
          var mins = parseInt(parseInt(time % 3600000) / 60000);
          var secs = parseInt(
            parseInt(parseInt(time % 3600000) % 60000) / 1000
          );
          var times =
            hours.toString() + ":" + mins.toString() + ":" + secs.toString();
          return (
            "<b>Start: </b>" +
            Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x) +
            "<br/>" +
            "<b>Record: </b>" +
            times
          );
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
          cursor: "pointer",
          point: {
            events: {
              click: function() {
                console.log("name ==> ", this.name);
                window.__REACT_WEB_VIEW_BRIDGE.postMessage(
                  JSON.stringify({
                    type: "point",
                    x: this.category,
                    y: this.y,
                    name: this.name
                  })
                );
              }
            }
          },
          events: {
            click: function(event) {
              window.__REACT_WEB_VIEW_BRIDGE.postMessage(
                JSON.stringify({
                  name: this.name,
                  type: "series"
                })
              );
            }
          }
        }
      },
      series: chartData
    };

    const options = {
      global: {
        useUTC: false
      },
      lang: {
        decimalPoint: ",",
        thousandsSep: "."
      }
    };
    this.state.data.map(({ key }) => {
      category.push(key);
    });

    
    // var seen = [];
    // console.log("races ===> " + JSON.stringify(this.state.data, function(key, val) {
    //     if (val != null && typeof val == "object") {
    //         if (seen.indexOf(val) >= 0) {
    //             return;
    //         }
    //         seen.push(val);
    //     }
    //     return val;
    // }));

    return (
      <View
        style={{
          justifyContent: "center",
          marginLeft: 16,
          marginRight: 16,
          backgroundColor: colors.white
        }}
      >
        <View style={styles.headerStyle}>
          <TouchableOpacity
            style={{ justifyContent: "flex-start" }}
            onPress={() => this.props.navigation.navigate("Profile")}
          >
            <MaterialIcons
              name="arrow-back"
              color={colors.mainPurple}
              style={{ fontSize: 25 }}
            />
          </TouchableOpacity>
          <View style={{ justifyContent: "center", width: "90%" }}>
            <Text style={styles.titleStyle}>
              {translate("header-personal-best")}
            </Text>
          </View>
          <TouchableOpacity
            //  style={{ position: "absolute", right: 0, top: 8 }}
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
        <View style={{ justifyContent: "center" }}>
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
        <AchievementFilterView
          data={category}
          init={0}
          onChangeItem={this.handleChangeCategory.bind(this)}
          type="raceCategory"
        />

        {this.state.selectedCategory !== "0" && this.state.selectedCategory
          ? this.renderItem()
          : this.renderItemCategory()}
        <ChartView
          style={{ height: 300 }}
          config={conf}
          options={options}
          onMessage={m => {
            this.clickpoint(m);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopWidth: 0
  },
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingTop: 5,
    paddingBottom: 5
  },
  titleStyle: {
    // fontFamily: "PoppinsBold",
    fontSize: 20,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple,
    textAlign: "center"
  },
  switchSelectorStyle: {
    width: "40%",
    fontSize: 13,
    fontWeight: "600",
    height: 28,
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10
    // fontFamily: "PoppinsBold",
  },
  pbinfostyle: {
    justifyContent: "center",
    alignItems: "center",
    height: 250,
    textAlign: "center"
  },
  infoTextStyle: {
    fontSize: 14,
    color: colors.mainPurple,
    textAlign: "center"
    // fontFamily: 'Poppins',
  },
  pbTimeText: {
    // fontFamily: 'Poppins',
    fontSize: 35,
    color: colors.dusk,
    fontWeight: "800"
  },
  boldText: {
    fontWeight: "800"
  },
  lineStyle: {
    borderBottomColor: colors.whiteThree,
    borderBottomWidth: 1,
    borderStyle: "solid",
    marginTop: 10,
    marginBottom: 10
  },
  pbInfoTextStyle: {
    fontSize: 18,
    color: colors.mainPurple,
    textAlign: "center"
  }
});
