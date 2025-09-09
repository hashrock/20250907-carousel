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

    <button class="carousel-button prev" @click="prev">←</button>

    <button class="carousel-button next" @click="next">→</button>

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
import { ref, computed, onMounted, watch } from "vue";
import CarouselIndicator from "./CarouselIndicator.vue";
import { playClickSound } from "../utils/sound";

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
// 速度計測用
const velocityX = ref(0);
const lastPointerX = ref(0);
const lastPointerTime = ref(0);

// 表示用の画像配列（前後にクローンを追加）
const displayImages = computed(() => {
  const images = props.images.map((img, index) => ({ ...img, id: index }));
  const lastImage = { ...images[images.length - 1], id: "last-clone" };
  const firstImage = { ...images[0], id: "first-clone" };
  return [lastImage, ...images, firstImage];
});

// トラックのスタイル
const trackStyle = computed(() => {
  const translateX =
    -(displayIndex.value * 100) +
    (dragOffset.value / (containerWidth.value || 1)) * 100;
  return {
    transform: `translateX(${translateX}%)`,
    transition: "none", // トランジションを完全に無効化
  };
});

const next = () => {
  if (isDragging.value) return;

  // 現在の位置から次のスライドへ
  const currentPosition =
    -displayIndex.value * containerWidth.value - dragOffset.value;
  const nextSlide = Math.floor(-currentPosition / containerWidth.value) + 1;
  const targetPosition = -nextSlide * containerWidth.value;
  const targetOffset =
    targetPosition - -displayIndex.value * containerWidth.value;

  const animate = () => {
    const diff = targetOffset - dragOffset.value;
    if (Math.abs(diff) > 1) {
      dragOffset.value += diff * 0.15;
      requestAnimationFrame(animate);
    } else {
      const slidesMoved = nextSlide - displayIndex.value;
      displayIndex.value = nextSlide;
      actualIndex.value =
        (actualIndex.value + slidesMoved + props.images.length) %
        props.images.length;
      dragOffset.value = 0;

      // クローン位置の調整
      if (displayIndex.value >= displayImages.value.length - 1) {
        displayIndex.value = 1;
      }
    }
  };
  requestAnimationFrame(animate);
};

const prev = () => {
  if (isDragging.value) return;

  // 現在の位置から前のスライドへ
  const currentPosition =
    -displayIndex.value * containerWidth.value - dragOffset.value;
  const prevSlide = Math.ceil(-currentPosition / containerWidth.value) - 1;
  const targetPosition = -prevSlide * containerWidth.value;
  const targetOffset =
    targetPosition - -displayIndex.value * containerWidth.value;

  const animate = () => {
    const diff = targetOffset - dragOffset.value;
    if (Math.abs(diff) > 1) {
      dragOffset.value += diff * 0.15;
      requestAnimationFrame(animate);
    } else {
      const slidesMoved = prevSlide - displayIndex.value;
      displayIndex.value = prevSlide;
      actualIndex.value =
        (actualIndex.value + slidesMoved + props.images.length) %
        props.images.length;
      dragOffset.value = 0;

      // クローン位置の調整
      if (displayIndex.value <= 0) {
        displayIndex.value = displayImages.value.length - 2;
      }
    }
  };
  requestAnimationFrame(animate);
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
  dragStartX.value = event.clientX - dragOffset.value; // 現在のオフセットを考慮
  containerWidth.value = event.currentTarget.offsetWidth;
  velocityX.value = 0;
  lastPointerX.value = event.clientX;
  lastPointerTime.value = Date.now();

  event.currentTarget.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event) => {
  if (!isDragging.value) return;

  const currentTime = Date.now();
  const deltaTime = currentTime - lastPointerTime.value;

  // 速度を計算（movementXまたは差分から）
  if (event.movementX !== undefined) {
    // movementXが使える場合
    if (deltaTime > 0) {
      velocityX.value = (event.movementX / deltaTime) * 1000; // px/s
    }
  } else {
    // movementXが使えない場合は差分から計算
    const deltaX = event.clientX - lastPointerX.value;
    if (deltaTime > 0) {
      velocityX.value = (deltaX / deltaTime) * 1000; // px/s
    }
  }

  dragOffset.value = event.clientX - dragStartX.value;
  lastPointerX.value = event.clientX;
  lastPointerTime.value = currentTime;
};

const handlePointerUp = (event) => {
  if (!isDragging.value) return;

  isDragging.value = false;

  // 摩擦係数とアニメーション設定
  const friction = 0.99;
  const minVelocity = 5;

  // 慣性アニメーションを開始
  const animateInertia = () => {
    if (Math.abs(velocityX.value) < minVelocity) {
      // 速度が十分小さくなったら停止（スナップなし）
      velocityX.value = 0;

      // クローン位置の調整のみ（インデックス更新なし）
      if (displayIndex.value >= displayImages.value.length - 1) {
        displayIndex.value = 1;
        // dragOffsetは維持
      } else if (displayIndex.value <= 0) {
        displayIndex.value = displayImages.value.length - 2;
        // dragOffsetは維持
      }

      return;
    }

    // 慣性による移動
    dragOffset.value += velocityX.value * 0.016;
    velocityX.value *= friction;

    // 画像境界を超えたらインデックスを更新
    if (Math.abs(dragOffset.value) >= containerWidth.value) {
      const slidesMoved = Math.floor(
        Math.abs(dragOffset.value) / containerWidth.value
      );
      const direction = Math.sign(dragOffset.value);

      displayIndex.value -= direction * slidesMoved;
      actualIndex.value =
        (actualIndex.value - direction * slidesMoved + props.images.length) %
        props.images.length;
      dragOffset.value = dragOffset.value % containerWidth.value;

      // クローン位置の調整
      if (displayIndex.value >= displayImages.value.length - 1) {
        displayIndex.value = 1;
        // dragOffsetは維持
      } else if (displayIndex.value <= 0) {
        displayIndex.value = displayImages.value.length - 2;
        // dragOffsetは維持
      }
    }

    requestAnimationFrame(animateInertia);
  };

  animateInertia();

  if (event.currentTarget && event.currentTarget.releasePointerCapture) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
};

// actualIndexの変化を監視
watch(actualIndex, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    playClickSound();
  }
});

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
