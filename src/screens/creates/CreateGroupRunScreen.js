import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  
} from "react-native";
import MapView from "react-native-maps";
import * as colors from "@constants/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getUser } from "@logics/auth";
import Geocoder from 'react-native-geocoding';
import { createGroupRunEvent } from "../../logics/data-logic";
import DatePicker from 'react-native-datepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { NavigationEvents } from 'react-navigation';

export default class CreateGroupRunScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
        header: null,
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            fullMap: false,
            selectedStartDate: null,
            selectedStartDateStr: '',
            title: '',
            desc: '',
            distance: '6',
            kind_status: true,
            marker: null,
            address: '',
            empty_desc: false,
            empty_title: false,
            selected_road: true,
            selected_trail: false,
            initLatitude: 0,
            initLongitude: 0,
            user: null,
            loading: false,
            item: null,
        }
        this.handlePressPin = this.handlePressPin.bind(this);
        this.handleChangeDesc = this.handleChangeDesc.bind(this);
        this.handleChangeTitle = this.handleChangeTitle.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }

    componentDidMount() {
        Geocoder.init("AIzaSyCMOlzsK0_sscqyeqq2KBS9bKosOvKW130");
        let location = '200 EI Camino Real, San Jose, USA';
        let today = new Date();
        let desc = this.defaultDesc(location, today);
        let title = this.defaultTitle(today);
        this.findCurrentLocationAsync();
        let temp = moment().add(1, 'h').format("YYYY-MM-DD HH:mm");
        const user = getUser();
        this.setState({
            title: title,
            desc: desc,
            selectedStartDateStr: temp,
            selectedStartDate: new Date(moment(temp)),
            user: user,
        })
    }

    initValues() {
        let location = '200 EI Camino Real, San Jose, USA';
        let temp = moment().add(1, 'h').format("YYYY-MM-DD HH:mm");
        let today = new Date();
        let desc = this.defaultDesc(location, today);
        let title = this.defaultTitle(today);
        this.setState({
            title: title,
            desc: desc,
            selected_road: true,
            selected_trail: false,
            distance: '6',
            selectedStartDate: new Date(moment(temp)),
            marker: null,
            address: ''
        });
    }

    defaultTitle(today) {
        let temp = new Date(today);
        let start = temp.getHours() + 1;
        const user = getUser();
        let title = this.displayModifiedDate(temp) + " " + user.displayName + " " + start + ' min/mile';
        return title;
    }

    defaultDesc(address, today) {
        let temp =  new Date(today);
        const months = ['Jau', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let start = temp.getHours() + 1;
        let end = start + 6;
        let mm = months[temp.getMonth()];
        let dd = temp.getDate();
        let desc = mm + " " + dd + ', ' + 'at ' + start + '-' + end + "\n" 
                    + address + "\n"
                    + "Join Me! Beer after! :)" + "\n"
                    + "Pace: " + "6-6:30 min/mile  "
                    + "Ticket info: " + "free!";
        return desc;
    }

    handlePressFullMap = (status) => {
        this.setState({fullMap: status})
    }

    displayModifiedDate(date) {
        let startDay = new Date(date).getDate();
        let startMonth = new Date(date).getMonth() + 1;
        let startYear = new Date(date).getFullYear();
        let start = startMonth + "/" + startDay + "/" + startYear;
        return start;
    }

    onDateChange(dateStr, date) {
        let temp = moment(date).format('YYYY-MM-DD HH:mm');
        this.setState({
            selectedStartDateStr: temp,
            selectedStartDate: date   
        });
    }

    convertToAddress = (_lat, _long) => {
        var address;
        const {empty_desc} = this.state;
        Geocoder.from(_lat, _long)
        .then(json => {
          address = json.results[0].formatted_address;
          this.setState({address: address});
        });
    }
    
    handlePressPin(e) {
        this.setState({ marker: e.nativeEvent.coordinate });
        this.convertToAddress(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
    }

    handleChangeDesc(text) {
        if(!text) {
            this.setState({empty_desc: true})
        }
        this.setState({desc: text});
    }

    handleChangeTitle(text) {
        if(!text) {
            this.setState({empty_title: true});
        }
        this.setState({title: text});
    }

    async handleSubmit() {
        const {title, desc, marker, address, distance, selected_road, selected_trail, selectedStartDate, user, status} = this.state;
        this.setState({loading: true});
        let type = ''
        if(selected_road && selected_trail) {
            type = 'both';
        }else if(selected_road) {
            type = 'road';
        }else if(selected_trail) {
            type = 'trail';
        }
        let data = {
            name: title,
            description: desc,
            location: marker,
            distance: parseInt(distance),
            type: type,
            startTime: selectedStartDate,
            userID: user.uid,
            address: address
        }
        let errorMsg = '';
        if(marker == null) {
            errorMsg = 'Please select the start location of your run by pinning on the map';
            this.setState({loading: false});
            alert(errorMsg);
        }else {
            const res = await createGroupRunEvent(data);
            console.log("res->", res.id);
            if(res) {
                this.setState({loading: false, item: res});
            }
            alert("Event created successfully");
            this.props.navigation.push("UserEvent", {item: res, route: 'create'});
        }
    }

    handlePressRoad = () => {
        let status = false;
        let temp = this.state.selected_road;
        temp = !temp;
        if(!temp && !this.state.selected_trail) {
            status = false
        }else {
            status = true
        }
        this.setState({
            selected_road: temp,
            kind_status: status
        })
    };

    handlePressTrail = () => {
        let temp = this.state.selected_trail;
        let status = false;
        temp = !temp;
        if(!temp && !this.state.selected_road) {
            status = false;
        }else {
            status = true
        }
        this.setState({
            selected_trail: temp,
            kind_status: status
        })
    }

    findCurrentLocationAsync = async() => {
        let {status} = await Permissions.askAsync(Permissions.LOCATION);
        if(status != 'granted') {
            this.setState({
                errorMsg: "Permission to access location was denied"
            });
        }
        let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        this.setState({
            initLatitude: location.coords.latitude,
            initLongitude: location.coords.longitude
        })
    }

    render() {
        const {fullMap, title, desc, distance, kind_status, address, selectedStartDateStr, initLatitude, initLongitude, loading } = this.state;
        const name = 'Create Event';
        const submitTitle = 'Create Group Run Event';
        const defaultAddress = 'Pin the start location on map';
        if(fullMap) {
            return (
                <View style={styles.wholeMapContainer}>
                    <MapView
                        style={{width: '100%', height: '100%'}}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        scrollEnabled={true}
                        showsCompass={true}
                        showsBuildings={true}
                        initialRegion={{
                            latitude: initLatitude,
                            longitude: initLongitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                        region={{
                            latitude: this.state.marker?this.state.marker.latitude:initLatitude,
                            longitude: this.state.marker?this.state.marker.longitude:initLongitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                        onPress={(e)=>this.handlePressPin(e)}>
                        {
                            this.state.marker &&
                            <MapView.Marker coordinate={this.state.marker} />
                        }
                    </MapView>
                    <TouchableOpacity style={styles.zoomOutBtn} onPress={()=>this.handlePressFullMap(false)}>
                        <MaterialIcons name="close" size={20} color={colors.mainPurple} />
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (
                <KeyboardAwareScrollView    enableOnAndroid={true}
                                            enableAutomaticScroll={true}
                                            keyboardOpeningTime={0}
                                            contentContainerStyle={styles.container}
                >
                    <NavigationEvents
                        onDidFocus={this.initValues.bind(this)}
                    />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{name}</Text>
                        <TouchableOpacity style={styles.shareBtn}>
                          <Ionicons name="md-share" size={25} color={colors.mainPurple} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.mapStyle}
                            zoomEnabled={true}
                            pitchEnabled={true}
                            rotateEnabled={true}
                            scrollEnabled={true}
                            showsCompass={true}
                            showsBuildings={true}
                            initialRegion={{
                                latitude: initLatitude,
                                longitude: initLongitude,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02,
                            }}
                            region={{
                                latitude: this.state.marker?this.state.marker.latitude:initLatitude,
                                longitude: this.state.marker?this.state.marker.longitude:initLongitude,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02,
                            }}
                            onPress={(e)=>this.handlePressPin(e)}
                        >
                            {
                                this.state.marker &&
                                <MapView.Marker coordinate={this.state.marker} />
                            }
                        </MapView>
                        <View style={styles.pinTextContainer}>
                            <Text style={styles.pinText}>{address?address:defaultAddress}</Text>
                        </View>
                        <TouchableOpacity style={styles.zoomInBtn} onPress={()=>this.handlePressFullMap(true)}>
                            <MaterialIcons name="zoom-out-map" size={20} color={colors.mainPurple} />
                        </TouchableOpacity>
                    </View>
                    <View style={{paddingHorizontal: 20, paddingVertical: 10, paddingTop: 0}}>
                        <View>
                            <View style={styles.itemContainer}>
                                <DatePicker
                                    style={{width: '100%'}}
                                    date={selectedStartDateStr}
                                    mode="datetime"
                                    androidMode="spinner"
                                    format="YYYY-MM-DD HH:mm"
                                    minDate={new Date}
                                    maxDate="2100-12-01"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateText: {
                                            alignSelf: 'flex-start',
                                            letterSpacing: 1
                                        },
                                        dateInput: {
                                            borderWidth: 0,

                                        }
                                    }}
                                    onDateChange={(dateStr, date) => this.onDateChange(dateStr, date)}
                                />
                                <Text style={styles.label}>Date and Time</Text>
                            </View>
                            <View style={styles.rowContainer}>
                                <View style={{width: '55%'}}>
                                    <TextInput 
                                        value={distance}
                                        onChangeText={(text)=>this.setState({distance: text})}
                                        keyboardType={"numeric"}
                                        style={[styles.inputStyle, styles.itemContainer, {letterSpacing: 1, width: '100%'}]}
                                    />
                                    <Text style={[styles.label, {color:(!distance || distance == '0')?colors.dusk:colors.labelText}]}>Distance</Text>
                                </View>
                                <View style={[styles.itemContainer, {width: '40%', borderColor: kind_status?colors.dusk:colors.dusk}]}>
                                    <Text style={[styles.label, {color:kind_status?colors.labelText:colors.dusk}]}>Type</Text>
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
                            {
                                !distance &&
                                <Text style={[styles.warningTxt, {alignSelf: 'flex-start'}]}>*Distance is required</Text>
                            }
                            {
                                distance == '0' &&
                                <Text style={[styles.warningTxt, {alignSelf: 'flex-start'}]}>*Distance should be above 0</Text>
                            }
                            {
                                !kind_status &&
                                <Text style={[styles.warningTxt, {alignSelf: 'flex-end'}]}>*A type should be selected at least</Text>
                            }
                            <View>
                                <TextInput 
                                    value={title}
                                    onChangeText={text=>this.handleChangeTitle(text)}
                                    style={[styles.inputStyle, styles.itemContainer]}
                                />
                                <Text style={styles.label}>Title</Text>
                            </View>
                            {
                                !title &&
                                <Text style={styles.warningTxt}>*Title is required</Text>
                            }
                            <View style={[styles.itemContainer,{height: 120, borderColor: desc?colors.dusk:colors.dusk}]}>
                                <Text style={[styles.label, {bottom: 110, color: desc?colors.dusk:colors.dusk}]}>Description</Text>
                                <TextInput 
                                    defaultValue="test"
                                    value={desc}
                                    onChangeText={text=>this.handleChangeDesc(text)}
                                    multiline
                                    style={styles.descContainer}
                                />
                            </View>
                            {
                                !desc &&
                                <Text style={styles.warningTxt}>*Description is required</Text>
                            }
                        </View>
                        <TouchableOpacity style={styles.btnContainer} onPress={this.handleSubmit.bind(this)} disabled={!title || !desc || !kind_status || !distance || distance  == '0' || loading}>
                            {loading &&
                                <ActivityIndicator size="small" color={colors.white} />
                            }
                            {!loading &&
                                <Text style={styles.btnTxt}>{submitTitle}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
        );
        }
    }
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: '#ecedf5',
    },
    wholeMapContainer: {
        flex: 1,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 0,
        flexDirection: 'row'
    },
    shareBtn: {
    },
    title: {
        fontSize: 30,
        fontFamily: "PoppinsBold",
        color: colors.mainPurple
    },
    mapContainer: {
        width: '100%',
        height: 220
    },
    mapStyle: {
        width: '100%',
        height: '100%'
    },
    pinTextContainer: {
        position: 'absolute',
        top: 0,
        padding: 3,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${colors.paleGray}60`
    },
    pinText: {
        fontSize: 15,
        color: colors.black,
        fontFamily: 'PoppinsRegular',
    },
    zoomInBtn: {
        position: 'absolute',
        right: 10,
        bottom: 10
    },
    zoomOutBtn: {
        position:'absolute',
        left: 10,
        top: 20
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    itemContainer: {
        borderWidth: 1,
        borderColor: colors.dusk,
        borderRadius: 4,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.paleGray,
        marginTop: 10,
        paddingHorizontal: 10
    },
    label: {
        fontSize: 10,
        fontFamily: 'PoppinsRegular',
        position: 'absolute',
        color: colors.labelText,
        bottom: 28,
        left: 10,
        paddingHorizontal: 3,
        backgroundColor: colors.paleGray,
        paddingTop: 0
    },
    warningTxt: {
        fontSize: 10,
        color: colors.cerise,
        fontFamily: 'PoppinsRegular',
    },
    inputStyle: {
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        fontStyle: "normal",
        color: colors.dusk,
    },
    descContainer: {
        flexDirection: "row",
        width: "96%",
        marginLeft: 2,
        marginRight: 2,
        marginBottom: 10,
        minHeight: 50, //... For dynamic height
        paddingTop: 10, //... With respect to the min height, so that it doesn't cut
        paddingBottom: 10, //.
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        fontStyle: "normal",
        color: colors.dusk,
    },
    btnContainer: {
        backgroundColor: colors.mainPurple,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '90%',
        borderRadius: 5,
        height: 55,
        marginTop: 10
    },
    btnTxt: {
        color: colors.white,
        fontSize: 16,
        fontFamily: "PoppinsBold",
    },
    modalLabel: {
        fontSize: 16,
        fontFamily: "PoppinsRegular",
        color: colors.dusk
    },
    lblToggle: {
        fontSize: 12, 
        fontFamily:'PoppinsBold',
    },
    option: {
        borderWidth: 1, 
        borderColor: colors.dusk,
        borderRadius: 5, 
        width: 20, 
        height: 20, 
        padding: 3
    },
});
