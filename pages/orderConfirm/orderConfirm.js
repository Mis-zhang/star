// pages/orderConfirm/orderConfirm.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    isDisplay: true,
    value: '请选择收货地址',
    isSaveFn: "placeOrderFn",
    gray: "",
    img: '',
    isWxpayFn: 'wxpay',
    isPromo: true,
    PromoCode: '',
    promoDisable: true,
    isPromoText: true,
    coupontotal: true,
    discountPrice: '',
    isDiscountPrice: true,
    isarrt: [],
    textDecoration: '',
    color: '',
    yuanjia1: false,
    yuanjia2: true
  },
  onLoad: function(options) {
    this.setData({
      isDisplay: false,
      iscoupon: true,
    })
  },
  onShow: function() {
    // 页面显示
    var that = this;
    var sellData = wx.getStorageSync('sellData'),
      wxData = wx.getStorageSync('wxData');
    var isDisplay;

    that.setData({
      isDisplay: wxData.isOpenPay == 1 ? false : true,
      orderData: wx.getStorageSync('orderData')
    })
    //无默认地址时，选择地址--->退出--->再次进入应再次显示请选择地址
    var pageData = that.data.search
    if (pageData) {
      that.addressChoiceFn();
    } else {
      that.shoppriceDetailFn(); // 获取买家所花费的金额
      that.setDefaultAddrFn();
      that.setData({
        value: '请选择收货地址',
        mobile: '',
        name: ''
      })
    }
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },

  //收货地址选择
  addrOptFn: function(event) {
    var that = this;
    wx.navigateTo({
      url: '../addrOpt/addrOpt',
    })
  },

  addressChoiceFn: function(event) {
    var that = this;
    that.setData({
      value: '请选择收货地址',
      mobile: '',
      name: ''
    })
    var addressData = wx.getStorageSync('addressData');
    if (addressData) {
      //当地址自己选择时
      that.setData({
        value: addressData.value,
        mobile: addressData.mobile,
        name: addressData.consignee,
        id: addressData.id,
        region: addressData.region,
        isname: false,
        regionAddress: addressData.regionName
      })
      that.shoppriceDetailFn(); // 获取买家所花费的金额
    } else {
      //获取默认地址
      that.setDefaultAddrFn();
    }

  },
  //每种商品的不同总价
  totalFn: function(event) {
    var that = this;
    var zero = 0;
    var freightfee = Number(that.data.freightfee),
      // coupon = Number(that.data.cutfee),
      discount = Number(that.data.discount),
      items = that.data.items,
      ZPrice = 0;

    var preferentialPrice = that.data.preferentialPrice,
      discountPriceSum = that.data.discountPriceSum,
      realityPriceSum = that.data.realityPriceSum;

    for (var i = 0; i < items.length; i++) {
      ZPrice += items[i].realityPrice * items[i].qty;
    }

    var realfee = ZPrice + freightfee - discount;
    var preferentialPrice = (discountPriceSum + realityPriceSum) - discount + freightfee;

    if (discount > ZPrice) { //运费大于总金额
      if (freightfee != 0) {
        that.setData({
          realfee: freightfee.toFixed(2),
          realityPrice: ZPrice.toFixed(2),
          preferentialPrice: freightfee.toFixed(2)
        })
      } else {
        that.setData({
          realfee: zero.toFixed(2),
          realityPrice: ZPrice.toFixed(2),
          preferentialPrice: zero.toFixed(2)
        })
      }
    } else {
      that.setData({
        realfee: realfee.toFixed(2),
        realityPrice: ZPrice.toFixed(2),
        preferentialPrice: preferentialPrice.toFixed(2)
      })
    }
  },
  wxpay: function() {
    // 下单方法
    var that = this;
    var wxData = wx.getStorageSync('wxData'),
      sellData = wx.getStorageSync('sellData'),
      couponData = wx.getStorageSync('couponData'),
      companyData = wx.getStorageSync('sellData'),
      addressData = wx.getStorageSync('addressData');
    var orderInfoData = that.data.items;
    var regionDetail = that.data.region
    if (wxData.region == 0) {
      var region = wx.getStorageSync('sellData').region;
      var regionAddress = regionDetail
    } else {
      var region = wxData.region;
      var regionAddress = regionDetail
    }
    if (addressData) {
      var region = addressData.region;
      var regionAddress = addressData.region;
    } else {
      var regionAddress = regionDetail;
      //var region = regionDetail;
    }
    if (regionDetail) {
      var regionAddress = regionDetail;
      var region = regionDetail;
    } else {
      var regionAddress = '';
      if (wxData.region == undefined || wxData.region == '') {
        var region = sellData.region;
      } else {
        var region = wxData.region;
      }
    }

    let itemCarts = {};
    let items = {};
    for (let j = 0; j < orderInfoData.length; j++) {
      var companyId = wxData.companyId
      let ncompanyId = `N${companyId}`;
      items[orderInfoData[j].skuId] = {
        id: orderInfoData[j].skuId,
        qty: orderInfoData[j].qty,
      }
      itemCarts[ncompanyId] = {
        "clientId": wxData.clientId,
        "couponId": that.data.couponIdd,
        "companyId": gConfig.companyId,
        items,
        "region": region,
        salemanCode: that.data.PromoCodeData
      }
    }
    var data = {
      "buyer": wxData.clientId,
      "clientAddrId": that.data.id,
      itemCarts,
      "wxOpenid": wxData.wxOpenid
    }
    var sign = util.hexMD5('data=' + JSON.stringify(data) + gConfig.key);
    wx.removeStorageSync('couponData')
    if (that.data.mobile) {
      that.setData({
        isWxpayFn: ''
      })
      wx.request({
        url: gConfig.http + 'dpxcx/order/save',
        data: {
          data: data,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          wx.setStorageSync('shoppingcarData', [])
          // 微信支付接口
          wx.requestPayment({
            'timeStamp': res.data.data.timeStamp,
            'nonceStr': res.data.data.nonceStr,
            'package': res.data.data.package,
            'signType': 'MD5',
            'paySign': res.data.data.paySign,
            'success': function(res) {
              wx.redirectTo({
                url: '../orderList/orderList?status=0',
              })
            },
            'fail': function(res) {
              wx.redirectTo({
                url: '../orderList/orderList?status=0',
              })
            }
          })
          // 微信支付接口
        },
      })
      wx.redirectTo({
        url: '../index/index',
      })
    } else {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'loading',
        duration: 1000
      })
    }
  },
  //当地址列表存储的数据为空时执行以下方法
  setDefaultAddrFn: function() {
    var that = this;
    var companyData = wx.getStorageSync('sellData');
    var wxData = wx.getStorageSync('wxData');
    if (wxData.clientId == 0) {
      that.shoppriceDetailFn();
    } else {
      var sign = util.hexMD5('clientId=' + wxData.clientId + gConfig.key);
      wx.request({
        url: gConfig.http + 'dpxcx/address/list',
        data: {
          clientId: wxData.clientId,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          var addrList = res.data.data;
          that.setData({
            addrList: addrList
          })
          if (addrList.length > 0) {
            for (var i = 0; i < addrList.length; i++) {
              if (addrList[i].isDefault == 1) {
                that.setData({
                  value: addrList[i].regionName + addrList[i].address,
                  mobile: addrList[i].mob,
                  name: addrList[i].consignee,
                  id: addrList[i].id,
                  region: addrList[i].region,
                  isname: false
                })
              }
            }
            that.regionFn();
          } else {
            that.setData({
              isname: true,
              value: "请选择收货地址"
            })
            that.shoppriceDetailFn();
          }
        }
      })
    }


  },
  regionFn: function(event) {
    var that = this;
    var regionDetail = that.data.region;
    that.setData({
      region: regionDetail
    })
    that.shoppriceDetailFn();
  },
  //当商家不支持线上支付时，那么就执行以下方法
  placeOrderFn: function(event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData'),
      couponData = wx.getStorageSync('couponData'),
      companyData = wx.getStorageSync('sellData'),
      addressData = wx.getStorageSync('addressData'),
      sig = wx.getStorageSync('sig');
    var orderInfoData = that.data.items,
      regionDetail = that.data.region;
    if (wxData.region == 0) {
      var region = wx.getStorageSync('sellData').region;
      var regionAddress = regionDetail
    } else {
      var region = wxData.region;
      var regionAddress = regionDetail
    }
    if (addressData) {
      var region = addressData.region;
      var regionAddress = addressData.region;
    } else {
      var regionAddress = regionDetail;
      //var region = regionDetail;
    }
    if (regionDetail) {
      var regionAddress = regionDetail;
      var region = regionDetail;
    } else {
      var regionAddress = '';
      //var region = sellData.region;
      if (wxData.region == undefined || wxData.region == '') {
        var region = wx.getStorageSync('sellData').region;
      } else {
        var region = wxData.region;
      }
    }


    let itemCarts = {};
    let items = {};
    let ncompanyId;
    for (let j = 0; j < orderInfoData.length; j++) {
      var couponId = wx.getStorageSync('couponId');
      if (couponId == 0) {
        couponId = ''
      }
      var companyId = wxData.companyId
      ncompanyId = `N${companyId}`;
      items[orderInfoData[j].skuId] = {
        id: orderInfoData[j].skuId,
        qty: orderInfoData[j].qty,
      }
      itemCarts[ncompanyId] = {
        "clientId": wxData.clientId,
        "companyId": companyId,
        // "couponId": couponId,
        "items": items,
        "region": region,
        salemanCode: that.data.PromoCodeData
      }
    }
    var data = {
      "buyer": wxData.clientId,
      "clientAddrId": that.data.id,
      itemCarts,
      "wxOpenid": wxData.wxOpenid
    }
    var sign = util.hexMD5('data=' + JSON.stringify(data) + gConfig.key);
    var myMob = wx.getStorageSync('wxData').mob;
    wx.removeStorageSync('couponData')
    if (that.data.mobile && myMob) {
      wx.request({
        url: gConfig.http + 'dpxcx/order/save',
        data: {
          data: data,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          var result = res.data.result;
          if (result.code == 200) {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1500
            })
            wx.redirectTo({
              url: '../orderList/orderList?status=0'
            })
            // wx.setStorageSync('couponId',0);
            if (sig == true) {
              wx.setStorageSync('shoppingcarData', [])
            }
          } else if (result.code == -1) {


            for (let j = 0; j < orderInfoData.length; j++) {
              ncompanyId = `N${companyId}`;
              items[orderInfoData[j].skuId] = {
                id: orderInfoData[j].skuId,
                qty: orderInfoData[j].qty,
              }
              itemCarts[ncompanyId] = {
                "companyId": companyId,
                "couponId": '',
                "items": items,
                "region": region,
                salemanCode: that.data.PromoCodeData
              }
            }
            var data = {
              "buyer": wxData.clientId,
              "clientAddrId": that.data.id,
              itemCarts,
              "wxOpenid": wxData.wxOpenid
            }
            var sign = util.hexMD5('data=' + JSON.stringify(data) + gConfig.key);
            wx.removeStorageSync('couponData')
            wx.showModal({
              title: '温馨提示',
              content: result.message,
              success: function(res) {
                if (res.confirm) {
                  wx.request({
                    url: gConfig.http + 'dpxcx/order/save',
                    data: {
                      data: data,
                      sign: sign
                    },
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function(res) {
                      wx.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 1500
                      })
                      if (sig == true) {
                        wx.setStorageSync('shoppingcarData', [])
                      }
                      wx.redirectTo({
                        url: '../orderList/orderList?status=0'
                      })
                    }
                  })
                } else if (res.cancel) {

                }
              }
            })
          } else if (that.data.value == "请选择收货地址") {
            wx.showToast({
              title: '请填写收货地址',
              icon: 'loading',
              duration: 1000
            })
          } else {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1000,
              success: function(res) {
                wx.redirectTo({
                  url: '../orderList/orderList?status=0'
                })
              }
            })
          }
        }
      })
    } else if (that.data.value == "请选择收货地址") {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'loading',
        duration: 1000
      })
    } else {
      wx.showToast({
        title: '请填写收货地址',
        icon: 'loading',
        duration: 1000
      })
    }

  },

  //获取买家所花费具体金额的方法
  shoppriceDetailFn: function(event) {
    var orderInfoData = wx.getStorageSync('orderData'),
      sellData = wx.getStorageSync('sellData'),
      wxData = wx.getStorageSync('wxData'),
      addressData = wx.getStorageSync('addressData'),
      modifyAddress = wx.getStorageSync('modifyAddress');
    var that = this,
      regionDetail = that.data.region;
    if (wxData.region == 0) {
      var region = sellData.region;
      var regionAddress = regionDetail
    } else {
      var region = wxData.region;
      var regionAddress = regionDetail
    }

    if (addressData) {
      var region = addressData.region;
      var regionAddress = addressData.region;
    } else {
      var regionAddress = regionDetail;
      //var region = regionDetail;
    }
    if (regionDetail) {
      var regionAddress = regionDetail;
      var region = regionDetail;
    } else {
      var regionAddress = '';
      if (wxData.region == undefined || wxData.region == '') {
        var region = sellData.region;
      } else {
        var region = wxData.region;
      }
    }

    let data = {};
    let items = {};
    if (wx.getStorageSync('sig') == true) {
      for (let j = 0; j < orderInfoData.length; j++) {
        var companyId = gConfig.companyId;
        var clientId = wx.getStorageSync("wxData").clientId;
        let ncompanyId = `N${companyId}`;
        items[orderInfoData[j].skuId] = {
          id: orderInfoData[j].skuId,
          qty: orderInfoData[j].qty
        }
        data[ncompanyId] = {
          clientId: clientId,
          companyId: companyId,
          items: items,
          region: region,
          salemanCode: that.data.PromoCodeData
        }
      }
    } else {
      for (let j = 0; j < orderInfoData.length; j++) {
        var companyId = orderInfoData[j].companyId
        var clientId = wx.getStorageSync("wxData").clientId;
        let ncompanyId = `N${companyId}`;
        items[orderInfoData[j].skuId] = {
          id: orderInfoData[j].skuId,
          qty: orderInfoData[j].moq
        }
        data[ncompanyId] = {
          clientId: clientId,
          companyId: companyId,
          items: items,
          region: region,
          salemanCode: that.data.PromoCodeData
        }
      }
    }
    var sign = util.hexMD5('data=' + JSON.stringify(data) + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/order/amount',
      data: {
        data: data,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        var goodsData = res.data.data,
          sumfreight = 0,
          items = goodsData[0].itemList,
          qty = items[0].qty,
          realityPrice = items[0].realityPrice * items[0].qtyl,
          discountPrice = items[0].discountPrice; //优惠码
        var discount = goodsData[0].coupon.discount;
        var couponinfo = [];
        var images = [];
        var acomPrc = [];
        var discountPriceArr = [];
        var couponData = wx.getStorageSync('couponData');
        var orderData = wx.getStorageInfoSync('orderData');
        var showyhm = 0;

        for (var i = 0; i < items.length; i++) {
          var imgs = (items[i].img.split('.'))[0] + '.' + (items[i].img.split('.'))[1] + '.220x220.' + (items[i].img.split('.'))[1];
          images.push(gConfig.imgHttp + imgs);
          acomPrc[i] = items[i].realityPrice.toFixed(2);
          discountPriceArr[i] = items[i].discountPrice.toFixed(2);
          if (items[i].discountPrice != 0) {
            showyhm += items[i].discountPrice;
          }
        }
        if (showyhm > 0) {
          that.setData({
            isyhm: false
          })
        } else {
          that.setData({
            isyhm: true
          })
        }

        that.setData({
          img: images,
          couponIdd: res.data.data[0].coupon ? res.data.data[0].coupon.id : 0,
          qty: qty,
          discountPrice: discountPrice.toFixed(2),
          discountPriceArr: discountPriceArr,
          discount: discount,
          acomPrc: acomPrc
        })
        for (var z = 0; z < goodsData.length; z++) {
          sumfreight += goodsData[z].freight;
          var couponinfo = couponinfo.concat(goodsData[z].coupons)
        }
        that.setData({
          isSaveFn: "placeOrderFn",
          isWxpayFn: 'wxpay'
        })
        that.setData({
          items: items,
          coupons: {}, //couponinfo,
          freightfee: sumfreight.toFixed(2),
          couponinfo: couponinfo,
        })
        wx.setStorageSync('freightfee', that.data.freightfee)
        if (goodsData[0].coupon == null) {
          var couponinfo = that.data.coupons;
          var couponData = wx.getStorageSync('couponData')
          that.setData({
            // cutfee: '0.00',
            iscoupon: true,
            coupontxt: '暂无可用优惠劵！'
          })
          that.totalFn();
        } else {
          var couponinfo = that.data.coupons;
          var couponData = wx.getStorageSync('couponData')
          var coupon = goodsData[0].coupon;
          var couponId = goodsData[0].coupon.id;
          wx.setStorageSync('couponId', couponId)
          if (couponId) {
            that.setData({
              // cutfee: coupon.discount.toFixed(2),
              discount: coupon.discount.toFixed(2),
              iscoupon: false
            })
          } else {
            that.setData({
              cutfee: '0.00',
              iscoupon: true,
              coupontxt: '暂无可用优惠劵！'
            })
          }
          that.totalFn();
        }
      },
      fail: function(res) {
        that.setData({
          iscoupon: true
        })
      }
    })
  },
  onShareAppMessage: function() {

  },
  //优惠码
  PromoCodeFn: function() {
    var that = this;
    that.setData({
      isPromo: false,
    })
  },

  PromoCodeCancel: function(e) { //优惠码取消
    var that = this;
    var PromoCodeData = wx.getStorageSync('PromoCodeData')
    this.setData({
      isPromo: true,
      promoDisable: true,
      PromoCodeData: PromoCodeData,

    })
    if (this.data.PromoCodeData == '' || this.data.PromoCodeData == undefined) {
      this.setData({
        coupontotal: true,
        promoDisable: false,
        isPromoText: true,
        realfeeNo: false,
        promoDisable: true,
        isDiscountPrice: true,
        inputValue: '',
        textDecoration: '',
        color: ''
      })
    }
    if (PromoCodeData != '') {
      that.setData({
        inputValue: PromoCodeData,
        textDecoration: '',
        color: ''
      })
    }
    console.log(that.data.PromoCodeData)
  },
  PromoCodeConfirm: function (e) { //优惠码确认
    var that = this;
    if (that.data.PromoCodeData == '' || that.data.PromoCodeData == undefined) {
      that.setData({ //用户不输入的情况下表示不使用优惠码
        isPromo: true,
        promoDisable: true
      })
      that.shoppriceDetailFn();
      wx.setStorageSync('PromoCodeData', '');
      var freightfee = Number(that.data.freightfee), //运费
        discount = Number(that.data.discount), //优惠券
        discountPrice = Number(that.data.discountPrice), //优惠码
        realityPrice = Number(that.data.realityPrice); //商品总金额
      var preferentialPrice = realityPrice
      that.setData({
        textDecoration: '',
        color: '',
        coupontotal: true,
        promoDisable: true,
        isPromoText: true,
        realfeeNo: false,
        isDiscountPrice: true,
      })
    } else {
      // console.log("优惠码：" + this.data.PromoCodeData);
      var orderInfoData = wx.getStorageSync('orderData'),
        sellData = wx.getStorageSync('sellData'),
        wxData = wx.getStorageSync('wxData'),
        addressData = wx.getStorageSync('addressData'),
        modifyAddress = wx.getStorageSync('modifyAddress');
      var that = this,
        regionDetail = that.data.region;
      if (wxData.region == 0) {
        var region = sellData.region;
        var regionAddress = regionDetail
      } else {
        var region = wxData.region;
        var regionAddress = regionDetail
      }

      if (addressData) {
        var region = addressData.region;
        var regionAddress = addressData.region;
      } else {
        var regionAddress = regionDetail;
        //var region = regionDetail;
      }
      if (regionDetail) {
        var regionAddress = regionDetail;
        var region = regionDetail;
      } else {
        var regionAddress = '';
        if (wxData.region == undefined || wxData.region == '') {
          var region = sellData.region;
        } else {
          var region = wxData.region;
        }
      }

      let data = {};
      let items = {};
      if (wx.getStorageSync('sig') == true) {
        for (let j = 0; j < orderInfoData.length; j++) {
          var companyId = gConfig.companyId;
          var clientId = wx.getStorageSync("wxData").clientId;
          let ncompanyId = `N${companyId}`;
          items[orderInfoData[j].skuId] = {
            id: orderInfoData[j].skuId,
            qty: orderInfoData[j].qty
          }
          data[ncompanyId] = {
            clientId: clientId,
            companyId: companyId,
            items: items,
            region: region,
            salemanCode: that.data.PromoCodeData
          }
        }
      } else {
        for (let j = 0; j < orderInfoData.length; j++) {
          var companyId = orderInfoData[j].companyId
          var clientId = wx.getStorageSync("wxData").clientId;
          let ncompanyId = `N${companyId}`;
          items[orderInfoData[j].skuId] = {
            id: orderInfoData[j].skuId,
            qty: orderInfoData[j].moq
          }
          data[ncompanyId] = {
            clientId: clientId,
            companyId: companyId,
            items: items,
            region: region,
            salemanCode: that.data.PromoCodeData
          }
        }
      }
      var sign = util.hexMD5('data=' + JSON.stringify(data) + gConfig.key);
      wx.request({
        url: gConfig.http + 'dpxcx/code/validate',
        data: {
          data: data,
          sign: sign
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.result.code == 200) {
            that.shoppriceDetailFn();
            that.isstrickoutFn();
            var zero = 0;
            var freightfee = Number(that.data.freightfee), //运费
              discount = Number(that.data.discount), //优惠券
              discountPrice = Number(that.data.discountPrice), //优惠码
              realityPrice = Number(that.data.realityPrice), //商品总金额
              items = that.data.items,
              ZPrice = 0;

            preferentialPrice = 0;
            var discountPriceSum = 0; //存放优惠码的金额总和
            var realityPriceSum = 0; //存放没有优惠码的金额总和
            var isDiscountPriceArr = []
            for (var i = 0; i < items.length; i++) {
              var flag = false;
              ZPrice += items[i].realityPrice * items[i].qty //商品总价
              if (items[i].discountPrice != 0) {
                flag = true;
                var Sum = items[i].discountPrice * items[i].qty;
                var qty = items[i].qty;
                var yhmPrice = items[i].realityPrice;

                discountPriceSum += Sum;
                that.setData({
                  qty: qty,
                  yhmPrice: yhmPrice,
                  isDiscountPrice: false,
                  discountPrice: discountPrice.toFixed(2)
                })
              } else {
                var Sum = items[i].realityPrice * items[i].qty;
                var yhmPrice = 0;
                realityPriceSum += Sum;
                that.setData({
                  yhmPrice: yhmPrice
                })
              }
              isDiscountPriceArr.push(that.data.isDiscountPrice)
            }
            that.setData({
              isDiscountPriceArr: isDiscountPriceArr,
            })
            var realfee = ZPrice + freightfee - discount; //实付金额
            //实付金额 = 优惠码的总和 + 没优惠码的总和 -优惠券 + 运费
            var preferentialPrice = (discountPriceSum + realityPriceSum) - discount + freightfee
            if (discount > ZPrice) {
              if (freightfee != 0) {
                that.setData({
                  realfee: freightfee.toFixed(2), //实付金额
                  realityPrice: ZPrice.toFixed(2), //商品金额
                  preferentialPrice: freightfee.toFixed(2), //优惠后的价格
                  discountPriceSum: discountPriceSum,
                  realityPriceSum,
                  realityPriceSum: realityPriceSum
                })
              } else {
                that.setData({
                  realfee: zero.toFixed(2),
                  realityPrice: ZPrice.toFixed(2),
                  preferentialPrice: zero.toFixed(2),
                  discountPriceSum: discountPriceSum,
                  realityPriceSum: realityPriceSum
                })
              }
            } else {
              that.setData({
                realfee: realfee.toFixed(2),
                realityPrice: ZPrice.toFixed(2),
                preferentialPrice: preferentialPrice.toFixed(2),
                discountPriceSum: discountPriceSum,
                realityPriceSum: realityPriceSum
              })
            }
            that.setData({
              coupontotal: false,
              discountSpread: (realityPrice - discountPriceSum).toFixed(2),
              discountPriceSum: discountPriceSum,
              realityPriceSum: realityPriceSum,
              discountPrice: discountPrice.toFixed(2),
              realityPrice: ZPrice.toFixed(2),
              discountCount: (discountPriceSum + realityPriceSum).toFixed(2),
              realfeeNo: true,
              isPromo: true,
              promoDisable: true,
              isPromoText: false
            })
          } else {
            that.shoppriceDetailFn();
            wx.setStorageSync('PromoCodeData', '');
            var freightfee = Number(that.data.freightfee), //运费
              discount = Number(that.data.discount), //优惠券
              discountPrice = Number(that.data.discountPrice), //优惠码
              realityPrice = Number(that.data.realityPrice); //商品总金额
            var preferentialPrice = realityPrice
            that.setData({
              promoMessage: res.data.result.message,
              textDecoration: '',
              color: '',
              coupontotal: true,
              promoDisable: false,
              isPromoText: true,
              realfeeNo: false,
              isDiscountPrice: true,
            })
          }
        },
        fail: function (res) {

        }
      })

    }

  },
  isstrickoutFn: function() {
    var that = this;
    that.setData({
      textDecoration: 'line-through',
      color: '#b2b2b2'
    })
  },
  EditPromoCode: function(e) { //编辑优惠码
    this.setData({
      PromoCodeData: e.detail.value,
      promoDisable: true
    })
  }
})













