<template>
    <view class="login-page">
      <!-- 抖音小程序登录按钮（必须同步触发） -->
      <!-- #ifdef MP-TOUTIAO -->
      <view class="login-page">
  <button class="btn" open-type="getUserInfo" @tap="handleToutiaoLogin">抖音授权登录</button>
</view>      <!-- #endif -->
  
      <!-- 普通账号密码登录 -->
      <view class="btn" @tap="goAccountLogin">账号密码登录</view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { redirect } from '@/utils/common'
  
  // 抖音登录
  const handleToutiaoLogin = () => {
  if (typeof tt !== 'undefined') {
    console.log('点击事件触发');
    console.log(tt)
    // 保证是在点击事件函数体中同步调用
    tt.getUserProfile({
      desc: '用于完善用户资料',
      lang: 'zh_CN',
      success(res: any) {
        console.log('授权成功：', res.userInfo);
        // 可加入后续登录逻辑
      },
      fail(err: any) {
        console.error('getUserProfile 授权失败：', err);
        uni.showToast({ title: '用户未授权', icon: 'none' });
      }
    });
  } else {
    uni.showToast({ title: '非抖音小程序环境', icon: 'none' });
  }
};

  
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
  