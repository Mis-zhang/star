// pages/shoppingcar/shoppingcar.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    totalPrice: 0.00,
    isOrder: true,
    img: '',
    imgPath: gConfig.imgHttp,
    isData: false
  },
  onShow: function () {
    // 页面显示 
    var that = this;
    wx.setStorageSync('sig', '')
    that.shoppingCatListFn()
  },
  shoppingCatListFn: function () {
    var that = this,
      wxData = wx.getStorageSync('wxData'),
      sign = util.hexMD5('appId=' + gConfig.appId + '&wxOpenId=' + wxData.wxOpenid + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/showcarts',
      data: {
        appId: gConfig.appId,
        wxOpenId: wxData.wxOpenid,
        sign: sign
      },
      success: function (res) {
        if (res.data.result.code == '200') {
          var shoppingCatListData = res.data.data,
            goodslist = shoppingCatListData[0].myCarts[0].items,
            priceList = []
          for (var i = 0; i < goodslist.length; i++) {
            priceList[i] = goodslist[i].price.toFixed(2)
          }
          that.setData({ commodityList: goodslist, priceList: priceList, isShoppingData: true, isOrder: false, isData: false })
          that.totalPriceFn()
        } else if (res.data.result.code == '-1') {
          that.setData({ isShoppingData: false, isOrder: true, isData: true, totalPrice: 0 })
        } else {
          that.setData({ isShoppingData: false, isOrder: true, isData: true, totalPrice: 0 })
        }
      }
    })
  },
  // 加
  incrFn: function (e) {
    var that = this,
      skuId = e.currentTarget.dataset.cartid,
      goodslist = that.data.commodityList,
      qty
    for (let i = 0; i < goodslist.length; i++) {
      if (goodslist[i].skuId == skuId) {
        if ((parseInt(goodslist[i].qty) + 1) > 9999) {
          qty = 9999
        } else {
          qty = parseInt(goodslist[i].qty) + 1
        }
      }
    }
    that.modifyShoppingCatFn(skuId, qty)
    that.shoppingCatListFn()
  },
  // 减
  decrFn: function (e) {
    var that = this,
      skuId = e.currentTarget.dataset.cartid,
      goodslist = that.data.commodityList,
      qty
    for (let i = 0; i < goodslist.length; i++) {
      if (goodslist[i].skuId == skuId) {
        if (goodslist[i].moq == false) { 
          var moq = 1 
          } else { 
            var moq = goodslist[i].moq 
            }
        if ((parseInt(goodslist[i].qty) - 1) < moq) {
          qty = moq
        } else {
          qty = parseInt(goodslist[i].qty) - 1
        }
      }
    }
    that.modifyShoppingCatFn(skuId, qty)
    that.shoppingCatListFn()
  },
  // input手动输入
  goodsNumFn: function (e) {
    var that = this,
      goodslist = that.data.commodityList,
      skuId = e.currentTarget.dataset.cartid,
      val = Number(e.detail.value),
      qty;
    for (var i = 0; i < goodslist.length; i++) {
      if (goodslist[i].skuId == skuId) {
        if (goodslist[i].moq == false) { var moq = 1 } else { var moq = goodslist[i].moq }
        if (val == "" || val < (goodslist[i].moq)) {
          qty = goodslist[i].moq
        } else if (val >= 9999) {
          qty = 9999
        } else {
          qty = val
        }
      }

    }
    that.modifyShoppingCatFn(skuId, qty)
    that.shoppingCatListFn()
  },
  //删除
  removeFn: function (e) {
    var that = this,
      skuId = e.currentTarget.dataset.cartid,
      commodityList = that.data.commodityList,
      wxData = wx.getStorageSync('wxData')
    for (let i = 0; i < commodityList.length; i++) {
      if (commodityList[i].skuId == skuId) {
        var companyIdSkuIds = gConfig.companyId + '_' + commodityList[i].skuId,
          sign = util.hexMD5('appId=' + gConfig.appId + '&companyIdSkuIds=' + companyIdSkuIds + '&wxOpenId=' + wxData.wxOpenid + gConfig.key);
        wx.showModal({
          title: '删除提示',
          content: '您确定要删除该商品吗？',
          success: function (res) {
            if (res.confirm) {
              wx.request({
                url: gConfig.http + 'dpxcx/delcarts',
                data: {
                  appId: gConfig.appId,
                  companyIdSkuIds: companyIdSkuIds,
                  wxOpenId: wxData.wxOpenid,
                  sign: sign
                },
                success: function (res) {
                  if (res.data.result.code == '200') {
                  }
                  that.shoppingCatListFn()
                }
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
  },
  // 修改购物车
  modifyShoppingCatFn: function (skuId, qty) {
    var that = this,
      wxData = wx.getStorageSync('wxData'),
      commodityList = that.data.commodityList,
      appId = gConfig.appId
    for (let i = 0; i < commodityList.length; i++) {
      if (commodityList[i].skuId == skuId) {
        var companyIdSkuId = gConfig.companyId + '_' + skuId,
          sign = util.hexMD5('appId=' + gConfig.appId + '&companyIdSkuId=' + companyIdSkuId + '&qty=' + qty + '&wxOpenId=' + wxData.wxOpenid + gConfig.key);
        wx.request({
          url: gConfig.http + 'dpxcx/addorupdate',
          data: {
            appId: appId,
            companyIdSkuId: companyIdSkuId,
            qty: qty,
            wxOpenId: wxData.wxOpenid,
            sign: sign
          },
          success: function (res) {
          }
        })
      }
    }
  },
  totalPriceFn: function () {
    var that = this,
      commodityList = that.data.commodityList,
      totalPrice = 0
    for (let i = 0; i < commodityList.length; i++) {
      totalPrice += commodityList[i].price.toFixed(2) * parseInt(commodityList[i].qty)
    }
    that.setData({
      totalPrice: totalPrice.toFixed(2)
    })
  },
  settlementFn: function () {
    var that = this,
      commodityList = that.data.commodityList
    wx.setStorageSync('sig', true)
    wx.setStorageSync('orderData', commodityList)
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm',
    })
  },
  onShareAppMessage: function () {

  }
})