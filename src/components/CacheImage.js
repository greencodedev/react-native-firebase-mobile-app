import React from "react";
import { Image } from "react-native";
import * as FileSystem from 'expo-file-system';

import { hashOf, createCancelablePromise } from "@utils";

class CacheImage extends React.PureComponent {
  state = { source: this.props.source };

  componentDidMount() {
    if (typeof this.props.source === "number") {
      return;
    }

    const remoteUri = this.props.source.uri;
    const fileUri = FileSystem.documentDirectory + hashOf(remoteUri) + ".jpg";
    this.backgroundTask = createCancelablePromise(
      FileSystem.getInfoAsync(fileUri)
    );
    this.backgroundTask.promise.then(({ exists, uri }) => {
      if (exists) {
        console.log("exists!");
        this.setState({ source: { uri } });
      } else {
        FileSystem.downloadAsync(remoteUri, fileUri).catch(e => console.log(e));
      }
    });
  }

  componentWillUnmount() {
    if (this.backgroundTask) {
      this.backgroundTask.cancel();
    }
  }

  render() {
    const newProps = { ...this.props, source: this.state.source };
    return <Image {...newProps} />;
  }
}

export default CacheImage;
