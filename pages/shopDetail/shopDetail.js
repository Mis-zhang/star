// pages/orderDetail/orderDetail.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    indicatorDots: true,
    currentTab: 0,
    selected: true,
    hidden: true,
    isError: true,
    isshopcut: true,
    isPlant: true,
    img: '',
    noCpinjs: true,
    noCpincs: true,
    paymentBtn: true,
    isresolve: true,
    plotCount: 0,
    mark: 1,
    pageNo: 1,
    pageSize: 10,
    status: 0,
    fieldAppData: gConfig.appData,
    fieldPath: '/pages/fieldList/fieldList?shop=1',
    fieldAppId: 'wx01379bf6e690b34f',
    fieldData: {},
    tel: '',
    starPage: 1,
    starPagerow: 10,
    page: 1,
    pagerow: 3,
    type: 0,
    rows: Number,
    starList: [],
    rowsList: true,
    showImgUrl: gConfig.imgHttp

  },
  onLoad: function(options) {
    var that = this;
    if (that.data.fieldAppData.query.field) { //示范田进来的
      var fieldDatas = that.data.fieldAppData,
        field = fieldDatas.query.field,
        dpItemId = fieldDatas.referrerInfo.extraData.dpItemId; //商品ID
        that.setData({
          field: field,
          dpItemId: dpItemId
        });
        that.getStar(dpItemId)
    } else if (that.data.fieldAppData.query.qyAdat) { //企业空间进来的
      var qyDatas = that.data.fieldAppData,
        qyid = that.data.fieldAppData.referrerInfo.extraData.id; //商品ID
        that.setData({
          qyAdat: that.data.fieldAppData.query.qyAdat,
          qyid: qyid
        });
        that.getStar(qyid)
    }
    // that.getStar(options.itemId)
    that.setData({
      itemId: options.itemId,
      region: options.region,
      tel: '15713586837'.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3")
    });
    this.getStarList()
  },
  onShow: function() {
    // 页面显示
    var that = this;
    var sellData = wx.getStorageSync('sellData'),
      wxData = wx.getStorageSync('wxData');
    if (wxData == '' || sellData == '') {
      wx.showLoading({
        title: '玩命加载中……',
      })
      that.loginFn();
    } else {
      that.getshopinfo();
      that.receiveFn();
    }
    this.introduceFn();
    this.setData({
      isMask: true
    })
    this.getSystemInfo();
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },

  // 评价
  getStar(itemId) {
    console.log('aaaaaaaa');
    var sign = util.hexMD5('itemId=' + itemId + '&page=' + this.data.starPage + '&pagerow=' + this.data.starPagerow + '&type=0' + gConfig.key);

    wx.request({
      url: gConfig.http + 'dpxcx/evaluate/list',
      data: {
        itemId,
        page: this.data.starPage,
        pagerow: this.data.starPagerow,
        type: 0,
        sign
      },
      header: {'content-type':'application/json'},
      method: 'GET',
      dataType: 'json',
      success: (res)=>{
        console.log('star 评价接口------>',res);
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },



  getSystemInfo: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          screenheight: (res.windowHeight) * 2 + 'rpx',
          screenwidth: (res.windowWidth) * 2 + 'rpx'
        })
      }
    })
  },
  //商品信息的展示
  getshopinfo: function(event) {
    var that = this,
      sellData = wx.getStorageSync('sellData'),
      wxData = wx.getStorageSync('wxData');
    if (wxData.region == 0 || wxData.region == undefined) {
      var region = sellData.region;
    } else {
      var region = wxData.region;
    }


    if (that.data.field) {
      var itemId = that.data.dpItemId; //店铺跳转进来
    } else if (that.data.qyAdat) {
      var itemId = that.data.qyid;
    } else {
      var itemId = that.data.itemId; //店铺默认
    }

    var sign = util.hexMD5('itemId=' + itemId + '&region=' + region + gConfig.key);
    wx.request({
      url: gConfig.http + 'dpxcx/iteminfo',
      data: {
        itemId: itemId,
        region: region,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.result.code == 200) {
          var itemName = res.data.data.name;      // 砍价上传商品的名字 2018.11.15
          that.setData({
            paymentBtn: false,
            itemName: itemName
          })

          if (res.data.data.plotCount != 0) {  //没有示范田不加载
            var sign = util.hexMD5('companyId=' + gConfig.companyId + '&name=' + res.data.data.name + gConfig.key);
            wx.request({
              url: gConfig.httpField + 'xcx/plots/plotsitems',
              data: {
                companyId: gConfig.companyId,
                name: res.data.data.name,
                sign: sign
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                if (res.data.data.totalCount != 0) {
                  var shopData = {
                    companyId: gConfig.companyId,
                    shop: 1,
                    isShop: true,
                    cropId: res.data.data.cropId, //一级ID
                    cropTypeId: res.data.data.cropTypeId, //二级作物ID
                    shopName: res.data.data.cropName, //一级作物名称
                    shopErName: res.data.data.name, //二级作物名称
                    shopYiSeq: res.data.data.yiSeq, //一级作物排序ID
                    shopErSeq: res.data.data.erSeq, //二级作物排序ID
                    plotCount: res.data.data.totalCount, //示范田数量
                    mark: that.data.mark,
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    status: that.data.status
                  }
                  that.setData({
                    fieldData: shopData,
                    plotCount: res.data.data.totalCount
                  })
                } else {
                  console.log('')
                }
              }
            })
          }
        }

        // 轮播图start
        var images = [];
        var itemImgs = res.data.data.itemImgs;

        for (var i = 0; i < itemImgs.length; i++) {
          itemImgs[i] = itemImgs[i] + '.400x400.' + (itemImgs[i].split('.'))[1]
          images.push(gConfig.imgHttp + itemImgs[i])
          that.setData({
            img: images,
          })
        }
        if (itemImgs.length <= 1) {
          that.setData({
            indicatorDots: false
          })
        }
        // 轮播图end
        that.setData({
          goodsData: res.data.data,
          shoppingData: res.data.data.itemSkus[0]
        })
        var goodsData = that.data.goodsData; //商品data
        var itemSkus = goodsData.itemSkus; //商品itemSkus
        var index = 0;
        that.setData({
          currentid: itemSkus[index].id, //规格id
          moq: itemSkus[index].moq == 0 ? 1 : itemSkus[index].moq, //最小起订量
          skuId: itemSkus[index].id, //规格id
          company: goodsData.companyName, //商家名称
          address: goodsData.address, //商家详细地址
          mob: goodsData.serviceTel, //服务电话
          fullRegionName: goodsData.fullName, //区域全名
          shopfeedetail: goodsData.shipfeedetail, //运费信息
          onlineOutlet: goodsData.onlineOutlet
        })
        if (itemSkus[index].moq > 0) {
          that.setData({
            qty: itemSkus[index].moq
          })
        } else {
          that.setData({
            qty: 1
          })
        }
        var retailPrice = itemSkus[index].retailPrice;                     //零售价
        var retailPromotionPrice = itemSkus[index].retailPromotionPrice;   //促销价


        if (retailPrice == 0) {
          that.setData({
            isresolve: false
          })
        } else if (retailPromotionPrice != 0 && retailPrice > retailPromotionPrice) {
          that.setData({
            isresolve: true,
            shopprice: retailPrice.toFixed(2),
            isPrice:false,                         //规格控制 2018.11.15
            isPromotion: false,                    //规格控制 2018.11.15
            shopPromotionPrice: retailPromotionPrice.toFixed(2)
          })
        } else {
          that.setData({
            isresolve: true,                       //规格控制 2018.11.15
            isPrice: true,                         //规格控制 2018.11.15
            isPromotion: true,                     //规格控制 2018.11.15
            shopPromotionPrice: 0,                 //规格控制 2018.11.15
            shopprice: retailPrice.toFixed(2)
          })
        }
        if (that.data.isresolve == true) {
          if (that.data.onlineOutlet == 0) {
            that.setData({
              ishuise: false
            })
          } else {
            that.setData({
              ishuise: true
            })
          }
        }
      }
    })
  },
  //商品规格的选择
  specFn: function(event) {
    var that = this;
    var id = event.currentTarget.dataset.id
    var itemSkus = that.data.goodsData.itemSkus;
    var itemId = that.data.itemId;
    var sellData = wx.getStorageSync('sellData')
    var wxData = wx.getStorageSync('wxData')
    if (wxData.region == 0) {
      var region = that.data.region;
    } else {
      var region = wxData.region;
    }
    for (var i = 0; i < itemSkus.length; i++) {
      var retailPrice = itemSkus[i].retailPrice;
      if (id == itemSkus[i].id) {
        that.setData({
          currentid: id,
          moq: itemSkus[i].moq == 0 ? 1 : itemSkus[i].moq,
          skuId: itemSkus[i].id,
          shoppingData: itemSkus[i]
        })
        if (itemSkus[i].moq > 0) {
          that.setData({
            qty: itemSkus[i].moq
          })
        } else {
          that.setData({
            qty: 1
          })
        }
         if (retailPrice != 0) {
          that.setData({
            ishuise: true
          })
        } else {
          that.setData({
            ishuise: false
          })
        }
        var sign = util.hexMD5('itemId=' + itemId + '&region=' + region + '&skuId=' + id + gConfig.key);
        wx.request({
          url: gConfig.http + 'dpxcx/iteminfo',
          data: {
            itemId: itemId,
            region: region,
            skuId: id,
            sign: sign
          },
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            var goodsData = res.data.data;
            that.setData({
              company: goodsData.companyName,
              address: goodsData.address,
              mob: goodsData.serviceTel,
              fullRegionName: goodsData.fullName,
              shopfeedetail: goodsData.shipfeedetail,
            })
          }
        })
        var retailPrice = itemSkus[i].retailPrice;
        var retailPromotionPrice = itemSkus[i].retailPromotionPrice;
        if (retailPrice == 0) {
          that.setData({
            isresolve: false
          })
        } else if (retailPromotionPrice != 0 && retailPrice > retailPromotionPrice) {
          that.setData({
            isresolve: true,
            shopprice: retailPrice.toFixed(2),
            isPrice: false,
            isPromotion: false,
            shopPromotionPrice: retailPromotionPrice.toFixed(2)
          })
        } else {
          that.setData({
            isresolve: true,
            isPrice: true,
            isPromotion:true,
            shopPromotionPrice:0,
            shopprice: retailPrice.toFixed(2)
          })
        }
      }
    }
    that.setData({
      skuId: id
    });
  },
  goodsNumFn: function(event) {
    var that = this;
    var shoppingData = that.data.shoppingData
    var moqDetail = Number(shoppingData.moq);
    var qtyvalue = (event.detail.value).split('');
    if (qtyvalue[0] == 0) {
      var moqvalue = event.detail.value;
      var index;
      for (var i = 0; i < qtyvalue.length; i++) {
        if (qtyvalue[i] > 0) {
          index = i;
          break;
        }
      }
      var moq = moqvalue.substring(index)
      that.setData({
        moq: (moq == "" || moq <= moqDetail) ? moqDetail : (moq >= 9999 ? 9999 : moq),
        shoppingData: shoppingData
      })
    } else {
      if (moqDetail) {
        that.setData({
          moq: (event.detail.value == "" || event.detail.value <= moqDetail) ? moqDetail : (event.detail.value >= 9999 ? 9999 : event.detail.value),
          shoppingData: shoppingData
        })
      } else {
        that.setData({
          moq: (event.detail.value == "" || event.detail.value <= 1) ? 1 : (event.detail.value >= 9999 ? 9999 : event.detail.value),
          shoppingData: shoppingData
        })
      }
    }
  },
  //点击数量减少
  decrFn: function(event) {
    var that = this;
    var moqDetail = parseInt(that.data.moq);
    var qty = that.data.qty;
    if (moqDetail - 1 < 1) {
      moqDetail = 1;
    } else {
      moqDetail = moqDetail - 1;
    }
    if (qty) {
      if (moqDetail < qty) {
        that.setData({
          moq: qty
        })
      } else {
        that.setData({
          moq: moqDetail
        })
      }
    }
  },
  //点击数量增加
  incrFn: function(event) {
    var that = this;
    var moq = parseInt(that.data.moq);
    if (moq + 1 >= 9999) {
      var moq = 9999;
    } else {
      moq = moq + 1;
    }
    that.setData({
      moq: moq
    })
  },
  //服务商页面的跳转
  facilitatorFn: function(event) {
    var that = this;
    wx.navigateTo({
      url: '../facilitator/facilitator?company=' + that.data.company + '&address=' + that.data.address + '&mob=' + that.data.mob + '&fullRegionName=' + that.data.fullRegionName + '&shopfeedetail=' + that.data.shopfeedetail
    })
  },
  //加入购物车
  addcarFn: function(event) {
    var that = this,
      wxData = wx.getStorageSync('wxData'),
      companyIdSkuId = gConfig.companyId + '_' + that.data.skuId,
      sign = util.hexMD5('appId=' + gConfig.appId + '&companyIdSkuId=' + companyIdSkuId + '&qty=' + that.data.moq + '&wxOpenId=' + wxData.wxOpenid + gConfig.key);
    if (that.data.shoppingData.retailPrice == 0) {
      wx.showToast({
        title: '暂不能加入购物车',
        icon: 'none',
        duration: 2000,
      })
      that.setData({
        isMask: true
      })
    } else if (that.data.shoppingData.retailPrice > 0) {
      if (that.data.goodsData.onlineOutlet == 0) {
        wx.showToast({
          title: '暂不能加入购物车',
          icon: 'none',
          duration: 2000,
        })
        that.setData({
          isMask: true
        })
      } else {
        wx.request({
          url: gConfig.http + 'dpxcx/addorupdate',
          data: {
            appId: gConfig.appId,
            companyIdSkuId: companyIdSkuId,
            qty: that.data.moq,
            wxOpenId: wxData.wxOpenid,
            sign: sign
          },
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            if (res.data.result.code == '200') {
              wx.showToast({
                title: '成功加入购物车',
                icon: 'success',
                duration: 1000,
              })
            }
          }
        })
      }

    }
  },
  //点击立即购买
  boughtFn: function(event) {
    var that = this;
    // that.setData({ isMask: true })
    // wx.removeStorageSync('addressData');
    var goods = that.data.goodsData; // 该商品的所有数据
    var shoppingData = that.data.shoppingData; // 该商品的itemSkus数据
    var shopprice;
    if (shoppingData.retailPromotionPrice > 0) {
      shopprice = shoppingData.retailPromotionPrice
    } else {
      shopprice = shoppingData.retailPrice
    }
    if (shoppingData.retailPrice == 0) {
      wx.showToast({
        title: '暂不支持购买',
        icon: 'none',
        duration: 2000,
      })
      that.setData({
        isMask: true
      })
    } else {
      if (goods.onlineOutlet == 1) {
        shoppingData.itemImgs = goods.itemImgs[0];
        wx.setStorageSync('orderData', [{
          shopname: goods.name,
          companyname: goods.companyName,
          skuId: that.data.skuId,
          companyId: gConfig.companyId,
          onlineTitle: goods.onlineTitle,
          goodsImg: shoppingData.itemImgs,
          shopprice: shopprice,
          moq: that.data.moq <= 1 ? 1 : that.data.moq,
          specData: shoppingData.norm + shoppingData.units,
          retailPromotionPrice: shoppingData.retailPromotionPrice
        }])
        wx.navigateTo({
          url: '../orderConfirm/orderConfirm',
        })
      } else {
        wx.showToast({
          title: '暂不支持线上销售',
          icon: 'none',
          duration: 2000,
        })
      }
    }
    setTimeout(function() {
      that.setData({
        isError: true
      });
    }, 1500)
  },
  //点击切换至砍价页面
  bargainFn: function(e) {
    var that = this;
    wx.navigateTo({
      url: '../bargain/bargain?itemName=' + that.data.itemName,
    })
  },
  //商品介绍
  introduceFn: function(event) {
    var that = this;
    that.setData({
      noCpinjs: true
    })
    var itemId = that.data.itemId
    var sign = util.hexMD5('itemId=' + itemId + gConfig.key);
    that.setData({
      selected: false,
      selected1: true,
    })
    wx.request({
      url: gConfig.http + 'dpxcx/itemdetail',
      data: {
        itemId: itemId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        var parameterData = res.data.data
        if (res.data.data == "") {
          that.setData({
            noCpinjs: false
          })
        }
        WxParse.wxParse('parameterData', 'html', parameterData, that, 5);
        that.setData({
          wxParseData: parameterData
        })
      }
    })
  },
  ensureFn: function(event) {
    var that = this;
    that.setData({
      selected: false,
      selected1: false,
    })
  },
  //送货地址为空时
  receiveFn: function(event) {
    var that = this;
    var wxData = wx.getStorageSync('wxData');
    var sellData = wx.getStorageSync('sellData');
    if (wxData.clientId == 0) {
      that.setData({
        addr: sellData.fullName
      })
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
          if (addrList.length != 0) {
            for (var i = 0; i < addrList.length; i++) {
              if (addrList[i].isDefault == 1) {
                that.setData({
                  addr: addrList[i].regionName + addrList[i].address,
                })
                break;
              } else {
                that.setData({
                  addr: sellData.fullName
                })
              }
            }
          } else {
            that.setData({
              addr: sellData.fullName
            })
          }
        }
      })
    }
  },
  //示范田入口
  fieldEntranceFn: function() {
    var that = this
    wx.navigateTo({
      url: '/pages/fieldList/fieldList?itemId=' + that.data.itemId
    })
  },
  //返回上一个小程序
  backField: function() {
    wx.navigateBackMiniProgram({
      extraData: {},
      success(res) {
        // 返回成功
      }
    })
  },
  //获取当前所在区域
  seatFn: function(lati, longi) {
    var that = this;
    that.setData({
      kl: 1
    })
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
      success: function(res) {
        if (res.data.result.code == "200") {
          wx.setStorageSync('sellData', {
            region: res.data.data.region,
            companyId: gConfig.companyId,
            regionName: res.data.data.regionName,
            fullName: res.data.data.fullName
          })
        } else {
          console.log("地理位置获取有误")
        }
      },
    })
  },
  onShareAppMessage: function() {

  },
  loginFn: function() {
    var that = this;
    var region = wx.getStorageSync('sellData').region;
    if (region != undefined) {
      wx.login({
        success: function(res) {
          var sign = util.hexMD5('code=' + res.code + '&companyId=' + gConfig.companyId + gConfig.key);
          if (res.code) {
            wx.request({
              url: gConfig.http + 'dpxcx/login',
              data: {
                code: res.code,
                companyId: gConfig.companyId,
                sign: sign
              },
              header: {
                'content-type': 'application/json'
              },
              success: function(res) {
                var wxData = {
                  "wxOpenid": res.data.data.wxOpenid,
                  "clientId": res.data.data.clientId,
                  "isOpenPay": res.data.data.isOpenPay,
                  "region": res.data.data.region,
                  "mob": res.data.data.mob,
                  "name": res.data.data.name,
                  "companyId": gConfig.companyId
                }
                wx.setStorageSync('wxData', wxData);
                wx.setStorageSync('shoppingcarData', []);
                that.getshopinfo();
                that.receiveFn();
              },
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      })
    } else {
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          that.setData({
            isPosition: ''
          })
          that.seatFn(res.latitude, res.longitude)
          var sign = util.hexMD5('x=' + res.latitude + '&y=' + res.longitude + gConfig.key);
          wx.request({
            url: gConfig.http + 'dpxcx/region',
            data: {
              x: res.latitude,
              y: res.longitude,
              sign: sign
            },
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              if (res.data.result.code == "200") {
                wx.setStorageSync('sellData', {
                  region: res.data.data.region,
                  companyId: gConfig.companyId,
                  regionName: res.data.data.regionName,
                  fullName: res.data.data.fullName
                })
                that.getshopinfo();
                that.receiveFn();
              } else {
                console.log("地理位置获取有误")
              }
            },
          })
        },
        fail: function() {
          that.setData({
            isPosition: true
          })
        }
      })
    }

  },
  toStar() {
    wx.navigateTo({
      url: '../star/index?itemId=' + this.data.itemId
    });
  },
  getStarList() {
    let _this = this,
    sign = util.hexMD5('itemId=' + this.data.itemId + '&page=' + this.data.page + '&pagerow=' + this.data.pagerow + '&type=' + this.data.type + gConfig.key)
    var reqTask = wx.request({
      url: gConfig.http + 'dpxcx/evaluate/list',
      data: {
        itemId: _this.data.itemId,
        page: _this.data.page,
        pagerow: _this.data.pagerow,
        type: _this.data.type,
        sign
      },
      header: {'content-type':'application/json'},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (res)=>{
        console.log(res);
        let data = res.data.data
        let rows = res.data.data.totalrows
        if(rows == 0) {
          _this.setData({
            rowsList: false
          })
        }else {
          _this.setData({
            rowsList: true
          })
        }
        _this.setData({
          starList: data.rows,
          rows: rows
        })
        console.log('starList',_this.data.starList);
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  }
})