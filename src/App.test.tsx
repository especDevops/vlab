import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from './App';
import { livroService } from './services/livroService';

vi.mock('./services/livroService', () => ({
  livroService: {
    listar: vi.fn(),
    criar: vi.fn(),
    remover: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and displays books fetched from API', async () => {
    vi.mocked(livroService.listar).mockResolvedValue([
      {
        id: 1,
        titulo: 'Dom Casmurro',
        autor: 'Machado de Assis',
        genero: 'Romance',
        anoPublicacao: 1899,
      },
    ]);

    render(<App />);

    expect(screen.getByText(/Cadastro de Obras/i)).toBeInTheDocument();
    expect(await screen.findByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.getByText('Machado de Assis')).toBeInTheDocument();
  });
});
