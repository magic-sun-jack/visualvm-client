<template>
  <div class="p-4">
    <h2 class="text-lg font-bold mb-4">线程监控</h2>
    <div class="mb-2 flex gap-8">
      <span>Live threads: <b>31</b></span>
      <span>Daemon threads: <b>27</b></span>
    </div>
    <div class="overflow-x-auto bg-white rounded shadow">
      <table class="min-w-[900px] w-full text-xs">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 py-1 text-left">Name</th>
            <th class="px-2 py-1 text-left">Timeline</th>
            <th class="px-2 py-1 text-right">Running</th>
            <th class="px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(thread, idx) in threads" :key="thread.name" class="border-b last:border-b-0">
            <td class="px-2 py-1 whitespace-nowrap">{{ thread.name }}</td>
            <td class="px-2 py-1">
              <div class="flex items-center gap-1">
                <div v-for="(state, i) in thread.timeline" :key="i" :class="['h-3 w-8 rounded', stateColor(state)]"></div>
              </div>
            </td>
            <td class="px-2 py-1 text-right">{{ thread.running }}</td>
            <td class="px-2 py-1 text-right">{{ thread.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex gap-4 mt-4 text-xs">
      <div class="flex items-center gap-1"><span class="h-3 w-5 rounded bg-green-400"></span>Running</div>
      <div class="flex items-center gap-1"><span class="h-3 w-5 rounded bg-yellow-400"></span>Wait</div>
      <div class="flex items-center gap-1"><span class="h-3 w-5 rounded bg-orange-400"></span>Park</div>
      <div class="flex items-center gap-1"><span class="h-3 w-5 rounded bg-blue-400"></span>Sleeping</div>
      <div class="flex items-center gap-1"><span class="h-3 w-5 rounded bg-gray-400"></span>Monitor</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 静态mock数据，后续可替换为API数据
const threads = [
  { name: '_jprofiler_sampler', timeline: ['Running','Running','Running','Running','Running'], running: '895,981 ms', total: '895,981 ms' },
  { name: 'Attach Listener', timeline: ['Running','Running','Running','Running','Running'], running: '895,981 ms', total: '895,981 ms' },
  { name: 'Catalina-utility-1', timeline: ['Park','Park','Park','Park','Park'], running: '0 ms', total: '895,981 ms' },
  { name: 'Cleaner-0', timeline: ['Park','Park','Park','Park','Park'], running: '0 ms', total: '895,981 ms' },
  { name: 'container-0', timeline: ['Running','Running','Running','Running','Running'], running: '895,981 ms', total: '895,981 ms' },
  { name: 'DestroyJavaVM', timeline: ['Running','Running','Running','Running','Running'], running: '895,981 ms', total: '895,981 ms' },
  { name: 'Finalizer', timeline: ['Park','Park','Park','Park','Park'], running: '0 ms', total: '895,981 ms' },
  { name: 'http-nio-30780-exec-1', timeline: ['Park','Park','Park','Park','Park'], running: '0 ms', total: '895,981 ms' },
  { name: 'JFR Periodic Tasks', timeline: ['Running','Running','Running','Running','Running'], running: '895,981 ms', total: '895,981 ms' },
]

function stateColor(state: string) {
  switch(state) {
    case 'Running': return 'bg-green-400';
    case 'Wait': return 'bg-yellow-400';
    case 'Park': return 'bg-orange-400';
    case 'Sleeping': return 'bg-blue-400';
    case 'Monitor': return 'bg-gray-400';
    default: return 'bg-gray-200';
  }
}
</script>

<style scoped>
</style>
