"use client"

import { useState, useEffect } from "react"
import { MapIcon } from "lucide-react"
import { Badge } from "../components/ui/badge"
import api from "../services/api"

// Tipos para os dados GeoJSON
interface GeoJsonFeature {
  type: "Feature"
  geometry: {
    type: string
    coordinates: number[][] | number[][][]
  }
  properties: {
    name: string
    type: string
    country: string
  }
}

interface GeoJsonData {
  type: "FeatureCollection"
  features: GeoJsonFeature[]
}

// Tipos para as estatísticas
interface MapStats {
  total: number
  byType: {
    [key: string]: number
  }
  byCountry: {
    [key: string]: number
  }
}

const MapaPage = () => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MapStats | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<GeoJsonFeature | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Buscar dados GeoJSON da API
  useEffect(() => {
    const fetchAirspaces = async () => {
      try {
        setLoading(true)
        const response = await api.get("/airspaces/geojson")
        const data = response.data

        // Verificar se os dados são válidos
        if (!data || !data.features || !Array.isArray(data.features)) {
          throw new Error("Dados GeoJSON inválidos")
        }

        setGeoJsonData(data)
        calculateStats(data)
      } catch (err) {
        console.error("Erro ao buscar espaços aéreos:", err)
        setError("Não foi possível carregar os dados de espaço aéreo.")
      } finally {
        setLoading(false)
      }
    }

    fetchAirspaces()
  }, [])

  // Calcular estatísticas dos dados
  const calculateStats = (data: GeoJsonData) => {
    if (!data || !data.features) return

    const stats: MapStats = {
      total: data.features.length,
      byType: {},
      byCountry: {},
    }

    data.features.forEach((feature) => {
      const type = feature.properties.type
      const country = feature.properties.country

      // Contagem por tipo
      if (type) {
        stats.byType[type] = (stats.byType[type] || 0) + 1
      }

      // Contagem por país
      if (country) {
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1
      }
    })

    setStats(stats)
  }

  // Obter cor para o badge de tipo
  const getTypeColor = (type: string) => {
    const typeLower = type.toLowerCase()

    switch (typeLower) {
      case "danger":
      case "prohibited":
        return "bg-red-500 hover:bg-red-600"
      case "restricted":
        return "bg-amber-500 hover:bg-amber-600"
      case "controlled":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-emerald-500 hover:bg-emerald-600"
    }
  }

  // Carregar o mapa apenas no lado do cliente
  useEffect(() => {
    // Importar o componente do mapa dinamicamente
    import("../components/SimpleMap")
      .then((module) => {
        const SimpleMap = module.default
        setMapLoaded(true)
      })
      .catch((err) => {
        console.error("Erro ao carregar o componente do mapa:", err)
        setError("Não foi possível carregar o componente do mapa.")
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a1f2c] text-white border-b border-gray-800">
        <div className="max-w-[2000px] mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <MapIcon className="mr-2 h-6 w-6 text-blue-400" />
                Mapa de Zonas de Voo
              </h1>
              <p className="text-gray-400 mt-2">
                Visualize áreas permitidas, restritas e proibidas para voos de drones
              </p>
            </div>

            {stats && (
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-transparent">
                  {stats.total} Zonas
                </Badge>
                {Object.entries(stats.byType)
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <Badge key={type} className={`${getTypeColor(type)} text-white border-transparent`}>
                      {count} {type}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Painel lateral */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Legenda</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
                <span>Permitido</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span>Controlado</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                <span>Restrito</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span>Proibido</span>
              </div>
            </div>
          </div>

          {selectedFeature && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3">Detalhes da Zona</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <Badge className={`mb-2 ${getTypeColor(selectedFeature.properties.type)}`}>
                  {selectedFeature.properties.type}
                </Badge>
                <h3 className="font-medium text-lg mb-2">{selectedFeature.properties.name}</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">País:</span> {selectedFeature.properties.country}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium mb-3">Informações</h2>
            <p className="text-sm text-gray-600 mb-4">
              Este mapa mostra as zonas de voo para drones conforme regulamentações aéreas. Clique em uma área para ver
              mais detalhes.
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Nota:</span> Sempre verifique as regulamentações locais antes de voar, pois
              podem existir restrições temporárias não exibidas neste mapa.
            </p>
          </div>
        </div>

        {/* Área do mapa */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full min-h-[500px] bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando mapa...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full min-h-[500px] bg-red-50 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2 text-red-600">Erro ao carregar o mapa</h3>
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : mapLoaded ? (
            <div id="map-container" className="w-full h-full min-h-[500px]">
              {/* O componente do mapa será renderizado aqui */}
              {/* Usamos um iframe para isolar o mapa e evitar problemas de renderização */}
              <iframe src="/map.html" className="w-full h-full border-0" title="Mapa de Zonas de Voo"></iframe>
            </div>
          ) : (
            <div className="w-full h-full min-h-[500px] bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Inicializando mapa...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapaPage
