"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { toast } from "../../hooks/use-toast"
import {
  Pencil,
  Trash2,
  RefreshCw,
  Plus,
  LogOut,
  Search,
  Database,
  Layers,
  Info,
  Settings,
  DollarSign,
  FileText,
  LinkIcon,
  Cpu,
  Camera,
  Shield,
} from "lucide-react"
import api, { authService } from "../../services/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ScrollArea } from "../../components/ui/scroll-area"

// Interfaces corretas
interface Drone {
  id: number
  nome: string
  fabricante: string
  categoria: string
  descricao: string
  imagemUrl: string
  autonomia: number
  peso: number
  cargaMaxima: number
  velocidadeMaxima: number
  alcanceMaximo: number
  sensores: string
  resolucaoCamera: string
  gps: string
  sistemaAnticolisao: string
  conectividade: string
  modosVoo: string
  certificacao: string
  failSafe: string
  precoMin: number
  precoMax: number
}

interface ExemploDrone {
  id: number
  nome: string
  categoria: string
  resumo: string
  descricao: string
  imagemUrl?: string
  linkDocumentacao?: string
}

export default function AdminManager() {
  // Estados
  const [activeTab, setActiveTab] = useState<"drones" | "exemplos">("drones")
  const [drones, setDrones] = useState<Drone[]>([])
  const [exemplos, setExemplos] = useState<ExemploDrone[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDrone, setCurrentDrone] = useState<Partial<Drone>>({
    nome: "",
    fabricante: "",
    categoria: "",
    descricao: "",
    imagemUrl: "",
    autonomia: 0,
    peso: 0,
    cargaMaxima: 0,
    velocidadeMaxima: 0,
    alcanceMaximo: 0,
    sensores: "",
    resolucaoCamera: "",
    gps: "",
    sistemaAnticolisao: "",
    conectividade: "",
    modosVoo: "",
    certificacao: "",
    failSafe: "",
    precoMin: 0,
    precoMax: 0,
  })
  const [currentExemplo, setCurrentExemplo] = useState<Partial<ExemploDrone>>({
    nome: "",
    categoria: "",
    resumo: "",
    descricao: "",
    imagemUrl: "",
    linkDocumentacao: "",
  })

  // Verificar autenticação
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Faça login para aceder ao painel de administração.",
      })
      window.location.href = "/login"
    }
  }, [])

  // Buscar dados
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [dronesRes, exemplosRes] = await Promise.all([api.get("/drones"), api.get("/exemplos-drones")])
      setDrones(dronesRes.data)
      setExemplos(exemplosRes.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)

      // Se for erro de autenticação, redirecionar para login
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
        })
        authService.logout()
        window.location.href = "/login"
        return
      }

      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handlers
  const handleLogout = () => {
    authService.logout()
    toast({
      title: "Logout bem-sucedido",
      description: "Sessão terminada com sucesso.",
    })
    window.location.href = "/login"
  }

  const handleAddDrone = () => {
    setCurrentDrone({
      nome: "",
      fabricante: "",
      categoria: "",
      descricao: "",
      imagemUrl: "",
      autonomia: 0,
      peso: 0,
      cargaMaxima: 0,
      velocidadeMaxima: 0,
      alcanceMaximo: 0,
      sensores: "",
      resolucaoCamera: "",
      gps: "",
      sistemaAnticolisao: "",
      conectividade: "",
      modosVoo: "",
      certificacao: "",
      failSafe: "",
      precoMin: 0,
      precoMax: 0,
    })
    setIsDialogOpen(true)
  }

  const handleAddExemplo = () => {
    setCurrentExemplo({
      nome: "",
      categoria: "",
      resumo: "",
      descricao: "",
      imagemUrl: "",
      linkDocumentacao: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditDrone = (drone: Drone) => {
    setCurrentDrone(drone)
    setIsDialogOpen(true)
  }

  const handleEditExemplo = (exemplo: ExemploDrone) => {
    setCurrentExemplo(exemplo)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    setIsLoading(true)
    try {
      if (activeTab === "drones") {
        await api.delete(`/drones/${itemToDelete.id}`)
        setDrones(drones.filter((d) => d.id !== itemToDelete.id))
      } else {
        await api.delete(`/exemplos-drones/${itemToDelete.id}`)
        setExemplos(exemplos.filter((e) => e.id !== itemToDelete.id))
      }
      toast({
        title: "Sucesso",
        description: "Item eliminado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao eliminar item:", error)

      // Se for erro de autenticação, redirecionar para login
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
        })
        authService.logout()
        window.location.href = "/login"
        return
      }

      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível eliminar o item.",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleSubmitDrone = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar campos obrigatórios
      if (!currentDrone.nome || !currentDrone.fabricante || !currentDrone.categoria) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      // Para drones, sempre usamos POST (tanto para criar quanto para atualizar)
      const response = await api.post("/drones", currentDrone)

      if (currentDrone.id) {
        // Atualizar na lista local
        setDrones(drones.map((d) => (d.id === currentDrone.id ? response.data : d)))
      } else {
        // Adicionar à lista local
        setDrones([...drones, response.data])
      }

      toast({
        title: "Sucesso",
        description: `Drone ${currentDrone.id ? "atualizado" : "adicionado"} com sucesso.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao submeter formulário:", error)

      // Se for erro de autenticação, redirecionar para login
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
        })
        authService.logout()
        window.location.href = "/login"
        return
      }

      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível guardar os dados.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitExemplo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar campos obrigatórios
      if (!currentExemplo.nome || !currentExemplo.categoria || !currentExemplo.descricao) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      if (currentExemplo.id) {
        // Atualizar exemplo existente com PUT
        const response = await api.put(`/exemplos-drones/${currentExemplo.id}`, currentExemplo)
        setExemplos(exemplos.map((e) => (e.id === currentExemplo.id ? response.data : e)))
      } else {
        // Criar novo exemplo com POST
        const response = await api.post("/exemplos-drones", currentExemplo)
        setExemplos([...exemplos, response.data])
      }

      toast({
        title: "Sucesso",
        description: `Projeto ${currentExemplo.id ? "atualizado" : "adicionado"} com sucesso.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao submeter formulário:", error)

      // Se for erro de autenticação, redirecionar para login
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
        })
        authService.logout()
        window.location.href = "/login"
        return
      }

      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível guardar os dados.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar itens baseado na pesquisa
  const filteredDrones = drones.filter(
    (drone) =>
      drone.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredExemplos = exemplos.filter(
    (exemplo) =>
      exemplo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exemplo.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Função para obter cor da categoria
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      Agricultura: "bg-green-100 text-green-800 border-green-200",
      Fotografia: "bg-purple-100 text-purple-800 border-purple-200",
      "Fotografia Aérea": "bg-purple-100 text-purple-800 border-purple-200",
      Inspeção: "bg-blue-100 text-blue-800 border-blue-200",
      Segurança: "bg-red-100 text-red-800 border-red-200",
      Mapeamento: "bg-amber-100 text-amber-800 border-amber-200",
    }

    return categories[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-600" />
              Painel de Administração
            </h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => fetchData()}
                variant="outline"
                disabled={isLoading}
                className="border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-6">
        {/* Tabs e Pesquisa */}
        <div className="mb-6">
          <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "drones" | "exemplos")}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList className="bg-white border p-1 shadow-sm">
                <TabsTrigger
                  value="drones"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Drones
                </TabsTrigger>
                <TabsTrigger
                  value="exemplos"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Projetos
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={`Pesquisar ${activeTab === "drones" ? "drones" : "projetos"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px] bg-white border-gray-200"
                />
              </div>
            </div>

            <TabsContent value="drones" className="mt-0">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">Gestão de Drones</h2>
                      <p className="text-sm text-gray-500">
                        {filteredDrones.length}{" "}
                        {filteredDrones.length === 1 ? "drone encontrado" : "drones encontrados"}
                      </p>
                    </div>
                    <Button onClick={handleAddDrone} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Drone
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Nome</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Fabricante</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Categoria</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Autonomia</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Velocidade</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Preço (€)</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDrones.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              Nenhum drone encontrado. Tente ajustar sua pesquisa ou adicione um novo drone.
                            </td>
                          </tr>
                        ) : (
                          filteredDrones.map((drone, index) => (
                            <tr
                              key={drone.id}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {drone.imagemUrl && (
                                    <div className="h-8 w-8 rounded-md bg-gray-100 mr-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={drone.imagemUrl || "/placeholder.svg"}
                                        alt={drone.nome}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=32&width=32"
                                        }}
                                      />
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-800">{drone.nome}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">{drone.fabricante}</td>
                              <td className="px-4 py-3">
                                <Badge className={`font-normal ${getCategoryColor(drone.categoria)}`}>
                                  {drone.categoria}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-gray-700">{drone.autonomia} min</td>
                              <td className="px-4 py-3 text-gray-700">{drone.velocidadeMaxima} km/h</td>
                              <td className="px-4 py-3 text-gray-700">
                                {drone.precoMin === drone.precoMax
                                  ? `${drone.precoMin.toLocaleString("pt-PT")} €`
                                  : `${drone.precoMin.toLocaleString("pt-PT")} - ${drone.precoMax.toLocaleString("pt-PT")} €`}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditDrone(drone)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete(drone)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exemplos" className="mt-0">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">Gestão de Projetos</h2>
                      <p className="text-sm text-gray-500">
                        {filteredExemplos.length}{" "}
                        {filteredExemplos.length === 1 ? "projeto encontrado" : "projetos encontrados"}
                      </p>
                    </div>
                    <Button onClick={handleAddExemplo} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Projeto
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Nome</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Categoria</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Resumo</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500">Documentação</th>
                          <th className="px-4 py-3 text-sm font-medium text-gray-500 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExemplos.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                              Nenhum projeto encontrado. Tente ajustar sua pesquisa ou adicione um novo projeto.
                            </td>
                          </tr>
                        ) : (
                          filteredExemplos.map((exemplo, index) => (
                            <tr
                              key={exemplo.id}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {exemplo.imagemUrl && (
                                    <div className="h-8 w-8 rounded-md bg-gray-100 mr-2 overflow-hidden flex-shrink-0">
                                      <img
                                        src={exemplo.imagemUrl || "/placeholder.svg"}
                                        alt={exemplo.nome}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=32&width=32"
                                        }}
                                      />
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-800">{exemplo.nome}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={`font-normal ${getCategoryColor(exemplo.categoria)}`}>
                                  {exemplo.categoria}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 max-w-xs truncate text-gray-700">{exemplo.resumo}</td>
                              <td className="px-4 py-3">
                                {exemplo.linkDocumentacao ? (
                                  <a
                                    href={exemplo.linkDocumentacao}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    <LinkIcon className="h-3 w-3 mr-1" />
                                    Ver documentação
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditExemplo(exemplo)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 mr-1"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemToDelete(exemplo)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Diálogo para adicionar/editar drone */}
      {activeTab === "drones" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white p-0 max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="p-6 border-b bg-gray-50">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                {currentDrone.id ? "Editar" : "Adicionar"} Drone
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-10rem)] p-6">
              <form onSubmit={handleSubmitDrone} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Básicas */}
                  <Card className="border-gray-200 shadow-sm col-span-1 md:col-span-2">
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center mb-4">
                        <Info className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="text-base font-medium text-gray-900">Informações Básicas</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome" className="text-gray-700 font-medium">
                            Nome <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="nome"
                            value={currentDrone.nome}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, nome: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fabricante" className="text-gray-700 font-medium">
                            Fabricante <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="fabricante"
                            value={currentDrone.fabricante}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, fabricante: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="categoria" className="text-gray-700 font-medium">
                            Categoria <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={currentDrone.categoria}
                            onValueChange={(value) => setCurrentDrone({ ...currentDrone, categoria: value })}
                          >
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Agricultura">Agricultura</SelectItem>
                              <SelectItem value="Fotografia Aérea">Fotografia Aérea</SelectItem>
                              <SelectItem value="Inspeção">Inspeção</SelectItem>
                              <SelectItem value="Segurança">Segurança</SelectItem>
                              <SelectItem value="Mapeamento">Mapeamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="certificacao" className="text-gray-700 font-medium">
                            Certificação <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="certificacao"
                            value={currentDrone.certificacao}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, certificacao: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Especificações Técnicas */}
                  <Card className="border-gray-200 shadow-sm col-span-1 md:col-span-2">
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center mb-4">
                        <Cpu className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="text-base font-medium text-gray-900">Especificações Técnicas</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="autonomia" className="text-gray-700 font-medium">
                            Autonomia (min) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="autonomia"
                            type="number"
                            value={currentDrone.autonomia}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, autonomia: Number(e.target.value) })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="velocidadeMaxima" className="text-gray-700 font-medium">
                            Velocidade (km/h) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="velocidadeMaxima"
                            type="number"
                            value={currentDrone.velocidadeMaxima}
                            onChange={(e) =>
                              setCurrentDrone({ ...currentDrone, velocidadeMaxima: Number(e.target.value) })
                            }
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alcanceMaximo" className="text-gray-700 font-medium">
                            Alcance (km) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="alcanceMaximo"
                            type="number"
                            step="0.1"
                            value={currentDrone.alcanceMaximo}
                            onChange={(e) =>
                              setCurrentDrone({ ...currentDrone, alcanceMaximo: Number(e.target.value) })
                            }
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="peso" className="text-gray-700 font-medium">
                            Peso (kg) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="peso"
                            type="number"
                            step="0.01"
                            value={currentDrone.peso}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, peso: Number(e.target.value) })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cargaMaxima" className="text-gray-700 font-medium">
                            Carga Máxima (kg) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cargaMaxima"
                            type="number"
                            step="0.01"
                            value={currentDrone.cargaMaxima}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, cargaMaxima: Number(e.target.value) })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Câmara e Sensores */}
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center mb-4">
                        <Camera className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="text-base font-medium text-gray-900">Câmara e Sensores</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resolucaoCamera" className="text-gray-700 font-medium">
                            Resolução da Câmara <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="resolucaoCamera"
                            value={currentDrone.resolucaoCamera}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, resolucaoCamera: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sensores" className="text-gray-700 font-medium">
                            Sensores <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="sensores"
                            value={currentDrone.sensores}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, sensores: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sistemas */}
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center mb-4">
                        <Shield className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="text-base font-medium text-gray-900">Sistemas</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gps" className="text-gray-700 font-medium">
                            Sistema GPS <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="gps"
                            value={currentDrone.gps}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, gps: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sistemaAnticolisao" className="text-gray-700 font-medium">
                            Sistema Anticolisão <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="sistemaAnticolisao"
                            value={currentDrone.sistemaAnticolisao}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, sistemaAnticolisao: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="conectividade" className="text-gray-700 font-medium">
                            Conectividade <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="conectividade"
                            value={currentDrone.conectividade}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, conectividade: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="modosVoo" className="text-gray-700 font-medium">
                            Modos de Voo <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="modosVoo"
                            value={currentDrone.modosVoo}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, modosVoo: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="failSafe" className="text-gray-700 font-medium">
                            Sistema Fail-Safe <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="failSafe"
                            value={currentDrone.failSafe}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, failSafe: e.target.value })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preço e Imagem */}
                  <Card className="border-gray-200 shadow-sm col-span-1 md:col-span-2">
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center mb-4">
                        <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="text-base font-medium text-gray-900">Preço e Imagem</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="precoMin" className="text-gray-700 font-medium">
                            Preço Mínimo (€) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="precoMin"
                            type="number"
                            value={currentDrone.precoMin}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, precoMin: Number(e.target.value) })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="precoMax" className="text-gray-700 font-medium">
                            Preço Máximo (€) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="precoMax"
                            type="number"
                            value={currentDrone.precoMax}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, precoMax: Number(e.target.value) })}
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="imagemUrl" className="text-gray-700 font-medium">
                            URLs das Imagens <span className="text-red-500">*</span>
                          </Label>

                          <Input
                            id="imagemUrl"
                            value={currentDrone.imagemUrl}
                            onChange={(e) => setCurrentDrone({ ...currentDrone, imagemUrl: e.target.value })}
                            placeholder="Separe as URLs com vírgulas"
                            className="bg-white border-gray-200 focus:border-blue-300"
                            required
                          />

                          {currentDrone.imagemUrl && (
                            <div className="flex gap-2 flex-wrap">
                              {currentDrone.imagemUrl.split(',').map((url, index) => (
                                <div
                                  key={index}
                                  className="h-10 w-10 rounded-md border border-gray-200 overflow-hidden flex-shrink-0"
                                >
                                  <img
                                    src={url.trim() || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </CardContent>
                  </Card>

                  {/* Descrição */}
                  <Card className="border-gray-200 shadow-sm col-span-1 md:col-span-2">
                    <CardContent className="p-4 pt-6">
                      <div className="flex items-center mb-4">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="text-base font-medium text-gray-900">Descrição</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao" className="text-gray-700 font-medium">
                          Descrição Detalhada <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="descricao"
                          value={currentDrone.descricao}
                          onChange={(e) => setCurrentDrone({ ...currentDrone, descricao: e.target.value })}
                          className="bg-white border-gray-200 focus:border-blue-300 min-h-[120px]"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </form>
            </ScrollArea>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white border-gray-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={handleSubmitDrone}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />A guardar...
                  </>
                ) : (
                  <>Guardar</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para adicionar/editar exemplo */}
      {activeTab === "exemplos" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-white p-0 max-w-[600px]">
            <DialogHeader className="p-6 border-b bg-gray-50">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Layers className="h-5 w-5 mr-2 text-blue-600" />
                {currentExemplo.id ? "Editar" : "Adicionar"} Projeto
              </DialogTitle>
            </DialogHeader>

            <div className="p-6">
              <form onSubmit={handleSubmitExemplo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700 font-medium">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={currentExemplo.nome}
                    onChange={(e) => setCurrentExemplo({ ...currentExemplo, nome: e.target.value })}
                    className="bg-white border-gray-200 focus:border-blue-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-gray-700 font-medium">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentExemplo.categoria}
                    onValueChange={(value) => setCurrentExemplo({ ...currentExemplo, categoria: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agricultura">Agricultura</SelectItem>
                      <SelectItem value="Fotografia">Fotografia</SelectItem>
                      <SelectItem value="Inspeção">Inspeção</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                      <SelectItem value="Mapeamento">Mapeamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumo" className="text-gray-700 font-medium">
                    Resumo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="resumo"
                    value={currentExemplo.resumo}
                    onChange={(e) => setCurrentExemplo({ ...currentExemplo, resumo: e.target.value })}
                    className="bg-white border-gray-200 focus:border-blue-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-gray-700 font-medium">
                    Descrição <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="descricao"
                    value={currentExemplo.descricao}
                    onChange={(e) => setCurrentExemplo({ ...currentExemplo, descricao: e.target.value })}
                    className="bg-white border-gray-200 focus:border-blue-300 min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagemUrl" className="text-gray-700 font-medium">
                    URL da Imagem
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="imagemUrl"
                      value={currentExemplo.imagemUrl}
                      onChange={(e) => setCurrentExemplo({ ...currentExemplo, imagemUrl: e.target.value })}
                      className="bg-white border-gray-200 focus:border-blue-300"
                    />
                    {currentExemplo.imagemUrl && (
                      <div className="h-10 w-10 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={currentExemplo.imagemUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkDocumentacao" className="text-gray-700 font-medium">
                    Link da Documentação
                  </Label>
                  <Input
                    id="linkDocumentacao"
                    type="url"
                    value={currentExemplo.linkDocumentacao}
                    onChange={(e) => setCurrentExemplo({ ...currentExemplo, linkDocumentacao: e.target.value })}
                    className="bg-white border-gray-200 focus:border-blue-300"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white border-gray-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={handleSubmitExemplo}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />A guardar...
                  </>
                ) : (
                  <>Guardar</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmação para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Confirmar eliminação</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              Tem a certeza que pretende eliminar este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />A eliminar...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}