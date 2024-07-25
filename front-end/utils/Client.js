"use client"
import React , {useEffect} from "react";
import { useStore, useSelector } from "react-redux"
import { authActions } from '@/Store/Auth';
import { useRouter } from "next/navigation";

export function  Client({ children }) {
  const store = useStore();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('id') && localStorage.getItem('token')) {
      store.dispatch(authActions.logIn());
      router.push('/Posts')
    } else if (!isLoggedIn) {
      if (typeof window !== 'undefined') {
        router.push('/LogIn')
      }
    }
  }, []);

  return children;
}