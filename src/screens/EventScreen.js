import React from "react";
import { Image, 
        StyleSheet, 
        View, 
        TouchableOpacity, 
        Text, 
        TextInput, 
        ScrollView, 
        ActivityIndicator, 
        Dimensions,
        ImageBackground,
        Linking } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as colors from "../constants/colors";
import MapView from "react-native-maps";
import StarRating from 'react-native-star-rating';
import Modal, { ModalContent, ModalButton, ModalFooter } from 'react-native-modals';
import Lightbox from "react-native-lightbox";
import { SliderBox } from 'react-native-image-slider-box';
import { fetchCommentsById, fetchUsersById, addReview } from "../logics/data-logic";
import { getUser } from "@logics/auth";

export default class EventScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            item: null,
            starCount: 0,
            forecast: [],
            latitude: 0,
            longitude: 0,
            moreComments: false,
            moreForecast: false,
            comments: null,
            temp_comments: null,
            temp_forecast: null,
            selected_image: '',
            isModalVisible: false,
            fullMap: false,
            review: ''
        }
    }

    async componentDidMount() {
        // const {item} = this.props.navigation.state.params;
        // console.log("item->", item);
        let item = {
            address: "Ohio, US",
            datetime: {
                "nanoseconds": 0,
                "seconds": 1583868600
            },
            distance: 5000,
            id: "0ua6mVRdhsW7XM1wdfn7",
            location: {
                "_lat": 30.46816,
                "_long": -88.976372,
            },
            name: "Run the Parkway",
            sport: "run",
            type: "race",
            d_expo : "https://www.runczech.com/en/",
            d_start: "https://www.google.com/maps/@36.6605617,-102.0453796,5z",
            description: "But here`s the thing-we expect it from them, because that`s what they`re paid to do. Everyday runners? They face the same emotional ups.",
            organizer: "onRun",
            photoURL: [
                "https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/first-state.png?alt=media&token=19c1a41c-40a8-464b-9c76-818afa98d36d",
                "https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/medal.png?alt=media&token=893dbe4b-fe5e-4e92-8426-c6d1c3e24eb6",
                "https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/welcome.png?alt=media&token=a6daa2a6-1412-4454-88d9-4f80b6608735"
            ],
            racePhotoURL: "https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/AjovS.png?alt=media&token=8a85c00d-3d96-4f7b-91de-80260ef1117f",
            racePhotography: "www.facebook.com",
            raceRegister: "https://worldsmarathons.com/register",
            raceResult: "http://registration.baa.org/cfm_Archive/iframe_ArchiveSearch.cfm",
            sponsors: ["www.google.com", "www.facebook.com"],
            swag_medal: "",
            swag_photo: "",
            swag_tshirt: "",
            trail: [50, 2, 6, 42],
            price: 20,
            swag_medal: 'https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/medal.png?alt=media&token=893dbe4b-fe5e-4e92-8426-c6d1c3e24eb6',
            swag_photo: 'https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/photo.png?alt=media&token=31a1b282-c84a-4955-93a6-2f28f08c59bd',
            swag_tshirt: 'https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/tshirt.png?alt=media&token=45b0b4b4-b46f-4393-b4bf-a8a6df38732e'
        }
        await this.getReview(item.id);
        this.setState({
            item: item
        })
        this.getWeather(item.location._lat, item.location._long, item.datetime.seconds);
        this.setState({item});
    }

    async getReview(eventID) {
        let comments = await fetchCommentsById(eventID);
        console.log("comment->", comments);
        if(comments) {
            for (const comment of comments) {
                const user = await fetchUsersById(comment.userID);
                comment.user = user;
            }
            comments.sort((a, b) => (a.time < b.time) ? 1 : -1)
            this.setState({comments: comments, temp_comments: comments.slice(0, 2), review: ''});
        }
    }

    onStarRatingPress(rating) {
        this.setState({
            starCount: rating
        })
    }

    convertRealDateTime = (timeStamp) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var theDate = new Date(timeStamp * 1000);
        var day = theDate.getDate();
        var month = theDate.getMonth();
        var year = theDate.getFullYear();
        return day + " " + months[month] + " " + year;
    }

    convertDistance = (distance) => {
        var result = distance / 1000;
        return result + 'K';
    }

    handlePressFollow() {
        console.log("follow");
    }

    handlePressSwag = (param) => {
        const {item} = this.state;
        let temp = '';
        switch(param) {
            case 1:
                temp = item.swag_medal;
                break;
            case 2:
                temp = item.swag_tshirt;
                break;
            case 3:
                temp = item.swag_photo;
                break;
        }
        this.setState({
            selected_image: temp,
            isModalVisible: true
        })
    }

    handleRedirect = (param) => {
        const {item} = this.state;
        let url = '';
        switch(param){
            case 1:
                url = item.d_start;
                break;
            case 2:
                url = item.d_expo;
                break;
            case 3:
                url = item.raceResult;
                break;
            case 4:
                url = item.raceRegister;
                break;
            default:
                url = 'www.google.com';
                break;
        }
        Linking.openURL(url);
    }

    toTimestamp(_time, diff_year, diff_date){
        var d1 = new Date(_time * 1000);
        var d2 = new Date( d1.getUTCFullYear()-diff_year, d1.getUTCMonth(), d1.getUTCDate()+diff_date, d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds() );
        const result = Math.floor(d2.getTime());
        return result;
    }

    getPreviousWeather(_time, _lat, _long, diff_year){
        const apiKey = 'db52d185692ef3447f2ea5e5e5e6330e';
        var start = this.toTimestamp(_time, diff_year, 0);
        var end = this.toTimestamp(_time, diff_year, 3);
        let pastURL = `http://history.openweathermap.org/data/2.5/history/city?lat=${_lat}&lon=${_long}&type=hour&start=${start}&end=${end}&appid=${apiKey}`;
        console.log("past url->", pastURL);
        var result = [];
        fetch(pastURL)
            .then(response => response.json())
            .then(data => {
                console.log("prev->", data);
                result = data.list[0];
            })
        return result;
    }

    getWeather(_lat, _long, _time){
        
        const apiKey = 'db52d185692ef3447f2ea5e5e5e6330e';
        let url = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + _lat + '&lon=' + _long + '&units=metric&appid=' + apiKey;

        let today_weather, one_year_ago, two_year_ago, three_year_ago = null;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                today_weather = data.list.splice(data.list.length-2,1);    
            });
        
        one_year_ago = this.getPreviousWeather(_time, _lat, _long, 1);
        two_year_ago = this.getPreviousWeather(_time, _lat, _long, 2);
        three_year_ago = this.getPreviousWeather(_time, _lat, _long, 3);

        let result = {
            current: today_weather,
            one_before: one_year_ago,
            two_before: two_year_ago,
            three_before: three_year_ago
        }
        // console.log("result->", result);
    }

    handleReadMore = (param) => {
        const {comments, temp_comments, moreComments, moreForecast, forecast, temp_forecast} = this.state;
        if(param == 1) {
            let temp = comments;
            let flag = moreComments;
            flag= !flag;
            if(flag) {
                this.setState({
                    temp_comments: comments,
                    moreComments: true
                })
            }else {
                this.setState({
                    temp_comments: temp.slice(0,2),
                    moreComments: false
                })
            }
        }else if(param == 2) {
            let temp = forecast;
            let flag = moreForecast;
            flag= !flag;
            if(flag) {
                this.setState({
                    temp_forecast: forecast,
                    moreForecast: true
                })
            }else {
                this.setState({
                    temp_forecast: temp.slice(0,2),
                    moreForecast: false
                })
            }
        }
    }

    toggleModal = () => {
        this.setState({isModalVisible: !isModalVisible});
    }

    handlePressFullMap = (status) => {
        this.setState({fullMap: status})
    }
    
    async handlePressSend() {
        const {review,  item} = this.state;
        const myUid = getUser().uid;
        if(review) {
          await addReview(review, myUid, item.id).then(()=>this.getReview(item.id))
        }
    }

    render() {
        const {item, forecast, temp_forecast, comments, moreComments, temp_comments, fullMap, moreForecast} = this.state;
        const readMoreText = moreComments ? 'Read less' : 'Read more';
        const showMoreText = moreForecast ? 'Show less' : 'Show more';
        if(item && temp_comments ) {
            let markers = {
                latitude: item.location._lat,
                longitude: item.location._long,
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
                                latitude: item.location._lat,
                                longitude: item.location._long,
                                latitudeDelta: 2,
                                longitudeDelta: 2,
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
                        <View style={styles.titleContainer}>
                            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                                <FontAwesome
                                    name="chevron-left"
                                    size={15}
                                    color={colors.white}
                                />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.titleTxt}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.itemDescTxt,{fontSize: 15, color: colors.white}]}>
                                    {item.address}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={this.handlePressFollow.bind(this)}>
                                <Text style={styles.followTxtStyle}>Follow</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.mainContainer}>
                            <Modal
                                visible={this.state.isModalVisible}
                                rounded={true}
                                onTouchOutside={() => {
                                    this.setState({ isModalVisible: false });
                                }}
                            >
                                <ModalContent style={{padding: 0}}>
                                    <Image 
                                        resizeMode={'cover'}
                                        style={{width: 300, height: 300}}
                                        source={{uri: this.state.selected_image}}
                                    />
                                </ModalContent>
                            </Modal>
                            <View style={styles.imageContainer}>
                                <SliderBox 
                                    images={item.photoURL}
                                    style={styles.image}
                                    onCurrentImagePressed={index=>console.log(index)}
                                />
                            </View>
                            <View style={[styles.infoContainer, {paddingHorizontal: 20}]}>
                                <View style={styles.rowContainer}>
                                    <View style={[styles.rowContainer, {width: '50%'}]}>
                                        <Text style={styles.itemTitleTxt}>Date:</Text>
                                        <Text style={styles.itemTxt}>{this.convertRealDateTime(item.datetime.seconds)}</Text>
                                    </View>
                                    <View style={[styles.rowContainer, {width: '50%'}]}>
                                        <Text style={styles.itemTitleTxt}>Start time:</Text>
                                        <Text style={styles.itemTxt}>17:30</Text>
                                    </View>
                                </View>
                                <View style={styles.rowContainer}>
                                    <View style={[styles.rowContainer, {width: "50%"}]}>
                                        <Text style={styles.itemTitleTxt}>Distance:</Text>
                                        <Text style={styles.itemTxt}>{this.convertDistance(item.distance)}</Text>
                                    </View>
                                    <View style={[styles.rowContainer, {width: '50%'}]}>
                                        <Text style={styles.itemTitleTxt}>Price</Text>
                                        <Text style={styles.itemTxt}>{item.price}$</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.trailContainer}>
                                <View style={{paddingHorizontal: 20, paddingVertical: 5}}>
                                    <Text style={[styles.itemTitleTxt, {color: colors.mainPurple}]}>SWAG</Text>
                                </View>
                                <TouchableOpacity style={styles.trailItem} onPress={()=>this.handlePressSwag(1)}>
                                    <Ionicons name="md-medal" size={25} color={colors.mainPurple} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.trailItem} onPress={()=>this.handlePressSwag(2)}>
                                    <Ionicons name="md-shirt" size={25} color={colors.mainPurple} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.trailItem} onPress={()=>this.handlePressSwag(3)}>
                                    <Ionicons name="md-camera" size={25} color={colors.mainPurple} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.mapContainer}>
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
                                            latitude: item.location._lat,
                                            longitude: item.location._long,
                                            latitudeDelta: 2,
                                            longitudeDelta: 2,
                                        }}
                                    >
                                        <MapView.Marker coordinate={markers} />
                                    </MapView>
                                    <TouchableOpacity style={styles.zoomInBtn} onPress={()=>this.handlePressFullMap(true)}>
                                        <MaterialIcons name="zoom-out-map" size={20} color={colors.dusk} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.flexrow, styles.directionBtnContainer]}>
                                    <TouchableOpacity
                                        onPress={()=>this.handleRedirect(1)}
                                        style={[styles.flexrow, styles.directionBtn]}>
                                        <View style={styles.upIconContainer}>
                                            <Ionicons name="md-arrow-round-forward" size={15} color={colors.white} />
                                        </View>
                                        <Text style={[styles.itemDescTxt, {color: colors.mainPurple, fontSize: 12, marginLeft: 5}]}>Direction to Start</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={()=>this.handleRedirect(2)}
                                        style={[styles.flexrow, styles.directionBtn]}>
                                        <View style={styles.upIconContainer}>
                                            <Ionicons name="md-arrow-round-forward" size={15} color={colors.white} />
                                        </View>
                                        <Text style={[styles.itemDescTxt, {color: colors.mainPurple, fontSize: 12, marginLeft: 5}]}>Direction to Expo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.infoContainer, {padding: 20}]}>
                                <Text style={styles.itemTitleTxt}>Race Profile</Text>
                                <Lightbox>
                                    <Image 
                                        style={{width: '100%', height: 200}}
                                        source={{uri: item.racePhotoURL}}
                                    />
                                </Lightbox>
                            </View>
                            <View style={styles.trailContainer}>
                                <View style={{paddingHorizontal: 20, paddingVertical: 5}}>
                                    <Text style={[styles.itemTitleTxt, {color: colors.mainPurple}]}>Trail</Text>
                                </View>
                                <View style={styles.trailItem}>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>Asphalt: </Text>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>{item.trail[0]}%</Text>
                                </View>
                                <View style={styles.trailItem}>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>Gravel: </Text>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>{item.trail[1]}%</Text>
                                </View>
                                <View style={styles.trailItem}>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>Trail: </Text>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>{item.trail[2]}%</Text>
                                </View>
                                <View style={styles.trailItem}>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>Others: </Text>
                                    <Text style={[styles.itemDescTxt, {fontSize: 12, color: colors.mainPurple}]}>{item.trail[3]}%</Text>
                                </View>
                            </View>
                            <View style={[styles.infoContainer, {paddingHorizontal: 20, borderTopColor: colors.lightPurple, borderTopWidth: 1}]}>
                                {
                                    temp_forecast &&
                                        temp_forecast.map((item, index)=> (
                                            <View key={index} style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                                                <Text style={styles.itemTitleTxt}>{item.dt_txt}</Text>
                                                <Image style={{width:50, height:50}} source={{uri:"https://openweathermap.org/img/w/" + item.weather[0].icon + ".png"}} />
                                                {/* <Text style={styles.itemDescTxt}>{item.weather[0].description}</Text> */}
                                                <Text style={styles.itemTitleTxt}>{Math.round( item.main.temp * 10) / 10 }&#8451;</Text>
                                            </View>
                                        ))   
                                }
                            </View>
                            {
                                temp_forecast &&
                                <TouchableOpacity style={styles.readMoreBtn} onPress={()=>this.handleReadMore(2)}>
                                    <Text style={[styles.itemTitleTxt, {color: colors.mainPurple, fontSize: 12}]}>
                                        {showMoreText}
                                    </Text>
                                </TouchableOpacity>
                            }
                            <View style={{borderTopColor: colors.lightPurple, borderTopWidth: 1}}>
                                <View style={[styles.btnContainer, {paddingTop: 10}]}>
                                    <TouchableOpacity style={[styles.btnStyle, {backgroundColor: colors.white}]} onPress={()=>this.handleRedirect(3)}>
                                        <Text style={[styles.itemTitleTxt, {color: colors.mainPurple}]}>Race result</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.infoContainer, {paddingHorizontal: 20, paddingVertical: 10}]}>
                                    <Text style={styles.itemTitleTxt}>Pre-race Meeting:</Text>                
                                    <View style={[styles.rowContainer, {paddingHorizontal: 20}]}>
                                        <View style={[styles.rowContainer, {paddingVertical: 0, width: '50%'}]}>
                                            <Text style={[styles.itemTitleTxt, {fontSize: 12}]}>Date:   </Text>
                                            <Text style={[styles.itemDescTxt, {fontSize: 12}]}>5,6,7 Jun 2020</Text>
                                        </View>
                                        <View style={[styles.rowContainer, {paddingVertical: 0, width: '50%'}]}>
                                            <Text style={[styles.itemTitleTxt, {fontSize: 12}]}>Time:   </Text>
                                            <Text style={[styles.itemDescTxt, {fontSize: 12}]}>17:30</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.infoContainer_2, {borderTopColor: colors.lightPurple, borderTopWidth: 1}]}>
                                <Text style={styles.itemTitleTxt}>Organizer:   </Text>
                                <Text style={[styles.itemDescTxt, {fontSize: 14}]}>{item.organizer}</Text>
                            </View>
                            <View style={{borderTopColor: colors.lightPurple, borderTopWidth: 1, padding: 20}}>
                                <Text style={styles.itemTitleTxt}>Sponsors and charities:</Text>
                                <View style={[styles.rowContainer, {paddingHorizontal: 20}]}>
                                    {
                                        item.sponsors.map((item)=> (
                                            <View key={item} style={[styles.rowContainer, {paddingVertical: 0, width: '50%'}]}>
                                                <Text style={[styles.itemDescTxt, {fontSize: 14}]}>{item}</Text>
                                            </View>
                                        ))
                                    }
                                </View>
                            </View>
                            <View style={styles.btnContainer}>
                                <TouchableOpacity style={[styles.btnStyle, {backgroundColor: colors.white}]}>
                                    <Text style={[styles.itemTitleTxt, {color: colors.mainPurple}]}>Race photography</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.infoContainer, {padding: 20}]}>
                                <Text style={[styles.itemTitleTxt, {marginBottom: 5}]}>Description</Text>
                                <Text style={styles.itemDescTxt}>
                                    {item.description}
                                </Text>
                            </View>
                            <View style={[styles.flexrow, {backgroundColor: colors.lightPurple, justifyContent: 'space-between', padding: 20}]}>
                                <Text style={[styles.itemTitleTxt, {color: colors.mainPurple}]}>Write a review</Text>
                                <StarRating 
                                    disabled={false}
                                    maxStars={5}
                                    rating={this.state.starCount}
                                    selectedStar={(rating)=>this.onStarRatingPress(rating)}
                                    fullStarColor={colors.mainPurple}
                                    starSize={30}
                                    starStyle={{padding: 2}}
                                />
                            </View>
                            <View style={styles.reviewInputContainer}>
                                <TextInput 
                                    style={styles.reviewInput}
                                    placeholder="Type your Review"
                                    value={this.state.review}
                                    placeholderTextColor={colors.lightPurple}
                                    multiline
                                    onChangeText={text=>this.setState({review: text})}
                                />
                                <TouchableOpacity style={{alignSelf: "flex-end"}} onPress={this.handlePressSend.bind(this)} disabled={!this.state.review}>
                                    <MaterialIcons name="send" color={this.state.review?colors.mainPurple:colors.lightPurple} size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={{borderTopColor: colors.lightPurple, borderTopWidth: 15}}>
                                <View style={{padding: 20}}>
                                    <Text style={[styles.itemTitleTxt,{marginBottom: 20}]}>Reviews</Text>
                                    {
                                        temp_comments.length > 0 &&
                                        temp_comments.map((item)=>(
                                            <View key={item.id} style={{flexDirection: 'row', marginBottom: 10}}>
                                                <ImageBackground style={styles.photoImg} imageStyle={{borderRadius: 18}} source={item.user.photoURL?{uri:item.user.photoURL}: require('../../assets/profile-blank.png')}>
                                                    <Image style={styles.flagImg} source={{uri:`https://www.countryflags.io/${item.user.country}/shiny/64.png` }} />
                                                </ImageBackground>
                                                <View style={{paddingHorizontal: 20}}>
                                                    <Text style={styles.itemTitleTxt}>{item.user.name}</Text>
                                                    <Text style={styles.itemDescTxt}>{item.content}</Text>
                                                </View>
                                            </View>
                                        ))
                                    }
                                    {
                                        temp_comments.length == 0 &&
                                        <Text style={styles.itemDescTxt}>No Review</Text>
                                    }
                                </View>
                            </View>
                            {
                                comments.length > 2 &&
                                <TouchableOpacity style={styles.readMoreBtn} onPress={()=>this.handleReadMore(1)}>
                                    <Text style={[styles.itemTitleTxt, {color: colors.mainPurple, fontSize: 12}]}>
                                        {readMoreText}
                                    </Text>
                                </TouchableOpacity>
                            }
                            <View style={styles.btnContainer}>
                                <TouchableOpacity style={[styles.btnStyle, {backgroundColor: colors.mainPurple, shadowOpacity: 0}]} onPress={()=>this.handleRedirect(4)}>
                                    <Text style={[styles.itemTitleTxt,{color: colors.white}]}>Register on RaceWebpage</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                );
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
        backgroundColor: colors.white,
    },
    followTxtStyle: {
        fontFamily: "PoppinsBold",
        fontSize: 12,
        letterSpacing: 0,
        color: colors.white,
        marginLeft: 8
    },
    infoContainer: {
        // borderBottomColor: colors.lightPurple,
        // borderBottomWidth: 1,
        paddingVertical: 5
    },
    infoContainer_2: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 20
    },

    mainContainer: {
        flexDirection: 'column',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 5
    },
    reviewInputContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        // alignItems: 'center',
        paddingLeft: 20,
        padding: 10
    },
    reviewInput: {
        height: 80,
        width: '90%',
        color: colors.mainPurple
    },
    titleContainer: {
        flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 30,
        backgroundColor: colors.mainPurple
    },
    titleTxt: {
        fontFamily: "PoppinsBold",
        fontSize: 20,
        color: colors.white
    },
    itemTxt: {
        fontFamily: "PoppinsRegular",
        fontSize: 14,
        // color: colors.mainPurple,
        fontWeight: '200',
        marginLeft: 10
    },
    itemTitleTxt: {
        fontFamily: "PoppinsBold",
        fontSize: 14,
        // color: colors.mainPurple
    },
    itemDescTxt: {
        fontFamily: "PoppinsRegular",
        fontSize: 12,
        // color: colors.mainPurple,
    },
    mapContainer: {
        // marginTop: 10
    },
    mapStyle: {
        width: '100%',
        height: 100,
    },
    btnContainer: {
        padding: 30,
    },
    btnStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.32,
        shadowRadius: 2.62,
        shadowOffset: {
            height: 1,
            width: 0,
        },
        borderRadius: 5,
        height: 50,
    },
    imageContainer: {
        width: '100%'
    },
    image: {
        height: 250,
        width: '100%'
    },
    trailContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.lightPurple,
        paddingRight: 20,
        marginBottom: 10
    },
    trailItem: {
        padding: 5,
        flexDirection: 'row'
    },
    flexrow: {
        flexDirection: 'row', 
        alignItems: 'center',
    },
    upIconContainer: {
        backgroundColor: colors.mainPurple,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        marginRight: 2
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
    directionBtnContainer: {
        justifyContent: 'space-around', 
        height: 40, 
        backgroundColor: colors.lightPurple,
        borderTopColor: colors.white,
        borderBottomColor: colors.white,
        borderTopWidth: 5,
        borderBottomWidth: 5
    },
    directionBtn: {
        paddingVertical: 5, 
        width: '40%', 
        justifyContent: 'center', 
        backgroundColor: colors.white,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.32,
        shadowRadius: 2.62,
        shadowOffset: {
            height: 1,
            width: 0,
        },
        borderRadius: 1,
        height: '100%'
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
        position:'absolute',
        left: 10,
        top: 10
    }
})