import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const SettingsScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent />
            <Text>Settings Screen</Text>
        </View>
    );
};

export default SettingsScreen;
