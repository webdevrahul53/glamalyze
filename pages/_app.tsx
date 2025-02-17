import "@/styles/globals.css";
import type { AppProps } from "next/app";

import {HeroUIProvider} from '@heroui/react'
import Layout from "@/core/common/layout";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </HeroUIProvider>
  )
}
