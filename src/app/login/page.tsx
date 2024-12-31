"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, collection, getDocs } from "@/app/firebaseconfig";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");

  const handleLogin = async () => {
    try {
      const adminsCollection = collection(db, "admins");
      const adminsSnapshot = await getDocs(adminsCollection);
      const admin = adminsSnapshot.docs.find(
        (doc) => doc.data().email === email
      );
  
      if (!admin) {
        alert("O email fornecido não pertence a um administrador.");
        return;
      }
  
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", admin.data().name);
  
      setUserName(admin.data().name);
  
      await signInWithEmailAndPassword(auth, email, senha);
  
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (error: any) {
      alert("Erro no login: " + error.message);
    }
  };
  

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "#ececec" }}
    >
      <div className="flex flex-col items-center w-full max-w-md px-8 py-10 bg-[#e7e7e7] rounded-lg">
        <h1 className="text-2xl font-bold text-black mb-4">
          {userName ? `Bem-vindo, ${userName}!` : "Bem-vindo de volta!"}
        </h1>

        <input
          type="email"
          placeholder="Endereço de email"
          className="w-full p-4 mb-4 bg-[#f2f2f2] text-gray-800 rounded-lg border-2 border-[#d1d1d1] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            className="w-full p-4 mb-4 bg-[#f2f2f2] text-gray-800 rounded-lg border-2 border-[#d1d1d1] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-gray-400"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10S6.477 0 12 0s10 4.477 10 10c0 2.183-.698 4.207-1.875 5.825M15 15l-3-3m0 0l-3-3m3 3l3-3m-3 3l-3 3"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10S6.477 0 12 0s10 4.477 10 10c0 2.183-.698 4.207-1.875 5.825M15 15l-3-3m0 0l-3-3m3 3l3-3m-3 3l-3 3"
                />
              </svg>
            )}
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
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-500">
              Lembrar de mim
            </label>
          </div>
          <Link href="/esqueceusenha" className="text-sm text-emerald-500">
            Esqueci minha senha
          </Link>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3 text-white bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600"
        >
          Entrar
        </button>

        <div className="mt-4 text-sm text-gray-500">
          Não possui uma conta?{" "}
          <Link href="/cadastro" className="text-emerald-500 hover:underline">
            Registre-se!
          </Link>
        </div>
      </div>
    </div>
  );
}
