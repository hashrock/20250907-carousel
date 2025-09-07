<template>
  <div class="carousel">
    <div class="carousel-container">
      <img
        :src="currentImage.url"
        :alt="currentImage.alt"
        class="carousel-image"
      />
    </div>

    <button
      class="carousel-button prev"
      @click="prev"
      :disabled="currentIndex === 0"
    >
      ←
    </button>

    <button
      class="carousel-button next"
      @click="next"
      :disabled="currentIndex === props.images.length - 1"
    >
      →
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(img => img.url && img.alt);
    }
  }
});

const currentIndex = ref(0);

const currentImage = computed(() => props.images[currentIndex.value]);

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
};

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.carousel-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-button.prev {
  left: 10px;
}

.carousel-button.next {
  right: 10px;
}
</style>
