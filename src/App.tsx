
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Header from './components/Header'

import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Integrantes from './pages/Integrantes'
import Contato from './pages/Contato'
import FAQ from './pages/FAQ'

import MinhaColheita from './pages/MinhaColheita'
import CadastrarColheita from './pages/CadastrarColheita'
import DetalhesColheita from './pages/DetalhesColheita'
import Tarefas from './pages/Tarefas'
import Vendas from './pages/Vendas'
import Financeiro from './pages/Financeiro'

// Novas páginas de autenticação
import Login from './pages/login'
import Cadastro from './pages/cadastro'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F6F8F2]">
        <Header />

        <Routes>
          {/* Páginas institucionais */}
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/integrantes" element={<Integrantes />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Área de colheitas */}
          <Route path="/colheitas" element={<MinhaColheita />} />
          <Route
            path="/colheitas/nova"
            element={<CadastrarColheita />}
          />
          <Route
            path="/colheitas/:id"
            element={<DetalhesColheita />}
          />

          {/* Funcionalidades da plataforma */}
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/financeiro" element={<Financeiro />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}