"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Circle, Polygon, ZoomControl, useMap, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Tipos para os dados da ANAC
interface ANACZoneGeometry {
  upperLimit?: number
  lowerLimit?: number
  uomDimensions?: string
  upperVerticalReference?: string
  lowerVerticalReference?: string
  horizontalProjection: {
    type: string
    center?: [number, number] // [longitude, latitude]
    radius?: number
    coordinates?: number[][][] // Para polígonos: [[[lng, lat], [lng, lat], ...]]
  }
}

interface ANACZoneAuthority {
  name: string
  service?: string
  contactName?: string
  siteURL?: string
  email?: string
  phone?: string
  purpose?: string
}

interface ANACZoneApplicability {
  startDateTime: string
  endDateTime: string
  permanent: string
}

interface ANACZone {
  identifier: string
  country?: string
  name: string
  type: string
  restriction: string
  reason?: string[] | string
  otherReasonInfo?: string
  applicability?: ANACZoneApplicability[]
  message?: string
  zoneAuthority?: ANACZoneAuthority[]
  geometry: ANACZoneGeometry[]
  extendedProperties?: {
    color?: string
    arc?: string
  }
}

interface ANACData {
  title?: string
  description?: string
  features: ANACZone[]
}

// Definir tipos de zonas para facilitar a filtragem
type ZoneType = "prohibited" | "req_authorisation" | "no_restriction"

// Componente para alternar entre mapas base
const MapBaseControl = () => {
  const map = useMap()
  const [isAerial, setIsAerial] = useState(false)

  const toggleMapBase = () => {
    const newIsAerial = !isAerial
    setIsAerial(newIsAerial)

    // Remover todas as camadas de mapa base
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    // Adicionar a camada selecionada
    if (newIsAerial) {
      // Mapa de satélite (ESRI World Imagery)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }).addTo(map)
    } else {
      // Mapa padrão (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)
    }
  }

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={toggleMapBase}
        className={`px-3 py-2 rounded-md text-sm font-medium shadow-md transition-all duration-200 flex items-center gap-2 ${
          isAerial ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {isAerial ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Mapa Normal
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Mapa Satélite
          </>
        )}
      </button>

      <button
        className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 shadow-md hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
        onClick={() => {
          map.setView([39.5, -8.0], 7)
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
        Portugal
      </button>
    </div>
  )
}

// Função melhorada para determinar o tipo de zona
const getZoneType = (zone: ANACZone): ZoneType => {
  // Verificar tanto o campo restriction quanto o type
  const restriction = (zone.restriction || "").toLowerCase()
  const type = (zone.type || "").toLowerCase()
  const name = (zone.name || "").toLowerCase()
  const reason = Array.isArray(zone.reason) ? zone.reason.join(" ").toLowerCase() : (zone.reason || "").toLowerCase()

  // Verificar se é uma zona proibida (PROHIBITED)
  if (
    restriction.includes("prohibited") ||
    type.includes("prohibited") ||
    type.includes("danger") ||
    restriction.includes("proibid") ||
    type.includes("proibid")
  ) {
    return "prohibited"
  }

  // Verificar se é uma zona que requer autorização (REQ_AUTHORISATION)
  if (
    restriction.includes("req_authorisation") ||
    restriction.includes("authorization") ||
    restriction.includes("authorisation") ||
    restriction.includes("restricted") ||
    type.includes("restricted") ||
    restriction.includes("restri") ||
    type.includes("restri") ||
    name.includes("restri") ||
    reason.includes("restri") ||
    // Verificar também por palavras relacionadas a restrições
    reason.includes("limit") ||
    reason.includes("control") ||
    name.includes("limit") ||
    // Verificar por áreas de proteção ambiental que geralmente são restritas
    name.includes("parque") ||
    name.includes("reserva") ||
    reason.includes("ambiental") ||
    reason.includes("proteção")
  ) {
    // Log para depuração
    console.log("Zona que requer autorização identificada:", zone.name, zone.identifier)
    return "req_authorisation"
  }

  // Se não for nenhuma das anteriores, é sem restrição (NO_RESTRICTION)
  return "no_restriction"
}

// Função para obter a cor da zona com base no tipo
const getZoneColor = (zone: ANACZone): string => {
  // Se temos uma cor definida nas propriedades, usar essa
  if (zone.extendedProperties?.color) {
    return `#${zone.extendedProperties.color}`
  }

  // Caso contrário, determinar com base no tipo de zona
  const zoneType = getZoneType(zone)

  switch (zoneType) {
    case "prohibited":
      return "#FF0000" // Vermelho para zonas proibidas
    case "req_authorisation":
      return "#FDE910" // Amarelo exato para zonas que requerem autorização
    default:
      return "#808080" // Cinza para zonas sem restrição
  }
}

