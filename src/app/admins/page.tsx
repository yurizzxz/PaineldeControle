"use client";

import { useState } from "react";
import Header from "@/app/_components/Header/header";

export default function AdminScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admins, setAdmins] = useState([
    { id: 1, name: "Admin 1", email: "admin1@example.com" },
    { id: 2, name: "Admin 2", email: "admin2@example.com" },
    { id: 3, name: "Admin 3", email: "admin3@example.com" },
  ]);

  const [newAdmin, setNewAdmin] = useState({ id: "", name: "", email: "" });

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const addAdmin = () => {
    const newId = admins.length + 1;
    setAdmins((prev) => [...prev, { ...newAdmin, id: newId }]);
    setNewAdmin({ id: "", name: "", email: "" });
    toggleModal();
  };

  return (
    <div>
      <Header title="Lista de" block="Administradores" className="" />

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
                Nome
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-1s">
                Email
              </th>
              <th className="border border-gray-300 px-4 py-2 rounded-tr-md text-left animate__animated animate__fadeIn animate__delay-2s">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr key={index} className="hover:bg-gray-50 animate__animated animate__fadeIn animate__delay-3s">
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.id}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.name}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {admin.email}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2 text-center flex justify-center items-center space-x-2">
                  <button className="bg-[#00BB83] text-white p-3 w-10 h-10 rounded-full hover:bg-[#009966] flex items-center justify-center">
                    <span className="material-icons">edit</span>
                  </button>
                  <button className="bg-red-600 text-white p-3 w-10 h-10 rounded-full hover:bg-red-800 flex items-center justify-center">
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
            <h3 className="text-lg font-bold mb-4">Adicionar Administrador</h3>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="id">
                  ID
                </label>
                <input
                  type="number"
                  id="id"
                  name="id"
                  value={newAdmin.id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Digite o ID"
                  required
                />
              </div>
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Digite o nome"
                  required
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
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Digite o email"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={addAdmin}
                  className="bg-[#00BB83] text-white px-4 py-2 rounded hover:bg-[#009966] transition"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
