import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import HeaderComponent from "../components/Header";
import { globalStyles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "react-native";

const LoginScreen = () => {
const { user, logIn } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [redirecting, setRedirecting] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      Alert.alert(
        "Already Logged In",
        "You are already logged in. Redirecting to Home...",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              }),
          },
        ]
      );
    }
  }, [user]);

  if (redirecting) {
    return (
      <View style={globalStyles.container}>
        <HeaderComponent title="Already Logged In" />
        <Text style={{ color: "green", fontSize: 16, textAlign: "center", marginTop: 20 }}>
          You are already logged in. Redirecting to Home...
        </Text>
      </View>
    );
  }

  const handleLogin = async () => {
    setError(""); // Reset error

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    const success = await logIn(email, password);
    if (!success) {
      setError("Invalid email or password.");
    } else {
        navigation.navigate("Main", { screen: "Home" }); // Navigate to home if login is successful
    }
  };

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="Log In" showBackButton={true} />

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
        </View>

        <View style={globalStyles.InputButtonContainer}>
          {/* Navigate to Sign Up */}
          <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "CreateAccount" })}>
            <Text style={globalStyles.InputLinkText}>Create Account</Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity style={globalStyles.InputButton} onPress={handleLogin}>
            <Text style={globalStyles.InputButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
