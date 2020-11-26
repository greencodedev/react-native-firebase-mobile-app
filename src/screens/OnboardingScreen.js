import React, { Component } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from "react-native";
// import AppIntroSlider from "react-native-app-intro-slider";
import AppIntro from 'rn-falcon-app-intro';
import * as Expo from "expo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import * as colors from "@constants/colors";

// const Slider = withLoading(SliderBox)("images", "Wait until the photo is loaded.");

export default class OnboardingScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  constructor(props) {
    super(props);
  }
  _renderItem = ({ item, dimensions }) => {
    return (
      <ScrollView
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0, y: 1 }}
        style={[styles.contentSlide, dimensions]}
      >
        <Image
          source={item.image}
          resizeMode="stretch"
          style={[styles.imageStyle, dimensions]}
        ></Image>
      </ScrollView>
    );
  };
  _renderNextButton = () => {
    return (
      <View style={styles.buttonPagination}>
        <Text style={styles.btnText}>Next</Text>
        <MaterialIcons
          name="chevron-right"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: "transparent" }}
        />
      </View>
    );
  };
  _renderPrevButton = () => {
    return (
      <View style={styles.buttonPagination}>
        <MaterialIcons
          name="chevron-left"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: "transparent" }}
        />
        <Text style={styles.btnText}>Prev</Text>
      </View>
    );
  };
  _renderDoneButton = () => {
    return (
      <View style={styles.buttonPagination}>
        <Text style={styles.btnText}>Finish</Text>
        <MaterialIcons
          name="chevron-right"
          color="rgba(255, 255, 255, .9)"
          size={24}
          style={{ backgroundColor: "transparent" }}
        />
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        {/* <AppIntroSlider
          slides={slides}
          showPrevButton={true}
          renderDoneButton={this._renderDoneButton}
          renderNextButton={this._renderNextButton}
          renderPrevButton={this._renderPrevButton}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          onDone={() => this.props.navigation.navigate("App")}
        /> */}
        <AppIntro
          nextBtnLabel="Next"
        >
          <View style={[styles.slide,{ backgroundColor: '#fa931d' }]}>
            <View level={10}><Text style={styles.text}>Page 1</Text></View>
            <View level={15}><Text style={styles.text}>Page 1</Text></View>
            <View level={8}><Text style={styles.text}>Page 1</Text></View>
          </View>
          <View style={[styles.slide, { backgroundColor: '#a4b602' }]}>
            <View level={-10}><Text style={styles.text}>Page 2</Text></View>
            <View level={5}><Text style={styles.text}>Page 2</Text></View>
            <View level={20}><Text style={styles.text}>Page 2</Text></View>
          </View>
          <View style={[styles.slide,{ backgroundColor: '#fa931d' }]}>
            <View level={8}><Text style={styles.text}>Page 3</Text></View>
            <View level={0}><Text style={styles.text}>Page 3</Text></View>
            <View level={-10}><Text style={styles.text}>Page 3</Text></View>
          </View>
          <View style={[styles.slide, { backgroundColor: '#a4b602' }]}>
            <View level={5}><Text style={styles.text}>Page 4</Text></View>
            <View level={10}><Text style={styles.text}>Page 4</Text></View>
            <View level={15}><Text style={styles.text}>Page 4</Text></View>
          </View>
        </AppIntro>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.mainPurple,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: Constants.statusBarHeight,
    paddingBottom: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around"
  },
  buttonPagination: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  contentSlide: {
    flex: 1,
    justifyContent: "center"
  },
  image: {
    height: 750,
    width: 350,
    resizeMode: "contain",
    marginLeft: -32
  },
  imageStyle: {
    height: 750,
    width: 350,
    resizeMode: "contain",
    marginLeft: -16
  },
  btnText: {
    color: colors.white,
    fontSize: 16
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.color_dotBtn
  }
});
const slides = [
  {
    key: "somethumb1",
    image: require("../../assets/onboarding/onboarding-1.png"),
    imageStyle: styles.image
  },
  {
    key: "somethumb2",
    image: require("../../assets/onboarding/onboarding-2.png"),
    imageStyle: styles.image
  },
  {
    key: "somethumb3",
    image: require("../../assets/onboarding/onboarding-3.png"),
    imageStyle: styles.image
  },
  {
    key: "somethumb4",
    image: require("../../assets/onboarding/onboarding-4.png"),
    imageStyle: styles.image
  },
  {
    key: "somethumb5",
    image: require("../../assets/onboarding/onboarding-5.png"),
    imageStyle: styles.image
  },
  {
    key: "somethumb6",
    image: require("../../assets/onboarding/onboarding-6.png"),
    imageStyle: styles.image
  }
  // {
  //     key: 'somethumb5',
  //     image: require("../../assets/onboarding/onboarding-7.png"),
  //     imageStyle: styles.image,
  // },
  // {
  //     key: 'somethumb6',
  //     image: require("../../assets/onboarding/onboarding-8.png"),
  //     imageStyle: styles.image,
  // }
];
