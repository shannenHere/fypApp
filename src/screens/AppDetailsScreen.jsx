import React from "react";
import { View } from "react-native";
import HeaderComponent from "../components/Header";

const AppDetailsScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <HeaderComponent title="App Details" showBackButton={true}/>
      {/* App details content */}
    </View>
  );
};

export default AppDetailsScreen;
