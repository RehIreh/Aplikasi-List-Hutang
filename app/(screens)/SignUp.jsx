import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { auth, db } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !name) {
      alert("Mohon isi semua data!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      alert("Akun berhasil dibuat!");
      router.replace("/Login");
    } catch (error) {
      alert("Gagal: " + error.message);
    }
  };

  return (
    <View style={{ padding: 20, flex:1, backgroundColor:'black' }}>
      <TextInput label="Nama" value={name} onChangeText={setName} mode="outlined" style={{ marginBottom: 10 }} />

      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={{ marginBottom: 10 }} />

      <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={{ marginBottom: 10 }} />

      <Button title="Daftar" onPress={handleSignup} />
      <Text onPress={() => router.push("/Login")} style={{ color: "blue", marginTop: 10 }}>
        Sudah punya akun? Login
      </Text>
    </View>
  );
}