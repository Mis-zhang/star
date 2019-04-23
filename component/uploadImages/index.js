// component/uploadImages/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    count: { //最多选择图片的张数，默认9张
      type: Number,
      value: 8
    },
    uploadUrl: { //图片上传的服务器路径
      type: String,
      value: ''
    },
    showUrl: { //图片的拼接路径
      type: String,
      value: ''
    },
    ItemsData: {
      type: Array,
      value: []
    },
    itemIndex: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    detailPics: [], //上传的结果图片集合\
    showAdd: true
  },

  ready: function() {
    console.log(this.data)
    console.log(this.data.ItemsData, '传过来的数组');
    console.log(this.data.itemIndex, '传过来的下标');
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 上传详细图片
     */
    uploadDetailImage: function(e) { //这里是选取图片的方法
      var that = this;
      var pics = [];
      var detailPics = that.data.detailPics;
      console.log('detailPics.length---->',detailPics.length);
      
      // if (detailPics.length >= that.data.count) {
      //   wx.showToast({
      //     title: '最多选择' + that.data.count + '张！',
      //   })
      //   return;
      // }
      wx.chooseImage({
        count: that.data.count, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function(res) {
          var imgs = res.tempFilePaths;
          for (var i = 0; i < imgs.length; i++) {
            pics.push(imgs[i])
          }
          that.uploadimg({
            url: that.data.uploadUrl, //这里是你图片上传的接口
            path: pics, //这里是选取的图片的地址数组
          });
        },
      })

    },
    //多张图片上传
    uploadimg: function(data) {
      wx.showLoading({
        title: '上传中...',
        mask: true,
      })
      var that = this,
        i = data.i ? data.i : 0,
        success = data.success ? data.success : 0,
        fail = data.fail ? data.fail : 0;
      wx.uploadFile({
        url: data.url,
        filePath: data.path[i],
        name: 'file',
        formData: {
          companyId: 12
        },
        success: (resp) => {
          console.log('哈哈哈---》',resp)
          wx.hideLoading();
          success++;
          var str = resp.data //返回的结果，可能不同项目结果不一样
          var pic = JSON.parse(str);
          var pic_name = that.data.showUrl + pic.data.url;
          var detailPics = that.data.detailPics;
          var itemIndex = that.data.itemIndex;
          var ItemsData = that.data.ItemsData
          detailPics.push(pic_name)
          if(detailPics.length == 8) {
            this.setData({
              showAdd: false
            })
          }else {
            this.setData({
              showAdd: true
            })
          }
          ItemsData[itemIndex].flies = detailPics
          that.setData({
            detailPics: ItemsData[itemIndex].flies
          })
          console.log('this.data.detailPics----->上', this.data.detailPics);
          console.log('this.data.ItemsData----->下', ItemsData);
        },
        fail: (res) => {
          wx.showToast({
            title: '上传失败',
            icon: 'none',
            duration: 1500,
            mask: true
          });
          fail++;
          // console.log('fail:' + i + "fail:" + fail);
        },
        complete: () => {
          i++;
          if (i == data.path.length) { //当图片传完时，停止调用     
            // console.log('执行完毕');
            // console.log('成功：' + success + " 失败：" + fail);
            var myEventDetail = {
              picsList: that.data.detailPics
            } // detail对象，提供给事件监听函数
            var myEventOption = {} // 触发事件的选项
            that.triggerEvent('myevent', myEventDetail, myEventOption)
          } else { //若图片还没有传完，则继续调用函数
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
        newImags = this.data.isImages
      this.remove(newImags, newImags[index])
      console.log('newImags------>', newImags)
      this.setData({
        isImages: newImags
      })
    },
    remove(array, val) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] == val) {
          array.splice(i, 1);
        }
      }
      return -1;
    },

  }
})

