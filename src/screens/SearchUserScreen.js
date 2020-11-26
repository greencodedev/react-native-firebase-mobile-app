import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  FlatList,
  ScrollView,
  TextInput,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as R from "ramda";
import * as colors from "@constants/colors";
import Constants from "expo-constants";
import { SearchInput } from "@components";
import { withLoading } from "../HOC";
import { searchForUsers, fetchEvents, fetchGroupRun } from "../logics/data-logic";
import { getUser } from "../logics/auth";
import { Container, Tab, Tabs } from 'native-base';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import BottomSheet from 'reanimated-bottom-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import MapView, { PROVIDER_GOOGLE} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Modal, { ModalContent, ModalButton, ModalFooter } from 'react-native-modals';
import CalendarPicker from 'react-native-calendar-picker';
import StepIndicator from 'react-native-step-indicator';
import {NavigationEvents} from 'react-navigation';
import * as firebase from "firebase";

const List = withLoading(FlatList)();
const customStyles = {
  stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 3,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: colors.mainPurple,
    separatorFinishedColor: colors.mainPurple,
    separatorUnFinishedColor: colors.lightPurple,
    stepIndicatorFinishedColor: colors.mainPurple,
    stepIndicatorUnFinishedColor: colors.lightPurple,
    stepIndicatorCurrentColor: colors.white,
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: colors.mainPurple,
    stepIndicatorLabelFinishedColor: colors.white,
    stepIndicatorLabelUnFinishedColor: colors.lightPurple,
    labelColor: '#666666',
    labelSize: 12,
    currentStepLabelColor: '#4aae4f'
}

