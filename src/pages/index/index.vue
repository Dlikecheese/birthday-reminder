<template>
  <view>
    <uni-calendar :selected="info.selected" :showMonth="true" />

    <AuthPopup ref="authPopupRef" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { onTabItemTap } from '@dcloudio/uni-app'
import { isLogin, toLogin } from '@/utils/util'
import { http } from '@/utils/http'
import dayjs from 'dayjs'

const authPopupRef = ref(null) as any

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

onTabItemTap(async () => {
  await checkLogin()
})

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
</script>

<style lang="scss"></style>
