"use client";

import { useState, useEffect } from "react";
import Header from "@/app/_components/Header/header";
import { auth, db, doc, getDoc, onAuthStateChanged, collection, query, where, getDocs } from "@/app/firebaseconfig";
import Link from "next/link";

interface User {
  uid: string;
  email: string;
}

interface ReportError {
  name: string;
  description: string;
  email: string;
}

export default function HomeScreen() {
  const [userName, setUserName] = useState("Usuário");
  const [reportErrors, setReportErrors] = useState<ReportError[]>([]);

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
    const fetchUserData = async (user: User | null) => {
      try {
        if (user) {
          const adminsRef = collection(db, "admins");
          const adminQuery = query(adminsRef, where("email", "==", user.email));
          const adminSnapshot = await getDocs(adminQuery);

          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data();
            setUserName(adminData.name || "Usuário");
          }

          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            console.log("Dados do Usuário Autenticado:", userDoc.data());
          }

          const reportErrorRef = collection(db, "reportError");
          const reportErrorSnapshot = await getDocs(reportErrorRef);
          const reportErrorData = reportErrorSnapshot.docs.map((doc) => doc.data()) as ReportError[];
          setReportErrors(reportErrorData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user as User);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main>
      <Header title="Bem-vindo," block={userName} className="" />

      <section className="mt-4 py-4">
        <h2 className="font-bold mb-3 text-white" style={{ fontSize: "1.25rem" }}>Acesso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <div key={index} className="bg-[#101010] border border-[#252525] p-4 rounded-md transition duration-300">
              <div className="flex items-center justify-center mb-3">
                <span className="material-icons text-[#00BB83]" style={{ fontSize: "3rem" }}>{link.icon}</span>
              </div>
              <h3 className="text-center font-bold text-white text-sm">{link.title}</h3>
              <Link href={link.link} className="block text-center font-bold text-[#00BB83] hover:text-[#008f6a] mt-1 text-sm">
                Acessar
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 py-4">
        <h2 className="mb-3 font-bold text-white" style={{ fontSize: "1.25rem" }}>Relatórios de Erros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportErrors.length > 0 ? (
            reportErrors.map((error, index) => (
              <div key={index} className="bg-[#101010] p-6 gap-2 flex flex-col rounded-md border border-[#252525]">
                <div className="flex flex-col gap-2 mb-3">
                  <p className="text-white text-lg font-bold">Usuário:</p>
                  <p className="text-white text-sm">{error.name}</p>
                </div>
                <p className="text-white font-semibold text-sm">Descrição:</p>
                <p className="text-[#00BB83] text-sm">{error.description}</p>
                <p className="text-white font-semibold mt-2 text-sm">Email:</p>
                <p className="text-[#00BB83] text-sm">{error.email}</p>
              </div>
            ))
          ) : (
            <p className="text-white text-sm">Nenhum erro encontrado.</p>
          )}
        </div>
      </section>
    </main>
  );
}
