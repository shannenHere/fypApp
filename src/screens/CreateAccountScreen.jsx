import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import HeaderComponent from "../components/Header";
import { globalStyles } from "../styles/styles";
import { useNavigation,useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const CreateAccountScreen = () => {
  const { signUp, logOut, user } = useAuth(); // Get user state
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false); // Track if user has attempted submission
  const [error, setError] = useState({ email: "", password: "", confirmPassword: "" , signup: ""});

  // Use useFocusEffect to clear input fields when the screen loses focus.
  useFocusEffect(
    useCallback(() => {
      // When screen is focused, do nothing.
      return () => {
        // When the screen is unfocused, reset the fields.
        resetFields();
      };
    }, [])
  );
  
  // Use useFocusEffect to check if user is already logged in when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        Alert.alert(
          "Already Logged In",
          "You are already logged in. Do you want to log out and create a new account?",
          [
            { text: "Cancel", style: "cancel", onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Home");
              }
            }, },
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
    }, [user])
  );

  useEffect(() => {
    if (touched) {
      validateFields();
    }
  }, [email, password, confirmPassword]);

  const validateFields = () => {
    setError({
      email: email
        ? /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i.test(email)
          ? ""
          : "Invalid email format."
        : "E-mail is required.",
    password: password
      ? /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8
        ? ""
        : "Must be at least 8 chars, 1 uppercase, 1 number."
      : "Password is required.",
    confirmPassword: confirmPassword
      ? confirmPassword === password
        ? ""
        : "Passwords do not match."
      : "Please confirm your password.",
  });
  };

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError({ email: "", password: "", confirmPassword: "", signup: "" });
    setTouched(false);
  };

  const handleSignUp = async () => {
    setTouched(true);
    
    // Perform validation and get fresh errors
    const validationErrors = {
      email: email
        ? /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i.test(email)
          ? ""
          : "Invalid email format."
        : "E-mail is required.",
      password: password
        ? /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8
          ? ""
          : "Must be at least 8 chars, 1 uppercase, 1 number."
        : "Password is required.",
      confirmPassword: confirmPassword
        ? confirmPassword === password
          ? ""
          : "Passwords do not match."
        : "Please confirm your password.",
    };
  
    setError(validationErrors);
  
    // Stop if any errors exist
    if (Object.values(validationErrors).some((msg) => msg !== "")) {
      return;
    }
  
    const handleSignUp = async () => {
      try {
        const result = await signUp(email, password);
        if (result.success) {
          Alert.alert("Account Created", "Your account has been created successfully.", [
            { text: "OK", onPress: () => navigation.navigate("Login") },
          ]);
        } else {
          setError((prev) => ({
            ...prev,
            signup: result.message || "This email is already in use. Try logging in instead.",
          }));
        }
      } catch (err) {
        setError((prev) => ({
          ...prev,
          signup: err.message.includes("Network")
            ? "Network error. Please check your connection and try again."
            : "An unexpected error occurred. Please try again.",
        }));
      }
    };
    
    // Show confirmation alert before signing up
  Alert.alert(
    "Privacy Notice",
    "By creating an account, you consent to the app accessing your installed apps. However, analysis is only performed on the apps you choose to submit.",
    [
      {
        text: "Cancel",
        onPress: () => resetFields(),
        style: "cancel",
      },
      {
        text: "Proceed",
        onPress: handleSignUp,
      },
    ]
  );
};

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="Create Account" showBackButton={true} />

      <Text style={globalStyles.errorText}>{error.signup}</Text>

      <View style={globalStyles.InputContainer}>
        <View style={globalStyles.InputFields}>

          {/* Input Fields */}
          <Text style={globalStyles.InputLabel}>E-mail</Text>
          <TextInput
            style={globalStyles.input}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (touched) validateFields();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={globalStyles.errorText}>{error.email}</Text>

          <Text style={globalStyles.InputLabel}>Password</Text>
          <Text style={styles.passwordText}>*Min 8 chars, 1 uppercase, 1 number</Text>
          <TextInput
            style={globalStyles.input}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (touched) validateFields();
            }}
          />
          <Text style={globalStyles.errorText}>{error.password}</Text>

          <Text style={globalStyles.InputLabel}>Re-enter Password</Text>
          <TextInput
            style={globalStyles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (touched) validateFields();
            }}
          />
          <Text style={globalStyles.errorText}>{error.confirmPassword}</Text>
        </View>

        {/* Account Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>
          With your account, you can view privacy ratings for your installed apps, 
          manage app permissions, leave feedback, and help improve our privacy database. {"\n"}
          As a privacy-focused app, we DO NOT store or track your installed apps. 
          You can still use our app without an account.
          </Text>
        </View>

        <View style={globalStyles.InputButtonContainer}>
          {/* Navigate to Login */}
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Login" })}>
            <Text style={globalStyles.InputLinkText}>Log In Instead</Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity 
            style={globalStyles.InputButton} 
            onPress={() => {
              setTouched(true); // Start validation on button press
              handleSignUp();
            }}
          >
            <Text style={globalStyles.InputButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  passwordText: {
    fontSize: 10,
    color: 'black',
  },
  infoCard: {
    marginTop: 10,
    marginHorizontal: 0,
    marginBottom: 20,
  },
  infoCardTitle: {
    fontSize: 11,
    marginBottom: 5,
    color: "#333",
    textAlign: "justify",
  },
  infoCardText: {
    fontSize: 10,
    lineHeight: 18,
  },
});

export default CreateAccountScreen;
