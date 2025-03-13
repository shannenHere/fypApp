import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import InstalledAppsList from '../components/InstalledAppsList';

const API_URL = 'http://10.0.2.2:5000';

const HomeScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [installedSearchText, setInstalledSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    }, []);     

    const handleAppClick = (app) => {
        Alert.alert(
          'Privacy Alert',
          `App: ${app.app_name}\nRating: ${app.rating}\nWorst Permission: ${app.worst_permissions}\nConcern: ${app.privacy_concern}`
        );
      };

      const handleCategoryPress = (category) => {
        // If the same category is clicked again, deselect it (set to default)
        if (selectedCategory === category) {
            setSelectedCategory('All'); // Deselect when the same button is clicked
        } else {
            setSelectedCategory(category); // Set the new selected category
        }
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
                        {/* Left Column: "All" button */}
                        <View style={styles.leftColumn}>
                            <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                selectedCategory === 'All' && styles.categoryButtonSelected
                            ]}
                            onPress={() => handleCategoryPress('All')}
                            >
                                <Text
                                    style={[
                                    styles.selectedinstalledAppsButtonsText,
                                    selectedCategory === 'All' ? styles.textSelected : styles.textUnselected
                                    ]}
                                >
                                    All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Right Column: "Good", "Okay", and "Bad" buttons */}
                        <View style={styles.rightColumn}>
                            <View style={styles.installedAppsCategory}>
                            {['Good', 'Okay', 'Bad'].map((category) => (
                                <TouchableOpacity
                                key={category}
                                style={[
                                    styles.installedAppsButtons,
                                    selectedCategory === category && styles.categoryButtonSelected
                                ]}
                                onPress={() => handleCategoryPress(category)}
                                >
                                <Text
                                    style={[
                                    styles.installedAppsButtonsText,
                                    selectedCategory === category ? styles.textSelected : styles.textUnselected
                                    ]}
                                >
                                    {category}
                                </Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.installedAppsSearch}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Search within Installed Apps..."
                                value={installedSearchText}
                                onChangeText={setInstalledSearchText}
                            />
                            <Icon name="search" style={styles.iconStyle}/>
                    </View>


                    <View style={styles.installedAppsGrid}>
                        <InstalledAppsList filterText={installedSearchText} category={selectedCategory}/>
                    </View>
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
    installedAppsTitle: {
        fontSize: 33,
        color: 'black',
        fontWeight: 'bold',
    },
    installedApps: {
        top: 30,
        left: 10,
    },
    installAppsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
      },
      leftColumn: {
        flex: 1,
        justifyContent: 'center',
      },
      rightColumn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        right: 95,
      },
      categoryButton: {
        width: 40,
        height: 30,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 3,
        borderColor: 'black',
        borderWidth: 0.5,
      },
      categoryButtonSelected: {
        backgroundColor: '#007AFF',
      },
      selectedinstalledAppsButtonsText: {
        fontSize: 13,
        textAlign: 'center',
        color: 'white',
      },
      installedAppsButtonsText: {
        fontSize: 13,
        textAlign: 'center',
        color: 'black',
      },
      installedAppsCategory: {
        flexDirection: 'row',
      },
      installedAppsButtons: {
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 5,
        backgroundColor: '#eee',
        borderColor: 'black',
        borderWidth: 0.5,
        marginHorizontal: 5,
        height: 30,
        width: 60,
      },
      textSelected: {
        color: 'white',
      },
      textUnselected: {
        color: 'black',
      },
      installedAppsSearch: {
        flexDirection: 'row',
        right: 10,
        top: -15,
      },
      installedAppsGrid: {
        top: -20,
        flex: 1,
      }
});

export default HomeScreen;
