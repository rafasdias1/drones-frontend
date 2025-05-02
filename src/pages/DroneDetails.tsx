import type React from "react"

import { Euro } from "lucide-react";

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Battery,
  Weight,
  Gauge,
  DollarSign,
  ChevronLeft,
  Info,
  ChevronRight,
  Camera,
  Compass,
  Package,
  Shield,
  Map,
  Award,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button1"
import { Skeleton } from "../components/ui/skeleton"
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

export default function DroneDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [drone, setDrone] = useState<Drone | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Simulação de múltiplas imagens - em produção, isso viria da API
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const fetchDroneDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/drones/${id}`)
        setDrone(response.data)

        // Simulação de múltiplas imagens - em produção, isso viria da API
        // Aqui estamos usando a imagem principal e gerando placeholders adicionais
        if (response.data.imagemUrl) {
          const imagens = response.data.imagemUrl
            .split(',')
            .map((url: string) => url.trim())

          setImages(imagens)
        }


        setError(null)
      } catch (err) {
        console.error("Erro:", err)
        setError("Não foi possível carregar os detalhes do drone.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDroneDetails()
    }
  }, [id])

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (loading) return <DroneDetailsSkeleton />
  if (error) return <ErrorDisplay error={error} onBack={() => navigate("/")} />
  if (!drone) return <NotFound onBack={() => navigate("/")} />

  // Formatar preço para exibição
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const priceRange = `${formatPrice(drone.precoMin)} - ${formatPrice(drone.precoMax)}`

  // Função para obter o ícone apropriado para cada categoria
  const getCategoryIcon = () => {
    switch (drone.categoria.toLowerCase()) {
      case "agricultura":
        return <Map className="h-5 w-5" />
      case "segurança":
        return <Shield className="h-5 w-5" />
      case "engenharia":
        return <Compass className="h-5 w-5" />
      default:
        return <Compass className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Redesenhada */}
      <div className="relative h-[30vh] bg-slate-800 flex items-center justify-center text-center px-6">
        <div className="max-w-4xl text-white">
          <div className="text-slate-300 mb-3 text-xs md:text-sm font-medium tracking-wide uppercase">
            {drone.categoria}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            {drone.nome}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-6">
            {drone.fabricante}
          </p>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="bg-white/10 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20">
              <Battery className="h-5 w-5 text-slate-300" />
              <span className="text-slate-100 text-sm md:text-base">
                {drone.autonomia} min
              </span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20">
              <Weight className="h-5 w-5 text-slate-300" />
              <span className="text-slate-100 text-sm md:text-base">
                {drone.peso} kg
              </span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20">
              <Gauge className="h-5 w-5 text-slate-300" />
              <span className="text-slate-100 text-sm md:text-base">
                {drone.velocidadeMaxima} km/h
              </span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20">
              <Euro className="h-5 w-5 text-slate-300" />
              <span className="text-slate-100 text-sm md:text-base">
                {priceRange}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Conteúdo Principal com Layout Ajustado */}
      <div className="max-w-[2000px] mx-auto px-4">
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Galeria de Imagens Melhorada */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                      <img
                        src={images[activeImageIndex] || "/placeholder.svg"}
                        alt={`${drone.nome} - Imagem ${activeImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Botões de navegação com blur */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-3 rounded-full transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-3 rounded-full transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Contador com blur */}
                    <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* Miniaturas com hover effect */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                            activeImageIndex === idx
                              ? "ring-2 ring-primary scale-[1.02] shadow-lg"
                              : "hover:ring-2 hover:ring-primary/50 hover:scale-[1.01]"
                          }`}
                        >
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Miniatura ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {activeImageIndex === idx && <div className="absolute inset-0 bg-primary/10" />}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Descrição */}
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle>Sobre o {drone.nome}</CardTitle>
                  <CardDescription>Descrição e características gerais</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{drone.descricao}</p>
                </CardContent>
              </Card>

              {/* Tabs com Visual Melhorado */}
              <Tabs defaultValue="especificacoes" className="w-full">
                <TabsList className="w-full p-1 bg-gray-100/80 rounded-lg">
                  <TabsTrigger
                    value="especificacoes"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md"
                  >
                    Especificações
                  </TabsTrigger>
                  <TabsTrigger
                    value="recursos"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md"
                  >
                    Recursos
                  </TabsTrigger>
                  <TabsTrigger
                    value="certificacoes"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-md"
                  >
                    Certificações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="especificacoes" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SpecCard
                      icon={<Battery className="h-5 w-5 text-primary" />}
                      title="Autonomia"
                      value={`${drone.autonomia} minutos`}
                      theme="blue"
                    />
                    <SpecCard
                      icon={<Weight className="h-5 w-5 text-primary" />}
                      title="Peso"
                      value={`${drone.peso} kg`}
                      theme="green"
                    />
                    <SpecCard
                      icon={<Package className="h-5 w-5 text-primary" />}
                      title="Carga Máxima"
                      value={`${drone.cargaMaxima} kg`}
                      theme="purple"
                    />
                    <SpecCard
                      icon={<Gauge className="h-5 w-5 text-primary" />}
                      title="Velocidade Máxima"
                      value={`${drone.velocidadeMaxima} km/h`}
                      theme="orange"
                    />
                    <SpecCard
                      icon={<Map className="h-5 w-5 text-primary" />}
                      title="Alcance Máximo"
                      value={`${drone.alcanceMaximo} km`}
                      theme="blue"
                    />
                    <SpecCard
                      icon={<Camera className="h-5 w-5 text-primary" />}
                      title="Câmera"
                      value={drone.resolucaoCamera}
                      theme="green"
                    />
                    <SpecCard
                      icon={<Compass className="h-5 w-5 text-primary" />}
                      title="GPS"
                      value={drone.gps}
                      theme="purple"
                    />
                    <SpecCard
                      icon={<Shield className="h-5 w-5 text-primary" />}
                      title="Sistema Anticolisão"
                      value={drone.sistemaAnticolisao}
                      theme="orange"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="recursos" className="mt-6">
                  <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle>Recursos e Tecnologias</CardTitle>
                      <CardDescription>Funcionalidades e tecnologias integradas</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResourceCard title="Sensores" description={drone.sensores} />
                        <ResourceCard title="Conectividade" description={drone.conectividade} />
                        <ResourceCard title="Modos de Voo" description={drone.modosVoo} />
                        <ResourceCard title="Sistema Fail-Safe" description={drone.failSafe} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="certificacoes" className="mt-6">
                  <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle>Certificações</CardTitle>
                      <CardDescription>Certificações e conformidade regulatória</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Certificações</h3>
                          <p className="text-gray-700 mb-4">{drone.certificacao}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar com Cards Melhorados */}
            <div className="space-y-6">
              {/* Card de Preço com Gradiente */}
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
                  <h3 className="text-xl font-semibold mb-1">Faixa de Preço</h3>
                  <p className="text-sm text-gray-600 mb-4">Valores estimados de mercado</p>
                  <div className="text-center bg-white rounded-lg p-4 shadow-sm">
                    <span className="text-3xl font-bold text-primary">{priceRange}</span>
                    <p className="text-sm text-gray-500 mt-2">Preços sujeitos a alteração</p>
                  </div>
                </div>
              </Card>

              {/* Card de Categoria */}
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle>Categoria</CardTitle>
                  <CardDescription>Tipo e aplicação do drone</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">{getCategoryIcon()}</div>
                    <div>
                      <h3 className="text-lg font-medium">{drone.categoria}</h3>
                      <p className="text-sm text-gray-600 mt-1">{drone.fabricante}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Especificações Rápidas */}
              <Card className="border-0 shadow-md rounded-xl overflow-hidden">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle>Especificações Rápidas</CardTitle>
                  <CardDescription>Informações essenciais</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <QuickSpec label="Autonomia" value={`${drone.autonomia} minutos`} />
                    <QuickSpec label="Peso" value={`${drone.peso} kg`} />
                    <QuickSpec label="Carga Máxima" value={`${drone.cargaMaxima} kg`} />
                    <QuickSpec label="Velocidade" value={`${drone.velocidadeMaxima} km/h`} />
                    <QuickSpec label="Alcance" value={`${drone.alcanceMaximo} km`} />
                    <QuickSpec label="Câmera" value={drone.resolucaoCamera} />
                    <QuickSpec label="GPS" value={drone.gps} />
                    <QuickSpec label="Conectividade" value={drone.conectividade} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente SpecCard melhorado com temas de cores
function SpecCard({
  icon,
  title,
  value,
  theme = "blue",
}: {
  icon: React.ReactNode
  title: string
  value: string
  theme?: "blue" | "green" | "purple" | "orange"
}) {
  const themeStyles = {
    blue: "bg-blue-50 border-blue-100 hover:border-blue-200",
    green: "bg-green-50 border-green-100 hover:border-green-200",
    purple: "bg-purple-50 border-purple-100 hover:border-purple-200",
    orange: "bg-orange-50 border-orange-100 hover:border-orange-200",
  }

  return (
    <div
      className={`
      flex items-start gap-4 p-4 rounded-lg border transition-colors
      ${themeStyles[theme]}
    `}
    >
      <div className="bg-white p-2 rounded-full shadow-sm">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

// Componentes auxiliares
function ResourceCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  )
}

function QuickSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function ErrorDisplay({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="text-red-500 mb-4">
        <Info size={48} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Erro</h2>
      <p className="text-gray-600 mb-6 text-center">{error}</p>
      <Button onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para a lista de drones
      </Button>
    </div>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <h2 className="text-2xl font-bold mb-2">Drone não encontrado</h2>
      <p className="text-gray-600 mb-6">O drone solicitado não está disponível.</p>
      <Button onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar para a lista de drones
      </Button>
    </div>
  )
}

function DroneDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="h-[60vh] bg-gray-200 animate-pulse" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="aspect-[16/9] w-full" />
                <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-video rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
