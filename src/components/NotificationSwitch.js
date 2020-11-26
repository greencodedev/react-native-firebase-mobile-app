import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default class NotificationSwitch extends Component{
    constructor(props){
        super(props);
        this.state = {
            value: props.value,
        };
    }
    handleValueChange(){
        const { value } = this.state;
        const newValue = !value;
        this.setState({
            value: newValue,
        });
        this.props.onValueChange(newValue);
    }
    render(){
        const { value } = this.state;
        const name = value ? 'bell' : 'bell-slash';
        return(
            <TouchableOpacity
                onPress={this.handleValueChange.bind(this)}>
                <FontAwesome name={name} size={24}/>
            </TouchableOpacity>
        );

    }
}