import axios from "axios"

// Definir a URL base do backend
const BASE_URL = "http://localhost:8080/api"

// Criar instância do Axios
const api = axios.create({
  baseURL: BASE_URL, // Base geral da API
})

// Função auxiliar para fazer chamadas específicas para "auth"
export const authApi = axios.create({
  baseURL: `${BASE_URL}/auth`,
})

// Função para obter o token de autenticação do localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken")
}

// Interceptor para adicionar token de autenticação nas requisições
api.interceptors.request.use(
  (config) => {
    // Obter token do localStorage
    const token = getAuthToken()

    // Se o token existir, adicionar ao cabeçalho Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log("Enviando requisição:", {
      method: config.method,
      url: config.url,
      data: config.data,
    })

    return config
  },
  (error) => {
    console.error("Erro na requisição:", error)
    return Promise.reject(error)
  },
)

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    console.log("Resposta recebida:", {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    if (error.response) {
      // Se receber um 403 (Forbidden) ou 401 (Unauthorized), pode ser problema de autenticação
      if (error.response.status === 403 || error.response.status === 401) {
        console.error("Acesso negado. Verifique se você está autenticado e tem permissões adequadas.")
      }

      console.error("Erro da API:", {
        status: error.response.status,
        data: error.response.data,
      })
    } else if (error.request) {
      console.error("Sem resposta da API:", error.request)
    } else {
      console.error("Erro na configuração da requisição:", error.message)
    }
    return Promise.reject(error)
  },
)

// Serviço de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.post("/login", { email, password })
      const { token } = response.data

      // Armazenar token no localStorage
      if (token) {
        localStorage.setItem("authToken", token)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem("authToken")
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authToken")
  },
}

export default api





