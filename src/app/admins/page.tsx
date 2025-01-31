"use client";
import { useState, useEffect, ChangeEvent } from "react";
import bcrypt from "bcryptjs";
import Header from "@/app/_components/Header/header";
import SuccessMessage from "@/app/_components/SucessMessage/sucessMessage";
import {
  db,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  setDoc,
} from "../firebaseconfig";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import Table from "../_components/Table/table";
import Button from "../_components/Button/button";

interface Admin {
  id: string;
  name: string;
  email: string;
  subRole: string;
  password: string;
}

export default function AdminScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState<Admin | null>(null);
  const [newAdminToAdd, setNewAdminToAdd] = useState({
    name: "",
    email: "",
    password: "",
    subRole: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdminToAdd((prev) => ({ ...prev, [name]: value }));
  };

  const addAdmin = async () => {
    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newAdminToAdd.email,
        newAdminToAdd.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "admins", uid), {
        name: newAdminToAdd.name,
        email: newAdminToAdd.email,
        subRole: newAdminToAdd.subRole,
        password: await bcrypt.hash(newAdminToAdd.password, 10),
      });

      await setDoc(doc(db, "users", uid), {
        name: newAdminToAdd.name,
        email: newAdminToAdd.email,
        role: "admin",
      });

      setSuccessMessage("Administrador adicionado com sucesso!");
      setNewAdminToAdd({ name: "", email: "", password: "", subRole: "" });
      toggleModal();
    } catch (error) {
      console.error("Erro ao adicionar administrador:", error);
      setSuccessMessage("Erro ao adicionar administrador.");
    }
  };

  const closeSuccessMessage = () => {
    setSuccessMessage(null);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      (querySnapshot) => {
        const adminsList: Admin[] = [];
        querySnapshot.forEach((doc) => {
          const admin = doc.data() as Admin;
          adminsList.push(Object.assign({ id: doc.id }, admin));
        });
        setAdmins(adminsList);
      }
    );

    return () => unsubscribe();
  }, []);

  const deleteAdmin = async (id: string) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este administrador?"
    );
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
    setNewAdminToAdd({
      name: admin.name,
      email: admin.email,
      password: "",
      subRole: admin.subRole,
    });
    toggleModal();
  };

  const updateAdmin = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setSuccessMessage("Usuário não encontrado.");
      return;
    }

    try {
      if (newAdminToAdd.password) {
        await updatePassword(user, newAdminToAdd.password);
      }

      await updateDoc(doc(db, "admins", newAdmin!.id), {
        name: newAdminToAdd.name,
        email: newAdminToAdd.email,
        subRole: newAdminToAdd.subRole,
        password: await bcrypt.hash(newAdminToAdd.password, 10),
      });

      setSuccessMessage("Administrador atualizado com sucesso!");
      toggleModal();
      setNewAdminToAdd({ name: "", email: "", password: "", subRole: "" });
    } catch (error) {
      console.error("Erro ao atualizar administrador:", error);
      setSuccessMessage("Erro ao atualizar administrador.");
    }
  };

  const columns = [
    { key: "id", label: "ID", render: (value: string) => (
      <span>{value.length > 10 ? `${value.substring(0, 10)}...` : value}</span>
    )},
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "subRole", label: "Cargo" },
    {
      key: "actions",
      label: "Ações",
      render: (_: string, row: Admin) => (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => editAdmin(row)}
            className="bg-[#00BB83] text-white p-3 w-8 h-8 rounded-full hover:bg-[#009966] flex items-center justify-center"
          >
            <span className="material-icons"  style={{ fontSize: "1.3rem" }}>edit</span>
          </button>
          <button
            onClick={() => deleteAdmin(row.id)}
            className="bg-red-600 text-white p-3 w-8 h-8 rounded-full hover:bg-red-800 flex items-center justify-center"
          >
            <span className="material-icons"  style={{ fontSize: "1.3rem" }}>delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <main>
      <Header title="Lista de" block="Administradores" className="" />
      {successMessage && (
        <SuccessMessage
          onClose={closeSuccessMessage}
          message={successMessage}
        />
      )}

      <section className="mt-14">
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => {
              setNewAdminToAdd({
                name: "",
                email: "",
                password: "",
                subRole: "",
              });
              setNewAdmin(null);
              toggleModal();
            }}
          >
            Adicionar Administrador
          </Button>
        </div>

        <Table data={admins} columns={columns} />
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#101010] p-6 rounded-md shadow-lg w-1/3 animate__animated animate__fadeIn">
            <h3 className="text-lg font-bold mb-4">
              {newAdmin ? "Editar Administrador" : "Adicionar Administrador"}
            </h3>
            <form>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="name"
                >
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAdminToAdd.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newAdminToAdd.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="subRole"
                >
                  Cargo
                </label>
                <input
                  type="text"
                  id="subRole"
                  name="subRole"
                  value={newAdminToAdd.subRole}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
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
                  value={newAdminToAdd.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setNewAdminToAdd({
                      name: "",
                      email: "",
                      password: "",
                      subRole: "",
                    });
                    toggleModal();
                  }}
                  className="bg-[#1a1a1a] border border-[#252525] px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={newAdmin ? updateAdmin : addAdmin}
                  className="bg-[#00BB83] text-white px-4 py-2 rounded-md"
                >
                  {newAdmin ? "Salvar Alterações" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
