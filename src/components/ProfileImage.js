import React from "react";
import { StyleSheet } from "react-native";
import CacheImage from "@components/CacheImage";

export default (ProfileImage = ({ size, source: { uri }, source }) => {
  const styles = createStyles(size);
  return (
    <CacheImage
      style={styles.image}
      source={uri ? source : require("../../assets/profile-blank.png")}
    />
  );
});

const createStyles = size => {
  const radius = size / 2;
  const styles = StyleSheet.create({
    image: {
      width: size,
      height: size,
      borderRadius: radius
    }
  });
  return styles;
};
