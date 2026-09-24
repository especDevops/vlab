import axios from 'axios';

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  anoPublicacao: number;
  descricao?: string;
}

export type NovoLivroPayload = Omit<Livro, 'id'>;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const livroService = {
  listar: async (): Promise<Livro[]> => {
    const response = await api.get<Livro[]>('/livros');
    return response.data;
  },

  criar: async (payload: NovoLivroPayload): Promise<Livro> => {
    const response = await api.post<Livro>('/livros', payload);
    return response.data;
  },

  remover: async (id: number): Promise<void> => {
    await api.delete(`/livros/${id}`);
  },
};
