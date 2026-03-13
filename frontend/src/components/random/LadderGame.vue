<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton } from 'naive-ui'
import { ladderColors, palette } from '../../theme/palette'

const props = defineProps<{ items: string[]; players: string[] }>()
const emit = defineEmits<{ result: [mapping: Record<string, string>] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const running = ref(false)
const resultMap = ref<Record<string, string>>({})

function generateLadder() {
  const cols = props.players.length
  const rows = 8
  const bridges: boolean[][] = []

  for (let r = 0; r < rows; r++) {
    const row: boolean[] = []
    for (let c = 0; c < cols - 1; c++) {
      row.push(Math.random() > 0.5)
    }
    bridges.push(row)
  }
  return { cols, rows, bridges }
}

function drawAndRun() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const { cols, rows, bridges } = generateLadder()

  const w = el.width
  const h = el.height
  const colW = w / (cols + 1)
  const rowH = (h - 100) / (rows + 1)
  const topY = 50
  const botY = h - 50

  ctx.clearRect(0, 0, w, h)

  // Player names (top)
  ctx.font = '13px Pretendard, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = ladderColors.playerText
  props.players.forEach((p, i) => {
    const label = p.length > 5 ? p.slice(0, 5) : p
    ctx.fillText(label, colW * (i + 1), topY - 10)
  })

  // Item names (bottom) — shuffled
  const shuffled = [...props.items].sort(() => Math.random() - 0.5)
  ctx.fillStyle = ladderColors.itemText
  shuffled.forEach((item, i) => {
    if (i < cols && item) {
      const lbl = item.length > 5 ? item.slice(0, 5) : item
      ctx.fillText(lbl, colW * (i + 1), botY + 20)
    }
  })

  // Vertical lines
  ctx.strokeStyle = ladderColors.vertical
  ctx.lineWidth = 2
  for (let c = 0; c < cols; c++) {
    ctx.beginPath()
    ctx.moveTo(colW * (c + 1), topY)
    ctx.lineTo(colW * (c + 1), botY)
    ctx.stroke()
  }

  // Horizontal bridges
  ctx.strokeStyle = ladderColors.bridge
  ctx.lineWidth = 2
  bridges.forEach((row, r) => {
    const y = topY + rowH * (r + 1)
    row.forEach((hasBridge, c) => {
      if (hasBridge) {
        ctx.beginPath()
        ctx.moveTo(colW * (c + 1), y)
        ctx.lineTo(colW * (c + 2), y)
        ctx.stroke()
      }
    })
  })

  // Path trace
  const mapping: Record<string, string> = {}
  props.players.forEach((player, startCol) => {
    let col = startCol
    for (let r = 0; r < rows; r++) {
      const row = bridges[r]
      if (!row) continue
      if (col > 0 && row[col - 1]) {
        col--
      } else if (col < cols - 1 && row[col]) {
        col++
      }
    }
    mapping[player] = shuffled[col] || '?'
  })

  resultMap.value = mapping
  emit('result', mapping)
}

function run() {
  running.value = true
  drawAndRun()
  setTimeout(() => { running.value = false }, 500)
}

onMounted(() => {
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')!
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    ctx.font = '14px Pretendard, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = palette.textTertiary
    ctx.fillText('시작 버튼을 눌러주세요', canvas.value.width / 2, canvas.value.height / 2)
  }
})
</script>

<template>
  <div class="ladder-game">
    <canvas ref="canvas" :width="Math.max(300, players.length * 80)" height="400" class="ladder-canvas" />

    <div v-if="Object.keys(resultMap).length" class="result-list">
      <div v-for="(item, player) in resultMap" :key="player" class="result-row">
        <span class="player-name">{{ player }}</span>
        <span class="arrow">→</span>
        <span class="item-name">{{ item }}</span>
      </div>
    </div>

    <NButton type="primary" size="large" class="run-btn" :disabled="running" @click="run">
      {{ running ? '실행 중...' : '사다리 타기!' }}
    </NButton>
  </div>
</template>

<style scoped>
.ladder-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wyg-space-4);
  padding: var(--wyg-space-4) 0;
}

.ladder-canvas {
  max-width: 100%;
  border-radius: var(--wyg-radius-md);
  background: var(--wyg-bg-card);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--wyg-space-2);
  width: 100%;
}

.result-row {
  display: flex;
  align-items: center;
  gap: var(--wyg-space-2);
  padding: var(--wyg-space-2) var(--wyg-space-3);
  background: var(--wyg-bg-warm);
  border-radius: var(--wyg-radius-sm);
  font-size: var(--wyg-font-base);
}

.player-name {
  font-weight: 600;
  color: var(--wyg-text-accent);
}

.arrow {
  color: var(--wyg-text-tertiary);
}

.item-name {
  font-weight: 500;
  color: var(--wyg-text-primary);
}

.run-btn {
  width: 200px;
}
</style>
