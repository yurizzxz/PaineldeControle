"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Header from "@/app/_components/Header/header";
import {
  db,
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
} from "../firebaseconfig";
import bcrypt from "bcryptjs";
import SuccessMessage from "@/app/_components/SucessMessage/sucessMessage";

interface Academia {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  password: string;
}

export default function AcademiaScreen() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [newAcademia, setNewAcademia] = useState<Academia>({
    id: "",
    name: "",
    owner: "",
    ownerEmail: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string): void => {
    setSuccessMessage(message);
  };

  const closeSuccessMessage = (): void => {
    setSuccessMessage(null);
  };

  useEffect(() => {
    const fetchAcademias = async (): Promise<void> => {
      try {
        const querySnapshot = await getDocs(collection(db, "academias"));
        const academiasList: Academia[] = [];
        querySnapshot.forEach((doc) => {
          const academia = doc.data() as Academia;
          academiasList.push(Object.assign({ id: doc.id }, academia));
        });
        setAcademias(academiasList);
      } catch (e) {
        console.error("Erro ao buscar academias: ", e);
      }
    };

    fetchAcademias();
  }, []);

  const toggleModal = (): void => {
    if (isModalOpen) {
      setIsEditing(false);
      setNewAcademia({
        id: "",
        name: "",
        owner: "",
        ownerEmail: "",
        password: "",
      }); // Limpar os campos
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setNewAcademia((prev) => ({ ...prev, [name]: value }));
  };

  const saveAcademia = async (): Promise<void> => {
    try {
      const hashedPassword = await bcrypt.hash(newAcademia.password, 10);

      if (isEditing) {
        const academiaRef = doc(db, "academias", newAcademia.id);
        await updateDoc(academiaRef, {
          name: newAcademia.name,
          owner: newAcademia.owner,
          ownerEmail: newAcademia.ownerEmail,
          password: hashedPassword,
        });

        const userRef = doc(db, "users", newAcademia.id);
        await updateDoc(userRef, {
          name: newAcademia.owner,
          email: newAcademia.ownerEmail,
          password: hashedPassword,
        });

        setAcademias((prev) =>
          prev.map((academia) =>
            academia.id === newAcademia.id ? { ...newAcademia } : academia
          )
        );
      } else {
        const docRef = await addDoc(collection(db, "academias"), {
          name: newAcademia.name,
          owner: newAcademia.owner,
          ownerEmail: newAcademia.ownerEmail,
          password: hashedPassword,
        });

        await addDoc(collection(db, "users"), {
          name: newAcademia.owner,
          email: newAcademia.ownerEmail,
          password: hashedPassword,
        });

        setAcademias((prev) => [...prev, { ...newAcademia, id: docRef.id }]);
      }

      setNewAcademia({
        id: "",
        name: "",
        owner: "",
        ownerEmail: "",
        password: "",
      });
      toggleModal();
      setSuccessMessage(
        isEditing
          ? "Academia atualizada com sucesso!"
          : "Academia adicionada com sucesso!"
      );
    } catch (e) {
      console.error("Erro ao salvar academia: ", e);
    }
  };

  const deleteAcademia = async (id: string): Promise<void> => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta academia?"
    );
    if (confirmDelete) {
      try {
        const academiaRef = doc(db, "academias", id);
        await deleteDoc(academiaRef);

        const userRef = doc(db, "users", id);
        await deleteDoc(userRef);

        setAcademias((prev) => prev.filter((academia) => academia.id !== id));
        setSuccessMessage("Academia excluída com sucesso!");
      } catch (e) {
        console.error("Erro ao excluir academia: ", e);
      }
    }
  };

  const editAcademia = (academia: Academia): void => {
    setNewAcademia(academia);
    setIsEditing(true);
    toggleModal();
  };

  return (
    <div>
      <Header title="Lista de" block="Academias" className="" />
      {successMessage && <SuccessMessage onClose={closeSuccessMessage} message={successMessage} />}

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
                  <button
                    onClick={() => editAcademia(academia)}
                    className="bg-[#00BB83] text-white p-3 w-10 h-10 rounded-full hover:bg-[#009966] flex items-center justify-center"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => deleteAcademia(academia.id)}
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
              {isEditing ? "Editar Academia" : "Adicionar Academia"}
            </h3>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="owner"
                >
                  Nome Dono
                </label>
                <input
                  type="text"
                  id="owner"
                  name="owner"
                  value={newAcademia.owner}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newAcademia.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-300 text-white px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveAcademia}
                  className="bg-[#00BB83] text-white px-4 py-2 rounded-md hover:bg-[#009966]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
