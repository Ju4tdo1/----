Page({
    data: {
      receivedData: [],
      inputValue: '',
      sentBytes: 0,
      receivedBytes: 0,
      isConnected: false,
      deviceId: '',
      serviceId: '',
      characteristicId: ''
    },
  
    onLoad(options) {
      if (options.deviceId) {
        this.setData({ deviceId: options.deviceId });
        this.connectDevice();
      }
    },
  
    // 连接蓝牙设备，找到支持写入的特征值
    connectDevice() {
      this.setData({
        sentBytes: 0,
        receivedBytes: 0,
        receivedData: [],
        isConnected: false,
        serviceId: '',
        characteristicId: ''
      });
      wx.createBLEConnection({
        deviceId: this.data.deviceId,
        success: () => {
          // 遍历所有服务，找到支持写入的特征值
          wx.getBLEDeviceServices({
            deviceId: this.data.deviceId,
            success: (res) => {
              let found = false;
              const services = res.services || [];
              services.forEach(service => {
                wx.getBLEDeviceCharacteristics({
                  deviceId: this.data.deviceId,
                  serviceId: service.uuid,
                  success: (res2) => {
                    const chars = res2.characteristics || [];
                    chars.forEach(char => {
                      if ((char.properties.write || char.properties.writeNoResponse) && !found) {
                        found = true;
                        this.setData({
                          serviceId: service.uuid,
                          characteristicId: char.uuid,
                          isConnected: true
                        });
                      }
                      if ((char.properties.notify || char.properties.indicate)) {
                        wx.notifyBLECharacteristicValueChange({
                          deviceId: this.data.deviceId,
                          serviceId: service.uuid,
                          characteristicId: char.uuid,
                          state: true
                        });
                      }
                    });
                  }
                });
              });
            }
          });
          wx.onBLECharacteristicValueChange((res) => {
            if (res.deviceId === this.data.deviceId) {
              const value = this.ab2str(res.value);
              this.onReceiveData(value);
            }
          });
        }
      });
    },
  
    // 接收到蓝牙数据
    onReceiveData(data) {
      const receivedData = [...this.data.receivedData, data];
      const receivedBytes = this.data.receivedBytes + this.getByteLength(data);
      this.setData({ receivedData, receivedBytes });
    },
  
    // 发送数据
    sendData() {
      const { inputValue, isConnected, deviceId, serviceId, characteristicId, sentBytes } = this.data;
      if (!inputValue || !isConnected || !serviceId || !characteristicId) return;
      const buffer = this.str2ab(inputValue);
      wx.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value: buffer,
        success: () => {
          const bytes = this.getByteLength(inputValue);
          this.setData({
            sentBytes: sentBytes + bytes,
            inputValue: ''
          });
          wx.showToast({ title: '发送成功', icon: 'success' });
        },
        fail: (err) => {
          wx.showToast({ title: '发送失败', icon: 'none' });
          console.error('发送失败', err);
        }
      });
    },
  
    // 清空接收区
    clearReceivedData() {
      this.setData({ receivedData: [], receivedBytes: 0 });
    },
  
    // 计算字节长度
    getByteLength(str) {
      let bytes = 0;
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code <= 0x7f) {
          bytes += 1;
        } else if (code <= 0x7ff) {
          bytes += 2;
        } else if (code <= 0xffff) {
          bytes += 3;
        } else {
          bytes += 4;
        }
      }
      return bytes;
    },
  
    ab2str(buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf));
    },
    str2ab(str) {
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    },
  
    onInputChange(e) {
      this.setData({ inputValue: e.detail.value });
    }
  });
  