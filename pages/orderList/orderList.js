// pages/orderList/orderList.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
let i = true;
let k = true;
Page({
  data: {
    pgselected: false,
    isnone: true, // 暂时没有订单
    img: '',
    imgPath: gConfig.imgHttp,
    sdate: 0,
    noshouhuo: true,
    tankuang: true,
    checked: false,
    orderNav: ['全部订单', '待付款', '待发货', '待收货', '已完成', '退款订单'],
    dataIndex: 0,
    isMoney: true,
    dataIndexTi: Number
  },
  onLoad: function(options) {
      this.setData({
        dataIndexTi: options.dataIndex
      })
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    let dataIndexTi = this.data.dataIndexTi
    var that = this,
      isOpenPay = wx.getStorageSync('wxData').isOpenPay;
    if (!dataIndexTi) {
      that.setData({
        dataIndex: 0
      })
    } else {
      that.setData({
        dataIndex: dataIndexTi
      })
    };
    if (isOpenPay == 1) {
      that.setData({
        isDisplay: true,
        isOpenPayNav: true
      })
      if (that.data.dataIndex == 5) {
        that.refundOrderList()
      } else {
        that.getOrderFn(0, that.data.dataIndex);
      }
    } else {
      that.setData({
        isDisplay: false,
        isOpenPayNav: false
      })
      that.saveorderFn(0, that.data.dataIndex);
      that.getStatusTitleFn()
    }
    that.clearShoppingCatFn()
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  

  //不同状态显示title
  getStatusTitleFn: function() {
    var that = this;
    var dataIndex = parseInt(that.data.dataIndex);
    //根据状态改变title标题
    switch (dataIndex) {
      case 0:
        wx.setNavigationBarTitle({
          title: '全部订单列表'
        })
        break;
      case 1:
        wx.setNavigationBarTitle({
          title: '待付款订单列表'
        })
        break;
      case 2:
        wx.setNavigationBarTitle({
          title: '待发货订单列表'
        })
        break;
      case 3:
        wx.setNavigationBarTitle({
          title: '待收货订单列表'
        })
        break;
      case 4:
        wx.setNavigationBarTitle({
          title: '已完成订单列表'
        })
        break;
      case 5:
        wx.setNavigationBarTitle({
          title: '退款订单列表'
        })
        break;
      default:
        wx.setNavigationBarTitle({
          title: '订单列表'
        })
    }
  },
  //全部订单
  getOrderFn: function(sdate, status) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + sdate + '&status=' + status + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/order/list',
      data: {
        companyId: gConfig.companyId,
        clientId: wxData.clientId,
        sdate: sdate,
        status: status,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.getStatusTitleFn();
        if (res.data.result.code == 200) {
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
          for (var i = 0; i < listData.length; i++) {
            for (var j = 0; j < listData[i].items.length; j++) {
              listData[i].items[j].price = listData[i].items[j].price.toFixed(2);
            }
            listData[i].amount = listData[i].amount.toFixed(2);
            listData[i].couponDiscount = listData[i].couponDiscount.toFixed(2);
            listData[i].retailPayAmount = listData[i].retailPayAmount.toFixed(2);
            listData[i].items = listData[i].items;

            if (listData[i].couponDiscount) {
              that.setData({
                isMoney: false,
              })
            } else {
              that.setData({
                isMoney: true
              })
            }
          }
          if (status == 1) {
            // if (wx.getStorageSync('wxData').isOpenPay == 1)
            that.setData({
              listData: listData,
              westatus: false,
              unstatus: true,
              noshouhuo: true,
              wancheng: true,
              allstatus: true,
              refundOrder: true
            })
          } else if (status == 2) {
            var skumDfh;
            for (var e = 0; e < listData.length; e++) {
              if (listData[e].status == 30) {
                listData[e].skumDfh = '待发货'
              } else if (listData[e].status == 31) {
                listData[e].skumDfh = '备货中'
              }
            }
            that.setData({
              unListData: listData,
              unstatus: false,
              westatus: true,
              noshouhuo: true,
              wancheng: true,
              allstatus: true,
              refundOrder: true
            })
          } else if (status == 3) {
            that.setData({
              unlistreceived: listData,
              westatus: true,
              noshouhuo: false,
              unstatus: true,
              wancheng: true,
              allstatus: true,
              refundOrder: true
            })
          } else if (status == 4) {
            that.setData({
              unlistreceived: listData,
              westatus: true,
              noshouhuo: true,
              unstatus: true,
              wancheng: false,
              allstatus: true,
              refundOrder: true
            })
          } else if (status == 0) {
            var mkstatus;
            for (var k = 0; k < listData.length; k++) {
              if (listData[k].status >= 10 && listData[k].status <= 20 || listData[k].status == 22 || listData[k].status == 23) {
                listData[k].mkstatus = '待付款'
                listData[k].ispo = true
              } else if (listData[k].status == 30) {
                listData[k].mkstatus = '待发货'
                listData[k].ispo = false
                that.setData({
                  getRefund: false
                })
              } else if (listData[k].status >= 40 && listData[k].status <= 99) {
                listData[k].mkstatus = '配送中'
                listData[k].ispo = false
              } else if (listData[k].status == 100) {
                listData[k].mkstatus = '已完成'
                listData[k].ispo = false
              } else if (listData[k].status == -1) {
                listData[k].mkstatus = '已取消'
                listData[k].ispo = false
              } else if (listData[k].status == -4) {
                listData[k].mkstatus = '已申请退款'
                listData[k].ispo = false
              } else if (listData[k].status == 31) {
                listData[k].mkstatus = '备货中'
                listData[k].ispo = false
                that.setData({
                  getRefund: false
                })
              } else if (listData[k].status == -99) {
                listData[k].mkstatus = '超时关闭'
                listData[k].ispo = false
              }
            }
            that.setData({
              allListData: listData,
              westatus: true,
              unstatus: true,
              noshouhuo: true,
              wancheng: true,
              allstatus: false,
              refundOrder: true
            })
          }
        }
      }
    })
  },
  // 当商家不支持支付时
  saveorderFn: function(sdate, status) {
    var status = status
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + sdate + '&status=' + status + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/order/list',
      data: {
        clientId: wxData.clientId,
        companyId: gConfig.companyId,
        sdate: sdate,
        status: status,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
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
  //订单点击跳转订单详情页面
  orderDetailFn: function(event) {
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    var statuscode = event.currentTarget.dataset.statuscode;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId + '&status=' + that.data.status + '&statuscode=' + statuscode
    })
  },
  //取消订单
  cancleFn: function(event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData')
    var orderId = event.currentTarget.dataset.orderid;
    if (wxData.isOpenPay == 1) {
      if (that.data.dataIndex == 0) {
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
      if (orderList[i].id == orderId) {
        wx.showModal({
          title: '取消提示',
          content: '您确定要取消该订单吗？',
          success: function(res) {
            if (res.confirm) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1500,
              })
              var sign = util.hexMD5('orderId=' + orderId + gConfig.key)
              wx.request({
                url: gConfig.http + 'dpxcx/order/del',
                data: {
                  orderId: orderId,
                  sign: sign
                },
                header: {
                  'content-type': 'application/json'
                },
                success: function(res) {
                  if (wx.getStorageSync('wxData').isOpenPay == 1) {
                    that.getOrderFn(0, that.data.dataIndex);
                  } else {
                    that.saveorderFn(0, that.data.dataIndex);
                  }

                }
              })
            }
          }
        })
      }
    }
  },
  // 下单方法
  placeOrderFn: function(event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var orderId = event.currentTarget.dataset.orderid;
    var sign = util.hexMD5('companyId=' + gConfig.companyId + '&orderId=' + orderId + '&wxOpenid=' + wxData.wxOpenid + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/wx/pay',
      data: {
        companyId: gConfig.companyId,
        orderId: orderId,
        wxOpenid: wxData.wxOpenid,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        //微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign,
          'success': function(res) {
            // that.getOrderFn()
            that.getOrderFn(0, that.data.dataIndex);
            // that.saveorderFn(0, that.data.dataIndex);
          },
          'fail': function(res) {
            // that.getOrderFn()
            that.getOrderFn(0, that.data.dataIndex);
            // that.saveorderFn(0, that.data.dataIndex);
          }
        })
        // 微信支付接口
      }
    })
  },
  //订单详情内tab切换
  tabToggleFn: function(event) {
    var that = this;
    var status = event.currentTarget.dataset.status;
    switch (status) {
      case 0: //全部订单
        that.getOrderFn(0, status);
        that.saveorderFn(0, status);
        that.setData({
          dataIndex: status
        })
        break;
      case 1: //待付款
        that.getOrderFn(0, status);
        that.saveorderFn(0, status);
        that.setData({
          dataIndex: status
        })
        break;
      case 2: //待发货
        that.getOrderFn(0, status);
        that.saveorderFn(0, status);
        that.setData({
          dataIndex: status
        })
        break;
      case 3: //待收货
        that.getOrderFn(0, status);
        that.saveorderFn(0, status);
        that.setData({
          dataIndex: status
        })
        break;
      case 4: //已完成订单
        that.getOrderFn(0, status);
        that.saveorderFn(0, status);
        that.setData({
          dataIndex: status
        })
        break;
      case 5: //退款订单
        that.refundOrderList();
        that.setData({
          dataIndex: status
        })
        break;
    }
  },
  //进入订单详情
  orderFn: function(event) {
    var that = this;
    var orderId = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + orderId
    })
  },
  // 退款功能
  tuikuan: function(e) {
    var that = this;
    console.log("退款成功");
    that.setData({
      //tankuang: false,
      tkorderId: e.target.dataset.orderid,
    })
    that.showbox();

  },

  bindchangeCrop: function(e) {
    var that = this;
    that.setData({
      value: e.detail.value
    })
  },
  showbox: function() {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function() {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  checkboxChange: function(e) {
    var that = this;
    that.setData({
      reason: e.detail.value
    })
  },
  quxiaoFn: function() {
    var that = this;
    that.setData({
      tankuang: true,
      checked: false,
      reason: ""
    })
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()

    })
    setTimeout(function() {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 200)
  },
  quedingFn: function() {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&orderId=' + that.data.tkorderId + '&reason=' + that.data.reason + gConfig.key);
    if (!that.data.reason || that.data.reason == "") {
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none',
        duration: 1000,
      })
    } else {
      var animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'linear'
      })
      that.animation = animation
      animation.translateY(200).step()
      that.setData({
        animationData: animation.export()

      })
      setTimeout(function() {
        animation.translateY(0).step()
        that.setData({
          animationData: animation.export(),
          chooseSize: false
        })
      }, 200);
      wx.request({
        url: gConfig.http + 'dpxcx/order/refund',
        data: {
          clientId: wxData.clientId,
          orderId: that.data.tkorderId,
          reason: that.data.reason,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          if (res.data.result.code == 200) {
            wx.showToast({
              title: '申请退款成功',
              icon: 'success',
              duration: 2000,
              success: function(res) {
                that.getOrderFn(0, that.data.dataIndex);
              }
            })
          }
          that.setData({
            tankuang: true,
            checked: false
          })
        }
      })
    }
  },
  orderClickFn: function(e) {
    var that = this,
      dataIndex = e.currentTarget.dataset.index;
    that.setData({
      dataIndex: dataIndex
    })
    if (wx.getStorageSync('wxData').isOpenPay == 0) {
      that.saveorderFn(0, dataIndex)
    }
    if (wx.getStorageSync('wxData').isOpenPay == 1 && dataIndex != 4) {
      that.getOrderFn(0, dataIndex);
    }
    if (wx.getStorageSync('wxData').isOpenPay == 1 && dataIndex == 4) {
      that.refundOrderList()
    }
  },
  // 清空购物车
  clearShoppingCatFn: function() {
    var that = this,
      orderData = wx.getStorageSync('orderData'),
      sig = wx.getStorageSync('sig'),
      appId = gConfig.appId,
      wxOpenId = wx.getStorageSync('wxData').wxOpenid,
      companyIdSkuIds = ''
    if (sig == true) {
      for (let i = 0; i < orderData.length; i++) {
        companyIdSkuIds += orderData[i].companyIdSkuId + ','
      }
      var sign = util.hexMD5('appId=' + appId + '&companyIdSkuIds=' + companyIdSkuIds.slice(0, companyIdSkuIds.length - 1) + '&wxOpenId=' + wxOpenId + gConfig.key);
      wx.request({
        url: gConfig.http + 'dpxcx/delcarts',
        data: {
          appId: appId,
          companyIdSkuIds: companyIdSkuIds.slice(0, companyIdSkuIds.length - 1),
          wxOpenId: wxOpenId,
          sign: sign
        },
        success: function(res) {
          console.log(res)
        }
      })
    }
  },
  // 退款订单列表
  refundOrderList: function() {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sdate = 0;
    var status = 0
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=' + sdate + '&status=' + status + gConfig.key)
    that.data.allListData = [];
    that.data.listData = [];
    that.data.unListData = [];
    that.data.unlistreceived = [];
    that.setData({
      allListData: that.data.allListData,
      listData: that.data.listData,
      unListData: that.data.unListData,
      unlistreceived: that.data.unlistreceived
    })
    wx.request({
      url: gConfig.http + 'dpxcx/refund/list',
      data: {
        clientId: wxData.clientId,
        companyId: gConfig.companyId,
        sdate: sdate,
        status: status,
        sign: sign
      },
      success: function(res) {
        that.getStatusTitleFn();
        if (res.data.result.code == 200) {
          var listData = res.data.data;
          console.log(listData)
          if (listData.length > 0) {
            for (var i = 0; i < listData.length; i++) {
              listData[i].amount = listData[i].amount.toFixed(2)
              if (listData[i].status == 1) {
                listData[i].mkstatus = "退款中"
              } else if (listData[i].status == 2) {
                listData[i].mkstatus = "已退款"
              }
            }
            that.setData({
              isnone: true,
              refundOrderData: listData,
              westatus: true,
              unstatus: true,
              noshouhuo: true,
              wancheng: true,
              allstatus: true,
              refundOrder: false
            })
          } else {
            that.setData({
              isnone: false
            })
          }
          console.log(that.data.refundOrderData)
        } else {
          that.setData({
            isnone: false
          })
        }
      }
    })
  },
  // 签收
  qianshouFn: function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderid;
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + '&orderId=' + orderId + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/order/signbyId',
      data: {
        clientId: wxData.clientId,
        orderId: orderId,
        sign: sign
      },
      success: function (res) {
        console.log()
        if (res.data.result.code == 200) {
          wx.showToast({
            title: res.data.result.message,
            icon: 'success',
            duration: 2000,
            success: function () {
              that.setData({
                isQs: true
              })
              if (that.data.dataIndex == 0) {
                wx.navigateTo({
                  url: '../orderList/orderList?dataIndex=' + that.data.dataIndex
                })
              } else {
                wx.navigateTo({
                  url: '../orderList/orderList?dataIndex=4'
                })
              }
            }
          })
        }
      }
    })
  },
  onShareAppMessage: function() {

  },
  //评价
  getAssess(e) {
    var orderId = e.currentTarget.dataset.orderid;
    var items = e.currentTarget.dataset.items;
    console.log('标签上的数组--------->',items);
    wx.setStorageSync('ItemsData', items);
    var wxData = wx.getStorageSync('wxData');
    wx.navigateTo({
      url: '../publish/index?orderId=' + orderId + '&clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId
    })
  },
  getReview(e) {
    var orderId = e.currentTarget.dataset.orderid;
    var items = e.currentTarget.dataset.items;
    console.log('标签上的数组--------->',items);
    wx.setStorageSync('ItemsData', items);
    var wxData = wx.getStorageSync('wxData');
    wx.navigateTo({
      url: '../starreview/index?orderId=' + orderId + '&clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId
    })
  }
})