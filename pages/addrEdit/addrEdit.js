// pages/addrEdit/addrEdit.jsx
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    isAdd: true,
    isError: true
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var addressId = options.addressId;
    var modifyAddress = wx.getStorageSync('modifyAddress')
    if (addressId == 1) {
      that.setData({
        region: modifyAddress.region
      })
      this.setData({
        consignee: modifyAddress.consignee,
        mob: modifyAddress.mob,
        address: modifyAddress.address,
        region: modifyAddress.region,
        id: modifyAddress.id,
        isAdd: '',
        isDefault: modifyAddress.isDefault
      })
      var provinceId = modifyAddress.region.slice(0, 2)
      var cityId = modifyAddress.region.slice(0, 4)
      var areaId = modifyAddress.region.slice(0, 6)
      this.getProvinceFn(0, provinceId);
      this.getCityFn(provinceId, cityId);
      this.getAreaFn(cityId, areaId);
      that.setData({
        provinceRegion: provinceId,
        cityRegion: cityId,
        areaRegion: areaId
      })
    } else if (addressId == 0) {
      that.setData({
        isDefault: 0,
      })
      that.getProvinceFn(0);
    }
  },
  onShow: function() {
    // 页面显示
    var that = this;
    if (that.data.region) {
      that.setData({
        condition: false,
        isprovince: false,
        iscity: true,
        isarea: true,
        isCity: false,
        isArea: false,
      })
    } else {
      that.setData({
        condition: false,
        isprovince: false,
        iscity: true,
        isarea: true,
        isCity: true,
        isArea: true,
      })
    }

  },

  loginFn: function() {
    var that = this;
    var util = require('../../utils/md5.js');
    wx.login({
      success: function(res) {
        var sign = util.hexMD5('appId=' + gConfig.appId + '&code=' + res.code + '&companyId=' + gConfig.companyId + gConfig.key);
        if (res.code) {
          wx.request({
            url: gConfig.http + 'dpxcx/login',
            data: {
              appId: gConfig.appId,
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
              // wx.setStorageSync('shoppingcarData', []);
            },
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  consigneeFn: function(event) {
    this.data.consignee = event.detail.value;
  },
  isDefaultFn: function(event) {
    var that = this;
    that.data.isDefault = event.detail.value;
    if (that.data.isDefault) {
      that.setData({
        isDefault: 1
      })
    } else {
      that.setData({
        isDefault: 0
      })
    }
  },
  mobFn: function(event) {
    var that = this;
    that.data.mob = event.detail.value;
    var mob = that.data.mob;
  },
  addressFn: function(event) {
    var that = this;
    that.data.address = event.detail.value;

    if (event.detail.value.length >= 20) {
      wx.showToast({
        title: '输入的详细地址请不要超过20位',
        icon: 'none',
        duration: 2000
      })
    } else {
      that.setData({
        address: event.detail.value
      })
    }
  },
  editAddrFn: function() {
    // 修改地址
    var that = this;
    var userData = wx.getStorageSync('userData');
    var wxData = wx.getStorageSync('wxData'),
      sign = util.hexMD5('address=' + that.data.address + '&clientId=' + wxData.clientId + '&consignee=' + that.data.consignee + '&id=' + that.data.id + '&isDefault=' + that.data.isDefault + '&mob=' + that.data.mob + '&region=' + that.data.region + gConfig.key)
    if (that.data.consignee == '' || that.data.consignee == null || (/^[ ]+$/.test(that.data.consignee))) {
      that.setData({
        errorMsg: '收件人不能为空',
        isError: ''
      })
    } else if ((that.data.consignee).length > 20) {
      that.setData({
        errorMsg: '请将收件人控制在20个字符以内',
        isError: ''
      })
    } else if (that.data.mob == '' || that.data.mob == null) {
      that.setData({
        errorMsg: '请输入收货人的手机号码',
        isError: ''
      })
    } else if (!(/^1[34578]\d{9}$/.test(that.data.mob))) {
      that.setData({
        errorMsg: '手机号码格式错误',
        isError: ''
      })
    } else if (that.data.address == '' || that.data.address == null) {
      that.setData({
        errorMsg: '请填写详细地址',
        isError: ''
      })
    } else if (that.data.provinceRegion == '' || that.data.provinceRegion == null) {
      that.setData({
        errorMsg: '请填写所在省份',
        isError: ''
      })
    } else if (that.data.cityRegion == '' || that.data.cityRegion == null) {
      that.setData({
        errorMsg: '请填写所在市区',
        isError: ''
      })
    } else if (that.data.areaRegion == '' || that.data.areaRegion == null) {
      that.setData({
        errorMsg: '请填写所在区县',
        isError: ''
      })
    } else if (that.data.address == '' || that.data.address == null) {
      that.setData({
        errorMsg: '请填写详细地址',
        isError: ''
      })
    } else if ((that.data.address).length > 64) {
      that.setData({
        errorMsg: '请将详情地址控制在64个字符以内',
        isError: ''
      })
    } else {
      wx.request({
        // url: gConfig.http + 'address/update',
        url: gConfig.http + 'dpxcx/address/update',
        method: 'get',
        data: {
          clientId: wxData.clientId,
          id: that.data.id,
          consignee: that.data.consignee,
          mob: that.data.mob,
          region: that.data.region,
          address: that.data.address,
          isDefault: that.data.isDefault,
          sign: sign
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function(res) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }
    setTimeout(function() {
      that.setData({
        isError: true
      });
    }, 1500)
  },
  addAddrFn: function(e) {
    // 新增地址
    var that = this;
    var userData = wx.getStorageSync('userData');
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('address=' + that.data.address + '&clientId=' + wxData.clientId + '&consignee=' + that.data.consignee + '&isDefault=' + that.data.isDefault + '&mob=' + that.data.mob + '&region=' + that.data.region + '&wxOpenid=' + wxData.wxOpenid + gConfig.key);
    if (that.data.consignee == '' || that.data.consignee == null || /^[\s　]|[ ]$/.test(that.data.consignee)) {
      that.setData({
        errorMsg: '收件人不能为空',
        isError: ''
      })
    } else if ((that.data.consignee).length > 20) {
      that.setData({
        errorMsg: '收件人不得超过20个字符',
        isError: ''
      })
    } else if (that.data.mob == '' || that.data.mob == null) {
      that.setData({
        errorMsg: '请输入收货人的手机号码',
        isError: ''
      })
    } else if (!(/^1[34578]\d{9}$/.test(that.data.mob))) {
      that.setData({
        errorMsg: '手机号格式错误',
        isError: ''
      })
    } else if (that.data.provinceRegion == '' || that.data.provinceRegion == null) {
      that.setData({
        errorMsg: '请填写所在省份',
        isError: ''
      })
    } else if (that.data.cityRegion == '' || that.data.cityRegion == null) {
      that.setData({
        errorMsg: '请填写所在市区',
        isError: ''
      })
    } else if (that.data.areaRegion == '' || that.data.areaRegion == null) {
      that.setData({
        errorMsg: '请填写所在区县',
        isError: ''
      })
    } else if (that.data.address == '' || that.data.address == null) {
      that.setData({
        errorMsg: '请填写详细地址',
        isError: ''
      })
    } else if ((that.data.address).length > 64) {
      that.setData({
        errorMsg: '请将详情地址控制在64位以内',
        isError: ''
      })
    } else {
      wx.showModal({
        title: '温馨提示！',
        content: '确认提交？',
        success: function(res) {
          if (res.confirm) {
            wx.request({
              // url: gConfig.http + 'address/channel/add',
              url: gConfig.http + 'dpxcx/address/save',
              method: 'get',
              data: {
                wxOpenid: wxData.wxOpenid,
                clientId: wxData.clientId,
                consignee: that.data.consignee,
                mob: that.data.mob,
                region: that.data.region,
                address: that.data.address,
                isDefault: that.data.isDefault,
                sign: sign
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success: function(res) {
                wxData.clientId = res.data.data.clientId
                wx.setStorageSync('wxData', wxData)
                wx.showToast({
                  title: '新增成功',
                  icon: 'success',
                  duration: 1000
                })
                setTimeout(function() {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1500)
                if (wxData.mob == "") {
                  that.loginFn();
                }
              }
            })
          } else {
            console.log("用户取消了存储！")
          }
        }
      })

    }
    setTimeout(function() {
      that.setData({
        isError: true
      });
    }, 1500)
  },
  removeAddrFn: function() {
    // 删除地址
    var that = this;
    var sign = util.hexMD5('id=' + that.data.id + gConfig.key);
    wx.showModal({
      title: '删除提示',
      content: '确定要删除该地址吗？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            // url: gConfig.http + 'address/delete',
            url: gConfig.http + 'dpxcx/address/del',
            data: {
              id: that.data.id,
              sign: sign
            },
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              wx.navigateBack({
                delta: 1
              })
              if (wx.getStorageSync('addressData')) {
                if (that.data.consignee == wx.getStorageSync('addressData').consignee && that.data.mob == wx.getStorageSync('addressData').mobile) {
                  wx.removeStorageSync('addressData')
                }
              }
            }
          })
        }
      }
    })

  },
  //地址的选择
  provinceFn: function(event) {
    let that = this;
    let provinceData = that.data.provinceData
    that.setData({
      pIndex: event.detail.value,
      provinceName: provinceData[event.detail.value].name,
      isprovince: true,
      iscity: false,
      isarea: true,
      areaName: '',
      isareaed: true,
      isCity: false,
      isArea: true,
      region: provinceData[event.detail.value].id,
      provinceRegion: provinceData[event.detail.value].id,
      cityRegion: '',
      areaRegion: ''
    })
    var valId = that.data.provinceData[event.detail.value].id;
    that.getCityFn(valId);
  },
  cityFn: function(event) {
    let that = this;
    let cityData = that.data.cityData
    that.setData({
      cIndex: event.detail.value,
      cityName: cityData[event.detail.value].name,
      iscity: true,
      isarea: false,
      isArea: false,
      isareaed: false,
      region: cityData[event.detail.value].id,
      cityRegion: cityData[event.detail.value].id,
      areaRegion: ''
    })
    var valId = that.data.cityData[event.detail.value].id
    that.getAreaFn(valId);
  },
  areaFn: function(event) {
    let that = this;
    var areaData = that.data.areaData;
    that.setData({
      aIndex: event.detail.value,
      isarea: true,
      isareaed: false,
      region: areaData[event.detail.value].id,
      areaName: areaData[event.detail.value].name,
      region: areaData[event.detail.value].id,
      areaRegion: areaData[event.detail.value].id
    })
  },
  getProvinceFn: function(defaultCode, provinceId) {
    //获取省份
    var that = this;
    var region = that.data.region;
    var sign = util.hexMD5('id=' + defaultCode + gConfig.key);
    wx.request({
      // url: gConfig.http + 'channel/xcx/childregion',
      url: gConfig.http + 'dpxcx/childregion',
      data: {
        id: defaultCode,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          provinceData: res.data.data,
        })
        if (that.data.region) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].id == provinceId) {
              that.setData({
                provinceName: res.data.data[i].name,
                isprovince: true
              })
            }
          }
        }
      }
    })
  },
  getCityFn: function(provinceId, cityId) {
    //获取城市
    var that = this;
    var region = that.data.region;
    var sign = util.hexMD5('id=' + provinceId + gConfig.key);
    wx.request({
      // url: gConfig.http + 'channel/xcx/childregion',
      url: gConfig.http + 'dpxcx/childregion',
      data: {
        id: provinceId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          cityData: res.data.data
        })
        if (that.data.region) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].id == cityId) {
              that.setData({
                cityName: res.data.data[i].name,
              })
            }
          }
        }
      }
    })
  },
  getAreaFn: function(cityId, areaId) {
    //获取地区
    var that = this;
    var region = that.data.region;
    var sign = util.hexMD5('id=' + cityId + gConfig.key);
    wx.request({
      // url: gConfig.http + 'channel/xcx/childregion',
      url: gConfig.http + 'dpxcx/childregion',
      data: {
        id: cityId,
        sign: sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.setData({
          areaData: res.data.data,
        })
        if (that.data.region) {
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].id == areaId) {
              that.setData({
                areaName: res.data.data[i].name,
              })
            }
          }
        }
      }
    })
  },
  onShareAppMessage: function() {

  }
})