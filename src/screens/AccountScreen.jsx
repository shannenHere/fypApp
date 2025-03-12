import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import HeaderComponent from '../components/Header';
import { InstalledApps } from 'react-native-launcher-kit';
import { globalStyles } from '../styles/styles';

const AccountScreen = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentAppPackage = "com.privacyratingapp";  

  useEffect(() => {
    const fetchApps = async () => {
      try {
        console.log("Fetching installed apps...");
        const result = await InstalledApps.getApps();

        // Exclude the current app
        let filteredApps = result.filter(app => app.packageName !== currentAppPackage);

        // Check if TikTok is installed under either package name
        const tiktokIndex = filteredApps.findIndex(app =>
          app.packageName === "com.ss.android.ugc.trill" ||
          app.packageName === "com.zhiliaoapp.musically"
        );

        if (tiktokIndex !== -1) {
          console.log("TikTok found at index:", tiktokIndex);

          // We'll rename the TikTok entry so that its packageName is "com.zhiliaoapp.musically"
          // and label is "TikTok"
          const originalTikTokApp = filteredApps[tiktokIndex];
          const forcedTikTok = {
            ...originalTikTokApp,
            packageName: "com.zhiliaoapp.musically",
            label: "TikTok",
          };

          // Remove any existing TikTok entries
          filteredApps = filteredApps.filter(
            app =>
              app.packageName !== "com.ss.android.ugc.trill" &&
              app.packageName !== "com.zhiliaoapp.musically"
          );

          // Insert the forced TikTok entry at the original index
          filteredApps.splice(tiktokIndex, 0, forcedTikTok);
        }

        console.log("Final list (after TikTok logic):", filteredApps.map(a => a.packageName));
        setApps(filteredApps);
      } catch (error) {
        console.error("Error fetching installed apps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[globalStyles.container, { flex: 1 }]}>
        <HeaderComponent title="Account" showBackButton={true} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Installed App IDs
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={apps}
            keyExtractor={(item) => item.packageName}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
                <Text style={{ fontSize: 16 }}>
                  {item.packageName} {item.label ? `(${item.label})` : ''}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AccountScreen;