// Componente de legenda do mapa
const MapLegend = () => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div
      className={`absolute bottom-6 left-4 z-[1000] bg-white rounded-lg shadow-lg transition-all duration-300 overflow-hidden ${expanded ? "max-h-60" : "max-h-10"}`}
    >
      <div
        className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          Legenda
        </h4>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700">Zonas Proibidas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#FDE910" }}></div>
            <span className="text-sm text-gray-700">Requer Autorização</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-sm text-gray-700">Sem Restrição</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função para traduzir o tipo de restrição
const translateRestriction = (restriction: string): string => {
  const restrictionLower = restriction.toLowerCase()

  if (restrictionLower.includes("prohibited")) {
    return "Proibida"
  } else if (restrictionLower.includes("req_authorisation") || restrictionLower.includes("restricted")) {
    return "Requer Autorização"
  } else if (restrictionLower.includes("controlled")) {
    return "Controlada"
  } else {
    return "Sem Restrição"
  }
}

// Função para criar o conteúdo do popup (versão mais legível)
const createPopupContent = (zone: ANACZone): string => {
  const zoneColor = getZoneColor(zone)
  const translatedRestriction = translateRestriction(zone.restriction)
  const reason = Array.isArray(zone.reason) ? zone.reason.join(", ") : zone.reason || ""

  // Formatar datas de aplicabilidade
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch (e) {
      return dateStr
    }
  }

  // Verificar se há datas de aplicabilidade
  const hasApplicability = zone.applicability && zone.applicability.length > 0
  const startDate = hasApplicability ? formatDate(zone.applicability[0].startDateTime) : ""
  const endDate = hasApplicability ? formatDate(zone.applicability[0].endDateTime) : ""
  const isPermanent = hasApplicability ? zone.applicability[0].permanent === "YES" : false

  return `
    <div style="font-family: Arial, sans-serif; min-width: 300px; max-width: 400px;">
      <div style="margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">${zone.name || "Zona de Voo"}</h3>
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; color: ${zoneColor === "#FDE910" ? "black" : "white"}; background-color: ${zoneColor};">
            ${translatedRestriction}
          </span>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background-color: #f0f0f0; color: #666;">
            ${zone.identifier}
          </span>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; margin-bottom: 3px;">Motivo:</div>
        <div>${reason || "Não especificado"}</div>
      </div>

      ${
        zone.message
          ? `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 3px;">Informação:</div>
          <div style="padding: 8px; background-color: #fff8e6; border-left: 3px solid #f0b429; font-size: 13px;">
            ${zone.message}
          </div>
        </div>
      `
          : ""
      }

      ${
        hasApplicability
          ? `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 3px;">Aplicabilidade:</div>
          <div>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background-color: ${isPermanent ? "#e6f0ff" : "#f0e6ff"}; color: ${isPermanent ? "#0066cc" : "#6600cc"}; margin-bottom: 5px;">
              ${isPermanent ? "Permanente" : "Temporário"}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: auto auto; gap: 10px;">
            <div>
              <div style="color: #666; font-size: 12px;">Início:</div>
              <div>${startDate}</div>
            </div>
            <div>
              <div style="color: #666; font-size: 12px;">Fim:</div>
              <div>${endDate}</div>
            </div>
          </div>
        </div>
      `
          : ""
      }

      ${
        zone.zoneAuthority && zone.zoneAuthority.length > 0
          ? `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; margin-bottom: 3px;">Autoridade:</div>
          <div style="font-weight: 500;">${zone.zoneAuthority[0].name}</div>
          ${zone.zoneAuthority[0].service ? `<div style="margin-top: 3px;">${zone.zoneAuthority[0].service}</div>` : ""}
          ${zone.zoneAuthority[0].contactName ? `<div style="margin-top: 3px;">Contato: ${zone.zoneAuthority[0].contactName}</div>` : ""}

          <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px;">
            ${
              zone.zoneAuthority[0].siteURL
                ? `<a href="${zone.zoneAuthority[0].siteURL}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; background-color: #e6f0ff; color: #0066cc; border-radius: 4px; font-size: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Website
                   </a>`
                : ""
            }
            ${
              zone.zoneAuthority[0].email
                ? `<a href="mailto:${zone.zoneAuthority[0].email}" style="text-decoration: none; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; background-color: #e6ffe6; color: #008800; border-radius: 4px; font-size: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Email
                   </a>`
                : ""
            }
            ${
              zone.zoneAuthority[0].phone
                ? `<a href="tel:${zone.zoneAuthority[0].phone}" style="text-decoration: none; display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; background-color: #f0e6ff; color: #6600cc; border-radius: 4px; font-size: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Telefone
                   </a>`
                : ""
            }
          </div>
        </div>
      `
          : ""
      }

      <div style="margin-bottom: 10px;">
        <div style="font-weight: bold; margin-bottom: 3px;">Detalhes técnicos:</div>
        <div style="display: grid; grid-template-columns: auto auto; gap: 10px;">
          <div>
            <div style="color: #666; font-size: 12px;">País:</div>
            <div>${zone.country || "PRT"}</div>
          </div>
          ${
            zone.geometry && zone.geometry.length > 0 && zone.geometry[0].upperVerticalReference
              ? `
              <div>
                <div style="color: #666; font-size: 12px;">Ref. vertical:</div>
                <div>${zone.geometry[0].upperVerticalReference}</div>
              </div>
              `
              : ""
          }
          ${
            zone.geometry &&
            zone.geometry.length > 0 &&
            zone.geometry[0].upperLimit !== undefined &&
            zone.geometry[0].lowerLimit !== undefined
              ? `
              <div>
                <div style="color: #666; font-size: 12px;">Altitude:</div>
                <div>${zone.geometry[0].lowerLimit}-${zone.geometry[0].upperLimit} ${zone.geometry[0].uomDimensions || "m"}</div>
              </div>
              `
              : ""
          }
          ${
            zone.extendedProperties && zone.extendedProperties.arc
              ? `
              <div>
                <div style="color: #666; font-size: 12px;">ARC:</div>
                <div>${zone.extendedProperties.arc}</div>
              </div>
              `
              : ""
          }
          ${
            zone.geometry &&
            zone.geometry.length > 0 &&
            zone.geometry[0].horizontalProjection &&
            zone.geometry[0].horizontalProjection.radius
              ? `
              <div>
                <div style="color: #666; font-size: 12px;">Raio:</div>
                <div>${(zone.geometry[0].horizontalProjection.radius / 1000).toFixed(1)} km</div>
              </div>
              `
              : ""
          }
        </div>
      </div>
    </div>
  `
}

