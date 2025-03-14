import React, { createContext, useState, useContext } from "react";
import { registerUser, loginUser, forgotPassword as apiForgotPassword, checkEmail } from "../api/api"; 
import { generateRandomPassword } from "../utils/passwordUtils"; // Import the utility

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Sign up function using API
  const signUp = async (email, password) => {
    try {
      const response = await registerUser(email, password); // Use your API

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, data: response.user };
    } catch (error) {
      console.error("Signup Error:", error);
      return { success: false, message: "An error occurred during signup." };
    }
  };

  // Log in function with API call
  const logIn = async (email, password) => {
    const result = await loginUser(email, password);
    
    if (result.error) {
      return { success: false, message: result.error };
    }

    setUser({ email, isAdmin: result.is_admin }); // Store user info
    return { success: true };
  };

  // Log out function
  const logOut = () => {
    setUser(null);
  };

  // Forgot Password function with API call
  const forgotPassword = async (email) => {
    try {
      // Check if email exists in the database
      const checkResult = await checkEmail(email);
      if (checkResult.error) {
        return { success: false, message: checkResult.error };
      }
      if (!checkResult.exists) {
        return { success: false, message: "User not found" };
      }
      
      // Generate a new random password once
      const newPassword = generateRandomPassword();
      console.log("New password for", email, ":", newPassword);

      const result = await apiForgotPassword(email, newPassword);
      if (result.error) {
        return { success: false, message: result.error };
      }
      return { success: true, message: result.message };
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return { success: false, message: "An error occurred during password reset." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, logIn, logOut, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
