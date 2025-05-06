<template>
  <view class="uni-padding-wrap">
    <uni-segmented-control
      :current="current"
      :values="items"
      style-type="text"
      :active-color="activeColor"
      @clickItem="onClickTab"
    />
  </view>
  <!-- 图片列表 -->
  <view class="waterfall-container">
    <view class="waterfall-card-container">
      <br-card
        v-for="item in displayedList"
        :item="item"
        :key="item.id"
        class="waterfall-item"
        @click="toDetail(item)"
      >
        <template v-slot:title>
          <view class="waterfall-item-title"
            ><text>
              {{ item.name?.slice(0, maxFontLen) }}
              <text v-if="item.name?.length > maxFontLen">...</text>
            </text></view
          >
        </template>
        <template v-slot:actions>
          <view class="card-actions text-weaken">
            <view class="card-actions-item">
              <image class="avatar" :src="item.creatorAvatar" />
              <text>{{ item.creatorName }}</text>
            </view>
            <view class="card-actions-item">
              <uni-icons
                v-if="item.isFavoritedByUser"
                type="heart-filled"
                size="16"
                color="#eb414a"
              />
              <uni-icons v-else type="heart" size="16" color="#999" />
              <text>{{ item.favoriteCount ?? 0 }}</text>
              <uni-icons
                v-if="item.isCollectedByUser"
                type="star-filled"
                size="20"
                color="#f38f66"
              />
              <uni-icons v-else type="star" size="20" color="#999" />
              <text>{{ item.collectCount ?? 0 }}</text>
            </view>
          </view>
        </template>
      </br-card>
    </view>

    <view class="flex justify-center items-center">
      <uni-load-more :status="loadingStatus" />
    </view>
  </view>

  <!-- 创建 -->
  <uni-icons type="plus" color="#ff6e95" size="40" class="icon" @click="addGift" />

  <AuthPopup ref="authPopupRef" />
</template>

<script lang="ts" setup>
const maxFontLen = 18
import { ref, type Ref } from 'vue'
import { GiftType } from './gift.type'
import { http } from '@/utils/http'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { isLogin, toLogin } from '@/utils/util'
const authPopupRef = ref(null) as any

const checkLogin = async () => {
  if (!isLogin()) {
    try {
      const userInfo = await toLogin()

      if (!userInfo) {
        authPopupRef.value?.openPopup?.()
      }
    } catch (error) {
      console.error(error)
    }
  }
}

const items = ref(['礼物广场', '我创建的', '我收藏的']) as Ref<string[]>
const current = ref(GiftType.ALL) as Ref<GiftType>
const activeColor = '#007aff'
// 默认每页加载6条数据
const defaultPageSize = 6
// 当前总数
let total = 0
let loadingStatus = ref('more') as any // 加载状态

// 触底加载
onReachBottom(async () => {
  if (displayedList.value.length >= total) {
    loadingStatus.value = 'noMore'
    return
  }

  loadingStatus.value = 'loading'

  const res = await getGfitList({
    start: displayedList.value.length,
    pageSize: defaultPageSize,
    isMine: false,
    isCollect: false,
  })
  displayedList.value = [...displayedList.value, ...res.rows]
  loadingStatus.value = 'more'
})

onShow(async () => {
  await checkLogin()

  refreshList(current.value)
})

const toDetail = (item: any) => {
  // 存储数据
  uni.setStorageSync('gift', item)
  uni.navigateTo({
    url: `/pagesGift/gift-detail/gift-detail?id=${item.id}`,
  })
}

const onClickTab = ({ currentIndex }: any) => {
  current.value = currentIndex

  refreshList(currentIndex)
}

/*
 * 重新获取列表
 */
const refreshList = async (currentTab: GiftType) => {
  let res: any = []
  if (currentTab === GiftType.ALL) {
    res = await getGfitList()
  }

  if (currentTab === GiftType.OWN) {
    res = await getGfitList({
      start: 0,
      pageSize: defaultPageSize,
      isMine: true,
      isCollect: false,
    })
  }

  if (currentTab === GiftType.COLLECT) {
    res = await getGfitList({
      start: 0,
      pageSize: defaultPageSize,
      isMine: false,
      isCollect: true,
    })
  }

  displayedList.value = res.rows
  total = res.total
  loadingStatus.value = res.total > 4 ? 'more' : 'noMore'
}

const getGfitList = async (
  params: {
    start: number
    pageSize: number
    isMine: boolean
    isCollect: boolean
  } = { start: 0, pageSize: defaultPageSize, isMine: false, isCollect: false },
) => {
  const res: any = await http({
    url: '/gift/list',
    method: 'GET',
    data: {
      start: params.start,
      pageSize: params.pageSize,
      isMine: params.isMine,
      isCollect: params.isCollect,
    },
  })

  return res.data
}
const displayedList = ref([]) as Ref<any[]>

const addGift = () => {
  uni.navigateTo({
    url: '/pagesGift/add-gift/add-gift',
  })
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
  background-color: #fafafa;
  padding: 2px 0 4px 4px;
  .waterfall-card-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.waterfall-item {
  flex: 1 1 49%; /* 两列布局 */
  max-width: 49%;
  background-color: #fff;
  margin: 2px 1px 2px 2px;
  background-color: #fff;
}
.waterfall-item-title {
  color: #000;
  padding: 4px 10px 0 10px;
  font-size: 14px;
}
.card-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  font-size: 12px;
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
