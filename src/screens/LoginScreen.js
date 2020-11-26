import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  ActivityIndicator
} from "react-native";
import { observer } from "mobx-react/native";
import { StackActions, NavigationActions } from "react-navigation";

import { LogInWithGoogleButton, LogInWithFacebookButton } from "@components";
import { loginWithGoogle, loginWithFacebook, getUser } from "@logics/auth";
import { getUserPromises } from "@logics/data-logic";
import { hydrateUserStore, userStore } from "@stores";
import * as colors from "@constants/colors";

const GOOGLE = "Google";
const FACEBOOK = "Facebook";

// TODO: Image should be choosen and stored in assets
const remote =
  "https://dgtzuqphqg23d.cloudfront.net/UscoKxvxNJL4MbbWYIxluvm3sESCPo9sP9xHQZnADdI-2048x1536.jpg";

@observer
export default class LoginScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };

  state = {
    loading: false
  };

  async componentDidMount() {
    this.showLoading();
    await hydrateUserStore();
    this.dismissLoading();
  }

  render() {
    const loginButtons = (
      <View style={styles.loginButtonsContainer}>
        <View style={styles.loginButton}>
          <LogInWithGoogleButton
            onPress={e => {
              this.handleLoginWithProvider(GOOGLE);
            }}
          />
        </View>
        <View style={styles.loginButton}>
          <LogInWithFacebookButton
            onPress={e => {
              this.handleLoginWithProvider(FACEBOOK);
            }}
          />
        </View>
      </View>
    );
    // TODO: Should use style for size and color
    const loadingView = (
      <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />
    );
    return (
      <ImageBackground
        style={styles.container}
        source={{ uri: remote }}
        imageStyle={{ resizeMode: "stretch" }}
      >
        <View style={styles.backbroundContainer} />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to onRun</Text>
        </View>
        {this.state.loading ? loadingView : loginButtons}
      </ImageBackground>
    );
  }

  handleLoginWithProvider(provider) {
    const providers = [GOOGLE, FACEBOOK];
    if (providers.indexOf(provider) === -1) {
      // TODO: Show error
      return;
    }
    this.showLoading();
    const self = this;
    new Promise((resolve, reject) => {
      if (provider === GOOGLE) {
        loginWithGoogle(resolve, reject);
      } else {
        loginWithFacebook(resolve, reject);
      }
    })
      .then(async () => {
        const user = getUser();
        const hasProfile = userStore.hasProfile;
        const promises = getUserPromises(user);
        await Promise.all(promises);
        const routeName = hasProfile ? "App" : "EditProfile";
        self.props.navigation.navigate(routeName);
      })
      .catch(status => {
        self.dismissLoading();
        console.log("An error occurred", status);
      });
  }

  showLoading() {
    this.setState({ loading: true });
  }
  dismissLoading() {
    this.setState({ loading: false });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    opacity: 0.8,
    justifyContent: "flex-end",
    paddingLeft: 30,
    paddingRight: 30
  },
  welcomeContainer: {
    flex: 1,
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  backbroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%"
  },
  background: {
    flex: 1,
    resizeMode: "center"
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.login_welcome
  },
  loginButtonsContainer: {
    flexDirection: "column",
    marginBottom: 50
  },
  loginButton: {
    margin: 5
  },
  loading: {
    marginBottom: 50
  }
});
