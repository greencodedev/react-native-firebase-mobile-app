import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

import * as colors from '../constants/colors';

export default class EventTabs extends Component{
    // Why we do this way? check this: https://stackoverflow.com/questions/41233458/react-child-component-not-updating-after-parent-state-change
    constructor(props){
        super(props);
        this.state = {
            activeIndex: props.tabsArray[0].id,
        }
    }

    render(){
        const { activeIndex } = this.state;
        const { tabsArray } = this.props;
        const Tabs = tabsArray.map(tab => {
            const isActive = tab.id === activeIndex;
            const styles = StyleSheet.create({
                tab: {
                    backgroundColor: isActive ? 'white' : 'transparent',
                    height: 30,
                    width: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                tabText: {
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    color: isActive ? colors.primary : 'white',
                }
            });
            return (
                <TouchableOpacity 
                    key={tab.id}
                    style={styles.tab}
                    onPress={()=> {
                        this.setState({activeIndex: tab.id});
                        this.props.onPress(tab.id);
                    }}>
                    <Text style={styles.tabText}>{tab.title}</Text>
                </TouchableOpacity>
            );
        });
        return (
            <View style={styles.tabs}>
                { Tabs }
            </View>
        );
    }
    handlePress(id){
        console.log('press',id);
        console.log('new state',this.state);
    }
}

const styles = StyleSheet.create({
    tabs: {
        flexDirection: 'row',
        borderRadius: 5,
        borderColor: 'white',
        justifyContent: 'center',
        borderWidth: 1,
    },
});