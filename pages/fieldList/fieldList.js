// pages/fieldList/fieldList.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchLoading: true,
    searchLoadingComplete: true,
    pageNo: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      itemId: options.itemId
    })
    that.fieldListFn(1)
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
  fieldListFn: function (pageNo){
    var that = this,
      itemId = that.data.itemId,
      pageNo = pageNo,
      pageSize = 10,
      region = '',
      status = 0
    var sign = util.hexMD5('itemId=' + itemId + '&pageNo=' + pageNo + '&pageSize=' + pageSize + '&region=' + region + '&status=' + status + gConfig.key);
    wx.showLoading({ title: '玩命加载中...' });
    wx.request({
      url: gConfig.http + 'dpxcx/plot/list',
      data: {
        itemId: itemId,
        pageNo: pageNo,
        pageSize: pageSize,
        region: region,
        status: status,
        sign: sign
      },
      success: function(res){
        wx.hideLoading()
        var farmList = []
        if(res.data.result.code == '200'){
          farmList = res.data.data.farmList
          var imgPath = gConfig.imgHttp;
          if (that.data.itemsData == undefined){
            that.setData({
              itemsData: farmList,
              farmList: farmList,
              imgPath: imgPath
            })
          }else {
            that.setData({
              itemsData: that.data.itemsData.concat(farmList),
              farmList: farmList
            })
            if (farmList == ''){
              that.setData({
                searchLoading: true,
                searchLoadingComplete: false
              })
            }
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    that.setData({
      searchLoading: false,
      searchLoadingComplete: true
    })
    that.fieldListFn(++that.data.pageNo)
    if (that.data.farmList == '') {
      that.setData({
        searchLoading: true,
        searchLoadingComplete: false
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})