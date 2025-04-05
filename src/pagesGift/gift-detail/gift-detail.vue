<template>
  <view class="name-wrap">
    <view>
      <image class="avatar" :src="gift.creatorAvatar" />
      <text>{{ gift.creatorName }}</text>
    </view>
    <uni-icons type="more-filled" @click="onMoreAction" />
  </view>
  <uni-card
    :key="gift.id"
    class="gift-wrap"
    :cover="cover"
    :border="false"
    padding="0"
    margin="0"
    :is-shadow="false"
  >
    <view class="gift-wrap-title">{{ gift.name }}</view>
    <view class="gift-wrap-desc">{{ gift.description }}</view>
  </uni-card>
  <view class="card-actions text-weaken">
    <view></view>
    <view class="card-actions-item">
      <uni-icons
        v-if="gift.isFavoritedByUser"
        type="heart-filled"
        size="18"
        color="#eb414a"
        @click="onLike(gift)"
      />
      <uni-icons v-else type="heart" size="18" color="#999" @click="onLike(gift)" />
      <text>{{ gift.favoriteCount ?? 0 }}</text>
      <uni-icons
        v-if="gift.isCollectedByUser"
        type="star-filled"
        size="20"
        color="#f38f66"
        @click="onCollect(gift)"
      />
      <uni-icons v-else type="star" size="20" color="#999" @click="onCollect(gift)" />
      <text>{{ gift.collectCount ?? 0 }}</text>
    </view>
  </view>

  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <view class="popup-content">
      <button class="w-full" @click="onEdit">修改</button>
      <button class="w-full" @click="onDelete">删除</button>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import cover from '@/static/images/test.jpg'
import { http } from '@/utils/http'
import { ref, type Ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

let giftId = ref('')
let gift: Ref<any> = ref({})
onLoad(async ({ id }: any) => {
  if (id) {
    giftId.value = id

    uni.showLoading({
      title: '加载中',
      mask: true,
    })
    const value = uni.getStorageSync('gift')
    console.log(value)

    gift.value = { ...value }
    await getBirthdayDetail(id)
    uni.hideLoading()
  }
})
const getBirthdayDetail = async (id: string) => {
  // 获取礼物详情
  try {
    const res: any = await http({
      url: '/gift/detail/' + id,
      method: 'GET',
    })

    gift.value = {
      ...gift.value,
      description: res.data.description,
    }
  } catch (e) {
    uni.showToast({
      title: '获取礼物详情失败',
      icon: 'error',
    })
  }
}

const onLike = async (item: any) => {
  await http({
    url: `/gift/like/${item.id}/${!item.isFavoritedByUser}`,
    method: 'POST',
  })
  item.isFavoritedByUser = !item.isFavoritedByUser

  if (item.isFavoritedByUser) {
    item.favoriteCount += 1
  } else {
    item.favoriteCount -= 1
  }
}

const onCollect = async (item: any) => {
  await http({
    url: `/gift/collect/${item.id}/${!item.isCollectedByUser}`,
    method: 'POST',
  })
  item.isCollectedByUser = !item.isCollectedByUser

  if (item.isCollectedByUser) {
    item.collectCount += 1
  } else {
    item.collectCount -= 1
  }
}

const popup = ref(null) as any

const onMoreAction = () => {
  popup.value?.open?.('bottom')
}

const onEdit = () => {
  popup.value?.close()
  uni.navigateTo({
    url: `/pagesGift/add-gift/add-gift?id=${gift.value.id}`,
  })
}

const onDelete = () => {
  popup.value?.close()
  uni.showModal({
    title: '提示',
    content: `确定删除该礼物吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await http({
            url: `/gift/${gift.value.id}`,
            method: 'DELETE',
          })
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          uni.navigateBack()
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
</script>

<style lang="scss" scoped>
::v-deep .uni-card {
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}
::v-deep .uni-card__cover {
  margin-top: 0 !important;
}
.gift-wrap-title {
  font-size: 16px;
  font-weight: bold;
  padding: 10px;
  color: #000;
}
.gift-wrap-desc {
  font-size: 14px;
  color: #666;
  padding: 0 10px 10px 10px;
  margin-bottom: 30px;
}
.card-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  border-top: 1px solid #eee;
}
.card-actions-item {
  display: flex;
  align-items: center;

  uni-icons {
    margin-left: 4px;
    margin-right: 2px;
  }
}

.name-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.card-actions-item-text {
  font-size: 12px;
  color: #666;
  margin-left: 5px;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 4px;
  object-fit: cover;
}
</style>
