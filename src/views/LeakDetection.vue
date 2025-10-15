<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- 页面标题 -->
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">GC监控</h1>
    <!-- 表格区域 -->
    <div class="overflow-x-auto bg-white dark:bg-gray-800 border border-gray-200 rounded shadow">
      <Table class="min-w-[900px] w-full text-xs">
        <TableHeader>
          <TableRow class="bg-gray-50 dark:bg-gray-700">
            <TableHead class="px-3 py-2 text-left font-semibold">类名</TableHead>
            <TableHead class="px-3 py-2 text-left font-semibold whitespace-nowrap">对象数</TableHead>
            <TableHead class="px-3 py-2 text-left font-semibold whitespace-nowrap">被引用对象数</TableHead>
            <TableHead class="px-3 py-2 text-right font-semibold whitespace-nowrap">引用浅堆</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(row, idx) in rows" :key="row.className"
            :class="idx === -1 ? 'bg-primary text-white' : idx % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : ''">
            <TableCell class="px-3 py-2 text-left whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="inline-block w-4 h-4 rounded-full bg-primary/80"></span>
                <div>
                  <a href="#" class="font-medium underline hover:text-primary-700">{{ row.className }}</a>
                  <div v-if="row.objectsLink" class="text-xs underline text-primary-700 leading-tight">
                    <a href="#">{{ row.objectsLink }}</a>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell class="px-3 py-2 text-right align-top whitespace-nowrap">
              <div class="flex items-center gap-2 justify-between">
                <span class="inline-block w-4 h-4 rounded-full bg-primary/80"></span>
                <div>
                  <span class="font-bold">{{ row.objects }}</span>
                  <div v-if="row.objectsLink" class="text-xs underline text-primary-700 leading-tight">
                    <a href="#">{{ row.objectsLink }}</a>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell class="px-3 py-2 text-right align-top whitespace-nowrap">
              <div class="flex items-center gap-2 justify-between">
                <span class="inline-block w-4 h-4 bg-gray-300 rounded"></span>
                <div>
                  <span class="font-bold">{{ row.referencedObjects }}</span>
                  <div v-if="row.referencedObjectsLink" class="text-xs underline text-primary-700 leading-tight">
                    <a href="#">{{ row.referencedObjectsLink }}</a>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell class="px-3 py-2 text-right align-top whitespace-nowrap">
              <span :class="idx === 0 ? 'font-bold text-white' : 'font-bold text-primary-700'">{{ row.shallowHeap }}</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import Table from '@/components/ui/table/Table.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import { ref } from 'vue';

const rows = ref([
  {
    className: 'java.lang.Class',
    objects: '4,673',
    objectsLink: 'First 10 of 4,673 objects',
    referencedObjects: '5,193',
    referencedObjectsLink: 'First 10 of 5,193 objects',
    shallowHeap: '73,680',
  },
  {
    className: 'java.lang.Thread',
    objects: '4',
    objectsLink: 'All 4 objects',
    referencedObjects: '385',
    referencedObjectsLink: 'First 10 of 385 objects',
    shallowHeap: '4,792',
  },
  {
    className: 'com.apple.laf.ScreenMenu',
    objects: '7',
    objectsLink: 'All 7 objects',
    referencedObjects: '335',
    referencedObjectsLink: 'First 10 of 335 objects',
    shallowHeap: '4,608',
  },
  {
    className: 'java.util.TimerThread',
    objects: '2',
    objectsLink: 'All 2 objects',
    referencedObjects: '341',
    referencedObjectsLink: 'First 10 of 341 objects',
    shallowHeap: '2,272',
  },
  {
    className: 'javax.swing.JFrame',
    objects: '1',
    objectsLink: 'Only object',
    referencedObjects: '247',
    referencedObjectsLink: 'First 10 of 247 objects',
    shallowHeap: '1,256',
  },
  {
    className: 'sun.lwawt.macosx.CMenuItem',
    objects: '30',
    objectsLink: 'First 10 of 30 objects',
    referencedObjects: '133',
    referencedObjectsLink: 'First 10 of 133 objects',
    shallowHeap: '1,088',
  },
  {
    className: 'com.sun.jna.internal.Cleaner$CleanerThread',
    objects: '1',
    objectsLink: 'Only object',
    referencedObjects: '20',
    referencedObjectsLink: 'First 10 of 20 objects',
    shallowHeap: '408',
  },
  {
    className: 'org.netbeans.CLIHandler$Server',
    objects: '1',
    objectsLink: 'Only object',
    referencedObjects: '5',
    referencedObjectsLink: 'All 5 objects',
    shallowHeap: '96',
  },
]);
</script>

<style scoped>
</style>
