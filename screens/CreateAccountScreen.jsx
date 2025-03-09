import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const CreateAccountScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent />
            <Text>Create Account Screen</Text>
        </View>
    );
};

export default CreateAccountScreen;
