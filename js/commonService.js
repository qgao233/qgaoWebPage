/**************************************业务方法*******************************************/


function establishWebSocket(relative_path){
	var ws_site = data_file.get_data(relative_path,"ws-site");
	onlineSocket = new WebSocket(ws_site+"/onlineSocket");
	
	//连接发生错误的回调方法
    onlineSocket.onerror = function(){
        console.log("error");
    };

    //连接成功建立的回调方法
    onlineSocket.onopen = function(event){
        console.log("open");
    }

    //接收到消息的回调方法
    onlineSocket.onmessage = function(event){
        setMessageInnerHTML(event.data);
    }

    //连接关闭的回调方法
    onlineSocket.onclose = function(){
        console.log("close");
    }

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function(){
        onlineSocket.close();
    }

    //将消息显示在网页上
    function setMessageInnerHTML(innerHTML){
        console.log("有链接加入，当前人数为:"+innerHTML);
        $(".visited-people span").html(innerHTML);
    }

    //关闭连接
    function closeWebSocket(){
        onlineSocket.close();
    }

    //发送消息
    function send(message){
        onlineSocket.send(message);
    }
}



/**
 * 初始化导航栏的分类
 */
var initnav = function(front_site,relative_path){
	
	//判断当前浏览器是否支持WebSocket
    if('WebSocket' in window){
        establishWebSocket(relative_path);
    }
    else{
        console.log('Not support websocket');
    }
	
	$.ajaxSettings.async = false;
	$("#header").load(relative_path+"common/headerV1.0.html");
	$.ajaxSettings.async = true;
	
	var $navLi = $("ul.lanbai-navbar-left li");
	var navLiLen = $navLi.length;
	for(var i = 0;i<navLiLen;i++){
		var $a = $navLi.eq(i).children("a");
		//头部的每一个链接都是新窗口打开
		$a.attr("target","_blank");
		$a.attr("href",relative_path+"container/develop/ing.html");
		switch(i){
			case 1:$a.html("论坛");break;
			case 2:$a.html("视频");break;
			case 3:$a.html("应用");break;
			case 4:$a.html("聊天室");break;
			case 5:$a.html("开发过程");break;
			default:$a.html("其他");break;
		}
	}
	$navLi.eq(0).children("a").attr("href",relative_path+"index.html").html("博客");
	$navLi.eq(7).children("a").attr("href",relative_path+"container/poll/createPoll.html").html("投票调查");
	
	//logo
    $(".lanbai-nav-logo").attr("href",relative_path+"index.html");
    
    var return_uri = getReturnUri(relative_path);

    var userObject = {};
    var headerParams = getHeaderParams();
    $.ajax({
    	type:"get",
    	url:front_site+"/isLogin",
    	async:true,
    	dataType:"json",
    	headers:headerParams,
    	success:function(data){
    		if(data.code==data_protocol.success){
    			$(".click-login").css("display","none");
    			$(".already-login").css("display","block");
    			$(".write-article").attr("href",relative_path+"container/article/writeArticle.html");
    			var headerParams = getHeaderParams();
    			$.ajax({
    				type:"get",
    				url:front_site+"/user/detail/get",
    				headers:headerParams,
    				async:true,
    				dataType:"json",
    				success:function(data){
    					if(data.code==data_protocol.success){
    						var userDetail = data.data;
    						var userNick = userDetail.userNickname;
    						$(".loged-nick").html(userNick);
    						userObject.user_nick = userNick;
    						//头像
							user_id = userDetail.userId;
							userObject.user_id = user_id;
							if(!!userDetail.userImageUri){
								var $imgTag = $('<img style="width:25px;height:25px;border-radius:5px;position:relative;top: -2px;">')
								$imgTag.prop("src",front_site+"/img/user/get/"+user_id+"?random="+Math.random());
								$(".loged-user-icon").remove();
								$(".loged-user").prepend($imgTag);
							}
							
							//如果已登录,查看是否是在登录注册界面
							var site_location = window.location.href;
							var login_module = data_file.get_data(relative_path,"login-module");
							var index = site_location.indexOf(login_module);
							if(!!index && index >= 0){
								var return_uri = getRequestParameter().return_uri;
								if(!!return_uri){
									window.location.href=relative_path+return_uri;
								}else{
									jumpIndex(relative_path);
								}
							}
    					}else if(data.code==data_protocol.unauthc){
    						jumpLogin(relative_path,return_uri);
			    		}
    				}
    			});
		    	$(".private-page>a").attr("href",relative_path+"container/user/mainPage.html?user_id=1521864246651");
		    	$(".log-out").on("click",function(){
		    		
		    		var headerParams = getHeaderParams();
		    		$.ajax({
		    			type:"get",
		    			url:front_site+"/logout",
		    			async:false,
		    			headers:headerParams,
		    			xhrFields: {
				            withCredentials: true
				        },
				        crossDomain: true,
		    			dataType:"json",
		    			success:function(data){
		    				if(data.code==data_protocol.success){
		    					jumpIndex(relative_path);
		    				}else if(data.code==data_protocol.unauthc){
		    					jumpLogin(relative_path,return_uri);
		    				}else{
		    					alert(data.info);
		    				}
		    			}
		    		});
		    	})
    		}else if(data.code==2000){
    			$(".click-login").css("display","block");
    			$(".already-login").css("display","none");
    			$(".click-login .login-url").prop("href",relative_path+"login/static/login.html").attr("target","_blank");
    		}
    	}
    });
    
	
	$(".btn-search").on("click",function(){
		var params = $(".search-form").serialize();
		window.location.href=relative_path+"container/article/searchResult.html?"+params;
		//当捕捉到事件(event)时，判断为false，阻止当前时间继续运行作用；放在超链接中则不执行超链接；
		//或者return false;不是阻止事件继续向顶层元素传播，而是阻止浏览器对事件的默认处理。
		window.event.returnValue=false; 
	})
	
	return userObject;
}
//加载侧边导航
var loadSideNav = function(relative_path){
	$.ajaxSettings.async = false;
	$("#side-nav").load(relative_path+"common/sideNav.html");
	$.ajaxSettings.async = true;
	
	//回到顶部
	$(".nav-1 li").click(function(){
		$('html').animate({scrollTop: 0},500);
	})
	
}

