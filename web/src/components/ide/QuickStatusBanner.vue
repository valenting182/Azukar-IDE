<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  busyCompile: boolean
  usbAction: string | null
  checking: boolean
  progressLabel: string
  progressPct: number
  lastSuccessMessage: string | null
  lastErrorMessage: string | null
}>()

const emit = defineEmits<{
  'dismiss-success': []
  'dismiss-error': []
  'view-problems': []
}>()

const { t } = useI18n()

const isActive = computed(() => {
  return props.busyCompile || props.usbAction != null || props.checking
})

const activeLabel = computed(() => {
  if (props.checking) return t('fpga.checkingSyntax')
  if (props.busyCompile) return t('fpga.compiling')
  if (props.usbAction) return props.progressLabel || t('fpga.flashing')
  return ''
})
</script>

<template>
  <div v-if="isActive || lastSuccessMessage || lastErrorMessage" class="shrink-0 px-4 py-1.5 transition-all">
    <!-- Estado Activo (Progreso) -->
    <div
      v-if="isActive"
      class="flex flex-col gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-fg shadow-xs"
    >
      <div class="flex items-center justify-between font-semibold">
        <div class="flex items-center gap-2 text-primary">
          <svg class="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
          </svg>
          <span>{{ activeLabel }}</span>
        </div>
        <span v-if="progressPct > 0" class="font-mono text-muted">{{ progressPct }}%</span>
      </div>
      <div v-if="progressPct > 0" class="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          class="h-full bg-primary transition-[width] duration-100 ease-out"
          :style="{ width: `${progressPct}%` }"
        />
      </div>
    </div>

    <!-- Mensaje de Éxito -->
    <div
      v-else-if="lastSuccessMessage"
      class="flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success shadow-xs"
    >
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm-1 15-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9z" />
        </svg>
        <span class="font-medium text-fg">{{ lastSuccessMessage }}</span>
      </div>
      <button
        type="button"
        class="cursor-pointer text-muted hover:text-fg px-1"
        @click="emit('dismiss-success')"
      >
        ✕
      </button>
    </div>

    <!-- Mensaje de Error -->
    <div
      v-else-if="lastErrorMessage"
      class="flex items-center justify-between rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error shadow-xs"
    >
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z" />
        </svg>
        <span class="font-medium text-fg break-all">{{ lastErrorMessage }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded bg-surface px-2 py-0.5 font-semibold text-fg border border-border hover:bg-surface-2 cursor-pointer"
          @click="emit('view-problems')"
        >
          {{ t('ide.problemsTab') }}
        </button>
        <button
          type="button"
          class="cursor-pointer text-muted hover:text-fg px-1"
          @click="emit('dismiss-error')"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>
