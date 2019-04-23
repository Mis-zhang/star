// pages/modelField/modelField.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tap: 1,
    pageNum: 1,
    searchsDetailData: [],
    optiosLists: [],
    iscome: true,
    dot: false,
    noShoplist: true,
    lists: true,
    alllists: true,
    searchShop: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.searchSection();
    this.bindPickerFn();
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
    var that = this;
    that.setData({
      searchShop: ''
    })
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onReachBottom: function () {
    var that = this;
    that.dotfor();
    if (that.data.searchsDetailData) {
      if (that.data.searchDetail == '') {
        that.setData({ dot: true, iscome: false })
      } else {
        //that.dotfor();
        that.setData({ dot: false, iscome: false })
        var timerSt = setTimeout(function () { that.bindPickerFn() }, 1500)
      }
    } else {
      if (that.data.classlistData == '') {
        that.setData({ dot: true, iscome: false })
        var flag = that.data.flag;
        if (flag == true) {
          that.setData({ dot: false, iscome: false })
          var timerSt = setTimeout(function () { that.bindPickerFL(that.data.currentId) }, 1500)
          that.setData({
            optiosList: that.data.optiosList
          })
        } else {
          //that.dotfor();
          that.setData({ dot: true, iscome: false })
        }
      } else {
        //that.dotfor();
        that.setData({ dot: false, iscome: false })
        var timerSt = setTimeout(function () { that.bindPickerFL(that.data.currentId) }, 1500)
      }
    }
  },

  // 获取分类名称
  searchSection: function () {
    var that = this;
    // that.setData({
    //   isSection: false
    // })
    var sign = util.hexMD5('companyId=' + gConfig.companyId + '&parentId=' + 0 + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/company/categorys',
      data: {
        companyId: gConfig.companyId,
        parentId: 0,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var arryX = res.data.data;
        var searchData;
        arryX.unshift({
          "id": 0,
          "name": "全部"
        })
        that.setData({
          searchData: arryX,
          nuber: 0
        })

      }
    })
  },
  // 点击分类名称，获取分类商品
  bindPickerChange: function (e) {
    var that = this;
    that.setData({
      nuber: e.currentTarget.dataset.index,
      currentId: e.currentTarget.dataset.id,
      tap: 1,
      lists: false,
      alllists: true,
      searchsDetailData: "",
      optiosList: "",
      iscome: true,
      flag: true
    })
    var tap = that.data.tap;
    var wxData = wx.getStorageSync('wxData');
    var companyId = wxData.companyId;
    var sign = util.hexMD5('companyCategoryId=' + e.target.dataset.id + '&companyId=' + companyId + '&pageNum=' + tap + '&perpage=' + 10 + gConfig.key);
    wx.request({
      //url: gConfig.http + 'dpxcx/search',
      url: gConfig.http + 'dpxcx/items',
      data: {
        companyCategoryId: e.target.dataset.id,
        companyId: companyId,
        pageNum: tap,
        perpage: 10,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result.code == 200) {
          var classlist = res.data.data[0].list;
          if (classlist.length > 0) {
            for (var i = 0; i < classlist.length; i++) {
              classlist[i].price = classlist[i].price.toFixed(2)
              classlist[i].defaultImg = gConfig.imgHttp + (classlist[i].defaultImg.split('.'))[0] + '.' + (classlist[i].defaultImg.split('.'))[1] + '.220x220.' + (classlist[i].defaultImg.split('.'))[1];

            }
            that.setData({
              noShoplist: true,
              optiosList: classlist,
              tap: tap + 1
            })
          } else {
            that.setData({
              noShoplist: false
            })
          }

        } else {
          that.setData({
            lists: true,
            noShoplist: false
          })
        }

      }
    })

  },
  //上拉 获取分类商品
  bindPickerFL: function (currentId) {
    var that = this;
    that.setData({
      tap: 1,
      lists: false,
      alllists: true,
      iscome: true
    })
    var pageNum = that.data.pageNum;
    var wxData = wx.getStorageSync('wxData');
    var companyId = wxData.companyId;
    var sign = util.hexMD5('companyCategoryId=' + currentId + '&companyId=' + companyId + '&pageNum=' + pageNum + '&perpage=' + 10 + gConfig.key);
    wx.request({
      //url: gConfig.http + 'dpxcx/search',
      url: gConfig.http + 'dpxcx/items',
      data: {
        companyCategoryId: currentId,
        companyId: companyId,
        pageNum: pageNum,
        perpage: 10,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result.code == 200) {
          var classlist = res.data.data[0].list;
          that.setData({
            classlistData: classlist
          })
          if (classlist.length > 0) {
            for (var i = 0; i < classlist.length; i++) {
              classlist[i].price = classlist[i].price.toFixed(2)
              classlist[i].defaultImg = gConfig.imgHttp + (classlist[i].defaultImg.split('.'))[0] + '.' + (classlist[i].defaultImg.split('.'))[1] + '.220x220.' + (classlist[i].defaultImg.split('.'))[1];

            }
            if (that.data.pageNum == 1) {
              that.setData({
                optiosList: classlist,
                optiosLists: classlist,
                pageNum: pageNum + 1,
                flag: false
              })
            } else {
              var shopsLis = (that.data.optiosList).concat(classlist);
              that.setData({
                optiosList: shopsLis,
                optiosLists: shopsLis,
                pageNum: pageNum + 1,
                flag: false
              })
            }
          } else {
            if (that.data.pageNum == 1) {
              that.setData({
                noShoplist: false
              })
            } else {
              that.setData({
                optiosList: that.data.optiosList,
                flag: false
              })
            }
          }
        } else {
          that.setData({
            lists: true,
            noShoplist: false
          })
        }

      }
    })

  },
  // 分类  全部商品
  bindPickerFn: function () {
    var that = this;
    that.setData({
      list: true,
      alllists: false
    })
    var tap = that.data.tap;
    var wxData = wx.getStorageSync('wxData');
    var companyId = wxData.companyId;
    if (currentId == '' || currentId == undefined) {
      var currentId = 1;
    } else {
      var currentId = currentId
    }
    var sign = util.hexMD5('companyId=' + companyId + '&pageNum=' + tap + '&perpage=' + 10 + '&region=' + wxData.region + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/items',
      data: {
        companyId: companyId,
        pageNum: tap,
        perpage: 10,
        region: wxData.region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result.code == 200) {
          var searchDetailData = res.data.data[0].list;
          that.setData({
            searchDetail: searchDetailData
          })
          if (searchDetailData.length > 0) {
            for (var i = 0; i < searchDetailData.length; i++) {
              searchDetailData[i].price = searchDetailData[i].price.toFixed(2)
              searchDetailData[i].defaultImg = gConfig.imgHttp + (searchDetailData[i].defaultImg.split('.'))[0] + '.' + (searchDetailData[i].defaultImg.split('.'))[1] + '.220x220.' + (searchDetailData[i].defaultImg.split('.'))[1];

            }

            if (that.data.tap == 1) {
              that.setData({
                searchsDetailData: searchDetailData,
                tap: tap + 1
              })
            } else {
              var shopsLis = (that.data.searchsDetailData).concat(searchDetailData)
              that.setData({
                searchsDetailData: shopsLis,
                tap: tap + 1,
              })
            }
          }
        } else {
          if (that.data.tap == 1) {
            that.setData({
              searchDetailData: '',
              isSearch: false,
              noShoplist: false
            })
          } else {
            that.setData({
              dot: true
            })
            setTimeout(function () {
              that.setData({
                iscome: true
              })
            }, 1500)

          }
        }
      }
    })
  },
  // 全部商品点击跳转详情
  shopdetailFn: function (event) {
    var that = this;
    that.setData({
      isMask: false
    })
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData');
    var searchData = that.data.searchsDetailData
    // wx.getStorageSync('searchData')
    var searchname = that.data.searchname;
    if (wxData.region == "" || !wxData.region) {
      var region = sellData.region;
    } else {
      var region = wxData.region;
    }
    var shopData = that.data.shopsData;
    var index = parseInt(event.currentTarget.dataset.index);
    var searchsDetailData = that.data.searchsDetailData;
    var searchname = that.data.searchname;
    var itemId;
    for (var i = 0; i < searchsDetailData.length; i++) {
      if (index == i) {
        itemId = searchsDetailData[i].id
        wx.navigateTo({
          url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region,

        })
      }
    }
    that.setData({
      dot: false,
    })
  },
  // 分类点跳转详情
  opititonshopdetailFn: function (event) {
    var that = this;
    that.setData({
      isMask: false
    })
    var wxData = wx.getStorageSync('wxData')
    var searchData = that.data.optiosList
    // wx.getStorageSync('searchData')
    var searchname = that.data.searchname;
    if (wxData.region == 0) {
      var region = that.data.region;
    } else {
      var region = wxData.region;
    }
    var shopData = that.data.shopsData;
    var index = parseInt(event.currentTarget.dataset.index);
    var optiosList = that.data.optiosList;
    var searchname = that.data.searchname;
    var itemId;
    for (var i = 0; i < optiosList.length; i++) {
      if (index == i) {
        itemId = optiosList[i].id
        wx.navigateTo({
          url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region,
        })
      }
    }

    that.setData({
      dot: false,
    })
  },
  dotfor: function () {
    var that = this;
    that.setData({
      dotclass: ['on', '', '']
    });
    var dotclass = that.data.dotclass;
    var n = 1;
    var timer = setInterval(function () {
      n = n > dotclass.length ? 1 : n;
      for (var i = 0; i < dotclass.length; i++) {
        if ((n - 1) == i) {
          dotclass[i] = 'on'
          that.setData({
            dotclass: dotclass
          })
        } else {
          dotclass[i] = ''
          that.setData({
            dotclass: dotclass
          })
        }
      }
      n++;
      if (n == 4) {
        clearInterval(timer)
      }
    }, 500)

  },
  // 搜索
  bindSearchFn: function () {
    var that = this;
    wx.navigateTo({
      url: '../search/search?searchShop=' + that.data.searchShop,
    })
  },
  bindblurFn: function (e) {
    var that = this;
    that.setData({
      searchShop: e.detail.value
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})