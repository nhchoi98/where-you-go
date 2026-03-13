<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NSelect, NDatePicker, NCard, NSpin, useMessage } from 'naive-ui'
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

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const route = useRoute()
const message = useMessage()
const taskStore = useTaskStore()

const spaceId = computed(() => route.params.id as string)
const selectedTaskId = ref<string | null>(null)
const dateRange = ref<[number, number] | null>(null)

const optionsLoading = ref(false)
const options = ref<AiOptionItem[]>([])

const selectedOption = ref<AiOptionItem | null>(null)
const detailLoading = ref(false)
const detailResult = ref<string | null>(null)

const taskOptions = computed(() =>
  taskStore.tasks.map((t) => ({
    label: `${t.title}${t.placeName ? ` (${t.placeName})` : ''} ${'★'.repeat(t.priority)}`,
    value: t.id,
  })),
)

const dateRangeStr = computed(() => {
  if (!dateRange.value) return undefined
  return `${formatDate(dateRange.value[0])} ~ ${formatDate(dateRange.value[1])}`
})

onMounted(() => {
  taskStore.fetchTasks(spaceId.value)
})

async function handleSuggest() {
  if (!selectedTaskId.value) {
    message.warning('기준 태스크를 선택해주세요')
    return
  }

  optionsLoading.value = true
  options.value = []
  selectedOption.value = null
  detailResult.value = null
  try {
    const res = await aiApi.suggest(spaceId.value, {
      anchorTaskId: selectedTaskId.value,
      dateRange: dateRangeStr.value,
    })
    options.value = res.options
  } catch {
    message.error('AI 추천에 실패했습니다')
  } finally {
    optionsLoading.value = false
  }
}

async function handleSelectOption(option: AiOptionItem) {
  if (!selectedTaskId.value) return

  selectedOption.value = option
  detailLoading.value = true
  detailResult.value = null
  try {
    const res = await aiApi.detail(spaceId.value, {
      anchorTaskId: selectedTaskId.value,
      dateRange: dateRangeStr.value,
      selectedKey: option.key,
      selectedSummary: option.summary,
    })
    detailResult.value = res.detail
  } catch {
    message.error('상세 코스 생성에 실패했습니다')
  } finally {
    detailLoading.value = false
  }
}

function handleReset() {
  options.value = []
  selectedOption.value = null
  detailResult.value = null
}
</script>

<template>
  <div class="ai-suggest-page">
    <h2 class="wyg-page-title">AI 코스 추천</h2>
    <p class="wyg-page-desc">AI가 2개의 코스를 제안합니다. 마음에 드는 걸 선택하면 상세 일정을 만들어줘요</p>

    <!-- Step 0: Input -->
    <NCard class="wyg-form-card" :bordered="false">
      <div class="wyg-form-row">
        <label class="wyg-form-label">기준 태스크</label>
        <NSelect
          v-model:value="selectedTaskId"
          :options="taskOptions"
          placeholder="꼭 가야 하는 곳을 선택"
          filterable
        />
      </div>

      <div class="wyg-form-row">
        <label class="wyg-form-label">기간 (선택)</label>
        <NDatePicker
          v-model:value="dateRange"
          type="daterange"
          clearable
          style="width: 100%;"
        />
      </div>

      <NButton
        type="primary"
        block
        size="large"
        :loading="optionsLoading"
        :disabled="optionsLoading || detailLoading"
        @click="handleSuggest"
      >
        {{ optionsLoading ? 'AI가 2개 플랜을 준비 중...' : 'AI에게 추천받기' }}
      </NButton>
    </NCard>

    <!-- Step 1: Options as chat bubbles -->
    <NSpin :show="optionsLoading">
      <div v-if="options.length && !detailResult" class="chat-section">
        <div class="ai-message">
          <div class="ai-avatar">AI</div>
          <div class="ai-bubble">
            <p class="bubble-intro">두 가지 코스를 준비했어요!</p>
          </div>
        </div>

        <div
          v-for="option in options"
          :key="option.key"
          class="ai-message"
        >
          <div class="ai-avatar">AI</div>
          <div
            class="ai-bubble option-bubble"
            :class="{ selected: selectedOption?.key === option.key }"
            @click="handleSelectOption(option)"
          >
            <div class="option-label">{{ option.label }}</div>
            <div class="wyg-markdown" v-html="renderMd(option.summary)" />
            <NButton
              type="primary"
              size="small"
              :loading="detailLoading && selectedOption?.key === option.key"
              @click.stop="handleSelectOption(option)"
            >
              {{ detailLoading && selectedOption?.key === option.key ? '상세 일정 생성 중...' : '이 코스로 결정' }}
            </NButton>
          </div>
        </div>
      </div>
    </NSpin>

    <!-- Step 2: Detail result -->
    <NSpin :show="detailLoading">
      <div v-if="detailResult" class="chat-section">
        <div class="ai-message">
          <div class="ai-avatar">AI</div>
          <div class="ai-bubble detail-bubble">
            <div class="detail-header-row">
              <span class="detail-label">{{ selectedOption?.label }} 상세 코스</span>
              <NButton text size="small" @click="handleReset">다시 선택하기</NButton>
            </div>
            <div class="wyg-markdown" v-html="renderMd(detailResult)" />
          </div>
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.chat-section {
  display: flex;
  flex-direction: column;
  gap: var(--wyg-space-4);
  margin-top: var(--wyg-space-5);
}

.ai-message {
  display: flex;
  gap: var(--wyg-space-3);
  align-items: flex-start;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--wyg-radius-full);
  background: var(--wyg-primary);
  color: var(--wyg-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--wyg-font-xs);
  font-weight: 700;
  flex-shrink: 0;
}

.ai-bubble {
  background: var(--wyg-bg-card);
  border: 1px solid var(--wyg-border);
  border-radius: var(--wyg-radius-md) var(--wyg-radius-lg) var(--wyg-radius-lg) var(--wyg-radius-lg);
  padding: var(--wyg-space-3) var(--wyg-space-4);
  max-width: 85%;
}

.bubble-intro {
  font-size: var(--wyg-font-md);
  color: var(--wyg-text-primary);
  margin: 0;
}

.option-bubble {
  cursor: pointer;
  transition: border-color var(--wyg-transition-fast), background var(--wyg-transition-fast);
}

.option-bubble:hover {
  border-color: var(--wyg-primary);
}

.option-bubble.selected {
  border-color: var(--wyg-primary);
  background: var(--wyg-primary-light);
}

.option-label {
  font-size: var(--wyg-font-lg);
  font-weight: 700;
  color: var(--wyg-text-accent);
  margin-bottom: var(--wyg-space-3);
}

.detail-bubble {
  background: var(--wyg-bg-warm);
  border-color: var(--wyg-primary);
}

.detail-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--wyg-space-3);
}

.detail-label {
  font-size: var(--wyg-font-lg);
  font-weight: 700;
  color: var(--wyg-text-accent);
}
</style>
