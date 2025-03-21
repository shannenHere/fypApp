import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { scrapePolicy, updateAppColumn, analyze, submitFeedback, updateProcessingStatus, getFeedback, addTerm } from '../api/api';
import { useStatus } from '../contexts/UpdateStatusContext';
import { globalStyles } from '../styles/styles';
import { useAuth } from "../contexts/AuthContext";

const UpdateDatabaseScreen = () => {
    const route = useRoute();
    const { app } = route.params;  
    const { user } = useAuth();
    const navigation = useNavigation();
    const [selectedReason, setSelectedReason] = useState("policy");

    const [newUrl, setNewUrl] = useState("");
    const [newPolicyText, setNewPolicyText] = useState("");

    const [sensitive_genericPicker, setSensitive_genericPicker] = useState("Sensitive");
    const [newSensitiveTerm, setNewSensitiveTerm] = useState("");
    const [newGenericTerm, setNewGenericTerm] = useState("");

    const [otherPicker, setOtherPicker] = useState("app_icon");
    const [otherItemChange, setOtherItemChange] = useState("");
    const [otherReason, setOtherReason] = useState("");

    const [newIconUrl, setNewIconUrl] = useState("");

    const showAlert = (title, message, onPressOK) => {
        Alert.alert(title, message, [
            { text: "Cancel" },
            { text: "OK", onPress: onPressOK }
        ]);
    };

    const handlePolicy = async () => {
        let reason = "";
        
        if (!newUrl && !newPolicyText) {
            // Case 1: No URL, No Policy Text
            showAlert("No input detected", "Using the existing policy URL to analyze app.", async () => {
                reason = "Reanalyze using existing policy URL";
                await submitFeedback(app.app_id, user.id, reason, "Processing", "Policy Update");
                await handleReanalyze(app, user, reason, "policy", newPolicyText || app.policy_text);
            });
        } else if (newUrl && !newPolicyText) {
            // Case 2: Only URL provided
            reason = newUrl === app.policy_url ? "Reanalyze using existing policy URL" : "Reanalyze using new policy URL";
            showAlert(
                newUrl === app.policy_url ? "Policy URL is the same" : "Updating Policy URL",
                newUrl === app.policy_url ? "Using the existing policy URL to analyze app." : "Saving the new policy URL and analyzing.",
                async () => {
                    await submitFeedback(app.app_id, user.id, reason, "Processing", "Policy Update");
                    if (newUrl !== app.policy_url) await updateAppColumn(app.app_id, "policy_url", newUrl);
                    await handleReanalyze(app, user, reason, "policy", newPolicyText || app.policy_text);
                }
            );
        } else if (!newUrl && newPolicyText) {
            // Case 3: Only Policy Text provided
            reason = newPolicyText === app.policy_text ? "Reanalyze using existing policy text" : "Reanalyze using new policy text";
            showAlert(
                newPolicyText === app.policy_text ? "Policy text is the same" : "Updating Policy Text",
                newPolicyText === app.policy_text ? "Using the existing policy text to analyze app." : "Saving the new policy text and analyzing.",
                async () => {
                    await submitFeedback(app.app_id, user.id, reason, "Processing", "Policy Update");
                    if (newPolicyText !== app.policy_text) await updateAppColumn(app.app_id, "policy_text", newPolicyText);
                    await handleReanalyze(app, user, reason, "policy", newPolicyText || app.policy_text);
                }
            );
        } else {
            // Case 4: Both URL and Policy Text provided
            const isUrlChanged = newUrl !== app.policy_url;
            const isPolicyTextChanged = newPolicyText !== app.policy_text;
            reason = isUrlChanged || isPolicyTextChanged ? "Reanalyze using new policy data" : "Reanalyze using existing policy data";
    
            showAlert(
                isUrlChanged || isPolicyTextChanged ? "Updating Policy URL and/or Text" : "No changes detected",
                isUrlChanged || isPolicyTextChanged ? "Saving the new data and analyzing." : "Using existing policy data to analyze app.",
                async () => {
                    await submitFeedback(app.app_id, user.id, reason, "Processing", "Policy Update");
                    if (isUrlChanged) await updateAppColumn(app.app_id, "policy_url", newUrl);
                    if (isPolicyTextChanged) await updateAppColumn(app.app_id, "policy_text", newPolicyText);
                    await handleReanalyze(app, user, reason, "policy", newPolicyText || app.policy_text);
                }
            );
        }
    };    
    
    const handleReanalyze = async (app, user, reason, type, newValue = null) => {
        try {
            console.log(`Starting reanalysis for ${type}...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Ensure feedback is saved
    
            // Fetch all feedback related to the app
            console.log("Fetching feedback for app_id:", app.app_id);
            const feedbackResponse = await getFeedback(app.app_id);
            console.log("Fetched feedback:", feedbackResponse);
    
            const userFeedbacks = feedbackResponse.feedback
                .filter(item => 
                    item.user_id === user.id &&
                    item.app_id === app.app_id &&
                    item.reason.trim().toLowerCase() === reason.trim().toLowerCase()
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort to get latest first
    
            const latestFeedback = userFeedbacks[0]; // Get the most recent matching feedback
            if (!latestFeedback) {
                console.error("No matching feedback ID found.", {
                    searchedReason: reason,
                    fetchedFeedbacks: feedbackResponse.feedback.map(fb => ({
                        id: fb.feedback_id,
                        reason: fb.reason,
                        date: fb.date
                    }))
                });
                return;
            }
    
            console.log("Using feedback_id:", latestFeedback.feedback_id);
            await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Processing ${type} update...`);
    
            // Handle different reanalysis types
            switch (type.toLowerCase()) {
                case "policy":
                    console.log("Scraping policy text from existing URL...");
                    const newScrapedPolicy = await scrapePolicy(app.policy_url);
    
                    if (!newScrapedPolicy || !newScrapedPolicy.policyText) {
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Scraping failed. Unable to extract policy text.");
                        return;
                    }
    
                    if (app.policy_text === newScrapedPolicy.policyText) {
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Aborted. Existing policy text not changed.");
                    } else {
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Saving the new policy text...");
                        await updateAppColumn(app.app_id, "policy_text", newScrapedPolicy.policyText);
    
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Analyzing the app with new policy text...");
                        await analyze(app.app_id).catch(err => console.error("Error during analysis:", err));
    
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Done");
                    }
                    break;
    
                case "term":
                    if (!newValue) {
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Failed. No term provided.");
                        return;
                    }
                    await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Reanalyzing using the new term '${newValue}'...`);
                    await analyze(app.app_id);
                    await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Done");
                    break;
    
                default:
                    console.error("Invalid reanalysis type:", type);
                    await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Failed. Unknown update type '${type}'.`);
                    return;
            }
    
            console.log(`${type} update process completed.`);
        } catch (error) {
            console.error("Error during reanalysis:", error);
        }
    };    
    
    const handleTerms = async (term, category) => {
        if (!term) {
            Alert.alert("No input detected", "Nothing is done.", [{ text: "OK" }]);
            return;
        }
    
        showAlert(`${category} Term Update`, "We will check if the system already has this term before updating.", async () => {
            try {
                const reason = `${category} Term Update`;
    
                // Submit feedback before processing
                await submitFeedback(app.app_id, user.id, reason, "Processing", `${category} Term Update`);
    
                console.log("Fetching feedback for app_id:", app.app_id);
                const feedbackResponse = await getFeedback(app.app_id);
                console.log("Fetched feedback:", feedbackResponse);
    
                const userFeedbacks = feedbackResponse.feedback
                    .filter(item => 
                        item.user_id === user.id &&
                        item.app_id === app.app_id &&
                        item.reason.trim().toLowerCase() === reason.trim().toLowerCase()
                    )
                    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort to get latest first
    
                const latestFeedback = userFeedbacks[0]; // Get the most recent matching feedback
                if (!latestFeedback) {
                    console.error("No matching feedback ID found.");
                    return;
                }
    
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Checking if '${term}' is already in ${category} list...`);
    
                try {
                    const response = await addTerm(term, category);
    
                    if (response.message.includes("already exists")) {
                        // **Abort processing here**
                        await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Aborted. '${term}' already exists in ${category} list.`);
                        return; // Stop further execution
                    }
    
                    await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Adding ${term} into ${category} list...`);
                    await handleReanalyze(app, user, reason, "term", term);

                } catch (error) {
                    console.error("Error adding term:", error);
                    await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Error while adding term.");
                }
            } catch (error) {
                console.error("Error in handleTerms:", error);
            }
        });
    };    

    const handleOther = () => {
        if (
            (otherPicker === "app_icon" && !newIconUrl) ||  
            (otherPicker === "other" && (!otherItemChange || !otherReason)) 
        ) {
            Alert.alert("No input detected", "Nothing is done.", [{ text: "OK" }]);
            return;
        }
    
        if (otherPicker === "app_icon") {
            showAlert(`Other - ${otherPicker} Update`, "We will check if icon URL is valid before updating.", async () => {
                await submitFeedback(app.app_id, user.id, "Change icon_url", "Processing", `Other - ${otherPicker} Update`);
                const feedbackResponse = await getFeedback(app.app_id);
    
                const userFeedbacks = (feedbackResponse.feedback || [])
                    .filter(item => 
                        item.user_id === user.id &&
                        item.app_id === app.app_id &&
                        item.reason.trim().toLowerCase() === reason.trim().toLowerCase()
                    )
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
    
                const latestFeedback = userFeedbacks[0];
                if (!latestFeedback) {
                    console.error("No matching feedback ID found.");
                    return;
                }
    
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Checking if icon URL provided is valid...`);
    
                const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|ico|svg|gif|webp))$/i;
                const googlePlayPattern = /^https?:\/\/play-lh\.googleusercontent\.com\/.*/;
    
                if (!urlPattern.test(newIconUrl) && !googlePlayPattern.test(newIconUrl)) {
                    Alert.alert("Invalid URL", "Please enter a valid image URL or a Google Play icon URL.");
                    await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Aborted. Icon URL provided is invalid.`);
                    return;
                }
    
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Updating icon URL in database...`);
                await updateAppColumn(app.app_id, "icon_url", newIconUrl);
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Done`);
            });
    
        } else {
            showAlert(`Other - ${otherPicker} Update`, "An admin will review your submission.", async () => {
                await submitFeedback(app.app_id, user.id, `Other - other: ${otherItemChange} - ${otherReason}`, "Pending Review", `Other - ${otherPicker} Update`);
            });
        }
    
        setNewIconUrl("");
        setOtherItemChange("");
        setOtherReason("");
    };        
    
    return (
        <View style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[globalStyles.iconButton]}
                >
                    <Icon name="arrow-left" style={globalStyles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Update Database</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.appInfoContainer}>
                    {/* App Icon */}
                    {app.icon_url ? (
                    <Image source={{ uri: app.icon_url }} style={styles.appIcon} />
                    ) : (
                    <View style={[styles.appIcon, styles.iconPlaceholder]}>
                        <Text style={{ color: "#888" }}>No Icon</Text>
                    </View>
                    )}
                    <View style={styles.appInfoDescContainer}>
                        <Text style={styles.appInfoDescText}>{app?.app_name}</Text>
                        <Text style={[styles.appInfoDescText, {fontSize: 12}]}>{app?.app_id}</Text>
                    </View>
                </View>

                {/* Dropdown for Reason */}
                <Text style={styles.label}>Choose a Reason for Update: </Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedReason}
                        onValueChange={(itemValue) => setSelectedReason(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.itemStyle}
                    >
                        <Picker.Item style={{fontSize:13, color: "black"}} label="Privacy Policy Outdated/Incorrect" value="policy" />
                        <Picker.Item style={{fontSize:13}} label="Sensitive/Generic Sentence Incorrect" value="sensitive_generic" />
                        <Picker.Item style={{fontSize:13}} label="Other" value="other" />
                    </Picker>
                </View>
                {selectedReason === "policy" && (
                    <View style={styles.selectedReasonContainer}>
                        <View style={{backgroundColor: "#d7d7d7", padding: 5, paddingVertical: 15,}}>
                            <Text style={[styles.questionText, {marginTop: 0}]}>Current privacy policy url to re-analyze:</Text>
                            <Text style={{color: "black", fontWeight: "bold", fontSize: 12}}>{app.policy_url}</Text>
                        </View>
                        <View>
                            <Text style={styles.questionText}>Paste the new privacy policy url here if changed (optional)</Text>
                            <TextInput
                            style={styles.input}
                            value={newUrl}
                            onChangeText={(newUrl) => {
                                setNewUrl(newUrl);
                            }}
                            autoCapitalize="none"
                            placeholder="e.g.: https://instagram.com/legal/privacy"
                            />
                        </View>
                        <View>
                            <Text style={styles.questionText}>or Paste the new Privacy Policy Text Here instead (optional)</Text>
                            <TextInput
                            style={[styles.input, {height: 120}]}
                            value={newPolicyText}
                            onChangeText={(newPolicyText) => {
                                setNewPolicyText(newPolicyText);
                            }}
                            autoCapitalize="none"
                            textAlignVertical="top"
                            multiline
                            />
                        </View>
                        <TouchableOpacity 
                            style={styles.selectedReasonButton}
                            onPress={() => {
                                handlePolicy(); // Call function first
                                setNewPolicyText(""); // Then clear text field
                            }} 
                        >
                            <Text style={styles.selectedReasonButtonText}>Analyze</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedReason === "sensitive_generic" && (
                    <View style={styles.selectedReasonContainer}>
                        <View style={{backgroundColor: "#d7d7d7", padding: 10, paddingBottom: 10, marginBottom: 10}}>
                            <Text style={[styles.questionText, {fontWeight: "bold", fontSize: 15}]}>{sensitive_genericPicker} Term Update</Text>
                            <Text style={{color: "black", fontSize: 11, paddingBottom: 10}}>Your term will be checked against the database before update.</Text>
                        </View>
                        <Text style={styles.questionText}>Choose Type of Term to Update: </Text>
                        <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={sensitive_genericPicker}
                                    onValueChange={(itemValue) => setSensitive_genericPicker(itemValue)}
                                    style={styles.picker}
                                    itemStyle={styles.itemStyle}
                                >
                                    <Picker.Item style={{fontSize:13, color: "black"}} label="Sensitive" value="Sensitive" />
                                    <Picker.Item style={{fontSize:13}} label="Generic" value="Generic" />
                                </Picker>
                            </View>
                        {sensitive_genericPicker === "Sensitive" && (
                            <View>
                                <Text style={styles.questionText}>Enter Sensitive Term Not Detected:</Text>
                                <TextInput
                                    style={[styles.input]}
                                    value={newSensitiveTerm}
                                    onChangeText={setNewSensitiveTerm}
                                    placeholder = "e.g.: Precise Location"
                                    />
                            </View>
                        )}
                        {sensitive_genericPicker === "Generic" && (
                            <View>
                                <Text style={styles.questionText}>Enter Generic Term Not Detected:</Text>
                                <TextInput
                                    style={[styles.input]}
                                    value={newGenericTerm}
                                    onChangeText={setNewGenericTerm}
                                    placeholder = "e.g.: Privacy Policy" 
                                    />
                            </View>
                        )}
                        <TouchableOpacity style={styles.selectedReasonButton} 
                            onPress={() => {
                                handleTerms(newSensitiveTerm || newGenericTerm, sensitive_genericPicker); // Call function
                                setNewSensitiveTerm(""); // Clear input field
                                setNewGenericTerm(""); // Clear input field
                            }}
                        >
                                    <Text style={styles.selectedReasonButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedReason === "other" && (
                    <View style={styles.selectedReasonContainer}>
                        <View style={{backgroundColor: "#d7d7d7", padding: 10, paddingVertical: 15, height: 100}}>
                            {otherPicker === "app_icon" && (
                                <View>
                                    <Text style={[styles.questionText, {fontSize: 15, marginTop: 0}]}>Current App icon url:</Text>
                                    <Text style={{fontWeight: "bold", color: "black", fontSize: 10}}>{app.icon_url}</Text>
                                </View>
                            )}
                            {otherPicker === "other" && (
                                <View>
                                    <Text style={[styles.questionText, {fontSize: 15, marginTop: 0}]}>Other Updates</Text>
                                    <Text style={{color: "black", fontSize: 11}}>You will be notified after an admin had approve/rejected your update in your account section.</Text>
                                    <TouchableOpacity 
                                        style={[
                                            { 
                                                borderWidth: 0.5, 
                                                alignSelf: "flex-end", 
                                                width: 120, 
                                                height: 20, 
                                                top: 5, 
                                                alignItems: "center", 
                                                flexDirection: "row", 
                                                justifyContent: "space-between", 
                                                paddingHorizontal: 5
                                            }
                                        ]}
                                        onPress={() => navigation.navigate("Main", { screen: "Account" })}
                                    >
                                            <Text style={[{color: "black", fontSize: 11, padding: 2}]}>Go to Account</Text>
                                            <Icon name="angle-right" style={{color: "black"}}/>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text style={styles.questionText}>Choose an Item to Update: </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={otherPicker}
                                onValueChange={(itemValue) => setOtherPicker(itemValue)}
                                style={styles.picker}
                                itemStyle={styles.itemStyle}
                            >
                                <Picker.Item style={{fontSize:13, color: "black"}} label="App Icon" value="app_icon" />
                                <Picker.Item style={{fontSize:13}} label="Other" value="other" />
                            </Picker>
                        </View>
                        {otherPicker === "app_icon" && (
                            <View>
                                <Text style={styles.questionText}>Enter New App Icon Url:</Text>
                                <TextInput
                                style={[styles.input, {height: 100}]}
                                value={newIconUrl}
                                onChangeText={setNewIconUrl}
                                textAlignVertical="top"
                                />
                            </View>
                        )}
                        {otherPicker === "other" && (
                            <View>
                                <Text style={styles.questionText}>Specify the update:</Text>
                                <TextInput
                                style={[styles.input]}
                                value={otherItemChange}
                                onChangeText={setOtherItemChange}
                                placeholder = "e.g.: App Name Changed to NetflixCo"
                                />
                                <Text style={styles.questionText}>Specify Reason:</Text>
                                <TextInput
                                style={[styles.input]}
                                value={otherReason}
                                onChangeText={setOtherReason}
                                placeholder = "e.g.: App Name upaded last week"
                                />
                            </View>
                        )}
                        <TouchableOpacity style={styles.selectedReasonButton}
                            onPress={() => {
                                handleOther(); // Call function
                            }}
                        >
                                    <Text style={styles.selectedReasonButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default UpdateDatabaseScreen;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 50,
    },
    header: {
        flexDirection: "row",
        paddingTop: 10,
        backgroundColor: "#d7d7d7",
    }, 
    screenTitle: {
        color: "black",
        marginTop: 10,
        fontSize: 20,
        fontWeight: "bold",
    },
    appInfoContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    appIcon: {
        width: 55,
        height: 55,
    },
    iconPlaceholder: {
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
      },
    appInfoDescContainer: {
        marginLeft: 10,
    },
    appInfoDescText: {
        fontSize: 15,
        color: "black",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "black",
        height: 50,
    },
    label: {
        fontSize: 16,
        marginTop: 20,
        color: "black",
    },
    picker: {
      width: 300,
      height: 50,
      marginTop: 0,
      borderWidth: 1,
      borderColor: "black",
    },
    selectedReasonContainer: {
        marginTop: 20,
    },
    questionText: {
        color: "black",
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        height: 40,
    },
    selectedReasonButton: {
        marginTop: 20,
        backgroundColor: "#007bff",
        width: 100,
        height: 40,
        alignSelf: "flex-end",
        alignItems: "center", 
    },
    selectedReasonButtonText: {
        color: "white",
        padding: 10,
        fontWeight: "bold",
    }
  });