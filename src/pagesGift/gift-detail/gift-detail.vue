<template>
  <view class="name-wrap">
    <view>
      <image class="avatar" :src="gift.creatorAvatar" />
      <text>{{ gift.creatorName }}</text>
    </view>
    <uni-icons v-if="gift.isMine" type="more-filled" @click="onMoreAction" />
  </view>
  <view>
    <uni-card
      v-if="gift.image"
      :key="gift.id"
      class="gift-wrap"
      :cover="gift.image"
      :border="false"
      padding="0"
      margin="0"
      :is-shadow="false"
    >
      <view class="gift-wrap-title">{{ gift.name }}</view>
      <view class="gift-wrap-desc">{{ gift.description }}</view>
      <view class="uni-tag-wrap">
        <uni-tag
          v-for="(tag, index) in gift.tags"
          :key="index"
          :text="tag"
          custom-style="background-color: #ff4b78; border-color: #ff4b78;"
        />
      </view>
      <view class="gift-update-time"
        >编辑于
        <uni-dateformat :date="gift.updateTime" :threshold="[0, 3600000]"></uni-dateformat>
      </view>
    </uni-card>

    <view v-else>
      <view class="default-cover">
        <text>
          {{ gift.name?.slice(0, maxFontLen) }}
          <text v-if="gift.name?.length > maxFontLen">...</text>
        </text>
      </view>
      <view class="gift-wrap-title">{{ gift.name }}</view>
      <view class="gift-wrap-desc">{{ gift.description }}</view>
      <view class="uni-tag-wrap">
        <uni-tag
          v-for="(tag, index) in gift.tags"
          :key="index"
          :text="tag"
          custom-style="background-color: #ff4b78; border-color: #ff4b78;"
        />
      </view>

      <view class="gift-update-time"
        >编辑于
        <uni-dateformat :date="gift.updateTime" :threshold="[0, 3600000]"></uni-dateformat>
      </view>
    </view>
  </view>

  <view class="text-center text-weaken text-sm mb-1"> - 到底了 - </view>

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
import { http } from '@/utils/http'
import { ref, type Ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { sexOptions, usageAgeOptions } from '@/utils/common'
import { AgeRange, Sex } from '@/types/common'

// 最长显示文字长度
const maxFontLen = 100

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

    gift.value = {
      ...value,
    }

    await getBirthdayDetail(id)
    uni.hideLoading()
  }
})

onShow(async () => {
  uni.showLoading({
    title: '加载中',
    mask: true,
  })
  await getBirthdayDetail(giftId.value)
  uni.hideLoading()
})
const getBirthdayDetail = async (id: string) => {
  // 获取礼物详情
  try {
    const res: any = await http({
      url: '/gift/detail/' + id,
      method: 'GET',
    })

    const usageSex =
      res.data.usageSex === Sex.ALL
        ? '男女通用'
        : sexOptions.find((item: any) => item.value === res.data.usageSex)?.text
    const usageAge =
      res.data.usageAge?.[0] === AgeRange.ALL
        ? ['各年龄段通用']
        : res.data.usageAge.map((item: any) => {
            return usageAgeOptions.find((i) => i.value === item)?.text
          })
    const tags = [usageSex].concat(usageAge)

    gift.value = {
      ...gift.value,
      description: res.data.description,
      isMine: res.data.isMine,
      name: res.data.name,
      image: res.data.image,
      updateTime: res.data.updateTime,
      tags,
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
  uni.setStorageSync('refresh', true)

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
  uni.setStorageSync('refresh', true)

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
          setTimeout(() => {
            uni.showToast({
              title: '删除成功',
              icon: 'success',
            })

            uni.setStorageSync('refresh', true)
            uni.navigateBack()
          }, 800)
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
  border-radius: 0 !important;
}

.gift-wrap-title {
  font-size: 16px;
  padding: 10px;
  color: #000;
}
.gift-wrap-desc {
  font-size: 14px;
  color: #666;
  padding: 0 10px 10px 10px;
}
.gift-update-time {
  margin-bottom: 50px;
  padding: 10px;
  color: #666;
  font-size: 12px;
  border-bottom: 1px solid #eee;
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

.default-cover {
  width: 100vw;
  height: 80vh;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  font-weight: 600;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

uni-icons {
  margin: 0 10px;
  padding: 0 10px;
}
.uni-tag-wrap {
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
}
uni-tag {
  margin: 0 5px 10px 5px;
  flex-shrink: 0;
}
</style>
