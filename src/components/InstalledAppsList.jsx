import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import axios from 'axios';
import { InstalledApps } from 'react-native-launcher-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppList } from '../contexts/AppListContext';
import { globalStyles } from '../styles/styles';

const API_URL = "http://10.0.2.2:5000";
const currentAppPackage = "com.privacyratingapp"; // Exclude current app

// Helper to normalize TikTok entries
const normalizeTikTok = (app) => {
  if (
    app.packageName === "com.ss.android.ugc.trill" ||
    app.packageName === "com.zhiliaoapp.musically"
  ) {
    return {
      ...app,
      packageName: "com.zhiliaoapp.musically",
      label: "TikTok",
    };
  }
  return app;
};

const InstalledAppsList = ({ filterText = '',  category = 'All'}) => {
  const { installedAppsInDB, setInstalledAppsInDB, installedAppsNotInDB, setInstalledAppsNotInDB } = useAppList();
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigation = useNavigation();

  // Fetch installed apps from device
  const fetchInstalledApps = async () => {
    try {
      console.log("Fetching installed apps from device...");
      const result = await InstalledApps.getApps();
      console.log(`Fetched ${result.length} apps from device`);
      console.log(result);
      // Exclude your own app
      let appsList = Array.from(result).filter(app => app.packageName !== currentAppPackage);
      // Normalize TikTok entries
      appsList = appsList.map(normalizeTikTok);
      // Remove duplicates (if any)
      appsList = appsList.filter(
        (app, index, self) =>
          index === self.findIndex(t => t.packageName === app.packageName)
      );
      console.log("Processed installed apps:", appsList.map(app => app.packageName));
      return appsList;
    } catch (error) {
      console.error("Error fetching installed apps:", error);
      return [];
    }
  };

  // Fetch apps from the database API
  const fetchDatabaseApps = async () => {
    try {
      console.log("Fetching apps from database API...");
      const response = await axios.get(`${API_URL}/apps`);
      console.log(`Fetched ${response.data.length} apps from database`);
      return response.data;
    } catch (error) {
      console.error("Error fetching database apps:", error);
      return [];
    }
  };

  // Merge installed apps with database apps using a dictionary for faster lookups
  const mergeAppsData = (deviceApps, databaseApps) => {
    // Create a dictionary from database apps keyed by app_id
    const dbAppsMap = {};
    databaseApps.forEach(dbApp => {
      dbAppsMap[dbApp.app_id] = dbApp;
    });
    // For each device app, if it exists in the dbAppsMap, merge data
    const merged = deviceApps.reduce((acc, app) => {
      const matchingDb = dbAppsMap[app.packageName];
      if (matchingDb) {
        acc.push({
          ...app,
          app_id: matchingDb.app_id,
          app_name: matchingDb.app_name,
          icon_url: matchingDb.icon_url,
          rating: matchingDb.rating,
          worst_permissions: matchingDb.worst_permissions,
          privacy_concern: matchingDb.privacy_concern,
        });
        console.log("Merged App:", matchingDb.app_name, "Rating:", matchingDb.rating); // Debug rating
      }
      setIsLoading(false);
      return acc;
    }, []);

    // Find installed apps that are not in database 
    const installedNotInDB = deviceApps.filter(app => !dbAppsMap[app.packageName]);
    
    // Update state
    setInstalledAppsInDB(merged);
    setInstalledAppsNotInDB(installedNotInDB);

    return merged;
  };

  // Fetch both installed apps and database apps, then merge and update state.
  const fetchAllData = async () => {
    try {
      const [deviceApps, databaseApps] = await Promise.all([
        fetchInstalledApps(),
        fetchDatabaseApps(),
      ]);
      const merged = mergeAppsData(deviceApps, databaseApps);
      console.log("Merged apps data:", merged.map(app => `${app.app_name} (${app.packageName})`));
      setInstalledAppsInDB(merged);
    } catch (error) {
      console.error("Error fetching all data:", error);
    };
  }

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, []) // Empty dependency array ensures it runs on screen focus
  );

  const handleAppClick = (app) => {
    navigation.navigate("AppDetailsScreen", { app });
  };

  const filteredApps = installedAppsInDB.filter(
    (app) =>
      (app.app_name && app.app_name.toLowerCase().includes(filterText.toLowerCase())) &&
      (category === 'All' || (app.rating && app.rating.toLowerCase() === category.toLowerCase()))
  );  

  console.log("Filtered Apps:", filteredApps.map(app => ({
    name: app.app_name,
    rating: app.rating
  })));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={true} style={styles.scrollView}>
      {isLoading ? (
          <View>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
            <View>
                <Text style={styles.noAppsText}>
                  Download some apps or explore more in the Search screen.
                </Text>
                <TouchableOpacity 
                  style={[styles.searchButton, {width: 200}]} 
                  onPress={() => navigation.navigate("Main", { screen: "Search" })}
                >
                  <Text style={[styles.searchButtonText]}>Go to Search</Text>
                </TouchableOpacity>
            </View>
          </View>
        ) : filteredApps.length === 0 ? (
          <View style={styles.noAppsContainer}>
            {category !== 'All' && (
              <Text style={styles.noAppsText}>
                No apps found in the "{category}" category.
              </Text>
            )}
  
            {category === 'All' && (
              <View>
                <Text style={styles.noAppsText}>
                  Download some apps or explore more in the Search screen.
                </Text>
                <TouchableOpacity 
                  style={styles.searchButton} 
                  onPress={() => navigation.navigate("Main", { screen: "Search" })}
                >
                  <Text style={styles.searchButtonText}>Go to Search</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredApps.map((app) => (
              <TouchableOpacity
                key={app.packageName}
                style={styles.appContainer}
                onPress={() => handleAppClick(app)}
              >
                {app.icon_url ? (
                  <Image source={{ uri: app.icon_url }} style={styles.appIcon} />
                ) : (
                  <View style={[styles.appIcon, styles.missingIcon]}>
                    <Text style={styles.missingIconText}>
                      No Icon
                    </Text>
                  </View>
                )}
                <Text style={styles.appName}>{app.app_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 330,
  },
  scrollView: {
    flexGrow: 1, // Ensures it expands properly
    top: 20,
    paddingVertical: 10,
    paddingLeft: 10,
    width: 290,
    borderWidth: 1,
    borderColor: '#cccbca',
},
gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    alignItems: 'flex-start',
},
appContainer: {
    width: '22%', // Adjusted for 4 items per row
    alignItems: 'center',
    paddingBottom: 15,
    paddingHorizontal: 5,
    marginRight: 5,
},
appIcon: {
    width: 55,  // Increased size
    height: 55, 
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: 'black',
},
appName: {
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center',
    color: 'black',
},
appPrivacyConcern: {
    fontSize: 10,
    color: 'orange',
    fontStyle: 'italic',
},
appWorstPermission: {
    fontSize: 10,
    color: 'purple',
},
missingIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  missingIconText: {
    fontSize: 8,
    textAlign: 'center',
    color: 'black',
    paddingHorizontal: 2,
  },
  noAppsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noAppsText: {
    fontSize: 14,
    color: 'gray',
    fontStyle: 'italic',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: '#d7d7d7',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginTop: 10,
    width: 250,
    marginHorizontal: 30,
  },
  searchButtonText: {
    color: 'gray',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default InstalledAppsList;
