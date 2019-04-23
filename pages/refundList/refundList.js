var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isnone: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that=this;
      that.setData({
        status: options.status,
        imgPath: gConfig.imgHttp
      })
      that.refundFn();
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
    var that=this;
     that.setData({
       allstatus: false
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
    
  },
refundFn:function(){
  var that=this;
  var wxData = wx.getStorageSync('wxData');
  var sdate = that.data.sdate;
  var status = that.data.status
  var sign = util.hexMD5('clientId=' + wxData.clientId + '&companyId=' + gConfig.companyId + '&sdate=0' + '&status=' + status + gConfig.key)
   wx.request({
     url: gConfig.http + 'dpxcx/refund/list',
     data:{
       clientId: wxData.clientId,
       companyId: gConfig.companyId,
       sdate: 0,
       status: status,
       sign: sign
     },
     success: function(res){
       if(res.data.result.code==200){
         var listData = res.data.data;
         if (listData.length > 0) {
           for (var i = 0; i < listData.length;i++){
             listData[i].amount = listData[i].amount.toFixed(2)
             if (listData[i].status == 1){
               listData[i].mkstatus ="退款中"
             } else if (listData[i].status == 2){
               listData[i].mkstatus = "已退款"   
             }
           }
           that.setData({
             isnone: true,
             allListData: listData
           })
         } else {
           that.setData({
             isnone: false
           })
         }
       }else{
         that.setData({
           isnone: false
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})