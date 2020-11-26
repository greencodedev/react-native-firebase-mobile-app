import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";

import YearSelectorHorizontal from "./YearSelectionHorizontal";

export default class AchievementFilterView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: props.init
    };
  }
  render() {
    return (
      <View style={styles.filterViewContainer}>
        <YearSelectorHorizontal
          data={this.props.data}
          init={this.state.year}
          onPress={this.handleChangeYear}
          type={this.props.type}
        />
      </View>
    );
  }
  handleChangeYear = year => {
    this.setState({ year });
    if (this.props.onChangeItem) this.props.onChangeItem(year);
  };
}

const styles = StyleSheet.create({
  filterViewContainer: {
    height: 50,
    paddingTop: 5,
    paddingBottom: 5,
    textAlign: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: "#FFF",
    marginLeft: 44,
    marginRight: 44,
  }
});
