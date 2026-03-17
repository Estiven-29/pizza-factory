import React from 'react';

export function Preview({ ingredients }) {
  if (!ingredients) {
    return (
      <div className="w-full max-w-[400px] aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800/50">
        <span className="text-gray-400 dark:text-gray-500 font-medium text-center px-4">
          Selecciona un estilo y genera tu pizza para verla aquí
        </span>
      </div>
    );
  }

  // Base colors based on ingredients
  const doughColor = ingredients.dough?.includes('Thin') ? '#f3e5ab' : ingredients.dough?.includes('Thick') ? '#e6c280' : '#d2b48c';
  const sauceColor = ingredients.sauce?.includes('San Marzano') ? '#e32636' : ingredients.sauce?.includes('BBQ') ? '#4a0404' : '#c84b31';
  
  // Toppings visualization logic
  const toppings = ingredients.toppings || [];
  const toppingElements = toppings.map((topping, index) => {
    // Generate some pseudo-random positions based on index
    const angle = (index * 137.5) * (Math.PI / 180);
    const radius = 120 + (index % 3) * 20;
    const x = 200 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    
    let color = '#000';
    if (topping.includes('Cheese') || topping.includes('Mozzarella')) color = '#fffacd';
    else if (topping.includes('Pepperoni') || topping.includes('Chorizo')) color = '#cc3333';
    else if (topping.includes('Mushroom')) color = '#d2b48c';
    else if (topping.includes('Plátano')) color = '#ffd700';
    else if (topping.includes('Bacon')) color = '#b22222';
    else color = '#8b4513';

    return (
      <circle key={index} cx={x} cy={y} r={15} fill={color} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    );
  });

  // Additional randomly scattered small cheese spots
  const cheeseSpots = Array.from({ length: 40 }).map((_, i) => {
    const angle = i * Math.PI * 2 / 40;
    const radius = Math.random() * 160;
    const x = 200 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    return <circle key={`c-${i}`} cx={x} cy={y} r={Math.random() * 8 + 4} fill="#fffacd" opacity="0.8" />;
  });

  return (
    <div className="w-full max-w-[400px] mx-auto aspect-square relative drop-shadow-2xl">
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full transform transition-transform duration-500 hover:scale-105"
        aria-label="Pizza Preview"
      >
        <defs>
          <radialGradient id="crust-grad" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor={doughColor} />
            <stop offset="100%" stopColor="#8b5a2b" />
          </radialGradient>
        </defs>
        
        {/* Crust */}
        <circle cx="200" cy="200" r="190" fill="url(#crust-grad)" />
        
        {/* Inner Dough */}
        <circle cx="200" cy="200" r="175" fill={doughColor} />
        
        {/* Sauce */}
        <circle cx="200" cy="200" r="165" fill={sauceColor} />
        
        {/* Cheese Base */}
        {cheeseSpots}
        
        {/* Toppings */}
        {toppings.length > 0 && toppingElements}
        
        {/* Bake marks */}
        <circle cx="200" cy="200" r="185" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="10" strokeDasharray="20 40" />
      </svg>
      
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ingredientes Actuales</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li><span className="font-semibold text-primary">Masa:</span> {ingredients.dough}</li>
          <li><span className="font-semibold text-primary">Salsa:</span> {ingredients.sauce}</li>
          <li>
            <span className="font-semibold text-primary">Toppings:</span>{' '}
            {ingredients.toppings?.join(', ') || 'Ninguno'}
          </li>
        </ul>
      </div>
    </div>
  );
}
