import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as R from "ramda";
import moment from "moment";

import * as colors from "../constants/colors";
import { convert } from "@utils";

const extractYear = str => {
  return str.substring(0, 4);
};
const addGroup = event => {
  return R.assoc("year", extractYear(R.prop("eventDate", event)), event);
};

export default class RacesResultsList extends Component {
  renderItem({ item, index }) {
    const { eventDate, courseDistance, distanceUnit, result } = item;
    const distance = convert(courseDistance); //+ (distanceUnit === "Kilometer" ? "km" : "mile");
    const isHead = R.contains(index, this.heads);
    const month = moment.months()[moment(eventDate).month()];
    const day = moment(eventDate).date();
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemIndicatorContainer}>
          {isHead ? <View style={styles.itemLineIndicator} /> : null}
          <Text style={styles.itemYearIndicator}>
            {isHead ? item.year : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (this.props.onPress) this.props.onPress(item);
          }}
          style={
            isHead
              ? styles.itemContentHeaderContainer
              : styles.itemContentContainer
          }
        >
          <View style={styles.itemTextContainer}>
            <View style={{ flexDirection: "row", alignContent: "center" }}>
              <Text style={styles.itemTitle}>{item.eventName}</Text>
              <MaterialIcons
                name="chevron-right"
                color={colors.dusk}
                style={styles.itemIcon}
              />
            </View>
            <View style={{ flexDirection: "row", alignContent: "center" }}>
              <Text style={styles.itemSubtitle}>{distance}:</Text>
              <Text style={styles.itemSubtitle2}>
                {result}; {month} {day}
              </Text>
            </View>
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
    const years = [];
    this.heads = [];
    data.forEach((event, index) => {
      if (!R.contains(event.year, years)) {
        years.push(event.year);
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
    paddingTop: 10,
    paddingBottom: 10,
    borderLeftColor: colors.mainPurple,
    borderLeftWidth: 3,
    borderStyle: "solid"
  },
  itemIndicatorContainer: {
    flexDirection: "row",
    flex: 1,
    marginTop: -7
  },
  itemLineIndicator: {
    backgroundColor: colors.mainPurple,
    width: 20,
    height: 3,
    marginRight: 10
  },
  itemYearIndicator: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.mainPurple,
    width: 40,
    alignSelf: "center",
    marginTop: -8,
    zIndex: 100
  },
  itemContentContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginLeft: 20,
    padding: 20,
    paddingTop: 0,
    borderRadius: 4,
    marginTop: -10,
    flex: 1
  },
  itemContentHeaderContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginLeft: 20,
    padding: 20,
    paddingBottom: 20,
    paddingTop: 10,
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
    marginLeft: 5,
    width: "95%"
  },
  itemIcon: {
    fontSize: 20,
    marginTop: 2,
    width: "5%",
    justifyContent: "flex-end"
  },
  itemSubtitle: {
    color: colors.mainPurple,
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5
  },
  itemSubtitle2: {
    color: colors.mediumGrey,
    fontSize: 12,
    marginLeft: 5
  }
});
