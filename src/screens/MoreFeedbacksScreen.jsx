import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getFeedback, submitFeedback } from "../api/api"; 
import { globalStyles } from '../styles/styles';
import { useAuth } from "../contexts/AuthContext";

const MoreFeedbacksScreen = () => {
  const { user } = useAuth();
  console.log("User", user);
  const route = useRoute();
  const { installedStatus, appDetails } = route.params;
  const navigation = useNavigation();

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchFeedbacks = async () => {
    try {
        const response = await getFeedback(appDetails.app_id);
        console.log("Feedback API Response: ", response);

        if (response.error) {
            console.error("API Error:", response.error);
            return;
        }

        if (response.feedback) {
            // Sort feedback by date in descending order (latest first)
            const sortedFeedback = response.feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
            setFeedbackList(sortedFeedback);
        } else {
            setFeedbackList([]);
        }
    } catch (error) {
        console.error("Error fetching feedback:", error);
    }
};

  useEffect(() => { 
    fetchFeedbacks();
  }, []);

  const handleCategoryPress = (category) => {
    // If the same category is clicked again, deselect it (set to default)
    if (selectedCategory === category) {
        setSelectedCategory('All'); // Deselect when the same button is clicked
    } else {
        setSelectedCategory(category); // Set the new selected category
    }
    };

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
    <View style={globalStyles.container}>
      <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()} 
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
            {user?.id && (
                    <TouchableOpacity onPress={() => navigation.navigate("UpdateDatabaseScreen", {
                      app: appDetails
                    })}>
                      <Icon name="database" style={styles.databaseIcon} />
                    </TouchableOpacity>
                  )}
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
                    <Text style={styles.totalFeedbacks}>Total Feedbacks: {feedbackList.length}</Text>
                </View>
            </View>
            <View style={styles.section}>
            {user?.id && (
                <View style={styles.feedbackInputContainer}>
                  {/* Current User Section */}
                  <View style={styles.userInfoRow}>
                    <View style={styles.iconContainer}>
                      {/* Replace with your icon */}
                      <Icon name="user-circle" size={30}/>
                    </View>
                    <Text style={styles.email}>{user?.email}</Text>
                  </View>
        
                  {/* Update Feedback Section */}
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
            )}
                {/* Feedback Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Feedback</Text>
                </View>
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

                  {/* Right Column: "Comments', 'Feedback' buttons */}
                  <View style={styles.rightColumn}>
                      <View style={styles.installedAppsCategory}>
                      {['Comments', 'Feedbacks'].map((category) => (
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
                {/* Example of listing feedback */}
                <ScrollView 
                  style={[styles.sectionContentScrollView]}
                  contentContainerStyle={{ paddingBottom: 5 }}
                >
                {feedbackList.length === 0 ? (
                  <Text style={styles.noText}>No feedback available</Text>
                ) : (
                  (() => {
                    const filteredFeedback = feedbackList.filter(feedback => 
                      selectedCategory === "All" || 
                      (selectedCategory === "Comments" && feedback.type === "comment") || 
                      (selectedCategory === "Feedbacks" && feedback.type !== "comment")
                    );

                    return filteredFeedback.length === 0 ? (
                      <Text style={styles.noText}>No {selectedCategory.toLowerCase()} available</Text>
                    ) : (
                      filteredFeedback.map((feedback, index) => (
                        <View key={index} style={styles.feedbackContainer}>
                          <Icon name="user-circle" size={35} />
                          <View>
                            <View style={styles.nameDateContainer}>
                              <Text style={styles.feedbackUser}>{feedback.user_email}</Text>
                              <Text style={styles.feedbackDate}>{feedback.date}</Text>
                            </View>
                            {/* Only show feedback type if it's not "Comments" */}
                            {selectedCategory !== "Comments" && (
                              <Text style={styles.feedbackType}>{`<${feedback.type}>`}</Text>
                            )}
                            <Text style={styles.feedbackText}>{feedback.reason}</Text>
                          </View>
                        </View>
                      ))
                    );
                  })()
                )}
              </ScrollView>
            </View>
          </View>
    </View>
  );
};

export default MoreFeedbacksScreen;

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
    height: 20,
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
  totalFeedbacks: {
    fontSize: 10,
    marginTop: -13,
  },
  section: {
    marginHorizontal: 30,
    marginLeft: 40,
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
  sectionRow: {
    flexDirection: "row",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 25,
    //fontWeight: "bold",
    color: "black",
  },
  installAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 0,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    right: 0,
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
    width: 100,
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
  sectionContentScrollView: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 5,
    paddingVertical: 2,
    height: 350,
    borderWidth: 1,
    marginBottom: 5,
    marginTop: 10,
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
  noText: {
    fontStyle: "italic",
    alignSelf: "center",
    marginTop: 100,
  },
});