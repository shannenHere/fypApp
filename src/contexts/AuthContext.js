import React, { createContext, useState, useContext } from "react";
import { registerUser, loginUser } from "../api/api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Sign up function using API instead of Firebase
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
      alert(result.error);
      return false;
    }

    setUser({ email, isAdmin: result.is_admin }); // Store user info
    return true;
  };

  // Log out function
  const logOut = () => {
    setUser(null);
    alert("You have been logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
