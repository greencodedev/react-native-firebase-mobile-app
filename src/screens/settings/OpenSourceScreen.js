import React from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Card, Title, Subheading, Paragraph } from "react-native-paper";
import Constants from 'expo-constants';

import translate from "@utils/translate";

const libraries = [
  {
    key: "expo",
    name: "Expo",
    version: "31.0.0",
    description: ""
  },
  {
    key: "react-navigation",
    name: "React Navigation",
    version: "3.0.9",
    description: ""
  }
];

class OpenSourceLibraryCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpenned: props.isOpenned ? props.isOpenned : false
    };
  }
  handlePress = () => this.setState({ isOpenned: !this.state.isOpenned });
  render() {
    const {
      item: { name, version, description }
    } = this.props;
    return (
      <TouchableOpacity onPress={this.handlePress}>
        <Card style={{ margin: 10 }}>
          <Card.Content>
            <Title>{name}</Title>
            <Subheading>{version}</Subheading>
            <Paragraph>{description}</Paragraph>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }
}

export default class OpenSourceScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: translate("header-open-source")
  });
  render() {
    return (
      <FlatList
        contentContainerStyle={styles.container}
        data={libraries}
        renderItem={props => <OpenSourceLibraryCard {...props} />}
        keyExtractor={item => item.key}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight
  }
});
