import api from "./api";

/*
  BANCHOCÓ BANK — transacciones
  --------------------------------------------------
  Servicios para depósitos, retiros, transferencias y consulta de movimientos.
*/

export async function deposit(data) {
  const response = await api.post("/transactions/deposit", data);
  return response.data;
}

export async function withdraw(data) {
  const response = await api.post("/transactions/withdraw", data);
  return response.data;
}

export async function transfer(data) {
  const response = await api.post("/transactions/transfer", data);
  return response.data;
}

export async function getAccountTransactions(accountId) {
  const response = await api.get(`/transactions/account/${accountId}`);
  return response.data;
}

export async function getAccountStatement(accountId) {
  const response = await api.get(`/transactions/account/${accountId}/statement`);
  return response.data;
}

export async function getTransaction(transactionId) {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
}

export async function getAllTransactions() {
  const response = await api.get("/transactions");
  return response.data;
}