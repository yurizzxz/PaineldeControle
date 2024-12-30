"use client";

import { useState } from "react";
import Header from "@/app/_components/Header/header";

export default function AcademiaScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [academias, setAcademias] = useState([
    {
      id: 1,
      name: "Academia 1",
      owner: "João",
      ownerEmail: "joao@example.com",
    },
    {
      id: 2,
      name: "Academia 2",
      owner: "Maria",
      ownerEmail: "maria@example.com",
    },
    {
      id: 3,
      name: "Academia 3",
      owner: "Pedro",
      ownerEmail: "pedro@example.com",
    },
  ]);

  const [newAcademia, setNewAcademia] = useState({
    name: "",
    owner: "",
    ownerEmail: "",
  });

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewAcademia((prev) => ({ ...prev, [name]: value }));
  };

  const addAcademia = () => {
    setAcademias((prev) => [
      ...prev,
      { ...newAcademia, id: academias.length + 1 },
    ]);
    setNewAcademia({ name: "", owner: "", ownerEmail: "" });
    toggleModal();
  };

  return (
    <div>
      <Header title="Lista de" block="Academias" className="" />

      <div className="mt-8 px-[70]">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleModal}
            className="bg-[#00BB83] text-white px-4 py-2 rounded-md hover:bg-[#009966] transition"
          >
            Adicionar Academia
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
          <thead>
            <tr className="bg-[#00BB83] text-white">
              <th className="border border-gray-300 px-4 py-2 rounded-tl-md text-left animate__animated animate__fadeIn">
                ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-1s">
                Nome Academia
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-1s">
                Dono
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left animate__animated animate__fadeIn animate__delay-2s">
                Email Dono
              </th>
              <th className="border border-gray-300 px-4 py-2 rounded-tr-md text-left animate__animated animate__fadeIn animate__delay-2s">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {academias.map((academia, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 animate__animated animate__fadeIn animate__delay-3s"
              >
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {academia.id}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {academia.name}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {academia.owner}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 px-4 py-2">
                  {academia.ownerEmail}
                </td>
                <td className="bg-[#e7e7e7] border border-gray-300 p-2 text-center flex justify-center items-center space-x-2">
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
            <h3 className="text-lg font-bold mb-4">Adicionar Academia</h3>
            <form>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  Nome Academia
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAcademia.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Digite o nome da academia"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="owner"
                >
                  Dono
                </label>
                <input
                  type="text"
                  id="owner"
                  name="owner"
                  value={newAcademia.owner}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Digite o nome do dono"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="ownerEmail"
                >
                  Email Dono
                </label>
                <input
                  type="email"
                  id="ownerEmail"
                  name="ownerEmail"
                  value={newAcademia.ownerEmail}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Digite o email do dono"
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
                  onClick={addAcademia}
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
