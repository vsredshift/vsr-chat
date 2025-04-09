import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userId: null as string | null,
    name: null as string | null,
  }),
  actions: {
    setUser(data: { userId: string; name: string }) {
      this.userId = data.userId;
      this.name = data.name;
    },
    logout() {
      this.userId = null;
      this.name = null;
    },
  },
  persist: true,
});
