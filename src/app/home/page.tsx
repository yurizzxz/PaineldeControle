"use client";

import { useState, useEffect } from "react";
import Header from "@/app/_components/Header/header";
import { auth, db, doc, getDoc, onAuthStateChanged, collection, query, where, getDocs } from "@/app/firebaseconfig";
import Link from "next/link";

export default function HomeScreen() {
  const [userName, setUserName] = useState("Usuário");
  const [userEmail, setUserEmail] = useState("Email não encontrado");

  const quickLinks = [
    {
      icon: "notifications",
      title: "Notificações",
      link: "/notifications",
    },
    {
      icon: "fitness_center",
      title: "Gyms Cadastradas",
      link: "/gyms",
    },
    {
      icon: "admin_panel_settings",
      title: "Administradores",
      link: "/admins",
    },
  ];

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
      
      <div className="mt-6 pl-[70px] pr-[70px] py-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Acesso Rápido</h2>
        <div className="flex gap-6">
          {quickLinks.map((link, index) => (
            <div key={index} className="w-1/3 bg-[#101010] border border-[#252525] p-6 rounded-md transition duration-300">
              <div className="flex items-center justify-center mb-4">
                <span className="material-icons text-[#00BB83]" style={{ fontSize: "4rem" }}>{link.icon}</span>
              </div>
              <h3 className="text-center text-white text-lg">{link.title}</h3>
              <Link href={link.link} className="block text-center text-[#00BB83] hover:text-[#008f6a] mt-2">
                Acessar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
