import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import HeaderComponent from "../components/Header";
import { globalStyles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const CreateAccountScreen = () => {
  const { signUp, logOut, user } = useAuth(); // Get user state
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      Alert.alert(
        "Already Logged In",
        "You are already logged in. Do you want to log out and create a new account?",
        [
          { text: "Cancel", style: "cancel", onPress: () => navigation.goBack() },
          {
            text: "Yes, Log Out",
            onPress: async () => {
              await logOut();
              Alert.alert("Logged Out", "You have been logged out. You can now create a new account.");
            },
          },
        ]
      );
    }
  }, [user]);

  const handleSignUp = async () => {
    setError(""); // Reset error message

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const success = await signUp(email, password);
      if (success) {
        navigation.navigate("Main", { screen: "Login" }); // Navigate to login after successful signup
      } else {
        setError("Registration failed. Email may already be in use.");
      }
    } catch (error) {
      console.error("Signup Error:", error);

      if (error.message.includes("Network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="Create Account" showBackButton={true} />

      <View style={globalStyles.InputContainer}>
        <View style={globalStyles.InputFields}>
          {/* Error Message */}
          {error ? <Text style={{ color: "red", marginBottom: 5 }}>{error}</Text> : null}

          {/* Input Fields */}
          <Text style={globalStyles.InputLabel}>E-mail</Text>
          <TextInput
            style={globalStyles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={globalStyles.InputLabel}>Password</Text>
          <TextInput
            style={globalStyles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={globalStyles.InputLabel}>Re-enter Password</Text>
          <TextInput
            style={globalStyles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View style={globalStyles.InputButtonContainer}>
          {/* Navigate to Login */}
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Login" })}>
            <Text style={globalStyles.InputLinkText}>Log In Instead</Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity style={globalStyles.InputButton} onPress={handleSignUp}>
            <Text style={globalStyles.InputButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CreateAccountScreen;
