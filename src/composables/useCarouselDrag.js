import { ref } from 'vue'

export function useCarouselDrag(options = {}) {
  const {
    onNext = () => {},
    onPrev = () => {},
    threshold = 0.2
  } = options

  const isDragging = ref(false)
  const dragOffset = ref(0)
  const startX = ref(0)
  const containerWidth = ref(0)

  const handlePointerDown = (event) => {
    isDragging.value = true
    startX.value = event.clientX
    dragOffset.value = 0
    containerWidth.value = event.currentTarget.offsetWidth
    
    // ポインターをキャプチャ
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!isDragging.value) return
    
    // movementXを累積してドラッグのオフセットを計算
    dragOffset.value += event.movementX
  }

  const handlePointerUp = (event) => {
    if (!isDragging.value) return
    
    isDragging.value = false
    
    // スワイプの閾値
    const thresholdPx = containerWidth.value * threshold
    
    if (Math.abs(dragOffset.value) > thresholdPx) {
      if (dragOffset.value < 0) {
        // 左にスワイプ（次へ）
        onNext()
      } else {
        // 右にスワイプ（前へ）
        onPrev()
      }
    }
    
    // ドラッグオフセットをリセット
    dragOffset.value = 0
    
    // ポインターキャプチャを解放
    if (event.currentTarget && event.currentTarget.releasePointerCapture) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return {
    isDragging,
    dragOffset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  }
}