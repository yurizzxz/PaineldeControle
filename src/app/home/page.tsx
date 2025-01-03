"use client";

import { useState, useEffect } from "react";
import Header from "@/app/_components/Header/header";
import { auth, db, doc, getDoc, onAuthStateChanged, collection, query, where, getDocs } from "@/app/firebaseconfig";

export default function HomeScreen() {
  const [userName, setUserName] = useState("Usuário");
  const [userEmail, setUserEmail] = useState("Email não encontrado");

  useEffect(() => {
    const fetchUserData = async (user: any) => {
      try {
        const userEmail = user.email;
        setUserEmail(userEmail || "Email não encontrado");

        const adminsRef = collection(db, "admins");
        const adminQuery = query(adminsRef, where("email", "==", userEmail));
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminData = adminSnapshot.docs[0].data();
          setUserName(adminData.name || "Usuário");
          console.log("Dados do Admin:", adminData);
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          console.log("Dados do Usuário Autenticado:", userDoc.data());
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Header title="Bem-vindo," block={userName} className="p-[70px]" />
    </div>
  );
}
