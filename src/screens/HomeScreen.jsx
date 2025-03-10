import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, FlatList} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = () => {
    const [text, setText] = useState('');

    const installedApps = [
        { id: '1', name: 'App #1' },
        { id: '2', name: 'App #2' },
        { id: '3', name: 'App #3' },
        { id: '4', name: 'App #4' },
        { id: '5', name: 'App #5' },
        { id: '6', name: 'App #6' },
        { id: '7', name: 'App #7' },
        { id: '8', name: 'App #8' },
        { id: '9', name: 'App #9' },
        { id: '10', name: 'App #10' },
        { id: '11', name: 'App #11' },
        { id: '12', name: 'App #12' },
        { id: '13', name: 'App #13' },
        { id: '14', name: 'App #14' },
        { id: '15', name: 'App #15' },
        { id: '16', name: 'App #16' },
        { id: '17', name: 'App #17' },
    ];

    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Privacy Rating App" showBackButton={false}/>
            <View style={styles.screenContainer}>
                <View style={styles.homeSearch}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter text here..."
                        value={text}
                        onChangeText={setText}
                    />
                    <Icon name="search" style={styles.iconStyle}/>
                </View>
                <View style={styles.installedApps}>
                    <Text style={styles.installedAppsTitle}>Installed Apps</Text>
                    <View style={styles.installAppsRow}>
                        <TouchableOpacity style={styles.selectedinstalledAppsButtons}>
                            <Text style={styles.selectedinstalledAppsButtonsText}>All</Text>
                        </TouchableOpacity>
                        <View style={styles.installedAppsCategory}>
                            <TouchableOpacity style={styles.installedAppsButtons}>
                                <Text style={styles.installedAppsButtonsText}>Good</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.installedAppsButtons}>
                                <Text style={styles.installedAppsButtonsText}>Okay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.installedAppsButtons}>
                                <Text style={styles.installedAppsButtonsText}>Bad</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.installedAppsSearch}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Search within Installed Apps..."
                                value={text}
                                onChangeText={setText}
                            />
                            <Icon name="search" style={styles.iconStyle}/>
                    </View>
                    <ScrollView 
                        showsVerticalScrollIndicator={true} 
                        style={styles.scrollView}
                    >
                        <View style={styles.gridContainer}>
                            {installedApps.map((app) => (
                                <View key={app.id} style={styles.appContainer}>
                                    <View style={styles.appIcon} />
                                    <Text style={styles.appName}>{app.name}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        left: 45,
    },
    homeSearch: {
        flexDirection: 'row',
    },
    textInput: {
        top: 10,
        padding: 5,
        width: 255,
        left: -3,
        height: 25,
        margin: 12,
        borderWidth: 1,
        borderColor:'#cccbca',
    },
    iconStyle: {
        top: 20,
        fontSize: 25,
        color: 'black',
    },
    installedApps: {
        top: 30,
        left: 10,
    },
    installAppsRow: {
        flexDirection: 'row',
        justifyContent: "space-between",
    },
    installedAppsTitle: {
        fontSize: 25,
        color: 'black',
        fontWeight: 'bold',
    },
    selectedinstalledAppsButtons: {
        top: 10,
        width: 45,
        height: 25,
        backgroundColor: '#169bd5',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 0.5,
    },
    installedAppsButtons: {
        top: 10,
        width: 60,
        height: 25,
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 0.5,
        marginHorizontal: 1, 
    },
    selectedinstalledAppsButtonsText: {
        padding: 3,
        color: 'white',
        textAlign: 'center',
        fontSize: 13,
    },
    installedAppsButtonsText: {
        padding: 3,
        color: 'black',
        textAlign: 'center',
        fontSize: 13,
    },
    installedAppsCategory: {
        flexDirection: 'row',
        right: 100,
    },
    installedAppsSearch: {
        top: 4,
        flexDirection: 'row',
        left: -10,
    },
    scrollView: {
        flexGrow: 1, // Ensures it expands properly
        top: 20,
        paddingVertical: 10,
        paddingLeft: 10,
        height: 340, 
        width: 290,
        borderWidth: 1,
        borderColor: '#cccbca',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', 
        alignItems: 'flex-start',
    },
    appContainer: {
        width: '22%', // Adjusted for 4 items per row
        alignItems: 'center',
        paddingBottom: 15,
        paddingHorizontal: 5,
        marginRight: 5,
    },
    appIcon: {
        width: 55,  // Increased size
        height: 55, 
        backgroundColor: '#ddd',
        borderWidth: 1,
        borderColor: 'black',
    },
    appName: {
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
});

export default HomeScreen;
