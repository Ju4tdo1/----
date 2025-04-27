Page({
    data: {
        isLoggedIn: false,
        userInfo: null,
        token: null
    },
    onLoad() {
        this.checkLoginStatus();
    },
    onShow() {
        // 返回此页面时检查登录状态
        this.checkLoginStatus();
    },
    checkLoginStatus() {
        const userInfo = wx.getStorageSync('userInfo');
        const token = wx.getStorageSync('token');
        
        if (userInfo && token) {
            console.log('用户已登录:', userInfo);
            this.setData({
                isLoggedIn: true,
                userInfo: userInfo,
                token: token
            });
            
            // 验证令牌
            this.verifyToken(token);
        } else {
            console.log('用户未登录');
            this.setData({
                isLoggedIn: false,
                userInfo: null,
                token: null
            });
        }
    },
    verifyToken(token) {
        // 替换为您的实际服务器URL
        const serverUrl = 'http://localhost:3000/api/user';
        
        wx.request({
            url: serverUrl,
            method: 'GET',
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    // 更新用户信息
                    this.setData({
                        userInfo: res.data
                    });
                    wx.setStorageSync('userInfo', res.data);
                } else {
                    // 令牌无效，清除存储并更新UI
                    this.handleLogout();
                }
            },
            fail: (err) => {
                console.error('验证token失败', err);
                // 网络错误时，我们保持用户登录状态
            }
        });
    },
    goToLogin() {
        if (this.data.isLoggedIn) return;
        
        wx.navigateTo({
            url: '/pages/login/login'
        });
    },
    onAvatarLoadError() {
        const userInfo = this.data.userInfo;
        if (userInfo) {
            userInfo.avatar = '';
            this.setData({ userInfo });
        }
    },
    // 选择头像
    chooseAvatar() {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePath = res.tempFilePaths[0];
                
                // 上传图片到服务器
                this.uploadAvatar(tempFilePath);
            }
        });
    },
    // 上传头像
    uploadAvatar(filePath) {
        wx.showLoading({
            title: '上传中...',
        });
        
        // 这里应该先上传图片到服务器，获取URL
        // 简化示例，直接使用本地路径
        const userInfo = this.data.userInfo;
        userInfo.avatar = filePath;
        
        // 更新用户信息
        this.updateUserInfo({ avatar: filePath });
    },
    // 编辑昵称
    editNickname() {
        wx.showModal({
            title: '编辑昵称',
            editable: true,
            placeholderText: '请输入昵称',
            success: (res) => {
                if (res.confirm && res.content) {
                    this.updateUserInfo({ nickname: res.content });
                }
            }
        });
    },
    // 更新用户信息
    updateUserInfo(data) {
        const token = this.data.token;
        if (!token) return;
        
        wx.request({
            url: 'http://localhost:3000/api/user',
            method: 'PUT',
            header: {
                'Authorization': `Bearer ${token}`
            },
            data: data,
            success: (res) => {
                if (res.statusCode === 200) {
                    // 更新本地用户信息
                    this.setData({
                        userInfo: res.data
                    });
                    wx.setStorageSync('userInfo', res.data);
                    
                    wx.showToast({
                        title: '更新成功',
                        icon: 'success',
                        duration: 2000
                    });
                } else {
                    wx.showToast({
                        title: '更新失败',
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            fail: (err) => {
                console.error('更新用户信息失败', err);
                wx.showToast({
                    title: '网络错误',
                    icon: 'none',
                    duration: 2000
                });
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },
    handleLogout() {
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('token');
        this.setData({
            isLoggedIn: false,
            userInfo: null,
            token: null
        });
    },
    logout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 调用服务器使令牌失效
                    this.invalidateToken();
                }
            }
        });
    },
    invalidateToken() {
        const token = this.data.token;
        if (!token) {
            this.handleLogout();
            return;
        }
        
        // 替换为您的实际服务器URL
        const serverUrl = 'http://localhost:3000/api/logout';
        
        wx.request({
            url: serverUrl,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (res) => {
                this.handleLogout();
                wx.showToast({
                    title: '已退出登录',
                    icon: 'success',
                    duration: 2000
                });
            },
            fail: (err) => {
                console.error('退出登录失败', err);
                // 即使服务器请求失败，也在本地登出
                this.handleLogout();
                wx.showToast({
                    title: '已退出登录',
                    icon: 'success',
                    duration: 2000
                });
            }
        });
    },
    // 跳转到蓝牙历史记录页面
    goToBleHistory() {
        wx.navigateTo({
            url: '/pages/ble/history'
        });
    },
    // 跳转到设置页面
    goToSettings() {
        wx.navigateTo({
            url: '/pages/ble/settings'
        });
    }
});
    