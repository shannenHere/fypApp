import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000';

const HomeScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [policyData, setPolicyData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch the policy data (all app details) from the database via API
    useEffect(() => {
        fetchPolicyData();
    }, []);

    const fetchPolicyData = async () => {
        try {
          const response = await axios.get(`${API_URL}/apps`);
          console.log('Fetched policy data:', response.data); // Verify keys here
          setPolicyData(response.data);
        } catch (error) {
          console.error('Error fetching policy data:', error);
        } finally {
          setLoading(false);
        }
      };      

    const handleAppClick = (app) => {
        Alert.alert(
          'Privacy Alert',
          `App: ${app.app_name}\nRating: ${app.rating}\nWorst Permission: ${app.worst_permissions}\nConcern: ${app.privacy_concern}`
        );
      };

    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Privacy Rating App" showBackButton={false}/>
            <View style={styles.screenContainer}>
                <View style={styles.homeSearch}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search for An App..."
                        value={searchText}
                        onChangeText={setSearchText}
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
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            <Icon name="search" style={styles.iconStyle}/>
                    </View>


                    <ScrollView 
                        showsVerticalScrollIndicator={true} 
                        style={styles.scrollView}
                    >
                        <View style={styles.gridContainer}>
                        {policyData
                            .filter(app => (app.app_name || "").toLowerCase().includes(searchText.toLowerCase()))
                            .map((app) => (
                                <TouchableOpacity
                                key={app.app_id}
                                style={styles.appContainer}
                                onPress={() => handleAppClick(app)}
                                >
                                {app.icon_url ? (
                                    <Image source={{ uri: app.icon_url }} style={styles.appIcon} />
                                ) : (
                                    <View style={[styles.appIcon, styles.missingIcon]}>
                                    <Text style={styles.missingIconText}>App no longer on Google Play Store</Text>
                                    </View>
                                )}
                                <Text style={styles.appName}>{app.app_name}</Text>
                                <Text style={styles.appRating}>{app.rating}</Text>
                                </TouchableOpacity>
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
        fontSize: 10,
        textAlign: 'center',
    },
    appRating: {
        fontSize: 10,
        color: 'red',
    },
    appPrivacyConcern: {
        fontSize: 10,
        color: 'orange',
        fontStyle: 'italic',
    },
    appWorstPermission: {
        fontSize: 10,
        color: 'purple',
    },
    missingIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ccc',
      },
      missingIconText: {
        fontSize: 8,
        textAlign: 'center',
        color: 'black',
        paddingHorizontal: 2,
      },
});

export default HomeScreen;
