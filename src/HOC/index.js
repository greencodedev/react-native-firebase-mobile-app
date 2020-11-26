import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import PropTypes from "prop-types";
import * as colors from "@constants/colors";

export const withLoading = WrappedComponent => (dataProp, text = "") => {
  return class LoadingContainer extends React.PureComponent {
    static propTypes = { loading: PropTypes.bool.isRequired };
    render() {
      const { loading, children, renderEmptyData, ...otherProps } = this.props;
      let isEmpty = this.props[dataProp] && this.props[dataProp].length === 0;
      return (
        <React.Fragment>
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator />
              <View style={{marginTop: 20, alignItems: "center", justifyContent: "center"}}>
                <Text style={{ fontFamily: 'PoppinsBold', fontSize: 12, color: colors.mediumGrey }}>{text}</Text>
              </View>
            </View>
          ) : isEmpty ? (
            renderEmptyData()
          ) : (
            <WrappedComponent {...otherProps}>{children}</WrappedComponent>
          )}
        </React.Fragment>
      );
    }
  };
};

export const withLabel = WrappedComponent => ({
  label,
  error,
  errorMessage,
  containerStyle,
  style,
  children,
  ...otherProps
}) => {
  return (
    <View style={containerStyle}>
      <Text>{label}</Text>
      <WrappedComponent {...otherProps} style={[style, { marginTop: 10 }]}>
        {children}
      </WrappedComponent>
      {error && (
        <Text style={{ marginLeft: 5, color: "red" }}>{errorMessage}</Text>
      )}
    </View>
  );
};
