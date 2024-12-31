'use client';

import { useState, useEffect, ChangeEvent } from "react";
import bcrypt from "bcryptjs";
import Header from "@/app/_components/Header/header";
import SuccessMessage from "@/app/_components/SucessMessage/sucessMessage";

import { db, collection, addDoc, deleteDoc, doc, onSnapshot } from "../firebaseconfig"; 
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

interface Admin {
  id: string;
  name: string;
  email: string;
  subRole: string;
  password: string;
}

export default function AdminScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", subRole: "" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const addAdmin = async () => {
    try {
      // Hashing the password before storing
      let hashedPassword = "";
      if (newAdmin.password) {
        hashedPassword = await bcrypt.hash(newAdmin.password, 10);
      }
  
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.password);
  
      await addDoc(collection(db, "admins"), {
        name: newAdmin.name,
        email: newAdmin.email,
        subRole: newAdmin.subRole,
        password: hashedPassword,
      });
  
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        name: newAdmin.name,
        email: newAdmin.email,
        role: "admin",
        subRole: newAdmin.subRole,
      });
  
      setSuccessMessage("Administrador adicionado com sucesso!");
      setNewAdmin({ name: "", email: "", password: "", subRole: "" });
      toggleModal();
    } catch (error) {
      console.error("Erro ao adicionar administrador:", error);
    }
  };

  const closeSuccessMessage = () => {
    setSuccessMessage(null);
  };

  useEffect(() => {
    // Escutando alterações em tempo real no banco de dados
    const unsubscribe = onSnapshot(collection(db, "admins"), (querySnapshot) => {
      const adminsList: Admin[] = [];
      querySnapshot.forEach((doc) => {
        const admin = doc.data() as Admin;
        adminsList.push(Object.assign({ id: doc.id }, admin));
      });
      setAdmins(adminsList);
    });

    // Cleanup function para parar a escuta quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  const deleteAdmin = async (id: string) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este administrador?");
    if (confirmDelete) {
      try {
        const adminRef = doc(db, "admins", id);
        await deleteDoc(adminRef);
        setSuccessMessage("Administrador excluído com sucesso!");
      } catch (e) {
        console.error("Erro ao excluir administrador: ", e);
      }
    }
  };

  const editAdmin = (admin: Admin) => {
    setNewAdmin(admin);
    toggleModal();
  };

  return (
    <div>
      <Header title="Lista de" block="Administradores" className="" />
      {successMessage && <SuccessMessage onClose={closeSuccessMessage} message={successMessage} />}

      <div className="mt-8 px-[70]">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleModal}
            className="bg-[#00BB83] text-white px-4 py-2 rounded-md hover:bg-[#009966] transition"
          >
            Adicionar Administrador
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
          <thead>
            <tr className="bg-[#00BB83] text-white">
              <th className="border border-gray-300 px-4 py-2 rounded-tl-md text-left animate__animated animate__fadeIn">
                ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-1s">
                Nome Administrador
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-1s">
                Email Administrador
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-2s">
                Cargo
              </th>
              <th className="border border-gray-300 px-4 py-2 rounded-tr-md text-left animate__animated animate__fadeIn animate__delay-2s">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 animate__animated animate__fadeIn animate__delay-3s"
              >
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.id}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.name}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.email}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.subRole}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 p-2 text-center flex justify-center items-center space-x-2">
                  <button
                    onClick={() => editAdmin(admin)}
                    className="bg-[#00BB83] text-white p-3 w-10 h-10 rounded-full hover:bg-[#009966] flex items-center justify-center"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => deleteAdmin(admin.id)}
                    className="bg-red-600 text-white p-3 w-10 h-10 rounded-full hover:bg-red-800 flex items-center justify-center"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3 animate__animated animate__fadeIn">
            <h3 className="text-lg font-bold mb-4">
              {newAdmin.id ? "Editar Administrador" : "Adicionar Administrador"}
            </h3>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="subRole">
                  Cargo
                </label>
                <input
                  type="text"
                  id="subRole"
                  name="subRole"
                  value={newAdmin.subRole}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="password">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-300 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={addAdmin}
                  className="bg-[#00BB83] text-white px-4 py-2 rounded-md"
                >
                  {newAdmin.id ? "Salvar Alterações" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
