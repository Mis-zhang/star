// pages/fieldDetail/fieldDetail.js
var gConfig = getApp();
var utils = require('../../utils/md5.js')
var time = require('../../utils/time.js')
var clientId = wx.getStorageSync("wxData").clientId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swichIdx: 1,
    sign: '',
    logIdx: 1,
    type: 1,
    imgPath: gConfig.imgHttp,
    isComment: false,
    isFollow: '',
    fieldInfo: null,
    msgesHide: true,
    demoLogData: [],
    plantData: [],
    textValue: '',
    guestBookData: [],
    currentItem: '',
    commentData: [],
    inputVal: '',
    markers: [],
    isLook: false,
    isIntroduction: false,
    infoComments: [],
    isclientId: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var clientId = wx.getStorageSync("wxData").clientId;
    var plotId = options.itemId;

    if (clientId) {
      this.fieldFn(clientId, options.itemId);
      this.demoLog(clientId, options.itemId, 2);
      this.plantFn(clientId, options.itemId, 1);
    } else {
      this.fieldFn(0, options.itemId);
      this.demoLog(0, options.itemId, 2);
      this.plantFn(0, options.itemId, 1);
    }



    this.guestBookFn(0, options.itemId);


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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  swichFn: function (event) {
    var swichIdx = event.target.dataset.swichidx, logIdx = event.target.dataset.logidx;
    this.setData({ swichIdx: swichIdx, logIdx: logIdx, inputVal: '', textValue: '' });
  },
  //关注
  followFn: function () {
    var clientId = wx.getStorageSync("wxData").clientId;
    var plotId = wx.getStorageSync('plotsId')
    var isFollow = this.data.isFollow;
    if (isFollow == 0) {
      var type = 1;
    } else if (isFollow == 1) {
      var type = 0;
    }
    var that = this, sign = utils.hexMD5('clientId=' + clientId + '&plotId=' + plotId + '&type=' + type + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/followAjax',
      data: {
        clientId: clientId,
        plotId: plotId,
        type: type,
        sign: sign
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        var code = res.data.result.code
        that.fieldFn(clientId, plotId);
        if (type == 1) {
          wx.showToast({
            title: '关注成功',
            icon: 'success',
            duration: 500
          })
        }
      }
    })
  },
  // 示范田信息
  fieldFn: function (clientId, plotId) {
    var that = this, sign = utils.hexMD5('clientId=' + clientId + '&plotId=' + plotId + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/deatil',
      // method: 'POST',
      data: {
        clientId: clientId,
        plotId: plotId,
        sign: sign
      },
      // header: {
      //   'content-type': 'application/x-www-form-urlencoded' // 默认值
      // },
      success: function (res) {
        var tianName = res.data.data.plot.name;
        wx.setStorageSync('tianName', tianName)
        var plotsId = res.data.data.plot.plotsDetail.plotsId
        var isFollow = res.data.data.plot.isFollow;
        var markers = res.data.data.plot.plotsPositionList;
        var introduction = res.data.data.plot.idbSpecy.introduction;
        var plotsPositionList = [];
        wx.setStorageSync('plotsId', plotsId)
        for (var i = 0; i < markers.length; i++) {
          plotsPositionList.push({
            iconPath: "/images/icon_add.png",
            id: markers[i],
            latitude: markers[i].y,
            longitude: markers[i].x
          })
        }
        that.setData({
          fieldInfo: res.data.data,
          imgPath: gConfig.imgHttp,
          markers: that.data.markers.concat(plotsPositionList),
          isFollow: isFollow,
          clientId: clientId,
          plotsPositionList: plotsPositionList,
        })
        wx.setNavigationBarTitle({
          title: wx.getStorageSync('tianName')
        })
        if (clientId == 0) {
          that.setData({
            isclientId: false
          })
        } else {
          that.setData({
            isclientId: true
          })
        }
        if (introduction) {
          that.setData({
            isIntroduction: true
          })
        }
      }
    })
  },
  // 示范日志田间表现
  demoLog: function (clientId, plotId, type) {
    var that = this, sign = utils.hexMD5('clientId=' + clientId + '&plotId=' + plotId + '&type=' + type + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/plotinfoAjax',
      data: {
        clientId: clientId,
        plotId: plotId,
        type: type,
        sign: sign
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        var demoLogData = res.data.data;
        for (var i = 0; i < demoLogData.length; i++) {
          var demoLogDatas = demoLogData[i]
          for (var n = 0; n < demoLogDatas.plotsInfoImgs.length; n++) {
            // demoLogDatas.plotsInfoImgs[n] = demoLogDatas.plotsInfoImgs[n].uri.split('.')[0] + '.' + demoLogDatas.plotsInfoImgs[n].uri.split('.')[1] + '.400x400.' + demoLogDatas.plotsInfoImgs[n].uri.split('.')[1];
            demoLogDatas.plotsInfoImgs[n] = demoLogDatas.plotsInfoImgs[n].uri;
          }
        }
        that.setData({
          demoLogData: demoLogData,

        })
      }
    })
  },
  // 示范日志种植技术
  plantFn: function (clientId, plotId, type) {
    var that = this, sign = utils.hexMD5('clientId=' + clientId + '&plotId=' + plotId + '&type=' + type + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/plotinfoAjax',
      data: {
        clientId: clientId,
        plotId: plotId,
        type: type,
        sign: sign
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        var plantData = res.data.data;
        for (var i = 0; i < plantData.length; i++) {
          var demoLogDatas = plantData[i]
          for (var n = 0; n < demoLogDatas.plotsInfoImgs.length; n++) {
            // demoLogData s.plotsInfoImgs[n] = demoLogDatas.plotsInfoImgs[n].uri.split('.')[0] + '.' + demoLogDatas.plotsInfoImgs[n].uri.split('.')[1] + '.400x400.' + demoLogDatas.plotsInfoImgs[n].uri.split('.')[1];
            demoLogDatas.plotsInfoImgs[n] = demoLogDatas.plotsInfoImgs[n].uri;

          }
        }
        that.setData({
          plantData: plantData
        })
      }
    })
  },
  // 用户留言
  guestBookFn: function (infoId, plotsId) {
    var that = this, sign = utils.hexMD5('infoId=' + infoId + '&plotsId=' + plotsId + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/plotinfocommentAjax',
      data: {
        infoId: infoId,
        plotsId: plotsId,
        sign: sign
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        that.setData({
          guestBookData: res.data.data,
          infoComments: res.data.data.infoComments
        })
      }
    })
  },
  textblurFn: function (e) {
    this.setData({
      textValue: e.detail.value
    })
    var textValue = this.data.textValue
    wx.setStorageSync('textValue', textValue)
  },
  // 发表,保存用户留言
  sendFn: function () {
    var that = this;

    var clientId = wx.getStorageSync("wxData").clientId;
    setTimeout(function () {  //此处延迟的原因是 在点发送时 先执行失去文本焦点 再执行的send 事件 此时获取数据不正确 故手动延迟100毫秒
      var textValue = that.data.textValue;
      var infoId = 0, plotsId = wx.getStorageSync('plotsId'), content = textValue, sign = utils.hexMD5('clientId=' + clientId + '&content=' + content + '&infoId=' + infoId + '&plotsId=' + plotsId + gConfig.key), textValArr = [];

      wx.request({
        url: gConfig.httpField + 'plots/savecommentAjax',
        method: 'POST',
        data: {
          clientId: clientId,
          content: content,
          infoId: infoId,
          plotsId: plotsId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          var codeState = res.data.result.code
          if (codeState == 200) {
            var webName = res.data.data.webName
            var clientHeadImg = res.data.data.clientHeadImg
            textValArr.push({
              addTimeStr: time.formatTime(new Date()),
              webName: webName,
              content: content,
              clientHeadImg: clientHeadImg
            })
            var guestBookData = that.data.guestBookData.concat(textValArr)
            var str = guestBookData.splice(-1);
            guestBookData.unshift(str[0]);
            that.setData({
              guestBookData: guestBookData,
              textValue: ''
            })
            wx.showToast({
              title: '留言成功',
              icon: 'success',
              duration: 1000
            })
          } else if (codeState == -1) {
            wx.showModal({
              title: "温馨提示",
              content: "您留言的内容不能为空"
            })
          }

        }

      })

    }, 1000)
  },
  //田间表现点赞
  fieldisZan: function (options) {
    var clientId = wx.getStorageSync("wxData").clientId;
    var that = this,
      dataId = options.target.dataset.id,
      clientsId = clientId,
      plotsInfoId = dataId,
      plotId = wx.getStorageSync('plotsId'),
      type = 1,
      sign = utils.hexMD5('clientsId=' + clientsId + '&plotsInfoId=' + plotsInfoId + '&type=' + type + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/clicklikeAjax',
      method: 'POST',
      data: {
        clientsId: clientsId,
        plotsInfoId: plotsInfoId,
        type: type
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        var clickNum = res.data.data.clickNum
        var type = clickNum - 1;
        var code = res.data.result.code
        if (code == 100) {
          wx.showModal({
            title: '温馨提示',
            content: '你已经点赞了'
          })
        } else if (code == 200) {
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 500
          })
        }
        that.demoLog(clientId, plotId, 2);
        that.plantFn(clientId, plotId, 1);
      }
    })
  },
  //田间表现评论
  msgesHideFn: function (options) {
    this.setData({
      inputVal: ''
    })
    var dataId = options.target.dataset.id,
      infoId = dataId,
      plotsId = 0,
      that = this,
      sign = utils.hexMD5('infoId=' + infoId + '&plotsId=' + plotsId + gConfig.key);
    wx.request({
      url: gConfig.httpField + 'plots/plotinfocommentAjax',
      data: {
        infoId: infoId,
        plotsId: plotsId,
        sign: sign
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        var commentData = res.data.data
        that.setData({
          currentItem: dataId,
          commentData: commentData,
          isComment: !that.data.isComment
        })

      }
    })
  },
  // 评论保存
  inputFn: function (e) {
    var inputVal = e.detail.value
    this.setData({
      inputVal: inputVal
    })
  },
  fieldSendFn: function (options) {
    var clientId = wx.getStorageSync("wxData").clientId;
    var that = this;
    setTimeout(function () {
      var dataId = options.target.dataset.id,
        content = that.data.inputVal,
        infoId = dataId,
        plotsId = 0,
        inputValArr = [],
        sign = utils.hexMD5('clientId=' + clientId + '&content=' + content + '&infoId=' + plotsId + '&plotsId=' + content + gConfig.key);
      wx.request({
        url: gConfig.httpField + 'plots/savecommentAjax',
        method: 'POST',
        data: {
          clientId: clientId,
          content: content,
          infoId: infoId,
          plotsId: plotsId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          var codeState = res.data.result.code;
          var plotId = wx.getStorageSync('plotsId');
          if (codeState == 200) {
            wx.showToast({
              title: '评论成功',
              icon: 'success',
              duration: 1000
            })
            var webName = res.data.data.webName
            var clientHeadImg = res.data.data.clientHeadImg
            inputValArr.push({
              addTimeStr: time.formatTime(new Date()),
              clientHeadImg: clientHeadImg,
              content: that.data.inputVal,
              webName: webName
            })
            var commentData = that.data.commentData.concat(inputValArr)
            var str = commentData.splice(-1);
            commentData.unshift(str[0]);
            that.setData({
              commentData: commentData,
              inputVal: ''
            })
            that.demoLog(clientId, plotId, 2);
            that.plantFn(clientId, plotId, 1);
          } else if (codeState == -1) {
            wx.showModal({
              title: '温馨提示',
              content: '您评论的内容不能为空',
            })
          }
        }
      })
    }, 500)
  },
  bindupdatedMap: function (res) {
  },
  /** 
  * 用于把用utf16编码的字符转换成实体字符，以供后台存储 
  * @param  {string} str 将要转换的字符串，其中含有utf16字符将被自动检出 
  * @return {string}     转换后的字符串，utf16字符将被转换成&#xxxx;形式的实体字符 
  */

  utf16toEntities: function (str) {
    var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则  
    str = str.replace(patt, function (char) {
      var H, L, code;
      if (char.length === 2) {
        H = char.charCodeAt(0); // 取出高位  
        L = char.charCodeAt(1); // 取出低位  
        code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法  
        return "&#" + code + ";";
      } else {
        return char;
      }
    });
    return str;
  },
  imgtianFn: function (e) {
    var id = e.currentTarget.dataset.id, imgPath = this.data.imgPath;
    var demoLogData = this.data.demoLogData;
    var imgs = [];
    var images = [];
    var pice = [];
    for (var i = 0; i < demoLogData.length; i++) {
      imgs += demoLogData[i].plotsInfoImgs + ',';
    }
    images = imgs.split(",")
    images.pop()
    var a = [];
    for (var i = 0; i < images.length; i++) {
      a += imgPath + images[i] + ','
    }
    pice = a.split(",")
    pice.pop()
    wx.previewImage({
      current: imgPath + id,
      urls: pice
    })
  },
  imgzhongFn: function (e) {
    var id = e.currentTarget.dataset.id, imgPath = this.data.imgPath;
    var plantData = this.data.plantData;
    var imgs = [];
    var images = [];
    var pice = [];
    for (var i = 0; i < plantData.length; i++) {
      imgs += plantData[i].plotsInfoImgs + ',';
    }
    images = imgs.split(",")
    images.pop()
    var a = [];
    for (var i = 0; i < images.length; i++) {
      a += imgPath + images[i] + ','
    }
    pice = a.split(",")
    pice.pop()
    wx.previewImage({
      current: imgPath + id,
      urls: pice
    })
  },
  lookFn: function () {
    this.setData({
      isLook: !this.data.isLook
    })
  }
})