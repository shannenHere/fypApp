import React, {useState, useEffect, useCallback} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import InstalledAppsList from '../components/InstalledAppsList';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 

const API_URL = 'http://10.0.2.2:5000';

const HomeScreen = () => {
    //const { user } = useAuth();
    const user = true;
    const [searchText, setSearchText] = useState('');
    const [installedSearchText, setInstalledSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
          // Cleanup function: clear fields when screen loses focus.
          return () => {
            setSearchText("");
          };
        }, [])
    );

    useEffect(() => {
    }, []);     

    const handleCategoryPress = (category) => {
    // If the same category is clicked again, deselect it (set to default)
    if (selectedCategory === category) {
        setSelectedCategory('All'); // Deselect when the same button is clicked
    } else {
        setSelectedCategory(category); // Set the new selected category
    }
    };

    const handleSearchPress = () => {
        if (searchText.trim() !== '') {
            navigation.navigate('Search', { query: searchText });
        }
    };

    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Privacy Rating App" showBackButton={false}/>
            <View style={globalStyles.screenContainer}>
                <View style={styles.homeSearch}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search for An App..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />

                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText("")} style={styles.searchIcon}>
                            <Icon name="times" style={styles.clearIcon} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={handleSearchPress}>
                        <Icon name="search" style={styles.searchIcon} />
                    </TouchableOpacity>
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
                            {installedSearchText.length > 0 && (
                                <TouchableOpacity onPress={() => setInstalledSearchText("")} style={styles.searchIcon}>
                                    <Icon name="times" style={styles.clearIcon} />
                                </TouchableOpacity>
                            )}
                            <Icon name="search" style={styles.searchIcon}/>
                    </View>

                    {/* Installed Apps Section - Only Visible If User is Logged In */}
                    {user ? (
                        <View style={styles.installedAppsGrid}>
                            <InstalledAppsList filterText={installedSearchText} category={selectedCategory}/>
                        </View>
                    ) : (
                         // Show message if user is not logged in
                        <View style={styles.loginPrompt}>
                            <Text style={styles.loginPromptText}>Log in to see ratings for installed apps and manage permissions easily.</Text>
                            <View style={styles.loginButtonContainer}>
                                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.loginButtonText}>Log In</Text>
                                    <Icon name="angle-right" size={20} style={styles.loginIcon}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    homeSearch: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 10,
        marginTop: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 90,
        height: 30,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: {
        fontSize: 20,
        color: "#333",
        marginRight: 10,
    },
    installedAppsTitle: {
        fontSize: 30,
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
        paddingHorizontal: 0,
      },
      categoryButton: {
        width: 40,
        height: 30,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 3,
        borderColor: 'black',
        backgroundColor: '#d7d7d7',
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
        marginHorizontal: 1,
        height: 30,
        width: 70,
        backgroundColor: '#d7d7d7',
        borderColor: 'black',
        borderWidth: 0.5,
      },
      textSelected: {
        color: 'white',
      },
      textUnselected: {
        color: 'black',
      },
      installedAppsSearch: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 100,
        marginBottom: 10,
        height: 30,
      },
      installedAppsGrid: {
        top: -20,
        flex: 1,
      },
    loginPrompt: { 
        alignItems: 'center', 
        width: 290,
        height: 300,
        paddingTop: 85,
        borderSize: 0.5,
        borderWidth: 1,
        borderColor: '#cccbca',
        paddingHorizontal: 20,
    },
    loginPromptText: { 
        fontSize: 16, 
        fontStyle: "italic",
        color: 'grey',
    },
    loginButtonContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 15,
    },
    loginButton: { 
        backgroundColor: '#007AFF', 
        paddingHorizontal: 20, 
        paddingVertical: 4,
        borderRadius: 3, 
        marginTop: 10 ,
        width: 160,
        flexDirection: 'row',
        justifyContent: "space-between",
        alignContent: "right",
        height: 30,
        borderWidth: 0.5,
        
    },
    loginButtonText: { 
        fontSize: 15,
        color: 'white',
    },
    loginIcon: {
        left: 5,
        color: "white",
        bottom: 1,
    }
});

export default HomeScreen;
