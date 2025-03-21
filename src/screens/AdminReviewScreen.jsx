import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Button} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { getOtherFeedback, updateProcessingStatus } from "../api/api"; 
import { globalStyles } from '../styles/styles';

const AdminReviewScreen = () => {
    const navigation = useNavigation();
    const [feedbackList, setFeedbackList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

const fetchOtherFeedbacks = async () => {
    try {
        const response = await getOtherFeedback(); // No need to pass app_id
        
        console.log("Feedback API Response: ", response);

        if (response.error) {
            console.error("API Error:", response.error);
            return;
        }

        if (response.length > 0) { // Directly check if array has data
            // Filter out feedback that has already been approved or rejected
            const filteredFeedback = response.filter(feedback => {
                const status = feedback.status ? feedback.status.trim().toLowerCase() : "";
                return !(status.startsWith("rejected") || status.startsWith("approved"));
            });                           

            feedbackList.forEach(f => console.log(`Status: '${f.status}'`));

            // Sort feedback by date in descending order (latest first)
            const sortedFeedback = filteredFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));
            setFeedbackList(sortedFeedback);
        } else {
            setFeedbackList([]);
        }
    } catch (error) {
        console.error("Error fetching feedback:", error);
    }
};

    useEffect(() => { 
        fetchOtherFeedbacks();
      }, []);

    // Handle Approve or Reject
    const handleAction = async (feedback, isApproved) => {
        if (isApproved) {
            await updateProcessingStatus(feedback.feedback_id, feedback.user_id, "Approved. Changes done.");
            fetchOtherFeedbacks(); // Refresh feedback list
        } else {
            setSelectedFeedback(feedback);
            setModalVisible(true); // Show modal for rejection reason
        }
    };

    // Handle Rejection Submission
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            Alert.alert("Please enter a valid reason.");
            return;
        }
        await updateProcessingStatus(selectedFeedback.feedback_id, selectedFeedback.user_id, `Rejected. ${rejectionReason}`);
        setModalVisible(false);
        setRejectionReason("");
        fetchOtherFeedbacks(); // Refresh feedback list
    };
    
    
    return (
        <View style={globalStyles.container}>
            <View style={styles.header}>
            <TouchableOpacity
            onPress={() => navigation.goBack()} 
            style={globalStyles.iconButton}
            >
            <Icon name="arrow-left" style={globalStyles.backIcon} />
            </TouchableOpacity>
        </View>
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Review</Text>
            <ScrollView style={styles.sectionContentScrollView}>
            {feedbackList.length === 0 ? (
                <Text style={styles.noText}>No feedback available</Text>
            ) : (
                feedbackList.map((feedback, index) => (
                    <View key={index} style={styles.feedbackContainer}>
                        <View>
                            <View style={styles.nameEmailDateContainer}>
                                <Text style={styles.appName}>{feedback.app_name}</Text>
                                {/* User Email & Date */}
                                <View>
                                    <Text style={styles.feedbackUser}>{feedback.user_email || "Unknown User"}</Text>
                                    <Text style={styles.feedbackDate}>{feedback.date || "No Date"}</Text>
                                </View>
                            </View>

                            {/* Change & Reason (Only Show If Available) */}
                            {/* Change & Reason (Only Show If Available) */}
                            <Text style={styles.feedbackText}>{`Reason: ${feedback.otherReason || "None"}`}</Text>
                            <Text style={styles.feedbackText}>{`Change: ${feedback.otherItemChange || "None"}`}</Text>


                            {/* Approve & Reject Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleAction(feedback, false)}
                                >
                                    <Text style={styles.buttonText}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => handleAction(feedback, true)}
                                >
                                    <Text style={styles.buttonText}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
        </View>
        {/* Modal for Rejection Reason */}
        <Modal 
            visible={modalVisible} 
            transparent={true} 
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
        >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContainer}>
                        <Text style={modalStyles.modalTitle}>Reject Review</Text>
                        <Text style={modalStyles.modalLabel}>Enter Rejection Reason:</Text>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="Type your reason here..."
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        <View style={modalStyles.modalButtonContainer}>
                                <TouchableOpacity
                                    //style={globalStyles.InputButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={modalStyles.modalLinkButton}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={modalStyles.modalButton}
                                    onPress={handleReject}
                                >
                                    <Text style={modalStyles.modalButtonText}>Reject</Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AdminReviewScreen;

const styles = StyleSheet.create({
    header: {
      backgroundColor: "#d7d7d7",
      height: 60,
    },
    container: {
        marginLeft: 40,
        marginHorizontal: 20,
    },
    screenTitle: {
        fontSize: 25,
        color: "black",
    },
    sectionContentScrollView: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        marginBottom: 5,
        marginTop: 20,
      },
    feedbackContainer: {
        backgroundColor: "#d7d7d7",
        marginBottom: 20,
        padding: 10,
        height: 120,
    },
    appName: {
        color: "black",
        fontWeight: "bold",
        fontSize: 20,
    },
    nameEmailDateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    feedbackUser: {
        textAlign: "right",
        fontSize: 10,
    },
    feedbackDate: {
        fontSize: 10,
    },
    feedbackText: {
        fontSize: 12,
        color: "black",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    button: {
        backgroundColor: "white",
        width: 80,
        height: 30,
        marginLeft: 5,
        borderWidth: 0.5,
        alignItems: "center",
        marginTop: 10,
        paddingVertical: 5,
    },
    buttonText: {
        color: "black",
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
      marginTop: 20,
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
