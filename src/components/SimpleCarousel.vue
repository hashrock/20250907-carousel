<template>
  <div class="carousel">
    <div 
      class="carousel-container"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    >
      <div
        class="carousel-track"
        :style="{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.5s ease-in-out'
        }"
      >
        <img
          v-for="(image, index) in props.images"
          :key="index"
          :src="image.url"
          :alt="image.alt"
          class="carousel-image"
          draggable="false"
        />
      </div>
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

    <div class="carousel-indicators">
      <CarouselIndicator
        v-for="(_, index) in props.images"
        :key="index"
        :is-active="currentIndex === index"
        :aria-label="`Go to slide ${index + 1}`"
        @click="goToSlide(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import CarouselIndicator from "./CarouselIndicator.vue";

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((img) => img.url && img.alt);
    },
  },
});

const currentIndex = ref(0);
const isDragging = ref(false);
const dragOffset = ref(0);
const startX = ref(0);
const containerWidth = ref(0);

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

const goToSlide = (index) => {
  currentIndex.value = index;
};

const handlePointerDown = (event) => {
  isDragging.value = true;
  startX.value = event.clientX;
  dragOffset.value = 0;
  containerWidth.value = event.currentTarget.offsetWidth;
  
  // ポインターをキャプチャ
  event.currentTarget.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event) => {
  if (!isDragging.value) return;
  
  // movementXを累積してドラッグのオフセットを計算
  dragOffset.value += event.movementX;
};

const handlePointerUp = (event) => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  
  // スワイプの閾値（コンテナ幅の20%）
  const threshold = containerWidth.value * 0.2;
  
  if (Math.abs(dragOffset.value) > threshold) {
    if (dragOffset.value < 0) {
      // 左にスワイプ（次へ）
      next();
    } else {
      // 右にスワイプ（前へ）
      prev();
    }
  }
  
  // ドラッグオフセットをリセット
  dragOffset.value = 0;
  
  // ポインターキャプチャを解放
  if (event.currentTarget && event.currentTarget.releasePointerCapture) {
    event.currentTarget.releasePointerCapture(event.pointerId);
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
  cursor: grab;
}

.carousel-container:active {
  cursor: grabbing;
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
  user-select: none;
  touch-action: pan-y;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
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

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

</style>
