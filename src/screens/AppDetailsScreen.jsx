import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StyleSheet, 
  Alert 
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";
import HeaderComponent from "../components/Header"; 
import PermissionsList from "../components/PermissionsList";
import { globalStyles } from "../styles/styles";
import { getAppDetails } from "../api/api"; 
import { useAuth } from "../contexts/AuthContext";
import { useAppList } from "../contexts/AppListContext"; 
import { getCleanedSensitiveSentences, getWorstPermissions } from "../utils/stringToJSONUtils";

const AppDetailsScreen = () => {
  const route = useRoute();
  //const { user } = useAuth();
  const user = true;
  const navigation = useNavigation();
  const { app } = route.params;
  const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
  const [appDetails, setAppDetails] = useState(null);
  const [installedStatus, setInstalledStatus] = useState("Checking...");

  const [top1Practice, setTop1Practice] = useState("Getting Result...");
  const [top2Practice, setTop2Practice] = useState("Getting Result...");
  const [top3Practice, setTop3Practice] = useState("Getting Result...");

  const [top1Permission, setTop1Permission] = useState("Getting Result...");
  const [top2Permission, setTop2Permission] = useState("Getting Result...");
  const [top3Permission, setTop3Permission] = useState("Getting Result...");

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState([]); // Example if you store feedback

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

    if (user) {
      setInstalledStatus(installedAppsInDB.some((item) => item.app_id === app.app_id) ? "Installed" : "Not Installed");
    } else {
      setInstalledStatus("");
    } 
  }, [app.app_id, installedAppsInDB]);

  // Example feedback submission (locally stored for now)
  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    const newFeedback = {
      userName: "User Name", 
      date: new Date().toLocaleDateString(),
      text: feedbackText,
    };
    setFeedbackList([...feedbackList, newFeedback]);
    setFeedbackText("");
  };

  if (!appDetails) {
    return (
      <View style={[globalStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <HeaderComponent title="App Details" showBackButton={true} />
        <Text>Loading app details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent title="" showBackButton={true} />
      {/* Installed Status */}
      <View style={styles.installedStatusContainer}>
            <Text style={styles.installedStatus}>{installedStatus}</Text>
      </View>

      {/* Icons for update database*/}
      <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => Alert.alert("Database Icon Pressed")}>
                <Icon name="database" style={styles.databaseIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Feedback Icon Pressed")}>
                <Icon name="commenting-o" style={styles.feedbackIcon} />
              </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
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
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.appRating}>{appDetails.rating || "Unknown"}</Text>
            </View>
          </View>
        </View>

        {/* Privacy Practice Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Privacy Practice</Text>
            <TouchableOpacity onPress={() => Alert.alert("View More Privacy")}>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            <View>
              <Text style={styles.redIcon}>
                {top1Practice.score}
              </Text>
              <Text style={styles.itemTitle}>
                {top1Practice.sensitiveTerms}
              </Text>
              <Text style={styles.itemDesc}>
                {top1Practice.sentence}
              </Text>
            </View>

            <View>
              <Text style={styles.yellowIcon}>
                {top2Practice.score}
              </Text>
              <Text style={styles.itemTitle}>
                {top2Practice.sensitiveTerms}
              </Text>
              <Text style={styles.itemDesc}>
                {top2Practice.sentence}
              </Text>
            </View>

            <View>
              <Text style={styles.greenIcon}>
                {top3Practice.score}
              </Text>
              <Text style={styles.itemTitle}>
                {top3Practice.sensitiveTerms}
              </Text>
              <Text style={styles.itemDesc}>
                {top3Practice.sentence}
              </Text>
            </View>
          </View>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Permissions</Text>
            <TouchableOpacity onPress={() => Alert.alert("View More Permissions")}>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
          <View>
              <Text style={styles.redIcon}>
                {top1Permission.score}
              </Text>
              <Text style={styles.itemTitle}>
                {top1Permission.permission}
              </Text>
            </View>

            <View>
              <Text style={styles.yellowIcon}>
                {top2Permission.score}
              </Text>
              <Text style={styles.itemTitle}>
                {top2Permission.permission}
              </Text>
            </View>

            <View>
              <Text style={styles.greenIcon}>
                {top3Permission.score}
              </Text>
              <Text style={styles.itemTitle}>
                {top3Permission.permission}
              </Text>
            </View>
            {/* Additional common permissions... */}
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            <TouchableOpacity onPress={() => Alert.alert("View More Feedback")}>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>
          {/* Example of listing feedback */}
          <View style={styles.feedbackList}>
            {feedbackList.map((item, index) => (
              <View key={index} style={styles.feedbackItem}>
                <Text style={styles.feedbackUser}>{item.userName}</Text>
                <Text style={styles.feedbackDate}>{item.date}</Text>
                <Text style={styles.feedbackText}>{item.text}</Text>
              </View>
            ))}
          </View>
          {/* Input for new feedback */}
          <View style={styles.feedbackInputContainer}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Leave Feedback..."
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackSubmit}>
              <Text style={{ color: "#fff" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AppDetailsScreen;

const styles = StyleSheet.create({
  installedStatusContainer:{
    marginLeft: 70,
    backgroundColor: "#e8e8e8",
    width: 100,
    top: -47,
    height: 30,
    justifyContent: "center",
  },
  installedStatus: {
    fontSize: 12,
    color: "black",
    marginVertical: 5,
    marginLeft: 15,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 20,
    top: -45,
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingLeft: 40,
    top: -60,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
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
  nameRatingContainer:{
    marginLeft: 5,
    width: "100%",
  },
  nameContainer: {
  },
  appName: {
    fontSize: 17.5,
    fontWeight: "bold",
    color: "#000",
    flexWrap: "wrap",
    maxWidth: "90%",
  },
  ratingContainer: {
    alignSelf: "flex-end",
    right: 60,
    backgroundColor: "#e8e8e8",
    padding: 1,
    width: 60,
    alignItems: "center",
    height: 20,
  },
  appRating: {
    fontSize: 12,
    color: "black",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  viewMore: {
    fontSize: 12,
    color: "#007AFF",
  },
  sectionContent: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
  },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemDesc: {
    marginBottom: 10,
    fontSize: 12,
    color: "#333",
  },
  feedbackList: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
    maxHeight: 150, // Example scroll limit
  },
  feedbackItem: {
    marginBottom: 10,
  },
  feedbackUser: {
    fontWeight: "bold",
    fontSize: 12,
  },
  feedbackDate: {
    fontSize: 10,
    color: "#999",
  },
  feedbackText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 5,
  },
  feedbackInputContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  feedbackInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 35,
  },
  feedbackButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
  },
});
