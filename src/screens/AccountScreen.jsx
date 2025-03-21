import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import HeaderComponent from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAppList } from '../contexts/AppListContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserFeedback } from "../api/api"; 
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { globalStyles } from '../styles/styles';

const AccountScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
  const [selectedCategory, setSelectedCategory] = useState('Not in DB');
  const [selectedCategoryFeedback, setSelectedCategoryFeedback] = useState('All');
  const [userFeedback, setUserFeedback] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const result = await getUserFeedback(user.id);
        console.log("Fetched feedback:", JSON.stringify(result, null, 2));

        if (Array.isArray(result.user_feedback)) {
          const sortedFeedback = result.user_feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
          setUserFeedback(sortedFeedback);
        } else {
          setUserFeedback([]);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setUserFeedback([]);
      }
    };

    fetchFeedback();
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      const fetchFeedback = async () => {
        try {
          const result = await getUserFeedback(user.id);
          console.log("Fetched feedback:", JSON.stringify(result, null, 2));
  
          if (Array.isArray(result.user_feedback)) {
            const sortedFeedback = result.user_feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
            setUserFeedback(sortedFeedback);
          } else {
            setUserFeedback([]);
          }
        } catch (err) {
          console.error("Error fetching feedback:", err);
          setUserFeedback([]);
        }
      };
  
      fetchFeedback();
    }, [user.id])
  );

  const handleCategoryPress = (category) => {
  // If the same category is clicked again, deselect it (set to default)
  if (selectedCategory === category) {
      setSelectedCategory('Not in DB'); // Deselect when the same button is clicked
  } else {
      setSelectedCategory(category); // Set the new selected category
  }
  };

  const handleCategoryPressFeedback = (category) => {
    // If the same category is clicked again, deselect it (set to default)
    if (selectedCategoryFeedback === category) {
        setSelectedCategoryFeedback('All'); // Deselect when the same button is clicked
    } else {
        setSelectedCategoryFeedback(category); // Set the new selected category
    }
    };

  // Filter Installed Apps based on category
  const filteredApps = selectedCategory === 'All' 
    ? [...installedAppsInDB, ...installedAppsNotInDB] 
    : selectedCategory === 'In DB' 
    ? installedAppsInDB 
    : installedAppsNotInDB;
  
    const filteredFeedback = selectedCategoryFeedback === 'All'
  ? userFeedback
  : userFeedback.filter(feedback => 
      selectedCategoryFeedback === 'Comments' 
        ? feedback.type.toLowerCase() === 'comment' 
        : feedback.type.toLowerCase() !== 'comment'
    );  
  
  return (
      <View style={[globalStyles.container]}>
        <HeaderComponent title="Account" showBackButton={true} />
        {/* Icons for update database*/}
        {user.isAdmin && ( // Only show if user is admin
          <TouchableOpacity onPress={() => navigation.navigate("AdminReviewScreen")}>
            <Icon name="comments" style={styles.databaseIcon} />
          </TouchableOpacity>
        )}
        <View style={styles.container}>
        {/* Installed Apps Section */}
        <Text style={styles.sectionTitle}>Apps Installed on Your Device</Text>
        <Text style={styles.sectionDesc}>
          You can help us update the database by submiting installed apps not in database for analysis.
        </Text>
        {/* Installed Apps Category Buttons */}
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

          {/* Right Column: "Not in DB', 'In DB' buttons */}
          <View style={styles.rightColumn}>
              <View style={styles.installedAppsCategory}>
              {['Not in DB', 'In DB'].map((category) => (
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
          {/* Installed Apps List */}
          <ScrollView style={styles.sectionContentScrollView} >
          {filteredApps.length > 0 ? (
          filteredApps.map((app) => {
            const key = app.app_id || app.packageName; // Unique key
            const name = app.app_name || app.label ; // Display name
            const isInDB = !!app.app_id; // If app_id exists, it's in DB

            return (
              <View key={key} style={styles.appItemContainer}>
                <Text style={styles.appItem}>{name}</Text>
      
                {isInDB ? (
                  <TouchableOpacity 
                    style={styles.inDbButton}
                    onPress={() => navigation.navigate('AppDetailsScreen', { app })}
                  >
                    <Text style={styles.inDbText}>View Analysis</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => navigation.navigate("UpdateNewAppScreen", { app, user })}
                  >
                    <Text style={styles.updateButtonText}>Submit for Analysis</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No apps found in {selectedCategory}.</Text>
        )}
          </ScrollView>

          {/* Feedback Section */}
          <Text style={styles.sectionTitle}>
          Feedbacks
          </Text>
          <Text style={styles.sectionDesc}>
            Keep count on the progress of your feedbacks here.
          </Text>
          {/* Feedback Category Buttons */}
          <View style={styles.installAppsRow}>
          {/* Left Column: "All" button */}
          <View style={styles.leftColumn}>
              <TouchableOpacity
              style={[
                  styles.categoryButton,
                  selectedCategoryFeedback === 'All' && styles.categoryButtonSelected
              ]}
              onPress={() => handleCategoryPressFeedback('All')}
              >
                  <Text
                      style={[
                      styles.selectedinstalledAppsButtonsText,
                      selectedCategoryFeedback === 'All' ? styles.textSelected : styles.textUnselected
                      ]}
                  >
                      All
                  </Text>
              </TouchableOpacity>
          </View>

          {/* Right Column: "Comments', 'Feedback' buttons */}
          <View style={styles.rightColumn}>
              <View style={styles.installedAppsCategory}>
              {['Comments', 'Feedback'].map((categoryFeedback) => (
                  <TouchableOpacity
                  key={categoryFeedback}
                  style={[
                      styles.installedAppsButtons,
                      selectedCategoryFeedback === categoryFeedback && styles.categoryButtonSelected
                  ]}
                  onPress={() => handleCategoryPressFeedback(categoryFeedback)}
                  >
                  <Text
                      style={[
                      styles.installedAppsButtonsText,
                      selectedCategoryFeedback === categoryFeedback ? styles.textSelected : styles.textUnselected
                      ]}
                  >
                      {categoryFeedback}
                  </Text>
                  </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        {/* Feedback List */}
        <ScrollView style={styles.sectionContentScrollView}>
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((feedback) => (
            <View key={feedback.feedback_id} style={styles.appItemContainer}>
              <View>
                {/* App Name */}
                <View style={styles.appReasonContainer}>
                  <Text style={styles.appItem}>
                    {feedback.app_name ? feedback.app_name: feedback.app_id}
                  </Text>
                  <Text style={styles.feedbackReason}>
                    {feedback.type === "comment" ? `<Comment>` : `<${feedback.reason}>`}
                  </Text>
                </View>

              <View style={styles.statusDateContainer}>
                {/* Feedback Status */}
                <Text style={styles.feedbackStatus}>
                  {feedback.type === "comment" ? feedback.reason : feedback.status}
                </Text>

                {/* Feedback Date */}
                <Text style={styles.feedbackDate}>
                  {feedback.date}
                </Text>
                
              </View>
            </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>
            No feedback found in {selectedCategoryFeedback}.
          </Text>
        )}
        </ScrollView>
        </View>
      </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 30,
    marginTop: -45,
  },
  databaseIcon: {
    fontSize: 30,
    color: "#333",
    marginLeft: 20,
  },
  container: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    color: "black",
    fontSize: 18,
  },
  sectionDesc: {
    fontSize: 12,
    color: "black",
  },
  installAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    top: 0,
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
    marginBottom: 1,
  },
  installedAppsButtons: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#eee',
    marginHorizontal: 1,
    height: 30,
    width: 90,
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
    height: 150,
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 10,
  },
  appItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  appItem: {
    color: "black",
    fontSize: 12,
  },
  inDbButton: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    height: 20,
    width: 150,
    alignItems: "center",
    borderWidth: 0.5,
    marginRight: 5,
  },
  inDbText: {
    fontSize: 10,
  },
  updateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 2,
    paddingHorizontal: 10,
    height: 20,
    width: 150,
    alignItems: "center",
    borderWidth: 0.5,
    marginRight: 5,
  },
  updateButtonText: {
    color: "white",
    fontSize: 10,
  },
  feedbackItem: {
    fontSize: 12,
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  noDataText: {
    textAlign: "center",
    padding: 10,
    color: "#666",
  },
  feedbackContainer: {
    padding: 0,
    marginBottom: 5,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  appReasonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  statusDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  feedbackReason: { 
    fontSize: 10, 
    marginLeft: 5,
    marginTop: 1.5,
    fontStyle: "italic",
  },
  feedbackStatus: { 
    fontSize: 10, 
    color: "black",
  },
  feedbackDate: { 
    fontSize: 9,  
    alignSelf: "flex-end",
  },
});