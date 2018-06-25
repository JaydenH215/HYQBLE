// pages/scanning/scanning.js
var appInstance = getApp()

Page({

    //初始化数据
    data: {
        devices_list:[]
    },

    //加载页面函数
    onLoad: function(options) {
        //读取环境信息
        this.setData({
            sysinfo: appInstance.globalData.sysinfo
        })
    },

    //显示页面函数
    onShow: function() {
        wx.closeBluetoothAdapter({
            success: function (res) {
            }
        })
    },

    //监视下拉刷新动作
    onPullDownRefresh: function () {
        var that = this
        //清空列表
        that.setData({
            devices_list:[]
        })
        //关闭蓝牙
        wx.closeBluetoothAdapter({
            success: function (res) {
                //打开蓝牙
                wx.openBluetoothAdapter({
                    success: function (res) {
                        //监听扫描到的设备
                        wx.onBluetoothDeviceFound(function (res) {
                            //获取扫描到的设备
                            wx.getBluetoothDevices({
                                success: function(res) {
                                    //通知视图层刷新数据
                                    that.setData({
                                        devices_list: res.devices
                                    })
                                }
                            })
                        
                        })
                        //开始扫描周围的设备
                        wx.startBluetoothDevicesDiscovery({
                            allowDuplicatesKey: false,
                            success: function (res) {
                            }
                        })
                    },

                    fail: function (res) {
                        wx.showModal({
                            title: 'Error',
                            content: 'Please open Bluetooth',
                            showCancel: false,
                        })
                    }
                })
            }
        })
        wx.stopPullDownRefresh()
    },

    //连接指定设备函数
    ConnectToDevice:function(event) {
        //停止搜索，开始连接
        wx.stopBluetoothDevicesDiscovery({
            complete: function(res){
                wx.createBLEConnection({
                    deviceId: event.currentTarget.id,
                    timeout: 2000,  //2s连接不上，超时处理
                    success:function(res) {
                        wx.navigateTo({
                            url: '/pages/connected/connected?ConnectedDeviceId='+event.currentTarget.id
                        })
                    },
                    fail:function(res) {
                        wx.showModal({
                            title: 'Warning',
                            content: 'Connect failed',
                            showCancel: false,
                        })
                    },
                })
            }
        })
    }
})