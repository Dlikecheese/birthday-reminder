<template>
  <view class="uni-padding-wrap">
    <uni-segmented-control
      :current="current"
      :values="items"
      style-type="text"
      :active-color="activeColor"
      @clickItem="onClickItem"
    />
  </view>
  <!-- 图片列表 -->
  <view class="waterfall-container">
    <uni-card
      v-for="item in displayedList"
      :key="item.id"
      class="waterfall-item"
      :cover="cover"
      @click="onClick"
      :border="false"
      padding="0"
      margin="0"
      :is-shadow="false"
    >
      <view class="waterfall-item-title">{{ item.title }}</view>
      <template v-slot:actions>
        <view class="card-actions text-weaken">
          <view class="card-actions-item">
            <image class="avatar" :src="item.avatar" />
            <text>{{ item.creatorName }}</text>
          </view>
          <view class="card-actions-item">
            <uni-icons type="heart" size="18" color="#999" /><text>{{ item.likeCount }}</text>
            <uni-icons type="star" size="20" color="#999" /><text>{{ item.starCount }}</text>
          </view>
        </view>
      </template>
    </uni-card>
  </view>

  <!-- 创建 -->
  <uni-icons type="plus" color="#ff6e95" size="40" class="icon" @click="addGift" />
</template>

<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { GiftType } from './gift.type'
import cover from '@/static/images/test.jpg'
import avatar from '@/static/images/avatar.png'

const items = ref(['礼物广场', '我创建的', '我收藏的']) as Ref<string[]>
const current = ref(GiftType.ALL) as Ref<GiftType>
const activeColor = '#007aff'

const mockList = [
  {
    title: '这是一个带封面和操作栏的卡片示例，此',
    cover,
    avatar,
    creatorName: 'dxy',
    likeCount: 23,
    starCount: 11,
    id: '1',
    isMine: false,
    isStar: false,
  },
  {
    title: '这是我创建的礼物',
    cover,
    avatar,
    creatorName: 'dxy',
    likeCount: 23,
    starCount: 11,
    id: '2',
    isMine: true,
    isStar: false,
  },
  {
    title: '这是我收藏的礼物',
    cover,
    avatar,
    creatorName: 'dxy',
    likeCount: 23,
    starCount: 11,
    id: '2',
    isMine: false,
    isStar: true,
  },
]
const displayedList = ref(mockList) as Ref<any[]>

const onClickItem = (e: any) => {
  if (current.value !== e.currentIndex) {
    current.value = e.currentIndex
  }

  if (current.value === GiftType.ALL) {
    displayedList.value = mockList
  }

  if (current.value === GiftType.OWN) {
    displayedList.value = mockList.filter((item) => item.isMine)
  }

  if (current.value === GiftType.LIKE) {
    displayedList.value = mockList.filter((item) => item.isStar)
  }
}

const addGift = () => {
  uni.navigateTo({
    url: '/pagesGift/add-gift/add-gift',
  })
}

const onClick = (e: any) => {
  console.log(e)
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  text-align: center;
  margin-top: 80px;
}

.uni-padding-wrap {
  padding: 0px 30px;
}

.icon {
  position: fixed;
  right: 30px;
  bottom: 30px;
}

.waterfall-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.waterfall-item {
  flex: 1 1 50%; /* 两列布局 */
  max-width: 50%;
}
.waterfall-item-title {
  color: #000;
  padding: 4px 10px 0 10px;
}
.card-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
}
.card-actions-item {
  display: flex;
  align-items: center;
  uni-icons {
    margin-left: 4px;
    margin-right: 2px;
  }
}
.card-actions-item-text {
  font-size: 12px;
  color: #666;
  margin-left: 5px;
}
.cover-image {
  flex: 1;
  height: 150px;
}
.no-border {
  border-width: 0;
}
::v-deep .uni-card {
  padding: 0 1px 0 2px !important;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 4px;
  object-fit: cover;
}
</style>
