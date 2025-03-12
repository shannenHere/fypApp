import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator } from 'react-native';
import HeaderComponent from '../components/Header';
import { InstalledApps } from 'react-native-launcher-kit';
import { globalStyles } from '../styles/styles';

const AccountScreen = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentAppPackage = "com.fyp";  // Your app's package name

    useEffect(() => {
        const fetchApps = async () => {
            try {
                console.log("Fetching installed apps...");
                const result = await InstalledApps.getApps();

                // Exclude the current app
                const filteredApps = result.filter(app => app.packageName !== currentAppPackage);

                console.log("Filtered apps:", filteredApps);
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
        <View style={{ flex: 1 }}>
            <View style={globalStyles.container}>
                <HeaderComponent title="Account" showBackButton={true} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Installed Apps</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="blue" />
                ) : (
                    <FlatList
                        data={apps}
                        keyExtractor={(item) => item.packageName}
                        renderItem={({ item }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Image
                                    source={{ uri: item.icon }}
                                    style={{ width: 40, height: 40, marginRight: 10 }}
                                />
                                <Text style={{ fontSize: 16 }}>{item.label}</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

export default AccountScreen;
