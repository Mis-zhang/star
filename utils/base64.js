

/************************************************************************/
/* BASE64编码                                                                       */
/*                                                     */
/************************************************************************/
function Base64() { };
var base64encodechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
												-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
												-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
												-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
												52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
												-1,0,1,2,3,  4,5,6,7,8,9, 10, 11, 12, 13, 14,
												15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
												-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
												41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);


Base64.Encode = function(str){
  var out, i, len;
  var c1, c2, c3;
  len = str.length;
  i = 0;
  out = "";
  while(i < len) {
    c1 = str.charCodeAt(i++) & 0xff;  
  	if(i == len){
	  out += base64encodechars.charAt(c1 >> 2);		
	  out += base64encodechars.charAt((c1 & 0x3) << 4);		
	  out += "==";
	  break;
  	}	
  
  	c2 = str.charCodeAt(i++);  
  	if(i == len){
   	  out += base64encodechars.charAt(c1 >> 2);
   	  out += base64encodechars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xf0) >> 4));
   	  out += base64encodechars.charAt((c2 & 0xf) << 2);
   	  out += "=";
   	  break;
  	}
  
  	c3 = str.charCodeAt(i++);  
    out += base64encodechars.charAt(c1 >> 2);
    out += base64encodechars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xf0) >> 4));
    out += base64encodechars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >>6));
    out += base64encodechars.charAt(c3 & 0x3f);
  }
  
  return out;
};

Base64.EncodeURL = function(url){
    url = Base64.Encode(url);
    
    var re;
    re = /\=/g; 
    
    return url.replace(re, "*");
};

Base64.Decode =function(str) {
  var c1, c2, c3, c4;
  var i, len, out;
  len = str.length;
  i = 0;
  out = "";
	
  while(i < len) {
 	
    /* c1 */
    do {
    	c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
    } while(i < len && c1 == -1);
          
    if(c1 == -1) break;
 	
	/* c2 */
	do {
      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
 	} while(i < len && c2 == -1);
		 	
	if(c2 == -1) break; 	
    out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
 			
	/* c3 */
    do {
      c3 = str.charCodeAt(i++) & 0xff;
      if(c3 == 61) {return out;}
      c3 = base64DecodeChars[c3];
	} while(i < len && c3 == -1);
 			
 	if(c3 == -1) break; 			
 	out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
 			
	/* c4 */
	do {
      c4 = str.charCodeAt(i++) & 0xff;
      if(c4 == 61)return out;
      c4 = base64DecodeChars[c4];
	} while(i < len && c4 == -1);
		 
	if(c4 == -1) break; 
  	out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
  }
	return out;
};

Base64.DecodeURL = function(url){    
    var re;
    re = /\*/g; 
    
    url = url.replace(re, "=");
    url = Base64.Decode(url);
    
    return url;
};

var base64 = 'base64W文件下的变量'
module.exports.Base64 = Base64

// var verifiUrl = require('../../base64.js').Base64.Encode(url);