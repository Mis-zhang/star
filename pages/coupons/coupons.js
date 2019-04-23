// pages/addrEdit/addrEdit.jsx
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    coupon1: true,
    isuser: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      info: options.info
    })
  },
  onShow: function () {
    // 页面显示
    var that = this;
    if (that.data.info) {
      that.setData({
        isAll: true,
        isuser: false
      })
      that.shoppriceDetailFn();
    } else {
      let wxData = wx.getStorageSync('wxData')
      let sign = util.hexMD5('clientId=' + wxData.clientId + '&status=' + 1 + gConfig.key);
      wx.request({
        url: gConfig.http + 'xcx/v2/coupon/mylist',
        data: {
          clientId: wxData.clientId,
          status: 1,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var Data = res.data.data;
          var discount;
          var apply = [];
          var unApply = [];
          for (var i = 0; i < Data.length; i++) {
            Data[i].useEndTime = Data[i].useEndTime.slice(0, 10)
            Data[i].useStartTime = Data[i].useStartTime.slice(0, 10)
            discount = (Data[i].discount).toString().length;
            Data[i].font = discount;
            if (Data[i].useStatus == 1) {
              apply.push(Data[i])
            } else {
              unApply.push(Data[i])
            }
          }
          that.setData({
            coupon: apply,
            coupond: unApply,
            isuser: true,
            use: '未使用',
            height: 40
          })
        }
      })
    }
  },
  usedNot: function (event) {
    var that = this;
    wx.removeStorageSync('couponData')
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中
    prevPage.setData({
      kl: 1
    })
    wx.navigateBack({
      delta: 1 // 回退前 delta(默认为1) 页面
    })
  },
  //切换至无效页面 
  unused: function (event) {
    var that = this;
    var now = new Date();
    var year = (now.getFullYear()).toString();

    var month = (now.getMonth() + 1).toString();
    if (month < 10) { month = "0" + month };

    var date = (now.getDate()).toString();
    if (date < 10) { date = "0" + date };

    var hour = (now.getHours()).toString();
    if (hour < 10) { hour = "0" + hour };

    var minutes = (now.getMinutes()).toString();
    if (minutes < 10) { minutes = "0" + minutes };

    var time = Number(year + month + date + hour + minutes);

    let wxData = wx.getStorageSync('wxData')
    let sign = util.hexMD5('clientId=' + wxData.clientId + '&status=' + 2 + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/v2/coupon/mylist',
      data: {
        clientId: wxData.clientId,
        status: 2,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var Data = res.data.data;
        var discount, endtime;
        for (var i = 0; i < Data.length; i++) {
          endtime = (Data[i].useEndTime).replace(/-/g, '');
          var next = endtime.replace(/:/g, '')
          var last = Number(next.replace(/ /g, ''))
          discount = (Data[i].discount).toString().length;
          Data[i].font = discount;
          if (Data[i].orderId > 0 && Data[i].useStatus == 1) {
            Data[i].used = "使用中"
          } else if (Data[i].orderId > 0 && Data[i].useStatus == 2) {
            Data[i].used = "已使用"
          } else if (last - time < 0) {
            Data[i].used = "已过期"
          }
          Data[i].useEndTime = Data[i].useEndTime.slice(0, 10)
          Data[i].useStartTime = Data[i].useStartTime.slice(0, 10)
        }
        that.setData({
          coupond: Data,
          isuser: true,
          height: 40
        })
      }
    })
    that.setData({
      coupon1: false,
      coupon2: true
    })
  },
  Use: function (event) {
    var that = this;
    if (!that.data.info) {
      that.shoppriceDetailFn();
      that.setData({
        isuser: ''
      })
    } else {
      let wxData = wx.getStorageSync('wxData')
      let sign = util.hexMD5('clientId=' + wxData.clientId + '&status=' + 1 + gConfig.key);
      wx.request({
        url: gConfig.http + 'xcx/v2/coupon/mylist',
        data: {
          clientId: wxData.clientId,
          status: 1,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var Data = res.data.data;
          var discount;
          var apply = [];
          var unApply = [];
          for (var i = 0; i < Data.length; i++) {
            Data[i].useEndTime = Data[i].useEndTime.slice(0, 10)
            Data[i].useStartTime = Data[i].useStartTime.slice(0, 10)
            discount = (Data[i].discount).toString().length;
            Data[i].font = discount;
            if (Data[i].useStatus == 1) {
              apply.push(Data[i])
            } else {
              unApply.push(Data[i])
            }
            if (Data[i].orderId > 0 && Data[i].useStatus == 1) {
              that.setData({
                used: '使用中',
                height: 40
              })
            }
          }
          that.setData({
            coupon: apply,
            coupond: unApply,
            isuser: true
          })
        }
      })
    }
    that.setData({
      coupon1: true,
      coupon2: false
    })

  },
  rightFn: function (event) {
    var that = this;
    if (!that.data.info) {
      var wxData = wx.getStorageSync('wxData')
      var cartid = wxData.companyId
      var id = event.currentTarget.dataset.id;
      var coupon = that.data.coupon;
      var goodsData = that.data.goodsData;
      var couponlistdata = [];
      for (var i = 0; i < coupon.length; i++) {
        if (coupon[i].id == id) {
          wx.setStorageSync('couponData', {
            id: id,
            discount: coupon[i].discount,
            code: coupon[i].code,
            fullPrice: coupon[i].fullPrice,
            name: coupon[i].name
          })
        }
      }
      wx.navigateBack({
        dleta: 1,
      })
    }
  },
  //获取买家所花费具体金额的方法
  shoppriceDetailFn: function (event) {
    var that = this;
    var discount;
    var couponData = wx.getStorageSync('coupons');
    for (var i = 0; i < couponData.length; i++) {
      couponData[i].useEndTime = couponData[i].useEndTime.slice(0, 10)
      couponData[i].useStartTime = couponData[i].useStartTime.slice(0, 10)
      discount = (couponData[i].discount).toString().length;
      couponData[i].font = discount;
    }
    that.setData({
      coupon: couponData,
      use: '点击使用',
      height: 20,
      heightline: 34
    })
  },
  onShareAppMessage: function () {

  }
})
