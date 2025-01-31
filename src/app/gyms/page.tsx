"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Header from "@/app/_components/Header/header";
import {
  db,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  setDoc,
  onSnapshot,
} from "../firebaseconfig";
import bcrypt from "bcryptjs";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";
import SuccessMessage from "@/app/_components/SucessMessage/sucessMessage";
import Table from "../_components/Table/table";
import Button from "../_components/Button/button";

interface Academia {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  password: string;
  blocked: boolean;
  payment: boolean;
  planName: string;
  planDurationMonths: number;
  planEndDate: string;
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
    blocked: false,
    payment: false,
    planName: "",
    planDurationMonths: 0,
    planEndDate: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        blocked: false,
        payment: false,
        planName: "",
        planDurationMonths: 0,
        planEndDate: "",
      });
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
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
          blocked: newAcademia.blocked,
          payment: newAcademia.payment,
          planName: newAcademia.planName,
          planDurationMonths: newAcademia.planDurationMonths,
          planEndDate: newAcademia.planEndDate,
        });

        const userRef = doc(db, "users", newAcademia.id);
        await updateDoc(userRef, {
          name: newAcademia.owner,
          email: newAcademia.ownerEmail,
          password: hashedPassword,
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newAcademia.ownerEmail,
          newAcademia.password
        );
        const user = userCredential.user;

        if (user) {
          const uid = user.uid;

          const academiaRef = doc(db, "academias", uid);
          await setDoc(academiaRef, {
            name: newAcademia.name,
            owner: newAcademia.owner,
            ownerEmail: newAcademia.ownerEmail,
            password: hashedPassword,
            blocked: newAcademia.blocked,
            payment: newAcademia.payment,
            planName: newAcademia.planName,
            planDurationMonths: newAcademia.planDurationMonths,
            planEndDate: newAcademia.planEndDate,
          });

          const userRef = doc(db, "users", uid);
          await setDoc(userRef, {
            name: newAcademia.owner,
            email: newAcademia.ownerEmail,
          });

          setAcademias((prev) => [...prev, { ...newAcademia, id: uid }]);
        }
      }

      setNewAcademia({
        id: "",
        name: "",
        owner: "",
        ownerEmail: "",
        password: "",
        blocked: false,
        payment: false,
        planName: "",
        planDurationMonths: 0,
        planEndDate: "",
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

  const toggleBlockAcademia = async (
    id: string,
    currentStatus: boolean
  ): Promise<void> => {
    const action = currentStatus ? "desbloquear" : "bloquear";
    const confirmAction = window.confirm(
      `Tem certeza que deseja ${action} esta academia?`
    );

    if (confirmAction) {
      try {
        const academiaRef = doc(db, "academias", id);
        await updateDoc(academiaRef, {
          blocked: !currentStatus,
        });

        setAcademias((prev) =>
          prev.map((academia) =>
            academia.id === id
              ? { ...academia, blocked: !currentStatus }
              : academia
          )
        );

        setSuccessMessage(`Academia ${action} com sucesso!`);
      } catch (e) {
        console.error(`Erro ao ${action} academia: `, e);
      }
    }
  };

  const filterExpiringPlans = (): Academia[] => {
    const today = new Date();
    return academias.filter((academia) => {
      const planEndDate = new Date(academia.planEndDate);
      const diffTime = planEndDate.getTime() - today.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 30 && diffDays > 0;
    });
  };

  const [paymentStatus, setPaymentStatus] = useState<{
    [key: string]: boolean;
  }>(
    academias.reduce((acc, academia) => {
      acc[academia.id] = academia.payment;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const paymentStatusMap: { [key: string]: boolean } = {};

      try {
        const querySnapshot = await getDocs(collection(db, "academias"));
        querySnapshot.forEach((doc) => {
          const academia = doc.data() as Academia;
          paymentStatusMap[doc.id] = academia.payment;
        });

        setPaymentStatus(paymentStatusMap); 
      } catch (e) {
        console.error("Erro ao buscar status de pagamento: ", e);
      }
    };

    fetchPaymentStatus(); 
  }, []); 

  const savePaymentStatus = async (id: string): Promise<void> => {
    try {
      const newPaymentStatus = !paymentStatus[id];
      const academiaRef = doc(db, "academias", id);
      await updateDoc(academiaRef, { payment: newPaymentStatus }); 

      setPaymentStatus((prev) => ({
        ...prev,
        [id]: newPaymentStatus, 
      }));

      setSuccessMessage(
        `Pagamento ${newPaymentStatus ? "concluído" : "pendente"} com sucesso!`
      );
    } catch (e) {
      console.error("Erro ao alterar status de pagamento: ", e);
    }
  };
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value: string) => (
        <span>{value.length > 5 ? `${value.substring(0, 0)}...` : value}</span>
      ),
    },
    { key: "name", label: "Nome Academia" },
    { key: "owner", label: "Dono" },
    { key: "ownerEmail", label: "Email Dono" },
    { key: "planName", label: "Plano" },
    { key: "planEndDate", label: "Fim do Plano" },
    {
      key: "actions",
      label: "Ações",
      render: (value: string, row: Academia) => (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => editAcademia(row)}
            className="bg-[#00BB83] text-white p-3 w-8 h-8 rounded-full hover:bg-[#009966] flex items-center justify-center"
          >
            <span className="material-icons" style={{ fontSize: "1.3rem" }}>
              edit
            </span>
          </button>
          <button
            onClick={() => deleteAcademia(row.id)}
            className="bg-red-600 text-white p-3 w-8 h-8 rounded-full hover:bg-red-800 flex items-center justify-center"
          >
            <span className="material-icons" style={{ fontSize: "1.3rem" }}>
              delete
            </span>
          </button>
          <button
            onClick={() => toggleBlockAcademia(row.id, row.blocked)}
            className={`bg-yellow-600 text-white p-3 w-8 h-8 rounded-full hover:bg-yellow-800 flex items-center justify-center ${
              row.blocked ? "bg-gray-600" : ""
            }`}
          >
            <span className="material-icons" style={{ fontSize: "1.3rem" }}>
              {row.blocked ? "lock_open" : "lock"}
            </span>
          </button>
          <button
            onClick={() => savePaymentStatus(row.id)}
            className={`bg-green-600 text-white p-3 w-8 h-8 rounded-full hover:bg-green-800 flex items-center justify-center ${
              paymentStatus[row.id] ? "bg-gray-600" : ""
            }`}
          >
            <span className="material-icons" style={{ fontSize: "1.3rem" }}>
              {paymentStatus[row.id] ? "attach_money" : "money_off"}
            </span>
          </button>
        </div>
      ),
    },
    {
      key: "paymentStatus",
      label: "Pagamento",
      render: (value: boolean, row: Academia) => (
        <span className="flex items-center">
          <span className="material-icons mr-2">
            {paymentStatus[row.id] ? "attach_money" : "money_off"}
          </span>
          <span className="text-sm">
            {paymentStatus[row.id] ? "Concluído" : "Pendente"}
          </span>
        </span>
      ),
    },
  ];

  return (
    <main>
      <Header title="Lista de" block="Academias" className="" />
      {successMessage && (
        <SuccessMessage
          onClose={closeSuccessMessage}
          message={successMessage}
        />
      )}

      <section className="mt-14">
        <header className="flex justify-between items-center mb-4">
          <Button onClick={toggleModal}>Adicionar Academia</Button>
        </header>

        <article>
          <Table data={academias} columns={columns} />
        </article>

        <hr className="my-14 border-t border-[#101010]" />

        <article>
          <h2 className="text-2xl font-bold mb-4">Planos próximos a expirar</h2>
          <Table data={filterExpiringPlans()} columns={columns} />
        </article>
        <hr className="my-14 border-t border-[#101010]" />
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#101010] p-6 rounded-md shadow-lg w-1/3 animate__animated animate__fadeIn">
            <header>
              <h3 className="text-lg font-bold mb-4">
                {isEditing ? "Editar Academia" : "Adicionar Academia"}
              </h3>
            </header>
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
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
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
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
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
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="planName"
                >
                  Nome do Plano
                </label>
                <input
                  type="text"
                  id="planName"
                  name="planName"
                  value={newAcademia.planName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="planDurationMonths"
                >
                  Quantidade de Meses
                </label>
                <input
                  type="number"
                  id="planDurationMonths"
                  name="planDurationMonths"
                  value={newAcademia.planDurationMonths}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="planEndDate"
                >
                  Fim do Plano
                </label>
                <input
                  type="date"
                  id="planEndDate"
                  name="planEndDate"
                  value={newAcademia.planEndDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                />
              </div>
              {!isEditing && (
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
                    className="w-full px-4 py-2 bg-[#101010] border border-[#252525] rounded-md"
                  />
                </div>
              )}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="blocked"
                >
                  Bloqueada
                </label>
                <input
                  type="checkbox"
                  id="blocked"
                  name="blocked"
                  checked={newAcademia.blocked}
                  onChange={(e) =>
                    setNewAcademia((prev) => ({
                      ...prev,
                      blocked: e.target.checked,
                    }))
                  }
                  className="w-6 h-6"
                />
              </div>
              <footer className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveAcademia}
                  className="bg-[#00BB83] text-white px-4 py-2 rounded-md hover:bg-[#009966]"
                >
                  {isEditing ? "Atualizar" : "Adicionar"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
