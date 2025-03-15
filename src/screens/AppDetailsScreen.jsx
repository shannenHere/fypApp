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
import HeaderComponent from "../components/Header"; // Example custom header
import { globalStyles } from "../styles/styles";
import { getAppDetails } from "../api/api"; // Your function to fetch a single app's details
import { useAppList } from "../contexts/AppListContext"; 

const AppDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { app } = route.params;
  const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
  const [appDetails, setAppDetails] = useState(null);
  const [installedStatus, setInstalledStatus] = useState("Checking...");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState([]); // Example if you store feedback

  useEffect(() => { 
    console.log("Navigated with appId:", app.app_id); 
    if (!app?.app_id) {
      console.error("Error: No appId found in route params");
      return;
    }
    // Fetch app details from API
    const fetchDetails = async () => {
      try {
        const data = await getAppDetails(app.app_id); 
        setAppDetails(data);
      } catch (error) {
        console.error("Error fetching app details:", error);
      }
    };

    fetchDetails();

    console.log("installedAppsInDB:", installedAppsInDB);
    console.log("Current app ID:", app.app_id);

    if (installedAppsInDB.some((item) => item.app_id === app.app_id)) {
      setInstalledStatus("Installed");
    } else {
      setInstalledStatus("Not Installed");
    }     
    
  }, [app.app_id]);

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
    <View style={globalStyles.container}>
      <HeaderComponent title={appDetails?.app_name || "App Details"} showBackButton={true} />

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
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.appName}>{appDetails.app_name}</Text>
            <Text style={styles.appRating}>{appDetails.rating || "Unknown"}</Text>
          </View>
          {/* Installed Status */}
          <View style={{ marginLeft: "auto", alignItems: "center" }}>
            <Text style={styles.installedStatus}>{installedStatus}</Text>
            {/* Example icons for trash or chat */}
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => Alert.alert("Trash Icon Pressed")}>
                <Icon name="trash" style={styles.smallIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Chat Icon Pressed")}>
                <Icon name="comment" style={styles.smallIcon} />
              </TouchableOpacity>
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
            {/* Example placeholders for privacy info */}
            <Text style={styles.itemTitle}>
              {appDetails.most_concerning_practice || "Most Concerning Practice"}
            </Text>
            <Text style={styles.itemDesc}>
              Description or details about the most concerning practice...
            </Text>
            {/* Additional common practices... */}
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
            <Text style={styles.itemTitle}>Most Dangerous Permission</Text>
            <Text style={styles.itemDesc}>Description about dangerous permission...</Text>
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
  scrollContainer: {
    paddingHorizontal: 15,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  iconPlaceholder: {
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  appRating: {
    fontSize: 14,
    color: "#555",
  },
  installedStatus: {
    fontSize: 12,
    color: "green",
    marginBottom: 5,
  },
  iconRow: {
    flexDirection: "row",
  },
  smallIcon: {
    fontSize: 20,
    color: "#333",
    marginLeft: 10,
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
