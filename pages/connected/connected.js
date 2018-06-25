// pages/connected/connected.js
var appInstance = getApp()

//ArrayBuffer转字符串
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}
//字符串转ArryBuffer
function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

Page({
    //初始化数据
    data: {
        sendtext:null,
        rectext:null,
        device_id:null,
        service_uuid:"",
        service_tx_char_uuid:"",
        tx_char_cccd: "Enable",
        service_rx_char_uuid:""
    },

    //显示页面函数
    onLoad: function (options) {
        var that = this
        //读取系统信息，记录设备id
        that.setData({
            sysinfo: appInstance.globalData.sysinfo,
            device_id: options.ConnectedDeviceId
        })
        //发现服务，Demo默认只有一个自定义服务
        wx.getBLEDeviceServices({
            deviceId:that.data.device_id,
            fail:function(res) {
                wx.showModal({
                    title: 'Error',
                    content: 'Found Services failed, please try again.',
                    showCancel: false,})
            },
            success:function(res) {
                that.setData({
                    service_uuid:res.services[0].uuid
                })
                //发现特征值，默认只有一个notify和一个write
                wx.getBLEDeviceCharacteristics({
                    deviceId: that.data.device_id,
                    serviceId: that.data.service_uuid,
                    fail: function (res) {
                        wx.showModal({
                            title: 'Error',
                            content: 'Found Characteristic failed, please try again.',
                            showCancel: false,
                        })
                    },
                    success: function(res) {
                        //循环找出notify和write的uuid
                        for(var i=0; i<res.characteristics.length; i++) {
                            if (res.characteristics[i].properties.notify == true) {
                                that.setData({
                                    service_rx_char_uuid: res.characteristics[i].uuid
                                })
                            }
                            if (res.characteristics[i].properties.write == true) {
                                that.setData({
                                    service_tx_char_uuid: res.characteristics[i].uuid
                                })                            
                            }
                        }
                    },
                })
            }
        })
    },

    //接收输入字符串
    BindConfirm: function(event) {
        if (event.currentTarget.id == "sendtext_id") {
            this.setData({
                sendtext:event.detail.value,
            })
        }
    },

    //写特征值
    WriteCommandWithoutResponse: function (event) {
        var that = this
        //构造发送的ArrayBuffer
        let buffer = str2ab(that.data.sendtext)
        wx.writeBLECharacteristicValue({
            deviceId:that.data.device_id,
            serviceId: that.data.service_uuid,
            characteristicId: that.data.service_tx_char_uuid,
            value: buffer,
            fail:function(res) {
                wx.showModal({
                    title: 'Error',
                    content: 'Sent failed.',
                    showCancel: false,
                }) 
            },
            success:function(res) {
            }
        })
    },

    //清空发送文本
    ClearSendText: function (event) {
        this.setData({
            sendtext: null,
        })
    },

    //清空接收文本
    ClearRecText: function (event) {
        this.setData({
            rectext: null,
        })
    },

    //使能notify
    EnableNotify: function(event) {
        var that = this
        if (that.data.tx_char_cccd == "Enable") {
            that.setData({
                tx_char_cccd: "Disable",
            })
            //使能notify
            wx.notifyBLECharacteristicValueChange({
                deviceId: that.data.device_id,
                serviceId: that.data.service_uuid,
                characteristicId: that.data.service_rx_char_uuid,
                state:true,
                success: function(res) {
                    //成功使能notify，监视接收到的数据
                    wx.onBLECharacteristicValueChange(function(res) {
                        let buffer = ab2str(res.value)
                        that.setData({
                            rectext:buffer
                        })
                    })
                }
            })
        } else {
            that.setData({
                tx_char_cccd: "Enable",
            })
            wx.notifyBLECharacteristicValueChange({
                deviceId: that.data.device_id,
                serviceId: that.data.service_uuid,
                characteristicId: that.data.service_rx_char_uuid,
                state: false,
                success: function (res) {
                }
            })
        }
    },
})