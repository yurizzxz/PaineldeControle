'use client';

import React, { useState, useEffect } from "react";
import { auth, db, collection, doc, getDoc, getDocs, onAuthStateChanged, query, where } from "@/app/firebaseconfig";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("Usuário");
  const [userEmail, setUserEmail] = useState<string>("Email não encontrado");

  useEffect(() => {
    const fetchUserData = async (user: { email: string; uid: string }) => {
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
        fetchUserData(user as { email: string; uid: string });
      }
    });

    const storedSidebarState = localStorage.getItem("sidebarState");
    if (storedSidebarState) {
      setIsCollapsed(storedSidebarState === "true");
    }

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarState", newState.toString());
  };

  return (
    <aside
      className={`h-screen flex flex-col py-10 bg-[#0a0a0a] border-r-2 border-[#252525] ${
        isCollapsed ? "w-20" : "w-80"
      } transition-all duration-300 ease-in-out`}
    >
      <header className="flex flex-col pl-5 pb-14  border-b border-[#101010]">
        <button
          className="fixed top-5 flex items-center p-1.5 transition-all rounded-full duration-300 hover:bg-[#00BB83] hover:text-white text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <span className="material-icons" style={{ fontSize: "25px" }}>
            {isCollapsed ? "menu" : "menu_open"}
          </span>
        </button>

        <div className="flex items-center mt-[50px]">
          <div
            className={`h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden transition-all duration-300 ${
              isCollapsed ? "h-9 w-9" : "h-20 w-20"
            }`}
          >
            <Image
              src="/logo-verde.png"
              width={100}
              height={100}
              alt="Foto do Usuário"
              className="object-cover w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div className="py-2 flex flex-col gap-1">
              <h2 className="text-lg font-bold">{userName}</h2>
              <p className="text-xs font-semibold text-[#00BB83]">{userEmail}</p>
            </div>
          )}
        </div>
      </header>

      <nav className="flex-1 w-full px-4 overflow-y-auto">
        <ul className="space-y-4">
          <li>
            <Link
              href="/home"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Home"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "1.3rem" }}
              >
                home
              </span>
              {!isCollapsed && <span className="text-white text-[.90rem]">Home</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/gyms"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Gyms"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "1.3rem" }}
              >
                fitness_center
              </span>
              {!isCollapsed && <span className="text-white text-[.90rem]">Gyms</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/admins"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Adminstradoes"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "1.3rem" }}
              >
                person
              </span>
              {!isCollapsed && <span className="text-white text-[.90rem]">Adminstradoes</span>}
            </Link>
          </li>

          <li>
            <Link
              href="/notifications"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Notificações"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "1.3rem" }}
              >
                notifications
              </span>
              {!isCollapsed && <span className="text-white text-[.90rem]">Notificações</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/articles"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Artigos"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "1.3rem" }}
              >
                article
              </span>
              {!isCollapsed && <span className="text-white text-[.90rem]">Artigos</span>}
            </Link>
          </li>
        </ul>
      </nav>

      <footer className="mt-8 w-full px-4">
        <Link
          href="/login"
          className="flex items-center space-x-7 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
          aria-label="Sair"
        >
          <span
            className={`material-icons transform transition-all duration-300 ${
              !isCollapsed ? "translate-x-2" : ""
            }`}
            style={{ fontSize: "1.5rem" }}
          >
            logout
          </span>
          {!isCollapsed && <span className="text-white text-[.90rem]">Sair</span>}
        </Link>
      </footer>
    </aside>
  );
}
