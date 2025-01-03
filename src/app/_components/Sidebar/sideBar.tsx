"use client";

import React, { useState, useEffect } from "react";
import { auth, db, collection, doc, getDoc, getDocs, onAuthStateChanged, query, where } from "@/app/firebaseconfig";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("Usuário");
  const [userEmail, setUserEmail] = useState<string>("Email não encontrado");

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

    const storedSidebarState = localStorage.getItem("sidebarState");
    if (storedSidebarState) {
      setIsCollapsed(storedSidebarState === "true");
    }

    return () => unsubscribe();
  }, []);

  if (isCollapsed === null) {
    return null;
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarState", newState.toString());
  };

  return (
    <aside
      className={`h-screen ${
        isCollapsed ? "w-20" : "w-96"
      } bg-[#0a0a0a] text-white flex border-r-2 border-[#252525] flex-col py-10 transition-all duration-300 ease-in-out transform ${
        isCollapsed ? "translate-x-[-100%]" : "translate-x-0"
      } sm:translate-x-0`}
    >
      <header className="flex flex-col pl-5 mb-10">
        <button
          className="fixed top-5 flex items-center p-2 transition-all rounded-full duration-300 hover:bg-[#00BB83] hover:text-white text-white focus:outline-none"
          onClick={toggleSidebar}
        >
          <span className="material-icons" style={{ fontSize: "25px" }}>
            {isCollapsed ? "menu" : "menu"}
          </span>
        </button>

        <div className="flex items-center mt-[50px]">
          <div
            className={`h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden transition-all duration-300 ${
              isCollapsed ? "h-9 w-9" : "h-20 w-20"
            }`}
          >
            <img
              src="./logo-verde.png"
              alt="Foto do Usuário"
              className="object-cover w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div className="py-2 flex flex-col gap-1">
              <h2 className="text-lg font-bold">{userName}</h2>
              <p className="text-sm font-semibold text-[#00BB83]">{userEmail}</p>
            </div>
          )}
        </div>
      </header>

      <nav className="flex-1 w-full mt-3 px-4">
        <ul className="space-y-7">
          <li>
            <a
              href="/home"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Home"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "30px" }}
              >
                home
              </span>
              {!isCollapsed && <span className="text-white">Home</span>}
            </a>
          </li>
          <li>
            <a
              href="/gyms"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Gyms"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "30px" }}
              >
                fitness_center
              </span>
              {!isCollapsed && <span className="text-white">Gyms</span>}
            </a>
          </li>
          <li>
            <a
              href="/admins"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Gyms"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "30px" }}
              >
                person
              </span>
              {!isCollapsed && <span className="text-white">Adminstradoes</span>}
            </a>
          </li>

          <li>
            <a
              href="/notifications"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Notificações"	
            >
              <span
                className={`material-icons transform transition-all duration-300 ${
                  !isCollapsed ? "translate-x-2" : ""
                }`}
                style={{ fontSize: "30px" }}
              >
                notifications
              </span>
              {!isCollapsed && <span className="text-white">Notificações</span>}
            </a>
          </li>
        </ul>
      </nav>

      <footer className="mt-8 w-full px-4">
        <a
          href="/login"
          className="flex items-center space-x-7 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
          aria-label="Sair"
        >
          <span
            className={`material-icons transform transition-all duration-300 ${
              !isCollapsed ? "translate-x-2" : ""
            }`}
            style={{ fontSize: "30px" }}
          >
            logout
          </span>
          {!isCollapsed && <span className="text-white">Sair</span>}
        </a>
      </footer>
    </aside>
  );
}
