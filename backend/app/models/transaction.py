from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Transaccion(Base):
    __tablename__ = "transacciones"

    id_transaccion = Column(Integer, primary_key=True, index=True)
    cuenta_origen = Column(Integer, ForeignKey("cuentas.id_cuenta"), nullable=True)
    cuenta_destino = Column(Integer, ForeignKey("cuentas.id_cuenta"), nullable=True)
    tipo = Column(String(20))
    monto = Column(Numeric(12, 2), nullable=False)
    descripcion = Column(Text)
    fecha = Column(DateTime, default=datetime.utcnow, index=True)

    # Relaciones
    origen = relationship("Cuenta", foreign_keys=[cuenta_origen], back_populates="transacciones_origen")
    destino = relationship("Cuenta", foreign_keys=[cuenta_destino], back_populates="transacciones_destino")
