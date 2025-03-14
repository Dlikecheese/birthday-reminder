import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息
    const profile = ref<any>()

    // 保存用户信息，登录时使用
    const setProfile = (val: any) => {
      profile.value = val
    }

    // 清理用户信息，退出时使用
    const clearProfile = () => {
      profile.value = undefined
    }

    return {
      profile,
      setProfile,
      clearProfile,
    }
  },
  // 持久化
  {
    persist: {
      // 小程序配置
      storage: {
        getItem(key: string) {
          return uni.getStorageSync(key)
        },
        setItem(key: string, value: any) {
          uni.setStorageSync(key, value)
        },
      },
    },
  },
)
