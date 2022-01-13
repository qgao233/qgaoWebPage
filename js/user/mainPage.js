var return_uri = "";
function initUserMsg(front_site,relative_path){
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
				$(".user-nick").html(userDetail.userNickname);
				$(".user-desc").html(userDetail.userDescription);
				
				//头像
				user_id = userDetail.userId;
				if(!!userDetail.userImageUri){
					$(".loged-user-photo").prop("src",front_site+"/img/user/get/"+user_id+"?random="+Math.random());
				}
			}else if(data.code==data_protocol.unauthc){
				jumpLogin(relative_path,return_uri);
    		}
		}
	});
	$.ajax({
		type:"get",
		url:front_site+"/user/authc/latest/get",
		async:true,
		headers:headerParams,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				if(!!data.data){
					$(".user-latest").html(data.data);
				}else{
					$(".user-latest").html("第一次登录");
				}
			}else if(data.code==data_protocol.unauthc){
				jumpLogin(relative_path,return_uri);
    		}
		}
		
	});
}

function initArticle(front_site,user_id,state,relative_path){
	var params={};
	params.user_id = user_id;
	if(state){
		params.state=state;
	}
	//获得头部参数
	var headerParams = getHeaderParams();
	
	$.ajax({
		type:"get",
		url:front_site+"/article/user/getArticleList",
		async:false,
		dataType:"json",
		data:params,
		crossDomain: true,
		headers:headerParams,
		error:function(data){
			console.log(data);
		},
		success:function(data){
			
			if(data.code == data_protocol.success){
				var articleList = data.data;
				var length = articleList.length;
				if(length == 0){
					return;
				}
				var $articleOl;
				var userAuthc = "";
				if(state != "发布"){
					userAuthc = "&user_id="+user_id;
				}
				switch(state){
					case "发布":
						$articleOl = $(".article-publish>ol");
						break;
					case "草稿":
						$articleOl = $(".article-sketch>ol");
						break;
					case "垃圾":
						$articleOl = $(".article-receiver>ol");
						break;
					default:
						$articleOl = $(".article-all>ol")
						break;
						
				}
				
				$articleOl.empty();
				
				for(var i = 0;i<length;i++){
					var li = '<li>'+
								'<ul>'+
									'<h1><a href="'+relative_path+'container/article/readArticle.html?article_id='+articleList[i].articleId+userAuthc+'">'+articleList[i].articleTitle+'</a></h1>';
					var type;
					if(articleList[i].articleType==data_protocol.articleOrigin){
						type="原创";
					}else if(articleList[i].articleType==data_protocol.articleReprint){
						type="转载";
					}else{
						type="翻译";
					}
					li = li+		'<li style="margin-left:0px;">'+type+'</li>'+
									'<li>'+articleList[i].articleTime+'</li>'+
									'<li><span class="glyphicon glyphicon-thumbs-up"></span>('+articleList[i].articleGood+')</li>'+
									'<li><span class="glyphicon glyphicon-thumbs-down"></span>('+articleList[i].articleBad+')</li>'+
									'<li><span class="glyphicon glyphicon-comment"></span>('+articleList[i].articleCommentCount+')</li>'+
									'<li><span class="glyphicon glyphicon-eye-open"></span>('+articleList[i].articleClick+')</li>'+
									'<p>'+
										'<span class="glyphicon glyphicon-edit" title="编辑" articleid="'+articleList[i].articleId+'"></span>';
					if(state=="草稿"){
						li = li + '<span class="glyphicon glyphicon-file" title="发布" articleid="'+articleList[i].articleId+'"></span>'+
								'<span class="glyphicon glyphicon-trash" title="删除" articleid="'+articleList[i].articleId+'"></span>';
					}else if(state=="垃圾"){
						li = li +'<span class="glyphicon glyphicon-file" title="发布" articleid="'+articleList[i].articleId+'"></span>'+ 
								'<span class="glyphicon glyphicon-remove" title="彻底删除" articleid="'+articleList[i].articleId+'"></span>';
					}else if(state=="发布"){
						li = li + '<span class="glyphicon glyphicon-list-alt" title="移动到草稿" articleid="'+articleList[i].articleId+'"></span>'+
								'<span class="glyphicon glyphicon-trash" title="移动到回收站" articleid="'+articleList[i].articleId+'"></span>';
					}
					li = li +		'</p>'+
								'</ul>'+
							'</li>';
					$articleOl.append(li);
				}
				
			}else if(data.code==data_protocol.unauthc){
				jumpLogin(relative_path,return_uri);
			}else{
				console.log(data.info);
			}
		}
	});
	unbindArticleEvent();
	initArticleEvent(front_site, user_id, relative_path); //初始化文章管理中的事件
}

function unbindArticleEvent(){
	$("#lanbai-article .glyphicon-edit").unbind()
	$("#lanbai-article .glyphicon-trash").unbind()
	$("#lanbai-article .glyphicon-file").unbind()
	$("#lanbai-article .glyphicon-list-alt").unbind()
	$("#lanbai-article .glyphicon-remove").unbind()
}

