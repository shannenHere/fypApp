import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const LogOutScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Log Out" showBackButton={true}/>
            <Text>Log Out Screen</Text>
        </View>
    );
};

export default LogOutScreen;
