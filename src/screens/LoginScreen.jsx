import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal } from "react-native";
import HeaderComponent from "../components/Header";
import { globalStyles } from "../styles/styles";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "react-native";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
const { user, logIn, forgotPassword } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({ email: "", password: "", login: "" });
  const [touched, setTouched] = useState(false);

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotTouched, setForgotTouched] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      // When screen gains focus, if user is logged in, alert them.
      if (user) {
        Alert.alert(
          "Already Logged In",
          "You are already logged in. ",
          [
            { 
              text: "OK",  
              onPress: () => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("Home");
                }
              } 
            }
          ]
        );
      }
      // Cleanup function: clear fields when screen loses focus.
      return () => {
        setEmail("");
        setPassword("");
        setError({ email: "", password: "", confirmPassword: "", signup: "" });
        setTouched(false);
      };
    }, [user, navigation])
  );


  // Validate fields when they change (after first submission)
  useEffect(() => {
    if (touched) {
      validateFields();
    }
  }, [email, password]);

  const validateFields = () => {
    setError((prev) => ({
      ...prev,
      email: email
        ? emailRegex.test(email)
          ? ""
          : "Please insert valid email format."
        : "E-mail is required.",
      password: password ? "" : "Password is required.",
      login: "", // Clear overall login error
    }));
  };

  const handleLogin = async () => {
    setTouched(true);

    // Perform basic validation
    const validationErrors = {
      email: email
        ? emailRegex.test(email)
          ? ""
          : "Please insert valid email format."
        : "E-mail is required.",
      password: password ? "" : "Password is required.",
    };

    setError(validationErrors);
    // Stop if any validation error exists
    if (Object.values(validationErrors).some((msg) => msg !== "")) {
      return;
    }

    try {
      const result = await logIn(email, password);
      if (result.success) {
        navigation.navigate("Home");
      } else {
        // If the error message indicates the user is not found, redirect to Create Account
        if (result.message === "User not found") {
          Alert.alert(
            "Email Not Registered",
            "The email you entered is not registered. Would you like to create an account?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Create Account", onPress: () => navigation.navigate("Main", { screen: "CreateAccount" }) },
            ]
          );
        } else {
          setError((prev) => ({ ...prev, login: result.message || "Invalid email or password. Please try again." }));
        }
      }
    } catch (err) {
      setError((prev) => ({
        ...prev,
        login: err.message.includes("Network")
          ? "Network error. Please check your connection and try again."
          : "An unexpected error occurred. Please try again.",
      }));
    }
  };

  // Open the forgot password modal
  const openForgotModal = () => {
    setForgotEmail(""); // Reset modal email field
    setForgotError("");
    setForgotModalVisible(true);
  };

  const validateForgotEmail = (email) => {
    if (!email) return "E-mail is required.";
    if (!emailRegex.test(email)) return "Invalid email format.";
    return "";
  };
  
  // Handle submission from forgot password modal
  const handleForgotSubmit = async () => {
    setForgotTouched(true);
    const validationError = validateForgotEmail(forgotEmail);
    setForgotError(validationError);

    if (validationError) {
    return;
    }
    
    try {
      const result = await forgotPassword(forgotEmail);
      if (result.success) {
        Alert.alert(
          "Password Reset",
          `A new password has been sent to your email: ${forgotEmail}. Please check your inbox.`
        );
        setForgotModalVisible(false);
      } else {
        if (result.message && result.message.toLowerCase().includes("user not found")) {
          Alert.alert(
            "Email Not Registered",
            "The email you entered is not registered. Would you like to create an account?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Create Account", onPress: () => navigation.navigate("Main", { screen: "CreateAccount" }) },
            ]
          );
          setForgotModalVisible(false);
        } else {
          setForgotError(result.message || "Failed to reset password. Please try again.");
        }
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setForgotError("An error occurred. Please try again later.");
    }
  };

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="Log In" showBackButton={true} />

      <View style={globalStyles.InputContainer}>
        <View style={globalStyles.InputFields}>
          <Text style={globalStyles.errorText}>{error.login}</Text>
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
        </View>

        {/* Forgot Password Button */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={openForgotModal}>
          <Text 
            style={[styles.forgotPasswordText]}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={globalStyles.InputButtonContainer}>
          {/* Navigate to Create Account */}
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "CreateAccount" })}>
            <Text style={globalStyles.InputLinkText}>Create Account</Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity 
            style={globalStyles.InputButton} 
            onPress={() => {
              setTouched(true);
              handleLogin();
            }}>
            <Text style={globalStyles.InputButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Reset Password</Text>
            <Text style={modalStyles.modalLabel}>Enter your email address:</Text>
            <TextInput
              style={globalStyles.input}
              value={forgotEmail}
              onChangeText={(text) => {
                setForgotEmail(text);
                if (forgotTouched) {
                  const err = validateForgotEmail(text);
                  setForgotError(err);
                }
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="example@example.com"
            />
            <Text style={modalStyles.errorText}>{forgotError}</Text>
            <View style={modalStyles.modalButtonContainer}>
              <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                <Text style={modalStyles.modalLinkButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.modalButton} 
                onPress={() => {
                  setForgotTouched(true);
                  handleForgotSubmit();
                }}
              >
                <Text style={modalStyles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    top: -20,
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 12,
  }
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 25,
    marginBottom: 20,
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "black",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 3,
    padding: 10,
    fontSize: 14,
    height: 30,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 150,
    left: 20,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalLinkButton: {
      color: "#007bff", 
      textAlign: "center", 
      marginTop: 10,
  }
});

export default LoginScreen;