//二分查找
var binarySearch = function(scrollTop,itemTopValues){
	var begin = 0,end = itemTopValues.length - 1;
	if(scrollTop < itemTopValues[begin]){
		order = begin;
	}else if(scrollTop >= itemTopValues[end]){
		order = end;
	}else{
		while(begin<end){
			if(begin + 1 == end){
				order = begin;
				break;
			}

			var middle = Math.floor((begin + end) / 2);
			if(scrollTop < itemTopValues[middle]){
				end = middle;
				continue;
			}
			if(scrollTop > itemTopValues[middle]){
				begin = middle;
				continue;
			}
			if(scrollTop == itemTopValues[middle]){
				order = middle;
				break;
			}
		}
	}
	return order;
}

var initContainerRight = function(front_site,relative_path){
	$.ajaxSettings.async = false;
	$("#content-right").load(relative_path+"common/containerRight.html");
	$.ajaxSettings.async = true;
	var liAHrefPrefix = relative_path+"container/article/readArticle.html?article_id=";
	//阅读排行榜
	$.ajax({
		type:"get",
		url:front_site+"/article/clickRank",
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==0){
				$ol = $(".click-rank>ol");
				$ol.empty();
				var msgList = data.data;
				var length = msgList.length;
				for(var i = 0;i<length;i++){
					var li = '<li><a href="'+liAHrefPrefix+msgList[i].articleId+'">'+msgList[i].articleTitle+'</a>('+msgList[i].articleClick+')</li>'
					$ol.append(li);
				}
			}else{
				console.log(data.info)
			}
		}
	});
	//推荐排行榜
	$.ajax({
		type:"get",
		url:front_site+"/article/goodRank",
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==0){
				$ol = $(".good-rank>ol");
				$ol.empty();
				var msgList = data.data;
				var length = msgList.length;
				for(var i = 0;i<length;i++){
					var li = '<li><a href="'+liAHrefPrefix+msgList[i].articleId+'">'+msgList[i].articleTitle+'</a>('+msgList[i].articleGood+')</li>'
					$ol.append(li);
				}
			}else{
				console.log(data.info)
			}
		}
	});
	//评论排行榜
	$.ajax({
		type:"get",
		url:front_site+"/comment/rank/get",
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				$ol = $(".comment-rank>ol");
				$ol.empty();
				var msgList = data.data;
				var length = msgList.length;
				for(var i = 0;i<length;i++){
					var li = '<li><a href="'+liAHrefPrefix+msgList[i].articleId+'">'+msgList[i].cContent+'</a>('+msgList[i].cGoodCount+')</li>'
					$ol.append(li);
				}
			}else{
				console.log(data.info)
			}
		}
	});
	//评论最新榜
	$.ajax({
		type:"get",
		url:front_site+"/comment/new/get",
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				$ol = $(".comment-new-rank>ol");
				$ol.empty();
				var msgList = data.data;
				var length = msgList.length;
				for(var i = 0;i<length;i++){
					var li = '<li><a href="'+liAHrefPrefix+msgList[i].articleId+'">'+msgList[i].cContent+'</a>--<a href="'+msgList[i].userId+'">'+msgList[i].userNick+'</a></li>'
					$ol.append(li);
				}
			}else{
				console.log(data.info)
			}
		}
	});
}

