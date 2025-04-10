"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import { Dialog, DialogContent } from "../components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Search, X, FileText, ExternalLink, Filter, ArrowRight, ChevronDown } from "lucide-react"
import api from "../services/api"

// Definição do tipo de dados para os exemplos de drones
interface ExemploDrone {
  id: number
  nome: string
  categoria: string
  resumo: string
  descricao: string
  imagemUrl?: string
  linkDocumentacao?: string
}

const ExemplosPage = () => {
  const [exemplos, setExemplos] = useState<ExemploDrone[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [selectedExample, setSelectedExample] = useState<ExemploDrone | null>(null)
  const [activeTab, setActiveTab] = useState("todos")
  const [filtersVisible, setFiltersVisible] = useState(false)

  // Buscar dados da API
  useEffect(() => {
    setLoading(true)
    api
      .get("/exemplos-drones")
      .then((response) => {
        const data = response.data
        setExemplos(data)

        // Extrair categorias únicas
        const uniqueCategorias = Array.from(new Set(data.map((exemplo: ExemploDrone) => exemplo.categoria)))
        setCategorias(uniqueCategorias as string[])
      })
      .catch((error) => {
        console.error("Erro ao carregar exemplos:", error)
        setError("Não foi possível carregar os exemplos. Verifique se o backend está em execução.")
      })
      .finally(() => setLoading(false))
  }, [])

  // Filtrar exemplos
  const filteredExemplos = exemplos.filter((exemplo) => {
    const matchesSearch =
      exemplo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exemplo.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exemplo.descricao.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = activeCategory === "Todos" || exemplo.categoria === activeCategory

    const matchesTab =
      activeTab === "todos" ||
      (activeTab === "populares" && exemplo.id % 2 === 0) || // Simulando exemplos populares
      (activeTab === "recentes" && exemplo.id > exemplos.length / 2) // Simulando exemplos recentes

    return matchesSearch && matchesCategory && matchesTab
  })

  // Função para obter cor baseada na categoria
  const getCategoryColor = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case "energia renovável":
        return "bg-amber-500 hover:bg-amber-600"
      case "engenharia sanitária":
        return "bg-teal-600 hover:bg-teal-700"
      case "agricultura":
        return "bg-emerald-600 hover:bg-emerald-700"
      case "segurança":
        return "bg-rose-600 hover:bg-rose-700"
      case "construção":
        return "bg-orange-500 hover:bg-orange-600"
      case "mapeamento":
        return "bg-violet-600 hover:bg-violet-700"
      default:
        return "bg-slate-700 hover:bg-slate-800"
    }
  }

  // Função para obter ícone baseado na categoria
  const getCategoryIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case "energia renovável":
        return "⚡"
      case "engenharia sanitária":
        return "🔧"
      case "agricultura":
        return "🌱"
      case "segurança":
        return "🔒"
      case "construção":
        return "🏗️"
      case "mapeamento":
        return "🗺️"
      default:
        return "🚁"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header com design moderno e elegante */}
      <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
        {/* Elementos decorativos avançados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Padrão de grade com opacidade variável */}
            <div className="absolute inset-0 bg-grid-white/[0.03] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />

            {/* Elementos gráficos flutuantes */}
            <div
              className="absolute -top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-3xl animate-pulse"
              style={{ animationDuration: "8s" }}
            />
            <div
              className="absolute top-[20%] -left-[5%] w-[25%] h-[25%] rounded-full bg-amber-500/10 blur-3xl animate-pulse"
              style={{ animationDuration: "12s" }}
            />
            <div
              className="absolute -bottom-[10%] right-[30%] w-[20%] h-[20%] rounded-full bg-rose-500/10 blur-3xl animate-pulse"
              style={{ animationDuration: "10s" }}
            />

            {/* Linhas decorativas */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            </div>

            {/* Silhuetas de drones */}
            <div className="absolute top-10 right-10 opacity-10">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L8 6h8l-4-4z" fill="white" />
                <path d="M12 22l4-4H8l4 4z" fill="white" />
                <path d="M2 12l4 4v-8l-4 4z" fill="white" />
                <path d="M22 12l-4-4v8l4-4z" fill="white" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <div className="absolute bottom-10 left-10 opacity-10">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L8 6h8l-4-4z" fill="white" />
                <path d="M12 22l4-4H8l4 4z" fill="white" />
                <path d="M2 12l4 4v-8l-4 4z" fill="white" />
                <path d="M22 12l-4-4v8l4-4z" fill="white" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
          </div>
        </div>

        {/* Conteúdo do header */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-full shadow-lg shadow-emerald-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L8 6h8l-4-4z" />
                <path d="M12 22l4-4H8l4 4z" />
                <path d="M2 12l4 4v-8l-4 4z" />
                <path d="M22 12l-4-4v8l4-4z" />
                <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300 text-center mb-4 drop-shadow-sm">
            Exemplos Práticos de Drones
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mb-6"></div>

          <p className="text-slate-300 text-lg md:text-xl max-w-3xl text-center mb-10 leading-relaxed">
            Explore casos reais de aplicação de drones em diversos setores da indústria e pesquisa
          </p>

          {/* Barra de pesquisa aprimorada */}
          <div className="w-full max-w-2xl relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full opacity-30 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar exemplos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm
                    text-white placeholder-slate-300/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                    transition-all duration-200 shadow-lg"
                  aria-label="Pesquisar exemplos"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300 hover:text-white"
                    aria-label="Limpar pesquisa"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs & Filters */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full md:w-auto grid-cols-3 h-11">
                <TabsTrigger value="todos" className="text-sm">
                  Todos os Exemplos
                </TabsTrigger>
                <TabsTrigger value="populares" className="text-sm">
                  Populares
                </TabsTrigger>
                <TabsTrigger value="recentes" className="text-sm">
                  Recentes
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filtro toggle */}
            <Button
              variant="outline"
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="flex items-center gap-2"
              aria-expanded={filtersVisible}
              aria-controls="filter-panel"
            >
              <Filter className="h-4 w-4" />
              Filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersVisible ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* Filtros expandidos */}
          {filtersVisible && (
            <div
              id="filter-panel"
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filtrar por categoria</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategory("Todos")}
                  className="text-sm text-emerald-600 hover:text-emerald-800"
                >
                  Limpar filtros
                </Button>
              </div>

              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categorias de projetos">
                <Button
                  onClick={() => setActiveCategory("Todos")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === "Todos"
                      ? "bg-slate-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  variant="ghost"
                  role="radio"
                  aria-checked={activeCategory === "Todos"}
                >
                  Todos
                </Button>

                {categorias.map((categoria) => (
                  <Button
                    key={categoria}
                    onClick={() => setActiveCategory(categoria)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeCategory === categoria
                        ? `${getCategoryColor(categoria)} text-white`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    variant="ghost"
                    role="radio"
                    aria-checked={activeCategory === categoria}
                  >
                    <span>{getCategoryIcon(categoria)}</span>
                    {categoria}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-medium text-gray-900">{filteredExemplos.length}</span> de{" "}
              <span className="font-medium text-gray-900">{exemplos.length}</span> exemplos
            </p>

            {activeCategory !== "Todos" && (
              <Badge className={`${getCategoryColor(activeCategory)} text-white`}>
                <span className="flex items-center gap-1">
                  <span>{getCategoryIcon(activeCategory)}</span>
                  {activeCategory}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Examples Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ExemploSkeleton key={i} />
            ))}
          </div>
        ) : filteredExemplos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum exemplo encontrado</h3>
              <p className="text-gray-500 mb-6">
                Não encontramos nenhum exemplo que corresponda à sua pesquisa. Tente usar termos diferentes ou remover
                alguns filtros.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setActiveCategory("Todos")
                  setActiveTab("todos")
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            role="list"
            aria-label="Lista de exemplos de projetos com drones"
          >
            {filteredExemplos.map((exemplo) => (
              <ExemploCard
                key={exemplo.id}
                exemplo={exemplo}
                categoryColor={getCategoryColor(exemplo.categoria)}
                categoryIcon={getCategoryIcon(exemplo.categoria)}
                onSelect={() => setSelectedExample(exemplo)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de detalhes - Layout adaptativo para diferentes quantidades de conteúdo */}
      <Dialog open={!!selectedExample} onOpenChange={(open) => !open && setSelectedExample(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-xl max-h-[90vh] flex flex-col">
          {selectedExample && (
            <>
              {/* Cabeçalho do modal - fixo no topo */}
              <div className="relative p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getCategoryColor(selectedExample.categoria)} text-white px-3 py-1.5`}>
                      <span className="flex items-center">
                        <span className="mr-1">{getCategoryIcon(selectedExample.categoria)}</span>
                        {selectedExample.categoria}
                      </span>
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedExample.nome}</h2>
                  </div>
                </div>

                {/* Resumo */}
                <p className="text-gray-600 mt-3 text-sm sm:text-base">{selectedExample.resumo}</p>
              </div>

              {/* Conteúdo principal - área com rolagem */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                {/* Layout flexível que se adapta ao conteúdo */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Imagem (se existir) */}
                  {selectedExample.imagemUrl && (
                    <div className="lg:w-2/5 flex-shrink-0">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="relative rounded-lg overflow-hidden shadow-md">
                          <img
                            src={selectedExample.imagemUrl || "/placeholder.svg"}
                            alt={selectedExample.nome}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descrição detalhada */}
                  <div className={`${selectedExample.imagemUrl ? "lg:w-3/5" : "w-full"}`}>
                    <div className="prose max-w-none">
                      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Descrição detalhada</h3>
                      <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {selectedExample.descricao.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de ação - fixos na parte inferior */}
              <div className="border-t border-gray-100 p-4 sm:p-6 bg-white flex-shrink-0">
                <div className="flex flex-wrap gap-4 justify-end">
                  {selectedExample.linkDocumentacao && (
                    <Button
                      className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 transition-all duration-300"
                      onClick={() => window.open(selectedExample.linkDocumentacao, "_blank")}
                    >
                      <FileText className="h-4 w-4" />
                      Ver documentação completa
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelectedExample(null)}
                    className="border-gray-300 hover:bg-gray-100 transition-all duration-300"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente de card para exibir um exemplo
interface ExemploCardProps {
  exemplo: ExemploDrone
  categoryColor: string
  categoryIcon: string
  onSelect: () => void
}

const ExemploCard = ({ exemplo, categoryColor, categoryIcon, onSelect }: ExemploCardProps) => {
  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white cursor-pointer h-full flex flex-col hover:border-emerald-200 hover:-translate-y-1"
      onClick={onSelect}
      role="listitem"
      aria-label={`Projeto: ${exemplo.nome}, Categoria: ${exemplo.categoria}`}
    >
      {exemplo.imagemUrl && (
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/60 mix-blend-multiply z-10" />
          <img
            src={exemplo.imagemUrl || "/placeholder.svg?height=200&width=400"}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 z-20" />
          <div className="absolute top-4 left-4 z-30">
            <Badge className={`${categoryColor} text-white px-2.5 py-1 shadow-md`}>
              <span className="flex items-center">
                <span className="mr-1">{categoryIcon}</span>
                {exemplo.categoria}
              </span>
            </Badge>
          </div>

          {/* Título sobreposto na imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
            <h3 className="text-xl font-semibold text-white group-hover:text-emerald-100 transition-colors drop-shadow-md">
              {exemplo.nome}
            </h3>
          </div>
        </div>
      )}

      <CardContent className={`p-6 flex-grow flex flex-col ${exemplo.imagemUrl ? "pt-3" : "pt-6"}`}>
        {!exemplo.imagemUrl && (
          <>
            <div className="mb-3">
              <Badge className={`${categoryColor} text-white px-2.5 py-1`}>
                <span className="flex items-center">
                  <span className="mr-1">{categoryIcon}</span>
                  {exemplo.categoria}
                </span>
              </Badge>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-emerald-600 transition-colors">
              {exemplo.nome}
            </h3>
          </>
        )}

        <p className={`text-gray-600 mb-4 ${exemplo.imagemUrl ? "line-clamp-2" : "line-clamp-3"} text-sm flex-grow`}>
          {exemplo.resumo}
        </p>

        <div className="flex justify-end mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 p-0 h-auto text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            aria-label={`Ver detalhes de ${exemplo.nome}`}
          >
            Ver detalhes <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de skeleton para carregamento
const ExemploSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-gray-200 bg-white h-full">
      <div className="h-52">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-7 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex justify-end">
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export default ExemplosPage