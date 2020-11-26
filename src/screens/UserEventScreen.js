import React from "react";
import {View, 
        Text, 
        StyleSheet, 
        ActivityIndicator, 
        Dimensions, 
        TouchableOpacity, 
        TextInput,
        ImageBackground,
        Image,
        ScrollView} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as colors from "../constants/colors";
import MapView from "react-native-maps";
import { fetchCommentsById, 
        fetchUsersById, 
        addReview, 
        deleteUserEventItem, 
        updateEventStatus, 
        fetchEventsById } from "../logics/data-logic";
import { getUser } from "@logics/auth";
import ActionSheet from 'react-native-actionsheet';
import { NavigationEvents } from 'react-navigation';
import * as firebase from "firebase";
import { update } from "ramda";

export default class UserEventScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: null
    });
    constructor(props) {
        super(props);
        this.state = {
            item: null,
            comments: [],
            temp_comments: [],
            moreComments: false,
            fullMap: false,
            user: null,
            status: 0,
            route: '',
            comment: '',
            loading: false,
            refreshing: false,
            calc_comment: false
        }
    }

    async componentDidMount() {
        this.state.calc_comment = true;
        this.setState({refreshing: true})
        const {item, route} = this.props.navigation.state.params;
        if(this.state.calc_comment) {
            const db = firebase.firestore();
            db.collection("comments").onSnapshot(() => {
              this.getReview(item.id);
            })

            db.collection("events_user").doc(item.id).onSnapshot(()=>{
                this.getEventItem(item.id)
            })
        }
        
        this.setState({item: item, route: route});
        const user = await getUser();
        if(this.getStatus(item.going, user.uid)) {
            this.setState({status: 1})
        }else if(this.getStatus(item.interesting, user.uid)) {
            this.setState({status: 2})
        }else if(this.getStatus(item.not, user.uid)) {
            this.setState({status: 3})
        }else {
            this.setState({status: 0})
        }
        this.setState({user});
    }

    initValues() {
        this.setState({calc_comment: true})
    }

    stopCalc() {
        this.setState({calc_comment: false})
    }

    componentWillUnmount() {
        this.setState({calc_comment: false});
    }

    getStatus = (item, uID) => {
        var result = item.indexOf(uID);
        if(result > -1) {
            return true;
        }
        return false;
    }

    async getReview(eventID) {
        const {moreComments} = this.state;
        let comments = await fetchCommentsById(eventID);
        if(comments) {
            for(const comment of comments) {
                const user = await fetchUsersById(comment.userID);
                comment.user = user;
            }
            comments.sort((a, b) => (a.time < b.time) ? 1: -1);
            this.setState({comments: comments, temp_comments: moreComments?comments:comments.slice(0,2), comment: '', loading: false, refreshing: false})
        }
    }

    async getEventItem(eventID) {
        const {route} = this.state;
        let events = await fetchEventsById(eventID);
        if(events && !events.name) {
            if(route === 'create') 
            {
                this.props.navigation.navigate('Search');
            }else if(route === 'update') {
                this.props.navigation.push('Profile')
            }else {
                this.props.navigation.goBack();
            }
        }
        if(events && events.name) {
            this.setState({item: events, refreshing: false})
        }
            
    }

    handleReadMore = () => {
        const {comments, moreComments} = this.state;
        let temp = comments;
        let flag = moreComments;
        flag = !flag;
        if(flag) {
            this.setState({
                temp_comments: comments,
                moreComments: true
            })
        }else {
            this.setState({
                temp_comments: temp.slice(0, 2),
                moreComments: false
            })
        }
    }

    handlePressFullMap = (status) => {
        this.setState({fullMap: status});
    }

    convertRealDateTime = (timeStamp, type) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var theDate;
        theDate = new Date(timeStamp * 1000);
        var day = theDate.getDate();
        var month = theDate.getMonth();
        var year = theDate.getFullYear();
        var hh = theDate.getHours();
        hh = hh < 10 ? '0'+hh : hh;
        var mm = theDate.getMinutes();
        mm = mm < 10 ? '0'+mm : mm;
        return day + " " + months[month] + " " + year + ", " + hh + ":" + mm;
    }

    handlePressMenu() {
        this.ActionSheet.show();
    }

    handlePressOption = (index) => {
        const {item, route} = this.state;
        console.log("route -> ", route);
        if(route == 'create' || route == 'update') {
            if(index == 4) {
                deleteUserEventItem(item.id).then(()=>{
                    alert("Delete successfully!");
                });
            }else if(index == 1) {
                this.props.navigation.navigate("EditGroupRun", {item: item});
            }
        }else if(route == 'filter') {

        }
    }

    handlePressStatus = (index) => {
        this.setState({loading: true})
        const {user, item} = this.state;
        this.setState({
            status: index
        })
        updateEventStatus(index, user.uid, item.id).then((res)=>{
            let temp = res;
            this.setState({item: temp, loading: false});
        });

    }

    handleShowStatus() {
        const {item} = this.state;
        this.props.navigation.navigate("EventStatus", {item: item});
    }

    async handlePressSend() {
        this.setState({loading: true});
        this.textInput.clear();
        const {comment,  item} = this.state;
        const myUid = getUser().uid;
        if(comment) {
          await addReview(comment, myUid, item.id).then(()=>this.getReview(item.id))
        }
    }

    render() {
        const { item, comments, moreComments, temp_comments, fullMap, status, route, comment, loading, user, refreshing } = this.state;
        const readMoreText = moreComments ? 'Read less' : 'Read more';
        var optionArray = [];
        if(route == 'filter') {
            optionArray = ['Share', 'View owner profile', 'Add to your Calendar', 'Copy event URL', 'Report', 'Cancel']
        }else if(route == 'view') {
            optionArray = ['Share', 'Add to your Calendar', 'Copy event URL', 'Cancel']
        }else {
            optionArray = ['Share', 'Edit', 'Add to your Calendar', 'Copy event URL', 'Delete', 'Cancel'];
        }
        if(item && item.location) {
            let markers = {
                latitude: item.location.latitude,
                longitude: item.location.longitude,
                title: item.name,
            };
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
                                latitude: item.location.latitude,
                                longitude: item.location.longitude,
                                latitudeDelta: 2,
                                longitudeDelta: 2
                            }}
                            region={{
                                latitude: item.location.latitude,
                                longitude: item.location.longitude,
                                latitudeDelta: 2,
                                longitudeDelta: 2
                            }}
                        >
                            <MapView.Marker coordinate={markers} />
                        </MapView>
                        <TouchableOpacity style={styles.zoomOutBtn} onPress={()=>this.handlePressFullMap(false)}>
                            <MaterialIcons name="close" size={20} color={colors.dusk} />
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return (
                    <View style={styles.container}>
                        <NavigationEvents
                            onDidFocus={this.initValues.bind(this)}
                            onDidBlur={this.stopCalc.bind(this)}
                        />
                        
                        <View style={styles.titleContainer}>
                            <TouchableOpacity onPress={()=>route=='filter'?this.props.navigation.goBack():this.props.navigation.navigate("Profile")}>
                                <Ionicons 
                                    name="md-arrow-back"
                                    size={25}
                                    color={colors.mainPurple}
                                />
                            </TouchableOpacity>
                            <View style={{width: '80%'}}>
                                {refreshing &&
                                <View>
                                    <ActivityIndicator color={colors.dusk} />
                                </View>
                                }
                                <Text style={[styles.titleTxt, {textAlign: 'center'}]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.itemTxt, {fontSize: 16, color: colors.dusk, fontFamily: 'PoppinsRegular', alignSelf: 'center'}]}>
                                    {this.convertRealDateTime(item.datetime.seconds, 'filter')}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={this.handlePressMenu.bind(this)}>
                                <FontAwesome name="ellipsis-h" size={25} color={colors.mainPurple} />
                            </TouchableOpacity>
                        </View>
                        <KeyboardAwareScrollView    enableOnAndroid={true}
                                                    enableAutomaticScroll={true}
                                                    keyboardOpeningTime={0}>
                            <View>
                                <MapView
                                    style={styles.mapStyle}
                                    zoomEnabled={true}
                                    pitchEnabled={true}
                                    rotateEnabled={true}
                                    scrollEnabled={true}
                                    showsCompass={true}
                                    showsBuildings={true}
                                    initialRegion={{
                                        latitude: item.location.latitude,
                                        longitude: item.location.longitude,
                                        latitudeDelta: 2,
                                        longitudeDelta: 2
                                    }}
                                    region={{
                                        latitude: item.location.latitude,
                                        longitude: item.location.longitude,
                                        latitudeDelta: 2,
                                        longitudeDelta: 2
                                    }}
                                >
                                    <MapView.Marker coordinate={markers} />
                                </MapView>
                                <TouchableOpacity
                                    style={styles.zoomInBtn} onPress={()=>this.handlePressFullMap(true)}
                                >
                                    <MaterialIcons name="zoom-out-map" size={20} color={colors.dusk} />
                                </TouchableOpacity>
                            </View>
                            {route == 'filter' &&
                            <View style={styles.mainBtnContainer}>
                                <TouchableOpacity style={[styles.mainBtn, {backgroundColor: status==1?colors.mainPurple:colors.paleGray}]} onPress={()=>this.handlePressStatus(status==1?0:1)}>
                                    <Text style={[styles.btnTxt, {color: status==1?colors.white:colors.dusk}]}>Going</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.mainBtn, {backgroundColor: status==2?colors.mainPurple:colors.paleGray}]} onPress={()=>this.handlePressStatus(status==2?0:2)}>
                                    <Text style={[styles.btnTxt, {color: status==2?colors.white:colors.dusk}]}>Interesting</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.mainBtn, {backgroundColor: status==3?colors.mainPurple:colors.paleGray}]} onPress={()=>this.handlePressStatus(status==3?0:3)}>
                                    <Text style={[styles.btnTxt, {color: status==3?colors.white:colors.dusk}]}>Not interesting</Text>
                                </TouchableOpacity>
                            </View>
                            }
                            <TouchableOpacity style={styles.trackInfoContainer} onPress={this.handleShowStatus.bind(this)}>
                                <View style={styles.trackItemContainer}>
                                    <Text style={styles.trackNum}>{item.going.length}</Text>
                                    <Text style={styles.itemTxt}>Going</Text>
                                </View>
                                <View style={styles.trackItemContainer}>
                                    <Text style={styles.trackNum}>{item.interesting.length}</Text>
                                    <Text style={styles.itemTxt}>Interesting</Text>
                                </View>
                                <View style={styles.trackItemContainer}>
                                    <Text style={styles.trackNum}>{item.not.length}</Text>
                                    <Text style={styles.itemTxt}>Not Interesting</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{paddingHorizontal: 30, paddingVertical: 20, borderBottomColor: 'grey', borderBottomWidth: 1}}>
                                <View style={styles.rowContainer}>
                                    <Text style={[styles.itemTxt, {fontWeight: 'bold'}]}>Start time: </Text>
                                    <Text style={styles.itemTxt}>{this.convertRealDateTime(item.datetime.seconds, 'filter')}</Text>
                                </View>
                                <View style={styles.rowContainer}>
                                    <View style={[styles.rowContainer, {width: '50%'}]}>
                                        <Text style={[styles.itemTxt, {fontWeight: 'bold'}]}>Distance: </Text>
                                        <Text style={styles.itemTxt}>{item.distance} Km</Text>
                                    </View>
                                    <View style={[styles.rowContainer, {width: '50%'}]}>
                                        <Text style={[styles.itemTxt, {fontWeight: 'bold'}]}>Kind: </Text>
                                        <Text style={styles.itemTxt}>{item.type}</Text>
                                    </View>
                                </View>
                            </View>
                            {user &&
                            <View style={{flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 0}}>
                                <Image style={{width: 40, height: 40, borderRadius: 20}} source={user.photoURL?{uri:user.photoURL}: require('../../assets/profile-blank.png')} />
                                <Text style={[styles.itemTxt, {fontWeight: 'bold', marginLeft: 10}]}>{user.displayName}</Text>
                            </View>
                            }
                            <View style={{padding: 20}}>
                                <Text style={[styles.itemTxt, {fontWeight: 'bold', marginBottom: 5}]}>Description</Text>
                                <Text style={[styles.itemTxt, {fontSize: 12}]}>
                                    {item.description}
                                </Text>
                            </View>
                            <View style={{backgroundColor: colors.deepPaleGray, padding: 20, alignItems: 'center'}}>
                                <Text style={[styles.itemTxt, {fontWeight: 'bold', alignSelf: 'flex-start'}]}>Write a Comment</Text>
                            </View>
                            <View style={styles.reviewInputContainer}>
                                <TextInput 
                                    style={styles.reviewInput}
                                    ref={input => { this.textInput = input }}
                                    placeholder="Type your Comment"
                                    value={this.state.review}
                                    multiline
                                    onChangeText={text=>this.setState({comment: text})}
                                />
                                <TouchableOpacity style={{alignSelf: "flex-end"}} onPress={this.handlePressSend.bind(this)} disabled={!comment || loading}>
                                    <MaterialIcons name="send" color={comment?colors.black:colors.lightPurple} size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={{padding: 20}}>
                                <Text style={[styles.itemTxt,{marginBottom: 20}]}>Comment</Text>
                                {loading &&
                                    <ActivityIndicator size="small" color={colors.dusk} />
                                }
                                {
                                    temp_comments && temp_comments.length > 0 &&
                                    temp_comments.map((item)=>(
                                        <View key={item.id} style={{flexDirection: 'row', marginBottom: 10}}>
                                            <ImageBackground style={styles.photoImg} imageStyle={{borderRadius: 18}} source={item.user.photoURL?{uri:item.user.photoURL}: require('../../assets/profile-blank.png')}>
                                                <Image style={styles.flagImg} source={{uri:`https://www.countryflags.io/${item.user.country}/shiny/64.png` }} />
                                            </ImageBackground>
                                            <View style={{paddingHorizontal: 20}}>
                                                <Text style={[styles.itemTxt, {fontWeight: 'bold'}]}>{item.user.name}</Text>
                                                <Text style={styles.itemTxt}>{item.content}</Text>
                                            </View>
                                        </View>
                                    ))
                                }
                                {
                                    temp_comments && temp_comments.length == 0 &&
                                    <Text style={styles.itemDescTxt}>No Comments</Text>
                                }
                            </View>
                            {
                                comments && comments.length > 2 &&
                                <TouchableOpacity style={styles.readMoreBtn} onPress={()=>this.handleReadMore()}>
                                    <Text style={[styles.itemTitleTxt, {color: colors.dusk, fontSize: 12}]}>
                                        {readMoreText}
                                    </Text>
                                </TouchableOpacity>
                            }
                            <View style={{paddingVertical: 20}}></View>
                            <ActionSheet 
                                ref={item => (this.ActionSheet = item)}
                                options={optionArray}
                                cancelButtonIndex={route == 'view' ? 3: 5}
                                destructiveButtonIndex={4}
                                onPress={(index) => this.handlePressOption(index)}
                            />
                        </KeyboardAwareScrollView>
                    </View>
                )
            }
        }
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={colors.dusk} />
            </View>
        )
        
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
        backgroundColor: colors.paleGray,
    },
    wholeMapContainer: {
        flex: 1,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width
    },
    zoomInBtn: {
        position: 'absolute',
        right: 10,
        bottom: 10
    },
    zoomOutBtn: {
        position: 'absolute',
        left: 10,
        top: 20
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: colors.paleGray
    },
    titleTxt: {
        fontFamily: "PoppinsBold",
        fontSize: 20,
        color: colors.dusk
    },
    itemTxt: {
        fontFamily: "PoppinsRegular",
        fontSize: 16,
    },
    mapStyle: {
        width: '100%',
        height: 220
    },
    mainBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    mainBtn: {
        borderWidth: 1,
        borderColor: colors.mainPurple,
        borderRadius: 5,
        height: 35,
        width: Dimensions.get('screen').width / 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5
    },
    btnTxt: {
        fontSize: 12,
        fontFamily: "PoppinsBold",
        color: colors.dusk
    },
    trackInfoContainer: {
        backgroundColor: colors.deepPaleGray,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row'
    },
    trackItemContainer: {
        alignItems: 'center'
    },
    trackNum: {
        fontSize: 30,
        fontFamily: "PoppinsBold",
        color: colors.dusk
    },
    rowContainer: {
        flexDirection: 'row'
    },
    reviewInputContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        // alignItems: 'center',
        paddingLeft: 20,
        padding: 10,
        borderBottomColor: colors.deepPaleGray,
        borderBottomWidth: 10
    },
    reviewInput: {
        height: 80,
        width: '90%',
        color: colors.dusk
    },
    photoImg: {
        height: 36,
        width: 36,
      },
    flagImg: {
        height: 16,
        width: 16,
        position: 'absolute',
        right: -5,
        bottom: -5
    },
    readMoreBtn: {
        backgroundColor: colors.lightPurple, 
        height: 25, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    
})