// Componente principal do mapa
const MapaANAC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapData, setMapData] = useState<ANACData | null>(null)
  const [filteredZones, setFilteredZones] = useState<ANACZone[]>([])
  const [zoneStats, setZoneStats] = useState({
    total: 0,
    prohibited: 0,
    req_authorisation: 0,
    no_restriction: 0,
  })
  const [activeFilters, setActiveFilters] = useState({
    prohibited: true,
    req_authorisation: true,
    no_restriction: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.5, -8.0])
  const [mapZoom, setMapZoom] = useState(7)
  const mapRef = useRef<L.Map | null>(null)

  // Função para navegar para a página inicial
  const goToHome = () => {
    window.location.href = "/"
  }

  // Carregar dados ao iniciar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Tentar carregar dados do arquivo JSON
        try {
          // Importar o arquivo JSON diretamente
          const anacData = await import("../data/anac-zones.json")

          if (!anacData || !anacData.default || !anacData.default.features) {
            throw new Error("Formato de dados inválido na importação")
          }

          processData(anacData.default)
        } catch (jsonError) {
          console.error("Erro ao carregar dados do JSON:", jsonError)

          // Se falhar, tentar carregar do script mapa_UASZoneVersion.js
          try {
            const script = document.createElement("script")
            script.src = "/mapa_UASZoneVersion.js"
            script.async = true

            script.onload = () => {
              if (window.data) {
                processData(window.data)
              } else {
                throw new Error("Dados não encontrados no script")
              }
            }

            script.onerror = () => {
              throw new Error("Erro ao carregar o script de dados")
            }

            document.body.appendChild(script)

            return () => {
              if (document.body.contains(script)) {
                document.body.removeChild(script)
              }
            }
          } catch (scriptError) {
            console.error("Erro ao carregar dados do script:", scriptError)
            throw new Error("Não foi possível carregar os dados de nenhuma fonte")
          }
        }
      } catch (err) {
        console.error("Erro geral:", err)
        setError(`Erro ao carregar dados: ${err instanceof Error ? err.message : String(err)}`)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Processar dados carregados
  const processData = (data: ANACData) => {
    try {
      console.log("Dados carregados:", data)
      setMapData(data)

      // Calcular estatísticas
      const stats = {
        total: data.features.length,
        prohibited: 0,
        req_authorisation: 0,
        no_restriction: 0,
      }

      // Contar zonas por tipo
      data.features.forEach((zone) => {
        const zoneType = getZoneType(zone)
        stats[zoneType]++
      })

      console.log("Estatísticas de zonas:", stats)
      setZoneStats(stats)

      // Filtrar zonas inicialmente
      filterZones(data.features, activeFilters, searchTerm)

      setLoading(false)
    } catch (err) {
      console.error("Erro ao processar dados:", err)
      setError(`Erro ao processar dados: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  // Filtrar zonas com base nos filtros ativos
  const filterZones = (zones: ANACZone[], filters: typeof activeFilters, search: string) => {
    if (!zones || zones.length === 0) {
      setFilteredZones([])
      return
    }

    console.log("Aplicando filtros:", filters)

    const filtered = zones.filter((zone) => {
      // Determinar o tipo de zona
      const zoneType = getZoneType(zone)

      // Log para depuração
      console.log(`Zona ${zone.name} (${zone.identifier}): tipo = ${zoneType}, filtro ativo = ${filters[zoneType]}`)

      // Verificar se o filtro correspondente está ativo
      if (!filters[zoneType]) {
        return false
      }

      // Verificar termo de pesquisa
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          (zone.name && zone.name.toLowerCase().includes(searchLower)) ||
          (zone.identifier && zone.identifier.toLowerCase().includes(searchLower)) ||
          (Array.isArray(zone.reason)
            ? zone.reason.some((r) => r.toLowerCase().includes(searchLower))
            : zone.reason && zone.reason.toLowerCase().includes(searchLower)) ||
          (zone.message && zone.message.toLowerCase().includes(searchLower))
        )
      }

      return true
    })

    console.log(`Filtrado: ${filtered.length} zonas de ${zones.length}`)
    setFilteredZones(filtered)
  }

  // Efeito para atualizar filtros
  useEffect(() => {
    if (mapData && mapData.features) {
      console.log("Atualizando filtros:", activeFilters)
      filterZones(mapData.features, activeFilters, searchTerm)
    }
  }, [activeFilters, searchTerm, mapData])

  const toggleFilter = (filterType: keyof typeof activeFilters) => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: !prevFilters[filterType],
    }))
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])
          setShowUserLocation(true)
          setMapZoom(13) // Zoom in to the user's location
        },
        (error) => {
          console.error("Erro ao obter a localização:", error)
          alert("Erro ao obter a localização. Por favor, verifique as permissões do seu navegador.")
        },
      )
    } else {
      alert("Geolocalização não suportada pelo seu navegador.")
    }
  }

  const resetFilters = () => {
    setActiveFilters({
      prohibited: true,
      req_authorisation: true,
      no_restriction: true,
    })
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
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
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa de Zonas de Voo para Drones</h1>
          <p className="text-lg text-gray-600 mb-2">
            Consulte as restrições de voo para drones em Portugal de acordo com a regulamentação da ANAC
          </p>
          <p className="text-sm text-gray-500 italic">Fonte de dados: ANAC - Autoridade Nacional da Aviação Civil</p>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          {/* Controls Section */}
          <div className="p-6 border-b border-gray-200">
            {/* Search and Location Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por nome, ID ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={getUserLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Minha Localização
                </button>

                <button
                  onClick={goToHome}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Home
                </button>
              </div>
            </div>

            {/* Stats and Filters */}
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                  Total: {zoneStats.total}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilters.prohibited ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-400"}`}
                >
                  Proibidas: {zoneStats.prohibited}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilters.req_authorisation ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-400"}`}
                >
                  Requer Autorização: {zoneStats.req_authorisation}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilters.no_restriction ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-400"}`}
                >
                  Sem Restrição: {zoneStats.no_restriction}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filtros
                  </h3>
                  <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    Repor Filtros
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleFilter("prohibited")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      activeFilters.prohibited
                        ? "border-red-200 bg-red-50 text-red-800"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${activeFilters.prohibited ? "bg-red-500" : "bg-gray-300"}`}
                    ></span>
                    <span className="text-sm font-medium">Zonas Proibidas</span>
                  </button>

                  <button
                    onClick={() => toggleFilter("req_authorisation")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      activeFilters.req_authorisation
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${activeFilters.req_authorisation ? "bg-amber-500" : "bg-gray-300"}`}
                      style={activeFilters.req_authorisation ? { backgroundColor: "#FDE910" } : {}}
                    ></span>
                    <span className="text-sm font-medium">Requer Autorização</span>
                  </button>

                  <button
                    onClick={() => toggleFilter("no_restriction")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      activeFilters.no_restriction
                        ? "border-gray-300 bg-gray-100 text-gray-800"
                        : "border-gray-200 bg-white text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${activeFilters.no_restriction ? "bg-gray-500" : "bg-gray-300"}`}
                    ></span>
                    <span className="text-sm font-medium">Sem Restrição</span>
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                {filteredZones ? `A exibir ${filteredZones.length} zonas de voo` : "A carregar dados..."}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="relative h-[700px]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">A carregar dados da ANAC...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-red-800 text-center mb-2">Erro ao carregar dados</h3>
                  <p className="text-sm text-gray-600 text-center">{error}</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                className="h-full w-full z-0"
                zoomControl={false}
                ref={(map) => {
                  mapRef.current = map
                }}
              >
                <ZoomControl position="topright" />
                <MapBaseControl />
                <MapLegend />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredZones && filteredZones.length > 0 ? (
                  <>
                    {filteredZones.map((zone) => {
                      // Verificar se temos geometria válida
                      if (!zone.geometry || zone.geometry.length === 0 || !zone.geometry[0].horizontalProjection) {
                        return null
                      }

                      const geo = zone.geometry[0].horizontalProjection
                      const zoneColor = getZoneColor(zone)

                      // Renderizar círculo ou polígono dependendo do tipo
                      if (geo.type === "Circle" && geo.center && geo.radius) {
                        // Extrair centro e raio para círculos
                        const center: [number, number] = [geo.center[1], geo.center[0]] // [lat, lng]

                        return (
                          <Circle
                            key={zone.identifier}
                            center={center}
                            radius={geo.radius}
                            pathOptions={{
                              color: zoneColor,
                              fillColor: zoneColor,
                              fillOpacity: 0.3,
                              weight: 2,
                              opacity: 0.8,
                            }}
                            eventHandlers={{
                              mouseover: (e) => {
                                const layer = e.target
                                layer.setStyle({
                                  fillOpacity: 0.5,
                                  weight: 3,
                                })
                              },
                              mouseout: (e) => {
                                const layer = e.target
                                layer.setStyle({
                                  fillOpacity: 0.3,
                                  weight: 2,
                                })
                              },
                              click: (e) => {
                                // Mostrar popup diretamente para esta zona
                                L.popup()
                                  .setLatLng(e.latlng)
                                  .setContent(createPopupContent(zone))
                                  .openOn(mapRef.current!)
                              },
                            }}
                          />
                        )
                      }
                      // Adicionar suporte para polígonos
                      else if (geo.type === "Polygon" && geo.coordinates && geo.coordinates.length > 0) {
                        // Converter coordenadas para o formato do Leaflet [lat, lng]
                        const coordinates = geo.coordinates[0].map((coord) => [coord[1], coord[0]])

                        return (
                          <Polygon
                            key={zone.identifier}
                            positions={coordinates}
                            pathOptions={{
                              color: zoneColor,
                              fillColor: zoneColor,
                              fillOpacity: 0.3,
                              weight: 2,
                              opacity: 0.8,
                            }}
                            eventHandlers={{
                              mouseover: (e) => {
                                const layer = e.target
                                layer.setStyle({
                                  fillOpacity: 0.5,
                                  weight: 3,
                                })
                              },
                              mouseout: (e) => {
                                const layer = e.target
                                layer.setStyle({
                                  fillOpacity: 0.3,
                                  weight: 2,
                                })
                              },
                              click: (e) => {
                                // Mostrar popup diretamente para esta zona
                                L.popup()
                                  .setLatLng(e.latlng)
                                  .setContent(createPopupContent(zone))
                                  .openOn(mapRef.current!)
                              },
                            }}
                          />
                        )
                      }

                      return null
                    })}
                  </>
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md z-[1000]">
                    <p className="text-gray-700">Nenhuma zona de voo encontrada com os filtros atuais</p>
                  </div>
                )}

                {/* Marcador de localização do utilizador */}
                {showUserLocation && userLocation && (
                  <Marker
                    position={userLocation}
                    icon={L.divIcon({
                      className: "user-location-marker",
                      html: `
                        <div class="relative">
                          <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
                          <div class="absolute -top-4 -left-4 w-12 h-12 bg-blue-400 bg-opacity-30 rounded-full animate-ping"></div>
                        </div>
                      `,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                  >
                    <Popup>
                      <div className="font-sans p-1">
                        <h3 className="font-medium text-gray-800 mb-1">A Sua Localização</h3>
                        <div className="text-xs text-gray-600 grid grid-cols-2 gap-1">
                          <div>
                            Latitude: <span className="font-medium">{userLocation[0].toFixed(6)}</span>
                          </div>
                          <div>
                            Longitude: <span className="font-medium">{userLocation[1].toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            )}

            {/* Botão de localização flutuante */}
            <div className="absolute bottom-6 right-6 z-[1000]">
              <button
                onClick={getUserLocation}
                className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                title="Minha Localização"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500">
          <p className="mb-2">
            © {new Date().getFullYear()} Sistema de Gestão de Drones | Dados fornecidos pela ANAC - Autoridade Nacional
            da Aviação Civil
          </p>
          <p>
            Consulte sempre a{" "}
            <a
              href="https://www.anac.pt/vPT/Generico/Paginas/Homepage00.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              ANAC
            </a>{" "}
            para informações oficiais sobre zonas de voo de drones.
          </p>
        </footer>
      </div>
    </div>
  )
}

// Adicionar tipos para o window
declare global {
  interface Window {
    data: ANACData
  }
}

export default MapaANAC