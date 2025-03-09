import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { RightDrawerContext } from '../contexts/RightDrawerContext';
import { globalStyles } from '../styles/styles';

const HeaderComponent = () => {
    const navigation = useNavigation();
    const { openRightDrawer } = useContext(RightDrawerContext);

    return (
        <View style={globalStyles.headerContainer}>
            {/* Left Drawer Button */}
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={globalStyles.leftButton}>
                <Icon name="bars" size={30} color="#000" />
            </TouchableOpacity>

            {/* Right Drawer Button */}
            <TouchableOpacity onPress={openRightDrawer} style={globalStyles.rightButton}>
                <Icon name="user" size={30} color="#000" />
            </TouchableOpacity>
        </View>
    );
};

export default HeaderComponent;
