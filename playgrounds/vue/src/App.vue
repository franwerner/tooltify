<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <main>
    <h1>Tooltify Vue Playground</h1>
    <button @click="count++">Count is {{ count }}</button>
  </main>
</template>

<style scoped>
main {
  font-family: system-ui, sans-serif;
  padding: 2rem;
}
</style>
