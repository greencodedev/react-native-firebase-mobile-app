import React, { Component } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share
} from "react-native";
import * as R from "ramda";
import { MaterialIcons } from "@expo/vector-icons";

import * as colors from "../constants/colors";
import { userStore } from "../stores";
import translate from "@utils/translate";
import { convert } from "@utils";
import { getUser } from "@logics/auth";
import { captureRef } from 'react-native-view-shot';
import { AchievementFilterView } from "../components";
import { Table, Row } from 'react-native-table-component';
import Constants from 'expo-constants';

export default class TrophiesScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        // headerTitle: translate("header-personal-best")
        header: null
    });
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            groups: [],
            selectedCategory: '0',
            tableData: [],
            categorylist: [],
        };
    }
    handleChangeCategory(category) {
        let temp = category;
        this.state.categorylist.map(element => {
            if (element.key == temp) {
                category = element.value;
            }
        })
        this.setState({tableData: [], selectedCategory: category});
    }
    fetch() {
        const uid = R.pathOr(
            getUser().uid,
            ["navigation", "state", "params", "uid"],
            this.props
        );
        
        if (uid) {
            this.setState({ loading: true });
            const achievements = R.filter(
                R.compose(
                R.not,
                R.isNil,
                R.prop("courseDistance")
                ),
                R.pathOr([], ["achievements", uid], userStore)
            );
            const podiums = R.filter(a => a.oveRank <= 3, achievements);
            const groups = R.groupBy(a => convert(a.courseDistance))(podiums);
            this.setState({ data: podiums, groups, loading: false });
        }
    }
    componentDidMount() {
        this.fetch();
    }
    _toggleBotttomFilterView = () => {
      this.setState({visible: !this.state.visible});
    };
    _shareSocial = async() => {
      let message = "https://itunes.apple.com/us/app/OnRun";
      let title = "Share";
      try {
        await captureRef(this._container, {
          format: 'png',
        }).then(result=> {
          Share.share({
            title: title,
            message: message,
            url: result
          });
        })
      }
      catch(error) {
        console.log(error);
      }
    }    
    render() {
        let category = [];
        Object.keys(this.state.groups).map(key => { 
            let cate = key;
            if (key == "Half marathon")
                cate = "HM";
            else if (key == "Marathon")
                cate = "MA";
            else if (key.length > 6)
                cate = key.substring(0, 5) + key.substring(key.length - 2); 
            else
                cate = key;
            this.state.categorylist.push({key: cate, value: key});
            category.push(cate);
        });
        let tableData = [];
        let tempData = [];
        if (this.state.selectedCategory !== '0' && this.state.selectedCategory !== 0) {
            tempData = this.state.groups[this.state.selectedCategory];
        } else {
            tempData = this.state.data;
        }
        tempData.map(element => {
            let rowData = [];
            rowData.push(element.ageRank);
            rowData.push(element.oveRank);
            rowData.push(element.eventName);
            rowData.push(element.courseDistance);
            rowData.push(element.eventDate);
            tableData.push(rowData);
        });
        let headers = {
            tableHead: ['Age Group', 'Overall', 'Race Name', 'Distance', 'Date'],
            widthArr: [85, 60, 200, 70, 120]
        }
        return (
            <View  collapsable={false}
                ref={view => {
                this._container = view;
                }}
                style={styles.containers}>
                <View style={styles.headerStyle}>
                    <TouchableOpacity style={{ justifyContent: 'flex-start'}} onPress={() => this.props.navigation.navigate('Profile')}>
                        <MaterialIcons name="arrow-back" color={colors.mainPurple} style={{ fontSize: 25 }} />
                    </TouchableOpacity>
                    <View style={{ justifyContent: 'center', width: '90%'}}>
                        <Text style={styles.titleStyle}>{translate("header-trophies")}</Text>
                    </View>
                    <TouchableOpacity style={{ position: 'absolute', right: 0, top: 8}} onPress={this._shareSocial}>
                        <MaterialIcons name="share" color={colors.mainPurple} style={{ fontSize: 25 }} />
                    </TouchableOpacity>
                </View>
                <AchievementFilterView
                    data={category}
                    init={0}
                    onChangeItem={this.handleChangeCategory.bind(this)}
                    type="raceCategory"
                />
                <View style={{justifyContent: 'center', flexDirection: 'row', marginTop: 30, marginBottom: 30}}>
                    <Image source={require('./../../assets/podium.png')} style={ styles.markColor }/>
                </View>
                <View style={styles.container_table}>
                    <ScrollView horizontal={true}>
                        <View>
                            <Table>
                                <Row data={headers.tableHead} widthArr={headers.widthArr} style={styles.header} textStyle={styles.headertext}/>
                            </Table>
                            <ScrollView style={styles.dataWrapper}>
                                <Table>
                                {
                                    tableData.map((rowData, index) => (
                                        <Row
                                            key={index}
                                            data={rowData}
                                            widthArr={headers.widthArr}
                                            style={[styles.row, index%2 && {backgroundColor: '#fff'}]}
                                            textStyle={styles.text}
                                        />
                                    ))
                                }
                                </Table>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    containers: {
        justifyContent: 'center', 
        marginLeft: 16, 
        marginRight: 16, 
        backgroundColor: colors.white,
        paddingTop: Constants.statusBarHeight
    },
    headerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingTop: 5,
        paddingBottom: 5,
    },
    titleStyle: {
        fontFamily: "PoppinsBold",
        fontSize: 20,
        fontStyle: "normal",
        letterSpacing: 0,
        color: colors.mainPurple,
        textAlign: 'center', 
    },
    switchSelectorStyle: {
        width: '40%', 
        fontSize: 13, 
        fontWeight: "600", 
        height: 28, 
        justifyContent: 'center', 
        alignSelf: 'center',
        marginBottom: 10,
        fontFamily: "PoppinsBold",
    },
    rowStyle: {
        flex: 1, 
        alignSelf: 'stretch', 
        flexDirection: 'row',
        borderBottomColor: colors.whiteThree,
        borderStyle: 'solid',
        borderBottomWidth: 1,
        paddingBottom: 10,
        paddingTop: 10,
    },
    rowItemStyle: {
        alignSelf: 'stretch', 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    rowTextStyle: {
        fontSize: 12,
        fontFamily: 'PoppinBold',
        letterSpacing: 0,
        textAlign: 'center'
    },
    container_table: { 
        height: '60%',
        backgroundColor: '#fff' 
    },
    header: { 
        height: 60, 
        backgroundColor: '#fff',
        borderBottomColor: colors.whiteThree,
        borderBottomWidth: 1,
        borderStyle: 'solid',
    },
    headertext: {
        color: colors.mainPurple,
        fontSize: 14,
        textAlign: 'center', 
        fontWeight: '100',
        fontFamily: 'PoppinsBold',
    },
    text: { 
        textAlign: 'center', 
        fontWeight: '100',
        color: colors.mediumGrey,
        fontSize: 14,
        fontFamily: 'PoppinsBold',
    },
    dataWrapper: { 
        marginTop: -1 
    },
    row: { 
        height: 70, 
        backgroundColor: '#fff',
        borderBottomColor: colors.whiteThree,
        borderBottomWidth: 1,
        borderStyle: 'solid',
    }
});
