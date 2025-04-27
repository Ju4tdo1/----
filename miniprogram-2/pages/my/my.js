Page({
  data: {},

  navigateToBleHistory() {
    wx.navigateTo({
      url: '/pages/ble/history'
    });
  },

  navigateToSettings() {
    wx.navigateTo({
      url: '/pages/ble/settings'
    });
  }
}); 