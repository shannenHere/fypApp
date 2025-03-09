import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const LoginScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Log In" showBackButton={true}/>
            <Text>Log In Screen</Text>
        </View>
    );
};

export default LoginScreen;
