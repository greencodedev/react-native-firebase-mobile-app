import React from 'react';
import { View } from 'react-native';

export default Row = (props) => (
    <View style={[{ 
                flexDirection: 'row',
                alignItems: 'center',
            },props.style]}>
        {props.children}
    </View>
);