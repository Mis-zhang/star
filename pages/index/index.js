// pages/index/index.js
var gConfig = getApp(),
  util = require('../../utils/md5.js');
Page({
  data: {
    indicatorDots: true,
    iscome: true,
    dot: false,
    hideloading: true,
    iscoupon: true,
    pageNum: 1,
    imgPath: gConfig.imgHttp,
    packageList: true,
    pickeSs: '',
    noShoplist: true,
    searchShop: '',
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,
    marquee2copy_status: false,
    marquee2_margin: 60,
    orientation: 'left',//滚动方向,
  },
  onLoad: function () {
    var that = this;
    that.imgUrls();
    that.getPositionFn();

    function sum(n) {
      if (n == 1) return 1;
      return sum(n - 1) + n;
    }
    // console.log(sum())
  },
  onShow: function () {
    // 页面显示
    var that = this;
    that.setData({
      dot: false,
      iscome: true,
      dotclass: ['on', '', ''],
      isMask: true,
      searchShop: ''
    });
    that.getSystemInfo();

  },
  getSystemInfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenheight: (res.windowHeight) * 2 + 'rpx',
          screenwidth: (res.windowWidth) * 2 + 'rpx'
        })
      }
    })
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  //轮播图
  imgUrls: function (event) {
    var that = this,
      sign = util.hexMD5('companyId=' + gConfig.companyId + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/company/info',
      header: {
        'content-type': 'application/json'
      },
      method: "get",
      data: {
        companyId: gConfig.companyId,
        sign: sign
      },
      success: function (res) {
        var banners = [];
        if (res.data.result.code == 200 && res.data.data.name) {
          wx.setNavigationBarTitle({ title: res.data.data.name + '店铺' })
        }
        if (res.data.data.banners.length > 0) {
          for (let i = 0; i < res.data.data.banners.length; i++) {
            banners[i] = gConfig.imgHttp + res.data.data.banners[i]
          }
        } else {
          that.setData({ bannerImgHide: true })
        }
        if (res.data.data.notice.length == 0) {  //没填写公告显示暂无公告
          that.setData({
            bannerImg: banners,
            text: '暂无公告'
          })
        } else {
          that.setData({ bannerImg: banners, text: res.data.data.notice })
        }
        var length = that.data.text.length * 14;//文字长度
        var windowWidth = wx.getSystemInfoSync().windowWidth - 75;// 屏幕宽度
        that.setData({
          length: length,
          windowWidth: windowWidth
        });
        that.run1();// 第一个字消失后立即从右边出现
        if (banners.length <= 1) {
          that.setData({ indicatorDots: false })
        }
      }
    })
  },
  //获取地理位置
  getPositionFn: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        that.setData({ isPosition: '' })
        that.seatFn(res.latitude, res.longitude)

      },
      fail: function () {
        that.setData({ isPosition: true })
      }
    })
  },
  //此方法是点击授权的方法
  getaddressFn: function (event) {
    var that = this;
    that.setData({ isPosition: true })
    if (wx.openSetting) {
      wx.openSetting({
        success: (res) => {
          if (res.authSetting["scope.userLocation"] == true) {
            that.setData({ isPosition: '' })
            wx.getLocation({
              scope: "scope.userLocation",
              type: 'wgs84',
              success: function (res) {
                that.seatFn(res.latitude, res.longitude)
              },
              fail: function (res) {
                that.getPositionFn();
              }
            })
          } else {
            that.setData({
              isPosition: true
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

  },
  seatFn: function (lati, longi) {
    //获取当前所在区域
    var that = this;
    that.setData({ kl: 1 })
    var wxData = wx.getStorageSync("wxData");
    var companyId = wxData.companyId;
    var sign = util.hexMD5('x=' + lati + '&y=' + longi + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/region',
      data: {
        x: lati,
        y: longi,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.result.code == "200") {
          wx.setStorageSync('sellData', {
            region: res.data.data.region,
            companyId: gConfig.companyId,
            regionName: res.data.data.regionName,
            fullName: res.data.data.fullName
          })
          that.skipFn();
        } else {
          console.log("地理位置获取有误")
        }
      },
    })
  },
  //此方法为了防止app.js加载慢于index.js页面
  skipFn: function (event) {
    var that = this,
      wxData = wx.getStorageSync("wxData");
    if (!wxData) {
      that.setData({ hideloading: false })
      var timer = setInterval(function () {
        var wxData = wx.getStorageSync('wxData');
        if (wxData) {
          that.setData({ hideloading: true })
          clearTimeout(timer);
          that.refreshFn();
          that.couponFn();
        }
      }, 10)
    } else {
      that.setData({ hideloading: true })
      that.refreshFn();
      that.couponFn();
    }
  },

  //初始全部商品列表
  refreshFn: function (region) {
    var that = this;
    that.setData({
      tap: 1,
    })
    that.shopjoggleFn(1);
  },

  // 优惠劵方法
  couponFn: function (event) {
    var that = this,
      wxData = wx.getStorageSync("wxData"),
      sellData = wx.getStorageSync('sellData'),
      companyId = wxData.companyId;
    var clientId = wxData.clientId;
    if (clientId == '') {
      clientId = 0;
    }
    if (wxData.region == "" || !wxData.region) {
      that.setData({
        region: sellData.region
      })
    } else {
      that.setData({
        region: wxData.region
      })
    }
    var sign = util.hexMD5('clientId=' + clientId + '&companyId=' + companyId + '&region=' + that.data.region + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/coupons',
      data: {
        'clientId': clientId,
        'companyId': companyId,
        'region': that.data.region,
        'sign': sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var couponList = res.data.data
        console.log(res)
        if (res.data.result.code == 200) {
          if (couponList.length > 0) {
            var width = (430 * couponList.length) + 'rpx';
            that.setData({
              couponList: couponList,
              iscoupon: false,
              width: width,
            })
          } else {
            that.setData({
              iscoupon: true
            })
          }
        }
      },
      faild: function (res) {
        that.setData({ iscoupon: true })
      }
    })
  },
  //上拉加载更多
  onReachBottom: function (event) {
    var that = this;
    that.dotfor();
    that.setData({ dot: false, iscome: false })
    // var timerSt = setTimeout(function () { that.shopjoggleFn(that.data.pageNum) }, 1500)
    if (that.data.shopDataList == '') {
      that.setData({
        iscome: false,
        dot: true
      })
    } else {
      var timerSt = setTimeout(function () {
        that.shopjoggleFn(that.data.pageNum)
      }, 1500)
    }
  },
  //商品加载  
  shopjoggleFn: function (pageNum, event) {
    var that = this,
      sellData = wx.getStorageSync('sellData'),
      wxData = wx.getStorageSync("wxData");
    var companyId = gConfig.companyId;
    if (wxData.region == "" || !wxData.region) {
      that.setData({
        region: sellData.region
      })
    } else {
      that.setData({
        region: wxData.region
      })
    }
    var sign = util.hexMD5('companyId=' + companyId + '&pageNum=' + pageNum + '&perpage=' + 10 + '&region=' + that.data.region + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/items',
      data: {
        companyId: companyId,
        pageNum: pageNum,
        perpage: 10,
        region: that.data.region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var shopDetailData = res.data.data[0].list;
        that.setData({
          shopDataList: shopDetailData
        }) 

        if (that.data.pageNum == 1 && shopDetailData.length < 1) {
          that.setData({
            noShoplist: false
          })
        }
        var images = [];
        for (var i = 0; i < shopDetailData.length; i++) {
          shopDetailData[i].price = shopDetailData[i].price.toFixed(2)
          shopDetailData[i].defaultImg = (shopDetailData[i].defaultImg.split('.'))[0] + '.' + (shopDetailData[i].defaultImg.split('.'))[1] + '.220x220.' + (shopDetailData[i].defaultImg.split('.'))[1];
          var imgs = (shopDetailData[i].defaultImg.split('.'))[0] + '.' + (shopDetailData[i].defaultImg.split('.'))[1] + '.220x220.' + (shopDetailData[i].defaultImg.split('.'))[1];
          for (var j = 0; j < shopDetailData.length - 1; j++) {
            images.push(gConfig.imgHttp + imgs)
          }
        }
        that.setData({
          images: images,
          packageList: true,
        })
        if (shopDetailData.length > 0) {
          //将已有的数据和加载的数据放到一起
          if (that.data.pageNum == 1) {
            that.setData({
              shopsData: shopDetailData,
              pageNum: pageNum + 1
            })
          } else {
            var shopsData = that.data.shopsData.concat(shopDetailData)
            //再次进行页面重绘
            that.setData({
              shopsData: shopsData,
              pageNum: pageNum + 1
            })
          }
        } else {
          if (pageNum == 1) {

            setTimeout(function () { that.setData({ dot: true, iscome: true }) }, 1500)
          } else {

            that.setData({ dot: true })
            setTimeout(function () { that.setData({ iscome: true }) }, 1500)
          }

        }
      }
    })
  },
  //商品点击跳转详情
  shopdetailFn: function (event) {
    var that = this,
      wxData = wx.getStorageSync("wxData"),
      sellData = wx.getStorageSync('sellData'),
      region
    that.setData({
      isMask: false
    })
    if (wxData.region == "" || !wxData.region) {
      region = sellData.region;
    } else {
      region = wxData.region;
    }
    var shopData = that.data.shopsData;
    var index = parseInt(event.currentTarget.dataset.index);
    var itemId;
    for (var i = 0; i < shopData.length; i++) {
      if (index == i) {
        itemId = shopData[i].id
        wx.navigateTo({
          url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region,
        })
        // if (shopData[i].price == 0) {
        //   that.setData({
        //     isMask: true
        //   })
        //   wx.showToast({
        //     title: '暂不销售',
        //     icon: 'success',
        //     duration: 2000
        //   })
        // } else {
        //   wx.navigateTo({
        //     url: '../shopDetail/shopDetail?itemId=' + itemId + '&region=' + region,
        //   })
        // }
      }
    }
    that.setData({
      dot: false,
    })
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
  onShareAppMessage: function () {

  },
  run1: function () {
    var that = this;
    if (that.data.length > that.data.windowWidth) {
      var interval = setInterval(function () {
        if (-that.data.marqueeDistance < that.data.length) {
          that.setData({
            marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
          });
        } else {
          clearInterval(interval);
          that.setData({
            marqueeDistance: that.data.windowWidth
          });
          that.run1();
        }
      }, 20);
    }
  },
})