import React, {useState} from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from "@react-navigation/native";

const CreateAccountScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Create Account" showBackButton={true}/>

            <View style={globalStyles.InputContainer}>
                <View style={globalStyles.InputFields}>
                    {/* Input Fields*/}
                    <Text style={globalStyles.InputLabel}>E-mail</Text>
                    <TextInput
                        label="E-mail"
                        style = {globalStyles.input}
                        value = {email}
                        onChangeText={setEmail} 
                    />
                    <Text style={globalStyles.InputLabel}>Password</Text>
                    <TextInput
                        style = {globalStyles.input}
                        secureTextEntry
                        value = {password}
                        onChangeText={setPassword} 
                    />
                    <Text style={globalStyles.InputLabel}>Re-enter Password</Text>
                    <TextInput
                        style = {globalStyles.input}
                        secureTextEntry
                        value = {confirmPassword}
                        onChangeText={setConfirmPassword} 
                    />
                </View>

                <View style={globalStyles.InputButtonContainer}>
                    {/* Buttons */}
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={globalStyles.InputLinkText}>Log In Instead</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={globalStyles.InputButton}>
                        <Text style={globalStyles.InputButtonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default CreateAccountScreen;
