<template>
  <uni-swipe-action>
    <uni-swipe-action-item
      v-for="item in list"
      :key="item.id"
      :right-options="item.options"
      @click="swipeClick($event, item)"
    >
      <uni-card is-full :is-shadow="false" @click="onEdit(item.id)">
        <view class="flex justify-between">
          <view class="flex gap-2">
            <image src="@/static/tabs/cake-fill.png" mode="scaleToFill" class="avatar" />
            <view class="flex flex-col gap-base">
              <view class="text-primary font-bolder">{{ item.name }}</view>
              <view>{{ item.desc }}</view>
            </view>
          </view>

          <view class="flex flex-col gap-1 items-end">
            <view class="color-theme font-bolder text-larger">{{ item.countdown }}</view>
            <view>距{{ item.nextAge }}岁生日</view>
          </view>
        </view>
      </uni-card>
    </uni-swipe-action-item>
  </uni-swipe-action>
</template>

<script lang="ts" setup>
import type { BirthdayType } from '@/types/common'
import { http } from '@/utils/http'

interface BirthdayItem {
  id: string
  name: string
  desc: string
  countdown: string
  nextAge: number
  options: any[]
  birthdayType: BirthdayType
}

defineProps({
  list: {
    type: Array as () => BirthdayItem[],
    required: true,
    default: () => [] as BirthdayItem[],
  },
})

const emit = defineEmits(['delete'])

const onEdit = (birthdayId: string): void => {
  uni.navigateTo({
    url: `/pagesBirthday/add-birthday/add-birthday?id=${birthdayId}`,
  })
}

const swipeClick = (e: any, item: any) => {
  if (e.content.id === 'delete') {
    uni.showModal({
      title: '提示',
      content: `确定删除${item.name}的生日提醒吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await http({
              url: `/birthday/${item.id}`,
              method: 'DELETE',
            })
            uni.showToast({
              title: '删除成功',
              icon: 'success',
            })
            emit('delete', {
              item,
            })
          } catch (e) {
            uni.showToast({
              title: '删除失败',
              icon: 'error',
            })
          }
        } else if (res.cancel) {
          uni.showToast({
            title: '已取消删除',
            icon: 'none',
          })
        }
      },
    })
  }
}
</script>

<style lang="scss"></style>
