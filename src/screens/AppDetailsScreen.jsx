import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";
import { globalStyles } from "../styles/styles";
import { getAppDetails, getFeedback, submitFeedback } from "../api/api"; 
import { useAuth } from "../contexts/AuthContext";
import { useAppList } from "../contexts/AppListContext"; 
import { getCleanedSensitiveSentences, getWorstPermissions } from "../utils/stringToJSONUtils";

const AppDetailsScreen = () => {
  const scrollViewRef = useRef(null);
  const route = useRoute();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { app } = route.params;
  const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
  const [appDetails, setAppDetails] = useState(null);
  const [installedStatus, setInstalledStatus] = useState("Checking...");

  const [forceRender, setForceRender] = useState(false);

  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  const [top1Practice, setTop1Practice] = useState({sentence: "Getting Result...", sensitiveTerms: "Getting Result...", score: "?"});
  const [top2Practice, setTop2Practice] = useState({sentence: "Getting Result...", sensitiveTerms: "Getting Result...", score: "?"});
  const [top3Practice, setTop3Practice] = useState({sentence: "Getting Result...", sensitiveTerms: "Getting Result...", score: "?"});

  const [top1Permission, setTop1Permission] = useState({description: "Getting Result...", permission: "Getting Result...", score: "?"});
  const [top2Permission, setTop2Permission] = useState({description: "Getting Result...", permission: "Getting Result...", score: "?"});
  const [top3Permission, setTop3Permission] = useState({description: "Getting Result...", permission: "Getting Result...", score: "?"});

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);  

  const fetchFeedbacks = async () => {
    try {
      const response = await getFeedback(app.app_id);
      console.log("Feedback API Response: ", response);

      if (response.error) {
          console.error("API Error:", response.error);
          return;
      }

      // Ensure `feedback` exists in the response
      if (response.feedback) {
          setFeedbackList(response.feedback); // Store only the array
      } else {
          setFeedbackList([]); // No feedback found, set an empty list
      }

    } catch (error) {
        console.error("Error fetching feedback:", error);
    }
  }

  useEffect(() => { 
    // Fetch app details from API
    const fetchDetails = async () => {
      try {
        const data = await getAppDetails(app.app_id); 
        console.log("API Response:", data);
        setAppDetails(data);

        // Ensure deconstruction happens only after details are fetched
        if (data) {
          const cleanedSensitiveSentences = getCleanedSensitiveSentences(data.sensitive_sentences) || [];
          setTop1Practice(cleanedSensitiveSentences[0] || "No data available");
          setTop2Practice(cleanedSensitiveSentences[1] || "No data available");
          setTop3Practice(cleanedSensitiveSentences[2] || "No data available");

          const cleanedPermissions = getWorstPermissions(data.worst_permissions) || [];
          setTop1Permission(cleanedPermissions[0] || "No data available");
          setTop2Permission(cleanedPermissions[1] || "No data available");
          setTop3Permission(cleanedPermissions[2] || "No data available");
        }
      } catch (error) {
        console.error("Error fetching app details:", error);
      }
    };

    fetchDetails();

    if (user?.id) {
      setInstalledStatus(installedAppsInDB.some((item) => item.app_id === app.app_id) ? "Installed" : "Not Installed");
    } else {
      setInstalledStatus("");
    } 
    fetchFeedbacks();

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [app.app_id, installedAppsInDB]);

  const handleViewMorePrivacy = async () => {
    setPrivacyLoading(true); // Start loading immediately
    
    setTimeout(() => {
      navigation.navigate("MorePrivacyScreen", { installedStatus, appDetails });
      setPrivacyLoading(false); // Stop loading after navigation
    }, 50); // Small delay to ensure UI updates before navigation
  };

  const handleViewMorePermisions = async () => {
    setPermissionsLoading(true); // Start loading immediately
    
    setTimeout(() => {
      navigation.navigate("MorePermissionScreen", { installedStatus, appDetails });
      setPermissionsLoading(false); // Stop loading after navigation
    }, 50); // Small delay to ensure UI updates before navigation
  };

  const handleViewMoreFeedbacks= async () => {
    setFeedbacksLoading(true); // Start loading immediately
    
    setTimeout(() => {
      navigation.navigate("MoreFeedbacksScreen", { installedStatus, appDetails });
      setFeedbacksLoading(false); // Stop loading after navigation
    }, 50); // Small delay to ensure UI updates before navigation
  };

  if (!appDetails) {
    return (
      <View style={[globalStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Loading app details...</Text>
      </View>
    );
  }

// Improved handleSubmitFeedback function
const handleSubmitFeedback = async () => {
  if (!feedbackText.trim()) {
    Alert.alert("Error", "Feedback cannot be empty.");
    return;
  }

  try {
    console.log("Submitting feedback with the following data:", {
      app_id: appDetails.app_id,
      user_id: user.id,
      reason: feedbackText,
      status: "NA",  // or any value you set for status
      type: "comment",  // or any value you set for type
    });
    
    const response = await submitFeedback(appDetails.app_id, user.id, feedbackText, "NA", "comment");

    if (response.error) {
      console.error("Error submitting feedback:", response.error);
      Alert.alert("Error", "Failed to submit feedback.");
      return;
    }

    Alert.alert("Success", "Feedback submitted successfully!");
    
    // Clear input and refresh feedback list
    setFeedbackText("");
    fetchFeedbacks(); 

  } catch (error) {
    console.error("Error submitting feedback:", error);
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
};
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }} // Increase padding at the bottom
        keyboardShouldPersistTaps="handled" // Allows tap interaction when keyboard is 
        scrollEnabled={false}
      >
      <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("Home");
          }
        }}
        style={globalStyles.iconButton}
      >
        <Icon name="arrow-left" style={globalStyles.backIcon} />
      </TouchableOpacity>
    </View>
      <View style={styles.container}>
      {/* Installed Status */}
      {user?.id && (
      <View style={styles.installedStatusContainer}>
            <Text style={styles.installedStatus}>{installedStatus}</Text>
      </View>
      )}
      {/* Icons for update database*/}
      <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => navigation.navigate("UpdateDatabaseScreen", {
                app: appDetails
              })}>
                <Icon name="database" style={styles.databaseIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("MoreFeedbacksScreen", { installedStatus, appDetails })}>
                <Icon name="commenting-o" style={styles.feedbackIcon} />
              </TouchableOpacity>
      </View>

      {/* Top Section: Icon, Name, Rating, Installed Status */}
      <View style={styles.topSection}>
          {/* App Icon */}
          {appDetails.icon_url ? (
            <Image source={{ uri: appDetails.icon_url }} style={styles.appIcon} />
          ) : (
            <View style={[styles.appIcon, styles.iconPlaceholder]}>
              <Text style={{ color: "#888" }}>No Icon</Text>
            </View>
          )}
          {/* App Name and Rating */}
          <View style={styles.nameRatingContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.appName}>{appDetails.app_name}</Text>
              {appDetails.rating === "good" && (
                <View style={[styles.ratingContainer, {backgroundColor: "#008000"}]}>
                  <Text style={styles.appRating}>{appDetails.rating}</Text>
                </View>
              )}
              {appDetails.rating === "okay" && (
                <View style={[styles.ratingContainer, {backgroundColor: "#FFA500"}]}>
                  <Text style={styles.appRating}>{appDetails.rating}</Text>
                </View>
              )}
              {appDetails.rating === "bad" && (
                <View style={[styles.ratingContainer, {backgroundColor: "#FF0000"}]}>
                  <Text style={styles.appRating}>{appDetails.rating}</Text>
                </View>
              )}
              </View>
          </View>
      </View>

      <View style={styles.appDetailContainer}>
  {/* Privacy Practice Section */}
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Privacy Practice</Text>
      <TouchableOpacity onPress={handleViewMorePrivacy} disabled={privacyLoading}>
        {privacyLoading ? <Text style={styles.viewMore}>Loading...</Text> : <Text style={styles.viewMore}>View More</Text>}
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.sectionContentScrollView}>
      {/* Top 1 Privacy Practice */}
      <View style={styles.sectionRow}>
        <View style={styles.redIcon}>
          <Text style={styles.iconText}>{top1Practice.score}</Text>
        </View>
        <View>
          <Text style={styles.itemTitle}>{top1Practice.sensitiveTerms}</Text>
          <Text style={styles.itemDesc}>
            {top1Practice.sentence.length > 50
              ? top1Practice.sentence.substring(0, 50) + '...'
              : top1Practice.sentence}
          </Text>
        </View>
      </View>

      {/* Top 2 Privacy Practice */}
      <View style={styles.sectionRow}>
        <View style={styles.yellowIcon}>
          <Text style={styles.iconText}>{top2Practice.score}</Text>
        </View>
        <View>
          <Text style={styles.itemTitle}>{top2Practice.sensitiveTerms}</Text>
          <Text style={styles.itemDesc}>
            {top2Practice.sentence.length > 50
              ? top2Practice.sentence.substring(0, 50) + '...'
              : top2Practice.sentence}
          </Text>
        </View>
      </View>

      {/* Top 3 Privacy Practice */}
      <View style={styles.sectionRow}>
        <View style={styles.greenIcon}>
          <Text style={styles.iconText}>{top3Practice.score}</Text>
        </View>
        <View>
          <Text style={styles.itemTitle}>{top3Practice.sensitiveTerms}</Text>
          <Text style={styles.itemDesc}>
            {top3Practice.sentence.length > 50
              ? top3Practice.sentence.substring(0, 50) + '...'
              : top3Practice.sentence}
          </Text>
        </View>
      </View>
    </ScrollView>
  </View>

  {/* Permissions Section */}
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Permissions</Text>
      <TouchableOpacity onPress={handleViewMorePermisions} disabled={permissionsLoading}>
        {permissionsLoading ? <Text style={styles.viewMore}>Loading...</Text> : <Text style={styles.viewMore}>View More</Text>}
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.sectionContentScrollView}>
      {/* Top 1 Permission */}
      <View style={styles.sectionRow}>
        <View style={styles.redIcon}>
          <Text style={styles.iconText}>{top1Permission.score}</Text>
        </View>
        <View>
          <Text style={styles.itemTitle}>{top1Permission.permission}</Text>
          <Text style={styles.itemDesc}>{top1Permission.description}</Text>
        </View>
      </View>

      {/* Top 2 Permission */}
      <View style={styles.sectionRow}>
        <View style={styles.yellowIcon}>
          <Text style={styles.iconText}>{top2Permission.score}</Text>
        </View>
        <View>
          <Text style={styles.itemTitle}>{top2Permission.permission}</Text>
          <Text style={styles.itemDesc}>{top2Permission.description}</Text>
        </View>
      </View>

      {/* Top 3 Permission */}
      <View style={styles.sectionRow}>
        <View style={styles.greenIcon}>
          <Text style={styles.iconText}>{top3Permission.score}</Text>
        </View>
        <View>
          <Text style={styles.itemTitle}>{top3Permission.permission}</Text>
          <Text style={styles.itemDesc}>{top3Permission.description}</Text>
        </View>
      </View>
    </ScrollView>
  </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            <TouchableOpacity onPress={handleViewMoreFeedbacks} disabled={feedbacksLoading}>
              {feedbacksLoading ? <Text style={styles.viewMore}>Loading...</Text> : <Text style={styles.viewMore}>View More</Text>}
            </TouchableOpacity>
          </View>
          {/* Example of listing feedback */}
          <ScrollView style={[styles.sectionContentScrollView]}>
          {feedbackList.length === 0 ? (
              <Text>No feedback available</Text>
            ) : (
              feedbackList.map((feedback, index) => (
                <View key={index} style={styles.feedbackContainer}>
                  <Icon name="user-circle" size={35} />
                  <View>
                    <View style={styles.nameDateContainer}>
                      <Text style={styles.feedbackUser}>{feedback.user_email}</Text>
                      <Text style={styles.feedbackDate}>{feedback.date}</Text>
                    </View>
                    <Text style={styles.feedbackType}>{`<${feedback.type}>`}</Text>
                    <Text style={styles.feedbackText}>{feedback.reason}</Text>
                  </View>
                </View>
              ))
           )}
          </ScrollView>
          <View style={styles.feedbackInputContainer}>
          {/* Current User Section */}
          <View style={styles.userInfoRow}>
            <View style={styles.iconContainer}>
              {/* Replace with your icon */}
              <Icon name="user-circle" size={30}/>
            </View>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Update Feecback Section */}
          <View style={styles.updateFeedbackRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter comment..."
              value={feedbackText}
              onChangeText={(text) => setFeedbackText(text)}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
          </View>
        </View>
      </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AppDetailsScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#d7d7d7",
    height: 60,
  },
  container: {
    top: 0,
  },
  installedStatusContainer:{
    marginLeft: 50,
    backgroundColor: "#e8e8e8",
    width: 90,
    top: -8,
    height: 30,
    alignItems: "center",
    borderWidth: 1,
    marginTop: -40,
  },
  installedStatus: {
    fontSize: 12,
    color: "black",
    marginVertical: 5,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 30,
    top: 15,
  },
  databaseIcon: {
    fontSize: 25,
    color: "#333",
    marginLeft: 20,
  },
  feedbackIcon: {
    fontSize: 28,
    color: "#333",
    marginLeft: 15,
    bottom: 3,
  },
  appDetailContainer: {
    paddingHorizontal: 30,
    paddingLeft: 40,
    top: -10,
    maxHeight: 550,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    top: 0,
    marginHorizontal: 30,
    left: 10,
  },
  appIcon: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: "black"
  },
  iconPlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  nameRatingContainer:{
    marginLeft: 10,
    width: "100%",
    top: 5,
  },
  nameContainer: {
  },
  appName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
    flexWrap: "wrap",
    maxWidth: "90%",
    bottom: 0,
  },
  ratingContainer: {
    padding: 0,
    width: 50,
    alignItems: "center",
    alignSelf: "flex-end",
    right: 65,
    height: 15,
    top: 0,
    borderWidth: 0.5,
  },
  appRating: {
    fontSize: 10,
    color: "white",
    paddingLeft: 2,
  },
  section: {
    marginBottom: 5,
  },
  sectionRow: {
    flexDirection: "row",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    //fontWeight: "bold",
    color: "black",
  },
  viewMore: {
    top: 10,
    fontSize: 12,
    color: "#007AFF",
  },
  sectionContentScrollView: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 5,
    paddingVertical: 3,
    height: 120,
    borderWidth: 1,
    marginBottom: 5,
  },
  redIcon: {
    backgroundColor: "#FF0000",
    borderWidth: 0.5,
    alignItems: "center", 
    height: 35,
    width: 35,
    marginBottom: 1,
  },
  yellowIcon: {
    backgroundColor: "#FFA500",
    borderWidth: 0.5,
    alignItems: "center", 
    height: 35,
    width: 35,
    marginBottom: 1,
  },
  greenIcon: {
    backgroundColor: "#008000",
    borderWidth: 0.5,
    alignItems: "center", 
    height: 35,
    width: 35,
    marginBottom: 1,
  },
  iconText: {
    color: "white",
    paddingTop: 8,
    fontWeight: "bold",
  },
  itemTitle: {
    marginLeft: 5,
    color: "black",
  },
  itemDesc: {
    marginBottom: 5,
    fontSize: 10,
    color: "#333",
    marginLeft: 5,
  },
  feedbackItem: {
    marginBottom: 10,
    flexDirection: "row",
  },
  nameDateContainer: {
    flexDirection: "row",
    width: "92%",
    marginLeft: 5,
    justifyContent: "space-between",
  },
  feedbackContainer: {
    flexDirection: "row",
  },
  feedbackUser: {
    fontSize: 10,
  },
  feedbackDate: {
    fontSize: 8,
  },
  feedbackType: {
    fontStyle: "italic",
    fontSize: 10,
    marginLeft: 5,
    marginTop: -3,
  },
  feedbackText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 5,
    marginTop: -5,
  },
  feedbackInputContainer: {
    marginTop: 0,
  },

  // Row for icon and email
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  iconContainer: {
    marginRight: 5, // Space between icon and email
  },

  icon: {
    fontSize: 30, // Adjust icon size
  },

  email: {
    fontSize: 12,
    color: '#333',
  },

  // Row for TextInput and submit button
  updateFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  input: {
    flex: 1,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'black',
    height: 30,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
  },

  submitButton: {
    backgroundColor: '#f9f9f9',
    height: 30,
    borderWidth: 0.5,
    width: 80,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginLeft: 5, 
    alignItems: "center",
  },

  submitButtonText: {
    color: 'black',
    fontSize: 12,
  },
});
