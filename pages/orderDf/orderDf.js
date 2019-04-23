// pages/orderList/orderList.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
let i = true;
let k = true;
Page({
  data: {
    ispaid: true,
    isfl: true,
    iskl: true,
    isnone: true,
    img: '',
    imgPath: gConfig.imgHttp
  },
  onLoad: function (options) {
    // wx.showLoading({
    //   title: '加载中...',
    // })
    // 页面初始化 options为页面跳转所带来的
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var isOpenPay = wxData.isOpenPay
    // var isOpenPay = 0;
    if (isOpenPay == 1) {
      that.setData({
        isDisplay: true,
        time: '三月内',
        payState: '全部订单',
        state: 1,
        status: 0,
        westatus: true,
        unstatus: true,
        allstatus: false
      })
      that.getOrderFn();
    } else {
      that.setData({
        isDisplay: false
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    let that = this;
    that.setData({
      timeData: [{ time: '三月内', state: 1 }, { time: '今年以内', state: 2 }, { time: '2016年', state: 2016 }, { time: '2015年', state: 2015 }, { time: '2014年', state: 2014 }, { time: '三年前', state: 3 }],
      paidData: [{ paid: '全部订单', status: 0 }, { paid: '未支付', status: 1 }, { paid: '已支付', status: 2 }],
      time: '三月内',
      payState: '全部订单',
      state: 1,
      status: 0,
      westatus: true,
      unstatus: true,
      allstatus: false
    })
    if (that.data.isDisplay) {
      that.getOrderFn();
    } else {
      that.saveorderFn();
    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  timeChoiceFn: function (event) {
    var that = this;
    if (i) {
      that.setData({
        iskl: false,
        isHandstand: true
      })
    } else {
      that.setData({
        iskl: true,
        isHandstand: false
      })
    }
    i = !i;
  },
  payChoiceFn: function (event) {
    var that = this;
    if (k) {
      that.setData({
        isfl: false,
        isHandStand: true
      })
    } else {
      that.setData({
        isfl: true,
        isHandStand: false
      })
    }
    k = !k;
  },
  paidFn: function (event) {
    var that = this;
    var paidData = that.data.paidData;
    var index = event.currentTarget.dataset.index;
    var status, statusData;
    for (var i = 0; i < paidData.length; i++) {
      if (index == i) {
        if (index == 0) {
          that.setData({
            westatus: true,
            unstatus: true,
            allstatus: false
          })
        } else if (index == 1) {
          that.setData({
            westatus: false,
            unstatus: true,
            allstatus: true
          })
        } else if (index == 2) {
          that.setData({
            westatus: true,
            unstatus: false,
            allstatus: true
          })
        }
        that.setData({
          status: paidData[i].status,
          payState: paidData[i].paid,
        })
      }
    }
    that.getOrderFn();
  },
  timeFn: function (event) {
    var that = this;
    var timeData = that.data.timeData;
    var index = event.currentTarget.dataset.index;
    for (var i = 0; i < timeData.length; i++) {
      if (index == i) {
        that.setData({
          state: timeData[i].state,
          time: timeData[i].time,
        })
      }
    }
    that.getOrderFn();
  },
  getOrderFn: function (event) {

    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var state = that.data.state;
    var status = 1;
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + state + '&status=' + status + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/order/list',
      data: {
        companyId: gConfig.companyId,
        clientId: wxData.clientId,
        sdate: state,
        status: status,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {

        var listData = res.data.data;
        if (listData.length > 0) {
          that.setData({
            isnone: true
          })
        } else {
          that.setData({
            isnone: false
          })
        }
        var j;
        for (var i = 0; i < res.data.data.length; i++) {
          for (j = 0; j < res.data.data[i].items.length; j++) {
            res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
          }
          listData[i].amount = listData[i].amount.toFixed(2);
          listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
          listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
          res.data.data[i].items = res.data.data[i].items;
          if (listData[i].couponDiscount) {
            that.setData({
              isMoney: false
            })
          } else {
            that.setData({
              isMoney: true
            })

          }
        }
        if (status == 1) {
          that.setData({
            listData: listData,
          })
        } else if (status == 2) {
          that.setData({
            unListData: listData,
          })
        } else if (status == 0) {
          var mkstatus;
          for (var k = 0; k < listData.length; k++) {
            if (listData[k].status >= 10 && listData[k].status <= 23) {
              listData[k].mkstatus = '待付款'
              listData[k].ispo = true
            } else if (listData[k].status >= 30 && listData[k].status <= 31) {
              listData[k].mkstatus = '待发货'
              listData[k].ispo = false
            } else if (listData[k].status >= 40 && listData[k].status <= 99) {
              listData[k].mkstatus = '配送中'
              listData[k].ispo = false
            } else if (listData[k].status == 100) {
              listData[k].mkstatus = '已完成'
              listData[k].ispo = false
            } else if (listData[k].status < 0) {
              listData[k].mkstatus = '已取消'
              listData[k].ispo = false
            }
          }
          that.setData({
            allListData: listData
          })

        }
      }
    })
  },
  //订单点击跳转订单详情页面
  orderDetailFn: function (event) {
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    var statuscode = event.currentTarget.dataset.statuscode
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId + '&status=' + that.data.status + '&statuscode=' + statuscode
    })
  },
  //取消订单
  cancleFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var orderId = event.currentTarget.dataset.orderid;
    if (wxData.isOpenPay == 1) {
      if (that.data.status == 0) {
        var orderList = that.data.allListData
      } else {
        var orderList = that.data.listData;
      }
    } else {
      var orderList = that.data.listData
    }

    var index = {};
    var sign = util.hexMD5('id=' + orderId + gConfig.key);
    for (let i = 0; i < orderList.length; i++) {
      orderList[i].index = i;//闭包
      if (orderList[i].id == orderId) {
        wx.showModal({
          title: '取消提示',
          content: '您确定要取消该订单吗？',
          success: function (res) {
            if (res.confirm) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1500,
              })
              orderList.splice(orderList[i].index, 1);/*从当前列表删除*/
              /*--重新渲染--*/
              wx.request({
                url: gConfig.http + 'local/xcx/order/del',
                data: { id: orderId, sign: sign },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  if (orderList.length > 0) {
                    if (wxData.isOpenPay == 1) {
                      if (that.data.status == 0) {
                        setTimeout(function () { that.setData({ allListData: orderList }) }, 1500)
                      } else {
                        setTimeout(function () { that.setData({ listData: orderList }) }, 1500)
                      }
                    } else {
                      setTimeout(function () { that.setData({ listData: orderList }) }, 1500)
                    }
                  } else {
                    if (wxData.isOpenPay == 1) {
                      if (that.data.status == 0) {
                        setTimeout(function () { that.setData({ allListData: orderList }) }, 1500)
                      } else {
                        setTimeout(function () { that.setData({ listData: orderList, isnone: false }) }, 1500)
                      }
                    } else {
                      setTimeout(function () { that.setData({ listData: orderList, isnone: false }) }, 1500)
                    }
                  }
                }
              })
            }
          }
        })
      }
    }
  },
  placeOrderFn: function (event) {
    // 下单方法
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('companyId=' + gConfig.companyId + '&orderId=' + orderId + '&wxOpenid=' + wxData.wxOpenid + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/wx/prepardId',
      data: {
        companyId: gConfig.companyId,
        orderId: orderId,
        wxOpenid: wxData.wxOpenid,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          'success': function (res) {
            that.getOrderFn()
          },
          'fail': function (res) {
            that.getOrderFn()
          }
        })
        // 微信支付接口
      }
    })
  },
  // 当商家不支持支付时
  saveorderFn: function (event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + 1 + '&status=' + 1 + gConfig.key);
    wx.request({
      url: gConfig.http + 'channel/xcx/order/list',
      data: {
        clientId: wxData.clientId,
        companyId: gConfig.companyId,
        sdate: 1,
        status: 1,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var listData = res.data.data;
        if (listData.length > 0) {
          that.setData({
            isnone: true
          })
        } else {
          that.setData({
            isnone: false
          })
        }
        var j;
        for (var i = 0; i < res.data.data.length; i++) {
          for (j = 0; j < res.data.data[i].items.length; j++) {
            res.data.data[i].items[j].price = res.data.data[i].items[j].price.toFixed(2);
          }
          listData[i].amount = listData[i].amount.toFixed(2);
          listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
          listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
          res.data.data[i].items = res.data.data[i].items;
          if (listData[i].couponDiscount) {
            that.setData({
              isMoney: false
            })
          } else {
            that.setData({
              isMoney: true
            })
          }
        }
        that.setData({
          listData: listData
        })
        for (var i = 0; i < listData.length; i++) {
          var listDataL = listData[i].items;

          for (var j = 0; j < listDataL.length; j++) {
            var imgs = gConfig.imgHttp + listDataL[j].img;
            that.setData({
              img: imgs,
            })
          }
        }
      }
    })
  },
  orderFn: function (event) {
    var that = this;
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId
    })
  },
  onShareAppMessage: function () {

  }
})