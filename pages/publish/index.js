//Page Object
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {
    orderId: Number,
    clientId: Number,
    companyId: Number,
    isImages: [],
    ItemsData: [],
    countPic: 8,
    showImgUrl: gConfig.imgHttp,
    uploadImgUrl: gConfig.http + 'dpxcx/img/up',
    uploadImgs: [],
    height: '100%'
  },
  onLoad: function (options) {
    let files = []
    this.setData({
      orderId: options.orderId,
      clientId: options.clientId,
      companyId: options.companyId,
      ItemsData: wx.getStorageSync('ItemsData').map((item) => {
        item.flies = []
        item.flag = 5
        item.textArea = ''
        item.count = 8
        item.checkedImgs = []
        return item
      })

    })
    console.log('ItemsData-->', this.data.ItemsData);
  },
  onShow: function () {

  },
  onShareAppMessage: function () {

  },
  getAssess() {
    let _this = this,
     ItemsData = this.data.ItemsData,
     evaluateList = []
    for(var i = 0; i < ItemsData.length; i++) {
      let items = ItemsData[i]
      evaluateList.push({
        content: items.textArea,
        files: items.flies,
        itemId: items.itemId,
        norm: items.norm,
        score: items.flag
      })
    }
    let save = {
      clientId: this.data.clientId,
      companyId: this.data.companyId,
      evaluateList: evaluateList,
      orderId: this.data.orderId
    }
    console.log('save 保存的数据------->', save);
    let datas = JSON.stringify(save)
    let sign = util.hexMD5('data=' + datas + gConfig.key)
    wx.request({
      url: gConfig.http + 'dpxcx/evaluate/save',
      data: {
        data: datas,
        sign
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      success: (res) => {
        console.log('发表成功返回的数据',res);
        if(res.data.result.code == '200') {
          wx.showToast({
            title: '评价成功',
            icon: 'success',
            duration: 2000,
            mask: true
          })
          setTimeout(function () {
            wx.navigateBack({
                delta: 1
              })
          }, 2000)
        }
      },
    })
  },
  getColor1(e) {
    console.log(e.currentTarget.dataset.index);
    let now_index = e.currentTarget.dataset.index,
      ItemsData = this.data.ItemsData
    ItemsData[now_index].flag = 1
    this.setData({
      ItemsData
    })
    console.log(this.data.ItemsData, '星星1');
  },
  getColor2(e) {
    console.log(e.currentTarget.dataset.index);
    let now_index = e.currentTarget.dataset.index,
      ItemsData = this.data.ItemsData
    ItemsData[now_index].flag = 2
    this.setData({
      ItemsData
    })
    console.log(this.data.ItemsData, '星星2');
  },
  getColor3(e) {
    console.log(e.currentTarget.dataset.index);
    let now_index = e.currentTarget.dataset.index,
      ItemsData = this.data.ItemsData
    ItemsData[now_index].flag = 3
    this.setData({
      ItemsData
    })
    console.log(this.data.ItemsData, '星星3');
  },
  getColor4(e) {
    console.log(e.currentTarget.dataset.index);
    let now_index = e.currentTarget.dataset.index,
      ItemsData = this.data.ItemsData
    ItemsData[now_index].flag = 4
    this.setData({
      ItemsData
    })
    console.log(this.data.ItemsData, '星星4');
  },
  getColor5(e) {
    console.log(e.currentTarget.dataset.index);
    let now_index = e.currentTarget.dataset.index,
      ItemsData = this.data.ItemsData
    ItemsData[now_index].flag = 5
    this.setData({
      ItemsData
    })
    console.log(this.data.ItemsData, '星星5');
  },
  getValue(e) {
    let now_index = e.currentTarget.dataset.index,
      ItemsData = this.data.ItemsData
    ItemsData[now_index].textArea = e.detail.value
    console.log('输入内容是', ItemsData[now_index].textArea, '第几个', now_index);
    this.setData({
      ItemsData
    })
    console.log('this.data.ItemsData-->', this.data.ItemsData);
  },
  uploadDetailImage(e){
    var that=this,
    indexs = e.currentTarget.dataset.itemindexs,
    ItemsData=this.data.ItemsData
    ItemsData[indexs].checkedImgs = []
    wx.chooseImage({
         count: 9-ItemsData[indexs].flies.length,
         sizeType: ['original', 'compressed'], 
         sourceType: ['album', 'camera'], 
         success: function(res){
         var imgsrc=res.tempFilePaths; 
          for (var i = 0; i < imgsrc.length; i++) {
            ItemsData[indexs].checkedImgs.push(imgsrc[i])
          }
          that.setData({
            ItemsData:ItemsData
          });
          that.uploadimg({
            url: that.data.uploadImgUrl, 
            path: that.data.ItemsData[indexs].checkedImgs,
            index_img: indexs
          });
    },
    fail: function() {
    },
    complete: function() {
    }
  })
 },
  uploadimg(data) {
    wx.showLoading({
      title: '上传中...',
      mask: true,
    })
    var that = this,
      i = data.i ? data.i : 0,
      success = data.success ? data.success : 0, 
      fail = data.fail ? data.fail : 0, 
      ItemsData = this.data.ItemsData
      console.log('上传图片的数组内容', data.path);
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      name: 'file', 
      formData: {
        companyId: that.data.companyId
      }, 
      success: (resp) => {
        wx.hideLoading();
        success++; 
        console.log(i);
        var ItemsData = that.data.ItemsData
        var str = JSON.parse(resp.data)
        var img_url = str.data.url;
        console.log('img_url--------->', img_url);
        ItemsData[data.index_img].flies.push(img_url)
        that.setData({
          ItemsData
        })
        console.log('that.data.ItemsData 输出-------->',that.data.ItemsData);
      },
      fail: (res) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 1500,
          mask: true
        });
        fail++; 
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        console.log(i);
        i++; 
        if (i == data.path.length) {       
        } else { 
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }
      }
    });
  },
  delImage(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index,
    parent = e.currentTarget.dataset.parent,
    ItemsData = this.data.ItemsData
    this.remove(ItemsData[parent].flies, ItemsData[parent].flies[index])
    this.setData({
      ItemsData
    })
    console.log('ItemsData------>', this.data.ItemsData)
  },
  remove(array, val) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == val) {
        array.splice(i, 1);
      }
    }
    return -1;
  },
  lookImg(e) {
    let ItemsData = this.data.ItemsData,
    index = e.currentTarget.dataset.index,
    parent = e.currentTarget.dataset.parent
    var urls = []
    for(var i = 0; i < ItemsData[parent].flies.length; i++) {
      urls.push(this.data.showImgUrl + ItemsData[parent].flies[i])
    }
    console.log('urls------->', urls);
    wx.previewImage({
      current: this.data.showImgUrl + ItemsData[parent].flies[index],
      urls: urls
    });
  }
});