import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { globalStyles } from '../styles/styles';

const UpdateDatabaseScreen = () => {
    const route = useRoute();
    const { app } = route.params;  
    const navigation = useNavigation();
    const [selectedReason, setSelectedReason] = useState("policy");

    const [newUrl, setNewUrl] = useState("");
    const [newPolicyText, setNewPolicyText] = useState("");

    const [sensitive_genericPicker, setSensitive_genericPicker] = useState("Sensitive");
    const [newSensitiveTerm, setNewSenstiveTerm] = useState("");
    const [newGenericTerm, setNewGenericTerm] = useState("");
    const [checkNewSensitiveTerm, setCheckNewSenstiveTerm] = useState("");
    const [checkNewGenericTerm, setCheckNewGenericTerm] = useState("");

    const [otherPicker, setOtherPicker] = useState("app_icon");
    const [otherItemChange, setOtherItemChange] = useState("");
    const [otherReason, setOtherReason] = useState("");
    return (
        <View style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[globalStyles.iconButton]}
                >
                    <Icon name="arrow-left" style={globalStyles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Update Database</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.appInfoContainer}>
                    {/* App Icon */}
                    {app.icon_url ? (
                    <Image source={{ uri: app.icon_url }} style={styles.appIcon} />
                    ) : (
                    <View style={[styles.appIcon, styles.iconPlaceholder]}>
                        <Text style={{ color: "#888" }}>No Icon</Text>
                    </View>
                    )}
                    <View style={styles.appInfoDescContainer}>
                        <Text style={styles.appInfoDescText}>{app?.app_name}</Text>
                        <Text style={[styles.appInfoDescText, {fontSize: 12}]}>{app?.app_id}</Text>
                    </View>
                </View>

                {/* Dropdown for Reason */}
                <Text style={styles.label}>Choose a Reason for Update: </Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedReason}
                        onValueChange={(itemValue) => setSelectedReason(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.itemStyle}
                    >
                        <Picker.Item style={{fontSize:13, color: "black"}} label="Privacy Policy Outdated/Incorrect" value="policy" />
                        <Picker.Item style={{fontSize:13}} label="Sensitive/Generic Sentence Incorrect" value="sensitive_generic" />
                        <Picker.Item style={{fontSize:13}} label="Other" value="other" />
                    </Picker>
                </View>
                {selectedReason === "policy" && (
                    <View style={styles.selectedReasonContainer}>
                        <View style={{backgroundColor: "#d7d7d7", padding: 5, paddingVertical: 15,}}>
                            <Text style={[styles.questionText, {marginTop: 0}]}>Current privacy policy url to re-analyze:</Text>
                            <Text style={{color: "black", fontWeight: "bold", fontSize: 12}}>{app.policy_url}</Text>
                        </View>
                        <View>
                            <Text style={styles.questionText}>Paste the new privacy policy url here if changed (optional)</Text>
                            <TextInput
                            style={styles.input}
                            value={newUrl}
                            onChangeText={(newUrl) => {
                                setNewUrl(newUrl);
                            }}
                            autoCapitalize="none"
                            placeholder="e.g.: https://instagram.com/legal/privacy"
                            />
                        </View>
                        <View>
                            <Text style={styles.questionText}>or Paste the new Privacy Policy Text Here instead (optional)</Text>
                            <TextInput
                            style={[styles.input, {height: 120}]}
                            value={newPolicyText}
                            onChangeText={(newPolicyText) => {
                                setNewPolicyText(newPolicyText);
                            }}
                            autoCapitalize="none"
                            multiline
                            />
                        </View>
                        <TouchableOpacity style={styles.selectedReasonButton}>
                                    <Text style={styles.selectedReasonButtonText}>Analyze</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedReason === "sensitive_generic" && (
                    <View style={styles.selectedReasonContainer}>
                        <View style={{backgroundColor: "#d7d7d7", padding: 10, paddingBottom: 10, marginBottom: 10}}>
                            <Text style={[styles.questionText, {fontWeight: "bold", fontSize: 15}]}>{sensitive_genericPicker} Term Update</Text>
                            <Text style={{color: "black", fontSize: 11, paddingBottom: 10}}>Your term will be checked against the database before update.</Text>
                        </View>
                        <Text style={styles.questionText}>Choose Type of Term to Update: </Text>
                        <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={sensitive_genericPicker}
                                    onValueChange={(itemValue) => setSensitive_genericPicker(itemValue)}
                                    style={styles.picker}
                                    itemStyle={styles.itemStyle}
                                >
                                    <Picker.Item style={{fontSize:13, color: "black"}} label="Sensitive" value="Sensitive" />
                                    <Picker.Item style={{fontSize:13}} label="Generic" value="Generic" />
                                </Picker>
                            </View>
                        {sensitive_genericPicker === "Sensitive" && (
                            <View>
                                <Text style={styles.questionText}>Enter Sensitive Term Not Detected:</Text>
                                <TextInput
                                    style={[styles.input]}
                                    value={newSensitiveTerm}
                                    onChangeText={setNewSenstiveTerm}
                                    placeholder = "e.g.: Precise Location"
                                    />
                            </View>
                        )}
                        {sensitive_genericPicker === "Generic" && (
                            <View>
                                <Text style={styles.questionText}>Enter Generic Term Not Detected:</Text>
                                <TextInput
                                    style={[styles.input]}
                                    value={newGenericTerm}
                                    onChangeText={setNewGenericTerm}
                                    placeholder = "e.g.: Privacy Policy" 
                                    />
                            </View>
                        )}
                        {/*Check if in Generic/Sensitve txt, if yes disabled, if no enable*/}
                        {/*Disable Update Button by default*/}
                        <TouchableOpacity style={styles.selectedReasonButton}>
                                    <Text style={styles.selectedReasonButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedReason === "other" && (
                    <View style={styles.selectedReasonContainer}>
                        <View style={{backgroundColor: "#d7d7d7", padding: 10, paddingVertical: 15, height: 100}}>
                            {otherPicker === "app_icon" && (
                                <View>
                                    <Text style={[styles.questionText, {fontSize: 15, marginTop: 0}]}>Current App icon url:</Text>
                                    <Text style={{fontWeight: "bold", color: "black", fontSize: 10}}>{app.icon_url}</Text>
                                </View>
                            )}
                            {otherPicker === "other" && (
                                <View>
                                    <Text style={[styles.questionText, {fontSize: 15, marginTop: 0}]}>Other Updates</Text>
                                    <Text style={{color: "black", fontSize: 11}}>You will be notified after an admin had approve/rejected your update in your account section.</Text>
                                    <TouchableOpacity style={[{borderWidth: 0.5, alignSelf: "flex-end", width: 120, height: 20, top: 5, alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 5}]}>
                                            <Text style={[{color: "black", fontSize: 11, padding: 2}]}>Go to Account</Text>
                                            <Icon name="angle-right" style={{color: "black"}}/>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text style={styles.questionText}>Choose an Item to Update: </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={otherPicker}
                                onValueChange={(itemValue) => setOtherPicker(itemValue)}
                                style={styles.picker}
                                itemStyle={styles.itemStyle}
                            >
                                <Picker.Item style={{fontSize:13, color: "black"}} label="App Icon" value="app_icon" />
                                <Picker.Item style={{fontSize:13}} label="Other" value="other" />
                            </Picker>
                        </View>
                        {otherPicker === "app_icon" && (
                            <View>
                                <Text style={styles.questionText}>Enter New App Icon Url:</Text>
                                <TextInput
                                style={[styles.input, {height: 100}]}
                                value={newUrl}
                                onChangeText={setNewUrl}
                                />
                            </View>
                        )}
                        {otherPicker === "other" && (
                            <View>
                                <Text style={styles.questionText}>Specify the update:</Text>
                                <TextInput
                                style={[styles.input]}
                                value={otherItemChange}
                                onChangeText={setOtherItemChange}
                                placeholder = "e.g.: App should be in Finance Category"
                                />
                                <Text style={styles.questionText}>Specify Reason:</Text>
                                <TextInput
                                style={[styles.input]}
                                value={otherReason}
                                onChangeText={setOtherReason}
                                placeholder = "e.g.: Should be opted out from analysis"
                                />
                            </View>
                        )}
                        <TouchableOpacity style={styles.selectedReasonButton}>
                                    <Text style={styles.selectedReasonButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

export default UpdateDatabaseScreen;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 50,
    },
    header: {
        flexDirection: "row",
        paddingTop: 10,
        backgroundColor: "#d7d7d7",
    }, 
    screenTitle: {
        color: "black",
        marginTop: 10,
        fontSize: 20,
        fontWeight: "bold",
    },
    appInfoContainer: {
        flexDirection: "row",
        marginTop: 20,
    },
    appIcon: {
        width: 55,
        height: 55,
    },
    iconPlaceholder: {
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
      },
    appInfoDescContainer: {
        marginLeft: 10,
    },
    appInfoDescText: {
        fontSize: 15,
        color: "black",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "black",
        height: 50,
    },
    label: {
        fontSize: 16,
        marginTop: 20,
        color: "black",
    },
    picker: {
      width: 300,
      height: 50,
      marginTop: 0,
      borderWidth: 1,
      borderColor: "black",
    },
    selectedReasonContainer: {
        marginTop: 20,
    },
    questionText: {
        color: "black",
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        height: 40,
    },
    selectedReasonButton: {
        marginTop: 20,
        backgroundColor: "#007bff",
        width: 100,
        height: 40,
        alignSelf: "flex-end",
        alignItems: "center", 
    },
    selectedReasonButtonText: {
        color: "white",
        padding: 10,
        fontWeight: "bold",
    }
  });