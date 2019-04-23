// pages/addrOpt/addrOpt.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {},
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      management: options.management
    })
  },
  onReady: function () {
    // 页面渲染完成a
  },
  onShow: function () {
    // 页面显示
    this.getAddrListFn()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  editorFn: function (event) {
    var that = this;
    var consignee, mob, region, address, isDefault, id;
    var addrData = that.data.addrData;
    var regionId = event.currentTarget.dataset.region;
    for (var i = 0; i < addrData.length; i++) {
      if (addrData[i].id == regionId) {
        wx.setStorageSync('modifyAddress',{
          consignee: addrData[i].consignee,
          mob: addrData[i].mob,
          region: addrData[i].region,
          address: addrData[i].address,
          isDefault: addrData[i].isDefault,
          id: addrData[i].id
        })
        wx.navigateTo({
          url: '../addrEdit/addrEdit?addressId=1'
        })
      }
    }
  },
  creatAddrFn: function () {
    wx.navigateTo({
      url: '../addrEdit/addrEdit?addressId=0'
    })
  },
  getAddrListFn: function () {
    // 获取地址列表
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + gConfig.key);
    if (wxData.clientId == 0) {
      console.log(wxData.clientId)
    } else {
    wx.request({
      // url: gConfig.http + 'address/list',
      url: gConfig.http + 'dpxcx/address/list',
      data: {
        clientId: wxData.clientId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var addrData=res.data.data;
        if(addrData.length>0){

        }else{
          wx.removeStorageSync('addressData')
        }
        that.setData({
          addrData: res.data.data
        })
      }
    })}
  },
  //选择地址
  choiceFn: function (event) {
    var that = this;
    var addrData = that.data.addrData;//地址列表
    wx.setStorageSync('couponId', 0)
    var index = parseInt(event.currentTarget.dataset.index);
    var consignee, mob, region, address, isDefault, id, regionName;
    for (var i = 0; i < addrData.length; i++) {
      if (index == i) {
        consignee = addrData[i].consignee,
          mob = addrData[i].mob,
          region = addrData[i].region,
          address = addrData[i].address,
          isDefault = addrData[i].isDefault,
          id = addrData[i].id,
          regionName = addrData[i].regionName
        that.setData({ isDefault: 1, region: region })
        if (that.data.management) {

        } else {
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1];   //当前页面
          var prevPage = pages[pages.length - 2];  //上一个页面
          //直接调用上一个页面的setData()方法，把数据存到上一个页面中
          prevPage.setData({
            search: 'ada'
          })
          wx.setStorage({
            key: 'addressData',
            data: {
              'consignee': consignee,
              'mobile': mob,
              'region': region,
              'address': address,
              'isDefault': isDefault,
              'id': id,
              'regionName': regionName,
              'value':regionName+address
            },
            success: function (res) {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      } else {
        that.setData({
          isDefault: 0
        })
      }
    }
  },
  onShareAppMessage: function () {

  }
})