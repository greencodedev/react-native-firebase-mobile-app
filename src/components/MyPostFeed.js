import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert } from 'react-native';
import Hr from "react-native-hr-component";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import ProfileImage from './ProfileImage';
import * as colors from '../constants/colors';

const Row = (props) => (
    <View style={ styles.eachView }>
        <MaterialIcons name={props.icon} size={16} color={colors.mainPurple} />
        <Text style={ styles.eachText }>{props.text}</Text>
    </View>
);

export default class MyPostFeed extends Component{
    constructor(props){
        super(props)
        console.log(props)
        state = {
            itemIdx: props.itemIdx
        }
    }

    
    handleItemPress() {
        // Alert.alert(this.state.itemIdx);
    }

    render(){
        // const itemIdx = this.props.itemIdx;
        const { uid, title, content,  comments, liked, shared } = this.props.post;
        const uri = 'https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/profile-images%2F86QVTfgh9TZBFtmWWeDUFAn6Pv33.jpg?alt=media&token=146fd2d0-b5a5-4304-afbf-4c62a77b53a2';
        return (
            <View style={styles.container} key={uid}>
                <TouchableOpacity onPress={this.handleItemPress(this)} >
                    <View style={styles.feedContainer} >
                        <Text style={styles.title}>{title}</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.feedDetailContainer}>
                    <Row icon={'favorite'} text={liked+' Liked'}/>
                    <Row icon={'comment'} text={comments+' Comments'}/>
                    <Row icon={'share'} text={shared+' Shared'}/>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Text style={styles.contentText}>{content}</Text>
                </View>
                <Hr text="" lineColor={ colors.mediumGrey } style={styles.hr}/>
                <TouchableOpacity onPress={this.handleItemPress(this)}>
                    <Image source={{uri:uri}} style={styles.image} PlaceholderContent={<ActivityIndicator />}/>
                </TouchableOpacity>
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    feedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    feedDetailContainer: {
        flexDirection: 'row',
        fontFamily: "PoppinsBold",
        fontSize: 8,
        color: colors.mainPurple
    },
    title: {
        marginTop: 8,
        fontFamily: "PoppinsBold",
        fontSize: 20,
        textAlign: 'center',
        color: colors.mainPurple,
    },
    eventName: {
        color: '#005872',
        fontSize: 14,
        fontFamily: "PoppinsBold",
    },

    image: {
        width: '100%',
        height: 300,
        marginTop:12,
    },

    contentText: {
        fontFamily: "PoppinsBold",
        fontSize: 12,
        color: colors.mediumGrey
    },
    eachText: {
        marginLeft: 2, 
        fontSize: 8, 
        color: colors.mainPurple, 
        fontFamily: "PoppinsBold"
    },
    eachView: {
        marginTop: 16, 
        marginLeft: 5,
        flexDirection: "row",
        fontSize:16,
        justifyContent: "center",
        alignItems: "center"
    }
});