<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  iconClass: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <section class="panel">
    <header class="section-heading" :class="{ 'section-heading-icon': icon }">
      <span v-if="icon" class="section-icon" :class="iconClass">
        <i :class="icon" aria-hidden="true" />
      </span>
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.panel {
  padding: 24px;
  background: #fff;
  border: 1px solid #e2e9f2;
  border-radius: 17px;
}

.section-heading {
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
}

.section-heading p {
  margin: 2px 0 0;
  color: #71839d;
  font-size: 12px;
}

.section-heading-icon {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  display: grid;
  width: 33px;
  height: 33px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid;
  border-radius: 12px;
}

@media (max-width: 560px) {
  .panel {
    padding: 18px;
  }
}
</style>
