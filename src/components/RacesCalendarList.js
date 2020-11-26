import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as R from "ramda";
import moment from "moment";

import * as colors from "../constants/colors";

const extractMonth = str => {
  return str.substring(5, 7);
};
const addGroup = event => {
  return R.assoc("month", extractMonth(R.prop("eventDate", event)), event);
};

export default class RacesCalendarList extends Component {
  renderItem({ item, index }) {
    const { eventDate, courseDistance, distanceUnit, city, country } = item;
    const distance = courseDistance + (distanceUnit === "Kilometer" ? "km" : "mile");
    const isHead = R.contains(index, this.heads);
    const month = moment.months()[moment(eventDate).month()];
    console.log("month " + index + "===> " + month);
    const location = city + " / " + country;
    const day = moment(eventDate).date();
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemIndicatorContainer}>
          {isHead ? 
            <View style={styles.itemLineIndicator} /> 
            : null
          }          
          <Text style={styles.itemYearIndicator}>
            {isHead ? month : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (this.props.onPress) this.props.onPress(item);
          }}
          style={isHead ? styles.itemContentHeaderContainer : styles.itemContentContainer}
        >
          <View style={styles.itemTextContainer}>
            <View style={{flexDirection: 'row', alignContent: 'center'}}>
              <Text style={styles.itemTitle}>{item.eventName}</Text>
              <MaterialIcons name="chevron-right" color={colors.dusk} style={{ fontSize: 20, marginTop: 2 }} />
            </View>
            <Text style={styles.itemSubtitle}>
              {month} {day}   {location}   {distance}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  render() {
    const data = R.sortBy(
      R.descend(R.prop("eventDate")),
      R.map(addGroup, this.props.data)
    );
    const months = [];
    this.heads = [];
    data.forEach((event, index) => {
      if (!R.contains(event.month, months)) {
        months.push(event.month);
        this.heads.push(index);
      }
    });

    return (
      <FlatList
        data={data}
        keyExtractor={item => item.id + item.EntryId + ""}
        renderItem={this.renderItem.bind(this)}
        style={{ padding: 15, marginBottom: 60 }}
      />
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "column",
    paddingRight: 12,
    paddingTop: 10,
    borderLeftColor: colors.mainPurple,
    borderLeftWidth: 3,
    borderStyle: 'solid',
  },
  itemIndicatorContainer: {
    flexDirection: "row",
    marginTop: -7,
  },
  itemLineIndicator: {
    backgroundColor: colors.mainPurple,
    width: 20,
    height: 3,
    marginRight: 10
  },
  itemYearIndicator: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.mainPurple,
    width: 100,
    alignSelf: "center",
    position: 'absolute',
    top: -6,
    left: 30,
    zIndex: 1,
    // marginBottom: 16,
  },
  itemContentContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginLeft: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 4,
    flex: 1
  },
  itemContentHeaderContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginLeft: 20,
    padding: 20,
    borderRadius: 4,
    flex: 1
  },
  itemTextContainer: {
    flex: 1
  },
  itemTitle: {
    color: colors.dusk,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 5
  },
  itemSubtitle: {
    color: colors.mediumGrey,
    fontSize: 12,
    marginLeft: 5
  }
});
