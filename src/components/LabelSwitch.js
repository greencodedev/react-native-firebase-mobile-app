import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';

import * as colors from '../constants/colors';

export default LabelSwitch = (props) => (
    <View style={styles.switchContainer}>
        <Text style={styles.switchText}>{props.label}</Text>
        <Switch 
            onValueChange={props.onValueChange}
            value={props.value}/>
    </View>
);

const styles = StyleSheet.create({
    switchContainer: {
        flexDirection: 'row',
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        borderRadius: 4,
    },
    switchText: {
        flex: 1,
        textAlignVertical: 'center',
        color: colors.primary,
    },
});