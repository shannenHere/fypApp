import React from 'react';
import { View, Text} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const FeedbacksScreen = () => {
    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Feedbacks" showBackButton={true}/>
            <Text>Settings Screen</Text>
        </View>
    );
};

export default FeedbacksScreen;
