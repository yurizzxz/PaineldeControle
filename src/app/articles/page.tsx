"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  limit,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  DocumentData, 
  QuerySnapshot
} from "firebase/firestore";
import { db } from "../firebaseconfig";
import SuccessMessage from "../_components/SucessMessage/sucessMessage";
import Header from "../_components/Header/header";
import Button from "../_components/Button/button";

interface Artigo {
  id: string;
  title: string;
  desc: string;
  categoria: string;
}

export default function Artigos() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newArticle, setNewArticle] = useState<Artigo>({
    id: "",
    title: "",
    desc: "",
    categoria: "",
  });
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [articleBeingEdited, setArticleBeingEdited] = useState<Artigo | null>(null);

  const ITEMS_PER_PAGE = 6;

  const showSuccessMessage = (message: string): void => {
    setSuccessMessage(message);
  };

  const closeSuccessMessage = (): void => {
    setSuccessMessage(null);
  };

  const fetchArtigos = useCallback(async () => {
    try {
      const artigosQuery = query(collection(db, "artigos"), limit(ITEMS_PER_PAGE));
      const querySnapshot = await getDocs(artigosQuery);
      const artigosData: Artigo[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        desc: doc.data().desc,
        categoria: doc.data().categoria,
      }));
      setArtigos(artigosData);
    } catch (error) {
      console.error("Erro ao buscar artigos", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "artigos"),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const artigosData: Artigo[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          desc: doc.data().desc,
          categoria: doc.data().categoria,
        }));
        setArtigos(artigosData);
      }
    );

    fetchArtigos(); 

    return () => unsubscribe();
  }, [fetchArtigos]);

  const truncateText = (text: string, limit: number): string => {
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  const openModal = (article?: Artigo) => {
    setIsModalOpen(true);
    if (article) {
      setArticleBeingEdited(article);
      setNewArticle({ ...article });
      setIsEditing(true);
    } else {
      setArticleBeingEdited(null);
      setNewArticle({
        id: "",
        title: "",
        desc: "",
        categoria: "",
      });
      setIsEditing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewArticle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveArticle = async () => {
    try {
      if (isEditing && articleBeingEdited) {
        const articleRef = doc(db, "artigos", articleBeingEdited.id);
        await updateDoc(articleRef, {
          title: newArticle.title,
          desc: newArticle.desc,
          categoria: newArticle.categoria,
        });
        showSuccessMessage("Artigo atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "artigos"), {
          title: newArticle.title,
          desc: newArticle.desc,
          categoria: newArticle.categoria,
        });
        showSuccessMessage("Artigo salvo com sucesso!");
      }
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar artigo", error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, "artigos", id));
      showSuccessMessage("Artigo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir artigo:", error);
    }
  };

  const handleEditArticle = async (id: string) => {
    const articleToEdit = artigos.find((artigo) => artigo.id === id);
    if (articleToEdit) {
      setNewArticle({
        id: articleToEdit.id,
        title: articleToEdit.title,
        desc: articleToEdit.desc,
        categoria: articleToEdit.categoria,
      });
      setArticleBeingEdited(articleToEdit);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  return (
    <main className="min-h-screen">
      <Header title="Lista de" block="Artigos" className="" />
      {successMessage && (
        <SuccessMessage
          onClose={closeSuccessMessage}
          message={successMessage}
        />
      )}

      <div className="container mt-6 py-6">
        <Button
          onClick={() => openModal()}
        >
          Adicionar Artigo
        </Button>

        <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {artigos.map((artigo) => (
            <div
              key={artigo.id}
              className="bg-[#101010] p-6 gap-2 flex flex-col rounded-md border border-[#252525] relative"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-white font-bold pr-5 text-xl py-1">
                  {artigo.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditArticle(artigo.id)}
                    className="bg-[#00BB83] rounded-[60px] text-white pt-1.5 px-2"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(artigo.id)}
                    className="bg-red-500 rounded-[100px] text-white pt-1.5 px-2"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
              <p className="flex gap-[5px]">
                Categoria:
                <span className="text-[#00BB83] text-md mb-4">
                  {artigo.categoria}
                </span>
              </p>
              <p className="text-white mb-4">
                {truncateText(artigo.desc, 100)}
              </p>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#101010] p-6 rounded-lg w-1/3">
              <h2 className="text-xl font-bold mb-4">
                {isEditing ? "Editar Artigo" : "Novo Artigo"}
              </h2>

              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Título</label>
                  <input
                    type="text"
                    name="title"
                    value={newArticle.title}
                    onChange={handleInputChange}
                    placeholder="Título"
                    className="w-full p-2 border rounded-md bg-[#101010] border-[#252525]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Descrição</label>
                  <textarea
                    name="desc"
                    value={newArticle.desc}
                    onChange={handleInputChange}
                    placeholder="Descrição"
                    className="w-full p-2 border rounded-md h-60 bg-[#101010] border-[#252525]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-3">Selecione a categoria</label>
                  <select
                    name="categoria"
                    value={newArticle.categoria}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-[#101010] border-[#252525]"
                  >
                    <option value="treino">Treino</option>
                    <option value="hipertrofia">Hipertrofia</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="suplementacao">Suplementação</option>
                    <option value="emagrecer">Emagrecer</option>
                  </select>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveArticle();
                    }}
                    className="px-4 py-2 bg-[#00BB83] text-white rounded-md"
                  >
                    {isEditing ? "Atualizar Artigo" : "Salvar Artigo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
