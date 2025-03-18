import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';

const MoreAppDetailsScreen = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([
    { email: 'user1@example.com', date: '2025-03-17', text: 'Great app, easy to use!' },
    { email: 'user2@example.com', date: '2025-03-16', text: 'Needs improvements in UI.' },
    { email: 'user3@example.com', date: '2025-03-15', text: 'Privacy features are excellent!' },
  ]);

  const appDetails = {
    developer_name: 'Awesome Devs',
    version: '1.0.3',
    change_log: 'Bug fixes and performance improvements.',
    contact_info: 'contact@awesomedevs.com',
    permissions: [
      { permission: 'Camera', description: 'Allows the app to take pictures' },
      { permission: 'Location', description: 'Access your location for weather updates' },
    ],
    privacy_practices: [
      { sensitiveTerms: 'Data Sharing', sentence: 'We do not share your personal data.' },
      { sensitiveTerms: 'Data Retention', sentence: 'We retain data for 30 days.' },
    ],
  };

  const handleFeedbackSubmit = () => {
    const newFeedback = {
      email: 'user@example.com',
      date: new Date().toISOString().split('T')[0], // Current date
      text: feedbackText,
    };
    setFeedbackList([newFeedback, ...feedbackList]);
    setFeedbackText('');
    Alert.alert('Feedback Submitted', 'Thank you for your feedback!');
  };

  return (
    <View style={globalStyles.container}>
      <HeaderComponent title="More App Details" showBackButton={true} />

      <ScrollView style={{ flex: 1, padding: 10 }}>

        {/* App Details Section */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>App Details</Text>
          <Text style={globalStyles.detailTitle}>Developer:</Text>
          <Text>{appDetails.developer_name}</Text>
          <Text style={globalStyles.detailTitle}>Version:</Text>
          <Text>{appDetails.version}</Text>
          <Text style={globalStyles.detailTitle}>Change Log:</Text>
          <Text>{appDetails.change_log}</Text>
          <Text style={globalStyles.detailTitle}>Contact:</Text>
          <Text>{appDetails.contact_info}</Text>
        </View>

        {/* Feedback Section */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Feedback</Text>
          <ScrollView style={globalStyles.sectionContentScrollView}>
            {feedbackList.map((item, index) => (
              <View key={index} style={globalStyles.feedbackItem}>
                <Text style={globalStyles.feedbackUser}>{item.email}</Text>
                <Text style={globalStyles.feedbackDate}>{item.date}</Text>
                <Text style={globalStyles.feedbackText}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>
          <TextInput
            style={globalStyles.input}
            placeholder="Enter your feedback"
            value={feedbackText}
            onChangeText={setFeedbackText}
          />
          <TouchableOpacity style={globalStyles.submitButton} onPress={handleFeedbackSubmit}>
            <Text style={globalStyles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Permissions Section */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Permissions</Text>
          {appDetails.permissions.map((permission, index) => (
            <View key={index} style={globalStyles.sectionRow}>
              <Text style={globalStyles.itemTitle}>{permission.permission}</Text>
              <Text style={globalStyles.itemDesc}>{permission.description}</Text>
            </View>
          ))}
        </View>

        {/* Privacy Practices Section */}
        <View style={globalStyles.section}>
          <Text style={globalStyles.sectionTitle}>Privacy Practices</Text>
          {appDetails.privacy_practices.map((practice, index) => (
            <View key={index} style={globalStyles.sectionRow}>
              <Text style={globalStyles.itemTitle}>{practice.sensitiveTerms}</Text>
              <Text style={globalStyles.itemDesc}>{practice.sentence}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
};

export default MoreAppDetailsScreen;
