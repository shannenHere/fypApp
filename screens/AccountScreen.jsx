import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const AccountScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent />
            <Text>Account Screen</Text>
        </View>
    );
};

export default AccountScreen;
