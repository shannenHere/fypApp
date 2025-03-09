import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const AccountScreen = () => {
    return (
        <View style={{flex:1}}>
            <View style={globalStyles.container}>
                <HeaderComponent title="Account" showBackButton={true}/>
                <Text>Account Screen</Text>
            </View>
        </View>
    );
};

export default AccountScreen;
