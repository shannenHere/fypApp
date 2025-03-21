import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { scrapeData, analyze, submitFeedback, updateProcessingStatus, getFeedback, addApp, getAppDetails } from '../api/api';
import { globalStyles } from '../styles/styles';
import { useAuth } from "../contexts/AuthContext";

const UpdateNewAppScreen = () => {
    const route = useRoute();
    const { app, user } = route.params;  
    const navigation = useNavigation();

    console.log("Route params:", route.params);
    console.log("App object:", app);
    console.log("App id: ", app?.packageName);

    const handleNewAppSubmit = async () => { 
        try {
            // Step 1: Scrape Data
            let scrapeSuccess = false;
            try {
                scrapeSuccess = await scrapeData(app.packageName);
                console.log("Scrape Success:", scrapeSuccess);
            } catch (error) {
                console.error("Scraping failed:", error);
            }
    
            // Step 2: Submit feedback regardless of scrape success
            const feedbackStatus = scrapeSuccess ? "Processing..." : "Pending Review";
            await submitFeedback(app.packageName, user.id, "New App Submission", feedbackStatus, "New App Update");
   
            // Step 3: Fetch latest feedback related to this app
            const feedbackResponse = await getFeedback(app.packageName);
            const userFeedbacks = (feedbackResponse.feedback || [])
                .filter(item => 
                    item.user_id === user.id &&
                    item.app_id === app.packageName &&
                    item.reason.trim().toLowerCase() === "new app submission"
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date));
    
            const latestFeedback = userFeedbacks[0];
            if (!latestFeedback) {
                console.error("No matching feedback ID found.");
                return;
            }
    
            // Step 4: If scraping failed, stop here
            if (!scrapeSuccess) {
                console.log(`App ${app.packageName} not found. Marking for manual review.`);
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Pending Review. App not found.");
                return;
            }

             // Step 5: Check app details
            await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Getting app details...`);
            const result = await getAppDetails(app.packageName);
            if (!result || !result.policy_text) {
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, "Pending Review. Privacy policy text not found.");
                return;
            }
    
            // Step 6: Run Analysis
            try {
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Analyzing app...`);
                await analyze(app.packageName);
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Done. App added to database with analysis.`);
            } catch (error) {
                console.error(`Error during analysis: ${error.message}`);
                await updateProcessingStatus(latestFeedback.feedback_id, user.id, `Pending Review. Error during analysis, app added without analysis.`);
            }
    
        } catch (error) {
            console.error("Error in handleNewAppSubmit:", error);
        }
    };    

    console.log("App id: ", app.packageName);

    return (
        <View style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[globalStyles.iconButton]}
                >
                    <Icon name="arrow-left" style={globalStyles.backIcon} />
                </TouchableOpacity>
            </View>

            <Text style={styles.screenTitle}>This App Will Be Submitted for Analysis:</Text>

            <View style={styles.container}>
                <View style={styles.appInfoContainer}>
                    {/* App Icon */}
                    {app.icon ? (
                    <Image source={{ uri: app.icon }} style={styles.appIcon} />
                    ) : (
                    <View style={[styles.appIcon, styles.iconPlaceholder]}>
                        <Text style={{ color: "#888" }}>No Icon</Text>
                    </View>
                    )}
                    <View style={styles.appInfoDescContainer}>
                        <Text style={styles.appInfoDescText}>{app?.label}</Text>
                        <Text style={[styles.appInfoDescText, {fontSize: 12}]}>{app?.packageName}</Text>
                    </View>
                </View>
                <Text style={styles.screenDesc}>You will be notified of the status of your update in Account.</Text>
                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={() => {
                        handleNewAppSubmit();
                        navigation.goBack();
                    }} 
                >
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UpdateNewAppScreen;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 30,
    },
    header: {
        flexDirection: "row",
        paddingTop: 10,
        backgroundColor: "#d7d7d7",
    }, 
    screenTitle: {
        color: "black",
        marginTop: 30,
        fontSize: 18,
        marginHorizontal: 35,
    },
    appInfoContainer: {
        flexDirection: "row",
        marginTop: 20,
        backgroundColor: "#d7d7d7",
        padding: 20,
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
        marginTop: 5,
        marginLeft: 10,
    },
    appInfoDescText: {
        fontSize: 15,
        color: "black",
    },
    screenDesc: {
        marginTop: 20,
        color: "black",
    },
    submitButton: {
        marginTop: 20,
        backgroundColor: "#007bff",
        width: 100,
        height: 40,
        alignSelf: "flex-end",
        alignItems: "center", 
    },
    submitButtonText: {
        color: "white",
        padding: 10,
        fontWeight: "bold",
    }
})
