import React, {useState} from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import HeaderComponent from '../components/Header';
import { globalStyles } from '../styles/styles';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    return (
        <View style={globalStyles.container}>
            <HeaderComponent title="Log In" showBackButton={true}/>

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
                </View>

                <View style={globalStyles.InputButtonContainer}>
                    {/* Buttons */}
                    <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
                        <Text style={globalStyles.InputLinkText}>Create Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={globalStyles.InputButton}>
                        <Text style={globalStyles.InputButtonText}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;
