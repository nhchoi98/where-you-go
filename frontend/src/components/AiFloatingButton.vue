<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NIcon } from 'naive-ui'
import { Sparkles } from '@vicons/ionicons5'
import AiChatPanel from './AiChatPanel.vue'

const props = defineProps<{
  spaceId: string
  isMobile: boolean
}>()

const showPanel = ref(false)
const showPulse = ref(true)

function toggle() {
  showPanel.value = !showPanel.value
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    toggle()
  }
  if (e.key === 'Escape' && showPanel.value) {
    showPanel.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  setTimeout(() => { showPulse.value = false }, 4500)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="ai-fab-container">
    <button
      class="ai-fab"
      :class="{ 'fab-pulse': showPulse, 'is-open': showPanel }"
      @click="toggle"
    >
      <NIcon :size="24" :component="Sparkles" />
    </button>

    <Teleport to="body">
      <Transition :name="isMobile ? 'slide-up' : 'slide-right'">
        <AiChatPanel
          v-if="showPanel"
          :space-id="spaceId"
          :is-mobile="isMobile"
          @close="showPanel = false"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.ai-fab-container {
  position: fixed;
  z-index: var(--wyg-z-fab);
  right: var(--wyg-space-5);
  bottom: calc(var(--wyg-bottomnav-height) + var(--wyg-space-4));
}

@media (min-width: 1024px) {
  .ai-fab-container {
    bottom: var(--wyg-space-6);
    right: var(--wyg-space-6);
  }
}

.ai-fab {
  width: 56px;
  height: 56px;
  border-radius: var(--wyg-radius-full);
  background: var(--wyg-primary);
  color: var(--wyg-text-inverse);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(232, 64, 87, 0.3);
  transition: transform var(--wyg-transition-fast), background var(--wyg-transition-fast);
}

.ai-fab:hover {
  background: var(--wyg-primary-hover);
  transform: scale(1.05);
}

.ai-fab:active {
  transform: scale(0.95);
}

.ai-fab.is-open {
  background: var(--wyg-primary-pressed);
}

@media (min-width: 1024px) {
  .ai-fab {
    width: 48px;
    height: 48px;
  }
}
</style>
