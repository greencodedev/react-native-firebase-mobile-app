import React from "react";
import { View, Text, StyleSheet } from "react-native";

import ProfileImage from "./ProfileImage";
import * as colors from "@constants/colors";

export default (Achievement = props => {
  const profileUri =
    "https://dgtzuqphqg23d.cloudfront.net/UscoKxvxNJL4MbbWYIxluvm3sESCPo9sP9xHQZnADdI-2048x1536.jpg";
  const attendeeName = "Rojyar Gandomi";
  const eventName = props.eventName;
  const minPace = 9;
  const maxPace = 8;
  return (
    <View style={styles.container}>
      <ProfileImage size={60} source={{ uri: profileUri }} />
      <View style={styles.detailContainer}>
        <Text style={styles.attendeeName}>{attendeeName}</Text>
        <Text style={styles.eventName}>{eventName}</Text>
        <Text style={styles.pace}>
          Pace: {maxPace}-{minPace} min/mile
        </Text>
        <Text style={styles.eventStats}>3 Going - 5 Interested - 2 Share</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderColor: colors.primary
  },
  detailContainer: {
    paddingLeft: 10
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 10
  },
  eventName: {
    fontSize: 12,
    color: "#00446E"
  },
  pace: {
    fontSize: 12,
    color: "#20C75A"
  },
  eventStats: {
    fontSize: 12,
    color: "#0196C3"
  }
});
