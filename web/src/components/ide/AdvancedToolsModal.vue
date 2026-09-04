<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ArtifactName } from '@/fpga/compileProtocol'

defineProps<{
  open: boolean
  usbBusy: boolean
  hasBitstream: boolean
  fsSupported: boolean
  folderName: string
  folderHandle: any
  offlineStatus: string
  offlineBytes: number | null
  artifacts: readonly ArtifactName[]
}>()

const emit = defineEmits<{
  'close': []
  'read-flash': [dest: 'bin' | 'hex' | 'console']
  'erase-flash': []
  'verify-flash': []
  'read-eeprom': [dest: 'bin' | 'hex' | 'console']
  'sram-compiled': []
  'sram-upload': []
  'open-pll': []
  'open-bram': []
  'open-hex-view': []
  'download-artifact': [name: ArtifactName]
  'share-project': []
  'open-folder': []
  'save-folder': []
  'close-folder': []
  'clear-offline': []
}>()

const { t } = useI18n()
const activeTab = ref<'flash' | 'sram' | 'eeprom' | 'tools' | 'files'>('flash')

function formatBytes(bytes: number | null): string {
  if (bytes == null) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    @click.self="emit('close')"
  >
    <div
      class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
    >
      <!-- Cabecera del Modal -->
      <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div class="flex items-center gap-2">
          <svg class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <h2 class="text-base font-bold text-fg">{{ t('fpga.advancedToolsTitle') }}</h2>
        </div>
        <button
          type="button"
          class="cursor-pointer rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-fg"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Navegación por Pestañas -->
      <div class="flex border-b border-border bg-surface-2 px-3 text-xs font-semibold">
        <button
          type="button"
          class="border-b-2 px-3 py-2.5 transition-colors cursor-pointer"
          :class="activeTab === 'flash' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted hover:text-fg'"
          @click="activeTab = 'flash'"
        >
          Flash SPI
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2.5 transition-colors cursor-pointer"
          :class="activeTab === 'sram' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted hover:text-fg'"
          @click="activeTab = 'sram'"
        >
          SRAM (Volátil)
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2.5 transition-colors cursor-pointer"
          :class="activeTab === 'eeprom' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted hover:text-fg'"
          @click="activeTab = 'eeprom'"
        >
          EEPROM FTDI
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2.5 transition-colors cursor-pointer"
          :class="activeTab === 'tools' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted hover:text-fg'"
          @click="activeTab = 'tools'"
        >
          Utilidades EDA
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2.5 transition-colors cursor-pointer"
          :class="activeTab === 'files' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted hover:text-fg'"
          @click="activeTab = 'files'"
        >
          Proyectos & Offline
        </button>
      </div>

      <!-- Contenido según Pestaña -->
      <div class="min-h-60 overflow-y-auto p-5 text-sm">
        <!-- Pestaña FLASH -->
        <div v-if="activeTab === 'flash'" class="space-y-4">
          <p class="text-xs text-muted">
            Operaciones directas sobre el chip de memoria Flash SPI de la FPGA conectada por WebUSB (Canal A).
          </p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-border p-3.5 bg-surface-2/40">
              <h3 class="font-bold text-xs uppercase tracking-wider text-muted mb-2">Lectura & Volcado</h3>
              <p class="text-xs text-muted mb-3">Lee el contenido físico grabado en el chip SPI Flash.</p>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
                  :disabled="usbBusy"
                  @click="emit('read-flash', 'bin')"
                >
                  {{ t('fpga.readDownloadBin') }}
                </button>
                <button
                  type="button"
                  class="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
                  :disabled="usbBusy"
                  @click="emit('read-flash', 'hex')"
                >
                  {{ t('fpga.readDownloadHex') }}
                </button>
                <button
                  type="button"
                  class="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
                  :disabled="usbBusy"
                  @click="emit('read-flash', 'console')"
                >
                  {{ t('fpga.readShowConsole') }}
                </button>
              </div>
            </div>

            <div class="rounded-lg border border-border p-3.5 bg-surface-2/40">
              <h3 class="font-bold text-xs uppercase tracking-wider text-muted mb-2">Mantenimiento</h3>
              <p class="text-xs text-muted mb-3">Verifica la integridad byte a byte o borra sectores enteros.</p>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
                  :disabled="usbBusy || !hasBitstream"
                  @click="emit('verify-flash')"
                >
                  {{ t('ide.verify') }}
                </button>
                <button
                  type="button"
                  class="rounded-md border border-error/50 bg-error/10 px-2.5 py-1 text-xs font-semibold text-error hover:bg-error/20 cursor-pointer disabled:opacity-40"
                  :disabled="usbBusy"
                  @click="emit('erase-flash')"
                >
                  {{ t('fpga.eraseFlash') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña SRAM -->
        <div v-if="activeTab === 'sram'" class="space-y-3">
          <p class="text-xs text-muted leading-relaxed">
            El grabado en <strong>SRAM (CRAM)</strong> es volátil y no desgasta la memoria Flash SPI (equivalente a <code>iceprog -S</code>).
            La FPGA arranca de inmediato con el diseño, pero al presionar Reset o desconectar la alimentación volverá a cargar lo que esté en la Flash.
          </p>
          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-3 cursor-pointer disabled:opacity-40"
              :disabled="usbBusy || !hasBitstream"
              @click="emit('sram-compiled')"
            >
              {{ t('fpga.sramCompiled') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
              :disabled="usbBusy"
              @click="emit('sram-upload')"
            >
              {{ t('fpga.sramUpload') }}
            </button>
          </div>
        </div>

        <!-- Pestaña EEPROM FTDI -->
        <div v-if="activeTab === 'eeprom'" class="space-y-3">
          <p class="text-xs text-muted leading-relaxed">
            Lee los 256 bytes de la <strong>EEPROM de configuración del chip FTDI FT2232H</strong> (identificadores USB, fabricante, número de serie y configuración de puertos). No es la memoria de la FPGA.
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
              :disabled="usbBusy"
              @click="emit('read-eeprom', 'bin')"
            >
              {{ t('fpga.readDownloadBin') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
              :disabled="usbBusy"
              @click="emit('read-eeprom', 'hex')"
            >
              {{ t('fpga.readDownloadHex') }}
            </button>
            <button
              type="button"
              class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
              :disabled="usbBusy"
              @click="emit('read-eeprom', 'console')"
            >
              {{ t('fpga.readShowConsole') }}
            </button>
          </div>
        </div>

        <!-- Pestaña UTILIDADES EDA -->
        <div v-if="activeTab === 'tools'" class="space-y-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-border p-3.5 bg-surface-2/40">
              <h3 class="font-bold text-xs uppercase tracking-wider text-muted mb-2">Generadores iCE40</h3>
              <div class="space-y-2">
                <button
                  type="button"
                  class="w-full text-left rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer"
                  @click="emit('open-pll')"
                >
                  📐 {{ t('tools.pll') }}
                  <span class="block text-[0.6875rem] font-normal text-muted mt-0.5">Calcula divisores y genera el módulo SB_PLL40_CORE en Verilog.</span>
                </button>
                <button
                  type="button"
                  class="w-full text-left rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer"
                  @click="emit('open-bram')"
                >
                  ⚡ {{ t('tools.icebram') }}
                  <span class="block text-[0.6875rem] font-normal text-muted mt-0.5">Reemplaza contenido de ROM/RAM sin re-sintetizar.</span>
                </button>
                <button
                  type="button"
                  class="w-full text-left rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer"
                  @click="emit('open-hex-view')"
                >
                  🔍 {{ t('tools.hexView') }}
                  <span class="block text-[0.6875rem] font-normal text-muted mt-0.5">Inspeccionar el bitstream actual en formato hexadecimal.</span>
                </button>
              </div>
            </div>

            <div class="rounded-lg border border-border p-3.5 bg-surface-2/40">
              <h3 class="font-bold text-xs uppercase tracking-wider text-muted mb-2">Artefactos de Compilación</h3>
              <p class="text-xs text-muted mb-2">Descarga los archivos intermedios generados por Yosys y nextpnr:</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="art in artifacts"
                  :key="art"
                  type="button"
                  class="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-mono text-fg hover:bg-surface-2 cursor-pointer disabled:opacity-40"
                  :disabled="!hasBitstream"
                  @click="emit('download-artifact', art)"
                >
                  {{ art }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña PROYECTOS & OFFLINE -->
        <div v-if="activeTab === 'files'" class="space-y-4">
          <div class="space-y-2">
            <h3 class="font-bold text-xs uppercase tracking-wider text-muted">Sincronización Local & Compartir</h3>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-3 cursor-pointer"
                @click="emit('share-project')"
              >
                🔗 {{ t('tools.share') }}
              </button>
              <button
                v-if="fsSupported"
                type="button"
                class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer"
                @click="emit('open-folder')"
              >
                📁 {{ t('tools.openFolder') }}
              </button>
              <button
                v-if="fsSupported && folderHandle"
                type="button"
                class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2 cursor-pointer"
                @click="emit('save-folder')"
              >
                💾 {{ folderName ? t('tools.saveFolderNamed', { name: folderName }) : t('tools.saveFolder') }}
              </button>
              <button
                v-if="fsSupported && folderHandle"
                type="button"
                class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted hover:text-error cursor-pointer"
                @click="emit('close-folder')"
              >
                ✕ {{ t('tools.closeFolder', { name: folderName }) }}
              </button>
            </div>
          </div>

          <div class="border-t border-border pt-4">
            <h3 class="font-bold text-xs uppercase tracking-wider text-muted mb-1">Caché Offline de WebAssembly</h3>
            <p class="text-xs text-muted mb-3">
              Los binarios WASM de Yosys y nextpnr quedan guardados en el navegador ({{ formatBytes(offlineBytes) }}) para funcionar sin conexión.
            </p>
            <button
              type="button"
              class="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted hover:text-error cursor-pointer"
              @click="emit('clear-offline')"
            >
              {{ t('offline.clear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pie del Modal -->
      <div class="flex justify-end border-t border-border bg-surface-2/40 px-5 py-3">
        <button
          type="button"
          class="rounded-lg bg-surface-2 border border-border px-4 py-1.5 text-xs font-semibold text-fg hover:bg-surface-3 cursor-pointer"
          @click="emit('close')"
        >
          {{ t('app.helpClose') }}
        </button>
      </div>
    </div>
  </div>
</template>
