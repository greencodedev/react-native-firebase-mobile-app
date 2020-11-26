import React, { Component } from "react";
import { FlatList, View } from "react-native";
import { observer } from "mobx-react/native";

import { PostFeed } from "@components";
// TODO: It should be fetchBookmarks
import { fetchBookmarks } from "@logics/data-logic";

@observer
export default class BookmarkScreen extends Component {
  static navigationOptions = {
    title: "Bookmarks"
  };
  state = {
    isFetching: false,
    bookmarks: []
  };
  renderItem(row) {
    const { item, index } = row;
    return <PostFeed user={item.user} post={item} />;
  }
  componentDidMount() {
    this.fetch();
  }
  handleRefresh() {
    this.fetch();
  }
  fetch() {
    const { user } = this.props.navigation.state.params;
    this.setState({ isFetching: true }, () => {
      fetchBookmarks(user.uid)
        .then(bookmarks => {
          this.setState({ isFetching: false, bookmarks });
        })
        .catch(err => {
          this.setState({ isFetching: false });
        });
    });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          refreshing={this.state.isFetching}
          onRefresh={() => this.handleRefresh()}
          data={this.state.bookmarks}
          keyExtractor={item => item.id}
          renderItem={this.renderItem.bind(this)}
        />
      </View>
    );
  }
}
