<template>
  <div class="birthday">birthday</div>
  <uni-icons type="plus" color="#ff6e95" size="40" class="icon" @click="addBirthday" />
</template>

<script lang="ts" setup>
const addBirthday = () => {
  uni.navigateTo({
    url: '/pagesBirthday/add-birthday/add-birthday',
  })
}
</script>

<style lang="scss">
.icon {
  position: fixed;
  right: 30px;
  bottom: 30px;
}
</style>
