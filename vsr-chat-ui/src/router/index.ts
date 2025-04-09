import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ChatView from "../views/ChatView.vue";

const routes = [
  { path: "/", name: "home-view", component: HomeView },
  { path: "/chat", name: "chat-view", component: ChatView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
