import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase"; // Sesuaikan path
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Gunakan useRouter dari expo-router

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login Berhasil!");
      router.replace("Home"); // Pindah ke Home setelah login
    } catch (error) {
      Alert.alert("Login Gagal", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212"}}>
      <Text style={{ fontSize: 24, fontWeight: "bold",  color:'white' }}>Login</Text>
      <TextInput placeholder="Email" onChangeText={setEmail} value={email} style={{ borderWidth: 1, padding: 10, width: "80%", marginVertical: 5, color:'white' }} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} style={{ borderWidth: 1, padding: 10, width: "80%", marginVertical: 5,  color:'white' }} />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => router.push("/SignUp")} style={{ marginTop: 10, color: "blue" }}>
        Belum punya akun? Daftar
      </Text>
    </View>
  );
}