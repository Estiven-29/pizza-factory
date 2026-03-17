import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import App from './App';

vi.mock('axios');

describe('App Component', () => {
  it('renders correctly and generates pizza', async () => {
    // Mock the backend response
    axios.get.mockResolvedValueOnce({
      data: {
        ingredients: {
          dough: 'Masa fina (Thin)',
          sauce: 'Salsa San Marzano',
          toppings: ['Queso Mozzarella', 'Albahaca']
        }
      }
    });

    render(<App />);

    // Check title renders
    expect(screen.getByText('Pizzería Factory')).toBeInTheDocument();

    // Check default select style is 'italian'
    const select = screen.getByLabelText('Selecciona un Estilo de Pizza');
    expect(select.value).toBe('italian');

    // Generate Pizza
    const generateBtn = screen.getByRole('button', { name: /generar pizza/i });
    fireEvent.click(generateBtn);

    // Wait for the mock to resolve and update DOM
    await waitFor(() => {
      // It should display the ingredients returned from our mock
      expect(screen.getByText(/Masa fina \(Thin\)/i)).toBeInTheDocument();
      // Use getAllByText and check that at least one is in the preview list
      expect(screen.getAllByText(/Salsa San Marzano/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Queso Mozzarella, Albahaca/i)).toBeInTheDocument();
    });
  });
});
