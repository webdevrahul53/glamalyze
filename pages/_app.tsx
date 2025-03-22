import "@/styles/globals.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';


import type { AppProps } from "next/app";
import { HeroUIProvider } from "@heroui/react";
import Layout from "@/core/common/layout";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { store } from "@/core/redux/store";
import React from "react";
import AuthGuard from "@/core/utilities/authguard";
import { Flip, ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const authRoutes = ["/auth/login", "/auth/register"]; // Add protected routes here
  

  return (
    <Provider store={store}>
        <HeroUIProvider>
          <ToastContainer hideProgressBar position="bottom-left" theme="colored" transition={Flip} />
          {authRoutes.includes(router.pathname) ? (
            <Component {...pageProps} />
          ) : (
            <AuthGuard>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </AuthGuard>
          )}
        </HeroUIProvider>
    </Provider>
  );
}
