import React, { Component } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import ProfileImage from './ProfileImage';
import * as colors from '../constants/colors';

const Row = (props) => (
    <View style={{ marginTop: 5, flexDirection: 'row' }}>
        <FontAwesome name={props.icon} size={12}/>
        <Text style={[{marginLeft: 10}, styles.eventDetailText]}>{props.text}</Text>
    </View>
);

export default class PostFeed extends Component{
    render(){
        const { photoURL, displayName } = this.props.user;
        const { name, date, state, city, distance, comment } = this.props.post;
        const uri = 'https://firebasestorage.googleapis.com/v0/b/sportify-api.appspot.com/o/profile-images%2F86QVTfgh9TZBFtmWWeDUFAn6Pv33.jpg?alt=media&token=146fd2d0-b5a5-4304-afbf-4c62a77b53a2';
        return (
            <View style={styles.container}>
                <View style={styles.userContainer}>
                    <ProfileImage 
                        size={60}
                        source={{uri:photoURL}}/>
                    <Text style={styles.userName}>{displayName}</Text>
                </View>
                <View style={styles.eventDetailContainer}>
                    <Text style={styles.eventName}>{name}</Text>
                    <Row icon={'calendar'} text={date}/>
                    <Row icon={'map-pin'} text={city+', '+state}/>
                    <Row icon={'pencil'} text={comment}/>
                </View>
                <Image 
                    style={styles.image}
                    source={{ uri: uri }}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    eventDetailContainer: {
        padding: 10,
    },
    userName: {
        marginLeft: 10,
    },
    eventName: {
        color: '#005872',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    eventDetailText: {
        color: colors.primary,
    },
    image: {
        width: '100%',
        height: 300,
    }
});