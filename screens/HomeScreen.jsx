import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const HomeScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent />
            <Text>Home Screen</Text>
        </View>
    );
};

export default HomeScreen;
