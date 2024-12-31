"use client";

import { useState, useEffect } from "react";
import Header from "@/app/_components/Header/header";

export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      const storedUserEmail = localStorage.getItem("userEmail");

      if (storedUserName) {
        setUserName(storedUserName);
      }
      if (storedUserEmail) {
        setUserEmail(storedUserEmail);
      }
    }
  }, []);

  return (
    <div>
      <Header title="Bem-vindo," block={userName} className="p-[70px]" />
    </div>
  );
}
