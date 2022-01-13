/**************************************配置约定*******************************************/

var data_protocol={
	success:0,
	error:-1,			//未知异常
	intentialError:-2,	//故意异常
	commonError:-3,		//公共异常
	unauthc:2000,		//未认证
	articleOrigin:0,	//原创
	articleReprint:1,	//转载
	articleTranslate:2,	//翻译
	pageLimit:5,		//每页显示数量
	comment:'0',		
	reply:'1'
}
//配置文件
var data_file = {
	values:"config/application.json"
};

/**************************************工具方法*******************************************/

//获取当前文件的相对根的路径层次
var getRelativePath = function(){
	var pathname = window.location.pathname;
	var relativePath = "";
	
	var j=0;
	for(var i=0; i<pathname.length; i++){
		if(pathname.charAt(i) == "/"){
			j++;
			//测试的时候，j要>2
			//实际生产时，j只需要>1
			if(j > 2){
				relativePath += "../";
			}
		}
	}
	return relativePath;
}
//自定义函数重载
function addMethod(object, name, fn) {

　　var old = object[name];
　　object[name] = function() {
　　　　if(fn.length === arguments.length) {
　　　　　　return fn.apply(this, arguments);
　　　　} else if(typeof old === "function") {
　　　　　　return old.apply(this, arguments);
　　　　}
　　}
}
addMethod(data_file,"get_data",function(relative_path){
	$.ajaxSettings.async = false;
//	获得文件名路径
	var file_path = this.values;
//	获得相对路径
	var relative_url = relative_path+file_path;
	var result = null;
	$.getJSON(relative_url ,function (data) {
		
		result = data['front-site'];
	})
	
	$.ajaxSettings.async = true;
	return result;
})
addMethod(data_file,"get_data",function(relative_path,data_field){
	$.ajaxSettings.async = false;
//	获得文件名路径
	var file_path = this.values;
//	获得相对路径
	var relative_url = relative_path+file_path;
	var result = null;
	$.getJSON(relative_url ,function (data) {
		
		result = data[data_field];
	})
	
	$.ajaxSettings.async = true;
	return result;
})
addMethod(data_file,"get_data",function(relative_path,relative_url,data_field){
	$.ajaxSettings.async = false;
	var result = null;
	$.getJSON(relative_url ,function (data) {
		result = data[data_field];
	})
	
	$.ajaxSettings.async = true;
	return result;
})

//重构date格式化
Date.prototype.format = function (fmt) {  
    var o = {  
        "M+": this.getMonth() + 1, //月   
        "d+": this.getDate(), //日   
        "h+": this.getHours(), //时   
        "m+": this.getMinutes(), //分   
        "s+": this.getSeconds(), //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds() //毫秒   
    };  
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));  
    for (var k in o)  
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));  
    return fmt;  
}
var dateToString = function(date,separator){ 
	if(!separator){
        separator="-";
	}
	var year = date.getFullYear(); 
	var month =(date.getMonth() + 1).toString(); 
	var day = (date.getDate()).toString();  
	if (month.length == 1) { 
	    month = "0" + month; 
	} 
	if (day.length == 1) { 
	    day = "0" + day; 
	}
	var dateTime = year + separator + month + separator + day;
	return dateTime; 
}
var stringToDate = function(dateStr,separator1,separator2){
    if(!separator1){
       separator1="-";
    }
    if(!separator2){
       separator2=":";
    }
    //日期
    var dateDate = dateStr.split(" ")[0];
    var dateArr = dateDate.split(separator1);
    var year = parseInt(dateArr[0]);
    var month;
     //处理月份为04这样的情况     
    if(dateArr[1].indexOf("0") == 0){
       month = parseInt(dateArr[1].substring(1));
    }else{
       month = parseInt(dateArr[1]);
    }
    var day = parseInt(dateArr[2]);
    //时间
    var dateTime = dateStr.split(" ")[1];
    var timeArr = dateTime.split(separator2);
    var hour = parseInt(timeArr[0]);
    var minute = parseInt(timeArr[1]);
    var second = parseInt(timeArr[2]);
    //构造
    var date = new Date(year,month -1,day,hour,minute,second);
    return date;

}

/*
 * 改变时间显示样式
 */
