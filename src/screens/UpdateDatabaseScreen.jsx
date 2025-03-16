import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput} from 'react-native';
import HeaderComponent from '../components/Header';
import { useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { globalStyles } from '../styles/styles';

const UpdateDatabaseScreen = () => {
    const route = useRoute();
    const { app } = route.params;  
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Update Database" showBackButton={true}/>
            <View>
                <Text>App Information to Update</Text>
                <Text>App ID: {app?.app_id}</Text>
                <Text>App Name: {app?.app_name}</Text>
                <Text>Category: {app?.category}</Text>

                {/* Dropdown for Reason */}
                <Text style={styles.label}>Reason for Update</Text>
                <Picker
                    selectedValue={selectedReason}
                    onValueChange={(itemValue) => setSelectedReason(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Privacy Policy Outdated" value="policy_outdated" />
                    <Picker.Item label="Sentence Not Considered Sensitive in Analysis" value="sensitive" />
                    <Picker.Item label="Sentence Not Considered Generic in Analysis" value="generic" />
                    <Picker.Item label="Scraped Privacy Policy Text Incorrect" value="policy_incorrect" />
                    <Picker.Item label="Other Information Incorrect" value="info_incorrect" />
                    <Picker.Item label="Other" value="other" />
                </Picker>

                {selectedReason === "other" && (
                    <TextInput
                    style={styles.input}
                    placeholder="Please specify..."
                    value={otherReason}
                    onChangeText={setOtherReason}
                    />
                )}
            </View>
        </View>
    );
};

export default UpdateDatabaseScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginTop: 20,
    },
    picker: {
      width: 250,
      height: 50,
      marginTop: 10,
    },
  });