import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import HeaderComponent from "../components/Header"; // Example custom header
import { globalStyles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import { getAppIds } from "../api/api"; // Import your API function

const PAGE_SIZE = 8;

const SearchScreen = () => {
  const [apps, setApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Calculate the range of displayed items
  const totalApps = filteredApps.length;
  const totalPages = Math.ceil(totalApps / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalApps);

  // Get current page's data
  const paginatedApps = filteredApps.slice(startIndex - 1, endIndex);

  // Handlers for page navigation
  const nextPage = () => {
    if (endIndex < totalApps) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };  

  // Reset page when search term or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleCategoryPress = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory("All");
    } else {
      setSelectedCategory(category);
    }
  };

  // Navigate to details screen
  const handleAppPress = (app) => {
    // Pass app_id (or other relevant data) to the details screen
    navigation.navigate("AppDetailsScreen", { appId: app.app_id });
  };

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="Search" showBackButton={true} />

      <View style={globalStyles.screenContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <TextInput
            style={styles.searchInput}
            placeholder="Search for an App..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            />
            {/* Clear Search Button */}
            {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm("")} style={styles.searchIcon}>
                    <Icon name="times" style={styles.clearIcon} />
                </TouchableOpacity>
            )}
            <Icon name="search" style={styles.searchIcon} />
        </View>

        {/* “Not finding the app?” link */}
        <TouchableOpacity onPress={() => console.log("Handle 'Not finding the app?' logic")}>
                <Text style={styles.notFindingText}>Not finding the app?</Text>
        </TouchableOpacity>

        {/* Category Filter Buttons */}
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

            {/* Right Column: "Good", "Okay", and "Bad" buttons */}
            <View style={styles.rightColumn}>
                <View style={styles.installedAppsCategory}>
                {['Good', 'Okay', 'Bad'].map((category) => (
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

        {/* Scrollable List of Apps */}
        <FlatList
            data={paginatedApps}
            keyExtractor={(item) => item.app_id.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultRow} onPress={() => handleAppPress(item)}>
                {item.icon_url ? (
                    <Image source={{ uri: item.icon_url }} style={styles.appIcon} />
                ) : (
                    <View style={styles.appIcon}>
                    <Text style={styles.noIconText}>No Icon</Text>
                    </View>
                )}
                <Text style={styles.resultText}>{item.app_name}</Text>
                </TouchableOpacity>
            )}
            contentContainerStyle={styles.FlatList}
            showsVerticalScrollIndicator={false}
            />

        <View style={styles.listInfo}>
            {/* Apps Count Info */}
            <Text style={styles.resultsInfoText}>
                Showing {endIndex} of {totalApps} apps
            </Text>

            {/* Pagination Controls */}
            <View style={styles.paginationContainer}>
                <TouchableOpacity onPress={prevPage} disabled={currentPage === 1}>
                    <Icon
                        name="angle-left"
                        size={40}
                        style={[
                        styles.paginationButton,
                        currentPage === 1 ? styles.paginationButtonDisabled : styles.paginationButtonLeftActive,
                        ]}
                    />
                </TouchableOpacity>

                <Text style={styles.resultsInfoText}>
                    Page {currentPage} of {totalPages}
                </Text>

                <TouchableOpacity onPress={nextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    <Icon
                        name="angle-right"
                        size={40}
                        style={[
                        styles.paginationButton,
                        (currentPage === totalPages || totalPages === 0) ? styles.paginationButtonDisabled : styles.paginationButtonRightActive,
                        ]}
                    />
                </TouchableOpacity>
            </View>
        </View>

        </View>
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
    marginRight: 90,
    height: 30,
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
    marginHorizontal: 12,
    marginTop: 5,
    marginBottom: 5,
  },
  FlatList: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 90,
    height: 400,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  appIcon: {
    width: 40,  
    height: 40, 
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 5,
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
  installAppsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    left: 12,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    right: 90,
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
    width: 70,
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
  resultsInfoText: {
    fontSize: 10,
    marginTop: 15,
  },
  listInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    marginLeft: 10,
    marginRight: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    right: 85,
    width: 110,
    justifyContent: "space-between",
  },
  paginationButtonLeftActive: {
    color: "grey",
  },
  paginationButtonRightActive: {
    color: "#007AFF", 
  },
  paginationButtonDisabled: {
    color: "transparent",
  },
});
