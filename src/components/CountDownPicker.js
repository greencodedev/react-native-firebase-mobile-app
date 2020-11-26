import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

class TimeElementPicker extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initialValue ? props.initialValue : 0,
    };
  }
  UNSAFE_componentWillReceiveProps(props){
    if(props.initialValue){
        this.setState({
            ...this.state,
            value: props.initialValue,
        });
    }
  }
  render() {
    const firstDigit = parseInt(this.state.value) % 10;
    const secondDigit = parseInt(this.state.value / 10);
    const displayValue = `${secondDigit} ${firstDigit}`;
    const { style, ...otherProps } = this.props;
    const buttonSize = 16;
    return (
      <View {...otherProps} style={[style, styles.elementContainer]}>
        <TouchableOpacity
          style={styles.elementButton}
          onPress={this.handleDecrement.bind(this)}>
          <FontAwesome
            name="minus"
            size={buttonSize}
            style={{ color: 'white' }}
          />
        </TouchableOpacity>
        <Text style={styles.elementText}>{displayValue}</Text>
        <TouchableOpacity
          style={styles.elementButton}
          onPress={this.handleIncrement.bind(this)}>
          <FontAwesome
            name="plus"
            size={buttonSize}
            style={{ color: 'white' }}
          />
        </TouchableOpacity>
      </View>
    );
  }
  handleIncrement() {
    if (this.state.value < 99) this.handleChange(this.state.value + 1);
  }
  handleDecrement() {
    if (this.state.value > 0) this.handleChange(this.state.value - 1);
  }
  handleChange(newValue) {
    this.setState({ value: newValue }, () => {
      if (this.props.onChange) this.props.onChange(this.state.value);
    });
  }
}

export default class CountDownPicker extends PureComponent {
  UNSAFE_componentWillReceiveProps(props){
    if(props['initialValue']){
      const { initialValue } = props;
      const state = {
        ...this.state,
      };
      const splited = initialValue.split(':');
      const value = {
        hour: parseInt(splited[0]),
        minute: parseInt(splited[1]),
        second: parseInt(splited[2]),
      };
      this.fields.map(field => (state[field] = value[field]));
      this.setState(state);
    }
  }
  constructor(props) {
    super(props);
    this.fields = ['hour', 'minute', 'second'];
    const state = {};
    const { initialValue } = props;
    let value = {
      hour: 0,
      minute: 0,
      second: 0,
    };
    if (initialValue) {
      const splited = initialValue.split(':');
      value = {
        hour: parseInt(splited[0]),
        minute: parseInt(splited[1]),
        second: parseInt(splited[2]),
      };
    }
    this.fields.map(field => (state[field] = value[field]));
    this.state = state;
    this.handleElementChange.bind(this);
    if (props.onTimeChange) {
      this.onTimeChange = props.onTimeChange;
    }
  }
  render() {
    const { style, ...otherProps } = this.props;
    console.log('this.state',this.state);
    return (
      <View {...otherProps} style={[styles.container, style]}>
        {this.fields.map((field, index) => (
          <TimeElementPicker
            key={`${index}`}
            style={{ margin: 5 }}
            onChange={value => this.handleElementChange(field, value)}
            initialValue={this.state[field]}
          />
        ))}
      </View>
    );
  }
  handleElementChange(key, value) {
    this.setState({ ...this.state, [key]: value }, () => {
      const time = `${this.state.hour}:${this.state.minute}:${
        this.state.second
      }`;
      if (this.props.onChange) this.props.onChange(time);
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // alignItems: 'space-between',
  },
  elementContainer: {
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementText: {
    marginRight: 5,
    marginLeft: 5,
    backgroundColor: '#FFF',
    padding: 10,
    fontSize: 20,
    borderRadius: 5,
  },
  elementButton: {
    backgroundColor: 'gray',
    padding: 5,
  },
});
