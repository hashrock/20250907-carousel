<script setup lang="ts">
import InfiniteCarousel from "./components/InfiniteCarousel.vue";

const carouselImages = [
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
</script>

<template>
  <div id="app">
    <InfiniteCarousel :images="carouselImages" />
  </div>
</template>

<style scoped>
#app {
  padding: 40px 20px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