function initArticleEvent(front_site,user_id,relative_path){
	$("#lanbai-article .glyphicon-edit").on("click",function(){
		window.location.href=relative_path+"container/article/writeArticle.html?article_id="+$(this).attr("articleid")+"&user_id="+user_id;
	})
	
	var headerParams = getHeaderParams();
	
	$("#lanbai-article .glyphicon-trash").on("click",function(){
		var li = $(this).parent().parent().parent("li");
		$.ajax({
			type:"post",
			url:front_site+"/article/user/"+user_id+"/moveReceiver/"+$(this).attr("articleid"),
			async:false,
			headers:headerParams,
			dataType:"json",
			success:function(data){
				if(data.code==data_protocol.success){
					alert("已放入回收站，若想彻底删除，请前往回收站删除");
					li.remove();
				}else if(data.code==data_protocol.unauthc){
					jumpLogin(relative_path,return_uri);
				}else{
					alert("删除失败，请联系管理员");
				}
			}
		});
	})
	$("#lanbai-article .glyphicon-file").on("click",function(){
		var li = $(this).parent().parent().parent("li");
		$.ajax({
			type:"post",
			url:front_site+"/article/user/"+user_id+"/movePublish/"+$(this).attr("articleid"),
			async:false,
			headers:headerParams,
			dataType:"json",
			success:function(data){
				if(data.code==data_protocol.success){
					alert("已发布");
					li.remove();
				}else if(data.code==data_protocol.unauthc){
					jumpLogin(relative_path,return_uri);
				}else{
					alert("发布失败，请联系管理员");
				}
			}
		});
	})
	$("#lanbai-article .glyphicon-list-alt").on("click",function(){
		var li = $(this).parent().parent().parent("li");
		$.ajax({
			type:"post",
			url:front_site+"/article/user/"+user_id+"/moveSketch/"+$(this).attr("articleid"),
			async:false,
			headers:headerParams,
			dataType:"json",
			success:function(data){
				if(data.code==data_protocol.success){
					alert("已放入草稿箱");
					li.remove();
				}else if(data.code==data_protocol.unauthc){
					jumpLogin(relative_path,return_uri);
				}else{
					alert("移动失败，请联系管理员");
				}
			}
		});
	})
	$("#lanbai-article .glyphicon-remove").on("click",function(){
		var li = $(this).parent().parent().parent("li");
		$.ajax({
			type:"post",
			url:front_site+"/article/user/"+user_id+"/delete/"+$(this).attr("articleid"),
			async:false,
			headers:headerParams,
			dataType:"json",
			success:function(data){
				if(data.code==data_protocol.success){
					alert("已彻底删除");
					li.remove();
				}else if(data.code==data_protocol.unauthc){
					jumpLogin(relative_path,return_uri);
				}else{
					alert("删除失败，请联系管理员");
				}
			}
		});
	})
}





//我的文章内点击不同标签进行相应数据加载
function switchArticleTab($navTab,$navContent,front_site,user_id,relative_path){
	$navTab.on("click",function(){
		var _this=this;
		$navTab.each(function(index,object){
			if(_this==object){
				$(object).addClass("active");
				$navContent.eq(index).addClass("show");
				var type;
				switch(index){
					case 0:type="";break;
					case 1:type="发布";break;
					case 2:type="草稿";break;
					case 3:type="垃圾";break;
					default:break;
				}
				initArticle(front_site,user_id,type,relative_path)
			}else{
				$(object).removeClass("active");
				$navContent.eq(index).removeClass("show");
			}
		})
	})
}



function getUserId(){
	return getRequestParameter().user_id;
}

function adjustIframeHeight(){
	var iframeIds = ["#myPoll"];
	var iframe=new Array();
	var h1=0,h2=0;
	for (i=0; i<iframeIds.length; i++){
		//自动调整iframe高度
		iframe.push($(iframeIds[i])[0]);
		if (iframe[i] && !window.opera){
			if (iframe[i].contentDocument && iframe[i].contentDocument.body.offsetHeight) //如果用户的浏览器是NetScape
				h1 = iframe[i].contentDocument.body.offsetHeight + 20;
			if (iframe[i].Document && iframe[i].Document.body.scrollHeight) //如果用户的浏览器是IE
				h2 = iframe[i].Document.body.scrollHeight;
		}
		iframe[i].height = Math.max(h1,h2);
	}
//			alert(2)
}

//手动加载iframe,（前提：ifram在页面时src为空）
function mainPageSwitchTab(){
	$(".body-left .lanbai-left-nav ul li").on("click",function(){
		var _this = this;
		$(".body-left .lanbai-left-nav ul li").each(function(index,object){
			if(_this == object && index == 0){
				//暂时不做处理
			}else if(_this == object && index == 1){
				$("#myPoll")[0].src="./bodyRight/poll.html";
				$("#myPoll").load(adjustIframeHeight)
			}
			
		})
	})
}

function mainPageMain(){
	relative_path = getRelativePath();
	initCommonHeader();
	initCommonFooter();
	checkCommonHeader();
	
	
	var front_site = data_file.get_data(relative_path);
	var user_id = getRequestParameter().user_id;
	return_uri = getReturnUri(relative_path);

	initUserMsg(front_site, relative_path);
	switchTab($(".lanbai-left-nav li"),$(".body-right>div"));//初始化左边标签导航事件
	mainPageSwitchTab();
	initArticle(front_site,user_id,"",relative_path);//初始化我的文章
	switchArticleTab($(".lanbai-right-nav li"),$(".lanbai-tab-content>div"),front_site,user_id,relative_path);//初始化文章的右边标签导航事件
	
}
