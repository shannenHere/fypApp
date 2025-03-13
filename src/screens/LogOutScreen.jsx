import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { globalStyles } from "../styles/styles";

const LogOutScreen = () => {
    const { logOut } = useAuth();
    const navigation = useNavigation();
    const [isLoggingOut, setIsLoggingOut] = useState(true);

    useEffect(() => {
        const handleLogout = async () => {
            await logOut(); // Log the user out

            Alert.alert("Logged Out", "You have been logged out successfully.", [
                {
                    text: "OK",
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Home" }], // Ensure "Home" is correctly named
                        });
                    },
                },
            ]);

            setIsLoggingOut(false); // Update state after logout
        };

        handleLogout();
    }, []);

    return (
        <View style={globalStyles.container}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Logging out...</Text>
            {isLoggingOut && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
};

export default LogOutScreen;
