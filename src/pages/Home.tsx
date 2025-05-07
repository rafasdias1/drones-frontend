"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import api from "../services/api"

interface Drone {
  id: number
  nome: string
  fabricante: string
  imagemUrl: string
  autonomia: number
  peso: number
  sensores: string
  categoria: string
}

interface FAQItem {
  pergunta: string
  resposta: string
}

export default function Home() {
  const [drones, setDrones] = useState<Drone[]>([])
  const [featuredDrones, setFeaturedDrones] = useState<Drone[]>([])
  const [loading, setLoading] = useState(true)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqItems: FAQItem[] = [
    {
      pergunta: "Como posso pesquisar drones específicos na plataforma DroneScout?",
      resposta:
        "Na página 'Drones', utilize a barra de pesquisa no topo para encontrar modelos específicos. Pode filtrar por fabricante, categoria ou características técnicas. Os resultados são atualizados instantaneamente à medida que escreve.",
    },
    {
      pergunta: "Como posso visualizar as zonas de voo permitidas na minha região?",
      resposta:
        "Aceda à secção 'Mapa' através do menu principal. No mapa interativo, pode aproximar a sua localização e visualizar as zonas permitidas, restritas e proibidas. Clique em qualquer zona para ver detalhes específicos sobre as restrições.",
    },
    {
      pergunta: "Como posso ver mais detalhes sobre um drone específico?",
      resposta:
        "Na página 'Drones', clique no botão 'Saiba Mais' abaixo de qualquer drone para acessar a página de detalhes. Lá você encontrará especificações técnicas completas, imagens e informações de desempenho.",
    },
    {
      pergunta: "Como posso comparar as especificações de diferentes modelos de drones?",
      resposta:
        "Na página 'Drones', selecione até 3 modelos marcando as caixas de seleção e depois clique no botão 'Comparar' que aparecerá no fundo da página. Será apresentada uma tabela comparativa com todas as especificações lado a lado.",
    },
    {
      pergunta: "A plataforma DroneScout está disponível como aplicação móvel?",
      resposta:
        "Atualmente, o DroneScout funciona como uma aplicação web responsiva que se adapta a todos os dispositivos. Pode adicionar a página à sua tela inicial em dispositivos iOS e Android para uma experiência semelhante a uma aplicação nativa.",
    },
  ]

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const response = await api.get("/drones")
        setDrones(response.data)
        const shuffled = response.data.sort(() => 0.5 - Math.random())
        setFeaturedDrones(shuffled.slice(0, 4))
      } catch (error) {
        console.error("Erro ao carregar drones:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrones()
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Refinado com sombra mais sutil e transições */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="DroneScout Logo" className="h-10 w-auto" />
              <h1 className="ml-3 text-xl font-bold text-blue-800">DroneScout</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium">
                Início
              </Link>
              <Link
                to="/drones"
                className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Drones
              </Link>
              <Link
                to="/projetos"
                className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Projetos
              </Link>
              <Link to="/mapa" className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium">
                Mapa
              </Link>
            </nav>
            <button className="md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Melhorado com overlay gradiente e animações refinadas */}
      <section className="relative w-full h-[calc(100vh-4rem)] mt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 z-10"></div>
          <img src="/background-image.jpg" alt="Drone background" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white text-center px-4 max-w-5xl mx-auto">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Explore o Futuro dos Drones
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-10 max-w-3xl font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Descubra drones inovadores, suas aplicações práticas e zonas de voo seguras.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/drones"
              className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explorar Drones
            </Link>
            <Link
              to="/mapa"
              className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Ver Mapa de Voo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Layout refinado com cards elevados */}
      <section className="w-full py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que pode fazer no DroneScout</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa para entusiastas e profissionais de drones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8"
              whileHover={{ y: -5 }}
            >
              <div className="bg-blue-100 rounded-full p-5 inline-flex mb-6 text-blue-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Catálogo de Drones</h3>
              <p className="text-gray-600">
                Explore uma vasta seleção de drones com especificações detalhadas, comparações e avaliações técnicas.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8"
              whileHover={{ y: -5 }}
            >
              <div className="bg-green-100 rounded-full p-5 inline-flex mb-6 text-green-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Projetos de Engenharia</h3>
              <p className="text-gray-600">
                Descubra casos de uso inovadores e aplicações práticas de drones em diversas indústrias e setores.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-100 rounded-full p-5 inline-flex mb-6 text-purple-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Mapa de Zonas de Voo</h3>
              <p className="text-gray-600">
                Consulte áreas seguras e restritas para voo de drones em tempo real, com atualizações regulamentares.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Drones Section - Design de cards melhorado */}
      <section className="w-full py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Drones em Destaque</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça os modelos mais populares e suas capacidades
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredDrones.map((drone) => (
                <motion.div
                  key={drone.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden group"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={drone.imagemUrl?.split(",")[0].trim() || "/placeholder.svg"}
                      alt={drone.nome}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{drone.nome}</h3>
                    <p className="text-gray-600 mb-4">{drone.fabricante}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {drone.categoria}
                      </span>
                      {drone.autonomia && (
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {drone.autonomia} min
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to={`/drones/${drone.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center group"
                      >
                        Saiba Mais
                        <svg
                          className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/projetos"
              className="inline-block bg-white border border-blue-600 text-blue-600 font-medium py-3 px-8 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              Explorar Projetos com Drones
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Design mais impactante */}
      <section className="w-full py-24 bg-gradient-to-r from-blue-700 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para explorar o mundo dos drones?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto font-light">
            Junte-se a nós e descubra as infinitas possibilidades que os drones oferecem para projetos pessoais e
            profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mapa"
              className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Consultar Mapa de Voo
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section - Design profissional com foco na aplicação */}
      <section className="w-full py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo o que precisa de saber sobre a utilização da plataforma DroneScout
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex justify-between items-center w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  aria-expanded={openFAQ === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-medium text-gray-900">{item.pergunta}</span>
                  <span className="ml-6 flex-shrink-0 text-blue-600">
                    {openFAQ === index ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-5"
                    >
                      <p className="text-gray-600">{item.resposta}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Design refinado */}
      <footer className="w-full bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="DroneScout Logo" className="h-8 w-auto" />
                <h3 className="ml-2 text-lg font-semibold">DroneScout</h3>
              </div>
              <p className="text-gray-400">Explorando o futuro da tecnologia de drones.</p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link to="/drones" className="text-gray-400 hover:text-white transition-colors">
                    Drones
                  </Link>
                </li>
                <li>
                  <Link to="/projetos" className="text-gray-400 hover:text-white transition-colors">
                    Projetos
                  </Link>
                </li>
                <li>
                  <Link to="/mapa" className="text-gray-400 hover:text-white transition-colors">
                    Mapa
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Acesso</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Área Administrativa
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} DroneScout. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
