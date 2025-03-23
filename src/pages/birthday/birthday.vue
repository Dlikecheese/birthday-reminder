<template>
  <view v-if="!loading && birthdayList.length">
    <uni-section title="一个月内生日" type="line">
      <view v-if="birthdayLatestList.length">
        <uni-swipe-action>
          <uni-swipe-action-item
            v-for="item in birthdayLatestList"
            :key="item.id"
            :right-options="item.options"
            @click="swipeClick($event, item)"
          >
            <uni-card is-full :is-shadow="false" @click="onEdit(item.id)">
              <view class="flex justify-between">
                <view class="flex gap-2">
                  <image src="@/static/images/avatar.png" mode="scaleToFill" class="avatar" />
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
      </view>

      <view v-else>
        <view class="flex justify-center">
          <view class="text-weaken">近期暂无生日</view>
        </view>
      </view>
    </uni-section>

    <uni-section title="一个月后过生日" type="line">
      <view v-if="birthdayAfterOneMonthList.length">
        <uni-swipe-action>
          <uni-swipe-action-item
            v-for="item in birthdayAfterOneMonthList"
            :key="item.id"
            :right-options="item.options"
            @click="swipeClick($event, item)"
          >
            <uni-card is-full :is-shadow="false" @click="onEdit(item.id)">
              <view class="flex justify-between">
                <view class="flex gap-2">
                  <image src="@/static/images/avatar.png" mode="scaleToFill" class="avatar" />
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
      </view>

      <view v-else>
        <view class="flex justify-center">
          <view class="text-weaken">一个月后暂无生日</view>
        </view>
      </view>
    </uni-section>
  </view>

  <view v-else-if="!loading && !birthdayList.length" class="no-data text-weaken">
    快去添加生日吧~ <text class="text-link link" @click="addBirthday">去添加</text>
  </view>

  <uni-icons type="plus" color="#ff6e95" size="40" class="icon" @click="addBirthday" />
</template>

<script lang="ts" setup>
import { http } from '@/utils/http'
import { calculateZodiac } from '@/utils/util'
import { onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { ref } from 'vue'

const addBirthday = () => {
  uni.navigateTo({
    url: '/pagesBirthday/add-birthday/add-birthday',
  })
}

const birthdayList = ref([]) as any
const birthdayLatestList = ref([]) as any
const birthdayAfterOneMonthList = ref([]) as any
const swipeAction = [
  {
    id: 'delete',
    text: '删除',
    style: {
      backgroundColor: '#F56C6C',
    },
  },
]
const loading = ref(false)

onShow(async () => {
  loading.value = true
  uni.showLoading({
    title: '加载中',
  })
  try {
    await getBirthdayList()
  } finally {
    uni.hideLoading()
    loading.value = false
  }
})

const getBirthdayList = async () => {
  try {
    const res: any = await http({
      url: '/birthday',
      method: 'GET',
    })

    birthdayList.value = res.data
    const latestList = res.data.filter(
      (ele: { birthday: string | number | Date | dayjs.Dayjs | null | undefined }) => {
        const birthdayMonth = dayjs(ele.birthday).month()
        const birthdayDate = dayjs(ele.birthday).date()
        const birthdayDateInThisYear = dayjs().set('month', birthdayMonth).set('date', birthdayDate)
        return birthdayDateInThisYear.diff(dayjs(), 'day') <= 30
      },
    )

    const otherList = res.data.filter((ele: { id: any }) => {
      return !latestList.some((item: { id: any }) => item.id === ele.id)
    })

    birthdayLatestList.value = transformBirthday(latestList)
    birthdayAfterOneMonthList.value = transformBirthday(otherList)
  } catch (e) {
    uni.showToast({
      title: '获取生日列表失败',
      icon: 'error',
    })
  }
}

/**
 * 转换生日列表 生成年龄、生日描述、倒计时
 */
const transformBirthday = (birthdayList: any[]): any[] => {
  return birthdayList.map((ele) => {
    const nextAge = dayjs().diff(ele.birthday, 'year') + 1
    const zodiac = calculateZodiac(ele.birthday)
    const desc = `${dayjs(ele.birthday).format('MM月DD日')} 属${zodiac} ${nextAge}岁`

    const countdown = calcCountdown(ele.birthday)
    return {
      ...ele,
      nextAge,
      desc,
      countdown,
      options: swipeAction,
    }
  })
}

/**
 * 计算倒计时
 */
const calcCountdown = (birthday: string): string => {
  // 如果生日的月日小于当前的月日，说明今年的生日已经过了，计算下一年的生日还有多少天
  const birthdayMonth = dayjs(birthday).month()
  const birthdayDate = dayjs(birthday).date()
  const birthdayDateInThisYear = dayjs().set('month', birthdayMonth).set('date', birthdayDate)

  const now = dayjs()
  let diff = 0
  if (birthdayDateInThisYear.isBefore(dayjs())) {
    const nextBirthday = dayjs()
      .set('year', now.year() + 1)
      .set('month', birthdayMonth)
      .set('date', birthdayDate)
    diff = nextBirthday.diff(now, 'day')
  } else {
    diff = birthdayDateInThisYear.diff(now, 'day')
  }

  return getDiffText(diff)
}

/**
 * 获取倒计时文本
 */
const getDiffText = (diff: number): string => {
  if (diff === 0) {
    return '今天'
  } else if (diff === 1) {
    return '明天'
  } else if (diff === 2) {
    return '后天'
  } else if (diff >= 7 && diff < 14) {
    return '一周后'
  } else if (diff >= 14 && diff < 21) {
    return '两周后'
  } else if (diff >= 21 && diff < 30) {
    return '三周后'
  } else if (diff >= 30 && diff < 60) {
    return '一个月后'
  } else if (diff >= 60 && diff < 90) {
    return '两个月后'
  } else if (diff >= 90 && diff < 120) {
    return '三个月后'
  } else if (diff >= 120 && diff < 150) {
    return '四个月后'
  } else if (diff >= 150 && diff < 180) {
    return '五个月后'
  } else if (diff >= 180 && diff < 210) {
    return '半年后'
  } else if (diff >= 210 && diff < 240) {
    return '七个月后'
  } else if (diff >= 240 && diff < 270) {
    return '八个月后'
  } else if (diff >= 270 && diff < 300) {
    return '九个月后'
  } else if (diff >= 300 && diff < 330) {
    return '十个月后'
  } else if (diff >= 330 && diff < 365) {
    return '十一个月后'
  } else {
    return diff + '天'
  }
}

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
            getBirthdayList()
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

<style lang="scss">
.icon {
  position: fixed;
  right: 30px;
  bottom: 30px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.link {
  margin-left: 6px;
}
</style>
