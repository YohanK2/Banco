from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Beneficiario(Base):
    __tablename__ = "beneficiarios"

    id_beneficiario = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    cuenta_destino = Column(Integer, ForeignKey("cuentas.id_cuenta"), nullable=False)
    alias = Column(String(50))

    # Relaciones
    cliente = relationship("Cliente", back_populates="beneficiarios")
    cuenta_destino_rel = relationship("Cuenta", back_populates="beneficiarios")
