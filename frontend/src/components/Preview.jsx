import React from 'react';

export function Preview({ ingredients, price, style }) {  // Acepta flat array + price
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return (
      <div className="w-full max-w-[400px] aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800/50">
        <span className="text-gray-400 dark:text-gray-500 font-medium text-center px-4">
          Selecciona un estilo y genera tu pizza para verla aquí
        </span>
      </div>
    );
  }

  // Mapea flat array [dough, sauce, ...toppings] a estructura visual
  const dough = ingredients[0] || 'masa base';
  const sauce = ingredients[1] || 'salsa';
  const toppings = ingredients.slice(2);  // Resto = toppings

  // Colores dinámicos por Abstract Factory output
  const doughColor = dough.includes('Thin') || dough.includes('fina') ? '#f3e5ab' 
                 : dough.includes('Arepa') ? '#d2b48c' : '#e6c280';
  const sauceColor = sauce.includes('San Marzano') || sauce.includes('tomate') ? '#e32636'
                    : sauce.includes('Hogao') ? '#c84b31' 
                    : sauce.includes('BBQ') || sauce.includes('queso') ? '#4a0404' : '#c84b31';

  // Toppings SVG con posición/nombre real del factory
  const toppingElements = toppings.map((topping, index) => {
    const angle = (index * 137.5) * (Math.PI / 180);  // Golden angle
    const radius = 120 + (index % 3) * 20;
    const x = 200 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    
    let color = '#8b4513';  // Default carne
    if (topping.includes('mozzarella') || topping.includes('Queso')) color = '#fffacd';
    else if (topping.includes('pepperoni') || topping.includes('Carne')) color = '#cc3333';
    else if (topping.includes('hogao')) color = '#a52a2a';
    else if (topping.includes('albahaca')) color = '#228b22';

    return (
      <g key={index}>
        <circle cx={x} cy={y} r={18} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        <animate 
          attributeName="opacity" 
          values="0.7;1;0.7" 
          dur="3s" 
          repeatCount="indefinite"
        />
        <title>{topping}</title>  {/* Tooltip real del factory */}
      </g>
    );
  });

  // Queso spots random (bubble effect)
  const cheeseSpots = Array.from({ length: 35 }).map((_, i) => {
    const angle = i * Math.PI * 2 / 35;
    const radius = 80 + Math.random() * 120;
    const x = 200 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);
    return (
      <circle 
        key={`cheese-${i}`} 
        cx={x} 
        cy={y} 
        r={Math.random() * 7 + 3} 
        fill="#fffacd" 
        opacity={0.6 + Math.random() * 0.3}
      />
    );
  });

  return (
    <div className="w-full max-w-[450px] mx-auto">
      {/* SVG Pizza */}
      <div className="relative">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-[400px] transform transition-all duration-700 hover:scale-[1.02] drop-shadow-2xl"
        >
          <defs>
            <radialGradient id="crust" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={doughColor} stopOpacity="1"/>
              <stop offset="100%" stopColor="#8b4513" stopOpacity="1"/>
            </radialGradient>
            <radialGradient id="sauce-glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={sauceColor} stopOpacity="0.9"/>
              <stop offset="100%" stopColor={sauceColor} stopOpacity="0.6"/>
            </radialGradient>
          </defs>
          
          {/* Crust borde */}
          <circle cx="200" cy="200" r="195" fill="url(#crust)" stroke="#654321" strokeWidth="12"/>
          
          {/* Dough interior */}
          <circle cx="200" cy="200" r="170" fill={doughColor} stroke="#d4a574" strokeWidth="4"/>
          
          {/* Salsa */}
          <circle cx="200" cy="200" r="155" fill="url(#sauce-glow)" stroke="#a1352b" strokeWidth="3">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="4s" repeatCount="indefinite"/>
          </circle>
          
          {/* Queso base */}
          {cheeseSpots}
          
          {/* Toppings del FACTORY */}
          {toppingElements}
          
          {/* Bake marks realistas */}
          <path d="M 20 20 Q 200 380 380 20" stroke="#654321" strokeWidth="3" fill="none" opacity="0.3"/>
          <circle cx="350" cy="50" r="12" fill="#8b4513" opacity="0.6"/>
        </svg>
      </div>

      {/* Info Panel - Nombres REALES del Abstract Factory */}
      <div className="mt-8 p-6 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {style?.toUpperCase() || 'PIZZA'}
          </h3>
          {price && (
            <span className="text-3xl font-black text-emerald-600 px-4 py-2 bg-emerald-100/50 rounded-xl">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">Masa:</span><br/>
            <span className="font-mono bg-green-100/50 px-2 py-1 rounded text-green-800">{dough}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">Salsa:</span><br/>
            <span className="font-mono bg-red-100/50 px-2 py-1 rounded text-red-800">{sauce}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600 dark:text-gray-400">Topping:</span><br/>
            <span className="font-mono bg-yellow-100/50 px-2 py-1 rounded text-yellow-800">
              {toppings[0] || '—'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Todos los ingredientes:</h4>
          <ul className="space-y-1 text-sm">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-orange-500" />
                {ing}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
