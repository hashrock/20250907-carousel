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
      :disabled="currentIndex === images.length - 1"
    >
      →
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const currentIndex = ref(0);

const images = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop",
    alt: "Mountain landscape",
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=900&fit=crop",
    alt: "Foggy mountains",
  },
  {
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop",
    alt: "Nature scene",
  },
  {
    url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600&h=900&fit=crop",
    alt: "Forest path",
  },
  {
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600&h=900&fit=crop",
    alt: "Forest bridge",
  },
];

const currentImage = computed(() => images[currentIndex.value]);

const next = () => {
  if (currentIndex.value < images.length - 1) {
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
