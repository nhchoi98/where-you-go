<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NSelect, NIcon, NSpin } from 'naive-ui'
import { Close, Send } from '@vicons/ionicons5'
import { useTaskStore } from '../stores/task'
import { aiApi } from '../api/ai'
import type { AiOptionItem } from '../types/ai'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ linkify: true })
md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  tokens[idx]!.attrSet('target', '_blank')
  tokens[idx]!.attrSet('rel', 'noopener noreferrer')
  return self.renderToken(tokens, idx, options)
}

function renderMd(text: string) {
  return DOMPurify.sanitize(md.render(text), {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'hr', 'code', 'pre', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

const props = defineProps<{
  spaceId: string
  isMobile: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const selectedTaskId = ref<string | null>(null)
const options = ref<AiOptionItem[]>([])
const detailResult = ref<string | null>(null)
const selectedOption = ref<AiOptionItem | null>(null)
const optionsLoading = ref(false)
const detailLoading = ref(false)
const error = ref<string | null>(null)

const taskOptions = computed(() =>
  taskStore.tasks.map((t) => ({
    label: `${t.title}${t.placeName ? ` (${t.placeName})` : ''}`,
    value: t.id,
  })),
)

onMounted(() => {
  taskStore.fetchTasks(props.spaceId)
})

async function handleSuggest() {
  if (!selectedTaskId.value) return
  optionsLoading.value = true
  options.value = []
  selectedOption.value = null
  detailResult.value = null
  error.value = null
  try {
    const res = await aiApi.suggest(props.spaceId, {
      anchorTaskId: selectedTaskId.value,
    })
    options.value = res.options
  } catch {
    error.value = 'AI 추천에 실패했습니다'
  } finally {
    optionsLoading.value = false
  }
}

async function handleSelectOption(option: AiOptionItem) {
  if (!selectedTaskId.value) return
  selectedOption.value = option
  detailLoading.value = true
  detailResult.value = null
  error.value = null
  try {
    const res = await aiApi.detail(props.spaceId, {
      anchorTaskId: selectedTaskId.value,
      selectedKey: option.key,
      selectedSummary: option.summary,
    })
    detailResult.value = res.detail
  } catch {
    error.value = '상세 코스 생성에 실패했습니다'
  } finally {
    detailLoading.value = false
  }
}

function handleReset() {
  options.value = []
  selectedOption.value = null
  detailResult.value = null
  error.value = null
}
</script>

<template>
  <div class="panel-overlay" @click.self="emit('close')">
    <div class="ai-panel" :class="{ mobile: isMobile }">
      <div class="panel-header">
        <h3 class="panel-title">AI 코스 추천</h3>
        <button class="close-btn" @click="emit('close')">
          <NIcon :size="20" :component="Close" />
        </button>
      </div>

      <div class="panel-body">
        <!-- Task selector -->
        <div class="input-section">
          <NSelect
            v-model:value="selectedTaskId"
            :options="taskOptions"
            placeholder="기준 태스크 선택"
            filterable
            size="small"
          />
          <NButton
            type="primary"
            size="small"
            :loading="optionsLoading"
            :disabled="!selectedTaskId || optionsLoading || detailLoading"
            @click="handleSuggest"
          >
            <template #icon><NIcon :component="Send" /></template>
            추천받기
          </NButton>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-msg">{{ error }}</div>

        <!-- Options -->
        <NSpin :show="optionsLoading" size="small">
          <div v-if="options.length && !detailResult" class="options-list">
            <div
              v-for="option in options"
              :key="option.key"
              class="option-bubble"
              :class="{ selected: selectedOption?.key === option.key }"
              @click="handleSelectOption(option)"
            >
              <div class="option-label">{{ option.label }}</div>
              <div class="wyg-markdown option-summary" v-html="renderMd(option.summary)" />
            </div>
          </div>
        </NSpin>

        <!-- Detail result -->
        <NSpin :show="detailLoading" size="small">
          <div v-if="detailResult" class="detail-section">
            <div class="detail-header-row">
              <span class="detail-label">{{ selectedOption?.label }}</span>
              <NButton text size="tiny" @click="handleReset">다시 선택</NButton>
            </div>
            <div class="wyg-markdown detail-content" v-html="renderMd(detailResult)" />
          </div>
        </NSpin>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--wyg-z-modal);
  background: var(--wyg-bg-overlay);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}

.ai-panel {
  background: var(--wyg-bg-card);
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  width: 400px;
  border-radius: var(--wyg-radius-lg) var(--wyg-radius-lg) 0 0;
  box-shadow: var(--wyg-shadow-lg);
}

.ai-panel.mobile {
  width: 100%;
  max-height: 70vh;
  border-radius: var(--wyg-radius-xl) var(--wyg-radius-xl) 0 0;
}

@media (min-width: 1024px) {
  .panel-overlay {
    align-items: stretch;
  }

  .ai-panel {
    max-height: 100vh;
    height: 100%;
    border-radius: 0;
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--wyg-space-4) var(--wyg-space-5);
  border-bottom: 1px solid var(--wyg-border-light);
  flex-shrink: 0;
}

.panel-title {
  font-size: var(--wyg-font-lg);
  font-weight: 600;
  color: var(--wyg-text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--wyg-text-secondary);
  padding: var(--wyg-space-1);
  border-radius: var(--wyg-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--wyg-transition-fast);
}

.close-btn:hover {
  background: var(--wyg-primary-light);
  color: var(--wyg-primary);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--wyg-space-4) var(--wyg-space-5);
}

.input-section {
  display: flex;
  gap: var(--wyg-space-2);
  margin-bottom: var(--wyg-space-4);
}

.input-section :deep(.n-select) {
  flex: 1;
}

.error-msg {
  font-size: var(--wyg-font-sm);
  color: var(--wyg-error);
  margin-bottom: var(--wyg-space-3);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--wyg-space-3);
}

.option-bubble {
  padding: var(--wyg-space-3) var(--wyg-space-4);
  border: 1px solid var(--wyg-border);
  border-radius: var(--wyg-radius-md);
  cursor: pointer;
  transition: border-color var(--wyg-transition-fast), background var(--wyg-transition-fast);
}

.option-bubble:hover {
  border-color: var(--wyg-primary);
  background: var(--wyg-primary-light);
}

.option-bubble.selected {
  border-color: var(--wyg-primary);
  background: var(--wyg-primary-light);
}

.option-label {
  font-size: var(--wyg-font-md);
  font-weight: 600;
  color: var(--wyg-text-accent);
  margin-bottom: var(--wyg-space-2);
}

.option-summary {
  font-size: var(--wyg-font-sm);
}

.detail-section {
  margin-top: var(--wyg-space-3);
}

.detail-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wyg-space-3);
}

.detail-label {
  font-size: var(--wyg-font-md);
  font-weight: 600;
  color: var(--wyg-text-accent);
}

.detail-content {
  padding: var(--wyg-space-3);
  background: var(--wyg-bg-warm);
  border-radius: var(--wyg-radius-md);
}
</style>
