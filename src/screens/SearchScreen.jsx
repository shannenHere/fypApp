import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import HeaderComponent from "../components/Header"; // Example custom header
import { globalStyles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import { getAppIds } from "../api/api"; // Import your API function

const SearchScreen = () => {
  const [apps, setApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigation = useNavigation();

  // Fetch all apps from the database on mount
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await getAppIds(); // Calls API function
        setApps(data);
      } catch (error) {
        console.error("Error fetching apps:", error);
      }
    };
    fetchApps();
  }, []);

  // Filter apps based on the searchTerm and selected category
  const filteredApps = apps.filter((app) => {
    const matchesName = app.app_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === "All" || 
      (app.rating && app.rating.toLowerCase() === selectedCategory.toLowerCase());
    return matchesName && matchesCategory;
  });

  // Navigate to details screen
  const handleAppPress = (app) => {
    // Pass app_id (or other relevant data) to the details screen
    navigation.navigate("AppDetailsScreen", { appId: app.app_id });
  };

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="Search" showBackButton={true} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for an App..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Icon name="search" style={styles.searchIcon} />
      </View>

      {/* “Not finding the app?” link */}
      <TouchableOpacity onPress={() => console.log("Handle 'Not finding the app?' logic")}>
            <Text style={styles.notFindingText}>Not finding the app?</Text>
      </TouchableOpacity>

      {/* Category Filter Buttons */}
        <View style={styles.categoryContainer}>
            {["All", "Good", "Okay", "Bad"].map((cat) => (
            <TouchableOpacity
                key={cat}
                style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
            >
                <Text
                style={[
                    styles.categoryButtonText,
                    selectedCategory === cat && styles.categoryButtonTextSelected,
                ]}
                >
                {cat}
                </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Apps Count Info */}
      <Text style={styles.resultsInfoText}>
        Showing {filteredApps.length} of {apps.length} apps
      </Text>

      {/* Results List */}
      <ScrollView style={styles.resultsScroll}>
        {filteredApps.map((app) => (
          <TouchableOpacity key={app.app_id} style={styles.resultRow} 
            onPress={() => handleAppPress(app)}>
            {app.icon_url ? (
                <Image source={{ uri: app.icon_url }} style={styles.appIcon} />
            ) : (
                // Optionally, you can add a default fallback image or nothing
                <View style={styles.appIcon}>
                <Text style={styles.noIconText}>No Icon</Text>
                </View>
            )}
            <Text style={styles.resultText}>{app.app_name}</Text>
            </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    fontSize: 20,
    color: "#333",
    marginRight: 10,
  },
  notFindingText: {
    color: "#007AFF",
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  resultsScroll: {
    marginHorizontal: 20,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#eee",
    marginRight: 10,
  },
  noIconText: {
    fontSize: 10,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 40,
  },
  resultText: {
    fontSize: 14,
    color: "black",
  },
});
