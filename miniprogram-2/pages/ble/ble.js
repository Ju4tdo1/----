Page({
    data: {
      devices: [],
      isScanning: false,
      timeout: 10,
      rssiThreshold: -80,
      bluetoothAvailable: false
    },
  
    onLoad() {
      this.loadSettings();
      this.initBluetooth();
    },
  
    onShow() {
      // 页面显示时检查蓝牙状态
      this.checkBluetoothStatus();
    },
  
    loadSettings() {
      const timeout = wx.getStorageSync('bleTimeout') || 10;
      const rssiThreshold = wx.getStorageSync('bleRssiThreshold') || -80;
      this.setData({
        timeout,
        rssiThreshold
      });
    },
  
    // 初始化蓝牙模块
    initBluetooth() {
      wx.openBluetoothAdapter({
        success: (res) => {
          this.setData({ bluetoothAvailable: true });
          
          // 监听蓝牙适配器状态变化
          wx.onBluetoothAdapterStateChange((res) => {
            this.setData({ 
              bluetoothAvailable: res.available 
            });
            
            if (!res.available) {
              this.stopScan();
            }
          });
  
          // 监听蓝牙连接状态
          wx.onBLEConnectionStateChange((res) => {
            const { deviceId, connected } = res;
            console.log(`设备 ${deviceId} ${connected ? '已连接' : '已断开'}`);
          });
        },
        fail: (err) => {
          this.setData({ bluetoothAvailable: false });
          wx.showToast({
            title: '请打开蓝牙',
            icon: 'none'
          });
        }
      });
    },
  
    // 检查蓝牙状态
    checkBluetoothStatus() {
      wx.getBluetoothAdapterState({
        success: (res) => {
          this.setData({ 
            bluetoothAvailable: res.available,
            isScanning: res.discovering
          });
        },
        fail: (err) => {
          this.setData({ 
            bluetoothAvailable: false,
            isScanning: false
          });
        }
      });
    },
  
    toggleScan() {
      if (this.data.isScanning) {
        this.stopScan();
      } else {
        this.startScan();
      }
    },
  
    startScan() {
      if (!this.data.bluetoothAvailable) {
        wx.showToast({
          title: '蓝牙不可用',
          icon: 'none'
        });
        return;
      }
  
      this.setData({
        isScanning: true,
        devices: []
      });
  
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false, // 不允许重复上报，提高性能
        interval: 300, // 扫描间隔
        success: (res) => {
          // 监听新设备发现事件
          wx.onBluetoothDeviceFound((res) => {
            res.devices.forEach(device => {
              if (!device.name && !device.localName) {
                return; // 过滤掉没有名称的设备
              }
              
              // 降低RSSI阈值，允许更多设备显示
              if (device.RSSI < -90) {
                return; // 过滤掉信号强度过低的设备
              }
              
              const idx = this.data.devices.findIndex(d => d.deviceId === device.deviceId);
              if (idx === -1) {
                this.setData({
                  devices: [...this.data.devices, {
                    ...device,
                    name: device.name || device.localName || '未知设备'
                  }]
                });
              } else {
                // 更新已存在设备的信号强度
                const devices = this.data.devices;
                devices[idx].RSSI = device.RSSI;
                this.setData({ devices });
              }
            });
          });
        },
        fail: (err) => {
          this.setData({ isScanning: false });
          wx.showToast({
            title: '扫描失败',
            icon: 'none'
          });
        }
      });
    },
  
    stopScan() {
      wx.stopBluetoothDevicesDiscovery({
        complete: () => {
          this.setData({ isScanning: false });
        }
      });
    },
  
    connectDevice(e) {
      const device = e.currentTarget.dataset.device;
      
      // 停止扫描
      if (this.data.isScanning) {
        this.stopScan();
      }
      
      wx.showLoading({
        title: '正在连接...',
      });
      
      // 先建立蓝牙连接
      wx.createBLEConnection({
        deviceId: device.deviceId,
        timeout: 10000,
        success: () => {
          wx.hideLoading();
          // 保存到历史记录
          const historyDevices = wx.getStorageSync('bleHistoryDevices') || [];
          const existingIndex = historyDevices.findIndex(d => d.deviceId === device.deviceId);
          if (existingIndex === -1) {
            historyDevices.unshift({
              deviceId: device.deviceId,
              name: device.name,
              lastConnected: new Date().toISOString()
            });
            wx.setStorageSync('bleHistoryDevices', historyDevices);
          }
          
          // 跳转到设备管理页面
          wx.navigateTo({
            url: `/pages/ble/device?deviceId=${device.deviceId}&deviceName=${device.name || '未知设备'}`
          });
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({
            title: '连接失败',
            icon: 'none'
          });
        }
      });
    },
    
    saveToHistory(device) {
      let history = wx.getStorageSync('bleHistory') || [];
      const idx = history.findIndex(d => d.deviceId === device.deviceId);
      
      if (idx === -1) {
        history.unshift(device);
        if (history.length > 10) {
          history = history.slice(0, 10);
        }
        wx.setStorageSync('bleHistory', history);
      }
    },
  
    onUnload() {
      // 页面卸载时清理蓝牙
      this.stopScan();
      wx.offBluetoothAdapterStateChange();
      wx.offBLEConnectionStateChange();
      wx.offBluetoothDeviceFound();
    },
  
    onHide() {
      // 页面隐藏时停止扫描
      if (this.data.isScanning) {
        this.stopScan();
      }
    }
  });