<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCard } from 'naive-ui'

const props = defineProps<{ items: string[] }>()
const emit = defineEmits<{ result: [item: string] }>()

const item1 = ref('')
const item2 = ref('')
const choice1 = ref('')
const choice2 = ref('')
const winner = ref<string | null>(null)
const playing = ref(false)

const hands = ['✊', '✋', '✌️']

function pickTwo() {
  if (props.items.length < 2) return
  const shuffled = [...props.items].sort(() => Math.random() - 0.5)
  item1.value = shuffled[0] ?? ''
  item2.value = shuffled[1] ?? ''
  winner.value = null
  choice1.value = ''
  choice2.value = ''
}

function play() {
  playing.value = true
  winner.value = null

  let count = 0
  const interval = setInterval(() => {
    choice1.value = hands[Math.floor(Math.random() * 3)] ?? ''
    choice2.value = hands[Math.floor(Math.random() * 3)] ?? ''
    count++

    if (count > 15) {
      clearInterval(interval)
      // 최종 결정
      const idx1 = Math.floor(Math.random() * 3)
      const idx2 = Math.floor(Math.random() * 3)
      choice1.value = hands[idx1] ?? ''
      choice2.value = hands[idx2] ?? ''

      if (idx1 === idx2) {
        // 무승부 → 랜덤
        winner.value = Math.random() > 0.5 ? item1.value : item2.value
      } else if ((idx1 + 1) % 3 === idx2) {
        winner.value = item1.value
      } else {
        winner.value = item2.value
      }

      playing.value = false
      emit('result', winner.value)
    }
  }, 100)
}

pickTwo()
</script>

<template>
  <div class="rps-game">
    <div v-if="item1 && item2" class="arena">
      <NCard class="player-card">
        <div class="player-name">{{ item1 }}</div>
        <div class="hand">{{ choice1 || '?' }}</div>
      </NCard>

      <div class="vs">VS</div>

      <NCard class="player-card">
        <div class="player-name">{{ item2 }}</div>
        <div class="hand">{{ choice2 || '?' }}</div>
      </NCard>
    </div>

    <div v-if="winner" class="winner-announce">
      {{ winner }} 승리!
    </div>

    <div class="actions">
      <NButton @click="pickTwo" :disabled="playing">다시 뽑기</NButton>
      <NButton type="primary" class="play-btn" :disabled="playing || !item1" @click="play">
        {{ playing ? '가위바위보!' : '시작!' }}
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.rps-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.arena {
  display: flex;
  align-items: center;
  gap: 16px;
}

.player-card {
  border-radius: 16px;
  border: 1px solid #FFD6D6;
  text-align: center;
  min-width: 100px;
}

.player-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.hand {
  font-size: 48px;
  line-height: 1;
}

.vs {
  font-size: 20px;
  font-weight: 700;
  color: #E84057;
}

.winner-announce {
  font-size: 22px;
  font-weight: 700;
  color: #E84057;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.actions {
  display: flex;
  gap: 12px;
}

.play-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
}
</style>
