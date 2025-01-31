import { useState, useEffect, ChangeEvent } from "react";
import { db, collection, doc, deleteDoc, updateDoc, getDocs, setDoc } from "../firebaseconfig";
import bcrypt from "bcryptjs";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig";

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

const useAcademias = () => {
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
  const [paymentStatus, setPaymentStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchAcademias = async (): Promise<void> => {
      try {
        const querySnapshot = await getDocs(collection(db, "academias"));
        const academiasList: Academia[] = [];
        querySnapshot.forEach((doc) => {
          const academia = doc.data() as Academia;
          academiasList.push({ ...academia, id: doc.id });
        });
        setAcademias(academiasList);
      } catch (e) {
        console.error("Erro ao buscar academias: ", e);
      }
    };
    fetchAcademias();
  }, []);

  const toggleModal = (): void => {
    setIsModalOpen((prev) => !prev);
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
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAcademia((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveAcademia = async (): Promise<void> => {
    try {
      const hashedPassword = await bcrypt.hash(newAcademia.password, 10);

      if (isEditing) {
        const academiaRef = doc(db, "academias", newAcademia.id);
        await updateDoc(academiaRef, { ...newAcademia, password: hashedPassword });

        const userRef = doc(db, "users", newAcademia.id);
        await updateDoc(userRef, { name: newAcademia.owner, email: newAcademia.ownerEmail, password: hashedPassword });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, newAcademia.ownerEmail, newAcademia.password);
        const user = userCredential.user;

        if (user) {
          const uid = user.uid;
          const academiaRef = doc(db, "academias", uid);
          await setDoc(academiaRef, { ...newAcademia, password: hashedPassword });

          const userRef = doc(db, "users", uid);
          await setDoc(userRef, { name: newAcademia.owner, email: newAcademia.ownerEmail });

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
      setSuccessMessage(isEditing ? "Academia atualizada com sucesso!" : "Academia adicionada com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar academia: ", e);
    }
  };

  const deleteAcademia = async (id: string): Promise<void> => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta academia?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "academias", id));
        await deleteDoc(doc(db, "users", id));

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

  const toggleBlockAcademia = async (id: string, currentStatus: boolean): Promise<void> => {
    const action = currentStatus ? "desbloquear" : "bloquear";
    const confirmAction = window.confirm(`Tem certeza que deseja ${action} esta academia?`);

    if (confirmAction) {
      try {
        const academiaRef = doc(db, "academias", id);
        await updateDoc(academiaRef, { blocked: !currentStatus });

        setAcademias((prev) => prev.map((academia) => academia.id === id ? { ...academia, blocked: !currentStatus } : academia));
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
      return diffTime / (1000 * 60 * 60 * 24) <= 30 && diffTime / (1000 * 60 * 60 * 24) > 0;
    });
  };

  const fetchPaymentStatus = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, "academias"));
      const paymentStatusMap: { [key: string]: boolean } = {};
      querySnapshot.forEach((doc) => {
        const academia = doc.data() as Academia;
        paymentStatusMap[doc.id] = academia.payment;
      });
      setPaymentStatus(paymentStatusMap);
    } catch (e) {
      console.error("Erro ao buscar status de pagamento: ", e);
    }
  };

  useEffect(() => {
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

      setSuccessMessage(`Pagamento ${newPaymentStatus ? "concluído" : "pendente"} com sucesso!`);
    } catch (e) {
      console.error("Erro ao alterar status de pagamento: ", e);
    }
  };

  return {
    academias,
    newAcademia,
    setNewAcademia,
    isModalOpen,
    isEditing,
    successMessage,
    paymentStatus,
    toggleModal,
    handleInputChange,
    saveAcademia,
    deleteAcademia,
    editAcademia,
    toggleBlockAcademia,
    filterExpiringPlans,
    savePaymentStatus,
    closeSuccessMessage: () => setSuccessMessage(null),
  };
};

export default useAcademias;