var getHeaderParams = function(){
	var deadline = localStorage.getItem("lanbai-user-deadline");
	var nowTime = new Date().getTime();
	var sessionId;
	if(nowTime >= deadline){
		localStorage.removeItem("lanbai-user-deadline");
		localStorage.removeItem("lanbai-user-sessionId");
	}else{
		sessionId = localStorage.getItem("lanbai-user-sessionId");
	}
	
	var headerParams = {};
	headerParams['Lanbai-Ajax-Request'] = "XMLHttpRequest";
	if(!!sessionId){
		headerParams['Authorization'] = sessionId;
	}
	return headerParams;
}

var jumpLogin = function(relative_path,return_uri){
	window.location.href = relative_path+"login/static/login.html?return_uri="+return_uri;
}
var jumpIndex = function(relative_path){
	window.location.href = relative_path+"index.html";
}
//$(document).ready(function(){
//  //使用服务器时用这种路径
////  $("#header").load("/common/header.html");
////  $("#footer").load("/common/footer.html");
//
//	//使用HBulider时要用下面这种路径
//	 $("#header").load("common/header.html");
//	 $("#footer").load("common/footer.html");
//})

/*******************************新的*************************************/

var relative_path;

var initCommonHeader = function(){
	$.ajaxSettings.async = false;
	$("#common-header").load(relative_path+"html/common/headerV2.0.html");
	$.ajaxSettings.async = true;
	
	//对应的模块,让对应的li变成active
	var pathname = window.location.pathname;
	
	//通过路径找到和li相关的关键字
	var liName = "";
	if(pathname.length == 1 && pathname == "/"){
		liName = "index";
	}else{
		var i;
		var bool = false;
		for(i = 0; i < pathname.length; i++){
			if(pathname.charAt(i) == "/" || pathname.charAt(i) == "."){
				switch(liName){
					case "index":
						bool = true;
						break;
					case "article":
						bool = true;
						break;
					case "video":
						bool = true;
						break;
					case "poll":
						bool = true;
						break;
					case "log":
						bool = true;
						break;
					case "contact":
						bool = true;
						break;
					default:
						break;
				}
				if(bool == false){
					liName = "";
					continue;
				}else{
					break;
				}
			}
			liName += pathname.charAt(i);
		}
	}
	
	//遍历li中的data-name,使其对应到当前网页的li变成active
	$("#common-header .navigator-ul li").each(function(){
		if($(this).attr("data-name").toLowerCase() == liName){
			$(this).addClass("active");
		}else{
			$(this).removeClass("active");
		}
	})
	
	//初始化下拉框事件，如鼠标移动到“头像”、“消息”等li上
	initCommonHeaderDropdownBoxEvent();
	
	//加载common-header中的各个链接地址，以及一切需要从后台获取的内容
	loadCommonHeader();
}

function initCommonHeaderDropdownBoxEvent(){
	initCommonHeaderUserphotoDropdownBoxEvent();
	initCommonHeaderUsermsgDropdownBoxEvent();
	initCommonHeaderUseractivityDropdownBoxEvent();
	initCommonHeaderUserstoreDropdownBoxEvent();
	initCommonHeaderUsercreateDropdownBoxEvent();
}

function initCommonHeaderUsermsgDropdownBoxEvent(){
	var $userMsg = $("#common-header .user-msg");
	$userMsg.find(".drop-down-box").hide();
	$userMsg.on({
		mouseenter:function(){
			$(this).find(".drop-down-box").slideDown(200);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseenter");
			}
		}
		,mouseleave:function(){
			$(this).find(".drop-down-box").slideUp(200,initCommonHeaderUsermsgDropdownBoxEvent);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseleave");
			}
		}
	})
}

