---
name: pizza-abstract-factory
description: Abstract Factory para pizzas: factories por estilo (Italian/American/Colombian).
---
# Pizza Abstract Factory

**Goal**: Genera código Python polimórfico para crear pizzas sin condicionales.

**Instructions**:
1. AbstractPizzaFactory: create_dough(), create_sauce(), create_topping().
2. Concretas: ItalianFactory (mozzarella), AmericanFactory (pepperoni), ColombianFactory (hogao, arepa).
3. Pizza class ensambla via factory.
4. Función get_factory(style: str) -> AbstractPizzaFactory.

**Constraints**:
- 100% type hints (typing.Protocol).
- NO if/else/match para estilos.
- Registry de factories (dict[str, type]).

**Examples**:
pizza = Pizza(get_factory('colombian'))
print(pizza.bake())  # "Arepa base con hogao y carne"

**Scripts**:
validate.py: Chequea no condicionales en factories.
