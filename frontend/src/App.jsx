import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, Pizza } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { PizzaSelector } from './components/PizzaSelector';
import { Preview } from './components/Preview';

function App() {
  const [currentStyle, setCurrentStyle] = useState('italian');
  const [pizzaData, setPizzaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  // Update DOM class when theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const generatePizza = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/pizzas/${currentStyle}`);
      setPizzaData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Error connecting to the backend. Is the server running?'
      );
      setPizzaData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Pizza className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Pizzería Factory
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-gray-500 dark:text-gray-400 font-medium">
              Abstract Pattern Demo
            </span>
            <ThemeToggle isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel */}
          <div className="md:col-span-5 bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ordena tu Pizza
            </h2>
            
            <div className="space-y-6">
              <PizzaSelector 
                currentStyle={currentStyle} 
                onStyleChange={setCurrentStyle} 
              />

              <button
                onClick={generatePizza}
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-primary hover:bg-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Horneando...
                  </>
                ) : (
                  <>
                    <Pizza className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Generar Pizza
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-5 h-5" />
                    Error
                  </div>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="md:col-span-7 flex items-center justify-center p-4">
            <Preview ingredients={pizzaData?.ingredients} />
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default App;
