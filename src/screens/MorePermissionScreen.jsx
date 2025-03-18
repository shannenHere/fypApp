import React, {useCallback} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import { globalStyles } from '../styles/styles';
import { useRoute, useNavigation } from "@react-navigation/native";
import { getWorstPermissions, getAllPermissions } from "../utils/stringToJSONUtils";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../contexts/AuthContext";

const MorePermissionScreen = () => {
    const { user } = useAuth();
    const route = useRoute();
    const { installedStatus, appDetails } = route.params;
    const navigation = useNavigation();

    const cleanedWorstPermissions = getWorstPermissions(appDetails.worst_permissions);
    const allPermissions = getAllPermissions(appDetails.permissions);

    const avgPermissionSentiment = appDetails.permission_sentiment;

    // Prevent rerenders
    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const HeaderRow = ({ title, count }) => (
            <View style={styles.headerRow}>
                <Text style={styles.headerText}>{title}</Text>
                <Text style={styles.count}>Total items: {count}</Text>
            </View>
    );

    const SentenceList = ({ data }) => (
        <ScrollView style={styles.listContainer}>
            {data.map((item, index) => (
                <View key={index} style={styles.card}>
                    {item.score && (
                        <View style={styles.scoreContainer}>
                            <Text style={styles.score}>{item.score}</Text>
                        </View>
                    )}
                    {!item.score && (
                        <View style={[styles.scoreContainer, { justifyContent: "center", alignItems: "center" }]}>
                             <Icon 
                                name={permissions.find(p => p.category.toLowerCase() === item.permission.toLowerCase())?.icon || "ellipsis-h"} 
                                size={20} 
                                color="black" 
                            />
                        </View>
                    )}
                    <View style={styles.listDesc}>
                        <Text style={styles.terms}>
                            {item.permission}
                        </Text>
                        <Text style={styles.sentence}>
                            {item.description}
                        </Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const permissions = [
        { category: "Identity", icon: "id-card" },
        { category: "Network-based", icon: "globe" },
        { category: "Location", icon: "location-dot" },
        { category: "GPS and Network-based", icon: "map" },
        { category: "Camera", icon: "camera" },
        { category: "Microphone", icon: "microphone" },
        { category: "Contacts", icon: "address-book" },
        { category: "Storage", icon: "hdd-o" },
        { category: "SMS", icon: "envelope" },
        { category: "SMS or MMS", icon: "comments" },
        { category: "MMS", icon: "image" },
        { category: "WAP", icon: "link" },
        { category: "Phone", icon: "phone" },
        { category: "Photos/Media/Files", icon: "folder" },
        { category: "Device ID & Call Information", icon: "hashtag" },
        { category: "Other / Unknown", icon: "ellipsis-h" }
    ];

    return (
        <View style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleGoBack} 
                    style={globalStyles.iconButton}
                >
                    <Icon name="arrow-left" style={globalStyles.backIcon} />
                </TouchableOpacity>
            </View>
            {/* Installed Status */}
            {user?.id && (
            <View style={styles.installedStatusContainer}>
                <Text style={styles.installedStatus}>{installedStatus}</Text>
            </View>
            )}
        {/* Icons for update database*/}
        <View style={styles.iconRow}>
            <Text style={styles.screenTitle}>More Permission Details:</Text>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("UpdateDatabaseScreen", {
                app: appDetails
                })}>
                <Icon name="database" style={styles.databaseIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("MoreFeedbacksScreen")}>
                <Icon name="commenting-o" style={styles.feedbackIcon} />
                </TouchableOpacity>
            </View>
        </View>
        {/* Top Section: Icon, Name, Rating, Installed Status */}
        <View style={styles.topSection}>
            {/* App Icon */}
            {appDetails.icon_url ? (
            <Image source={{ uri: appDetails.icon_url }} style={styles.appIcon} />
            ) : (
            <View style={[styles.appIcon, styles.iconPlaceholder]}>
                <Text style={{ color: "#888" }}>No Icon</Text>
            </View>
            )} 
        {/* App Name and Rating */}
        <View style={styles.nameRatingContainer}>
            <View style={styles.nameContainer}>
            <Text style={styles.appName}>{appDetails.app_name}</Text>
            {appDetails.rating === "good" && (
                <View style={[styles.ratingContainer, {backgroundColor: "#008000"}]}>
                <Text style={styles.appRating}>{appDetails.rating}</Text>
                </View>
            )}
            {appDetails.rating === "okay" && (
                <View style={[styles.ratingContainer, {backgroundColor: "#FFA500"}]}>
                <Text style={styles.appRating}>{appDetails.rating}</Text>
                </View>
            )}
            {appDetails.rating === "bad" && (
                <View style={[styles.ratingContainer, {backgroundColor: "#FF0000"}]}>
                <Text style={styles.appRating}>{appDetails.rating}</Text>
                </View>
            )}
            </View>
            <View style={styles.avgScoreContainer}> 
                <Text style={styles.avgScoreTitle}>Average permission score: </Text>
                <Text style={styles.avgScore}>{avgPermissionSentiment}</Text>
            </View>
        </View>  
    </View>
       {/* All Permission Details */}
        <View style={styles.container}>
            <HeaderRow title="All Permissions" count={allPermissions.length} />
            <Text style={styles.headerDesc}>These are all the permissions this app uses.</Text>
            <SentenceList data={allPermissions} type="all" />

            <HeaderRow title="Dangerous Permissions" count={cleanedWorstPermissions.length} />
            <Text style={styles.headerDesc}>These permissions are considered dangerous because they collect user data and are included in the analysis.</Text>
            <SentenceList data={cleanedWorstPermissions} type="worst" />

            <TouchableOpacity>

            </TouchableOpacity>
        </View>
    </View>
    );
};

export default MorePermissionScreen;

const styles = StyleSheet.create({
    header: {
      backgroundColor: "#d7d7d7",
      height: 60,
    },
      installedStatusContainer:{
        marginLeft: 50,
        backgroundColor: "#e8e8e8",
        width: 90,
        top: -8,
        height: 30,
        alignItems: "center",
        borderWidth: 1,
        marginTop: -40,
      },
      installedStatus: {
        fontSize: 12,
        color: "black",
        marginVertical: 5,
      },
      iconRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginRight: 30,
        marginLeft: 40,
        top: 15,
      },
      screenTitle: {
        fontSize: 20,
      },
      iconContainer:{
        flexDirection: "row",
      },
      databaseIcon: {
        fontSize: 25,
        color: "#333",
        marginLeft: 20,
      },
      feedbackIcon: {
        fontSize: 28,
        color: "#333",
        marginLeft: 15,
        bottom: 3,
      },
      topSection: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
        marginHorizontal: 30,
        left: 10,
      },
      appIcon: {
        width: 45,
        height: 45,
        borderWidth: 1,
        borderColor: "black",
      },
      iconPlaceholder: {
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        top: 5,
      },
      nameRatingContainer:{
        marginLeft: 10,
        width: "100%",
        top: 5,
      },
      nameContainer: {
      },
      appName: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#000",
        flexWrap: "wrap",
        maxWidth: "90%",
        top: 5,
      },
      ratingContainer: {
        padding: 0,
        width: 50,
        alignItems: "center",
        alignSelf: "flex-end",
        right: 65,
        height: 15,
        top: 20,
        borderWidth: 0.5,
      },
      appRating: {
        fontSize: 10,
        color: "white",
        paddingLeft: 2,
      },
      avgScoreContainer:{
        bottom: 10,
      },
      avgScoreTitle: {
        color: "black",
        fontSize: 13,
      },
      avgScore: {
        fontSize: 10,
        top: 2,
      },
      container: {
        marginHorizontal: 30,
        marginLeft: 40,
        top: 0,
      },
      listContainer: {
        height: 193,
        borderWidth: 1,
        marginTop: -5,
        marginBottom: 10,
        paddingHorizontal: 5,
        paddingVertical: 3,
      },
      headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 16,
        color: "black",
    },
    count: {
        fontSize: 12,
    },
    headerDesc: {
        fontSize: 10,
        marginTop: -13,
        marginBottom: 7,
        color: "black",
    },
    card: {
        marginVertical: 5,
        flexDirection: "row",
    },
    scoreContainer: {
        borderWidth: 0.5,
        alignItems: "center", 
        height: 35,
        width: 35,
        marginBottom: 1,
    },
    score: {
        color: "black",
        paddingTop: 8,
    },
    listDesc: {
        marginLeft: 5,
    },
    terms: {
        fontSize: 12,
        color: 'black',
    },
    sentence: {
        fontSize: 12,
    },
});
