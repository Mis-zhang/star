//Page Object
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    current: 0,
    itemId: Number,
    page: 1,
    pagerow: 10,
    type: 0,
    starList: [],
    rowsStar: Number,
    showImgUrl: gConfig.imgHttp,
    numList: Object,
    isHideLoadMore: false,
    isAllMore: false
  },
  onLoad: function (options) {
    this.setData({
      itemId: options.itemId
    })
    this.getStarList(this.data.itemId, this.data.page, this.data.pagerow, this.data.type)
    this.getNumber()
  },
  onShow: function () {

  },
  onShareAppMessage: function () {

  },
  tabClick(e) {
    let indexs = e.currentTarget.dataset.index
    if (this.data.current === indexs) {
      return false
    } else {
      this.setData({
        current: indexs
      })
      this.getStarList(this.data.itemId, this.data.page, this.data.pagerow, indexs)
    }
    console.log(this.data.current)
  },
  swiperClick(e) {
    this.setData({
      current: e.detail.current
    });
  },
  getNumber() {
    let sign = util.hexMD5('itemId=' + this.data.itemId + gConfig.key),
    _this = this
    wx.request({
      url: gConfig.http + 'dpxcx/evaluate/getnumber',
      data: {
        itemId: this.data.itemId,
        sign
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        _this.setData({
          numList: res.data.data
        })
      }
    })
  },
  getStarList(itemId, page, pagerow, type) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    let _this = this,
      sign = util.hexMD5('itemId=' + itemId + '&page=' + page + '&pagerow=' + pagerow + '&type=' + type + gConfig.key)
    var reqTask = wx.request({
      url: gConfig.http + 'dpxcx/evaluate/list',
      data: {
        itemId,
        page,
        pagerow,
        type,
        sign
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res);
        wx.hideLoading()
        let data = res.data.data
        let rowsStar = res.data.data.totalrows
        data.rows.map((item) => {
          item.appendTimeDays = _this.commentTimeHandle(item.addTime, item.appendTime)
          return item
        })
        _this.setData({
          starList: data.rows,
          rowsStar: rowsStar
        })
        console.log('starList', _this.data.starList);
      }
    });
  },
  commentTimeHandle(startTime, endTime) {
    var publishTime = startTime / 1000,
      date = new Date(publishTime * 1000),
      Y = date.getFullYear(),
      M = date.getMonth() + 1,
      D = date.getDate(),
      H = date.getHours(),
      m = date.getMinutes(),
      s = date.getSeconds();
    if (M < 10) {
      M = '0' + M;
    }
    if (D < 10) {
      D = '0' + D;
    }
    if (H < 10) {
      H = '0' + H;
    }
    if (m < 10) {
      m = '0' + m;
    }
    if (s < 10) {
      s = '0' + s;
    }
    var nowTime = endTime / 1000,
      diffValue = nowTime - publishTime,
      diff_days = parseInt(diffValue / 86400),
      diff_hours = parseInt(diffValue / 3600),
      diff_minutes = parseInt(diffValue / 60),
      diff_secodes = parseInt(diffValue);

    if (diff_days > 0 && diff_days < 3) {
      return diff_days + "天后";
    } else if (diff_days <= 0 && diff_hours > 0) {
      return diff_hours + "小时后";
    } else if (diff_hours <= 0 && diff_minutes > 0) {
      return diff_minutes + "分钟后";
    } else if (diff_secodes < 60) {
      if (diff_secodes <= 0) {
        return "刚刚";
      } else {
        return diff_secodes + "秒后";
      }
    } else if (diff_days >= 3 && diff_days < 30) {
      return diff_days + "天后";
    } else if (diff_days >= 30) {
      return diff_days + "天后";
    }
  },
  lookImg(e) {
    let starList = this.data.starList,
      index = e.currentTarget.dataset.index,
      parent = e.currentTarget.dataset.parent,
      showImgUrl = this.data.showImgUrl
    var urls = []
    for (var i = 0; i < starList[parent].urls.length; i++) {
      urls.push(showImgUrl + starList[parent].urls[i].url)
    }
    console.log('urls------->', urls);
    wx.previewImage({
      current: showImgUrl + starList[parent].urls[index].url,
      urls: urls
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    let _this = this,
      page = 1,
      pagerow = 10,
      type = this.data.current
    let sign = util.hexMD5('itemId=' + this.data.itemId + '&page=' + page + '&pagerow=' + pagerow + '&type=' + type + gConfig.key)
    var reqTask = wx.request({
      url: gConfig.http + 'dpxcx/evaluate/list',
      data: {
        itemId: _this.data.itemId,
        page,
        pagerow,
        type,
        sign
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res);
        let data = res.data.data
        let rowsStar = res.data.data.totalrows
        data.rows.map((item) => {
          item.appendTimeDays = _this.commentTimeHandle(item.addTime, item.appendTime)
          return item
        })
        _this.setData({
          starList: data.rows,
          rowsStar: rowsStar,
          allNum: data.rows.length,
          goodNum: data.filter.goodNum,
          middleNum: data.filter.middleNum,
          badNum: data.filter.badNum,
          imgNum: data.filter.imgNum,
        })
        console.log('starList', _this.data.starList);
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  onReachBottom: function () {
    this.setData({
      isHideLoadMore: true
    })
    let _this = this,
      page = this.data.page,
      pagerow = 10,
      type = this.data.current
    page = page + 1
    let sign = util.hexMD5('itemId=' + this.data.itemId + '&page=' + page + '&pagerow=' + pagerow + '&type=' + type + gConfig.key)
    var reqTask = wx.request({
      url: gConfig.http + 'dpxcx/evaluate/list',
      data: {
        itemId: _this.data.itemId,
        page,
        pagerow,
        type,
        sign
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res);
        let data = res.data.data
        let rowsStar = res.data.data.totalrows
        data.rows.map((item) => {
          item.appendTimeDays = _this.commentTimeHandle(item.addTime, item.appendTime)
          return item
        })
        let starList = _this.data.starList
        for (var i = 0; i < data.rows.length; i++) {
          starList.push(data.rows[i])
        }
        _this.setData({
          starList: starList,
          rowsStar: rowsStar,
          allNum: data.rows.length,
          goodNum: data.filter.goodNum,
          middleNum: data.filter.middleNum,
          badNum: data.filter.badNum,
          imgNum: data.filter.imgNum
        })
        if (res.data.result.code == '200') {
          _this.setData({
            isHideLoadMore: false
          })
          if (data.rows.length != 10 || data.rows == [] || data.rows == null) {
            _this.setData({
              isAllMore: true
            })
          } else {
            _this.setData({
              isAllMore: false
            })
          }
        }
        console.log('starList', _this.data.starList);
      }
    });
  },
});