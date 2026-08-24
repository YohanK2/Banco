import api from "./api.js";

export const accountService = {
  async getAccounts() {
    const response = await api.get("/accounts");
    return response.data;
  },

  async getAccountById(accountId) {
    const response = await api.get(`/accounts/${accountId}`);
    return response.data;
  },

  async updateAccountState(accountId, estado) {
    const response = await api.put(`/accounts/${accountId}`, { estado });
    return response.data;
  },
};

export default accountService;
