/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Game } from "./pages/Game";
import { Memories } from "./pages/Memories";
import { Onboarding } from "./components/Onboarding";
import { AuthProvider } from "./context/AuthContext";
import { NotificationManager } from "./components/NotificationManager";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="memories"
            element={
              <PageTransition>
                <Memories />
              </PageTransition>
            }
          />
          <Route
            path="journey"
            element={
              <PageTransition>
                <Game />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Onboarding />
      <NotificationManager />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
