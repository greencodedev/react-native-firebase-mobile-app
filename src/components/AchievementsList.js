import React, { Component } from "react";
import { TouchableOpacity, FlatList } from "react-native";

import Achievement from "./Achievement";

export default class AchievementsList extends Component {
  renderItem(row) {
    const { item, index } = row;
    const { eventName, result, oveRank } = item;
    return (
      <TouchableOpacity onPress={() => this.props.onPress(item)}>
        <Achievement eventName={eventName} key={index + "r"} />
      </TouchableOpacity>
    );
  }
  render() {
    const { data, ...otherProps } = this.props;
    return (
      <FlatList
        data={data}
        keyExtractor={item => item.eventName + "," + item.EntryId}
        renderItem={this.renderItem.bind(this)}
        {...otherProps}
      />
    );
  }
}
