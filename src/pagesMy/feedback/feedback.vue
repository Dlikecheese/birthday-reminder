<template>
  <div class="feedback">
    <uni-forms ref="baseForm" :modelValue="baseFormData">
      <uni-forms-item label="意见">
        <uni-easyinput type="textarea" v-model="baseFormData.content" placeholder="请输入内容" />
      </uni-forms-item>
    </uni-forms>
    <view class="button-group">
      <button type="primary" @click="add">提交</button>
    </view>
  </div>
</template>

<script lang="ts" setup>
import { http } from '@/utils/http'
import { ref } from 'vue'

const baseFormData = ref({
  content: '',
})

const add = async () => {
  if (!baseFormData.value.content) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none',
    })
    return
  }

  await http({
    url: '/user/feedback',
    method: 'POST',
    data: {
      content: baseFormData.value.content,
    },
  })
  uni.showToast({
    title: '感谢您的反馈',
    icon: 'success',
  })
  uni.navigateBack()
}
</script>

<style lang="scss">
.feedback {
  margin: 20px;
}

.button-group {
  margin-top: 15px;
  display: flex;
  justify-content: space-around;
  button {
    width: 80%;
    background-color: #ff4b78;
    &:focus {
      background-color: #ff4b78;
    }
    &:active {
      background-color: #ff4b78;
    }
    &:hover {
      background-color: #ff4b78;
    }
  }
}
</style>
