<template>
  <div class="mx-auto p-6">
    <!-- 页面标题 -->
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">GC监控</h1>
    <!-- 表格区域 -->
    <Card>
      <CardHeader>
        <CardDescription>当前内存中的主要对象分布情况</CardDescription>
      </CardHeader>
      <CardContent>
        <Table class="min-w-[900px] w-full text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>类名</TableHead>
              <TableHead>对象数</TableHead>
              <TableHead>被引用对象数</TableHead>
              <TableHead>引用浅堆</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(row, idx) in rows" :key="row.className">
              <TableCell class="font-medium">
                <a href="#" class="underline hover:text-primary-700">{{ row.className }}</a>
                <div v-if="row.objectsLink" class="text-xs underline text-primary-700 leading-tight">
                  <a href="#">{{ row.objectsLink }}</a>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="default">{{ row.objects }}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{{ row.referencedObjects }}</Badge>
                <div v-if="row.referencedObjectsLink" class="text-xs underline text-primary-700 leading-tight">
                  <a href="#">{{ row.referencedObjectsLink }}</a>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ row.shallowHeap }}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Table from '@/components/ui/table/Table.vue';
import TableHeader from '@/components/ui/table/TableHeader.vue';
import TableBody from '@/components/ui/table/TableBody.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import TableHead from '@/components/ui/table/TableHead.vue';
import TableCell from '@/components/ui/table/TableCell.vue';
import Card from '@/components/ui/card/Card.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardContent from '@/components/ui/card/CardContent.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import {CardDescription} from '@/components/ui';

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
