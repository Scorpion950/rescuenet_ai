import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function useFirebaseRole() {
  const [state, setState] = useState({ loading: true, role: null, department: null });
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setState({ loading: false, role: null, department: null });
      return;
    }
    try {
      const result = await user.getIdTokenResult(true);
      setState({
        loading: false,
        role: result.claims.role || "civilian",
        department: result.claims.department || null,
      });
    } catch {
      setState({ loading: false, role: null, department: null });
    }
  }), []);
  return state;
}
