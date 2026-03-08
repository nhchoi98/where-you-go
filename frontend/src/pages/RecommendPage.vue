<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NSelect, NInput, NCard, NSpin, useMessage } from 'naive-ui'
import { recommendApi } from '../api/recommend'
import type { RecommendResult } from '../api/recommend'
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

const message = useMessage()

const category = ref<string | null>(null)
const location = ref('')
const loading = ref(false)
const result = ref<RecommendResult | null>(null)

const categoryOptions = [
  { label: '전시회', value: 'exhibition' },
  { label: '미식 행사', value: 'food_event' },
  { label: '코엑스 행사', value: 'coex' },
  { label: '축제/문화 행사', value: 'festival' },
  { label: '팝업스토어', value: 'popup' },
]

async function handleRecommend() {
  if (!category.value) {
    message.warning('카테고리를 선택해주세요')
    return
  }

  loading.value = true
  result.value = null
  try {
    result.value = await recommendApi.getEvents(category.value, location.value.trim() || undefined)
  } catch {
    message.error('추천에 실패했습니다')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="recommend-page">
    <h2 class="page-title">행사 추천</h2>
    <p class="page-desc">전시회, 미식 행사, 팝업스토어 등 다양한 행사를 추천받아보세요</p>

    <NCard class="form-card" :bordered="false">
      <div class="form-row">
        <label class="form-label">카테고리</label>
        <NSelect
          v-model:value="category"
          :options="categoryOptions"
          placeholder="어떤 행사를 찾으시나요?"
        />
      </div>

      <div class="form-row">
        <label class="form-label">지역 (선택)</label>
        <NInput v-model:value="location" placeholder="예: 홍대, 강남, 성수" />
      </div>

      <NButton
        type="primary"
        block
        :loading="loading"
        class="recommend-btn"
        @click="handleRecommend"
      >
        {{ loading ? '행사 검색 중...' : '추천받기' }}
      </NButton>
    </NCard>

    <NSpin :show="loading">
      <NCard v-if="result" class="result-card" :bordered="false">
        <h3 class="result-title">추천 행사</h3>
        <div class="md-content" v-html="renderMd(result.result)" />
      </NCard>
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

.recommend-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
}

.result-card {
  border-radius: 16px;
  border: 2px solid #FFD6D6;
}

.result-title {
  font-size: 18px;
  font-weight: 700;
  color: #E84057;
  margin: 0 0 12px;
}

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
