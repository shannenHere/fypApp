import React, {useState, useEffect, useCallback} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import { Picker } from "@react-native-picker/picker";
import { useAuth } from '../contexts/AuthContext';
import { useAppList } from "../contexts/AppListContext"; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAppIds, submitFeedback, changePassword, deleteUser, logOut } from "../api/api"; 

const SettingsScreen = () => {
    const { user, logOut } = useAuth();
    const navigation = useNavigation();
    const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
    const [selectedAction, setSelectedAction] = useState("permission_category");

    const [selectedFilterCategory, setSelectedFilterCategory] = useState('Permission');
    const [selectedPermissionType, setSelectedPermissionType] = useState('Camera');
    const [selectedPermissionFilterCategory, setSelectedPermissionFilterCategory] = useState("All");

    const [selectedCategoryType, setSelectedCategoryType] = useState('Social');
    const [selectedCategoryFilterCategory, setSelectedCategoryFilterCategory] = useState("All");

    const [apps, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);

    const [feedbackText, setFeedbackText] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState({ password: "", confirmPassword: ""});

    const [deleteEmail, setDeleteEmail] = useState("");
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
    
        // Check if the user is logged in
        if (user) {
            // If logged in, filter installed apps based on permissions or category selection
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
        } else {
            // If not logged in, show an alert or prompt to log in if the user clicks on "Installed Apps"
            if (selectedPermissionFilterCategory === "Installed Apps" || selectedCategoryFilterCategory === "Installed Apps") {
                // Show login prompt (or navigate to login screen)
                Alert.alert(
                    "Please log in",
                    "You need to log in to view installed apps.",
                    [
                        { 
                            text: "OK", 
                            onPress: () => { 
                                setSelectedPermissionFilterCategory("All");
                                setSelectedCategoryFilterCategory("All");
                            } 
                        } 
                    ]
                );
            }
    
            // Apply other filters based on category or permission
            if (selectedFilterCategory === "Permission") {
                filtered = apps.filter(app => app.permissions?.includes(selectedPermissionType));
            } else if (selectedFilterCategory === "Category") {
                filtered = apps.filter(app => app.category === selectedCategoryType);
            }
        }
    
        setFilteredApps(filtered);
    }, [
        user,
        selectedFilterCategory, selectedPermissionType, selectedCategoryType, 
        selectedPermissionFilterCategory, selectedCategoryFilterCategory, 
        apps, installedAppsInDB
    ]);    

    // Use useFocusEffect to clear input fields when the screen loses focus.
      useFocusEffect(
        useCallback(() => {
          // When screen is focused, do nothing.
          return () => {
            // When the screen is unfocused, reset the fields.
            resetFields();
          };
        }, [])
      );

    const resetFields = () => {
        setPassword("");
        setConfirmPassword("");
        setError({ password: "", confirmPassword: ""});
        setTouched(false);
    };

    useEffect(() => {
        if (touched) {
          validateFields();
        }
      }, [password, confirmPassword]);

    const validateFields = () => {
    setError({
        password: password
        ? /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8
            ? ""
            : "Must be at least 8 chars, 1 uppercase, 1 number."
        : "Password is required.",
        confirmPassword: confirmPassword
        ? confirmPassword === password
            ? ""
            : "Passwords do not match."
        : "Please confirm your password.",
    });
    };

    const handleChangePassword = async () => {
        setTouched(true);
        
        // Perform validation and get fresh errors
        const validationErrors = {
          password: password
            ? /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8
              ? ""
              : "Must be at least 8 chars, 1 uppercase, 1 number."
            : "Password is required.",
          confirmPassword: confirmPassword
            ? confirmPassword === password
              ? ""
              : "Passwords do not match."
            : "Please confirm your password.",
        };
      
        setError(validationErrors);
      
        // Stop if any errors exist
        if (Object.values(validationErrors).some((msg) => msg !== "")) {
          return;
        }
      
        const response = await changePassword(user.email, password);

        if (response.success) {
            Alert.alert(
                "Success", "Your password has been updated.", 
                [
                    { 
                        text: "OK", 
                        onPress: () => { resetFields(); } 
                      }                      
                ],
            );
        } else {
            Alert.alert(
                "Error", "Failed to update password.", 
                [
                    { 
                        text: "OK", 
                        onPress: () => { resetFields(); } 
                      }                      
                ],
            );
        }
    };

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

    const handleSubmitFeedback = async () => {
      if (!feedbackText.trim()) {
        Alert.alert("Error", "Feedback cannot be empty.");
        return;
      }
    
      try {
        console.log("Submitting feedback with the following data:", {
          app_id: "General",
          user_id: user.id,
          reason: feedbackText,
          status: "Pending Review.",  // or any value you set for status
          type: "General Feedback",  // or any value you set for type
        });
        
        const response = await submitFeedback("General", user.id, feedbackText, "Pending Review", "General Feedback");
    
        if (response.error) {
          console.error("Error submitting feedback:", response.error);
          Alert.alert("Error", "Failed to submit feedback.");
          return;
        }
    
        Alert.alert(
            "Success", "Feedback submitted successfully!", 
            [
                { 
                    text: "OK", 
                  }                      
            ],
        );
        
        // Clear input and refresh feedback list
        setFeedbackText("");
    
      } catch (error) {
        console.error("Error submitting feedback:", error);
        Alert.alert(
            "Error", "Something went wrong. Please try again.", 
            [
                { 
                    text: "OK", 
                  }                      
            ],
        );
      }
    };

    const handleDelete = async () => {
        if (deleteEmail === user.email) {
            Alert.alert(
                "Confirmation", 
                "Do you want to delete your account? This is permanent.", 
                [
                    { 
                        text: "Cancel", 
                        style: "cancel",
                    },     
                    { 
                        text: "Delete Account", 
                        onPress: async () => {  
                            await logOut();
                            const result = await deleteUser(user.id);
    
                            if (!result.error) {  
                                Alert.alert(
                                    "Success", 
                                    "Your account has been deleted permanently.", 
                                    [
                                        { 
                                            text: "OK", 
                                            onPress: () => navigation.goBack(),  
                                        }                      
                                    ]
                                );
                            } else {
                                Alert.alert(
                                    "Error", 
                                    "Something went wrong. Please try again.", 
                                    [
                                        { 
                                            text: "OK", 
                                        }                      
                                    ]
                                );
                            }
                        }
                    }                   
                ]
            );
        } else {
            Alert.alert(
                "Email Incorrect", 
                "Please enter the correct email and try again.", 
                [{ text: "OK" }]
            );
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

                    {selectedAction === "feedback" && (
                        <View style={styles.selectedActionContainer}>
                            {!user ? (
                                // Show message if user is not logged in
                                <View style={styles.loginPrompt}>
                                    <Text style={styles.loginPromptText}>
                                        You need to log in to submit feedback.
                                    </Text>
                                    <View style={styles.loginButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.loginButton}
                                            onPress={() => navigation.navigate("Login")}
                                        >
                                            <Text style={styles.loginButtonText}>Log In</Text>
                                            <Icon name="angle-right" size={20} style={styles.loginIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.actionText}>
                                        Submit your feedback for issues/improvements
                                    </Text>
                                    <View style={styles.textInputContainer}>
                                        <TextInput
                                            style={[
                                                globalStyles.input,
                                                { height: 100, textAlignVertical: "top", paddingTop: 10 },
                                            ]}
                                            placeholder="Enter feedback..."
                                            value={feedbackText}
                                            onChangeText={setFeedbackText}
                                            multiline
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
                                        <Text style={styles.submitButtonText}>Submit</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                    {selectedAction === "password" && (
                        <View style={styles.selectedActionContainer}>
                            {!user ? (
                                // Show message if user is not logged in
                                <View style={styles.loginPrompt}>
                                    <Text style={styles.loginPromptText}>
                                        You need to log in to change password.
                                    </Text>
                                    <View style={styles.loginButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.loginButton}
                                            onPress={() => navigation.navigate("Login")}
                                        >
                                            <Text style={styles.loginButtonText}>Log In</Text>
                                            <Icon name="angle-right" size={20} style={styles.loginIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={styles.filterTitleContainer}>
                                        <Text style={styles.filterTitle}>Change Password</Text>
                                        <Text style={styles.totalText}>User: {user.email}</Text>
                                    </View>
                                    
                                    <Text style={[styles.actionText, { marginTop: 10 }]}>
                                        Enter new password:
                                    </Text>
                                    <Text style={styles.passwordText}>
                                        *Min 8 chars, 1 uppercase, 1 number
                                    </Text>

                                    <TextInput
                                        style={globalStyles.input}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Password"
                                    />
                                    <Text style={globalStyles.errorText}>{error.password}</Text>

                                    <Text style={styles.actionText}>Re-enter new password:</Text>
                                    <TextInput
                                        style={globalStyles.input}
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="Confirm Password"
                                    />
                                    <Text style={globalStyles.errorText}>{error.confirmPassword}</Text>

                                    <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
                                        <Text style={styles.submitButtonText}>Change Password</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {selectedAction === "delete" && (
                        <View style={styles.selectedActionContainer}>
                            {!user ? (
                                // Show message if user is not logged in
                                <View style={styles.loginPrompt}>
                                    <Text style={styles.loginPromptText}>
                                        You need to log in to delete your account.
                                    </Text>
                                    <View style={styles.loginButtonContainer}>
                                        <TouchableOpacity
                                            style={styles.loginButton}
                                            onPress={() => navigation.navigate("Login")}
                                        >
                                            <Text style={styles.loginButtonText}>Log In</Text>
                                            <Icon name="angle-right" size={20} style={styles.loginIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <View style={styles.filterTitleContainer}>
                                        <Text style={[styles.filterTitle, { marginTop: 10 }]}>
                                            Delete Account
                                        </Text>
                                    </View>

                                    <Text style={[styles.actionText, { marginTop: 10 }]}>
                                        Are you sure you want to delete your account?
                                    </Text>

                                    <Text>
                                        Your feedbacks won't be deleted. They will appear to be from{" "}
                                        <Text style={{ fontStyle: "italic" }}>{"<deleted account>"}</Text>.
                                    </Text>

                                    <Text style={[styles.actionText, { marginTop: 10 }]}>
                                        Enter your email to verify:
                                    </Text>

                                    <TextInput
                                        style={globalStyles.input}
                                        value={deleteEmail}
                                        onChangeText={(text) => setDeleteEmail(text.trim().toLowerCase())}
                                        placeholder="Email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <TouchableOpacity
                                        style={[styles.submitButton, styles.deleteButton]}
                                        onPress={handleDelete}
                                    >
                                        <Text style={styles.submitButtonText}>Delete Account</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
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
      textInputContainer: {
        marginVertical: 10,
      },
      submitButton: {
        backgroundColor: '#007AFF',
        height: 30,
        borderWidth: 0.5,
        width: 120,
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginLeft: 5, 
        alignItems: "center",
        alignSelf: "flex-end",
      },
      submitButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: "bold",
      },
      passwordText: {
        fontSize: 12,
      },
      loginPrompt: { 
        alignItems: 'center', 
        width: "100%",
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