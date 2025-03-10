import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RightDrawerContext } from '../contexts/RightDrawerContext';
import { globalStyles } from '../styles/styles';

const HeaderComponent = ({ title = "Default Title", showBackButton = true }) => {
    const navigation = useNavigation();
    const { openRightDrawer } = useContext(RightDrawerContext);

    return (
    <View style={globalStyles.headerContainer}>
        {/* First Row: Hamburger & Profile Icon */}
        <View style={globalStyles.topRow}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={globalStyles.iconButton}>
                <Icon name="bars" style={globalStyles.iconStyle}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={openRightDrawer} style={globalStyles.iconButton}>
                <Icon name="user" style={globalStyles.iconStyle}/>
            </TouchableOpacity>
        </View>

        {/* Second Row: Back Button (Hidden on Home) & Title */}
        <View style={globalStyles.bottomRow}>
            <TouchableOpacity
                onPress={() => showBackButton && navigation.goBack()} // Fixed condition
                style={[globalStyles.iconButton, !showBackButton && globalStyles.hiddenButton]}
                disabled={!showBackButton} // Prevent click on Home
            >
                <Icon name="arrow-left" style={[globalStyles.backIcon, !showBackButton && globalStyles.invisible]} />
            </TouchableOpacity>
            <Text style={globalStyles.headerTitle}>{title}</Text>
        </View>
    </View>
    );
};
  

export default HeaderComponent;
