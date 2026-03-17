"""
Ejemplo de patrón Abstract Factory aplicado al diagrama de arquitectura AWS.
Las familias (variantes) son las Zonas de Disponibilidad (AZ-A y AZ-B).
Los productos son los diferentes tipos de recursos informáticos en cada capa.
"""
from __future__ import annotations
from typing import Protocol, runtime_checkable

# ---------------------------------------------------------------------------
# Productos Protocol (Recursos de Infraestructura)
# ---------------------------------------------------------------------------

@runtime_checkable
class NatGateway(Protocol):
    def route_traffic(self) -> str: ...

@runtime_checkable
class FrontendNode(Protocol):
    def serve_frontend(self) -> str: ...

@runtime_checkable
class BackendNode(Protocol):
    def process_api(self) -> str: ...

@runtime_checkable
class DatabaseNode(Protocol):
    def execute_query(self) -> str: ...


# ---------------------------------------------------------------------------
# Recursos Concretos para la Zona A (AZ-a)
# ---------------------------------------------------------------------------

class NatGatewayA:
    def route_traffic(self) -> str:
        return "NAT GW A: Enrutando tráfico a Internet desde Subred Privada A"

class FrontendASGA:
    def serve_frontend(self) -> str:
        return "ASG Front-end A: Sirviendo UI (Min 2, Max 6) por el puerto 80/443"

class BackendASGA:
    def process_api(self) -> str:
        return "ASG Back-end A: Procesando lógica de negocio por el puerto 8080"

class PrimaryRDS:
    def execute_query(self) -> str:
        return "RDS Primary (Writer) db.t3.medium: Ejecutando queries de lectura/escritura (Puerto 3306)"


# ---------------------------------------------------------------------------
# Recursos Concretos para la Zona B (AZ-b)
# ---------------------------------------------------------------------------

class NatGatewayB:
    def route_traffic(self) -> str:
        return "NAT GW B: Enrutando tráfico a Internet desde Subred Privada B"

class FrontendASGB:
    def serve_frontend(self) -> str:
        return "ASG Front-end B: Sirviendo UI (Min 2, Max 6) por el puerto 80/443"

class BackendASGB:
    def process_api(self) -> str:
        return "ASG Back-end B: Procesando lógica de negocio por el puerto 8080"

class StandbyRDS:
    def execute_query(self) -> str:
        return "RDS Standby (Replica) db.t3.medium: Replicación síncrona / solo lectura (Puerto 3306)"


# ---------------------------------------------------------------------------
# Abstract Factory Protocol
# ---------------------------------------------------------------------------

@runtime_checkable
class AbstractAvailabilityZoneFactory(Protocol):
    zone_name: str

    def create_nat_gateway(self) -> NatGateway: ...
    def create_frontend(self) -> FrontendNode: ...
    def create_backend(self) -> BackendNode: ...
    def create_database(self) -> DatabaseNode: ...


# ---------------------------------------------------------------------------
# Fábricas Concretas (AZ-a y AZ-b)
# ---------------------------------------------------------------------------

class AvailabilityZoneAFactory:
    zone_name: str = "us-east-1a"

    def create_nat_gateway(self) -> NatGateway:
        return NatGatewayA()

    def create_frontend(self) -> FrontendNode:
        return FrontendASGA()

    def create_backend(self) -> BackendNode:
        return BackendASGA()

    def create_database(self) -> DatabaseNode:
        return PrimaryRDS()


class AvailabilityZoneBFactory:
    zone_name: str = "us-east-1b"

    def create_nat_gateway(self) -> NatGateway:
        return NatGatewayB()

    def create_frontend(self) -> FrontendNode:
        return FrontendASGB()

    def create_backend(self) -> BackendNode:
        return BackendASGB()

    def create_database(self) -> DatabaseNode:
        return StandbyRDS()


# ---------------------------------------------------------------------------
# Cliente / Ensamblador (e.g., Application Load Balancer / Region Manager)
# ---------------------------------------------------------------------------

class CloudInfrastructure:
    def __init__(self, factory: AbstractAvailabilityZoneFactory) -> None:
        self.zone = factory.zone_name
        self.nat = factory.create_nat_gateway()
        self.front = factory.create_frontend()
        self.back = factory.create_backend()
        self.db = factory.create_database()

    def status_report(self) -> list[str]:
        return [
            f"--- Infraestructura en {self.zone} ---",
            self.nat.route_traffic(),
            self.front.serve_frontend(),
            self.back.process_api(),
            self.db.execute_query(),
            "---------------------------------------"
        ]

# Ejemplo de uso:
if __name__ == "__main__":
    print("Desplegando infraestructura Multi-AZ...\n")
    
    # AZ-A
    az_a_infra = CloudInfrastructure(AvailabilityZoneAFactory())
    print("\n".join(az_a_infra.status_report()))
    
    # AZ-B
    az_b_infra = CloudInfrastructure(AvailabilityZoneBFactory())
    print("\n".join(az_b_infra.status_report()))
