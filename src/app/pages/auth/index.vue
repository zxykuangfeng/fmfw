<template>
    <view class="login-page">
      <!-- 抖音小程序登录按钮（必须同步触发） -->
      <!-- #ifdef MP-TOUTIAO -->
      <button class="btn" @tap="handleToutiaoLogin">抖音授权登录</button>
   <!-- #endif -->
  
      <!-- 普通账号密码登录 -->
      <view class="btn" @tap="goAccountLogin">账号密码登录1</view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { redirect } from '@/utils/common'
  import useMemberStore from '@/stores/member'
  import { useLogin } from '@/hooks/useLogin'
  import { toutiaoLoginByCode } from '@/app/api/auth'


  const memberStore = useMemberStore()
  const login = useLogin()
  // 抖音登录
  const handleToutiaoLogin = () => {
    if (typeof tt === 'undefined') {
      uni.showToast({ title: '非抖音小程序环境', icon: 'none' })
      return
    }
    tt.login({
        success(res: any) {
        if (res.code) {
          uni.showLoading({ title: '' })
          toutiaoLoginByCode({ code: res.code }).then((ret: any) => {
            uni.hideLoading()
            if (ret.data && ret.data.token) {
              memberStore.setToken(ret.data.token)
              login.handleLoginBack()
            } else {
              uni.showToast({ title: ret.msg || '登录失败', icon: 'none' })
            }
          }).catch((err) => {
            uni.hideLoading()
            uni.showToast({ title: err.msg || '登录失败', icon: 'none' })
          })
        } else {
          uni.showToast({ title: res.errMsg || '登录失败', icon: 'none' })
        }
      },
      fail(err: any) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }

    })
}
  
  // 普通账号密码登录跳转
  const goAccountLogin = () => {
    redirect({ url: '/app/pages/auth/login', param: { type: 'username' } })
  }
  </script>
  
  <style scoped>
  .login-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f7f7f7;
  }
  .btn {
    width: 300rpx;
    height: 88rpx;
    line-height: 88rpx;
    margin: 20rpx 0;
    text-align: center;
    background-color: #1677ff;
    color: white;
    border-radius: 44rpx;
    font-size: 30rpx;
  }
  </style>
  