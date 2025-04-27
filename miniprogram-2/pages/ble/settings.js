Page({
  data: {
    timeout: 10,
    rssiThreshold: -80
  },
  
  onLoad() {
    this.loadSettings();
  },
  
  // 加载设置
  loadSettings() {
    const timeout = wx.getStorageSync('bleTimeout') || 10;
    const rssiThreshold = wx.getStorageSync('bleRssiThreshold') || -80;
    
    this.setData({
      timeout,
      rssiThreshold
    });
  },
  
  // 编辑超时时间
  editTimeout() {
    wx.showModal({
      title: '设置超时时间',
      editable: true,
      placeholderText: '请输入超时时间（秒）',
      content: this.data.timeout.toString(),
      success: (res) => {
        if (res.confirm && res.content) {
          const timeout = parseInt(res.content);
          
          if (isNaN(timeout) || timeout <= 0) {
            wx.showToast({
              title: '请输入有效的数字',
              icon: 'none',
              duration: 2000
            });
            return;
          }
          
          this.setData({ timeout });
          wx.setStorageSync('bleTimeout', timeout);
          
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },
  
  // 编辑信号强度要求
  editRssiThreshold() {
    wx.showModal({
      title: '设置信号强度要求',
      editable: true,
      placeholderText: '请输入信号强度要求（dBm）',
      content: this.data.rssiThreshold.toString(),
      success: (res) => {
        if (res.confirm && res.content) {
          const rssiThreshold = parseInt(res.content);
          
          if (isNaN(rssiThreshold)) {
            wx.showToast({
              title: '请输入有效的数字',
              icon: 'none',
              duration: 2000
            });
            return;
          }
          
          this.setData({ rssiThreshold });
          wx.setStorageSync('bleRssiThreshold', rssiThreshold);
          
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  }
}); 