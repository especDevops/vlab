import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Exemplo básico: apenas verifica se renderizou algo do app.
    // Dependendo do conteúdo do seu App.tsx, você pode buscar textos específicos.
    expect(document.body).toBeTruthy();
  });
});
