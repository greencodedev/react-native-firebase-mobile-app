import React, { PureComponent } from "react";
import { TextInput, StyleSheet } from "react-native";

export default class Input extends PureComponent {
  render() {
    const styles = createStyles(this.props);
    const { style, ...otherProps } = this.props;
    return (
      <TextInput
        underlineColorAndroid="transparent"
        placeholderTextColor="#663B5998"
        style={[styles.input, style]}
        {...otherProps}
      />
    );
  }
}

const createStyles = props => {
  return StyleSheet.create({
    input: {
      height: 46,
      width: props.width,
      textAlignVertical: props.textAlignVertical
        ? props.textAlignVertical
        : "auto",
      borderWidth: 0,
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 15,
      paddingTop: 15,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      fontSize: 13,
      opacity: 0.88,
      backgroundColor: "#FFFFFF"
    }
  });
};