function initCommonHeaderUserphotoDropdownBoxEvent(){
	var $userPhoto = $("#common-header .user-photo");
	$userPhoto.find(".drop-down-box").hide();
	$userPhoto.on({
		mouseenter:function(){
			$(this).find(".drop-down-box").slideDown(200);
			$(this).find("img").animate({
				"top":"5px"
				,"left":"-14px"
				,"width":"60px"
				,"height":"60px"
			},200);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseenter");
			}
		}
		,mouseleave:function(){
			$(this).find(".drop-down-box").slideUp(200,initCommonHeaderUserphotoDropdownBoxEvent);
			$(this).find("img").animate({
				"top":"0px"
				,"left":"0px"
				,"width":"33px"
				,"height":"33px"
			},200);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseleave");
			}
		}
	})
}

function initCommonHeaderUseractivityDropdownBoxEvent(){
	var $userActivity = $("#common-header .user-activity");
	$userActivity.find(".drop-down-box").hide();
	$userActivity.on({
		mouseenter:function(){
			var _this = this;
			$(this).find(".drop-down-box").slideDown(200,function(){
				changeLoadIconEvent($(_this),true);
				loadUseractivity($(_this));
			});
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseenter");
			}
		}
		,mouseleave:function(){
			$(this).find(".drop-down-box").slideUp(200,initCommonHeaderUseractivityDropdownBoxEvent);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseleave");
			}
		}
	})
}

function initCommonHeaderUserstoreDropdownBoxEvent(){
	var $userStore = $("#common-header .user-store");
	$userStore.find(".drop-down-box").hide();
	$userStore.on({
		mouseenter:function(){
			var _this = this;
			$(this).find(".drop-down-box").slideDown(200);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseenter");
			}
		}
		,mouseleave:function(){
			$(this).find(".drop-down-box").slideUp(200,initCommonHeaderUserstoreDropdownBoxEvent);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseleave");
			}
		}
	})
}

function initCommonHeaderUsercreateDropdownBoxEvent(){
	var $userCreate = $("#common-header .user-create");
	$userCreate.find(".drop-down-box").hide();
	$userCreate.on({
		mouseenter:function(){
			var _this = this;
			$(this).find(".drop-down-box").slideDown(200);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseenter");
			}
		}
		,mouseleave:function(){
			$(this).find(".drop-down-box").slideUp(200,initCommonHeaderUsercreateDropdownBoxEvent);
			if($(this).find(".drop-down-box").is(":animated")){
				$(this).off("mouseleave");
			}
		}
	})
}
//var loadInterval;
//function initDropdownBoxLoadIcon($currDropdownBox){
//	$currDropdownBox.find(".load-icon").slideDown(200);
//	var $iconLoad = $currDropdownBox.find(".load-icon>span");
//	if(!$iconLoad.is(":animated")){
//		$iconLoad.animateRotate(360,800,"swing",function(){})
//	}
//	loadInterval = setInterval(function(){
//		if(!$iconLoad.is(":animated")){
//			$iconLoad.animateRotate(360,800,"swing",function(){})
//		}
//	},1000);
//}

var initCommonFooter = function(){
	$.ajaxSettings.async = false;
	$("#common-footer").load(relative_path+"html/common/footerV2.0.html");
	$.ajaxSettings.async = true;
}

function toggleCommonHeader(hiddenHeight){
	var $commonHeader = $("#common-header");
	
	//获得滚动高度，网页可见区域顶部与真正网页顶部之间的差值
	var	scrollTop = $(document).scrollTop();
	
	if(scrollTop - hiddenHeight > 0){
		$commonHeader.show(200).css("position","fixed");
	}else{
		$commonHeader.css("position","static");
	}
}

function checkCommonHeader(){
	var hiddenHeight = $("#common-header").height();
	//滚动条滚动
	$(window).on('scroll',function(){
		toggleCommonHeader(hiddenHeight);
	})
	//窗口放大缩小
	$(window).resize(function(){
		toggleCommonHeader(hiddenHeight);
	})
}

//分页组件的初始化
function initPagePlugin(className){
	$.ajaxSettings.async = false;
	$("."+className).load(relative_path+"support/my/page/page.html");
	$.ajaxSettings.async = true;
	
	$elemInPage = $(page_id+"."+className+" .prev-page")
	pageMain();
}


/************以下方法是虚实现，实际上需要从后台加载数据，应在commonLoad.js中重写以下方法*******************/
/****************************commonLoad.js的加载应在该文件之后*******************************************/

//common-header

function loadCommonHeader(){
	$("#common-header .user-photo>img").attr("src",relative_path+"img/photo.jpg")
}

function loadUseractivity($outerElem){
	$dropdownBox = $outerElem.find(".drop-down-box");
	setTimeout(function(){
		changeLoadIconEvent($outerElem,false);
	},3000)
}
