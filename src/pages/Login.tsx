"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../hooks/use-toast"
import { authService } from "../services/api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.login(email, password)

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao painel de administração.",
      })

      navigate("/admin")
    } catch (error) {
      console.error("Erro ao fazer login:", error)

      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Email ou password inválidos. Tente novamente!",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoHome = () => {
    navigate("/")
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center w-full">
      {/* Cabeçalho fixo no topo */}
      <header className="bg-blue-600 text-white p-4 shadow-md w-full flex justify-center fixed top-0 left-0">
        <h1 className="text-2xl font-semibold">Painel de Administração</h1>
      </header>

      {/* Container principal (Formulário 100% centralizado) */}
      <div className="flex justify-center items-center flex-grow w-full px-4 md:px-8 lg:px-[480px] py-12 mt-20">
        {/* Formulário de Login */}
        <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg w-full max-w-lg mx-auto">
          {/* Logo da Web App */}
          <div className="text-center mb-8">
            <img
              src="/logo.png" // Ajuste o caminho da logo conforme necessário
              alt="Logo"
              className="h-16 w-auto mx-auto"
              onError={(e) => {
                // Fallback se a imagem não carregar
                e.currentTarget.style.display = "none"
              }}
            />
          </div>

          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Acesso ao Sistema</h1>
          <p className="text-center text-gray-600 mb-6">Insira os seus dados para entrar no painel administrativo.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Insira o seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="p-3"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Insira a sua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="p-3"
                required
              />
            </div>

            <Button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
              {isLoading ? "A autenticar..." : "Entrar"}
            </Button>

            {/* Botão para voltar à Home */}
            <Button
              type="button"
              onClick={handleGoHome}
              className="w-full py-6 bg-gray-600 hover:bg-gray-700 text-white"
              disabled={isLoading}
            >
              Voltar para a Home
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}