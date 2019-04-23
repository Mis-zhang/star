// pages/register/register.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    isError: true,
    codeTip: '获取验证码',
    secondTime: 60
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数 
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow() {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  getCodeFn() {
    let that = this, phoneNum = this.data.mob;
    if (!(/^1[34578]\d{9}$/.test(that.data.mob))) {
      that.setData({
        errorMsg: '请填写正确的手机号码',
        isError: ''
      })
    } else {
      var sign = util.hexMD5('account=' + phoneNum + gConfig.key);
      wx.request({
        url: gConfig.http + 'xcx/v2/common/getvalidcode',
        data: { account: phoneNum, sign: sign },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var sessionid = wx.getStorageSync('sessionid')
          if (sessionid == "" || sessionid == null) {
            wx.setStorageSync('sessionid', res.data.data)
          }
          wx.showToast({
            title: '短信已发送',
            icon: 'success',
            duration: 2000,
            mask: true
          })
        }
      })

      that.setData({
        codeTip: '60s',
        disabled: true
      })

      let clearTimerFn = (e) => {
        if (that.data.secondTime < 0) {
          clearInterval(timer)
          that.setData({
            codeTip: '重新获取',
            secondTime: 60,
            disabled: ''
          });
        }
      }
      let timer = setInterval(function () {
        that.setData({
          codeTip: `${that.data.secondTime - 1}s`,
          secondTime: that.data.secondTime - 1,
        })
        clearTimerFn();
      }, 1000)

    }
    setTimeout(function () {
      that.setData({ isError: true });
    }, 1500)
  },
  mobFn(event) {
    this.data.mob = event.detail.value;
  },
  nameFn(event) {
    this.data.name = event.detail.value;
  },
  codeNumFn(event) {
    this.data.codeNum = event.detail.value;
  },
  registerFn() {
    // 修改地址
    var that = this;
    var userData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync('wxData');
    if (!(/^1[34578]\d{9}$/.test(that.data.mob))) {
      that.setData({
        errorMsg: '请填写正确的手机号码',
        isError: ''
      })
    } else if (that.data.name == '' || that.data.name == null || (/^[ ]+$/.test(that.data.name))) {
      that.setData({
        errorMsg: '请输入您的姓名',
        isError: ''
      })
    } else if ((that.data.name).length > 8) {
      that.setData({
        errorMsg: '请将姓名控制在8位字符以内',
        isError: ''
      })
    } else if (that.data.codeNum == '' || that.data.codeNum == null) {
      that.setData({
        errorMsg: '请填写短信验证码',
        isError: ''
      })
    } else {
      var sessionid = wx.getStorageSync('sessionid')
      var sessionId = sessionid.sessionId
      if (sessionid != "" && sessionid != null) {
        var header = { 'content-type': 'application/json', 'Cookie': 'JSESSIONID=' + sessionId }
      } else {
        var header = { 'content-type': 'application/json' }
      }
      var sign = util.hexMD5('account=' + that.data.mob + '&name=' + that.data.name + '&validCode=' + that.data.codeNum + '&region=' + userData.region + '&wxOpenid=' + wxData.wxOpenid + gConfig.key);
      wx.request({
        url: gConfig.http + 'xcx/v2/common/registe',
        data: {
          account: that.data.mob,
          name: that.data.name,
          validCode: that.data.codeNum,
          region: userData.region,
          wxOpenid: wxData.wxOpenid,
          sign: sign
        },
        header: header,
        success: function (res) {
          var result = res.data.result;
          if (result.code == 200) {
            wxData.clientId = res.data.data.clientId;
            wxData.name=res.data.data.name;
            wxData.mob=res.data.data.mob;
            wx.setStorageSync('wxData',wxData)
            wx.showToast({
              title: '注册成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function () {
              wx.switchTab({
                url: '../index/index',
              })
            }, 1000)

          } else {
            that.setData({
              errorMsg: '验证码错误',
              isError: ''
            })
          }
        },
      })
    }
    setTimeout(function () {
      that.setData({ isError: true });
    }, 1500)
  },
  onShareAppMessage: function () {

  }
})