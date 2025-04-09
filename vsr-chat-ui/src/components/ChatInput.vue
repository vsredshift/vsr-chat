<script setup lang="ts">
import { ref } from 'vue';

const message = ref("")
const emit = defineEmits(["send"])

const sendMessage = () => {
    if (!message.value.trim()) return;

    emit("send", message.value);
    message.value = "";
}
</script>

<template>
    <div class="flex p-4 bg-gray-800">
        <input v-model="message" @keyup.enter="sendMessage" type="text" name="message" id="message"
            class="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none">
        <button @click="sendMessage" class="ml-2 px-4 py-2 bg-blue-500 rounded-lg">Send</button>
    </div>
</template>