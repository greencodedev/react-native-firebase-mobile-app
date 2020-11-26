import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image
} from "react-native";
// import { DangerZone } from "expo";
import CardFlip from 'react-native-card-flip';
import NetInfo from "@react-native-community/netinfo";

// const { Lottie } = DangerZone;
import { Ionicons } from "@expo/vector-icons";

import translate from "@utils/translate";
import Firebase from "@logics/firebase";
import { isUserLoggedIn, getUser } from "@logics/auth";
import { hydrateUserStore, userStore } from "@stores";
import { loadAssetsAsync } from "@logics";
import { getUserPromises } from "@logics/data-logic";
import * as colors from "@constants/colors";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export default class SplashScreen extends Component {
  state = {
    animation: null,
    error: false,
    errorMessage: "",
    loading: false,
    card: null,
  };
  UNSAFE_componentWillMount() {
    // this._playAnimation();
  }

  componentDidMount() {
    this.start();
  }

  render() {
    const welcomeMessage = translate("welcome-message");
    return (
      <View style={styles.container}>
        <CardFlip style={styles.cardContainer} ref={(card) => this.state.card = card} duration={500}>
          <Image source={require('./../../assets/flipcard1.png')} style={ styles.markColor }/>
          <Image source={require('./../../assets/flipcard2.png')} style={ styles.markColor }/>
        </CardFlip>
        <Text style={styles.text}>{welcomeMessage}</Text>
        {!this.state.loading && (
          <React.Fragment>
            <TouchableOpacity onPress={() => this.start()}>
              <Ionicons name="ios-refresh" size={32} />
            </TouchableOpacity>
            {this.state.error && (
              <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
            )}
          </React.Fragment>
        )}
      </View>
    );
  }

  async start() {
    this.setState({ error: false, errorMessage: "", loading: true });
    setInterval(() => {
      if (this.state.card)
        this.state.card.flip({ flipDirection: '50'});
    }, 1000);
    const isConnected = await NetInfo.isConnected.fetch();
    if (!isConnected) {
      return this.setState({
        error: true,
        errorMessage: "Your device is not connected to Internet. Try again!",
        loading: false
      });
    }
    await Promise.all(hydrateUserStore, loadAssetsAsync);
    await new Promise((resolve, reject) => {
      Firebase.init(resolve, reject);
    })
      .then(async () => {
        const isLoggedIn = isUserLoggedIn();
        if (isLoggedIn) {
          const user = getUser();
          if (userStore.hasProfile) {
            const promises = getUserPromises(user);
            await Promise.all(promises);
          }
        }
        await sleep(2000);
        await this.finish();
      })
      .catch(status => {
        alert("connection error => ", status);
        this.setState({
          error: true,
          errorMessage: status,
          loading: false
        })
      });
  }
  async finish() {
    const isLoggedIn = isUserLoggedIn();
    const hasProfile = userStore.hasProfile;
    const isFetched = userStore.user.fetched;
    const routeName = isLoggedIn
      ? hasProfile
        ? isFetched
          ? "App"
          : "CreateProfile"
        : "CreateProfile"
      : "Register";
    const params =
      routeName === "CreateProfile"
        ? {
            nextRoute: isFetched ? "App" : "CreateProfile",
            fetch: true,
            backButton: false
          }
        : routeName === "CreateProfile"
        ? {
            nextRoute: "App"
          }
        : {};
    this.props.navigation.navigate(routeName, params);
  }

  _playAnimation = () => {
    if (!this.state.animation) {
      this._loadAnimationAsync();
    } else {
      this.animation.reset();
      this.animation.play();
    }
  };
  _pauseAnimation = () => {
    if (this.animation) {
      this.animation.reset();
    }
  };
  _loadAnimationAsync = async () => {
    const result = require("@assets/animation/us.json");
    this.setState({ animation: result }, this._playAnimation);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mainPurple,
    padding: 20
  },
  animation: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    alignContent: "center",
    padding: 0,
    margin: 0
  },
  text: {
    color: "#FFF",
    fontSize: 24
  },
  cardContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.mainPurple
  },
  card: {
    shadowOpacity: 0.5,
  },
  markColor: {
    alignSelf: 'center'
  }
});
