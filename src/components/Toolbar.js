import React from "react";
import { View, StyleSheet, Text } from "react-native";

import * as colors from "@constants/colors";

export default (Toolbar = props => {
  const { start, end, title, main } = props;
  if (main) {
    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>{main}</View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.startContainer}>{start ? start : null}</View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title ? title : ""}</Text>
      </View>
      <View style={styles.endContainer}>{end ? end : null}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: null,
    height: 48,
    backgroundColor: colors.primary,
    justifyContent: "center",
    flexDirection: "row",
    padding: 10
  },
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  endContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end"
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center"
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: colors.toolbarTitle
  }
});
