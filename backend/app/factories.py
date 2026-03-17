"""
Pizza Abstract Factory — patrón sin if/else/match.
Cada fábrica concreta ensambla dough + sauce + topping propios de su estilo.
"""
from __future__ import annotations

from typing import Protocol, runtime_checkable


# ---------------------------------------------------------------------------
# Producto Protocol
# ---------------------------------------------------------------------------

@runtime_checkable
class PizzaIngredient(Protocol):
    def describe(self) -> str: ...


# ---------------------------------------------------------------------------
# Ingredientes concretos
# ---------------------------------------------------------------------------

class ThinCrustDough:
    def describe(self) -> str:
        return "masa fina"


class ThickCrustDough:
    def describe(self) -> str:
        return "masa gruesa"


class ArepaDough:
    def describe(self) -> str:
        return "arepa"


class TomatoSauce:
    def describe(self) -> str:
        return "salsa de tomate"


class CheesySauce:
    def describe(self) -> str:
        return "salsa de queso"


class HogaoSauce:
    def describe(self) -> str:
        return "hogao"


class MozzarellaTopping:
    def describe(self) -> str:
        return "mozzarella"


class PepperoniTopping:
    def describe(self) -> str:
        return "pepperoni"


class CarneTopping:
    def describe(self) -> str:
        return "carne"


# ---------------------------------------------------------------------------
# Abstract Factory Protocol
# ---------------------------------------------------------------------------

@runtime_checkable
class AbstractPizzaFactory(Protocol):
    style: str
    price: float

    def create_dough(self) -> PizzaIngredient: ...
    def create_sauce(self) -> PizzaIngredient: ...
    def create_topping(self) -> PizzaIngredient: ...


# ---------------------------------------------------------------------------
# Fábricas concretas
# ---------------------------------------------------------------------------

class ItalianFactory:
    style: str = "italian"
    price: float = 12.99

    def create_dough(self) -> PizzaIngredient:
        return ThinCrustDough()

    def create_sauce(self) -> PizzaIngredient:
        return TomatoSauce()

    def create_topping(self) -> PizzaIngredient:
        return MozzarellaTopping()


class AmericanFactory:
    style: str = "american"
    price: float = 10.99

    def create_dough(self) -> PizzaIngredient:
        return ThickCrustDough()

    def create_sauce(self) -> PizzaIngredient:
        return CheesySauce()

    def create_topping(self) -> PizzaIngredient:
        return PepperoniTopping()


class ColombianFactory:
    style: str = "colombian"
    price: float = 8.99

    def create_dough(self) -> PizzaIngredient:
        return ArepaDough()

    def create_sauce(self) -> PizzaIngredient:
        return HogaoSauce()

    def create_topping(self) -> PizzaIngredient:
        return CarneTopping()


# ---------------------------------------------------------------------------
# Registry — sin if/else/match
# ---------------------------------------------------------------------------

_FACTORY_REGISTRY: dict[str, type] = {
    "italian": ItalianFactory,
    "american": AmericanFactory,
    "colombian": ColombianFactory,
}


def get_factory(style: str) -> AbstractPizzaFactory:
    """Retorna la fábrica concreta para el estilo dado.

    Raises:
        KeyError: si el estilo no está registrado.
    """
    factory_cls = _FACTORY_REGISTRY[style.lower()]
    return factory_cls()


def available_styles() -> list[str]:
    return list(_FACTORY_REGISTRY.keys())


# ---------------------------------------------------------------------------
# Pizza — ensambla via factory
# ---------------------------------------------------------------------------

class Pizza:
    def __init__(self, factory: AbstractPizzaFactory) -> None:
        self.factory = factory
        self.dough = factory.create_dough()
        self.sauce = factory.create_sauce()
        self.topping = factory.create_topping()

    @property
    def ingredients(self) -> list[str]:
        return [
            self.dough.describe(),
            self.sauce.describe(),
            self.topping.describe(),
        ]

    def bake(self) -> str:
        return (
            f"{self.dough.describe()} base con "
            f"{self.sauce.describe()} y {self.topping.describe()}"
        )
