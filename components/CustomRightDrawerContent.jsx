import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../styles/styles';
import { RightDrawerContext } from '../contexts/RightDrawerContext';

const CustomRightDrawerContent = () => {
  const navigation = useNavigation();
  const { closeRightDrawer } = useContext(RightDrawerContext);

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={closeRightDrawer} style={[globalStyles.closeButton, { right: 10 }]}>
        <Icon name="close" size={30} style={globalStyles.iconColor} />
      </TouchableOpacity>
      <View style={globalStyles.itemsContainer}>
        <TouchableOpacity onPress={() => { navigation.navigate('Login'); closeRightDrawer(); }} style={globalStyles.item}>
          <Icon name="sign-in" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('CreateAccount'); closeRightDrawer(); }} style={globalStyles.item}>
          <Icon name="user-plus" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.navigate('Logout'); closeRightDrawer(); }} style={globalStyles.item}>
          <Icon name="sign-out" size={30} style={[globalStyles.icon, globalStyles.iconColor]} />
          <Text style={globalStyles.text}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomRightDrawerContent;