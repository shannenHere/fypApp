import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import { Picker } from "@react-native-picker/picker";
import { useAuth } from '../contexts/AuthContext';
import { useAppList } from "../contexts/AppListContext"; 
import { useTheme } from "../contexts/ThemeContext";
import { getAppIds, getAppDetails } from "../api/api"; 

const SettingsScreen = () => {
    const { theme, toggleTheme, themeColors } = useTheme(); // Use the theme and themeColors

    const themeStyles = {
        backgroundColor: themeColors.background, // Use background color from themeColors
        color: themeColors.text, // Use text color from themeColors
    };

    const { user } = useAuth();
    const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
    const [selectedAction, setSelectedAction] = useState("permission_category");

    const [selectedFilterCategory, setSelectedFilterCategory] = useState('Permission');
    const [selectedPermissionType, setSelectedPermissionType] = useState('Camera');
    const [selectedPermissionFilterCategory, setSelectedPermissionFilterCategory] = useState("All");

    const [selectedCategoryType, setSelectedCategoryType] = useState('Social');
    const [selectedCategoryFilterCategory, setSelectedCategoryFilterCategory] = useState("All");

    const [apps, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);

    const [selectedTheme, setSelectedTheme] = useState("Light");

    useEffect(() => {
        const fetchApps = async () => {
          try {
             // Step 1: Get all app IDs
            const appIds = await getAppIds();
            setApps(appIds);
          } catch (error) {
            console.error("Error fetching apps:", error);
          } 
        };
    
        fetchApps();
      }, []);
    
    // Filter apps when the selection changes
useEffect(() => {
    let filtered = [...apps];

    if (selectedFilterCategory === "Permission") {
        filtered = apps.filter(app => app.permissions?.includes(selectedPermissionType));
        if (selectedPermissionFilterCategory === "Installed Apps") {
            filtered = filtered.filter(app =>
                installedAppsInDB.some(installed => installed.packageName === app.app_id)
            );
        }
    } else if (selectedFilterCategory === "Category") {
        filtered = apps.filter(app => app.category === selectedCategoryType);
        if (selectedCategoryFilterCategory === "Installed Apps") {
            filtered = filtered.filter(app =>
                installedAppsInDB.some(installed => installed.packageName === app.app_id)
            );
        }
    }
    setFilteredApps(filtered);
}, [selectedFilterCategory, selectedPermissionType, selectedCategoryType, selectedPermissionFilterCategory, selectedCategoryFilterCategory, apps, installedAppsInDB]);    

    const handlePermissionCategoryPress = (filterCategory) => {
        // If the same category is clicked again, deselect it (set to default)
        if (selectedFilterCategory === filterCategory) {
            setSelectedFilterCategory('Permission'); // Deselect when the same button is clicked
        } else {
            setSelectedFilterCategory(filterCategory); // Set the new selected category
        }
        };

    const handlePermissionFilterPress = (filterCategory) => {
        // If the same category is clicked again, deselect it (set to default)
        if (selectedPermissionFilterCategory === filterCategory) {
            setSelectedPermissionFilterCategory('All'); // Deselect when the same button is clicked
        } else {
            setSelectedPermissionFilterCategory(filterCategory); // Set the new selected category
        }
        };
    
    const handleCategoryFilterPress = (filterCategory) => {
        // If the same category is clicked again, deselect it (set to default)
        if (selectedCategoryFilterCategory === filterCategory) {
            setSelectedCategoryFilterCategory('All'); // Deselect when the same button is clicked
        } else {
            setSelectedCategoryFilterCategory(filterCategory); // Set the new selected category
        }
        };

    return (
        <View style={[globalStyles.container]}>
            <HeaderComponent title="Settings" showBackButton={true}/>
            <View style={[styles.container]}>
                <Text style={styles.actionText}>Select an Action: </Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedAction}
                        onValueChange={(itemValue) => setSelectedAction(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.itemStyle}
                    >
                        <Picker.Item style={{fontSize:13, color: "black"}} label="Filter Apps by Permissions/Category"  value="permission_category"/>
                        <Picker.Item style={{fontSize:13}} label="Change Theme" value="theme" />
                        <Picker.Item style={{fontSize:13}} label="Suggest Feedback" value="feedback" />
                        <Picker.Item style={{fontSize:13}} label="Change Password" value="password" />
                        <Picker.Item style={{fontSize:13}} label="Delete Account" value="delete" />
                    </Picker>
                </View>


                    {selectedAction === "permission_category" && (
                        <View style={styles.selectedActionContainer}>
                            <View style={styles.installAppsRow}>
                                    {/* Left Column: "Permissions" button */}
                                    <View style={styles.leftColumn}>
                                        <TouchableOpacity
                                        style={[
                                            styles.categoryButton,
                                            selectedFilterCategory === 'Permission' && styles.categoryButtonSelected
                                        ]}
                                        onPress={() => handlePermissionCategoryPress('Permission')}
                                        >
                                            <Text
                                                style={[
                                                styles.selectedinstalledAppsButtonsText,
                                                selectedFilterCategory === 'Permission' ? styles.textSelected : styles.textUnselected
                                                ]}
                                            >
                                                Permission
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
            
                                    {/* Right Column: "Category" buttons */}
                                    <View style={styles.rightColumn}>
                                        <View style={styles.installedAppsCategory}>
                                        {['Category'].map((filterCategory) => (
                                            <TouchableOpacity
                                            key={filterCategory}
                                            style={[
                                                styles.installedAppsButtons,
                                                selectedFilterCategory === filterCategory && styles.categoryButtonSelected
                                            ]}
                                            onPress={() => handlePermissionCategoryPress(filterCategory)}
                                            >
                                            <Text
                                                style={[
                                                styles.installedAppsButtonsText,
                                                selectedFilterCategory === filterCategory ? styles.textSelected : styles.textUnselected
                                                ]}
                                            >
                                                {filterCategory}
                                            </Text>
                                            </TouchableOpacity>
                                        ))}
                                        </View>
                                    </View>
                                </View>
                                {selectedFilterCategory === "Permission" && (
                                    <View>
                                        <Text style={styles.actionText}>Select a Permission Type: </Text>
                                            <View style={styles.pickerContainer}>
                                                <Picker
                                                    selectedValue={selectedPermissionType}
                                                    onValueChange={(itemValue) => setSelectedPermissionType(itemValue)}
                                                    style={styles.picker}
                                                    itemStyle={styles.itemStyle}
                                                >
                                                    <Picker.Item style={{fontSize:13, color: "black"}} label="Camera"  value="Camera"/>
                                                    <Picker.Item style={{fontSize:13}} label="Contacts" value="Contacts" />
                                                    <Picker.Item style={{fontSize:13}} label="Microphone" value="Microphone" />
                                                    <Picker.Item style={{fontSize:13}} label="Network-based" value="Network-based" />
                                                    <Picker.Item style={{fontSize:13}} label="Photos/Media/Files" value="Photos/Media/Files" />
                                                    <Picker.Item style={{fontSize:13}} label="Other" value="Other" />
                                                </Picker>
                                            </View>
                                            <View style={styles.filterTitleContainer}>
                                                <Text style={styles.filterTitle}>Permission - {selectedPermissionType}</Text>
                                                <Text style={styles.totalText}>Total items: {filteredApps.length}</Text>
                                            </View>
                                            <View style={styles.installAppsRow}>
                                    {/* Left Column: "All" button */}
                                    <View style={styles.leftColumn}>
                                        <TouchableOpacity
                                        style={[
                                            styles.categoryButton,
                                            selectedPermissionFilterCategory === 'All' && styles.categoryButtonSelected
                                        ]}
                                        onPress={() => handlePermissionFilterPress('All')}
                                        >
                                            <Text
                                                style={[
                                                styles.selectedinstalledAppsButtonsText,
                                                selectedPermissionFilterCategory === 'All' ? styles.textSelected : styles.textUnselected
                                                ]}
                                            >
                                                All (Database Apps)
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
            
                                    {/* Right Column: "Installed App" buttons */}
                                    <View style={styles.rightColumn}>
                                        <View style={styles.installedAppsCategory}>
                                        {['Installed Apps'].map((filterCategory) => (
                                            <TouchableOpacity
                                            key={filterCategory}
                                            style={[
                                                styles.installedAppsButtons,
                                                selectedPermissionFilterCategory === filterCategory && styles.categoryButtonSelected
                                            ]}
                                            onPress={() => handlePermissionFilterPress(filterCategory)}
                                            >
                                            <Text
                                                style={[
                                                styles.installedAppsButtonsText,
                                                selectedPermissionFilterCategory === filterCategory ? styles.textSelected : styles.textUnselected
                                                ]}
                                            >
                                                {filterCategory}
                                            </Text>
                                            </TouchableOpacity>
                                        ))}
                                        </View>
                                    </View>
                                </View>
                                <ScrollView style={styles.sectionContentScrollView}>
                                {filteredApps.map((app, index) => (
                                <View key={index} style={styles.appItem}>
                                    <Text style={styles.appName}>{app.app_name}</Text>
                                    <Text style={styles.appDetails}>{app.permissions.join(", ")}</Text>
                                </View>
                                ))}
                                </ScrollView>
                                    </View>
                                )}
                                {selectedFilterCategory === "Category" && (
                                    <View>
                                        <Text style={styles.actionText}>Select an App Genre (Category): </Text>
                                            <View style={styles.pickerContainer}>
                                                <Picker
                                                    selectedValue={selectedCategoryType}
                                                    onValueChange={(itemValue) => setSelectedCategoryType(itemValue)}
                                                    style={styles.picker}
                                                    itemStyle={styles.itemStyle}
                                                >
                                                    <Picker.Item style={{fontSize:13, color: "black"}} label="Social"  value="Social"/>
                                                    <Picker.Item style={{fontSize:13}} label="Communication" value="Communication" />
                                                    <Picker.Item style={{fontSize:13}} label="Entertainment" value="Entertainment" />
                                                    <Picker.Item style={{fontSize:13}} label="Education" value="Education" />
                                                    <Picker.Item style={{fontSize:13}} label="Lifestyle" value="Lifestyle" />
                                                    <Picker.Item style={{fontSize:13}} label="Food & Drink" value="Food & Drink" />
                                                    <Picker.Item style={{fontSize:13}} label="Maps & Navigation" value="Maps & Navigation" />
                                                    <Picker.Item style={{fontSize:13}} label="Productivity" value="Productivity" />
                                                    <Picker.Item style={{fontSize:13}} label="Shopping" value="Shopping" />
                                                    <Picker.Item style={{fontSize:13}} label="Tools" value="Tools" />
                                                </Picker>
                                            </View>
                                            <View style={styles.filterTitleContainer}>
                                            <Text style={styles.filterTitle}>Category - {selectedCategoryType}</Text>
                                            <Text style={styles.totalText}>Total items: {filteredApps.length}</Text>
                                            </View>
                                            <View style={styles.installAppsRow}>
                                    {/* Left Column: "All" button */}
                                    <View style={styles.leftColumn}>
                                        <TouchableOpacity
                                        style={[
                                            styles.categoryButton,
                                            selectedCategoryFilterCategory === 'All' && styles.categoryButtonSelected
                                        ]}
                                        onPress={() => handleCategoryFilterPress('All')}
                                        >
                                            <Text
                                                style={[
                                                styles.selectedinstalledAppsButtonsText,
                                                selectedCategoryFilterCategory === 'All' ? styles.textSelected : styles.textUnselected
                                                ]}
                                            >
                                                All (Database Apps)
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
            
                                    {/* Right Column: "Installed App" buttons */}
                                    <View style={styles.rightColumn}>
                                        <View style={styles.installedAppsCategory}>
                                        {['Installed Apps'].map((filterCategory) => (
                                            <TouchableOpacity
                                            key={filterCategory}
                                            style={[
                                                styles.installedAppsButtons,
                                                selectedCategoryFilterCategory === filterCategory && styles.categoryButtonSelected
                                            ]}
                                            onPress={() => handleCategoryFilterPress(filterCategory)}
                                            >
                                            <Text
                                                style={[
                                                styles.installedAppsButtonsText,
                                                selectedCategoryFilterCategory === filterCategory ? styles.textSelected : styles.textUnselected
                                                ]}
                                            >
                                                {filterCategory}
                                            </Text>
                                            </TouchableOpacity>
                                        ))}
                                        </View>
                                    </View>
                                </View>
                                <ScrollView style={styles.sectionContentScrollView}>
                                {filteredApps.map((app, index) => (
                                <View key={index} style={styles.appItem}>
                                    <Text style={styles.appName}>{app.app_name}</Text>
                                    <Text style={styles.appDetails}>{app.category}</Text>
                                </View>
                                ))}
                                </ScrollView>
                                    </View>
                                )}
                            </View>
                    )}

                    {selectedAction === "theme" && (
                        <View style={styles.selectedActionContainer}>
                            <View style={styles.filterTitleContainer}>
                                <Text style={styles.filterTitle}>Change Theme</Text>
                                <Text style={styles.totalText}>Current Theme: {selectedTheme}</Text>
                            </View>
                            <Text style={styles.actionText}>Select a Theme: </Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedTheme}
                                    onValueChange={(itemValue) => setSelectedTheme(itemValue)}
                                    style={styles.picker}
                                    itemStyle={styles.itemStyle}
                                >
                                    <Picker.Item style={{fontSize:13, color: "black"}} label="Light"  value="Light"/>
                                    <Picker.Item style={{fontSize:13}} label="Dark" value="Dark" />
                                </Picker>
                            </View>
                        </View>
                    )}
                </View>
            </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 30,
    },
    actionText: {
        color: "black",
        fontSize: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "black",
        height: 50,
        marginBottom: 40,
    },
    label: {
        fontSize: 16,
        marginTop: 20,
        color: "black",
    },
    picker: {
      width: "100%",
      height: 50,
      marginTop: 0,
      borderWidth: 1,
      borderColor: "black",
    },
    selectedActionContainer: {
        marginTop: 0,
    },
    titleContainer: {
        backgroundColor: "#d7d7d7",
        height: 50,
        marginBottom: 10,
    },
    questionText: {
        color: "black",
        fontSize: 18,
        padding: 10,
        fontWeight: "bold",
    },
    installAppsRow: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      leftColumn: {
        flex: 1,
        justifyContent: 'center',
      },
      rightColumn: {
        justifyContent: 'center',
        paddingHorizontal: 0,
      },
      categoryButton: {
        width: 170,
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
        width: 170,
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
      filterTitleContainer: {
        backgroundColor: "#d7d7d7",
        height: 60,
        padding: 5,
        marginBottom: 10,
        marginTop: -30,
        alignItems: "center",
      },
      filterTitle: {
        color: "black",
        fontSize: 20,
        fontWeight: "bold",
      },
      totalText: {

      },
      sectionContentScrollView: {
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 5,
        paddingVertical: 3,
        height: 180,
        borderWidth: 1,
        marginBottom: 5,
      },
      appItem: {
        borderBottomWidth: 0.5,
        paddingBottom: 5,
        marginBottom: 5,
      },
      appName: {    
        color: "black",
        fontSize: 15,
      },
      appDetails: {
        fontSize: 10,
      },
});