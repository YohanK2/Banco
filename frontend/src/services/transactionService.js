import api from "./api.js";

export const transactionService = {
  async deposit({ numero_cuenta, monto, descripcion }) {
    const response = await api.post("/transactions/deposit", {
      numero_cuenta: String(numero_cuenta),
      monto: Number(monto),
      descripcion: descripcion || "Depósito en cuenta",
    });
    return response.data;
  },

  async withdraw({ numero_cuenta, monto, descripcion }) {
    const response = await api.post("/transactions/withdraw", {
      numero_cuenta: String(numero_cuenta),
      monto: Number(monto),
      descripcion: descripcion || "Retiro de cuenta",
    });
    return response.data;
  },

  async transfer({ cuenta_origen, cuenta_destino, monto, descripcion }) {
    const response = await api.post("/transactions/transfer", {
      cuenta_origen: String(cuenta_origen),
      cuenta_destino: String(cuenta_destino),
      monto: Number(monto),
      descripcion: descripcion || "Transferencia entre cuentas",
    });
    return response.data;
  },

  async getAccountTransactions(accountId) {
    const response = await api.get(`/transactions/account/${accountId}`);
    return response.data;
  },

  async getAccountStatement(accountId) {
    const response = await api.get(`/transactions/account/${accountId}/statement`);
    return response.data;
  },

  async getAllTransactions() {
    const response = await api.get("/transactions");
    return response.data;
  },
};

export default transactionService;
