import api from '../api/api'

export interface LoginRequest {
  email: string
  senha: string
}

export interface CadastroRequest {
  nome: string
  email: string
  senha: string
  perfil: 'ADMIN' | 'PADRAO'
}

export interface AuthResponse {
  id: number
  nome: string
  email: string
  perfil: 'ADMIN' | 'PADRAO'
  token: string
}

export const authApi = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/login',
      request
    )

    return response.data
  },

  cadastrar: async (
    request: CadastroRequest
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      '/auth/cadastro',
      request
    )

    return response.data
  },
}