<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton } from 'naive-ui'

const props = defineProps<{ items: string[] }>()
const emit = defineEmits<{ result: [item: string] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const spinning = ref(false)
const rotation = ref(0)
const winner = ref<string | null>(null)

const colors = ['#FF6B6B', '#FF8E8E', '#FFD6D6', '#FFF5E4', '#E84057', '#FFB4B4']

function draw() {
  const el = canvas.value
  if (!el || !props.items.length) return
  const ctx = el.getContext('2d')!
  const cx = el.width / 2
  const cy = el.height / 2
  const r = Math.min(cx, cy) - 10
  const sliceAngle = (2 * Math.PI) / props.items.length

  ctx.clearRect(0, 0, el.width, el.height)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotation.value * Math.PI) / 180)

  props.items.forEach((item, i) => {
    const start = i * sliceAngle
    const end = start + sliceAngle

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r, start, end)
    ctx.closePath()
    ctx.fillStyle = colors[i % colors.length]!
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.save()
    ctx.rotate(start + sliceAngle / 2)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '13px Pretendard, sans-serif'
    const label = item.length > 8 ? item.slice(0, 8) + '…' : item
    ctx.fillText(label, r * 0.6, 4)
    ctx.restore()
  })

  ctx.restore()

  // 화살표
  ctx.beginPath()
  ctx.moveTo(cx + r + 5, cy)
  ctx.lineTo(cx + r - 15, cy - 10)
  ctx.lineTo(cx + r - 15, cy + 10)
  ctx.closePath()
  ctx.fillStyle = '#E84057'
  ctx.fill()
}

function spin() {
  if (spinning.value || props.items.length < 2) return
  spinning.value = true
  winner.value = null

  const extra = 360 * 5 + Math.random() * 360
  const target = rotation.value + extra
  const duration = 4000
  const start = performance.now()
  const from = rotation.value

  function animate(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    rotation.value = from + (target - from) * ease
    draw()

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      spinning.value = false
      const sliceAngle = 360 / props.items.length
      const normalized = ((360 - (rotation.value % 360)) + 360) % 360
      const idx = Math.floor(normalized / sliceAngle) % props.items.length
      winner.value = props.items[idx] ?? null
      if (winner.value) emit('result', winner.value)
    }
  }

  requestAnimationFrame(animate)
}

onMounted(draw)
</script>

<template>
  <div class="spin-wheel">
    <canvas ref="canvas" width="300" height="300" class="wheel-canvas" />
    <div v-if="winner" class="winner-text">{{ winner }}</div>
    <NButton type="primary" class="spin-btn" :disabled="spinning" @click="spin">
      {{ spinning ? '돌아가는 중...' : '돌리기!' }}
    </NButton>
  </div>
</template>

<style scoped>
.spin-wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.wheel-canvas {
  max-width: 100%;
}

.winner-text {
  font-size: 20px;
  font-weight: 700;
  color: #E84057;
}

.spin-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  width: 200px;
  height: 44px;
}
</style>
