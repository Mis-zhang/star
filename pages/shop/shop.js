// pages/shop/shop.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var wxData = wx.getStorageSync('wxData'),
      companyId = wxData.companyId;
    that.getCompanyInfo(companyId);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  getCompanyInfo: function (companyId) {
    var that = this;
    var sign = util.hexMD5('companyId=' + companyId + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/company/info',
      data: {
        companyId: companyId,
        sign: sign
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var contentImg = res.data.data.content;
        that.setData({
          content: contentImg,
        })
        WxParse.wxParse('contentImg', 'html', contentImg, that, 5);
        that.setData({
          wxParseData: contentImg
        })
      }
    })
  },
  onShareAppMessage: function () {

  }
})