<template>
  <button
    class="indicator"
    :class="{ active: isActive }"
    @click="$emit('click')"
    :aria-label="ariaLabel"
  />
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>

<style scoped>
.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #ccc;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  position: relative;
}

.indicator::before {
  content: "";
  position: absolute;
  inset: -8px -4px;
  cursor: pointer;
  border-radius: 50%;
}

.indicator:hover {
  background: #999;
}

.indicator.active {
  background: #333;
  width: 24px;
  border-radius: 4px;
}
</style>