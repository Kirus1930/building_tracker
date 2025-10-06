<template>
  <div>
    <p>Счёт: {{ count }}</p>
    <button @click="increment">Увеличить</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Определяем реактивные переменные
const count = ref(0); // реактивное число

// Определяем функции
function increment() {
  count.value++;
}

// Вычисляемое свойство (пример, не используется в шаблоне)
const doubleCount = computed(() => count.value * 2);
</script>
