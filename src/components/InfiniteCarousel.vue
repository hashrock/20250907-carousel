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
        :style="trackStyle"
        @transitionend="handleTransitionEnd"
      >
        <img
          v-for="(image, index) in displayImages"
          :key="`${image.id}-${index}`"
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
    >
      ←
    </button>

    <button
      class="carousel-button next"
      @click="next"
    >
      →
    </button>

    <div class="carousel-indicators">
      <CarouselIndicator
        v-for="(_, index) in props.images"
        :key="index"
        :is-active="actualIndex === index"
        :aria-label="`Go to slide ${index + 1}`"
        @click="goToSlide(index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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

// 実際の画像インデックス（0 to images.length-1）
const actualIndex = ref(0);
// 表示位置のインデックス（クローン含む）
const displayIndex = ref(1);
// トランジション状態
const isTransitioning = ref(false);
// ドラッグ状態
const isDragging = ref(false);
const dragStartX = ref(0);
const dragOffset = ref(0);
const containerWidth = ref(0);

// 表示用の画像配列（前後にクローンを追加）
const displayImages = computed(() => {
  const images = props.images.map((img, index) => ({ ...img, id: index }));
  const lastImage = { ...images[images.length - 1], id: 'last-clone' };
  const firstImage = { ...images[0], id: 'first-clone' };
  return [lastImage, ...images, firstImage];
});

// トラックのスタイル
const trackStyle = computed(() => {
  const translateX = -(displayIndex.value * 100) + (dragOffset.value / containerWidth.value * 100);
  return {
    transform: `translateX(${translateX}%)`,
    transition: isTransitioning.value ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
  };
});

const next = () => {
  if (isDragging.value) return;
  isTransitioning.value = true;
  displayIndex.value++;
  actualIndex.value = (actualIndex.value + 1) % props.images.length;
};

const prev = () => {
  if (isDragging.value) return;
  isTransitioning.value = true;
  displayIndex.value--;
  actualIndex.value = (actualIndex.value - 1 + props.images.length) % props.images.length;
};

const goToSlide = (index) => {
  if (isDragging.value) return;
  const diff = index - actualIndex.value;
  isTransitioning.value = true;
  displayIndex.value += diff;
  actualIndex.value = index;
};

// トランジション終了時の処理
const handleTransitionEnd = () => {
  isTransitioning.value = false;
  
  // 最後のクローンに到達した場合
  if (displayIndex.value >= displayImages.value.length - 1) {
    displayIndex.value = 1;
  }
  // 最初のクローンに到達した場合
  else if (displayIndex.value <= 0) {
    displayIndex.value = displayImages.value.length - 2;
  }
};

// ポインターイベントハンドラー
const handlePointerDown = (event) => {
  if (isTransitioning.value) return;
  
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragOffset.value = 0;
  containerWidth.value = event.currentTarget.offsetWidth;
  
  event.currentTarget.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event) => {
  if (!isDragging.value) return;
  
  dragOffset.value = event.clientX - dragStartX.value;
};

const handlePointerUp = (event) => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  
  const threshold = containerWidth.value * 0.2;
  const shouldMove = Math.abs(dragOffset.value) > threshold;
  
  // アニメーションを開始
  isTransitioning.value = true;
  
  if (shouldMove) {
    if (dragOffset.value < 0) {
      // 左スワイプ（次へ）
      displayIndex.value++;
      actualIndex.value = (actualIndex.value + 1) % props.images.length;
    } else {
      // 右スワイプ（前へ）
      displayIndex.value--;
      actualIndex.value = (actualIndex.value - 1 + props.images.length) % props.images.length;
    }
  }
  
  // オフセットをリセット（アニメーション付きで元に戻る）
  dragOffset.value = 0;
  
  if (event.currentTarget && event.currentTarget.releasePointerCapture) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
};

onMounted(() => {
  // 初期位置を設定（最初の実画像を表示）
  displayIndex.value = 1;
});
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
  will-change: transform;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;
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

.carousel-button:hover {
  background: rgba(0, 0, 0, 0.7);
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