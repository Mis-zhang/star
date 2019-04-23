// pages/search/search.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    iscome: true,
    dot: false,
    focus: true,
    tap: 1,
    showSearch: true,
    showTile: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (!options.categoryId){
      that.setData({
        searchname: options.searchShop
      })
      that.clickFn()
    }else{
      that.setData({
        categoryId: options.categoryId,
      })
      that.searchlistFn()
    }
   
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    // this.classfyFn();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  // 上拉加载
  onReachBottom: function () {
    var that=this;
    if (that.data.searcshophList){
      that.dotfor();
      that.setData({ dot: false, iscome: false })
      var timerSt = setTimeout(function () { that.clickFn() }, 1500)
    }else{
      that.dotfor();
      that.setData({ dot: false, iscome: false })
      var timerSt = setTimeout(function () { that.searchlistFn() }, 1500)
    }
  },
  dotfor: function () {
    var that = this;
    that.setData({ dotclass: ['on', '', ''] });
    var dotclass = that.data.dotclass;
    var n = 1;
    var timer = setInterval(function () {
      n = n > dotclass.length ? 1 : n;
      for (var i = 0; i < dotclass.length; i++) {
        if ((n - 1) == i) {
          dotclass[i] = 'on'
          that.setData({ dotclass: dotclass })
        } else {
          dotclass[i] = ''
          that.setData({ dotclass: dotclass })
        }
      }
      n++;
      if (n == 4) { clearInterval(timer) }
    }, 500)

  },
  //搜索商品请求
  clickFn: function (event) {
       var that=this;
       var tap=that.data.tap;
       wx.request({
          //  url: gConfig.http + 'channel/xcx/search/v2',
          url: gConfig.http + 'dpxcx/search',
           data:{
             companyId: gConfig.companyId,
             keyWord: that.data.searchname,
             pageNum: tap,
             perpage: 10
           },
           header: {
             'content-type': 'application/x-www-form-urlencoded'
           },
           method: 'post',
           success: function(res){
               if(res.data.result.code==200){
                  var searchList=res.data.data.list;
                  if (searchList.length>0){
                    for (var i = 0; i < searchList.length; i++) {
                      searchList[i].price = searchList[i].price.toFixed(2)
                      // var imgs = gConfig.imgHttp + shopDetailData[i].defaultImg
                      searchList[i].defaultImg = gConfig.imgHttp+ (searchList[i].defaultImg.split('.'))[0] + '.' + (searchList[i].defaultImg.split('.'))[1] + '.220x220.' + (searchList[i].defaultImg.split('.'))[1];

                    }
                    if (tap == 1) {
                      that.setData({
                        searcshophList: searchList,
                        tap: tap + 1
                      })
                    } else {
                      var searchList = (that.data.searcshophList).concat(searchList)
                      that.setData({
                        searcshophList: searchList,
                        tap: tap + 1,
                      })
                    }
                    that.setData({
                      fullListSize: res.data.data.fullListSize,
                      showSearch: false,
                      showTile: true
                    })
                  }else{
                    if(tap==1){
                      that.setData({
                        showSearch: true,
                        showTile: false
                      })
                    }else{
                      that.setData({
                        showSearch: false,
                        showTile: true
                      })  
                    }
                    
                  }
               }else{
                 if (tap == 1) {
                   that.setData({
                      showSearch: true,
                      showTile: false
                   })
                 }else{
                  
                   setTimeout(function () { that.setData({ iscome: true }) }, 1500)
                   that.setData({
                     showSearch: false,
                     showTile: true,
                     dot: true 
                   })
                 }
               }
           }    
       })
  },

  // 分类搜索
  // searchlistFn: function () {
  //   var that = this;
  //   var wxData = wx.getStorageSync('wxData');
  //   var companyId = gConfig.companyId;
  //   var tap = that.data.tap;
  //   var sign = util.hexMD5('companyCategoryId=' + that.data.categoryId + '&companyId=' + companyId + '&pageNum=' + tap + '&perpage=' + 10 + gConfig.key);
  //   wx.request({
  //     url: gConfig.http + 'channel/xcx/search',
  //     data: {
  //       companyCategoryId: that.data.categoryId,
  //       companyId: companyId,
  //       pageNum: tap,
  //       perpage: 10,
  //       sign: sign
  //     },
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     success: function (res) {
  //        if(res.data.result.code==200){
  //          var classlist = res.data.data.list;
  //          if (classlist.length > 0){
  //            for (var i = 0; i < classlist.length; i++) {
  //              classlist[i].price = classlist[i].price.toFixed(2)
  //              classlist[i].defaultImg = gConfig.imgHttp + (classlist[i].defaultImg.split('.'))[0] + '.' + (classlist[i].defaultImg.split('.'))[1] + '.220x220.' + (classlist[i].defaultImg.split('.'))[1];
  //            }
  //                that.setData({
  //                  fullListSize: res.data.data.fullListSize,
  //                  showSearch: false,
  //                  showTile: true
  //                })
  //                console.log(classlist)
  //                if(tap==1){
  //                  that.setData({
  //                    searchfenList: classlist,
  //                    tap: tap+1
  //                  })
  //                }else{
  //                  var shopsData = that.data.searchfenList.concat(classlist)
  //                  //再次进行页面重绘
  //                  that.setData({
  //                    searchfenList: shopsData,
  //                    tap: tap + 1
  //                  })
  //                }
             

  //          }else{
  //            if(tap==1){
  //              that.setData({
  //                showTile: false,
  //                showSearch: true
  //              })
  //            }else{
  //              that.setData({
  //                showTile: true,
  //                showSearch: false
  //              })
  //            }
  //          }
  //        }else{
  //          if(tap==1){
  //            that.setData({
  //              showTile: false,
  //              showSearch: true
  //            })
  //          }else{
  //            that.setData({ dot: true })
  //            setTimeout(function () { that.setData({ iscome: true }) }, 1500)
  //            that.setData({
  //              showTile: true,
  //              showSearch: false
  //            })
  //          }
  //        }

  //     }
  //   })
  // },
  // 全部商品点击跳转详情
  shopdetailFn: function (event) {
    var that = this;
    that.setData({
      isMask: false
    })
    if (that.data.categoryId){
      var searchData = that.data.searchfenList
      var searchsDetailData = that.data.searchfenList;
    }else{
      var searchData = that.data.searcshophList
      var searchsDetailData = that.data.searcshophList;
    }
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData');
   
    // wx.getStorageSync('searchData')
    var searchname = that.data.searchname;
    if (wxData.region == "" || !wxData.region) {
      var region = sellData.region;
    } else {
      var region = wxData.region;
    }
    var shopData = that.data.shopsData;
    var index = parseInt(event.currentTarget.dataset.index);
    
    var searchname = that.data.searchname;
    var itemId;
    // if (searchData) {
      for (var i = 0; i < searchsDetailData.length; i++) {
        if (index == i) {
          itemId = searchsDetailData[i].id
          wx.navigateTo({
            url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region,
          })
        }
      }
    // } else {
    //   for (var i = 0; i < shopData.length; i++) {
    //     if (index == i) {
    //       itemId = shopData[i].id
    //       if (shopData[i].price == 0) {
    //         that.setData({
    //           isMask: true
    //         })
    //         wx.showToast({
    //           title: '暂不销售',
    //           icon: 'success',
    //           duration: 2000
    //         })
    //       } else {
    //         wx.navigateTo({
    //           url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region + '&fullregion=' + that.data.region,
    //         })
    //       }
    //     }
    //   }
    // }
    that.setData({
      dot: false,
    })
  },
  onShareAppMessage: function () {

  }
})