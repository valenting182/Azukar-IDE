<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VerilogEditor from '@/components/VerilogEditor.vue'
import type { EditorMark } from '@/lib/editorExtensions'
import { isPcfFilename } from '@/fpga/files'

export type FpgaFile = {
  name: string
  content: string
  open: boolean
}

const props = defineProps<{
  files: FpgaFile[]
  activeName: string
  fontSize: number
  marks: EditorMark[]
  lineCountLabel: string
}>()

const emit = defineEmits<{
  'update:activeName': [name: string]
  'update-content': [name: string, content: string]
  'open-file': [name: string]
  'close-tab': [name: string]
  'add-file': []
  'save': []
  'bump-font': [delta: number]
}>()

const { t } = useI18n()

// Split view state
const isSplit = ref(false)
const secondaryName = ref<string>('')

// Ensure secondaryName picks a useful other file when split is enabled
watch(isSplit, (split) => {
  if (split) {
    if (!secondaryName.value || secondaryName.value === props.activeName) {
      const other = props.files.find((f) => f.name !== props.activeName)
      secondaryName.value = other ? other.name : props.activeName
    }
  }
})

// If secondary file is deleted, pick another
watch(
  () => props.files,
  (currentFiles) => {
    if (isSplit.value && !currentFiles.some((f) => f.name === secondaryName.value)) {
      const other = currentFiles.find((f) => f.name !== props.activeName)
      secondaryName.value = other ? other.name : props.activeName
    }
  },
  { deep: true },
)

const openTabs = computed(() => props.files.filter((f) => f.open))
const primaryFile = computed(() => props.files.find((f) => f.name === props.activeName))
const secondaryFile = computed(() => props.files.find((f) => f.name === secondaryName.value))

function primaryLanguage(name: string): 'verilog' | 'pcf' {
  return isPcfFilename(name) ? 'pcf' : 'verilog'
}

function filterMarks(_name: string): EditorMark[] {
  // Pass marks only for this file
  return props.marks
}
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface">
    <!-- Barra de Pestañas Superior y Controles de Split -->
    <div class="flex shrink-0 items-center justify-between border-b border-border bg-surface-2 px-2 py-0">
      <!-- Pestañas del Editor Principal -->
      <div class="flex min-w-0 flex-1 items-stretch overflow-x-auto" role="tablist">
        <div
          v-for="f in openTabs"
          :key="f.name"
          role="tab"
          :aria-selected="f.name === activeName"
          class="group relative flex shrink-0 items-center border-t-2 px-3 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
          :class="
            f.name === activeName
              ? 'border-primary bg-surface text-fg'
              : 'border-transparent text-muted hover:bg-surface/60 hover:text-fg'
          "
          @click="emit('update:activeName', f.name)"
        >
          <span class="font-mono">{{ f.name }}</span>
          <button
            type="button"
            class="ml-2 text-muted hover:text-error opacity-60 group-hover:opacity-100 cursor-pointer"
            :title="t('fpga.closeTab')"
            @click.stop="emit('close-tab', f.name)"
          >
            ×
          </button>
        </div>

        <button
          type="button"
          class="my-1 ml-1 self-center rounded-sm border border-dashed border-primary/60 px-2 py-0.5 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer"
          :title="t('fpga.addFile')"
          @click="emit('add-file')"
        >
          +
        </button>
      </div>

      <!-- Acciones del Editor (Split View, Zoom fuente, Contador de líneas) -->
      <div class="ml-2 flex shrink-0 items-center gap-2 py-1 pr-1">
        <!-- Toggle Split-View -->
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors"
          :class="
            isSplit
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface text-muted hover:bg-surface-3 hover:text-fg'
          "
          :title="isSplit ? t('fpga.singleView') : t('fpga.splitView')"
          @click="isSplit = !isSplit"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
          <span class="hidden sm:inline">{{ isSplit ? t('fpga.singleView') : t('fpga.splitView') }}</span>
        </button>

        <span class="text-xs font-semibold text-fg">{{ lineCountLabel }}</span>

        <!-- Selector de Tamaño de Fuente -->
        <div class="flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5">
          <button
            type="button"
            class="cursor-pointer rounded px-1 py-0.5 text-xs text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30"
            :disabled="fontSize <= 10"
            :title="t('editor.fontSmaller')"
            @click="emit('bump-font', -1)"
          >
            A−
          </button>
          <span class="min-w-[1.75rem] text-center font-mono text-xs font-semibold text-fg">{{ fontSize }}</span>
          <button
            type="button"
            class="cursor-pointer rounded px-1 py-0.5 text-xs text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30"
            :disabled="fontSize >= 24"
            :title="t('editor.fontLarger')"
            @click="emit('bump-font', 1)"
          >
            A+
          </button>
        </div>
      </div>
    </div>

    <!-- Área de Editores: Single o Split Side-by-Side -->
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <!-- Editor Principal (Izquierda) -->
      <div
        class="flex min-h-0 flex-col overflow-hidden"
        :class="isSplit ? 'w-1/2 border-r border-border' : 'w-full'"
      >
        <div v-if="isSplit" class="flex items-center justify-between border-b border-border/70 bg-surface px-3 py-1 text-[0.6875rem] text-muted">
          <span class="font-mono font-bold text-fg">{{ activeName }}</span>
          <span class="uppercase tracking-widest text-[0.625rem]">Editor Principal</span>
        </div>
        <div class="min-h-0 flex-1 p-2">
          <VerilogEditor
            v-if="primaryFile"
            :key="activeName"
            :model-value="primaryFile.content"
            :font-size="fontSize"
            :language="primaryLanguage(activeName)"
            :marks="filterMarks(activeName)"
            height-class="h-full min-h-0"
            @update:model-value="emit('update-content', activeName, $event)"
            @save="emit('save')"
          />
          <p v-else class="p-4 text-xs text-muted">
            {{ t('fpga.noOpenTab') }}
          </p>
        </div>
      </div>

      <!-- Editor Secundario (Derecha - sólo en Split View) -->
      <div
        v-if="isSplit"
        class="flex min-h-0 w-1/2 flex-col overflow-hidden bg-surface"
      >
        <!-- Selector de archivo secundario -->
        <div class="flex items-center justify-between border-b border-border/70 bg-surface-2/60 px-3 py-1 text-xs">
          <div class="flex items-center gap-1.5 overflow-x-auto">
            <span class="text-[0.6875rem] font-bold uppercase tracking-wider text-muted">{{ t('fpga.secondaryFile') }}:</span>
            <select
              v-model="secondaryName"
              class="rounded border border-border bg-surface px-2 py-0.5 font-mono text-xs text-fg"
            >
              <option v-for="f in files" :key="f.name" :value="f.name">
                {{ f.name }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="text-muted hover:text-fg text-xs cursor-pointer px-1"
            :title="t('fpga.singleView')"
            @click="isSplit = false"
          >
            ✕
          </button>
        </div>
        <div class="min-h-0 flex-1 p-2">
          <VerilogEditor
            v-if="secondaryFile"
            :key="secondaryName"
            :model-value="secondaryFile.content"
            :font-size="fontSize"
            :language="primaryLanguage(secondaryName)"
            :marks="filterMarks(secondaryName)"
            height-class="h-full min-h-0"
            @update:model-value="emit('update-content', secondaryName, $event)"
            @save="emit('save')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
