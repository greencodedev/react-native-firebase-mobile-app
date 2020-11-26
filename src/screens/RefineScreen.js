import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Button,
  Platform,
  Alert
} from "react-native";
import axios from "axios";
import moment from "moment";
import * as R from "ramda";
import update from "immutability-helper";
import Constants from 'expo-constants';

import translate from "@utils/translate";
import { getUser } from "../logics/auth";
import { saveUserAchievements, fetchAchievements } from "../logics/data-logic";
import { createCancelablePromise } from "@utils";
import { withLoading } from "../HOC";
import * as colors from "../constants/colors";
import { userStore } from "../stores";
import { SinglePickerMaterialDialog } from "react-native-material-dialog";

const List = withLoading(FlatList)("data");

axios.interceptors.request.use(
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

export default class RefineScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerTitle: translate("header-refine"),
      headerTintColor: "#fff",
      headerRight:
        R.hasPath(["state", "params"], navigation) &&
        R.pathOr(false, ["state", "params", "getState"], navigation) ? (
          <Button
            color={Platform.select({ ios: "#FFFFFF", android: colors.primary })}
            onPress={() => {
              Alert.alert(
                translate("refine-alert-title"),
                translate("refine-alert-body"),
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      const { changeState } = navigation.state.params;
                      let detailAchievement;
                      let allAchievement;
                      changeState({ loading: true });
                      const {
                        racerId,
                        achievements
                      } = navigation.state.params.getState();
                      const user = getUser();
                      const {
                        firstName: first,
                        lastName: last,
                        birthday: birthdayDate
                      } = user;
                      const year = moment(birthdayDate).year();
                      const month = moment(birthdayDate).month() + 1;
                      const day = moment(birthdayDate).date();
                      const detailLoad = {
                        unclaimRaces: achievements,
                        dobY: year,
                        dobM: month,
                        dobD: day
                      };
                      const byIdLoad = { racerId: racerId };
                      return (
                        axios
                          .post(
                            "https://us-central1-sportify-188108.cloudfunctions.net/unclaimDetail",
                            detailLoad
                          )
                          .then(response => {
                            const targetAchievements = R.filter(
                              a => a.confirm === true,
                              achievements
                            ).map(a => a.EntryId);
                            return (
                              response.data
                                .map(a => ({
                                  ...a,
                                  confirm: R.contains(
                                    a.EntryId,
                                    targetAchievements
                                  )
                                }))
                            );
                          })
                          .then(response => {
                            detailAchievement = response; //this variable will be reused in other functions.
                            return response;
                          })

                          .then(
                            () =>
                              racerId == -1000
                                ? { data: [] }
                                : axios.post(
                                    "https://us-central1-sportify-188108.cloudfunctions.net/claimByID",
                                    byIdLoad
                                  )
                          )
                          .then(claim => {
                            claimAchieve = claim.data;
                            claimAchieve.map(a => {
                              a.confirm = true;
                            });
                            allAchievement = detailAchievement.concat(
                              claimAchieve
                            );
                            return allAchievement;
                          })

                          .then(res => saveUserAchievements(res))
                          .then(() => fetchAchievements(user.uid)) // return a firebase object
                          .then(achievements => {
                            userStore.setAchievements(user.uid, achievements);
                          })

                          .then(() => {
                            R.hasPath(
                              ["state", "params", "nextRoute"],
                              navigation
                            )
                              ? navigation.navigate(
                                  navigation.state.params.nextRoute
                                )
                              : navigation.goBack();
                          })

                          .then(() =>
                            axios.post(
                              "https://us-central1-sportify-188108.cloudfunctions.net/fetchGeo",
                              allAchievement
                            )
                          )
                          .then(response => {
                            return response.data;
                          })
                          .then(result => {
                            result.map(a => {
                              a["location"] = {};
                              a.location.latitude = a.latitude;
                              a.location.longitude = a.longitude;
                              a.confirm = true;
                            });
                            return result;
                          })

                          .then(res => saveUserAchievements(res))
                          .then(() => fetchAchievements(user.uid)) // return a firebase object
                          .then(achievements => {
                            userStore.setAchievements(user.uid, achievements);
                          })

                          .catch(err => {
                            changeState({ loading: false });
                            console.error(
                              `Error received from axios.post: ${JSON.stringify(
                                err
                              )}`
                            );
                          })
                      );
                    }
                  }
                ],
                { cancelable: false }
              );
            }}
            title={translate("submit")}
          />
        ) : null
    };
  };
  state = {
    loaded: false,
    loading: false,
    achievements: [],
    singlePickerVisible: false,
    claimedProfiles: [],
    racerId: null
  };

  componentDidMount() {
    const user = getUser();
    const { firstName: first, lastName: last, birthday: birthdayDate } = user;
    const year = moment(birthdayDate).year();
    const month = moment(birthdayDate).month();
    const day = moment(birthdayDate).date();
    const unclaimLoad = {
      first: first,
      last: last,
      raceLoc: "",
      raceStart: "",
      raceEnd: ""
    };
    this.task = createCancelablePromise(
      new Promise((resolve, reject) => {
        return (
          axios
            .post(
              "https://us-central1-sportify-188108.cloudfunctions.net/unclaim",
              unclaimLoad
            )
            .then(function(response) {
              resolve(response.data);
            })
            .catch(function(error) {
              reject(error);
            })
            .then(function() {
              // always executed
            })
        );
      })
    );
    this.setState({ loading: true, loaded: false });
    this.task.promise
      .then(achievements => {
        if (achievements.length === 0) {
          return saveUserAchievements([])
            .then(() => fetchAchievements(user.uid))
            .then(achievements =>
              userStore.setAchievements(user.uid, achievements)
            )
            .then(() => this.props.navigation.navigate("App"))
            .catch(e => console.log(e.message));
        }
        this.setState({
          loading: false,
          loaded: true,
          achievements: achievements.map(item => ({ ...item, confirm: true }))
        });
        this.props.navigation.setParams({
          getState: () => this.state,
          changeState: this.setState.bind(this)
        });
      })
      .catch(err => {
        if (!err.isCancel)
          this.setState({
            loaded: false,
            loading: false
          });
      });
    const claimLoad = {
      first: first,
      last: last,
      userLoc: "",
      userAgeFrom: "",
      userAgeTo: ""
    };
    this.claimed = createCancelablePromise(
      new Promise((resolve, reject) => {
        return (
          axios
            .post(
              "https://us-central1-sportify-188108.cloudfunctions.net/claimed",
              claimLoad
            )
            .then(function(response) {
              resolve(response.data);
            })
            .catch(function(error) {
              reject(error);
            })
            .then(function() {
              // always executed
            })
        );
      })
    );
    this.claimed.promise
      .then(claimedProfiles => {
        if (claimedProfiles.length == 0) {
          // no claim result
          this.setState(state => ({
            ...this.state,
            racerId: -1000
          }));
        } else if (claimedProfiles[0].multiUser === "true") {
          //multi user claim found
          this.setState(
            state => ({
              ...this.state,
              singlePickerVisible: true,
              claimedProfiles: claimedProfiles
            })
          );
        } else {
          // only one profile found
          this.setState(state => ({
            ...this.state,
            racerId: claimedProfiles[0].racerId
          }));
        }
      })
      .catch(err => {
        if (!err.isCancel) console.log("inside Error ");
      });
  }

  componentWillUnmount() {
    this.task.cancel();
  }

  componentWillUnmount() {
    this.claimed.cancel();
  }

  renderEmptyData = () => {
    return (
      <View style={{ padding: 10, alignItems: "center" }}>
        <Text>{translate("no-achievements")}</Text>
      </View>
    );
  };
  renderItem = ({ item, index }) => {
    let handleValueChange = value => {
      this.setState({
        achievements: update(this.state.achievements, {
          [index]: { confirm: { $set: value } }
        })
      });
    };
    const { Country, StartDateTime, Time } = item;
    const date = moment(StartDateTime);
    const displayDate = date.format("MMMM Do YYYY, h:mm a");
    return (
      <View style={styles.itemContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.itemName}>{item.Name}</Text>
          <Switch value={item.confirm} onValueChange={handleValueChange} />
        </View>
        <Text style={{ marginTop: 10 }}>{displayDate}</Text>
        <Text style={{ marginTop: 10 }}>
          {translate("finishing-time")}: {Time}
        </Text>
      </View>
    );
  };
  render() {
    return (
      <View>
        <View style={styles.subtitle}>
          <Text>{translate("header-refine-subtitle")}</Text>
        </View>
        <View style={styles.container}>
          <SinglePickerMaterialDialog
            title={translate("multi-profile-pick")}
            items={this.state.claimedProfiles
              .map((profile, index) => ({
                value: index,
                label: `${profile.name}\n(${profile.age} year old from ${
                  profile.city
                }, ${profile.state}, ${profile.country})`
              }))
              .concat({
                value: this.state.claimedProfiles.length,
                label: "None"
              })}
            visible={this.state.singlePickerVisible}
            onCancel={() =>
              this.setState({ ...this.state, singlePickerVisible: false })
            }
            onOk={result => {
              if (result && result.selectedItem) {
                id =
                  result.selectedItem.value == this.state.claimedProfiles.length
                    ? -1000
                    : this.state.claimedProfiles[result.selectedItem.value]
                        .racerId; // racerId = -1000 when None is selected
                this.setState({
                  ...this.state,
                  singlePickerVisible: false,
                  racerId: id
                });
              }
            }}
          />
        </View>
        <List
          extraData={this.state.achievements}
          renderEmptyData={this.renderEmptyData}
          loading={this.state.loading}
          data={this.state.achievements}
          renderItem={this.renderItem}
          keyExtractor={item => "" + item.EntryId}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.primary
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  itemName: {
    fontSize: 16,
    flex: 1,
    textAlignVertical: "center"
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center"
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1"
  }
});
