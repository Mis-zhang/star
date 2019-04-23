Page({
  data: { isshopcut: false, pageNo: 1, pageSize:10 },
  onLoad: function (options) {
    var that = this;
    that.setData({
      company: options.company,
      address: options.address,
      mob: options.mob,
      fullRegionName: options.fullRegionName,
      shopfeedetail: options.shopfeedetail,
      shop:true,
      cropId: options.cropId,
      mark:options.mark,
      status: options.status
    })
  },

  onShareAppMessage: function () {

  },
  getMobFn: function (e) {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.mob,
      success: function (res) {
        console.log(res);
      }
    })
  },
  //获取示范田列表
  getFieldFn: function () {
    var that = this,
      pageNo = pageNo,
      pageSize = 10;
    var sellData = wx.getStorageSync('sellData'),
      wxData = wx.getStorageSync('wxData')
    if (wxData.region == 0 || wxData.region == undefined) {
      var region = sellData.region;
    } else {
      var region = wxData.region;
    }
    var sign = util.hexMD5('cropId=' + that.data.cropId + '&mark=' + that.data.mark + '&pageNo=' + that.data.pageNo + '&pageSize=' + that.data.pageSize + '&region=' + region + '&status=' + that.data.status + gConfig.key);
    wx.showLoading({
      title: '玩命加载中...'
    });
    wx.request({
      url: gConfig.httpField + 'xcx/plots/search',
      data: {
        baseId: baseId,
        companyId: companyId,
        cropId: cropId,
        cropTypeId: cropTypeId,
        mark: mark,
        pageNo: pageNo,
        pageSize: pageSize,
        region: region,
        status: status,
        sign: sign
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.result.code == '200') {
          var imgPath = gConfig.imgHttp;
          var farmList = res.data.data.list;
          var kongDatas = that.data.kongDatas;
          var itemData = res.data.data;
          var seq1 = res.data.data.seq,
            region;


          if (that.data.flag == 1) {
            if (seq1 == undefined || seq1 == "") {
              seq1 = that.data.seq1;
              region = that.data.region;
              var region = wx.setStorageSync('region', region)
            } else {
              seq1 = res.data.data.seq;
              region = res.data.data.region;
              var region = wx.setStorageSync('region', region)
            }
          } else {
            region = region;
          }

          if (baseId != '' || region != '') {
            //政府示范田必须有baseId和region;
            var baseName = res.data.data.baseName,
              regionName = res.data.data.regionName;
            for (var i = 0; i < farmList.length; i++) {
              kongDatas.push(farmList[i]);
            }
            that.setData({
              itemsData: that.data.itemsData.concat(itemData.list),
              imgPath: imgPath,
              baseName: baseName,
              regionName: regionName,
              seq1: seq1
            })
            if (farmList == '') {
              that.setData({
                searchLoading: false,
                searchLoadingComplete: true
              })
            }
          } else {
            for (var i = 0; i < farmList.length; i++) {
              kongDatas.push(farmList[i]);
            }
            that.setData({
              itemsData: that.data.itemsData.concat(itemData.list),
              imgPath: imgPath,
              seq1: seq1
            })
            if (farmList == '') {
              that.setData({
                searchLoading: false,
                searchLoadingComplete: true
              })
            }
          }
          if (companyId != '') { //企业进入,作物和区域互相筛选
            var qySelectTxtVal = that.data.arrcAreaList;
            if (wx.getStorageSync("areaData")) {
              var qySelectTxt = wx.getStorageSync('areaData').qySelectTxt;
              var jdSelectTxt = wx.getStorageSync('areaData').jdSelectTxt;
              if (qySelectTxt == '全部') {
                that.getAreaFn1('', '选择区域/基地/片区', '', qySelectTxtVal);
              } else {
                if (signs == true) { // 选择作物时清空区域和基地
                  that.getAreaFn1('', '', '', qySelectTxtVal);
                  that.setData({
                    currentArea: [0, 0]
                  })
                } else {
                  //选择区域时
                  that.getAreaFn1('', qySelectTxt, jdSelectTxt, qySelectTxtVal);
                }
              }
            }
          } else { //政府进入,作物和区域互相筛选
            var qySelectTxtVal = that.data.arrcAreaList;
            if (signs) {
              that.getAreaFn1('', '', '', qySelectTxtVal);
              that.setData({
                currentArea: [0, 0]
              })
            } else {
              that.getAreaFn1('', that.data.currentAreaTxt, '', qySelectTxtVal);
            }
          }
        }
      }
    })

    wx.showLoading({
      title: '玩命加载中...'
    });
    wx.request({
      url: gConfig.httpField + 'xcx/plots/search',
      data: {
        baseId: baseId,
        companyId: companyId,
        cropId: cropId,
        cropTypeId: cropTypeId,
        mark: mark,
        pageNo: pageNo,
        pageSize: pageSize,
        region: region,
        status: status,
        sign: sign
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.result.code == '200') {
          var imgPath = gConfig.imgHttp;
          var farmList = res.data.data.list;
          var kongDatas = that.data.kongDatas;
          var itemData = res.data.data;
          var seq1 = res.data.data.seq,
            region;


          if (that.data.flag == 1) {
            if (seq1 == undefined || seq1 == "") {
              seq1 = that.data.seq1;
              region = that.data.region;
              var region = wx.setStorageSync('region', region)
            } else {
              seq1 = res.data.data.seq;
              region = res.data.data.region;
              var region = wx.setStorageSync('region', region)
            }
          } else {
            region = region;
          }

          if (baseId != '' || region != '') {
            //政府示范田必须有baseId和region;
            var baseName = res.data.data.baseName,
              regionName = res.data.data.regionName;
            for (var i = 0; i < farmList.length; i++) {
              kongDatas.push(farmList[i]);
            }
            that.setData({
              itemsData: that.data.itemsData.concat(itemData.list),
              imgPath: imgPath,
              baseName: baseName,
              regionName: regionName,
              seq1: seq1
            })
            if (farmList == '') {
              that.setData({
                searchLoading: false,
                searchLoadingComplete: true
              })
            }
          } else {
            for (var i = 0; i < farmList.length; i++) {
              kongDatas.push(farmList[i]);
            }
            that.setData({
              itemsData: that.data.itemsData.concat(itemData.list),
              imgPath: imgPath,
              seq1: seq1
            })
            if (farmList == '') {
              that.setData({
                searchLoading: false,
                searchLoadingComplete: true
              })
            }
          }
          if (companyId != '') { //企业进入,作物和区域互相筛选
            var qySelectTxtVal = that.data.arrcAreaList;
            if (wx.getStorageSync("areaData")) {
              var qySelectTxt = wx.getStorageSync('areaData').qySelectTxt;
              var jdSelectTxt = wx.getStorageSync('areaData').jdSelectTxt;
              if (qySelectTxt == '全部') {
                that.getAreaFn1('', '选择区域/基地/片区', '', qySelectTxtVal);
              } else {
                if (signs == true) { // 选择作物时清空区域和基地
                  that.getAreaFn1('', '', '', qySelectTxtVal);
                  that.setData({
                    currentArea: [0, 0]
                  })
                } else {
                  //选择区域时
                  that.getAreaFn1('', qySelectTxt, jdSelectTxt, qySelectTxtVal);
                }
              }
            }
          } else { //政府进入,作物和区域互相筛选
            var qySelectTxtVal = that.data.arrcAreaList;
            if (signs) {
              that.getAreaFn1('', '', '', qySelectTxtVal);
              that.setData({
                currentArea: [0, 0]
              })
            } else {
              that.getAreaFn1('', that.data.currentAreaTxt, '', qySelectTxtVal);
            }
          }
        }
      }
    })
  }

})