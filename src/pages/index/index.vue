<template>
  <view>
    <uni-calendar
      :lunar="true"
      :selected="info.selected"
      :showMonth="true"
      @monthSwitch="monthSwith"
    />

    <view v-if="birthdaysInCurrentMonth.length">
      <uni-notice-bar single :text="noticeText" />
    </view>

    <view v-else class="nodata">
      <view> 当月暂无生日哦～ </view>
      <view class="text-link link" @click="toBirthdayPage">查看所有生日</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { isLogin, toLogin } from '@/utils/util'
import { http } from '@/utils/http'
import dayjs from 'dayjs'

const info: Ref<{
  lunar: boolean
  range: boolean
  insert: boolean
  selected: { date: any; info: string }[]
}> = ref({
  lunar: true,
  range: true,
  insert: false,
  selected: [],
})

let noticeText = ''
let birthdaysInCurrentMonth = ref([] as any[])

const monthSwith = (e: any) => {
  const { month } = e
  birthdaysInCurrentMonth.value = info.value.selected.filter((item: any) => {
    const birthdayDate = dayjs(item.date)
    console.log(birthdayDate.month(), month)
    return birthdayDate.month() + 1 === month
  })
  noticeText = `本月有 ${birthdaysInCurrentMonth.value.length} 个生日`
}

onMounted(async () => {
  await checkLogin()
  getBirthdayList()
})

const getBirthdayList = async () => {
  const res: any = await http({
    url: '/birthday',
    method: 'GET',
  })

  info.value.selected = res.data?.map((item: any) => {
    return {
      ...item,
      date: getCurrentYearBirthday(item.birthday),
      info: `${item.name}生日`,
    }
  })
}

const getCurrentYearBirthday = (birthday: string) => {
  const birthdayMonth = dayjs(birthday).month()
  const birthdayDate = dayjs(birthday).date()
  const birthdayDateInThisYear = dayjs().set('month', birthdayMonth).set('date', birthdayDate)

  return `${birthdayDateInThisYear.format('YYYY-MM-DD')}`
}

const checkLogin = async () => {
  if (!isLogin()) {
    try {
      await toLogin()
    } catch (error) {
      console.error(error)
    }
  }
}
const toBirthdayPage = () => {
  uni.switchTab({
    url: '/pages/birthday/birthday',
  })
}
</script>

<style lang="scss">
.nodata {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
  margin: 20px 0;
  .link {
    margin-left: 6px;
  }
}
</style>
