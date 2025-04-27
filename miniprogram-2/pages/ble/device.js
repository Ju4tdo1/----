Page({
  data: {
    deviceId: '',
    deviceName: '',
    connected: false,
    autoReconnect: false,
    services: [],
    characteristics: [],
    selectedService: '',
    selectedCharacteristic: ''
  },

  onLoad(options) {
    this.setData({
      deviceId: options.deviceId,
      deviceName: options.deviceName
    });
    
    // 检查连接状态
    this.checkConnectionStatus();
    
    // 获取设备服务
    this.getDeviceServices();
  },

  onUnload() {
    // 如果设置了不自动重连，则断开连接
    if (!this.data.autoReconnect) {
      this.disconnect();
    }
  },

  // 检查连接状态
  checkConnectionStatus() {
    wx.getBLEDeviceServices({
      deviceId: this.data.deviceId,
      success: () => {
        this.setData({ connected: true });
      },
      fail: () => {
        this.setData({ connected: false });
      }
    });
  },

  // 获取设备服务
  getDeviceServices() {
    wx.getBLEDeviceServices({
      deviceId: this.data.deviceId,
      success: (res) => {
        this.setData({ 
          services: res.services,
          selectedService: res.services[0]?.uuid || ''
        });
        
        if (res.services.length > 0) {
          this.getCharacteristics(res.services[0].uuid);
        }
      },
      fail: (err) => {
        console.error('获取服务失败', err);
        wx.showToast({
          title: '获取服务失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取特征值
  getCharacteristics(serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId: this.data.deviceId,
      serviceId: serviceId,
      success: (res) => {
        this.setData({ 
          characteristics: res.characteristics,
          selectedCharacteristic: res.characteristics[0]?.uuid || ''
        });
      },
      fail: (err) => {
        console.error('获取特征值失败', err);
        wx.showToast({
          title: '获取特征值失败',
          icon: 'none'
        });
      }
    });
  },

  // 重新连接
  reconnect() {
    wx.createBLEConnection({
      deviceId: this.data.deviceId,
      success: () => {
        this.setData({ connected: true });
        this.getDeviceServices();
      },
      fail: (err) => {
        console.error('重连失败', err);
        wx.showToast({
          title: '重连失败',
          icon: 'none'
        });
      }
    });
  },

  // 断开连接
  disconnect() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId,
      success: () => {
        this.setData({ 
          connected: false,
          services: [],
          characteristics: [],
          selectedService: '',
          selectedCharacteristic: ''
        });
      }
    });
  },

  // 切换自动重连
  toggleAutoReconnect(e) {
    this.setData({ autoReconnect: e.detail.value });
  },

  // 选择服务
  onServiceChange(e) {
    const serviceId = this.data.services[e.detail.value].uuid;
    this.setData({ 
      selectedService: serviceId,
      selectedCharacteristic: ''
    });
    this.getCharacteristics(serviceId);
  },

  // 选择特征值
  onCharacteristicChange(e) {
    const characteristicId = this.data.characteristics[e.detail.value].uuid;
    this.setData({ selectedCharacteristic: characteristicId });
  },

  // 跳转到数据传输页面
  goToTransfer() {
    wx.navigateTo({
      url: `/pages/ble/transfer?deviceId=${this.data.deviceId}&deviceName=${this.data.deviceName}&serviceId=${this.data.selectedService}&characteristicId=${this.data.selectedCharacteristic}`
    });
  }
}); 