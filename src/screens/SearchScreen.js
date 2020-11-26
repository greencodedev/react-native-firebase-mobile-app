import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import * as R from "ramda";
// import { MapView } from "expo";
import MapView from 'react-native-maps';
import moment from "moment";
import translate from "@utils/translate";

const { Marker } = MapView;
import Constants from 'expo-constants';
import * as colors from "@constants/colors";
import { SearchInput } from "@components";
import { searchEvents } from "@logics/data-logic";
import EventDistanceTypeFilterView from "@components/EventDistanceTypeFilterView";

const SearchToolbar = props => {
  const main = <SearchInput onChangeText={props.onChangeText} />;
  return <Toolbar main={main} />;
};
class EventTabs extends Component {
  // Why we do this way? check this: https://stackoverflow.com/questions/41233458/react-child-component-not-updating-after-parent-state-change
  state = {
    activeIndex: 0,
    events: []
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ activeIndex: nextProps.activeIndex });
  }

  UNSAFE_componentWillMount() {
    this.promises = [];
  }

  render() {
    const { activeIndex } = this.state;
    const { tabsArray } = this.props;
    const array = R.sortBy(R.prop("id"), tabsArray);
    const firstId = R.head(array).id;
    const lastId = R.last(array).id;
    const Tabs = tabsArray.map(tab => {
      const isActive = tab.id === activeIndex;
      const isFirst = tab.id === firstId;
      const isLast = tab.id === lastId;
      const styles = StyleSheet.create({
        tab: {
          backgroundColor: isActive ? colors.primary : "white",
          padding: 10,
          flex: 1
        },
        tabText: {
          textAlign: "center",
          color: isActive ? "white" : colors.primary
        }
      });
      return (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => this.props.onPress(tab.id)}
        >
          <Text style={styles.tabText}>{tab.title}</Text>
        </TouchableOpacity>
      );
    });
    return <View style={styles.tabs}>{Tabs}</View>;
  }
}

export default class SearchScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: translate("header-search")
  });
  state = {
    dimensions: undefined,
    text: "",
    events: [],
    slider: {
      value: 10,
      minimumValue: 1,
      maximumValue: 100,
      step: 1
    },
    tabs: {
      activeIndex: 0
    },
    selectedFilter: 0,
    map: {
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    }
  };

  tabsArray = [
    { id: 0, title: "Solo" },
    { id: 1, title: "Club" },
    { id: 2, title: "Races" },
    { id: 3, title: "All" }
  ];

  filters = [
    {
      key: "all",
      label: "All",
      function: e => {
        console.log("distance", R.pathOr(0, "distance", e));
        return true;
      }
    },
    {
      key: "5",
      label: "5K",
      function: e => {
        return R.pathOr(0, ["distance"], e) === 5000;
      }
    },
    {
      key: "10",
      label: "10K",
      function: e => {
        return R.pathOr(0, ["distance"], e) === 10000;
      }
    },
    {
      key: "ultra",
      label: "Ultra",
      function: e => {
        return R.pathOr(0, ["distance"], e) === 5000;
      }
    }
  ];
  render() {
    const allEvents = this.state.events;
    const { region } = this.state.map;
    const filter = this.filters[this.state.selectedFilter].function;
    const events = R.pickBy(filter, allEvents);
    const displayedEvents = R.pickBy(({ location }, key) => {
      const isInLatBound = R.and(
        location.latitude >= region.latitude - region.latitudeDelta,
        location.latitude <= region.latitude + region.latitudeDelta
      );
      const isInLngBound = R.and(
        location.longitude >= region.longitude - region.longitudeDelta,
        location.longitude <= region.longitude + region.longitudeDelta
      );
      return R.and(isInLatBound, isInLngBound);
    }, events);
    const numOfRaces = Object.keys(displayedEvents).length;
    return (
      <View style={styles.container}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          onPress={e => console.log(e.nativeEvent.coordinate)}
          zoomEnabled={true}
          onRegionChangeComplete={this.handleRegionChange.bind(this)}
        >
          {Object.keys(events).map((key, index) => (
            <Marker
              key={index}
              coordinate={events[key].location}
              onPress={() => this.handleMarkerPress(key, events[key])}
            />
          ))}
        </MapView>
        <View style={styles.filterViewContainer}>
          <EventDistanceTypeFilterView
            onPress={this.handleFilterPress.bind(this)}
            selected={this.state.selectedFilter}
            filters={this.filters}
          />
        </View>

        <View
          style={{
            marginTop: 10,
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}
        >
          {this.state.loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ width: "100%", textAlign: "center" }}>
              {numOfRaces} races found!
            </Text>
          )}
        </View>
      </View>
    );
  }
  onLayout = event => {
    if (this.state.dimensions) return; // layout was already called
    let { width, height } = event.nativeEvent.layout;
    this.setState({ dimensions: { width, height } });
  };
  handleMarkerPress(key, event) {
    console.log("user pressed", event.name);
    Alert.alert(
      event.name,
      `${moment(event.datetime.toDate()).format(
        "dddd, MMMM Do YYYY, h:mm:ss a"
      )}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ],
      { cancelable: false }
    );
  }
  handleFilterPress(item, index) {
    this.setState({ selectedFilter: index });
  }
  handleChangeTab(id) {
    console.log({
      tab: { ...this.state.tabs, activeIndex: id }
    });
    this.setState({ tabs: { ...this.state.tabs, activeIndex: id } });
  }
  handleSliderChange(value) {
    this.setState({ slider: { ...this.state.slider, value: value } });
  }

  handleRegionChange(region) {
    this.setState({ map: { region }, loading: true }, () => {
      searchEvents(region).then(events =>
        this.setState({
          events: R.merge(this.state.events, events),
          loading: false
        })
      );
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight
  },
  toolbarContainer: {
    backgroundColor: colors.primary
  },
  tabs: {
    flexDirection: "row",
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderColor: colors.primary,
    borderWidth: 1
  },
  sliderContainer: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    opacity: 0.4,
    paddingTop: Constants.statusBarHeight, //10
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5
  },
  slider: {
    flex: 1
  },
  sliderText: {
    color: "#005872"
  },
  mapContainer: {
    flex: 1
  },
  filterViewContainer: {
    backgroundColor: "#FFFFFF"
  }
});
