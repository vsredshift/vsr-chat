<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { useUserStore, useChatStore } from '@/stores';
import { useRouter } from 'vue-router';
import Header from '@/components/Header.vue';
import ChatInput from '@/components/ChatInput.vue';

const userStore = useUserStore();
const chatStore = useChatStore();
const router = useRouter();

if (!userStore.userId) {
    router.push("/")
}

const scrollToBottom = () => {
    nextTick(() => {
        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    })
}

onMounted(() => {
    chatStore.loadChatHistory().then(() => scrollToBottom())
})

</script>
<template>
    <div class="flex flex-col h-screen bg-gray-900 text-white">
        <Header />

        <div id="chat-container" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-for="(msg, index) in chatStore.messages" :key="index" class="flex items-start"
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-xs px-4 py-2 rounded-lg md:max-w-md"
                    :class="msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'">
                    {{ msg.content }}
                </div>
            </div>

            <div v-if="chatStore.isLoading" class="flex justify-start">
                <div class="bg-gray-700 text-white px-4 py-2 rounded-lg">
                    <span class="animate-pulse">Chat thinking...</span>
                </div>
            </div>
        </div>

        <ChatInput @send="chatStore.sendMessage"/>
    </div>
</template>