import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import { ptBR } from "@clerk/localizations";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Clerk Publishable Key não encontrada. Certifique-se de configurar VITE_CLERK_PUBLISHABLE_KEY no arquivo .env");
}

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY || ""}
      afterSignOutUrl="/"
      localization={ptBR}
    >
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <DataProvider>
              <Toaster position="top-right" richColors />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard-analitico" element={<Index />} />
                </Route>
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;