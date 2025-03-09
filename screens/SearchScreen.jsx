import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const SearchScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Search" showBackButton={true}/>
            <Text>Search Screen</Text>
        </View>
    );
};

export default SearchScreen;
