// Реализация на Options API

<template>
  <div>
    <p>Счёт: {{ count }}</p>
    <button @click="increment">Увеличить</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0 // начальное значение счётчика
    };
  },
  methods: {
    increment() {
      this.count++; // увеличиваем счётчик при клике
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2; // пример вычисляемого свойства (не используется в шаблоне)
    }
  }
};
</script>