export default class SearchUserScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      loading: false,
      users: [],
      displayedUsers: [],
      values: [1, 10],
      months: [1, 12],
      location: '',
      locations: [],
      selectedStartDate: null,
      selectedEndDate: null,
      events: [],
      isModalVisible: false,
      temp_events: [],
      eventNameForSearch:"",
      displayedEvents: [],
      find_events: [],
      selected_road: true,
      selected_trail: true,
      dates_start: '',
      dates_end: '',
      converted_address: '',
      opening_list: false,
      opening_map: false,
      opening_runMap: false,
      currentStep: 0,
      f_selectedStartDate: null,
      f_selectedEndDate: null,
      f_location: '',
      f_locations: [],
      show_locations: false,
      f_distance: [],
      aryDistance: [
        {
          id: 5000,
          value: '5K',
          selected: false
        },
        {
          id: 10000,
          value: '10K',
          selected: false
        },
        {
          id: 21000,
          value: 'HM',
          selected: false
        },
        {
          id: 42000,
          value: 'M',
          selected: false
        },
        {
          id: 50000,
          value: '50K',
          selected: false
        },
        {
          id: 80000,
          value: '50M',
          selected: false
        },
        {
          id: 100000,
          value: '100K',
          selected: false
        },
        {
          id: 160000,
          value: '100M',
          selected: false
        },
      ],
      longitude: 0,
      latitude: 0,
      predictions: [],
      temp_predictions: [],
      tabIndex: 0,
      selectedDayColor: '#7b6fcf',
      selectedDayTextColor: '#ffffff',
      openKeyboard: false,
      runs: [],
      displayedRuns: []
    };
    this.onDateChange = this.onDateChange.bind(this);
    this.onStepChange = this.onStepChange.bind(this);
    this.onDateChangeOnFind = this.onDateChangeOnFind.bind(this);
    this.toggleItems = this.toggleItems.bind(this);
    this.handleLocation = this.handleLocation.bind(this);
    this.handleDeleteLocation = this.handleDeleteLocation.bind(this);
    this.clearLocations = this.clearLocations.bind(this);
    this.handlePressTab = this.handlePressTab.bind(this);
    this.handlePressEvent = this.handlePressEvent.bind(this);
    this.handlePressUserEvent = this.handlePressUserEvent.bind(this);
  }

  displayModifiedDate(date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    startDay = new Date(date).getDate();
    startMonth = monthNames[new Date(date).getMonth()];
    startYear = new Date(date).getFullYear();
    start = startDay + " " + startMonth + " " + startYear;
    return start;
  }

  onDateChange(date, type) {

    let startDay, startMonth, startYear, start, endDay, endMonth, endYear, end;
    if (type === 'START_DATE') {
      this.setState({
        selectedStartDate: date,
        dates_start: this.displayModifiedDate(date),
        selectedEndDate: null
      });
    } else if(type === 'END_DATE') {
      this.setState({
        selectedEndDate: date,
        dates_end: this.displayModifiedDate(date)
      });
    }
  }

  onDateChangeOnFind(date, type) {
    console.log('type->', type);
    console.log('date->', date);
    if(type === 'START_DATE') {
      this.setState({
        f_selectedStartDate: date,
        f_selectedEndDate: null
      })
    }else if(type='END_DATE') {
      this.setState({
        f_selectedEndDate: date
      })
    }
  }

  async onChangeLocation(text) {
    if(this.state.currentStep == 1) {
      this.setState({f_location: text, show_locations: true});
    }
    this.setState({location: text, show_locations: true});
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCMOlzsK0_sscqyeqq2KBS9bKosOvKW130&input=${text}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({predictions: json.predictions});
    } catch(err) {
      console.error(err);
    }
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible });
  };

  convertRealDateTime = (timeStamp) => {
    var theDate = new Date(timeStamp * 1000);
    let dateString = '';
    dateString = theDate.toGMTString();
    return dateString;
  }

  convertDiatanceToString = (index) => {
    let str = '';
    let bgColor = '';
    let color = ''
    if(index < 3000) {
      str = 'Less 3K';
      bgColor = colors.K3;
      color = colors.black;
    }else if(index > 1000000) {
      str = 'More 100M';
      bgColor = colors.M100;
      color = colors.white;
    }
    switch(index) {
      case 5000:
        str = '5K';
        bgColor = colors.K5;
        color = colors.black;
        break;
      case 10000:
        str = '10K';
        bgColor = colors.K10;
        color = colors.black;
        break;
      case 21000:
        str = 'HM';
        bgColor = colors.HM;
        color = colors.black;
        break;
      case 42000:
        str = 'M';
        bgColor = colors.M;
        color = colors.white;
        break;
      case 50000:
        str = '50K';
        bgColor = colors.K50;
        color = colors.white;
        break;
      case 500000:
        str = '50M';
        bgColor = colors.M50;
        color = colors.white;
        break;
      case 100000:
        str = '100K';
        bgColor = colors.K100;
        color = colors.white;
        break;
      case 1000000:
        str = '100M';
        bgColor = colors.M100;
        color = colors.white;
        break;
      default:
        str = index/1000 + 'K';
        bgColor = colors.cerise;
        color = colors.black;
        break;
    }
    return {
      str: str,
      backgroundColor: bgColor,
      color: color
    }
  }
  filterByConditions = (values, selectedStartDate, selectedEndDate, locations, type) => {
    console.log("--------------filter condition---------------------");
    // const temp_locations = [];
    // console.log("distance value=>", values);
    
    // const {selectedStartDate, selectedEndDate, values, location} = this.state;

    let res = [];
    if(this.state.tabIndex == 3) {
      res = this.state.runs;
      res = res.filter(function(o) {
        return o.type == type
      })
    }else {
      res = this.state.events;
    }

    console.log("type condition", res.length);
    let start, end;
    if(selectedStartDate){
      start = new Date(selectedStartDate).getTime()/1000;
    }
    if(selectedEndDate) {
      end = new Date(selectedEndDate).getTime()/1000;
    }

    if(selectedStartDate && selectedEndDate) {
      res = res.filter(function(o) {
        return o.datetime.seconds >= start && o.datetime.seconds <=end
      })
    }
    console.log("date condition", res.length);

    const convertIndexToDistance = (index) => {
      let distance = 0;
      switch(index) {
        case 1:
          distance = 0;
          break;
        case 2:
          distance = 5000;
          break;
        case 3:
          distance = 10000;
          break;
        case 4:
          distance = 21000;
          break;
        case 5:
          distance = 42000;
          break;
        case 6:
          distance = 50000;
          break;
        case 7:
          distance = 80000;
          break;
        case 8:
          distance = 100000;
          break;
        case 9:
          distance = 160000;
          break;
        case 10:
          distance = 999999;
          break;
      }
      return distance;
    }
        
    if(values) {
      res = res.filter(function(o) {
        // console.log("val0->", values[0]);
        // console.log("o value->", o.distance);
        // console.log("val1->", values[1])
        if(values[0] == 1 && values[1] == 1) {
          return o.distance < 5000
        }else if (values[0] == 10 && values[1] == 10) {
          return o.distance > 160000
        }
        return o.distance <= convertIndexToDistance(values[1]) && o.distance >= convertIndexToDistance(values[0])
      })
      console.log("distance condition", res.length);
    }
    console.log("last res=>", res.length); 
    if(this.state.tabIndex == 3) {
      this.setState({displayedRuns: res})
    }
    this.setState({temp_events: res, 
      displayedEvents: this.filterQueriedUser(this.state.eventNameForSearch, res)});

    if(locations) {
      console.log("location=>", locations);

      var temp = [];
      var geoLocation;
      for(var i=0; i<locations.length; i++) {
        Geocoder.from(locations[i])
        .then(json => {
          let locationRange = json.results[0].geometry.viewport;
          for(var j=0; j<res.length; j++) {
            if(this.state.tabIndex == 3) {
              if(locationRange.southwest.lat <=  res[j].location.latitude && 
                res[j].location.latitude <= locationRange.northeast.lat && 
                locationRange.southwest.lng <= res[j].location.longitude &&
                res[j].location.longitude <= locationRange.northeast.lng) {
              temp.push(res[j]);
              }
            }else {
              if(locationRange.southwest.lat <=  res[j].location.F && 
                res[j].location.F <= locationRange.northeast.lat && 
                locationRange.southwest.lng <= res[j].location.V &&
                res[j].location.V <= locationRange.northeast.lng) {
              temp.push(res[j]);
              }
            }
            console.log("111->", temp.length);
          }
          console.log("222->",temp.length);
          if(this.state.tabIndex == 3) {
            this.setState({displayedRuns: temp});
          }
          this.setState({temp_events: temp, displayedEvents: this.filterQueriedUser(this.state.eventNameForSearch, temp)});
        });
      }
    }
    
  }

  filterByDistance = (values) => {
    console.log("value=>", values);
    const {selected_road, selected_trail} = this.state;
    this.setState({
        values,
    });
    let type = '';
    if(selected_road) {
      type = selected_trail?'both':'road';
    }else{
      type = selected_trail?'trail':'';
    }
    this.filterByConditions(values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, type);
  }

  sliderByMonth = (values) => {
    console.log("month values => ", values);
    this.setState({
      months: values
    })
  }

  filterByDateRange = () => {
    const {selected_road, selected_trail} = this.state;
    this.setState({isModalVisible: false});
    let type = '';
    if(selected_road) {
      type = selected_trail?'both':'road';
    }else{
      type = selected_trail?'trail':'';
    }
    this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, type);
  }

  filterByLocation = () => {
    const {selected_road, selected_trail} = this.state;
    let type = '';
    if(selected_road) {
      type = selected_trail?'both':'road';
    }else{
      type = selected_trail?'trail':'';
    }
    this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, type);
  }


  setDates = dates => {
    this.setState({
      ...dates
    });
  };

  handlePressRoad = () => {
    let temp = this.state.selected_road;
    temp = !temp;
    this.setState({selected_road: temp});
    if(temp) {
      this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, this.state.selected_trail?'both':'road');
    }else{
      this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, this.state.selected_trail?'trail':'');
    }
  };

  handlePressTrail = () => {
    let temp = this.state.selected_trail;
    temp = !temp;
    this.setState({selected_trail: temp});
    if(temp) {
      this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, this.state.selected_road?'both':'trail');
    }else {
      this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, this.state.temp_predictions, this.state.selected_road?'road':'');
    }
  }

  toggleBottomSheet = () => {
    console.log("press cancel");
    this.bs.current.snapTo(0);
  }

  findEvents = () => {
    const {f_distance, f_locations, f_selectedStartDate, f_selectedEndDate} = this.state;
    let res = this.state.events;
    console.log("init->", res.length);
    let start, end;
    if(f_selectedStartDate) {
      start = new Date(f_selectedStartDate).getTime()/1000;
    }
    if(f_selectedEndDate) {
      end = new Date(f_selectedEndDate).getTime()/1000;
    }

    res = res.filter(function(o) {
      return o.datetime.seconds >= start && o.datetime.seconds <= end
    })

    console.log("date condition->", res.length);
    let temp = [];
    if(res) {
      for(var i=0; i<f_distance.length; i++) {
        for(var j=0; j<res.length; j++) {
          if(f_distance[i].id == res[j].distance) {
            temp.push(res[j]);
          }
        }
      }
    }
    res = temp;
    this.setState({
      find_events: res
    })
    console.log("distance condition->", res.length);
    // console.log("locations->", f_locations);
    if(res) {
      var temp_location = [];
      var geoLocation;
      for(var i=0; i<f_locations.length; i++) {
        Geocoder.from(f_locations[i])
        .then(json => {
          locationRange = json.results[0].geometry.viewport;
          console.log("locationRange->", locationRange);
          for(var j=0; j<res.length; j++) {
            console.log("res->", res[j].location)
            if(locationRange.southwest.lat <=  res[j].location._lat && 
              res[j].location._lat <= locationRange.northeast.lat && 
              locationRange.southwest.lng <= res[j].location._long &&
              res[j].location._long <= locationRange.northeast.lng) {
              temp_location.push(res[j]);
              console.log("aaa->", temp_location.length);
            }
            console.log("bbb->", temp_location.length);
          }
          // res = res.concat(temp_location);
          
          console.log("ccc->", temp_location.length);
          this.setState({find_events: temp_location});
        })
      }
    }
    console.log("location condition2->", res.length);

  }

  onStepChange = (index) => {
    console.log("current index->",  index);
    if(index == 3) {
      this.findEvents();
    }
    this.setState({
      currentStep: index
    });
  }

  clearLocation() {
    this.setState({
      location: '',
      show_locations: false
    })
  }

  clearDate() {
    this.setState({
      dates_start: '',
      dates_end: '',
      selectedStartDate: null,
      selectedEndDate: null
    })
  }

  onResetCurrentStep() {
    const {f_distance, f_location, f_selectedEndDate, f_selectedStartDate, currentStep} = this.state;
    if(currentStep == 0) {
      this.setState({
        f_selectedStartDate: null, 
        f_selectedEndDate: null,
      })
    }else if(currentStep == 2) {
      if(f_distance.length>0){
        let empty = [];
        for(var i=0; i<f_distance.length; i++) {
          if(f_distance[i].selected) {
            f_distance[i].selected = false;
          }
        }
        this.setState({f_distance: empty})
      }
    }else if(currentStep == 1) {
      let empty=[];
      this.setState({f_location: '', f_locations: empty, temp_predictions: empty})
    }
  }

  toggleItems(item, index){
    let result = [];
    const {aryDistance} = this.state;
    aryDistance[index].selected = !aryDistance[index].selected;
    for(var i=0; i< aryDistance.length; i++) {
      if(aryDistance[i].selected) {
        result.push(aryDistance[i])
      }
    }
    this.setState({
      f_distance: result
    })
  }


  handlePressEvent(item) {
    if(item)
      this.props.navigation.navigate('Event', {item: item})
  }

  handlePressUserEvent(item) {
    console.log("handle press user event")
    if(item)
      this.props.navigation.navigate('UserEvent', {item: item, route: 'filter'})
  }

  handleLocation(prediction) {
    const {temp_predictions, selected_road, selected_trail} = this.state;
    if(temp_predictions.indexOf(prediction) === -1) {
      temp_predictions.push(prediction);
    }
    if(this.state.currentStep == 1 && this.state.tabIndex == 4) {
      this.setState({
        f_location: prediction,
        show_locations: false,
        f_locations: temp_predictions
      });
    }else if(this.state.tabIndex == 1 || this.state.tabIndex == 2 || this.state.tabIndex == 3){
      this.setState({
        location: prediction,
        show_locations: false,
        locations: temp_predictions
      });
      let type = '';
      if(selected_road) {
        type = selected_trail?'both':'road';
      }else{
        type = selected_trail?'trail':'';
      }
      this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, temp_predictions, type);
    }
  }

  handleDeleteLocation(item) {
    const {temp_predictions} = this.state;
    const index = temp_predictions.indexOf(item);
    if(index > -1) {
      temp_predictions.splice(index, 1);
    }
    this.setState({f_locations: temp_predictions})
  }

  clearLocations(item) {
    const {temp_predictions, selected_road, selected_trail} = this.state;
    const index = temp_predictions.indexOf(item);
    if(index > -1) {
      temp_predictions.splice(index, 1);
    }
    this.setState({locations: temp_predictions});
    let type = '';
    if(selected_road) {
      type = selected_trail?'both':'road';
    }else{
      type = selected_trail?'trail':'';
    }
    this.filterByConditions(this.state.values, this.state.selectedStartDate, this.state.selectedEndDate, temp_predictions, type);
  }

  handlePressTab(i) {
    this.setState({tabIndex: i});
    this.handlePressReset();
  }

  handlePressReset = () => {
    const {events, runs} = this.state;
    this.setState({
      selectedStartDate: null,
      selectedEndDate: null,
      values: [1, 10],
      location: '',
      
      dates_start: '',
      dates_end: '',
      temp_events: events,
      displayedEvents: events,
      displayedRuns: runs,
      locations: []
    })
  }

  renderHeader = () => {
    const {dates_start, dates_end, opening_list, opening_map, opening_runMap, tabIndex, location, locations} = this.state;
    const dates = dates_start + " - " + dates_end;

    return(
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? "padding" : null}
        enabled={true}  
      >
        <View>
          <View style={styles.headerContainer}>
            {
              (tabIndex == 1 && opening_list) &&
              <View style={styles.headerContent} >
                <TouchableOpacity onPress={this.toggleBottomSheet}>
                  <Text style={styles.resetText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.filterText}>Filter</Text>
                <TouchableOpacity onPress={this.handlePressReset} style={{justifyContent: 'flex-end'}}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            }
            {
              (tabIndex == 2 && opening_map) &&
              <View style={styles.headerContent} >
                <TouchableOpacity onPress={this.toggleBottomSheet}>
                  <Text style={styles.resetText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.filterText}>Filter</Text>
                <TouchableOpacity onPress={this.handlePressReset} style={{justifyContent: 'flex-end'}}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            }
            {
              (tabIndex == 3 && opening_runMap) &&
              <View style={styles.headerContent} >
                <TouchableOpacity onPress={this.toggleBottomSheet}>
                  <Text style={styles.resetText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.filterText}>Filter</Text>
                <TouchableOpacity onPress={this.handlePressReset} style={{justifyContent: 'flex-end'}}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            }
            {
              (tabIndex == 1 && !opening_list) && 
              <View
                style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text>      </Text>
                <Text style={styles.filterText}>Filter</Text>
                <MaterialIcons name="keyboard-arrow-up" color={colors.mainPurple} size={20} />
              </View>
            }
            {
              (tabIndex == 2 && !opening_map) &&
              <View
                style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text>      </Text>
                <Text style={styles.filterText}>Filter</Text>
                <MaterialIcons name="keyboard-arrow-up" color={colors.mainPurple} size={20} />
              </View>
            }
            {
              (tabIndex == 3 && !opening_runMap) &&
              <View
                style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text>      </Text>
                <Text style={styles.filterText}>Filter</Text>
                <MaterialIcons name="keyboard-arrow-up" color={colors.mainPurple} size={20} />
              </View>
            }
          </View>
          <View style={styles.bottomContainer}>
            <View style={[styles.bottomItemWrapper, {marginBottom: 10}]}>
              <View style={[styles.bottomItemContent, {flex: 1}]}>
                <Text style={styles.labelStyle}>Location</Text>
                <View style={[styles.locationInputStyle, {width: '75%', marginBottom: 10}]}>
                  <TextInput 
                    ref={input => this.input = input}
                    style={[styles.locationInput,{width: '95%'}]}
                    placeholder="Type location"
                    value={this.state.location}
                    onChangeText={text=>this.onChangeLocation(text)}
                    onFocus={()=>this.setState({openKeyboard: true})}
                    onBlur={()=>this.setState({openKeyboard: false})}
                  />
                  {
                    (location && locations) ? (
                      <TouchableOpacity onPress={this.clearLocation.bind(this)}>
                        <Ionicons name="ios-close" size={25} color={colors.dusk} style={{justifyContent: 'flex-end', marginRight: 5}} />
                      </TouchableOpacity>
                    ): (
                      <Ionicons name="md-search" size={25} color={colors.dusk} style={{justifyContent: 'flex-end', marginRight: 5}} />
                    )
                  }
                  
                </View>
              </View>
              <ScrollView horizontal>
              {
                locations &&
                  locations.map((item, index)=>
                    <View key={index} style={{backgroundColor: colors.paleGray, 
                      borderRadius: 5, flexDirection: 'row', 
                      alignItems: 'center', 
                      padding: 5, 
                      marginRight: 2, 
                      }}>
                      <Text style={[styles.applyBtn, {fontSize: 9}]}>{item}</Text>
                      <TouchableOpacity style={{marginLeft: 2}} onPress={()=>this.clearLocations(item)}>
                        <Text style={[styles.applyBtn, {fontSize: 9}]}>X</Text>
                      </TouchableOpacity>
                    </View>
                  )
              } 
              </ScrollView>
              {
                this.state.show_locations &&
                <View style={{paddingHorizontal: 20}}>                    
                  {
                    this.state.predictions.map(prediction=>(
                      <TouchableOpacity key={prediction.description} style={styles.locationItemContent} onPress={()=>this.handleLocation(prediction.description)}>
                        <Text key={prediction.id} style={styles.locationItemText}>
                          {prediction.description}
                        </Text>
                    </TouchableOpacity>
                    ))
                  }
                </View>
              }
            </View>
            <View style={styles.bottomItemWrapper}>
              <View style={styles.bottomItemContent}>
                <Text style={styles.labelStyle}>Distance</Text>
                <View style={styles.rangeContainer}>
                  <MultiSlider
                      values={[this.state.values[0], this.state.values[1]]}
                      sliderLength={300}
                      onValuesChange={this.filterByDistance}
                      min={1}
                      max={10}
                      step={1}
                      allowOverlap={true}
                      selectedStyle={{backgroundColor: colors.dusk}}
                      unselectedStyle={{backgroundColor: colors.tab_inactive}}
                      containerStyle={{height: 3, backgroundColor: colors.dusk}}
                      pressedMarkerStyle={{backgroundColor: colors.dusk}}
                      markerStyle={{backgroundColor: colors.dusk}} 
                  />
                  <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%'}}>
                    <Text style={styles.rangeText}>Less</Text>
                    <Text style={styles.rangeText}>5K</Text>
                    <Text style={styles.rangeText}>10K</Text>
                    <Text style={styles.rangeText}>HM</Text>
                    <Text style={styles.rangeText}>M</Text>
                    <Text style={styles.rangeText}>50K</Text>
                    <Text style={styles.rangeText}>50M</Text>
                    <Text style={styles.rangeText}>100K</Text>
                    <Text style={styles.rangeText}>100M</Text>
                    <Text style={styles.rangeText}>More</Text>
                  </View>
                </View>
              </View>
            </View>
            
          {
            tabIndex == 3 && 
            <View style={styles.bottomItemWrapper}>
              <View style={styles.bottomItemContent}>
                <Text style={styles.labelStyle}>Kind</Text>
                <View style={{marginLeft: 30, flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity onPress={this.handlePressRoad} style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[{ paddingRight: 5, color: colors.dusk}, styles.lblToggle]}>Road</Text>
                    <View style={[{backgroundColor: this.state.selected_road ? colors.dusk : colors.white}, styles.option]}>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={this.handlePressTrail} style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}}>
                    <Text style={[{ paddingRight: 5, color: colors.dusk}, styles.lblToggle]}>Trail</Text>
                    <View style={[{backgroundColor: this.state.selected_trail ? colors.dusk : colors.white}, styles.option]}>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          {/* <View style={styles.bottomItemWrapper}>
            <View style={styles.bottomItemContent}>
              <Text style={styles.labelStyle}>Date</Text>
              <View style={[styles.rangeContainer, {width: 240}]}>
                <MultiSlider
                    values={[this.state.months[0], this.state.months[1]]}
                    sliderLength={240}
                    onValuesChange={this.sliderByMonth}
                    min={1}
                    max={12}
                    step={1}
                    selectedStyle={{backgroundColor: colors.mainPurple}}
                    unselectedStyle={{backgroundColor: colors.tab_inactive}}
                    containerStyle={{height: 3, backgroundColor: colors.mainPurple}}
                    pressedMarkerStyle={{backgroundColor: colors.mainPurple}}
                    markerStyle={{backgroundColor: colors.mainPurple}} 
                />
                <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, width: '100%'}}>
                  <Text style={styles.rangeText}>Jan</Text>
                  <Text style={styles.rangeText}>Feb</Text>
                  <Text style={styles.rangeText}>Mar</Text>
                  <Text style={styles.rangeText}>Apr</Text>
                  <Text style={styles.rangeText}>May</Text>
                  <Text style={styles.rangeText}>Jun</Text>
                  <Text style={styles.rangeText}>Jul</Text>
                  <Text style={styles.rangeText}>Agt</Text>
                  <Text style={styles.rangeText}>Sep</Text>
                  <Text style={styles.rangeText}>Oct</Text>
                  <Text style={styles.rangeText}>Nov</Text>
                  <Text style={styles.rangeText}>Dec</Text>
                </View>
              </View>
            </View>
          </View> */}
            <View style={[styles.bottomItemWrapper, {flexDirection: 'row', alignItems: 'center', borderBottomColor: colors.white}]}>
              <View style={styles.bottomItemContent}>
                <Text style={styles.labelStyle}>Date      </Text>
                <TouchableOpacity style={[styles.locationInputStyle,{ width: '75%'}]} onPress={this.toggleModal}>
                    <Text style={styles.locationInput}>
                      {dates_end?dates:''}
                    </Text>
                    <Ionicons name="md-calendar" size={30} color={colors.dusk} />  
                </TouchableOpacity>
              </View>
              {/* <View style={styles.applyBtnContainer}>
                <TouchableOpacity style={styles.applyBtnContent} onPress={this.filterByConditions}>
                  <Text style={styles.applyBtn}>Apply</Text>
                </TouchableOpacity>
              </View> */}
              
              <TouchableOpacity style={{marginLeft: 1}} onPress={this.clearDate.bind(this)}>
                <Ionicons name="ios-close" size={25} color={colors.dusk} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  };

  getState = () => this.state;
  handleChangeEventQuery(query) {
    this.setState({displayedEvents: this.filterQueriedUser(query, this.state.temp_events), eventNameForSearch: query});
  }
  handleChangeQuery(query) {
    this.setState({ displayedUsers: this.filterQueriedUser(query, null), query });
  }
  showLoading() {
    this.setState({ loading: true });
  }
  dismissLoading() {
    this.setState({ loading: false });
  }
  filterQueriedUser = (query, temp_events) => {
    if(temp_events) {
      console.log("res---------------->", temp_events.length);
    }
    let fields = [];
    if(this.state.tabIndex == 0) {
      fields = ["displayName", "firstName", "lastName"];
    }else if(this.state.tabIndex == 1 || this.state.tabIndex == 2 ) {
      fields = ["name"];
    }
    const createValidator = field => item =>
      item[field]
        ? item[field].toLowerCase().indexOf(query.toLowerCase()) != -1
        : false;
    const validators = fields.map(f => createValidator(f));
    const filterFunction = item => {
      let valid = false;
      validators.forEach(vaildator => (valid = valid || vaildator(item)));
      return valid;
    };
    if(this.state.tabIndex == 0) {
      return R.filter(filterFunction, this.state.users);
    }else if(this.state.tabIndex == 1 || this.state.tabIndex == 2) {
      return R.filter(filterFunction, temp_events);
    }
  };



  // async addNewField(array) {
  //   var temp = [];
  //   const convertToAddress = (_lat, _long) => {
  //     var address;
  //     return Geocoder.from(_lat, _long)
  //     .then(json => {
  //       address = json.results[0].address_components[4].long_name + ", " + json.results[0].address_components[5].long_name;
  //       return address;
  //     });  
  //   }


  //   await array.forEach(async function(el) {
  //     await convertToAddress(el.location._lat, el.location._long).then(function(res){
  //       el = {
  //         ...el,
  //         address: res
  //       }
  //     })
  //     temp.push(el);
  //     SearchUserScreen.prototype.setState({
  //       events: temp,
  //       temp_events: temp,
  //     })
  //   });
  // }



  async fetchCustomedEvents() {
    console.log("fetching group runs...");
    let groupRuns = await fetchGroupRun();

    let today = new Date();
    const convertToAddress = (_lat, _long) => {
      var address;
      return Geocoder.from(_lat, _long)
      .then(json => {
        address = json.results[0].address_components[2].long_name + ", " + json.results[0].address_components[3].short_name;
        return address;
      });  
    }
    let temp = await fetchEvents();
    temp.sort(function(a, b) {
      return a.datetime.seconds - b.datetime.seconds;
    });
    temp = temp.filter(function(o) {
      return o.datetime.seconds >= new Date(today).getTime()  / 1000
    })
    this.state.events = this.state.temp_events = this.state.displayedEvents = temp;
    console.log("group runs->", groupRuns);
    this.state.runs = this.state.displayedRuns = groupRuns;
    this.state.displayedRuns.forEach(function(el) {
      if(el.location) {
        convertToAddress(el.location.latitude, el.location.longitude).then(res=> {
          el.address = res
        })
      }
    })
    this.state.displayedEvents.forEach(function(el) {
      if(el.location) {
        convertToAddress(el.location.F, el.location.V).then(res=>{
          el.address = res
        })
      }
    });
    this.setState({loading: false})
  }

  async componentDidMount() {
    Geocoder.init("AIzaSyCMOlzsK0_sscqyeqq2KBS9bKosOvKW130");

    this.showLoading();

    const db = firebase.firestore();
    db.collection("events_user").onSnapshot(async()=>{
      await this.fetchCustomedEvents();
    })

    searchForUsers(getUser().uid)
      .then(users => this.setState({ users }))
      .then(() => {
        this.props.navigation.setParams({
          getState: this.getState,
          setState: this.setState.bind(this),
          onChange: this.handleChangeQuery
        });
        this.setState({ displayedUsers: this.filterQueriedUser("", null) });
        this.dismissLoading();
    });

    // for(var i=0; i<7; i++) {
    //   console.log("&->", this.nextDate(i));
    // }
    
    
    this.setState({
      f_selectedStartDate: this.nextDate(6),
      f_selectedEndDate: this.nextDate(0),
      selectedStartDate: this.nextDate(6),
      selectedEndDate: this.nextDate(0),
      dates_start: this.displayModifiedDate(this.nextDate(6)),
      dates_end: this.displayModifiedDate(this.nextDate(0)),
    })

  }

  async initiateStates() {
    console.log("testtest->");
    this.setState({loading: true});
    await this.fetchCustomedEvents();
  }

  nextDate(dayIndex) {
    var today = new Date();
    today.setDate(today.getDate() + (dayIndex - 1 - today.getDay() + 7) % 7 + 1);
    return today;
  }
  renderItem(row) {
    const { item, index } = row;
    const onPress = () => {
      this.props.navigation.push("Profile", {
        user: item
      });
    };
    const imageSource = item.photoURL
      ? {
          uri: item.photoURL
        }
      : require("@assets/profile-blank.png");
    const { displayName } = item;
    return (
      <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
        <Image source={imageSource} style={styles.userImage} />
        <Text style={styles.userName}>{displayName}</Text>
        <FontAwesome
          name="chevron-right"
          size={14}
          color={colors.dusk}
          style={{ paddingRight: 5 }}
        />
      </TouchableOpacity>
    );
  }
  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginLeft: 29,
          marginRight: 28,
          backgroundColor: colors.whiteThree
        }}
      />
    );
  };

  bs: React.RefObject<BottomSheet> = React.createRef();
  cs: React.RefObject<CalendarPicker> = React.createRef();

  render() {
    const { selectedStartDate, selectedEndDate, f_distance,f_selectedEndDate,f_selectedStartDate,f_location, currentStep, loading } = this.state;
    const minDate = new Date(2000,1,1); 
    const maxDate = new Date(2050, 12, 31);
    // const startDate  =  selectedStartDate ? selectedStartDate.toString() : '';
    // const endDate = selectedEndDate ? selectedEndDate.toString() : '';
    const titles = ["When do you Want to Run?", "Where do you want to Run?", "Choose your Distance", ""];
    const {temp_events, displayedEvents, f_locations, find_events, tabIndex, selectedDayColor, selectedDayTextColor, displayedRuns} = this.state;
    return (
      <View style={styles.container}>
        {
        tabIndex ==  0 &&
          <View style={styles.searchbar}>
            <SearchInput
              style={styles.searchInput}
              placeholder="Type Name"
              onChangeText={this.handleChangeQuery.bind(this)}
            />

            {/* <TouchableOpacity
              style={styles.backBtnStyle}
              onPress={() =>
                this.props.navigation.push("Profile", { user: getUser() })
              }
            >
              <Text style={styles.backTxtStyle}>Cancel</Text>
            </TouchableOpacity> */}
          </View>
        }
        {
          (tabIndex == 1 || tabIndex == 2) &&
          <View style={styles.searchbar}>
            <SearchInput
              style={styles.searchInput}
              placeholder="Type Event Name"
              onChangeText={this.handleChangeEventQuery.bind(this)}
            />
          </View>
        }
        {
          tabIndex == 4 && 
          <View style={styles.searchbar}>
            {
              currentStep != 0 &&
              <TouchableOpacity style={[styles.backBtnStyle, { borderColor: colors.mainPurple}]} onPress={()=>this.setState({currentStep: currentStep-1})}>
                <MaterialIcons name="keyboard-arrow-left" size={30} color={colors.white}/>
              </TouchableOpacity>
            }
          </View>
        }
        <Container>
            <Tabs tabBarUnderlineStyle={styles.tabUnderLine} onChangeTab={({i})=>this.handlePressTab(i)}>
                <Tab heading='PEOPLE' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                  {this.state.loading ? (
                      <ActivityIndicator style={styles.loadingStyle} size="large" color={colors.mainPurple} />
                    ) : (
                      <View>
                        <ScrollView style={{ flexDirection: "column" }}>
                          <List
                            loading={this.state.loading}
                            data={this.state.displayedUsers}
                            keyExtractor={(item, index) => index + ""}
                            renderItem={this.renderItem.bind(this)}
                            ItemSeparatorComponent={this.FlatListItemSeparator}
                          />
                        </ScrollView>
                      </View>
                    )}
                </Tab>
                <Tab heading='EVENTS LIST' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                    <Modal
                      visible={this.state.isModalVisible}
                      rounded={true}
                      footer={
                        <ModalFooter
                          style={{color: colors.mainPurple}}
                        >
                          <ModalButton 
                            text="CANCEL"
                            onPress={()=>{this.setState({isModalVisible: false})}}
                          />
                          <ModalButton 
                            text="OK"
                            onPress={this.filterByDateRange.bind(this)}
                          />
                        </ModalFooter>
                      }
                      onTouchOutside={() => {
                        this.setState({ isModalVisible: false });
                      }}
                    >
                      <ModalContent>
                        <CalendarPicker
                          startFromMonday={true}
                          allowRangeSelection={true}
                          minDate={minDate}
                          maxDate={maxDate}
                          previousTitle="<"
                          nextTitle=">"
                          onDateChange={this.onDateChange}
                          todayBackgroundColor={colors.lightPurple}
                          selectedDayTextColor={colors.white}
                          selectedDayColor={colors.mainPurple}
                          scaleFactor={450}
                          weekdays={['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']}
                          textStyle={{
                            fontFamily: 'PoppinsBold',
                            color: colors.mainPurple
                          }}
                          selectedStartDate={selectedStartDate}
                          selectedEndDate = {selectedEndDate}
                        />
                      </ModalContent>
                    </Modal>
                  { this.state.loading ? (
                    <ActivityIndicator style={styles.loadingStyle} size="large" color={colors.mainPurple} />
                  ) : (
                    
                    <ScrollView style={{marginBottom: 60}}>
                    {
                      (tabIndex == 1 || tabIndex == 2) &&
                      displayedEvents.map((item, index)=> (
                        <TouchableOpacity key={item.id} style={styles.eventsContainer} onPress={()=>this.handlePressEvent(item)}>
                          <View style={styles.nameContainer}>
                            <Text style={styles.eventsName}>{item.name}</Text>
                          </View>
                          <View style={[{backgroundColor: this.convertDiatanceToString(item.distance).backgroundColor}, styles.distanceContainer]}>
                            <View style={styles.distanceContent}>
                              <Text style={[styles.distanceTxt, {color:this.convertDiatanceToString(item.distance).color}]}>
                                {this.convertDiatanceToString(item.distance).str}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.locationContainer}>
                            <Text style={styles.distanceTitle}>
                              {item.address}
                            </Text>
                          </View>
                          <View style={styles.dateContainer}>
                            <View style={{padding: 10}}>
                              <Text style={styles.distanceTitle}>{this.convertRealDateTime(item.datetime.seconds)}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    }
                    </ScrollView>
                    
                  )}
                  <BottomSheet
                      ref={this.bs}
                      snapPoints = {[this.state.openKeyboard?175:60, this.state.openKeyboard?400:285, 60]}
                      enabledInnerScrolling={true}
                      enabledContentTapInteraction={false}
                      renderHeader = {this.renderHeader}
                      initialSnap={0}
                      onOpenStart={()=>{this.setState({opening_list: true})}}
                      onCloseEnd={() => { this.setState({opening_list: false})}}
                  />
                </Tab>
                <Tab heading='EVENTS MAP' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                <Modal
                      visible={this.state.isModalVisible}
                      rounded={true}
                      footer={
                        <ModalFooter
                          style={{color: colors.mainPurple}}
                        >
                          <ModalButton 
                            text="CANCEL"
                            onPress={()=>{this.setState({isModalVisible: false})}}
                          />
                          <ModalButton 
                            text="OK"
                            onPress={this.filterByDateRange.bind(this)}
                          />
                        </ModalFooter>
                      }
                      onTouchOutside={() => {
                        this.setState({ isModalVisible: false });
                      }}
                    >
                      <ModalContent>
                        <CalendarPicker
                          startFromMonday={true}
                          allowRangeSelection={true}
                          minDate={minDate}
                          maxDate={maxDate}
                          previousTitle="<"
                          nextTitle=">"
                          onDateChange={this.onDateChange}
                          todayBackgroundColor={colors.lightPurple}
                          selectedDayTextColor={colors.white}
                          selectedDayColor={colors.mainPurple}
                          scaleFactor={450}
                          weekdays={['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']}
                          textStyle={{
                            fontFamily: 'PoppinsBold',
                            color: colors.mainPurple
                          }}
                          selectedStartDate={selectedStartDate}
                          selectedEndDate = {selectedEndDate}
                        />
                      </ModalContent>
                    </Modal>
                  {
                    (tabIndex == 1 || tabIndex == 2) &&
                    displayedEvents.length > 0 ? (
                      <MapView
                        style={styles.mapStyle}
                        provider={PROVIDER_GOOGLE}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        scrollEnabled={true}
                        showsCompass={true}
                        showsBuildings={true}
                        initialRegion={{
                          latitude: displayedEvents[0].location.F,
                          longitude: displayedEvents[0].location.V,
                          latitudeDelta: 80,
                          longitudeDelta: 80
                        }}
                      > 
                      {
                        (tabIndex == 1 || tabIndex == 2) &&
                        displayedEvents.map((item, index)=>(
                          <MapView.Marker 
                            key={item.id}
                            coordinate={{
                              latitude: item.location.F,
                              longitude: item.location.V
                            }}
                            pinColor={this.convertDiatanceToString(item.distance).backgroundColor}
                          >
                            <MapView.Callout onPress={()=>this.handlePressEvent(item)}>
                              <View style={styles.calloutContainer}>
                                <View style={styles.calloutContent}>
                                  <Text style={styles.calloutTitle}>
                                    {item.name}
                                  </Text>
                                  <Text style={styles.calloutDesc}>
                                    {this.convertRealDateTime(item.datetime.seconds)}
                                  </Text>
                                  <Text style={styles.calloutDesc}>
                                    {item.address}
                                  </Text>  
                                  <TouchableOpacity style={{alignSelf: 'flex-end'}}>
                                    <MaterialIcons name="error-outline" color={colors.white} size={20} />
                                  </TouchableOpacity>
                                </View>
                                <View style={[styles.calloutDistanceContent, {backgroundColor: this.convertDiatanceToString(item.distance).backgroundColor}]}>
                                  <Text style={[styles.calloutDistanceText, {color: this.convertDiatanceToString(item.distance).color}]}>
                                    {this.convertDiatanceToString(item.distance).str}
                                  </Text>
                                </View>
                              </View>
                            </MapView.Callout>
                          </MapView.Marker>
                        ))
                      }   
  
                    </MapView>
                    ) : (
                      <Text>No data</Text>
                    )
                  }
                  <BottomSheet
                    ref={this.bs}
                    snapPoints = {[this.state.openKeyboard?175:60, this.state.openKeyboard?400:285, 60]}
                    enabledInnerScrolling={true}
                    enabledContentTapInteraction={false}
                    renderHeader = {this.renderHeader}
                    initialSnap={0}
                    onOpenStart={()=>{this.setState({opening_map: true})}}
                    onCloseEnd={()=>{this.setState({opening_map: false})}}
                  />
                </Tab>
                <Tab heading='RUNS' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                  <NavigationEvents onDidFocus={this.initiateStates.bind(this)} />
                  <Modal
                    visible={this.state.isModalVisible}
                    rounded={true}
                    footer={
                      <ModalFooter
                        style={{color: colors.mainPurple}}
                      >
                        <ModalButton 
                           text="CANCEL"
                          onPress={()=>{this.setState({isModalVisible: false})}}
                        />
                        <ModalButton 
                          text="OK"
                          onPress={this.filterByDateRange.bind(this)}
                        />
                      </ModalFooter>
                    }
                    onTouchOutside={()=>{
                      this.setState({isModalVisible: false});
                    }}
                  >
                    <ModalContent>
                      <CalendarPicker 
                        startFromMonday={true}
                        allowRangeSelection={true}
                        minDate={minDate}
                        maxDate={maxDate}
                        previousTitle="<"
                        nextTitle=">"
                        onDateChange={this.onDateChange}
                        todayBackgroundColor={colors.inactiveText}
                        selectedDayTextColor={colors.white}
                        selectedDayColor={colors.mainPurple}
                        scaleFactor={450}
                        weekdays={['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']}
                          textStyle={{
                            fontFamily: 'PoppinsBold',
                            color: colors.mainPurple
                          }}
                        selectedStartDate={selectedStartDate}
                        selectedEndDate = {selectedEndDate}
                      />
                    </ModalContent>
                  </Modal>
                  {!loading &&
                    (displayedRuns && displayedRuns.length > 0) ? (
                      <MapView
                        style={styles.mapStyle}
                        provider={PROVIDER_GOOGLE}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        scrollEnabled={true}
                        showsCompass={true}
                        showsBuildings={true}
                        initialRegion={{
                          latitude: displayedRuns[0].location.latitude,
                          longitude: displayedRuns[0].location.longitude,
                          latitudeDelta: 50,
                          longitudeDelta: 50
                        }}
                      >
                      {
                        displayedRuns.map((item, index)=>(
                          <MapView.Marker
                            key={item.id}
                            coordinate={{
                              latitude: item.location.latitude,
                              longitude: item.location.longitude
                            }}
                          >
                            <MapView.Callout
                             onPress={()=>this.handlePressUserEvent(item)}
                            >
                              <View style={styles.calloutContainer}>
                                <View style={styles.calloutContent}>
                                  <Text style={styles.calloutTitle}>
                                    {item.name}
                                  </Text>
                                  <Text style={styles.calloutDesc}>
                                    {item.address}
                                  </Text>
                                  <TouchableOpacity style={{alignSelf: 'flex-end'}}>
                                    <MaterialIcons name="error-outline" color={colors.white} size={20} />
                                  </TouchableOpacity>
                                </View>
                                <View style={[styles.calloutDistanceText, {color: colors.dusk}]}>
                                  <Text style={[styles.calloutDistanceText, {color: colors.dusk}]}>
                                    {item.distance}Km
                                  </Text>
                                </View>
                              </View>
                            </MapView.Callout>
                          </MapView.Marker>
                        ))
                      }
                      </MapView>
                    ) : (
                      <MapView
                        style={styles.mapStyle}
                        provider={PROVIDER_GOOGLE}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        scrollEnabled={true}
                        showsCompass={true}
                        showsBuildings={true}
                        initialRegion={{
                          latitude: 40,
                          longitude: -100,
                          latitudeDelta: 50,
                          longitudeDelta: 50
                        }}
                      >
                      </MapView>
                    )
                  }
                  {loading &&
                    <ActivityIndicator size="small"  />
                  }
                  <BottomSheet 
                    ref={this.bs}
                    snapPoints={[this.state.openKeyboard?225:60, this.state.openKeyboard?450:325, 60]}
                    enabledInnerScrolling={true}
                    enabledContentTapInteraction={false}
                    renderHeader={this.renderHeader}
                    initialSnap={0}
                    onOpenStart={()=>{this.setState({opening_runMap: true})}}
                    onCloseEnd={()=>{this.setState({opening_runMap: false})}}
                  />
                </Tab>
                <Tab heading='FIND' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                  <ScrollView style={styles.findContainer}>
                    <View style={styles.stepContent}>
                      <StepIndicator 
                        stepCount={4}
                        customStyles={customStyles}
                        currentPosition={currentStep}
                        onPress={(stepCount)=>this.onStepChange(stepCount)}
                      />
                    </View>
                    {
                        currentStep == 3 && 
                        <ScrollView style={{marginBottom: 60}}>
                        { (find_events.length == 0) ? (
                          <View style={{marginTop: 30, marginLeft: 30}}>
                            <Text style={styles.locationInput}>
                              No race is found
                            </Text>
                          </View>
                        ) : (
                          find_events.map((item, index)=> (
                            <TouchableOpacity key={item.id} style={styles.eventsContainer} onPress={()=>this.handlePressEvent(item)}>
                              <View style={styles.nameContainer}>
                                <Text style={styles.eventsName}>{item.name}</Text>
                              </View>
                              <View style={[{backgroundColor: this.convertDiatanceToString(item.distance).backgroundColor}, styles.distanceContainer]}>
                                <View style={styles.distanceContent}>
                                  <Text style={[styles.distanceTxt, {color:this.convertDiatanceToString(item.distance).color}]}>
                                    {this.convertDiatanceToString(item.distance).str}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.locationContainer}>
                                <Text style={styles.distanceTitle}>
                                  {item.address}
                                </Text>
                              </View>
                              <View style={styles.dateContainer}>
                                <View style={{padding: 10}}>
                                  <Text style={styles.distanceTitle}>{this.convertRealDateTime(item.datetime.seconds)}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))
                        )
                        }
                        </ScrollView>
                      }
                      {
                        (currentStep == 0 || currentStep == 1 || currentStep == 2) &&
                        <View style={styles.titleContent}>
                          <Text style={styles.title}>
                            {titles[currentStep]}
                          </Text>
                        </View>
                      }
                    {
                      (currentStep == 0 || currentStep == 1 || currentStep == 2 ) &&
                    
                    <View style={styles.findMainContainer}>
                      {
                        (currentStep == 0 || currentStep == 1 || currentStep == 2 ) &&
                        <TouchableOpacity style={{alignSelf: 'flex-end', marginBottom: 10}} onPress={this.onResetCurrentStep.bind(this)}>
                          <Text style={styles.resetText}>Reset</Text>
                        </TouchableOpacity>
                      }
                      {
                      currentStep == 0 &&
                        <CalendarPicker 
                          ref={this.cs}
                          startFromMonday={false}
                          allowRangeSelection={true}
                          weekdays={['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']}
                          minDate={minDate}
                          maxDate={maxDate}
                          previousTitle="<"
                          nextTitle=">"
                          todayBackgroundColor={colors.lightPurple}
                          selectedDayTextColor={selectedDayTextColor}
                          selectedDayColor={selectedDayColor}
                          onDateChange={this.onDateChangeOnFind}
                          scaleFactor={450}
                          textStyle={{
                            fontFamily: 'PoppinsBold',
                            color: colors.mainPurple
                          }}
                          selectedStartDate={f_selectedStartDate}
                          selectedEndDate={f_selectedEndDate}
                        />
                      }
                      {
                        currentStep == 1 &&
                        <View style={[styles.locationInputStyle, {width: '100%', marginBottom: 10}]}>
                          <TextInput 
                            style={[styles.locationInput,{width: '95%'}]}
                            placeholder="Type location"
                            value={this.state.f_location}
                            onChangeText={text=>this.onChangeLocation(text)}
                          />
                          <Ionicons name="md-search" size={25} color={colors.mainPurple} style={{justifyContent: 'flex-end'}} />
                        </View>
                      }
                      {
                        (currentStep == 1 && this.state.show_locations) &&
                        <View>                    
                          {
                            this.state.predictions.map(prediction=>(
                              <TouchableOpacity key={prediction.description} style={styles.locationItemContent} onPress={()=>this.handleLocation(prediction.description)}>
                                <Text key={prediction.id} style={styles.locationItemText}>
                                  {prediction.description}
                                </Text>
                            </TouchableOpacity>
                            ))
                          }
                        </View>
                      }
                      {
                        (currentStep == 1 && f_locations.length>0) && 
                        <View>
                          {
                            f_locations.map(item=> (
                              <View 
                                key={item}
                                style={{backgroundColor: colors.mainPurple, 
                                            borderRadius: 5, flexDirection: 'row', 
                                            alignItems: 'center', 
                                            padding: 5, 
                                            marginBottom: 3, 
                                            justifyContent: 'space-between'
                                            }}>
                                <Text style={styles.applyBtn}>{item}</Text>
                                <TouchableOpacity style={{marginLeft: 2}} onPress={()=>this.handleDeleteLocation(item)}>
                                  <Text style={styles.applyBtn}>X</Text>
                                </TouchableOpacity>
                              </View>
                            ))
                          }
                        </View>
                      }
                      {
                        currentStep == 2 &&
                        <View style={{paddingLeft: 10, paddingRight: 10}}>
                        {
                          this.state.aryDistance.map((item, index)=> (
                            <TouchableOpacity
                            key={item.id.toString()}
                            style={[styles.distanceItems, {backgroundColor: item.selected==true?this.convertDiatanceToString(item.id).backgroundColor:'#70707070'}]}
                            onPress={()=>this.toggleItems(item, index)}>
                            <Text style={[styles.distanceItem, {color: item.selected==true?this.convertDiatanceToString(item.id).color:colors.black}]}>
                              {item.value}
                            </Text>
                            </TouchableOpacity>
                          ))
                        }
                        </View>
                      }
                      {
                        currentStep == 0 &&
                          <TouchableOpacity style={[styles.nextStepBtn, {opacity: f_selectedEndDate?1:0.6}]} onPress={()=>this.onStepChange(1)} disabled={!f_selectedEndDate}>
                            <Text style={styles.nextTxt}>Next</Text>
                          </TouchableOpacity>
                      }
                      {
                        currentStep == 1 &&
                          <TouchableOpacity style={[styles.nextStepBtn, {opacity: f_locations.length>0?1:0.6, marginTop: 30}]} onPress={()=>this.onStepChange(2)} disabled={f_locations.length==0}>
                            <Text style={styles.nextTxt}>Next</Text>
                          </TouchableOpacity>
                      }
                      {
                        currentStep == 2 &&
                          <TouchableOpacity style={[styles.nextStepBtn, {opacity: f_distance.length>0?1:0.6, marginTop: 10}]} onPress={()=>this.onStepChange(3)} disabled={f_distance.length==0}>
                            <Text style={styles.nextTxt}>Result</Text>
                          </TouchableOpacity>
                      }
                      
                    </View>
                    }
                  </ScrollView>
                </Tab>
            </Tabs>
        </Container>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: colors.mainPurple
  },
  searchbar: {
    flexDirection: "row",
    paddingLeft: 16,
    paddingRight: 16,
    height: 50,
    backgroundColor: colors.mainPurple,
    position: "relative",
    alignItems: 'center'
  },
  itemContainer: {
    flexDirection: "row",
    marginLeft: 29,
    marginRight: 28,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: "center",
    borderColor: colors.whiteThree,
    backgroundColor: "#FFFFFF"
  },
  userImage: {
    width: 26,
    height: 26,
    borderRadius: 24
  },
  userName: {
    flex: 1,
    alignSelf: "center",
    marginLeft: 10,
    color: "#005872",
    fontWeight: "bold",
    fontFamily: "PoppinsBold",
    fontSize: 12,
    fontStyle: "normal",
    letterSpacing: 0,
    color: colors.mainPurple
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderRadius: 3,
    borderColor: colors.whiteThree,
    borderWidth: 1,
    paddingLeft: 16,
    color: colors.white,
    borderRadius: 20,
    // backgroundColor: 'trasparent'
  },
  backBtnStyle: {
    height: 46,
    alignItems: "center",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.white,
    marginRight: 15
  },
  tabUnderLine: {
    borderBottomColor: colors.mainPurple,
    borderBottomWidth: 5
  },
  inactiveTab: {
      backgroundColor: colors.paleGray,
  },
  activeTab: {
      backgroundColor: colors.paleGray
  },
  activeText: {
      color: colors.mainPurple,
      fontFamily: 'PoppinsBold',
      fontSize: 13,
  },
  inactiveText: {
      color: colors.inactiveText,
      fontFamily: 'PoppinsBold',
      fontSize: 13
  },
  filterMainContainer: {
    flexDirection: 'row',
  },
  bottomContainer: {
    backgroundColor: colors.white, 
    flexDirection: 'column',
    paddingBottom: 20,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: colors.mediumGrey,
    borderTopColor: colors.white,
    borderBottomColor: colors.white
  },
  bottomItemWrapper: {
    borderWidth: 1,
    borderColor: colors.white,
    borderBottomColor: `${colors.mediumGrey}80`,
    paddingBottom: 5,
    paddingTop: 5
  },
  bottomItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5
  },
  labelStyle: {
    marginRight: 10, 
    color: colors.dusk, 
    fontFamily: 'PoppinsBold',
    fontWeight: "300",
    alignSelf: 'flex-start',
  },
  locationInputStyle: {
    borderWidth: 1,
    borderColor: colors.mainPurple,
    borderRadius: 4,
    height: 36,
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 10
  },
  locationInput: {
    fontSize: 12,
    color: colors.dusk,
    width: '80%',
    fontFamily: 'PoppinsBold'
  },
  bottomBtnContent: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    borderColor: colors.mainPurple,
    marginRight: 15,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomBtn: {
    color: colors.mainPurple,
    fontWeight: 'bold',
    fontFamily: 'PoppinsBold'
  },
  rangeText: {
    fontSize: 9, 
    color: `${colors.dusk}60`, 
    fontFamily:'PoppinsBold',
  },
  lblToggle: {
    fontSize: 12, 
    fontFamily:'PoppinsBold',
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 5,
    backgroundColor: colors.white,
    flex: 1,
    borderColor: colors.mediumGrey,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  filterText: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: colors.mainPurple,
  },
  eventsContainer: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    backgroundColor: colors.lightPurple
  },
  nameContainer: {
    padding: 10,
    width: '50%',
  },
  distanceContainer: {
    width: '10%'
  },
  distanceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  distanceTxt: {
    fontSize: 10,
    fontFamily: 'PoppinsBold',
  },
  locationContainer: {
    padding: 3,
    width: '15%'
  },
  dateContainer: {
    width: '25%',
    borderLeftColor: colors.mainPurple,
    borderLeftWidth: 1,
    height: '100%'
  },
  eventsName: {
    color: colors.mainPurple,
    fontSize: 13,
    fontFamily: 'PoppinsBold',
  },
  distanceTitle: {
    fontSize: 10,
    color: colors.mainPurple,
    fontFamily: 'PoppinsBold',
  },
  mapStyle: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  loadingStyle: {
    flex: 1, 
    marginTop: 20
  },
  rangeContainer: {
    width: 300,
    marginLeft: 10
  },
  option: {
    borderWidth: 1, 
    borderColor: colors.dusk, 
    borderRadius: 5, 
    width: 20, 
    height: 20, 
    padding: 3
  },
  applyBtnContainer: {
    width: '100%',
    paddingLeft: 28,
    paddingRight: 28,
    flex: 1,
    marginTop: 10
  },
  applyBtnContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mainPurple,
    height: 40,
    borderRadius: 5,
  },
  applyBtn: {
    color: colors.dusk,
    fontSize: 13,
    fontFamily: 'PoppinsBold',
  },
  resetText: {
    color: colors.cerise,
    fontSize: 12,
    fontFamily: 'PoppinsBold',
  },
  calloutContainer: {
    backgroundColor: colors.mainPurple,
    opacity: 0.6,
    flex: 1,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    borderRadius: 5
  },
  calloutContent: {
    flexDirection: 'column',
    flex: 1,
    alignContent: 'space-between',
    padding: 3
  },
  calloutTitle: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: colors.white
  },
  calloutDesc: {
    fontSize: 10,
    fontFamily: 'PoppinsBold',
    fontWeight: '300',
    color: colors.white
  },
  calloutDistanceContent: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  calloutDistanceText: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
  },
  stepContent: {
    marginTop: 20
  },
  findContainer: {
    backgroundColor: '#70707010'
  },
  stepContent: {
    marginTop: 10
  },
  titleContent: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: colors.mainPurple
  },
  findMainContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    shadowOffset: {
    height: 1,
    width: 1,
    },
    padding: 20,

  },
  nextStepBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mainPurple,
    height: 50,
    borderRadius: 6
  },
  nextTxt: {
    fontSize: 12,
    color: colors.white,
    fontFamily: 'PoppinsBold',
  },
  distanceItems: {
    marginBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    borderRadius: 5
  },
  distanceItem: {
    fontSize: 10,
    fontFamily: 'PoppinsBold',
  },
  locationInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.lightPurple,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  locationInputContent: {
    height: 40,
    padding: 3,
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    color: colors.mainPurple
  },
  locationItemContent: {
    padding: 5,
    borderBottomColor: colors.lightPurple,
    borderBottomWidth: 1
  },
  locationItemText: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: colors.mainPurple
  }
});
