import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    let unsubscribeSnapshot = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeSnapshot();
      if (!user) {
        setNotifications([]);
        return;
      }
      const role = (await user.getIdTokenResult()).claims.role;
      if (role !== "civilian") return;
      unsubscribeSnapshot = onSnapshot(
        collection(db, "notifications", user.uid, "items"),
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setNotifications(items.slice(0, 30));
        },
        () => setNotifications([])
      );
    });
    return () => {
      unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);
  return notifications;
}
