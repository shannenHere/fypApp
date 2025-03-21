import React, { createContext, useState, useContext } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light"); // Default theme is "light"

    // Toggle Theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    // Define theme colors based on light or dark theme
    const themeColors = theme === "light" ? { text: "#000", background: "#fff" } : { text: "#fff", background: "#333" };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook to Use Theme
export const useTheme = () => useContext(ThemeContext);
