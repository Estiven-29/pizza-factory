import React from 'react';

export function PizzaSelector({ currentStyle, onStyleChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="pizza-style" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Selecciona un Estilo de Pizza
      </label>
      <select
        id="pizza-style"
        value={currentStyle}
        onChange={(e) => onStyleChange(e.target.value)}
        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
      >
        <option value="italian">Italiana (Masa delgada, Salsa San Marzano)</option>
        <option value="american">Americana (Masa gruesa, BBQ/Tomate)</option>
        <option value="colombian">Colombiana (Masa tradicional, Salsa Criolla)</option>
      </select>
    </div>
  );
}
