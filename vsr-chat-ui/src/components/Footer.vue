<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <footer class="bg-gray-800 text-white py-4 min-h-[60px]">
        <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <p class="text-sm">&copy; {{ new Date().getFullYear() }} VSR Chat. All rights reserved.</p>
            <div class="flex space-x-4 mt-2 md:mt-0">
                <RouterLink to="/" class="hover:underline">Home</RouterLink>
                <RouterLink to="/chat" class="hover:underline">Chat</RouterLink>

                <a href="https://www.flaticon.com/free-icons/chatbot" title="Chatbot icons created by juicy_fish" target="_blank" class="hover:underline text-orange-200">Visit Flaticon</a>
            </div>
        </div>
    </footer>
</template>
