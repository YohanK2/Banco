from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Cuenta(Base):
    __tablename__ = "cuentas"

    id_cuenta = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    numero_cuenta = Column(String(20), unique=True, index=True)
    tipo = Column(String(20))
    saldo = Column(Numeric(12, 2), default=0.00)
    estado = Column(String(20), default="ACTIVA")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    cliente = relationship("Cliente", back_populates="cuentas")
    transacciones_origen = relationship("Transaccion", foreign_keys="Transaccion.cuenta_origen", back_populates="origen")
    transacciones_destino = relationship("Transaccion", foreign_keys="Transaccion.cuenta_destino", back_populates="destino")
    beneficiarios = relationship("Beneficiario", back_populates="cuenta_destino_rel")
