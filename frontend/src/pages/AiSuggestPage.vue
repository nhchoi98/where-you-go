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
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
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

// Step 1: 옵션
const optionsLoading = ref(false)
const options = ref<AiOptionItem[]>([])

// Step 2: 상세
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
    <h2 class="page-title">AI 코스 추천</h2>
    <p class="page-desc">AI가 2개의 코스를 제안합니다. 마음에 드는 걸 선택하면 상세 일정을 만들어줘요</p>

    <!-- Step 0: 입력 -->
    <NCard class="form-card" :bordered="false">
      <div class="form-row">
        <label class="form-label">기준 태스크</label>
        <NSelect
          v-model:value="selectedTaskId"
          :options="taskOptions"
          placeholder="꼭 가야 하는 곳을 선택"
          filterable
        />
      </div>

      <div class="form-row">
        <label class="form-label">기간 (선택)</label>
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
        :loading="optionsLoading"
        :disabled="optionsLoading || detailLoading"
        class="suggest-btn"
        @click="handleSuggest"
      >
        {{ optionsLoading ? 'AI가 2개 플랜을 준비 중...' : 'AI에게 추천받기' }}
      </NButton>
    </NCard>

    <!-- Step 1: 옵션 선택 -->
    <NSpin :show="optionsLoading">
      <div v-if="options.length && !detailResult" class="options-section">
        <h3 class="section-title">어떤 플랜이 마음에 드세요?</h3>
        <div class="options-grid">
          <NCard
            v-for="option in options"
            :key="option.key"
            class="option-card"
            :class="{ selected: selectedOption?.key === option.key }"
            :bordered="false"
            @click="handleSelectOption(option)"
          >
            <div class="option-label">{{ option.label }}</div>
            <div class="md-content" v-html="renderMd(option.summary)" />
            <NButton
              type="primary"
              size="small"
              class="select-btn"
              :loading="detailLoading && selectedOption?.key === option.key"
              @click.stop="handleSelectOption(option)"
            >
              {{ detailLoading && selectedOption?.key === option.key ? '상세 일정 생성 중...' : '이 코스로 결정' }}
            </NButton>
          </NCard>
        </div>
      </div>
    </NSpin>

    <!-- Step 2: 상세 결과 -->
    <NSpin :show="detailLoading">
      <div v-if="detailResult" class="detail-section">
        <div class="detail-header">
          <h3 class="section-title">{{ selectedOption?.label }} 상세 코스</h3>
          <NButton size="small" @click="handleReset">다시 선택하기</NButton>
        </div>
        <NCard class="detail-card" :bordered="false">
          <div class="md-content" v-html="renderMd(detailResult)" />
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px;
}

.page-desc {
  font-size: 14px;
  color: #888;
  margin: 0 0 20px;
}

.form-card {
  border-radius: 16px;
  margin-bottom: 20px;
  border: 1px solid #FFD6D6;
}

.form-row {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.suggest-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px;
}

/* Options */
.options-section {
  margin-top: 20px;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-card {
  border-radius: 16px;
  border: 2px solid #FFD6D6;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover {
  border-color: #E84057;
  box-shadow: 0 4px 16px rgba(232, 64, 87, 0.12);
}

.option-card.selected {
  border-color: #E84057;
  background: linear-gradient(135deg, #FFF5E4 0%, #fff 100%);
}

.option-label {
  font-size: 16px;
  font-weight: 700;
  color: #E84057;
  margin-bottom: 12px;
}

.select-btn {
  margin-top: 12px;
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 8px;
}

/* Detail */
.detail-section {
  margin-top: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-card {
  border-radius: 16px;
  border: 2px solid #E84057;
  background: linear-gradient(135deg, #FFF5E4 0%, #fff 100%);
}

/* Markdown */
.md-content {
  font-size: 14px;
  line-height: 1.8;
  color: #444;
}

.md-content :deep(h1),
.md-content :deep(h2),
.md-content :deep(h3) {
  color: #333;
  margin: 16px 0 8px;
  font-weight: 600;
}

.md-content :deep(h2) {
  font-size: 16px;
  color: #E84057;
}

.md-content :deep(h3) {
  font-size: 15px;
  color: #E84057;
}

.md-content :deep(ul),
.md-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.md-content :deep(li) {
  margin-bottom: 4px;
}

.md-content :deep(strong) {
  color: #333;
}

.md-content :deep(hr) {
  border: none;
  border-top: 1px solid #FFD6D6;
  margin: 16px 0;
}

.md-content :deep(p) {
  margin: 8px 0;
}

.md-content :deep(a) {
  color: #E84057;
  text-decoration: none;
}

.md-content :deep(a:hover) {
  text-decoration: underline;
}
</style>
