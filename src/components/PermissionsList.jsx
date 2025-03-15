import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PermissionsList = ({ permissions, limit }) => {
  const formatPermissions = (permissions) => {
    try {
      const parsedData = JSON.parse(permissions).map(eval); // Convert string to array
      const slicedData = limit ? parsedData.slice(0, limit) : parsedData; // Limit if needed

      return slicedData.map(([category, description, risk], index) => (
        <View key={index} style={styles.permissionItem}>
          <Text style={styles.category}>{category.toUpperCase()}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.risk}>Risk Level: {risk}</Text>
        </View>
      ));
    } catch (error) {
      console.error("Error parsing permissions:", error);
      return <Text style={styles.errorText}>No permission data available.</Text>;
    }
  };

  return <View style={styles.container}>{formatPermissions(permissions)}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  permissionItem: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  category: {
    fontWeight: "bold",
    fontSize: 16,
  },
  description: {
    fontSize: 14,
  },
  risk: {
    fontSize: 14,
    color: "red",
  },
  errorText: {
    color: "gray",
    textAlign: "center",
  },
});

export default PermissionsList;
