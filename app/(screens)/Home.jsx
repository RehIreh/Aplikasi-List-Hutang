import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, Switch } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, addDoc, query, where, onSnapshot,
  deleteDoc, updateDoc, doc, orderBy
} from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [debts, setDebts] = useState([]);
  const [showPaid, setShowPaid] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const router = useRouter();

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/Login");
      } else {
        setUser(currentUser);
      }
      setLoadingUser(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "hutang"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDebts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filtered = showPaid
        ? allDebts.filter((item) => item.lunas)
        : allDebts.filter((item) => !item.lunas);
      setDebts(filtered);

      const totalAmount = filtered.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
      setTotal(totalAmount);
    });

    return unsubscribe;
  }, [user, showPaid]);

  const addDebt = async () => {
    if (name.trim() === "" || amount.trim() === "") return;

    await addDoc(collection(db, "hutang"), {
      name,
      amount: parseFloat(amount),
      lunas: false,
      createdAt: new Date(),
      userId: user.uid,
    });

    setName("");
    setAmount("");
  };

  const toggleLunas = async (id, status) => {
    await updateDoc(doc(db, "hutang", id), { lunas: !status });
  };

  const deleteDebt = async (id) => {
    await deleteDoc(doc(db, "hutang", id));
  };

  const startEdit = (debt) => {
    setEditingDebt(debt);
    setEditName(debt.name);
    setEditAmount(debt.amount.toString());
  };

  const saveEdit = async () => {
    if (!editingDebt) return;

    await updateDoc(doc(db, "hutang", editingDebt.id), {
      name: editName,
      amount: parseFloat(editAmount),
    });

    setEditingDebt(null);
    setEditName("");
    setEditAmount("");
  };

  const logout = async () => {
    await signOut(auth);
    router.replace({ pathname: "/Login", params: { reset: "true" } });
  };

  if (loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#121212" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 10 }}>Daftar Hutang</Text>
      <Text style={{ color: "white" }}>Total Hutang: Rp{total.toLocaleString()}</Text>

      <TextInput
        placeholder="Nama Penghutang"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginTop: 10, color: "white" }}
      />

      <TextInput
        placeholder="Jumlah Hutang"
        placeholderTextColor="#aaa"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginTop: 10, color: "white" }}
      />

      <Button title="Tambah Hutang" onPress={addDebt} />

      {editingDebt && (
        <View style={{ backgroundColor: "#222", padding: 15, borderRadius: 10, marginVertical: 20 }}>
          <Text style={{ color: "white" }}>Edit Data Hutang</Text>
          <TextInput
            placeholder="Nama"
            placeholderTextColor="#aaa"
            value={editName}
            onChangeText={setEditName}
            style={{ borderWidth: 1, borderColor: "#555", padding: 10, borderRadius: 5, marginBottom: 10, color: "white" }}
          />
          <TextInput
            placeholder="Jumlah"
            placeholderTextColor="#aaa"
            value={editAmount}
            onChangeText={setEditAmount}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: "#555", padding: 10, borderRadius: 5, marginBottom: 10, color: "white" }}
          />
          <Button title="Simpan Perubahan" onPress={saveEdit} />
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
        <Switch
          value={showPaid}
          onValueChange={setShowPaid}
          trackColor={{ false: "#555", true: "#81b0ff" }}
          thumbColor={showPaid ? "#2196F3" : "#ccc"}
        />
        <Text style={{ color: "white", marginLeft: 10 }}>
          {showPaid ? "Tampilkan hutang yang sudah lunas" : "Tampilkan hutang yang belum lunas"}
        </Text>
      </View>

      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#1e1e1e", padding: 15, marginVertical: 5, borderRadius: 8 }}>
            <Text style={{ fontSize: 16, color: item.lunas ? "#999" : "white", textDecorationLine: item.lunas ? "line-through" : "none" }}>
              {item.name}
            </Text>
            <Text style={{ color: "#aaa" }}>Jumlah: Rp{parseFloat(item.amount).toLocaleString()}</Text>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <Button title={item.lunas ? "Belum Lunas" : "Lunas"} onPress={() => toggleLunas(item.id, item.lunas)} />
              <View style={{ width: 10 }} />
              <Button title="Hapus" color="red" onPress={() => deleteDebt(item.id)} />
              <View style={{ width: 10 }} />
              <Button title="Edit" onPress={() => startEdit(item)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "gray", marginTop: 20 }}>Belum ada data hutang</Text>}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" color="red" onPress={logout} />
      </View>
    </View>
  );
}
