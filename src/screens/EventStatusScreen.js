import React from "react";
import {View, 
        Text, 
        StyleSheet, 
        ActivityIndicator, 
        TouchableOpacity, 
        ImageBackground,
        FlatList,
        Image} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as colors from "../constants/colors";
import { fetchUsersById } from "../logics/data-logic";
import { NavigationEvents } from 'react-navigation';
import { Container, Tab, Tabs } from 'native-base';

export default class EventStatusScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            arr_going: [],
            arr_interested: [],
            arr_not: [],
            loading: false,
            stateFollow: false
        }
    }

    async componentDidMount() {
        const {item} = this.props.navigation.state.params;
        this.customItem(item)
    }

    async initValues() {
        const {item} = this.props.navigation.state.params;
        this.customItem(item)
    }

    async customItem(item) {
        this.setState({loading: true});
        if(item.going.length > 0) {
            const temp = [];
            for(let res of item.going) {
                try {
                    var user1 = await fetchUsersById(res);
                    temp.push(user1)
                }catch(e) {
                    alert(e);
                    this.setState({loading: false})
                }
            }
            this.setState({arr_going: temp})
        }
        if(item.interesting.length > 0) {
            const temp = [];
            for(let res of item.interesting) {
                try {
                    var user2 = await fetchUsersById(res);
                    temp.push(user2)
                }catch(e) {
                    alert(e);
                    this.setState({loading: false})
                }
            }
            this.setState({arr_interested: temp})
        }
        if(item.not.length > 0) {
            const temp = [];
            for(let res of item.not) {
                try {
                    var user3 = await fetchUsersById(res);
                    temp.push(user3);
                }catch(e) {
                    alert(e);
                    this.setState({loading: false})
                }
            }
            this.setState({arr_not: temp})
        }
        this.setState({loading: false});
    }

    renderItem(row) {
        const {item} = row;
        return (
            <View style={styles.itemContainer}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ImageBackground style={styles.photoImg} imageStyle={{borderRadius: 20}} source={item.photoURL?{uri:item.photoURL}: require('../../assets/profile-blank.png')}>
                        <Image style={styles.flagImg} source={{uri:`https://www.countryflags.io/${item.country}/shiny/64.png` }} />
                    </ImageBackground>
                    <Text style={styles.itemTxt}>{item.name}</Text>
                </View>
                <TouchableOpacity style={styles.followBtnContainer}>
                    <Text style={styles.followTxt}>Follow</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { loading, arr_going, arr_interested, arr_not } = this.state;
        console.log("array going=>", arr_going);
        if(loading) {
            <View style={styles.emptyContainer}>
                <ActivityIndicator size='large' color={colors.mainPurple} />
            </View>
        }
        return (
            <View style={styles.container}>
                <NavigationEvents onDidFocus={this.initValues.bind(this)} />
                <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={styles.backBtn}>
                    <Ionicons 
                        name="md-arrow-back"
                        size={25}
                        color={colors.mainPurple}
                    />
                </TouchableOpacity>
                <Container>
                    <Tabs tabBarUnderlineStyle={styles.tabUnderLine} tabStyle={{backgroundColor:colors.cerise}} >
                        <Tab heading='Going' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                            {(!loading && arr_going.length > 0) &&
                                <FlatList 
                                    data={arr_going}
                                    keyExtractor={(item) => item}
                                    renderItem={this.renderItem.bind(this)}
                                />
                            }
                            {(!loading && arr_going.length == 0) &&
                                <Text>No Going users</Text>
                            }
                            {loading &&
                                <ActivityIndicator size="small" />
                            }
                        </Tab>
                        <Tab heading='Interested' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                            {(!loading && arr_interested.length > 0) &&
                                <FlatList 
                                    data={arr_interested}
                                    keyExtractor={(item) => item}
                                    renderItem={this.renderItem.bind(this)}
                                />
                            }
                            {(!loading && arr_interested.length == 0) &&
                                <Text>No interested users</Text>
                            }
                            {loading &&
                                <ActivityIndicator size="small" />
                            }
                        </Tab>
                        <Tab heading='Not interested' tabStyle={styles.inactiveTab} activeTabStyle={styles.activeTab} textStyle={styles.inactiveText} activeTextStyle={styles.activeText}>
                            {(!loading && arr_not.length > 0) &&
                                <FlatList 
                                    data={arr_not}
                                    keyExtractor={(item) => item}
                                    renderItem={this.renderItem.bind(this)}
                                />
                            }
                            {(!loading && arr_not.length == 0) &&
                                <Text>No interested users</Text>
                            }
                            {loading &&
                                <ActivityIndicator size="small" />
                            }
                        </Tab>
                    </Tabs>
                </Container>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: colors.paleGray
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backBtn: {
        alignSelf: 'flex-start',
        paddingLeft: 20,
        marginVertical: 10
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
        fontSize: 16,
    },
    inactiveText: {
        color: colors.inactiveText,
        fontFamily: 'PoppinsBold',
        fontSize: 16
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
    },
    photoImg: {
        height: 40,
        width: 40,
    },
    flagImg: {
        height: 16,
        width: 16,
        position: 'absolute',
        right: -5,
        bottom: -5
    },
    itemTxt: {
        color: colors.dusk,
        fontFamily: 'PoppinsBold',
        fontSize: 14,
        marginLeft: 20
    },
    followBtnContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.mainPurple,
        borderRadius: 5,
    },
    followTxt: {
        color: colors.white,
        fontFamily: 'PoppinsBold',
        fontSize: 11
    }
})