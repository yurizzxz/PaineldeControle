"use client";

import { useState, useEffect, useCallback } from "react";
import {
  db,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "@/app/firebaseconfig";
import Header from "@/app/_components/Header/header";
import SuccessMessage from "@/app/_components/SucessMessage/sucessMessage";
import Button from "../_components/Button/button";

interface Notification {
  id?: string;
  description: string;
  subtitle: string;
  title: string;
  userAttribute: string;
  data: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Academy {
  id: string;
  name: string;
  ownerEmail: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newNotification, setNewNotification] = useState<Notification>({
    description: "",
    subtitle: "",
    title: "",
    userAttribute: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAcademies = async () => {
    try {
      const academiesRef = collection(db, "academias");
      const snapshot = await getDocs(academiesRef);
      const academiesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Academy[];
      setAcademies(academiesList);
    } catch (error) {
      console.error("Erro ao buscar academias:", error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const notificationsRef = collection(db, "notifications");
      const snapshot = await getDocs(notificationsRef);
      const notificationsList = snapshot.docs
        .map((doc) => {
          const data = doc.data() as Notification;
          return { id: doc.id, ...data };
        })
        .filter((notification) =>
          academies.some(
            (academy) => academy.ownerEmail === notification.userAttribute
          )
        ) as Notification[];
      setNotifications(notificationsList);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      setIsLoading(false);
    }
  }, [academies]);

  useEffect(() => {
    fetchAcademies();
  }, []);

  useEffect(() => {
    if (academies.length > 0) {
      fetchNotifications();
    }
  }, [academies, fetchNotifications]);

  const openModal = () => {
    setNewNotification({
      description: "",
      subtitle: "",
      title: "",
      userAttribute: "",
      data: new Date().toLocaleDateString("pt-BR"),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateNotification = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await addDoc(collection(db, "notifications"), {
        ...newNotification,
        createdAt: new Date(),
      });

      setNewNotification({
        description: "",
        subtitle: "",
        title: "",
        userAttribute: "",
        data: new Date().toLocaleDateString("pt-BR"),
      });
      closeModal();
      fetchNotifications();
      setSuccessMessage("Notificação criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
    }
  };

  const handleDeleteNotification = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      fetchNotifications();
      setSuccessMessage("Notificação excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  const handleEditNotification = async (id: string): Promise<void> => {
    const notificationToEdit = notifications.find(
      (notification) => notification.id === id
    );
    if (notificationToEdit) {
      setNewNotification(notificationToEdit);
      setIsModalOpen(true);
    } else {
      console.error("No notification found with id:", id);
    }
  };

  const handleUpdateNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const notificationRef = doc(db, "notifications", newNotification.id!);
      await updateDoc(notificationRef, {
        ...newNotification,
        updatedAt: new Date(),
      });

      setNewNotification({
        description: "",
        subtitle: "",
        title: "",
        userAttribute: "",
        data: new Date().toISOString().split("T")[0],
      });
      closeModal();
      fetchNotifications();
      setSuccessMessage("Notificação atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar notificação:", error);
    }
  };

  return (
    <div>
      <Header title="Notificações" block="Administrador" className="" />
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <div className="mt-6 py-6">
        <div>
          <Button onClick={openModal}>Criar Notificação</Button>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-white">Carregando notificações...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-[#101010] border border-[#252525] p-6 rounded-md transition duration-300 
                           sm:p-4 md:p-6 lg:p-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-xl py-1">
                      {notification.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditNotification(notification.id!)}
                        className="bg-[#00BB83] rounded-[60px] text-white pt-1.5 px-2"
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification.id!)
                        }
                        className="bg-red-500 rounded-[100px] text-white pt-1.5 px-2"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-white py-1">{notification.subtitle}</p>
                  <p className="text-gray-300 py-1">
                    {notification.description}
                  </p>
                  <p className="text-[#00BB83] font-bold flex align-center items-center gap-2 py-2">
                    Usuário:
                  </p>
                  <p className="text-white mb-4">
                    {notification.userAttribute}
                  </p>
                  <p className="text-white">Data: {notification.data}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#101010] p-6 rounded-lg w-1/3">
              <h3 className="text-xl font-bold mb-4">
                {newNotification.id
                  ? "Editar Notificação"
                  : "Criar Notificação"}
              </h3>
              <form
                onSubmit={
                  newNotification.id
                    ? handleUpdateNotification
                    : handleCreateNotification
                }
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md bg-[#101010] border-[#252525]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={newNotification.subtitle}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md bg-[#101010] border-[#252525]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">
                    Descrição
                  </label>
                  <textarea
                    value={newNotification.description}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md h-60 bg-[#101010] border-[#252525]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">
                    Usuário
                  </label>
                  <select
                    value={newNotification.userAttribute}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        userAttribute: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md bg-[#101010] border-[#252525] text-white"
                    required
                  >
                    <option value="">Selecione um Usuário</option>
                    {academies.map((academy) => (
                      <option key={academy.id} value={academy.ownerEmail}>
                        {academy.name} ({academy.ownerEmail})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Data</label>
                  <input
                    type="date"
                    value={newNotification.data}
                    readOnly
                    className="w-full p-2 border rounded-md bg-[#101010] border-[#252525] text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#00BB83] text-white py-2 px-4 rounded-md"
                  >
                    {newNotification.id
                      ? "Atualizar Notificação"
                      : "Criar Notificação"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
