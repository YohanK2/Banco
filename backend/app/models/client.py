from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), unique=True, nullable=False)
    nombres = Column(String(100))
    apellidos = Column(String(100))
    documento = Column(String(20), unique=True, index=True)
    telefono = Column(String(20))
    direccion = Column(Text)

    # Relaciones
    usuario = relationship("Usuario", back_populates="cliente")
    cuentas = relationship("Cuenta", back_populates="cliente")
    beneficiarios = relationship("Beneficiario", back_populates="cliente")