var dateDiff = function (date) {
//  // 补全为13位
//  var arrTimestamp = (timestamp + '').split('');
//  for (var start = 0; start < 13; start++) {
//      if (!arrTimestamp[start]) {
//          arrTimestamp[start] = '0';
//      }
//  }
//  timestamp = arrTimestamp.join('') * 1;

    
    var now = new Date().getTime();
    var diffValue = now - date.getTime();
    // 如果本地时间反而小于变量时间
    if (diffValue < 0) {
        return '不久前';
    }

	var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var halfamonth = day * 15;
    var month = day * 30;
    // 计算差异时间的量级
    var monthC = diffValue / month;
    var weekC = diffValue / week;
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    var secondC = (diffValue % minute) / 1000;

    // 数值补0方法
//  var zero = function (value) {
//      if (value < 10) {
//          return '0' + value;
//      }
//      return value;
//  };

    // 使用
    if (monthC > 12) {
        // 超过1年，直接显示年月日
        return dateToString(date,'/');
//      return (function () {
//          var date = new Date(timestamp);
//          return date.getFullYear() + '年' + zero(date.getMonth() + 1) + '月' + zero(date.getDate()) + '日';
//      })();
    } else if (monthC >= 1) {
        return parseInt(monthC) + " months ago";
    } else if (weekC >= 1) {
        return parseInt(weekC) + " weeks ago";
    } else if (dayC >= 1) {
        return parseInt(dayC) + " days ago";
    } else if (hourC >= 1) {
        return parseInt(hourC) + " hours ago";
    } else if (minC >= 1) {
        return parseInt(minC) + " minutes ago";
    }
    return parseInt(secondC)+' seconds ago';
};

function StringBuffer () {
  this._strings_ = new Array();
}

StringBuffer.prototype.append = function(str) {
  this._strings_.push(str);
};

StringBuffer.prototype.toString = function() {
  return this._strings_.join("");
};

$.fn.enable = function(){
	$(this).removeClass("disable");
}
$.fn.disable = function(){
	$(this).addClass("disable");
}

//判断字符是否为空的方法
var isEmpty = function(obj){
	
    if(!obj || typeof obj == "undefined" || obj == null){
        return true;
    }else if(obj.trim() == ""){
    	return true;
    }else{
    	return false;
    }
}
/**
 * 获得后台请求地址
 * deprecated
 * @param {Object} url
 */
var get_site = function(url) {
	$.ajaxSettings.async = false;
	
	var result = null;
	$.getJSON(url ,function (data) {
		
		result = data['front-site'];
	})
	
	$.ajaxSettings.async = true;
	return result;
}
/*
 * deprecated
 */
var get_data = function(url,key){
	$.ajaxSettings.async = false;
	
	var result = null;
	$.getJSON(url ,function (data) {
		
		result = data[key];
	})
	
	$.ajaxSettings.async = true;
	return result;
}

/**
 * 获得地址栏的参数
 */
var getRequestParameter = function() {
    var url = window.location.search; //获取地址栏url中"?"符后的字串
    var theRequest = new Object();
    var index = url.indexOf("?");
    if (index != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
			var eqIndex = strs[i].indexOf("=");
            theRequest[strs[i].substring(0,eqIndex)]=decodeURI(strs[i].substr(eqIndex+1));
        }
    }
    return theRequest;
}

/**
 * 获得指定url的参数
 */
var getUrlParameter = function(url) {
    var theRequest = new Object();
    var index = url.indexOf("?");
    if (index != -1) {
        var str = url.substr(index+1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {

            theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);

        }
    }
    return theRequest;
}

function getReturnUri(relative_path){
	var site_location = window.location.href;
    var front_page_site = data_file.get_data(relative_path,"front-page-site");
    var front_page_site_len = front_page_site.length;
    var index = site_location.indexOf(front_page_site)+front_page_site_len;
    var return_uri = site_location.substr(index+1);//去除第一个"/"
//  console.log(site_location+"##"+front_page_site+"##"+front_page_site_len+"##"+index+"##"+return_uri);
    
    return return_uri;
}

//点击不同的标签进行相应的变换
function switchTab($navTab,$navContent){
//	$navContent.addClass("hide");
	$navTab.on("click",function(){
		var _this=this;
		$navTab.each(function(index,object){
			if(_this==object){
				$(object).addClass("active");
				$navContent.eq(index).addClass("show");
			}else{
				$(object).removeClass("active");
				$navContent.eq(index).removeClass("show");
			}
		})
	})
}


//元素旋转
$.fn.animateRotate = function(angle, duration, easing, complete) {
  var args = $.speed(duration, easing, complete);
  var step = args.step;
  return this.each(function(i, e) {
    args.complete = $.proxy(args.complete, e);
    args.step = function(now) {
      $.style(e, 'transform', 'rotate(' + now + 'deg)');
      if (step) return step.apply(e, arguments);
    };

    $({deg: 0}).animate({deg: angle}, args);
  });
};

//加载icon的出现与否
var loadInterval = {};
function changeLoadIconEvent($outerElem, state){
	var prefix = "load_icon_";
	var $loadIconDiv = $outerElem.find(".load-icon").eq(0);
	if(state){
		$loadIconDiv.slideDown(200);
		var $iconLoad = $loadIconDiv.children("span");
		if(!$iconLoad.is(":animated")){
			$iconLoad.animateRotate(360,800,"swing",function(){})
		}
		loadInterval[prefix+$outerElem.attr("data-load-id")] = setInterval(function(){
			if(!$iconLoad.is(":animated")){
				$iconLoad.animateRotate(360,800,"swing",function(){})
			}
		},1000);
	}else{
		clearInterval(loadInterval[prefix+$outerElem.attr("data-load-id")]);
		$loadIconDiv.slideUp(200);
	}
	
}
