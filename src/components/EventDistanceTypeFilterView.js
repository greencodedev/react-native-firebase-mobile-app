
import React, { Component } from 'react';
import { Text, StyleSheet, FlatList,TouchableOpacity } from 'react-native';

import * as colors from '../constants/colors';

export default class EventDistanceTypeFilterView extends Component{
    constructor(props){
        super(props);
        const { filters, selected } = props;
        this.state = {
            filters,
            selected,
        }
    }
    UNSAFE_componentWillReceiveProps(props) {
        const { filters, selected } = props;
        this.setState({
            filters,
            selected,
        });
    }
    renderItem(row){
        const { item, index } = row;
        const selected = item.key === this.state.filters[this.state.selected].key;
        const styles = StyleSheet.create({
            container: {
                width: 40,
                height: 60,
                borderRadius: 3,
                backgroundColor: selected ? colors.primary : null,
                alignItems: 'center',
                justifyContent: 'center',
            },
            text: {
                color: selected ? '#FFFFFF' : '#262628',
                opacity: selected ? 1.0 : 0.42,
                fontSize: 15,
            },
        });
        return (
            <TouchableOpacity
                onPress={() => this.props.onPress(item,index) } 
                style={styles.container}>
                <Text style={styles.text}>{item.label}</Text>
            </TouchableOpacity>
        );
    }
    render(){
        return (
            <FlatList
                data={this.state.filters}
                renderItem={this.renderItem.bind(this)}
                keyExtractor={item => item.key}
                {...this.props}
                horizontal={true}/>
        );
    }
}