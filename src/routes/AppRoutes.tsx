import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login/Login";
import Livros from "../pages/Livros/Livros";
import Cadastro from '../pages/Cadastro/Cadastro'
import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route element={<PrivateRoute />}>
          <Route path="/livros" element={<Livros />} />
        </Route>

        <Route path="*" element={<Navigate to="/livros" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
