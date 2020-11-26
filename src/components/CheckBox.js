import React, { Component } from 'react';
import { StyleSheet, Platform, TouchableOpacity, CheckBox } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export class CheckBoxIOS extends Component{
    constructor(props){
        super(props);
        this.state = {
            value: props.value,
        }
    }
    UNSAFE_componentWillReceiveProps({ value }){
        this.setState({ value });
    }
    handlePress(){
        const value = !this.state.value;
        this.setState({ value });
        if(this.props.onValueChange)
            this.props.onValueChange(value);
    }
    render(){
        const checked = this.props.value;
        const styles = StyleSheet.create({
            container: {
                borderRadius: 2,
                borderWidth: 2,
                borderColor: checked ? 'green' : 'gray',
                backgroundColor: checked ? 'green' : 'transparent',
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
            }
        });
        return(
            <TouchableOpacity 
                onPress={this.handlePress.bind(this)}
                style={styles.container}>
                { checked && <Ionicons size={20} name='md-checkmark' color='#FFFFFF' /> }
            </TouchableOpacity>
        );
    }
}
export default Platform.select({
    ios: CheckBoxIOS,
    android: CheckBox,
});