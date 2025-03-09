import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RightDrawerContext } from '../contexts/RightDrawerContext';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { openRightDrawer } = useContext(RightDrawerContext);

    return (
        <View style={styles.container}>
            {/* Left Drawer Button */}
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.leftButton}>
                <Icon name="bars" size={30} color="#000" />
            </TouchableOpacity>

            {/* Right Drawer Button */}
            <TouchableOpacity onPress={openRightDrawer} style={styles.rightButton}>
                <Icon name="user" size={30} color="#000" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    leftButton: {
        position: 'absolute',
        left: 10,
        top: 40,
    },
    rightButton: {
        position: 'absolute',
        right: 10,
        top: 40,
    },
});

export default HomeScreen;
