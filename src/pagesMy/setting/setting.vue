<template>
  <div class="card">
    <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
      <image class="avatar" :src="avatarUrlSrc" v-if="avatarUrlSrc"></image>
      <image class="avatar" :src="defaultAvatar" v-else></image>
    </button>
    <uni-forms ref="formRef" :modelValue="formData" :rules="rules">
      <uni-forms-item label="昵称" name="name" required>
        <uni-easyinput type="text" v-model="formData.name" placeholder="请输入昵称" />
      </uni-forms-item>
    </uni-forms>
    <view class="box"></view>
    <view class="submit flex">
      <button @click="submit" class="submit-btn color-theme-bg text-light">修改</button>
    </view>
  </div>
</template>

<script lang="ts" setup>
import { baseURL, http } from '@/utils/http'
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/index'
import defaultAvatar from '@/static/images/default-avatar.jpeg'

const avatarUrlSrc = ref('')

onShow(async () => {
  uni.showLoading({
    title: '加载中',
    mask: true,
  })
  await getUserDetail()
  uni.hideLoading()
})

const formData = ref({
  name: '',
})

const rules = {
  name: {
    // name 字段的校验规则
    rules: [
      // 校验 name 不能为空
      {
        required: true,
        errorMessage: '请填写姓名',
      },
      // 对name字段进行长度验证
      {
        minLength: 1,
        maxLength: 20,
        errorMessage: '{label}长度在 {minLength} 到 {maxLength} 个字符',
      },
    ],
    label: '姓名',
    validateTrigger: 'submit',
  },
}

// 引用表单
const formRef = ref(null) as any
const onChooseAvatar = (e: any) => {
  const { avatarUrl } = e.detail
  avatarUrlSrc.value = avatarUrl
  uni.uploadFile({
    url: `${baseURL}/common/upload`,
    filePath: avatarUrl,
    name: 'file',
    header: {
      'Content-Type': 'multipart/form-data',
    },
    success: async (res: any) => {
      if (res.statusCode === 413) {
        uni.showToast({
          title: '图片超过5MB，请重新选择',
          icon: 'error',
        })
        return
      }
      const data = JSON.parse(res.data)
      try {
        if (res.statusCode === 200) {
          avatarUrlSrc.value = data.data
        }
      } catch (e) {
        uni.showToast({
          title: '图片上传失败',
          icon: 'error',
        })
      } finally {
        uni.hideLoading()
      }
    },
    fail: (fail) => {
      uni.hideLoading()
      uni.showToast({
        title: fail.errMsg,
        icon: 'error',
      })
    },
  })
}

const submit = async () => {
  try {
    const val = await formRef.value?.validate()
    const userStore = useUserStore()
    await http({
      url: '/user/' + userStore.profile.id,
      method: 'PUT',
      data: {
        ...val,
        avatar: avatarUrlSrc.value,
      },
    })

    userStore.setProfile({
      ...userStore.profile,
      ...val,
      avatar: avatarUrlSrc.value,
    })

    uni.showToast({
      title: '修改成功',
      icon: 'success',
    })
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('')
      }, 800)
    })

    uni.navigateBack()
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'error',
    })
  }
}

const getUserDetail = async () => {
  try {
    const res: any = await http({
      url: '/user/detail',
      method: 'GET',
    })

    // 设置表单数据
    formData.value = res.data
    avatarUrlSrc.value = res.data.avatar
  } catch (e) {
    console.error('获取用户详情失败', e)
    uni.showToast({
      title: '获取用户详情失败',
      icon: 'error',
    })
  }
}
</script>

<style lang="scss">
.submit {
  position: fixed;
  bottom: 0px;
  width: 100%;
  left: 0;
  border-top: 1px solid #f2f2f2;
  padding: 10px 10px 0;
  background-color: #fff;
  align-items: center;
  z-index: 98;
  .submit-btn {
    width: 100%;
  }
}
.box {
  margin-bottom: 24px;
  width: 100%;
  height: 50px;
}
.avatar {
  width: 56px;
  height: 56px;
}
.avatar-wrapper {
  padding: 0;
  width: 56px !important;
  border-radius: 8px;
  margin-top: 40px;
  margin-bottom: 40px;
}
</style>
