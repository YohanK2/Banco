from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    correo = Column(String(100), unique=True, nullable=False, index=True)
    contrasena_hash = Column(String(255), nullable=False)
    rol = Column(String(20), default="CLIENTE")
    estado = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    cliente = relationship("Cliente", back_populates="usuario", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="usuario")
    auditorias = relationship("Auditoria", back_populates="usuario")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id_token = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    token = Column(Text, nullable=False)
    fecha_expiracion = Column(DateTime, nullable=False)
    activo = Column(Boolean, default=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="refresh_tokens")
