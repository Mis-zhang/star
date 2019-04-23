App({
  onLaunch: function (options) {
    this.appData = options;
    console.log(options)
    wx.clearStorage();
    var that = this;
    var util = require('utils/md5.js');
    wx.login({
      success: function (res) {
        var sign = util.hexMD5('code=' + res.code + '&companyId=' + that.companyId + that.key);
        if (res.code) {
          wx.request({
            url: that.http + 'dpxcx/login', 
            data: { 
              code: res.code,
              companyId: that.companyId,
              sign: sign
            },
            header: { 'content-type': 'application/json' },
            success: function (res) {
              console.log(res)
              getApp().appId = res.data.data.appId;
              console.log(res.data.data.appId)
              var wxData = {
                "wxOpenid": res.data.data.wxOpenid,
                "clientId": res.data.data.clientId,
                "isOpenPay": res.data.data.isOpenPay, 
                "region": res.data.data.region,
                "mob": res.data.data.mob,
                "name": res.data.data.name,
                "companyId": that.companyId
              }
              wx.setStorageSync('wxData', wxData);
              wx.setStorageSync('shoppingcarData', []);
            },
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },

  appData:'',
  key: '&key=YjU5YTA3NzEtMDI2MS00YzhiLTljM2ItYzE2MTljZDQwNDNhNGExYjEzZTUtYmIx',  
       
  // http: "https://yunstore.51zhongzi.com/",                                                 //正式
  // imgHttp: "https://img.51zhongzi.com/",                                                     //正式
  //http: "http://192.168.1.173:8030/store/", 
  // http: 'http://192.168.4.109:8090/store/',         //李钊
  // imgHttp: 'http://192.168.4.109:8064/img/',
  http: 'http://it-lsm.51zhongzi.com:7242/store/',         // 路衫明
  imgHttp: 'http://it-lsm.51zhongzi.com:8030/img/',
  httpField: 'https://sft.51zhongzi.com/',       
  // companyId: 200035, 
  companyId: 10000036,
  testId:""
})
