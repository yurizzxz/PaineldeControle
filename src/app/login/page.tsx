"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, collection, getDocs, query, where } from "@/app/firebaseconfig";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const adminsRef = collection(db, "admins");
      const q = query(adminsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("O email fornecido não pertence a um administrador.");
        return;
      }

      const adminData = querySnapshot.docs[0].data();
      const userName = adminData.name;

      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", userName);

      await signInWithEmailAndPassword(auth, email, senha);

      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } catch (error: any) {
      alert("Erro no login: " + error.message);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "rgb(7, 7, 7)" }}
    >
      <div className="flex flex-col items-center w-full max-w-md px-8 py-10 bg-[#101010] rounded-lg">
        <h1 className="text-2xl font-bold text-white mb-4">Bem-vindo de volta!</h1>

        <input
          type="email"
          placeholder="Endereço de email"
          className="w-full p-4 mb-4 bg-[#101010] text-white rounded-lg border-2 border-[#252525] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            className="w-full p-4 mb-4 bg-[#101010] text-white rounded-lg border-2 border-[#252525] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-gray-400"
          >
            {showPassword ? "Esconder" : "Mostrar"}
          </button>
        </div>

        <div className="flex justify-between items-center w-full my-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              className="h-4 w-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-400">
              Lembrar de mim
            </label>
          </div>
          <Link href="/esqueceusenha" className="text-sm text-emerald-500">
            Esqueci minha senha
          </Link>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 text-white bg-emerald-500 rounded-lg mt-3 font-semibold hover:bg-emerald-600"
        >
          Entrar
        </button>

      </div>
    </div>
  );
}
