<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BoardProfile } from '@/fpga/boardTypes'
import BoardSelector from '@/components/BoardSelector.vue'
import PaletteSelector from '@/components/PaletteSelector.vue'

const props = defineProps<{
  boardId: string
  listedBoards: BoardProfile[]
  customBoards: BoardProfile[]
  boardConnected: boolean
  usbBusy: boolean
  busyCompile: boolean
  checking: boolean
  activeAction: string | null
  hasBitstream: boolean
  isDark: boolean
  locale: string
  lineCountLabel?: string
}>()

const emit = defineEmits<{
  'select-board': [id: string]
  'board-help': [id: string]
  'open-custom-board': []
  'check-syntax': []
  'upload-board': []
  'cancel-compile': []
  'flash-bin-file': []
  'open-advanced': []
  'reset-board': []
  'disconnect-board': []
  'connect-board': []
  'toggle-theme': []
  'set-locale': [loc: 'es' | 'en']
  'open-help': []
}>()

const { t } = useI18n()

const isUploading = computed(() => {
  return props.busyCompile || props.activeAction === 'program' || props.activeAction === 'compile'
})
</script>

<template>
  <header
    class="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-2 text-fg shadow-xs max-md:flex-col max-md:items-stretch max-md:gap-2 max-md:px-3"
  >
    <!-- Logo e Info de Proyecto -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <img src="/favicon.svg" alt="Azukar" class="h-7 w-7" width="28" height="28">
        <div class="flex flex-col">
          <span class="text-sm font-bold tracking-tight text-fg leading-none">
            {{ t('app.title') }}
          </span>
          <span class="text-[0.6875rem] font-medium text-muted">
            Lattice iCE40 Web IDE & Flasher
          </span>
        </div>
      </div>

      <!-- Selector de Placa -->
      <div class="ml-2 hidden h-5 w-px bg-border sm:block" />
      <div class="flex items-center gap-1.5">
        <BoardSelector
          :model-value="boardId"
          :listed="listedBoards"
          :customs="customBoards"
          @update:model-value="emit('select-board', $event)"
          @help="emit('board-help', $event)"
          @custom="emit('open-custom-board')"
        />
      </div>

      <!-- Badge de Estado de Conexión WebUSB -->
      <div
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
        :class="
          boardConnected
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-border bg-surface-2/60 text-muted'
        "
        :title="boardConnected ? t('fpga.boardConnectedHint') : t('fpga.boardDisconnectedHint')"
      >
        <span
          class="h-2 w-2 rounded-full"
          :class="boardConnected ? 'bg-success animate-pulse' : 'bg-muted/60'"
        />
        <span class="text-[0.75rem]">
          {{ boardConnected ? t('fpga.boardConnected') : t('fpga.boardDisconnected') }}
        </span>
        <button
          v-if="boardConnected"
          type="button"
          class="ml-1 text-[0.6875rem] font-semibold text-muted hover:text-fg underline cursor-pointer"
          :title="t('fpga.resetHint')"
          :disabled="usbBusy"
          @click="emit('reset-board')"
        >
          Reset
        </button>
        <button
          v-if="boardConnected"
          type="button"
          class="ml-1 text-[0.6875rem] text-muted hover:text-error cursor-pointer"
          :title="t('fpga.disconnectProgrammerHint')"
          :disabled="usbBusy"
          @click="emit('disconnect-board')"
        >
          ×
        </button>
        <button
          v-else
          type="button"
          class="ml-1 text-[0.6875rem] font-semibold text-primary hover:underline cursor-pointer"
          :title="t('fpga.connectProgrammerHint')"
          :disabled="usbBusy"
          @click="emit('connect-board')"
        >
          {{ t('fpga.connectProgrammer') }}
        </button>
      </div>
    </div>

    <!-- Centro / Acciones Principales Simplificadas -->
    <div class="flex items-center gap-2 max-md:justify-between">
      <!-- Botón 1: Verificar Sintaxis -->
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-3 hover:text-primary disabled:opacity-40"
        :disabled="checking || busyCompile || usbBusy"
        :title="t('fpga.checkSyntaxHint')"
        @click="emit('check-syntax')"
      >
        <svg
          class="h-4 w-4"
          :class="checking ? 'animate-spin text-primary' : 'text-primary'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-if="!checking" d="M20 6L9 17l-5-5" />
          <path v-else d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span>{{ checking ? t('fpga.checkingSyntax') : t('fpga.checkSyntax') }}</span>
      </button>

      <!-- Botón 2 (PROMINENTE): Cargar a la placa (Upload / Flash) -->
      <button
        v-if="!busyCompile"
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-contrast shadow-sm transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
        :disabled="usbBusy || checking"
        :title="t('fpga.uploadToBoardHint')"
        @click="emit('upload-board')"
      >
        <svg
          v-if="!isUploading"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L4.5 9h4.5v8h6V9h4.5L12 2zM4 19h16v2H4v-2z" />
        </svg>
        <svg
          v-else
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
        <span>{{ isUploading ? t('fpga.uploadingToBoard') : t('fpga.uploadToBoard') }}</span>
      </button>
      <button
        v-else
        type="button"
        class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-error bg-error/10 px-3.5 py-1.5 text-xs font-bold text-error transition-colors hover:bg-error/20"
        :title="t('ide.cancelHint')"
        @click="emit('cancel-compile')"
      >
        <span class="h-2 w-2 rounded-full bg-error animate-ping" />
        <span>{{ t('fpga.compilingCancel') }}</span>
      </button>

      <!-- Botón 3: Cargar .bin externo directamente -->
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
        :disabled="usbBusy"
        :title="t('fpga.flashBinDirectHint')"
        @click="emit('flash-bin-file')"
      >
        <svg class="h-3.5 w-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span class="hidden sm:inline">{{ t('fpga.flashBinDirect') }}</span>
      </button>
    </div>

    <!-- Controles de Navegación, Avanzado, Idioma y Tema -->
    <div class="flex items-center gap-2 max-md:justify-end">
      <!-- Botón de Herramientas Avanzadas -->
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        :title="t('fpga.advancedToolsTitle')"
        @click="emit('open-advanced')"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>{{ t('fpga.advancedTools') }}</span>
      </button>

      <!-- Idioma ES / EN -->
      <div
        class="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-2/60 p-0.5"
        role="group"
        :aria-label="t('app.localeGroup')"
      >
        <button
          type="button"
          class="cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-semibold transition-colors"
          :class="locale === 'es' ? 'bg-surface text-fg shadow-xs' : 'text-muted hover:text-fg'"
          @click="emit('set-locale', 'es')"
        >
          ES
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-semibold transition-colors"
          :class="locale === 'en' ? 'bg-surface text-fg shadow-xs' : 'text-muted hover:text-fg'"
          @click="emit('set-locale', 'en')"
        >
          EN
        </button>
      </div>

      <!-- Paleta -->
      <PaletteSelector />

      <!-- Tema Claro / Oscuro -->
      <button
        type="button"
        class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        :title="isDark ? t('app.themeLight') : t('app.themeDark')"
        @click="emit('toggle-theme')"
      >
        <svg v-if="!isDark" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm10-8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zM4 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm14.95 6.364a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM6.464 5.05a1 1 0 0 1 0 1.414l-.707.707A1 1 0 0 1 4.343 5.757l.707-.707a1 1 0 0 1 1.414 0zm12.728 0a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414zM6.464 18.95a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414z" />
        </svg>
      </button>

      <!-- Ayuda -->
      <button
        type="button"
        class="inline-flex h-8 cursor-pointer items-center rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        @click="emit('open-help')"
      >
        {{ t('app.help') }}
      </button>
    </div>
  </header>
</template>
