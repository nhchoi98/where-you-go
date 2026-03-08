<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NSpin, NEmpty } from 'naive-ui'
import { useJournalStore } from '../stores/journal'
import JournalCard from '../components/journal/JournalCard.vue'
import JournalFormModal from '../components/journal/JournalFormModal.vue'
import type { Journal } from '../types/journal'

const route = useRoute()
const journalStore = useJournalStore()

const spaceId = computed(() => route.params.id as string)
const showForm = ref(false)
const editingJournal = ref<Journal | null>(null)

onMounted(() => {
  journalStore.fetchJournals(spaceId.value)
})

function handleAdd() {
  editingJournal.value = null
  showForm.value = true
}

function handleEdit(journal: Journal) {
  editingJournal.value = journal
  showForm.value = true
}

async function handleDelete(journalId: string) {
  await journalStore.removeJournal(spaceId.value, journalId)
}

function handleSaved() {
  journalStore.fetchJournals(spaceId.value)
}
</script>

<template>
  <div class="journal-page">
    <div class="page-header">
      <h2 class="page-title">저널</h2>
      <NButton type="primary" class="add-btn" @click="handleAdd">
        + 새 저널
      </NButton>
    </div>

    <NSpin :show="journalStore.loading">
      <div v-if="journalStore.journals.length" class="journal-grid">
        <JournalCard
          v-for="journal in journalStore.journals"
          :key="journal.id"
          :journal="journal"
          @click="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <NEmpty v-else description="아직 저널이 없습니다" style="margin-top: 60px;">
        <template #extra>
          <NButton type="primary" class="add-btn" @click="handleAdd">
            첫 저널 만들기
          </NButton>
        </template>
      </NEmpty>
    </NSpin>

    <JournalFormModal
      v-model:show="showForm"
      :space-id="spaceId"
      :edit-journal="editingJournal"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.add-btn {
  background-color: #E84057;
  border-color: #E84057;
  border-radius: 12px;
}

.journal-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
