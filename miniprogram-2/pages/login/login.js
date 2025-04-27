Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 已登录，返回上一页
      wx.navigateBack();
    }
  },

  // 处理用户名输入
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 处理密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 处理登录
  handleLogin() {
    const { username, password } = this.data;
    
    if (!username || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    // 本地登录成功
    wx.setStorageSync('userInfo', {
      nickName: username,
      userId: Date.now().toString(),
      avatarUrl: '/images/default-avatar.png'
    });

    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/mine/mine'
          });
        }, 1500);
      }
    });
  }
});
    