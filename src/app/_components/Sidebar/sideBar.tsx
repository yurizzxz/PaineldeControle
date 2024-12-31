"use client";

import { useState, useEffect } from "react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      const storedUserEmail = localStorage.getItem("userEmail");
      const storedSidebarState = localStorage.getItem("sidebarState");

      if (storedUserName) {
        setUserName(storedUserName);
      }
      if (storedUserEmail) {
        setUserEmail(storedUserEmail);
      }
      if (storedSidebarState) {
        setIsCollapsed(storedSidebarState === "true");
      }
    }
  }, []);

  if (isCollapsed === null) {
    return null;
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarState", newState.toString());
    }
  };

  return (
    <aside
      className={`h-screen ${isCollapsed ? "w-20" : "w-80"} bg-[#e4e4e4] text-black flex flex-col py-10 transition-all duration-300 ease-in-out transform ${isCollapsed ? "translate-x-[-100%]" : "translate-x-0"} sm:translate-x-0`}
    >
      <header className="flex flex-col pl-5 mb-10">
        <button
          className="fixed top-5 flex items-center p-2 transition-all rounded-full duration-300 hover:bg-[#00BB83] hover:text-white text-black focus:outline-none"
          onClick={toggleSidebar}
        >
          <span className="material-icons" style={{ fontSize: "25px" }}>
            {isCollapsed ? "menu" : "menu"}
          </span>
        </button>

        <div className="flex items-center mt-[50px]">
          <div
            className={`h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden transition-all duration-300 ${isCollapsed ? "h-9 w-9" : "h-20 w-20"}`}
          >
            <img
              src="./logo-verde.png"
              alt="Foto do Usuário"
              className="object-cover w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div className="py-2 flex flex-col gap-1">
              <h2 className="text-lg font-bold">{userName || "Usuário"}</h2>
              <p className="text-sm font-semibold text-[#00BB83]">
                {userEmail || "Email não encontrado"}
              </p>
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
                className={`material-icons transform transition-all duration-300 ${!isCollapsed ? "translate-x-2" : ""}`}
                style={{ fontSize: "30px" }}
              >
                home
              </span>
              {!isCollapsed && <span>Home</span>}
            </a>
          </li>
          <li>
            <a
              href="/gyms"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Gyms"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${!isCollapsed ? "translate-x-2" : ""}`}
                style={{ fontSize: "30px" }}
              >
                fitness_center
              </span>
              {!isCollapsed && <span>Gyms</span>}
            </a>
          </li>

          <li>
            <a
              href="/admins"
              className="flex items-center space-x-7 space-y-1 hover:bg-[#00BB83] hover:text-white p-2.5 rounded-lg transition-all duration-300 ease-in-out"
              aria-label="Adminstradores"
            >
              <span
                className={`material-icons transform transition-all duration-300 ${!isCollapsed ? "translate-x-2" : ""}`}
                style={{ fontSize: "30px" }}
              >
                person
              </span>
              {!isCollapsed && <span>Adminstradores</span>}
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
            className={`material-icons transform transition-all duration-300 ${!isCollapsed ? "translate-x-2" : ""}`}
            style={{ fontSize: "30px" }}
          >
            logout
          </span>
          {!isCollapsed && <span>Sair</span>}
        </a>
      </footer>
    </aside>
  );
}
