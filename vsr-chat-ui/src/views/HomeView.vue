<script setup lang="ts">
import { ref } from "vue";
import robot from "../assets/robot-assistant.png";

const name = ref("")
const email = ref("")
const loading = ref(false)
const error = ref("")

const createUser = async () => {
    if (!name.value || !email.value) {
        error.value = "Name and email are required";
        return;
    }
    console.log(name.value, email.value)
}
</script>

<template>
    <div class="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div class="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <img :src="robot" alt="chat bot" class="mx-auto w-24 h-24 mb-4">
            <h1 class="text-2xl font-semibold mb-4 text-center">
                Welcome to VSR Chat
            </h1>

            <input v-model="name" type="text"
                class="w-full p-2 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none" placeholder="Name"
                required>
            <input v-model="email" type="email"
                class="w-full p-2 mb-2 bg-gray-700 text-white rounded-lg focus:outline-none" placeholder="Email"
                required>

            <button @click="createUser" class="w-full p-2 button-color-blue rounded-lg" :disabled="loading">
                {{ loading ? "Logging in..." : "Start Chat" }}
            </button>

            <p v-if="error" class="text-red-400 text-center mt-2">{{ error }}</p>
        </div>
    </div>
</template>

<style scoped>
.button-color-blue {
    background-color: #23468E;
    color: whitesmoke;
}
</style>