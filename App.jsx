import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { RightDrawerProvider, RightDrawerContext } from './src/contexts/RightDrawerContext';
import { AuthProvider } from "./src/contexts/AuthContext";
import { AppListProvider } from "./src/contexts/AppListContext"; 
import HeaderComponent from './src/components/Header';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreen';
import LogoutScreen from './src/screens/LogOutScreen';
import AppDetailsScreen from "./src/screens/AppDetailsScreen";

import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from '@react-navigation/native';
import { globalStyles } from './src/styles/styles';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const CustomLeftDrawerContent = ({ navigation }) => {

    return (
        <View style={globalStyles.container}>
            <TouchableOpacity
                onPress={() => {
                    navigation.dispatch(DrawerActions.closeDrawer());  // Close Left Drawer
                }}
                style={[globalStyles.closeButton, { right: 10 }]}>
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

const LeftDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomLeftDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    width: 200, // Adjust this value to make the drawer narrower
                },
                drawerPosition: 'left', // Ensure this is on the left
                headerShown: false, // Hide header if using custom UI
            }}
        >
            <Drawer.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Home" showBackButton={true} navigation={navigation} />,
                })}
            />
            <Drawer.Screen
                name="Search"
                component={SearchScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Search" showBackButton={true} navigation={navigation} />,
                })}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Settings" showBackButton={true} navigation={navigation} />,
                })}
            />
            <Drawer.Screen
                name="Account"
                component={AccountScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Account" showBackButton={true} navigation={navigation} />,
                })}
            />
            <Drawer.Screen
                name="Login"
                component={LoginScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Login" showBackButton={true} navigation={navigation} />,
                })}
            />
            <Drawer.Screen
                name="CreateAccount"
                component={CreateAccountScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Create Account" showBackButton={true} navigation={navigation} />,
                })}
            />
            <Drawer.Screen
                name="Logout"
                component={LogoutScreen}
                options={({ navigation }) => ({
                    header: () => <HeaderComponent title="Logout" showBackButton={true} navigation={navigation} />,
                })}
            />
        </Drawer.Navigator>
    );
};

const CustomRightDrawerContent = () => {
    const navigation = useNavigation();
    const { closeRightDrawer } = useContext(RightDrawerContext);

    return (
        <View style={globalStyles.container}>
            <TouchableOpacity
                onPress={() => {
                    closeRightDrawer();  // Close Right Drawer
                    navigation.dispatch(DrawerActions.closeDrawer());  // Close Left Drawer
                }}
                style={[globalStyles.closeButton, { right: 10 }]}>
                <Icon name="close" size={30} style={globalStyles.iconColor} />
            </TouchableOpacity>
            <View style={globalStyles.itemsContainer}>
                <TouchableOpacity onPress={() => { navigation.navigate('Login'); closeRightDrawer(); }} style={globalStyles.item}>
                    <Text style={globalStyles.text}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('CreateAccount'); closeRightDrawer(); }} style={globalStyles.item}>
                    <Text style={globalStyles.text}>Create Account</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Logout'); closeRightDrawer(); }} style={globalStyles.item}>
                    <Text style={globalStyles.text}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const RightDrawerNavigator = ({ navigation }) => {
    return (
        <RightDrawerProvider navigation={navigation}>
            <Drawer.Navigator
                drawerContent={(props) => <CustomRightDrawerContent {...props} />}
                screenOptions={{
                    drawerStyle: { width: 200 },
                    drawerPosition: 'right',
                }}
            >
                <Drawer.Screen 
                    name="Main" 
                    component={LeftDrawerNavigator} 
                    options={{ headerShown: false }} 
                />
            </Drawer.Navigator>
        </RightDrawerProvider>
    );
};

const App = () => {
    return (
        <AppListProvider>
            <AuthProvider>
                <RightDrawerProvider>
                    <NavigationContainer>
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="RightDrawer" component={RightDrawerNavigator} />
                            <Stack.Screen name="AppDetailsScreen" component={AppDetailsScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </RightDrawerProvider>
            </AuthProvider>
        </AppListProvider>
    );
};

export default App;