<template>
  <uni-section>
    <view class="uni-padding-wrap">
      <uni-segmented-control
        :current="current"
        :values="items"
        :style-type="styleType"
        :active-color="activeColor"
        @clickItem="onClickItem"
      />
    </view>
    <view class="content">
      <view v-if="current === GiftType.ALL"><text class="content-text">礼物广场</text></view>
      <view v-if="current === GiftType.OWN"><text class="content-text">我创建的</text></view>
      <view v-if="current === GiftType.LIKE"><text class="content-text">我收藏的</text></view>
    </view>
  </uni-section>

  <uni-icons type="plus" color="#ff6e95" size="40" class="icon" @click="addGift" />
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { GiftType } from './gift.type'

const items = ref(['礼物广场', '我创建的', '我收藏的']) as Ref<string[]>
const current = ref(GiftType.ALL) as Ref<GiftType>
const styleType = 'button'
const activeColor = '#007aff'
const onClickItem = (e: any) => {
  if (current.value !== e.currentIndex) {
    current.value = e.currentIndex
  }
}

const addGift = () => {
  uni.navigateTo({
    url: '/pagesGift/add-gift/add-gift',
  })
}
</script>

<style lang="scss">
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  text-align: center;
}

.uni-padding-wrap {
  padding: 0px 30px;
}

.icon {
  position: fixed;
  right: 30px;
  bottom: 30px;
}
</style>
