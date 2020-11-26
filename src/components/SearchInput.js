import React, { Component } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import * as colors from "@constants/colors";

export default class SearchInput extends Component{
    constructor(props){
        super(props);
        this.state={
            text: props.text ? props.text : '',
            placeholder: props.placeholder ? props.placeholder : '',
        }
        this.handleChangeText = this.handleChangeText.bind(this);
        this.clear = this.clear.bind(this);
    }
    handleChangeText(text){
        this.setState({ text });
        if(this.props.onChangeText)
            this.props.onChangeText(text);
    }
    clear() {
        this.setState({ text: "" });
        if(this.props.onChangeText)
            this.props.onChangeText("");
    }
    render(){
        return(
            <View style={[this.props.style,{ flexDirection: 'row', backgroundColor: colors.mainPurple, padding: 10, alignItems: 'center', borderColor: colors.white, borderWidth: 1}]}>
                <View style={{ width: '90%' }}>
                    <TextInput 
                        style={{ flex: 1, color: colors.white }} 
                        onChangeText={this.handleChangeText} 
                        value={this.state.text}
                        placeholder={this.props.placeholder}/>
                </View>
                { this.state.text == "" ? 
                    <View style={styles.iconArea}><FontAwesome name="search" size={20} color={ colors.white }/></View>
                  : <TouchableOpacity style={styles.iconArea} onPress={this.clear}><FontAwesome name="close" size ={20} color = {colors.white}/></TouchableOpacity>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    iconArea: {
        width: '10%',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
})