import React, { Component } from "react";
import { Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as colors from "../constants/colors";

export default class YearSelectorHorizontal extends Component {
  state = {
    data: []
  };
  UNSAFE_componentWillReceiveProps({ data, init, type }) {
    const selectedIndex = data.indexOf(init);
    if (type === "yearSelection")
      data.sort();
    data.push(0);
    if (type === "yearSelection")
      data.push(1);
    data.reverse();
    this.setState({
      init,
      data,
      selectedIndex
    });
  }
  renderItem = ({ item }) => {
    const selected = item === this.state.init;
    const styles = StyleSheet.create({
      container: {
        width: 47,
        height: 33,
        borderRadius: 16,
        borderStyle: "solid",
        borderColor: selected? colors.dusk: colors.whiteThree,
        borderWidth: 1,
        backgroundColor: selected ? colors.dusk : colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10
      },
      text: {
        color: selected ? "#FFFFFF" : colors.mediumGrey,
        opacity: selected ? 1.0 : 0.42,
        fontSize: 12,
        letterSpacing: 0,
        fontWeight: "bold"
      }
    });
    
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.onPress(item);
        }}
        style={styles.container}
      >
        { item == 1 ?
          <MaterialIcons name='tune' color={selected ? colors.white : colors.mediumGrey} size={20} />
          : <Text style={styles.text}>{item != 0 ? item : "All"}</Text>
        }
        
      </TouchableOpacity>
    );
  };
  render() {
    return (
      <FlatList
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => item + ""}
        {...this.props}
        horizontal={true}
      />
    );
  }
}
