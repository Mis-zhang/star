// pages/center/center.js
Page({
  data: {
    isKeFu:false,
    "brandList": [],
    "wordindex": '退款订单',
    "toView": '#',

  },
  onShow: function () {
    // 页面显示
    var that = this;
    // 获取用户名称和头像
    that.getSystemInfo();
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName
        })
      }
    })
    that.setData({
      isOpenPay: wx.getStorageSync('wxData').isOpenPay
    })
    // if (wx.getStorageSync('searchData')){
    //   wx.removeStorageSync('searchData') 
    // };
    that.setData({ isMask: true })
  },
  getSystemInfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenheight: (res.windowHeight) * 2 + 'rpx',
          screenwidth: (res.windowWidth) * 2 + 'rpx'
        })
      }
    })
  },
  myAddrListFn: function (e) {
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../addrOpt/addrOpt?management=' + true,
    })
  },
  myOrderListFn: function () {
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../orderList/orderList?dataIndex=0',
    })
  },
  myKefu: function (){
    var that=this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../kefu/kefu',
    })
  },
  myDaiPay: function (){
    var that = this;
    that.setData({ isMask: false })
    wx.navigateTo({
      url: '../orderList/orderList?dataIndex=1',
    })
  },
  myDaiFh:function(){
    var that=this;
    wx.navigateTo({
      url: '../orderList/orderList?dataIndex=2',
    })
  },
  myDaiSh: function(){
    var that = this;
    wx.navigateTo({
      url: '../orderList/orderList?dataIndex=3',
    })
  },
  jinzhiFn:function(){
    wx.showToast({
      title: '不支持微信支付，暂不能查看',
      icon: 'none',
      duration: 2000,
    })
  },
  myComplete: function () {
    var that = this;
    wx.navigateTo({
      url: '../orderList/orderList?dataIndex=4',
    })
  },
  orderRefund: function(){
    var that = this;
    wx.navigateTo({
      url: '../orderList/orderList?dataIndex=5',
    }) 
  },
  onShareAppMessage: function () {

  }
})