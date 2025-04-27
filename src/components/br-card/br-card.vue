<template>
  <uni-card
    v-if="item.image"
    :key="item.id"
    :cover="item.image"
    :border="false"
    padding="0"
    margin="0"
    :is-shadow="false"
    @click="click(item)"
  >
    <slot name="title"></slot>
    <template v-slot:actions>
      <slot name="actions"></slot>
    </template>
  </uni-card>

  <view v-else @click="click(item)">
    <view class="cover-default">
      {{ item.name }}
    </view>
    <slot name="title"></slot>
    <template v-slot:actions>
      <slot name="actions"></slot>
    </template>
  </view>
</template>

<script lang="ts" setup>
defineProps({
  item: {
    type: Object,
    required: true,
    default: () => {},
  },
})

const emit = defineEmits(['click'])
const click = (item: any) => {
  emit('click', {
    item,
  })
}
</script>

<style lang="scss">
.cover-default {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 600;
}
</style>
