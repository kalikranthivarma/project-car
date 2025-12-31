import { createContext, useEffect, useState } from "react";
import {auth,db} from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


export  const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setUser(currentUser);
        setRole(snap.data().role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
