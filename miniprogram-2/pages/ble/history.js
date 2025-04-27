Page({
  data: {
    historyDevices: []
  },
  
  onLoad() {
    this.loadHistoryDevices();
  },
  
  onShow() {
    this.loadHistoryDevices();
  },
  
  // 加载历史设备
  loadHistoryDevices() {
    const historyDevices = wx.getStorageSync('bleHistoryDevices') || [];
    this.setData({ historyDevices });
  },
  
  // 连接设备
  connectDevice(e) {
    const deviceId = e.currentTarget.dataset.deviceid;
    
    // 检查蓝牙是否可用
    wx.openBluetoothAdapter({
      success: () => {
        wx.createBLEConnection({
          deviceId,
          success: () => {
            wx.showToast({ 
              title: '连接成功', 
              icon: 'success' 
            });
            
            // 跳转到数据收发页面
            wx.navigateTo({
              url: `/pages/ble/transfer?deviceId=${deviceId}`
            });
          },
          fail: (err) => {
            console.error('连接失败', err);
            wx.showToast({ 
              title: '连接失败', 
              icon: 'none', 
              duration: 2000 
            });
          }
        });
      },
      fail: (err) => {
        console.error('蓝牙适配器初始化失败', err);
        wx.showToast({
          title: '请打开蓝牙',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 显示删除确认对话框
  showDeleteConfirm(e) {
    const index = e.currentTarget.dataset.index;
    const device = this.data.historyDevices[index];
    
    wx.showModal({
      title: '删除设备',
      content: `确定要删除设备 "${device.name || '未知设备'}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteDevice(index);
        }
      }
    });
  },
  
  // 删除设备
  deleteDevice(index) {
    const historyDevices = this.data.historyDevices;
    historyDevices.splice(index, 1);
    
    this.setData({ historyDevices });
    wx.setStorageSync('bleHistoryDevices', historyDevices);
    
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 2000
    });
  }
}); 