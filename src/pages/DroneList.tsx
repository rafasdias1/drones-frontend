"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import "jspdf-autotable"
import Slider from "@mui/material/Slider"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import api from "../services/api"

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

export default function CatalogoDrones() {
  const [drones, setDrones] = useState<Drone[]>([])
  const [filteredDrones, setFilteredDrones] = useState<Drone[]>([])
  const [comparacao, setComparacao] = useState<Drone[]>([])
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFilters, setExpandedFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info" as "info" | "success" | "error" | "warning",
  })

  // Filtros básicos
  const [filtro, setFiltro] = useState({
    fabricantes: [] as string[],
    categorias: [] as string[],
    autonomia: [0, 100],
    peso: [0, 10],
    preco: [0, 10000],
    temGPS: false,
    temAnticolisao: false,
    temCamera4K: false,
  })

  // Carregar drones da API
  useEffect(() => {
    setLoading(true)
    api
      .get("/drones")
      .then((response) => {
        setDrones(response.data)
        setFilteredDrones(response.data)

        // Encontrar valores máximos para os sliders
        const maxAutonomia = Math.max(...response.data.map((d: Drone) => d.autonomia), 100)
        const maxPeso = Math.max(...response.data.map((d: Drone) => d.peso), 10)
        const maxPreco = Math.max(...response.data.map((d: Drone) => d.precoMax), 10000)

        setFiltro((prev) => ({
          ...prev,
          autonomia: [0, maxAutonomia],
          peso: [0, maxPeso],
          preco: [0, maxPreco],
        }))
      })
      .catch((error) => {
        console.error("Erro ao carregar drones:", error)
        setError("Erro ao carregar os drones. Tente novamente mais tarde.")
      })
      .finally(() => setLoading(false))
  }, [])

  // Categorias disponíveis
  const categorias = useMemo(() => {
    return Array.from(new Set(drones.map((d) => d.categoria)))
  }, [drones])

  // Fabricantes disponíveis
  const fabricantes = useMemo(() => {
    return Array.from(new Set(drones.map((d) => d.fabricante)))
  }, [drones])

  // Filtrar por categoria (tabs)
  useEffect(() => {
    if (activeTab === "todos") {
      aplicarFiltros()
    } else {
      const filtered = drones.filter(
        (drone) => drone.categoria === activeTab && matchesSearchQuery(drone) && matchesFilters(drone),
      )
      setFilteredDrones(filtered)
    }
  }, [activeTab, searchQuery, drones])

  // Verificar se o drone corresponde à pesquisa
  const matchesSearchQuery = (drone: Drone) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    return (
      drone.nome.toLowerCase().includes(query) ||
      drone.fabricante.toLowerCase().includes(query) ||
      drone.categoria.toLowerCase().includes(query) ||
      drone.descricao.toLowerCase().includes(query)
    )
  }

  // Verificar se o drone corresponde aos filtros
  const matchesFilters = (drone: Drone) => {
    // Filtro de fabricantes
    if (filtro.fabricantes.length > 0 && !filtro.fabricantes.includes(drone.fabricante)) {
      return false
    }

    // Filtro de categorias
    if (filtro.categorias.length > 0 && !filtro.categorias.includes(drone.categoria)) {
      return false
    }

    // Filtro de autonomia
    if (drone.autonomia < filtro.autonomia[0] || drone.autonomia > filtro.autonomia[1]) {
      return false
    }

    // Filtro de peso
    if (drone.peso < filtro.peso[0] || drone.peso > filtro.peso[1]) {
      return false
    }

    // Filtro de preço
    if (drone.precoMin > filtro.preco[1] || drone.precoMax < filtro.preco[0]) {
      return false
    }

    // Filtros de recursos
    if (filtro.temGPS && !drone.gps) {
      return false
    }

    if (filtro.temAnticolisao && !drone.sistemaAnticolisao) {
      return false
    }

    if (filtro.temCamera4K && !drone.resolucaoCamera.toLowerCase().includes("4k")) {
      return false
    }

    return true
  }

  // Atualizar filtros quando o usuário selecionar um fabricante
  const handleFabricanteChange = (fabricante: string) => {
    setFiltro((prev) => {
      const fabricantes = prev.fabricantes.includes(fabricante)
        ? prev.fabricantes.filter((f) => f !== fabricante)
        : [...prev.fabricantes, fabricante]
      return { ...prev, fabricantes }
    })
  }

  // Atualizar filtros quando o usuário selecionar uma categoria
  const handleCategoriaChange = (categoria: string) => {
    setFiltro((prev) => {
      const categorias = prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria]
      return { ...prev, categorias }
    })
  }

  // Aplicar filtros aos drones
  const aplicarFiltros = () => {
    const resultado = drones.filter((drone) => matchesSearchQuery(drone) && matchesFilters(drone))

    setFilteredDrones(resultado)

    // Mostrar notificação
    showNotification(`${resultado.length} drones encontrados`, "info")
  }

  // Limpar todos os filtros
  const limparFiltros = () => {
    const maxAutonomia = Math.max(...drones.map((d) => d.autonomia), 100)
    const maxPeso = Math.max(...drones.map((d) => d.peso), 10)
    const maxPreco = Math.max(...drones.map((d) => d.precoMax), 10000)

    setFiltro({
      fabricantes: [],
      categorias: [],
      autonomia: [0, maxAutonomia],
      peso: [0, maxPeso],
      preco: [0, maxPreco],
      temGPS: false,
      temAnticolisao: false,
      temCamera4K: false,
    })

    setSearchQuery("")
    setActiveTab("todos")
    setFilteredDrones(drones)
  }

  // Adicionar ou remover drone da comparação
  const toggleComparacao = (drone: Drone) => {
    setComparacao((prev) => {
      // Se o drone já está na comparação, remova-o
      if (prev.some((d) => d.id === drone.id)) {
        return prev.filter((d) => d.id !== drone.id)
      }

      // Se estiver adicionando mais de 4 drones, mostre um aviso
      if (prev.length >= 4) {
        showNotification("Você pode comparar no máximo 4 drones", "warning")
        return prev
      }

      // Adicione o drone à comparação
      const novosComparados = [...prev, drone]

      // Abra o painel de comparação se este for o primeiro drone adicionado
      if (prev.length === 0) {
        setComparisonOpen(true)
      }

      return novosComparados
    })
  }

  // Exportar comparação para PDF
  const exportarPDF = () => {
    if (comparacao.length === 0) {
      showNotification("Selecione pelo menos um drone para exportar", "warning")
      return
    }

    try {
      // Construir a URL com os IDs dos drones para comparação
      const ids = comparacao.map((drone) => drone.id)
      const queryParams = ids.map((id) => `ids=${id}`).join("&")
      const exportUrl = `${api.defaults.baseURL}/drones/export/pdf?${queryParams}`

      // Abrir a URL em uma nova aba para download
      window.open(exportUrl, "_blank")

      showNotification("PDF gerado com sucesso", "success")
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      showNotification("Erro ao gerar PDF", "error")
    }
  }

  // Mostrar notificação
  const showNotification = (message: string, type: "info" | "success" | "error" | "warning") => {
    setNotification({
      show: true,
      message,
      type,
    })

    // Esconder notificação após 3 segundos
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  // Formatar preço
  const formatarPreco = (min: number, max: number) => {
    if (min === max) {
      return min.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
    }
    return `${min.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })} - ${max.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}`
  }

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-3"></div>
        <span className="text-xl text-gray-700">Carregando drones...</span>
      </div>
    )
  }

  // Renderizar estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-4 text-red-600">{error}</h3>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificação */}
      {notification.show && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Barra superior com pesquisa */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Catálogo de Drones</h1>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <input
                  type="text"
                  placeholder="Pesquisar drones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
              </div>

              <button
                onClick={limparFiltros}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Tabs de categorias */}
          <div className="flex overflow-x-auto py-2 gap-2 mt-2 no-scrollbar">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                activeTab === "todos" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>

            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setActiveTab(categoria)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                  activeTab === categoria ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de filtros */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-[136px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Filtros</h2>
                  <button onClick={() => setExpandedFilters(!expandedFilters)} className="lg:hidden text-gray-500">
                    {expandedFilters ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedFilters ? "max-h-[2000px]" : "max-h-0 lg:max-h-[2000px]"
                }`}
              >
                <div className="p-4 space-y-6">
                  {/* Preço */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Preço</h3>
                    <Slider
                      value={filtro.preco}
                      onChange={(_, newValue) => setFiltro((prev) => ({ ...prev, preco: newValue as number[] }))}
                      valueLabelDisplay="auto"
                      min={0}
                      max={Math.max(...drones.map((d) => d.precoMax), 10000)}
                      step={100}
                      size="small"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {filtro.preco[0].toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {filtro.preco[1].toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                      </span>
                    </div>
                  </div>

                  {/* Fabricantes */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Fabricantes</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                      {fabricantes.map((fabricante) => (
                        <FormControlLabel
                          key={fabricante}
                          control={
                            <Checkbox
                              checked={filtro.fabricantes.includes(fabricante)}
                              onChange={() => handleFabricanteChange(fabricante)}
                              size="small"
                            />
                          }
                          label={<span className="text-sm">{fabricante}</span>}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Categorias */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Categorias</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                      {categorias.map((categoria) => (
                        <FormControlLabel
                          key={categoria}
                          control={
                            <Checkbox
                              checked={filtro.categorias.includes(categoria)}
                              onChange={() => handleCategoriaChange(categoria)}
                              size="small"
                            />
                          }
                          label={<span className="text-sm">{categoria}</span>}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Autonomia */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Autonomia (min)</h3>
                    <Slider
                      value={filtro.autonomia}
                      onChange={(_, newValue) => setFiltro((prev) => ({ ...prev, autonomia: newValue as number[] }))}
                      valueLabelDisplay="auto"
                      min={0}
                      max={Math.max(...drones.map((d) => d.autonomia), 100)}
                      size="small"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{filtro.autonomia[0]} min</span>
                      <span className="text-xs text-gray-500">{filtro.autonomia[1]} min</span>
                    </div>
                  </div>

                  {/* Peso */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Peso (kg)</h3>
                    <Slider
                      value={filtro.peso}
                      onChange={(_, newValue) => setFiltro((prev) => ({ ...prev, peso: newValue as number[] }))}
                      valueLabelDisplay="auto"
                      min={0}
                      max={Math.max(...drones.map((d) => d.peso), 10)}
                      step={0.1}
                      size="small"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{filtro.peso[0]} kg</span>
                      <span className="text-xs text-gray-500">{filtro.peso[1]} kg</span>
                    </div>
                  </div>

                  {/* Recursos */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recursos</h3>
                    <div className="space-y-1">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filtro.temGPS}
                            onChange={() => setFiltro((prev) => ({ ...prev, temGPS: !prev.temGPS }))}
                            size="small"
                          />
                        }
                        label={<span className="text-sm">GPS</span>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filtro.temAnticolisao}
                            onChange={() => setFiltro((prev) => ({ ...prev, temAnticolisao: !prev.temAnticolisao }))}
                            size="small"
                          />
                        }
                        label={<span className="text-sm">Sistema Anticolisão</span>}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filtro.temCamera4K}
                            onChange={() => setFiltro((prev) => ({ ...prev, temCamera4K: !prev.temCamera4K }))}
                            size="small"
                          />
                        }
                        label={<span className="text-sm">Câmera 4K</span>}
                      />
                    </div>
                  </div>

                  <button
                    onClick={aplicarFiltros}
                    className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de drones */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {filteredDrones.length} {filteredDrones.length === 1 ? "drone encontrado" : "drones encontrados"}
              </p>

              {comparacao.length > 0 && (
                <button onClick={() => setComparisonOpen(true)} className="text-sm text-blue-600 hover:text-blue-800">
                  Ver {comparacao.length} {comparacao.length === 1 ? "drone" : "drones"} em comparação
                </button>
              )}
            </div>

            {filteredDrones.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">Nenhum drone encontrado</h3>
                <p className="text-gray-600 mb-4">Tente ajustar os filtros para ver mais resultados.</p>
                <button onClick={limparFiltros} className="text-blue-600 hover:text-blue-800">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDrones.map((drone) => (
                  <div
                    key={drone.id}
                    className="bg-white rounded-lg border hover:shadow-md transition-shadow h-full flex flex-col"
                  >
                    {/* Imagem e badges */}
                    <div className="relative">
                      <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
                          <img
                            src={(drone.imagemUrl?.split(',')[0].trim()) || "/placeholder.svg?height=300&width=400"}
                            alt={drone.nome}
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=400"
                            }}
                          />
                        </div>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {drone.categoria}
                        </span>
                      </div>

                      {comparacao.some((d) => d.id === drone.id) && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Comparando
                          </span>
                        </div>
                      )}

                      {/* Preço */}
                      <div className="absolute bottom-0 right-0 bg-white px-3 py-1 rounded-tl-lg font-medium text-sm">
                        {formatarPreco(drone.precoMin, drone.precoMax)}
                      </div>
                    </div>

                    {/* Informações do drone */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-3">
                        <h3 className="font-medium text-lg leading-snug mb-1">{drone.nome}</h3>
                        <p className="text-sm text-gray-600">{drone.fabricante}</p>
                      </div>

                      {/* Especificações principais */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center bg-gray-50 rounded-md p-2">
                          <span className="text-amber-500 mr-2">⚡</span>
                          <span className="text-sm">{drone.autonomia} min</span>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-md p-2">
                          <span className="text-blue-500 mr-2">⚖️</span>
                          <span className="text-sm">{drone.peso} kg</span>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-md p-2">
                          <span className="text-red-500 mr-2">🚀</span>
                          <span className="text-sm">{drone.velocidadeMaxima} km/h</span>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-md p-2">
                          <span className="text-green-500 mr-2">📏</span>
                          <span className="text-sm">{drone.alcanceMaximo} km</span>
                        </div>
                      </div>

                      {/* Descrição curta */}
                      <div className="mb-4 flex-1">
                        <p className="text-xs text-gray-600 line-clamp-3" title={drone.descricao}>
                          {drone.descricao}
                        </p>
                      </div>

                      {/* Recursos */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {drone.gps && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded">GPS</span>
                        )}
                        {drone.sistemaAnticolisao && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded">Anticolisão</span>
                        )}
                        {drone.resolucaoCamera && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded">
                            {drone.resolucaoCamera}
                          </span>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => toggleComparacao(drone)}
                          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            comparacao.some((d) => d.id === drone.id)
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {comparacao.some((d) => d.id === drone.id) ? "Remover" : "Comparar"}
                        </button>
                        <Link
                          to={`/drones/${drone.id}`}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Painel de comparação minimizável */}
      {comparacao.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 transition-transform duration-300 ${
            comparisonOpen ? "translate-y-0" : "translate-y-[calc(100%-48px)]"
          }`}
          style={{ maxHeight: "80vh" }}
        >
          {/* Barra de título com toggle */}
          <div
            className="flex items-center justify-between py-3 px-4 border-b cursor-pointer hover:bg-gray-50"
            onClick={() => setComparisonOpen(!comparisonOpen)}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                Comparando {comparacao.length} {comparacao.length === 1 ? "drone" : "drones"}
              </h3>
              {!comparisonOpen && (
                <div className="flex gap-1">
                  {comparacao.map((drone) => (
                    <span key={drone.id} className="w-2 h-2 rounded-full bg-blue-500" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {comparisonOpen && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      exportarPDF()
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Exportar PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setComparacao([])
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Limpar
                  </button>
                </>
              )}
              <span className="text-gray-400 transition-transform duration-300 transform">
                {comparisonOpen ? "▼" : "▲"}
              </span>
            </div>
          </div>

          {/* Conteúdo da comparação */}
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(80vh - 48px)" }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40"
                  >
                    Especificação
                  </th>
                  {comparacao.map((drone) => (
                    <th
                      key={drone.id}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-between">
                        <span>{drone.nome}</span>
                        <button onClick={() => toggleComparacao(drone)} className="text-gray-400 hover:text-red-500">
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Imagem */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Imagem</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <img
                        src={(drone.imagemUrl?.split(',')[0].trim()) || "/placeholder.svg?height=100&width=100"}
                        alt={drone.nome}
                        className="w-24 h-24 object-contain mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg?height=100&width=100"
                        }}
                      />

                    </td>
                  ))}
                </tr>

                {/* Fabricante */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Fabricante</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.fabricante}
                    </td>
                  ))}
                </tr>

                {/* Categoria */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Categoria</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.categoria}
                    </td>
                  ))}
                </tr>

                {/* Preço */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Preço</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarPreco(drone.precoMin, drone.precoMax)}
                    </td>
                  ))}
                </tr>

                {/* Autonomia */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Autonomia</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.autonomia} min
                    </td>
                  ))}
                </tr>

                {/* Peso */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Peso</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.peso} kg
                    </td>
                  ))}
                </tr>

                {/* Velocidade Máxima */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Velocidade Máxima</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.velocidadeMaxima} km/h
                    </td>
                  ))}
                </tr>

                {/* Alcance Máximo */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Alcance Máximo</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.alcanceMaximo} km
                    </td>
                  ))}
                </tr>

                {/* Carga Máxima */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Carga Máxima</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.cargaMaxima} kg
                    </td>
                  ))}
                </tr>

                {/* Câmera */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Câmera</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.resolucaoCamera || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* GPS */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GPS</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.gps || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Sistema Anticolisão */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sistema Anticolisão</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.sistemaAnticolisao || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Conectividade */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Conectividade</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.conectividade || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Modos de Voo */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Modos de Voo</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.modosVoo || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Certificação */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Certificação</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.certificacao || "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Fail Safe */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Fail Safe</td>
                  {comparacao.map((drone) => (
                    <td key={drone.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {drone.failSafe || "N/A"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
