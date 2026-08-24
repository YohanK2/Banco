import api from "./api";

/*
  BANCHOCÓ BANK — cuentas
  --------------------------------------------------
  Servicios para consultar cuentas y saldos.
*/

export async function getAccount(accountId) {
  const response = await api.get(`/accounts/${accountId}`);
  return response.data;
}

export async function getAccounts() {
  const response = await api.get("/accounts");
  return response.data;
}

export async function getClientAccounts(clientId) {
  const response = await api.get(`/clients/${clientId}/accounts`);
  return response.data;
}