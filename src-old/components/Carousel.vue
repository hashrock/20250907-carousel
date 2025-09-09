<template>
  <div
    class="carousel"
    @keydown="handleKeydown"
    tabindex="0"
    role="region"
    aria-label="Image carousel"
  >
    <div
      class="carousel-container"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        class="carousel-track"
        :style="{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }"
      >
        <div
          v-for="(image, index) in images"
          :key="index"
          class="carousel-item"
          :style="{ width: `${itemWidth}px` }"
        >
          <img
            :src="image.url"
            :alt="image.alt"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <button
      class="carousel-button prev"
      @click="prev"
      :disabled="!canLoop && currentIndex === 0"
      aria-label="Previous image"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <button
      class="carousel-button next"
      @click="next"
      :disabled="!canLoop && currentIndex === images.length - visibleItems"
      aria-label="Next image"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>

    <div class="carousel-indicators">
      <button
        v-for="(_, index) in indicatorCount"
        :key="index"
        class="indicator"
        :class="{ active: isIndicatorActive(index) }"
        @click="goToSlide(index)"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  autoPlay: {
    type: Boolean,
    default: true
  },
  autoPlayInterval: {
    type: Number,
    default: 3000
  },
  canLoop: {
    type: Boolean,
    default: true
  }
})

const images = ref([])
const currentIndex = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const containerWidth = ref(0)
const visibleItems = ref(1)
const autoPlayTimer = ref(null)

const itemWidth = computed(() => containerWidth.value / visibleItems.value)
const translateX = computed(() => {
  const baseTranslate = -currentIndex.value * itemWidth.value
  if (isDragging.value) {
    return baseTranslate + (currentX.value - startX.value)
  }
  return baseTranslate
})

const indicatorCount = computed(() => {
  return Math.ceil(images.value.length / visibleItems.value)
})

const isIndicatorActive = (index) => {
  const slideIndex = Math.floor(currentIndex.value / visibleItems.value)
  return slideIndex === index
}

const fetchImages = async () => {
  const unsplashImages = [
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', alt: 'Mountain landscape' },
    { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', alt: 'Foggy mountains' },
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', alt: 'Nature scene' },
    { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff', alt: 'Forest path' },
    { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d', alt: 'Forest bridge' },
    { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e', alt: 'Valley view' }
  ]
  images.value = unsplashImages
}

const updateVisibleItems = () => {
  const width = window.innerWidth
  if (width < 640) {
    visibleItems.value = 1
  } else if (width < 1024) {
    visibleItems.value = 2
  } else {
    visibleItems.value = 3
  }
  
  const container = document.querySelector('.carousel-container')
  if (container) {
    containerWidth.value = container.offsetWidth
  }
}

const next = () => {
  if (currentIndex.value < images.value.length - visibleItems.value) {
    currentIndex.value++
  } else if (props.canLoop) {
    currentIndex.value = 0
  }
  resetAutoPlay()
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else if (props.canLoop) {
    currentIndex.value = images.value.length - visibleItems.value
  }
  resetAutoPlay()
}

const goToSlide = (index) => {
  currentIndex.value = index * visibleItems.value
  if (currentIndex.value > images.value.length - visibleItems.value) {
    currentIndex.value = images.value.length - visibleItems.value
  }
  resetAutoPlay()
}

const handleMouseDown = (e) => {
  isDragging.value = true
  startX.value = e.clientX
  currentX.value = e.clientX
  stopAutoPlay()
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  currentX.value = e.clientX
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  
  const diff = startX.value - currentX.value
  const threshold = itemWidth.value * 0.2
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      next()
    } else {
      prev()
    }
  }
  
  isDragging.value = false
  startX.value = 0
  currentX.value = 0
  resetAutoPlay()
}

const handleTouchStart = (e) => {
  startX.value = e.touches[0].clientX
  currentX.value = e.touches[0].clientX
  isDragging.value = true
  stopAutoPlay()
}

const handleTouchMove = (e) => {
  if (!isDragging.value) return
  currentX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  handleMouseUp()
}

const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case 'Home':
      currentIndex.value = 0
      resetAutoPlay()
      break
    case 'End':
      currentIndex.value = images.value.length - visibleItems.value
      resetAutoPlay()
      break
  }
}

const startAutoPlay = () => {
  if (!props.autoPlay) return
  
  autoPlayTimer.value = setInterval(() => {
    next()
  }, props.autoPlayInterval)
}

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

const resetAutoPlay = () => {
  stopAutoPlay()
  startAutoPlay()
}

onMounted(async () => {
  await fetchImages()
  updateVisibleItems()
  window.addEventListener('resize', updateVisibleItems)
  startAutoPlay()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleItems)
  stopAutoPlay()
})

watch(() => props.autoPlay, (newVal) => {
  if (newVal) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
})
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.carousel:focus {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}

.carousel-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #f5f5f5;
}

.carousel-track {
  display: flex;
  cursor: grab;
  user-select: none;
}

.carousel-track:active {
  cursor: grabbing;
}

.carousel-item {
  flex-shrink: 0;
  padding: 0 8px;
}

.carousel-item img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.carousel-button:hover:not(:disabled) {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.carousel-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-button.prev {
  left: 32px;
}

.carousel-button.next {
  right: 32px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: #d0d0d0;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator:hover {
  background: #a0a0a0;
}

.indicator.active {
  background: #4a90e2;
  width: 24px;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .carousel-item img {
    height: 250px;
  }
  
  .carousel-button {
    width: 40px;
    height: 40px;
  }
  
  .carousel-button.prev {
    left: 16px;
  }
  
  .carousel-button.next {
    right: 16px;
  }
}

@media (max-width: 480px) {
  .carousel {
    padding: 10px;
  }
  
  .carousel-item img {
    height: 200px;
  }
  
  .carousel-item {
    padding: 0 4px;
  }
}
</style>