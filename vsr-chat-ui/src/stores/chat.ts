import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useUserStore } from "./user";

interface ChatMessage {
  message: string;
  reply: string;
}

interface FormattedMessage {
  role: "user" | "ai";
  content: string;
}

export const useChatStore = defineStore("chat", () => {
  const messages = ref<{ role: string; content: string }[]>([]);
  const isLoading = ref(false);

  const userStore = useUserStore();

  // Load previous chat messages
  const loadChatHistory = async () => {
    if (!userStore.userId) return;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/get-messages`,
        {
          userId: userStore.userId,
        }
      );

      messages.value = data.messages
        .flatMap((msg: ChatMessage): FormattedMessage[] => [
          { role: "user", content: msg.message },
          { role: "ai", content: msg.reply },
        ])
        .filter((msg: FormattedMessage) => msg.content);
    } catch (error) {}
  };

  // Post message to Chat Bot
  const sendMessage = async (message: string) => {
    if (!message.trim() || !userStore.userId) return;

    messages.value.push({ role: "user", content: message });
    isLoading.value = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          message,
          userId: userStore.userId,
        }
      );

      messages.value.push({ role: "ai", content: data.reply });
    } catch (error) {
      console.error("Error sending message", error);
      messages.value.push({
        role: "ai",
        content: "Error: unable to process request",
      });
    } finally {
      isLoading.value = false;
    }
  };

  return { messages, isLoading, loadChatHistory, sendMessage };
});
