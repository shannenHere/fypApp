import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from '@react-navigation/native';
import { globalStyles } from '../styles/styles';

const CustomLeftDrawerContent = () => {
  const navigation = useNavigation();

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.closeDrawer())} style={[globalStyles.closeButton, { right: 10 }]}>
        <Icon name="close" size={30} style={globalStyles.iconColor} />
      </TouchableOpacity>
      <View style={globalStyles.itemsContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={globalStyles.item}>
          <Icon name="home" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={globalStyles.item}>
          <Icon name="search" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Account')} style={globalStyles.item}>
          <Icon name="user" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Account</Text>
        </TouchableOpacity>
      </View>
      <View style={globalStyles.bottomContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={globalStyles.item}>
          <Icon name="cog" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomLeftDrawerContent;