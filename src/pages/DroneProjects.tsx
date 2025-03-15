"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import { AlertCircle, Search, FileText, ExternalLink, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [expandedIds, setExpandedIds] = useState<number[]>([])
  const [selectedExample, setSelectedExample] = useState<ExemploDrone | null>(null)

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

    return matchesSearch && matchesCategory
  })

  // Função para alternar a expansão de um card
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  // Função para obter cor baseada na categoria
  const getCategoryColor = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case "agricultura":
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
      case "segurança":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "construção":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
      case "energia renovável":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "mapeamento":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
    }
  }

  if (error) {
    return (
      <div className="w-full px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erro</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#1a1f2c]">
      {" "}
      {/* Mudamos o background para todo o container */}
      {/* Header Profissional Simplificado */}
      <div className="relative w-full bg-[#1a1f2c] border-b border-gray-800">
        {/* Efeito de fundo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        {/* Conteúdo do header */}
        <div className="relative z-10 max-w-[2000px] mx-auto px-4 py-16 md:py-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white text-center"
          >
            Exemplos <span className="text-blue-400">Práticos</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto text-center"
          >
            Conheça projetos e aplicações reais onde drones são utilizados em diferentes setores
          </motion.p>

          {/* Barra de pesquisa */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl mx-auto relative"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar exemplos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-100/10 bg-white/10 backdrop-blur-sm
                  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  transition-all duration-200 shadow-lg"
                style={{
                  caretColor: "white",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      {/* Área de conteúdo com fundo claro */}
      <div className="w-full bg-gray-50 min-h-screen">
        {/* Filtros */}
        <div className="w-full px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-[2000px] mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-800">Filtrar por categoria</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={activeCategory === "Todos" ? "default" : "outline"}
                onClick={() => setActiveCategory("Todos")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300
                          ${activeCategory === "Todos" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
              >
                Todos
              </Button>

              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={activeCategory === categoria ? "default" : "outline"}
                  onClick={() => setActiveCategory(categoria)}
                  className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300
                            ${activeCategory === categoria ? getCategoryColor(categoria) : "hover:bg-gray-100"}`}
                >
                  {categoria}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Exemplos */}
        <div className="w-full px-4 md:px-6 lg:px-8 py-12">
          {/* Lista de Exemplos */}
          <div className="max-w-[2000px] mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ExemploSkeleton key={i} />
                ))}
              </div>
            ) : filteredExemplos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto"
              >
                <div className="flex flex-col items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum exemplo encontrado</h3>
                  <p className="text-gray-500 mb-6">
                    Não encontramos nenhum exemplo que corresponda à sua pesquisa. Tente usar termos diferentes ou
                    remover alguns filtros.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setActiveCategory("Todos")
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              >
                <AnimatePresence>
                  {filteredExemplos.map((exemplo, index) => (
                    <motion.div
                      key={exemplo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ExemploCard
                        exemplo={exemplo}
                        isExpanded={expandedIds.includes(exemplo.id)}
                        onToggleExpand={() => toggleExpand(exemplo.id)}
                        categoryColor={getCategoryColor(exemplo.categoria)}
                        onSelect={() => setSelectedExample(exemplo)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de detalhes */}
      <AnimatePresence>
        {selectedExample && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedExample(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {selectedExample.imagemUrl && (
                  <div className="h-72 md:h-96">
                    <img
                      src={selectedExample.imagemUrl || "/placeholder.svg"}
                      alt={selectedExample.nome}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40"
                    onClick={() => setSelectedExample(null)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <Badge className={`mb-4 ${getCategoryColor(selectedExample.categoria)}`}>
                  {selectedExample.categoria}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{selectedExample.nome}</h2>
                <p className="text-lg text-gray-600 mb-6">{selectedExample.resumo}</p>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{selectedExample.descricao}</p>
                </div>
                {selectedExample.linkDocumentacao && (
                  <div className="mt-8">
                    <Button
                      className="w-full md:w-auto px-6 py-2 rounded-lg"
                      onClick={() => window.open(selectedExample.linkDocumentacao, "_blank")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver documentação completa
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente de card para exibir um exemplo
interface ExemploCardProps {
  exemplo: ExemploDrone
  isExpanded: boolean
  onToggleExpand: () => void
  categoryColor: string
  onSelect: () => void
}

const ExemploCard = ({ exemplo, isExpanded, onToggleExpand, categoryColor, onSelect }: ExemploCardProps) => {
  return (
    <Card
      className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200"
      onClick={onSelect}
    >
      {exemplo.imagemUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={exemplo.imagemUrl || "/placeholder.svg"}
            alt={exemplo.nome}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge className={`absolute top-4 left-4 ${categoryColor}`}>{exemplo.categoria}</Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
          {exemplo.nome}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 line-clamp-2 mb-4">{exemplo.resumo}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:text-primary"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
          >
            {isExpanded ? "Ler menos" : "Ler mais"}
          </Button>

          {exemplo.linkDocumentacao && (
            <>
              <span>•</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(exemplo.linkDocumentacao, "_blank")
                }}
              >
                Ver documentação
              </Button>
            </>
          )}
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 text-gray-600"
          >
            <p className="line-clamp-6">{exemplo.descricao}</p>
            <Button
              variant="link"
              className="p-0 h-auto text-primary mt-2"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              Ver detalhes completos
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente de skeleton para carregamento
const ExemploSkeleton = () => {
  return (
    <Card className="h-full overflow-hidden border border-gray-200">
      <div className="h-48">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  )
}

export default ExemplosPage

