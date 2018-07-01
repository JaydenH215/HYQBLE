//app.js
App({
  onLaunch: function () {
      var res = wx.getSystemInfoSync()
      
      console.log('机型：' + res.model)
      console.log('操作系统：' + res.system)
      console.log('像素比：'+ res.pixelRatio)
      console.log('屏幕宽度：' + res.windowWidth)
      console.log('屏幕高度：' + res.windowHeight)
      console.log('微信版本：' + res.version)
      console.log('客户端平台：'+ res.platform)

      this.globalData.sysinfo = res
      console.log(this.globalData.sysinfo)

  },

  globalData: {
      
  }

})