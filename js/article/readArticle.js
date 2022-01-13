/*---------------------------------------------------以下是笔记模态框-----------------------------------------*/
function initNoteModal(article_id){
	$(".note-text").html(sessionStorage.getItem("note-"+article_id));
	$(".note-modal-spread").on("click",function(){
		$("#note-modal").animate({right:"0"},500);
		$(this).fadeOut(500);
	})
	$(".note-modal-collapse").on("click",function(){
		$("#note-modal").animate({right:"-25%"},500);
		$(".note-modal-spread").fadeIn(500);
	})
	$(".note-save").on("click",function(){
		var noteTxt = $(".note-text").html();
		sessionStorage.setItem("note-"+article_id,noteTxt);
		$(this).html("成功").css("color","hotpink");
		var _this = this;
		setTimeout(function(){
			$(_this).html("保存").css("color","#27f");
		},2000);
	})
}

/*---------------------------------------------------以下是回复-------------------------------------------------*/

function initReplyClick(){
	$(".reply-click").on("click",function(){
		var $target = $(this).parent().siblings(".title-left").children("li").eq(1);
		var targetId = $target.attr("uid");
		var targetNick = $target.children("a").html();
		var replyId = $(this).parent().parent().parent().attr("rid");
		var $replyPerson = $(".reply-person span:first-child");
		if(!!$replyPerson.length){
			$replyPerson.empty().html(targetNick).attr("uid",targetId).attr("rid",replyId);
		}else{
			var replyPersonDiv = '<div class="reply-person">回复:@<span></span><span>取消</span></div>';
			$(".reply-input").prepend(replyPersonDiv);
			$replyPerson = $(".reply-person span:first-child");
			$replyPerson.empty().html(targetNick).attr("uid",targetId).attr("rid",replyId);
			$(".reply-person span:last-child").on("click",function(){
				$(this).parent(".reply-person").hide(500).remove();
			})
		}
	})
	$(".reply-person span:last-child").on("click",function(){
		$(this).parent(".reply-person").hide(500).remove();
	})
}

/**点击回复提交时*/
function initReplyCommit(front_site,userObject){
	$(".reply-submit").on("click",function(){
		var targetId,targetNick,replyType,commentId,replyContent,replyId;
		commentId = $(this).parents(".comment-item").attr("cid");
		var _this = this;
		if(!!$(".reply-person span:first-child").length){
			//被回复者为某回复
			replyType = data_protocol.reply;
			var $span = $(this).siblings(".reply-person").children("span").eq(0);
			targetId = $span.attr("uid");
			targetNick = $span.html();
			replyId = $span.attr("rid");
		}else{
			//被回复者为当前评论
			replyType = data_protocol.comment;
			var $commentUser = $(this).parents(".comment-item").find(".comment-item-title").children(".title-left").children("li").eq(1);
			targetId = $commentUser.attr("uid");
			targetNick = $commentUser.children("a").html();
			replyId = commentId;
		}

		replyContent = $(this).siblings(".textarea").html();
		console.log(targetId+"###"+targetNick+"###"+replyType+"###"+replyId+"###"+commentId+"###"+replyContent);
		
		var $tip = $(this).siblings(".reply-submit-tip");
		var params = {
			replyType:replyType,
			replyId:replyId,
			replyContent:replyContent,
			cId:commentId,
			fromUid:userObject.user_id,
			fromUnick:userObject.user_nick,
			toUid:targetId,
			toUnick:targetNick
		}
		var headerParams = getHeaderParams();
		var _this = this;
		$.ajax({
			type:"post",
			url:front_site+"/reply/user/add",
			async:true,
			data:params,
			headers:headerParams,
			dataType:"json",
			success:function(data){
				if(data.code == data_protocol.success){
					params.rId = data.data;
					params.replyTime = new Date().format("yyyy-MM-dd hh:mm:ss");
					var $replyItem = $(getReplyItem(front_site,params));
					$replyItem.css("display","none");
					$(_this).parent().parent().siblings(".reply-items").css("display","block").children("ul").append($replyItem);
					$replyItem.show(200);
					initReplyClick();
					
					var $replyClick = $(_this).parents(".comment-item").find(".comment-reply-click");
					var $span = $replyClick.children("span");
					if($span.length==0){
						$($replyClick).html("回复(1)");
					}else{
						var count = parseInt($span.html())+1;
						$span.html(count);
					}
					$tip.html("回复成功").css({"color":"limegreen","display":"inline-block"});
					$(".reply-input .textarea").empty();
					setTimeout(function(){
						$tip.css("display","none");
					},2000);
				}else if(data.code == data_protocol.unauthc){
					alert("请登录后再回复")
				}else{
					console.log(data.info);
					$tip.html("回复失败，请联系管理员进行处理").css({"color":"red","display":"inline-block"});
				}
			}
		});
		
		
	})
}

function getReplyItem(front_site,params){
	var replyItem = '<li class="reply-item" rid="'+params.rId+'">'+
						'<div>'+
							'<ul class="title-left">'+
								'<li><img src="'+front_site+'/img/user/get/'+params.fromUid+'"></li>'+
								'<li uid="'+params.fromUid+'"><a>'+params.fromUnick+'</a></li>'+
								'<li>'+params.replyTime+'</li>'+
							'</ul>'+
							'<ul class="title-right">'+
								'<li>举报</li>'+
								'<li class="reply-click">回复</li>'+
							'</ul>'+
						'</div>'+
						'<div style="clear: both;"></div>'+
						'<div class="comment-reply-content">';
	if(params.replyType==data_protocol.comment){
		replyItem = replyItem + params.replyContent;
	}else{
		replyItem = replyItem + '<span>回复:@</span>'+
								'<span><a uid="'+params.toUid+'">'+params.toUnick+'</a>:</span>'+
								'<span>'+params.replyContent+'</span>';
	}
		replyItem = replyItem + '</div>'+
					'</li>';
	return replyItem;
}

//评论条目右上角的操作
function initCommentOperate(front_site,userObject){
	initCommentReplyClick(front_site,userObject);
	initCommentGoodOrBadClick(front_site,userObject);
}
//评论右上角的赞和踩
function initCommentGoodOrBadClick(front_site,userObject){
	$(".comment-good").on("click",function(){
		var headerParams = getHeaderParams();
		var _this = this;
//		console.log(getCommentId(this))
		$.ajax({
			type:"post",
			url:front_site+"/comment/user/good",
			async:true,
			data:"c_id="+getCommentId(this),
			headers:headerParams,
			success:function(data){
				if(data.code==data_protocol.success){
					var $span = $(_this).children("span");
					if($span.length==0){
						$(_this).html("赞(1)");
					}else{
						var count = parseInt($span.html())+1;
						$span.html(count);
					}
				}else if(data.code==data_protocol.unauthc){
					alert("没登录也想点赞？哼！")
				}else{
					alert(data.info);
				}
			}
		});
	})
	$(".comment-bad").on("click",function(){
		var headerParams = getHeaderParams();
		var _this = this;
		$.ajax({
			type:"post",
			url:front_site+"/comment/user/bad",
			async:true,
			data:"c_id="+getCommentId(this),
			headers:headerParams,
			success:function(data){
				if(data.code==data_protocol.success){
					var $span = $(_this).children("span");
					if($span.length==0){
						$(_this).html("踩(1)");
					}else{
						var count = parseInt($span.html())+1;
						$span.html(count);
					}
				}else if(data.code==data_protocol.unauthc){
					alert("没登录也想踩人家？想得美！")
				}else{
					alert(data.info);
				}
			}
		});
	})
}

function getCommentId(_this){
	return $(_this).parents(".comment-item").attr("cid");
}

//评论右上角的回复
function initCommentReplyClick(front_site,userObject){
	$(".comment-reply-click").on("click",function(){
		var $replyDiv = $(this).parent().parent().siblings(".comment-reply");
		if($replyDiv.is(":visible")){
			$replyDiv.hide(500);
		}else{
			if(!$replyDiv.children(".reply-items").length){
				var $replyItems = $(getReplyItems());
				$.ajax({
					type:"get",
					url:front_site+"/reply/get/1",
					async:false,
					data:"comment_id="+getCommentId(this),
					dataType:"json",
					success:function(data){
						if(data.code == data_protocol.success){
							var replys = data.data;
							var replysLen = replys.length;
							var $replyUl = $replyItems.children("ul");
							//如果该评论下有回复
							if(replysLen > 0){
								$replyItems.css("display","block");
							}
							for(var i = 0 ;i<replysLen;i++){
								var replyItem = getReplyItem(front_site,replys[i]);
								$replyUl.append(replyItem);
							}
						}else{
							console.log(data.info);
						}
					}
				});
				$replyDiv.append($replyItems);
				initReplyClick();//新查出来的回复，重新初始化点击回复事件
			}
			$replyDiv.show(500);
			initReplyCommit(front_site,userObject)
		}
	})
}

function getReplyItems(){
	var replyItems = '<div class="reply-items" style="display:none;">'+
						'<ul>'+
						'</ul>'+
						'<div style="clear: both;"></div>'+
						'<div class="lanbai-list-page reply-list-page">'+
							'<div>'+
								'<div class="prev-page" style="display: none;">上一页</div>'+
								'<ul>'+
									'<li class="active">1</li>'+
								'</ul>'+
								'<div class="next-page" style="display: none;">下一页</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div>'+
						'<div class="lanbai-input-frame reply-input">'+
							'<div class="lanbai-input textarea" placeholder="请输入回复内容..." contenteditable="true"></div>'+
							'<div class="lanbai-button reply-submit">回复</div>'+
							'<div class="reply-submit-tip" style="display: none;"></div>'+
						'</div>'+
					'</div>';
	return replyItems;
}

/*-----------------------------------------------------以下是评论------------------------------------------------*/

/**
 * 评论总条数
 */
var comment_total;

function initCommentItem(front_site,relative_path,userObject){
	var page = getCurrPage();
	if(!page){
		return;
	}
	$.ajax({
		type:"get",
		url:front_site+"/comment/get/"+page,
		async:true,
		data:"article_id="+userObject.article_id,
		dataType:"json",
		success:function(data){
			if(data.code == data_protocol.success){
				var comments = data.data;
				
				var $commentListUl = $(".comment-list>ul");
				$commentListUl.empty();
				var currPage = getCurrPage();
				var topFloor = comment_total - (currPage - 1) * data_protocol.pageLimit;
				var bottomFloor;
				if(topFloor <= 5){
					bottomFloor = 0;
				}else{
					bottomFloor = topFloor - 5;
				}
				var floor = [];
				for(var i = topFloor;i>bottomFloor;i--){
					floor.push(i);
				}
				var commentsLen = comments.length;
				for(var i = 0;i<commentsLen;i++){
					var commentItemMsg = {
						user_id:comments[i].userId,
						user_nick:comments[i].userNick,
						comment_id:comments[i].cId,
						comment_time:comments[i].cTime,
						comment_total:floor[i],
						comment_content:comments[i].cContent,
						reply_count:comments[i].cReplyCount,
						good_count:comments[i].cGoodCount,
						bad_count:comments[i].cBadCount
					}
					var newCommentItem = getCommentItem(front_site,relative_path,commentItemMsg);
					$commentListUl.append(newCommentItem);
				}
				initCommentOperate(front_site,userObject);////评论右上角的操作
				
			}else{
				console.log(data.info);
			}
		}
	});
}


function initCommentPage(front_site,relative_path,userObject){
	$.ajax({
		type:"get",
		url:front_site+"/comment/count/get",
		async:false,
		data:"article_id="+userObject.article_id,
		dataType:"json",
		success:function(data){
			if(data.code == data_protocol.success){
				$(".comment-list").css("display","none");
				$(".comment-list-page").css("display","none");
				$(".no-comment").css("display","block");
				comment_total = data.data;
				if(comment_total != 0){
					$(".comment-list").css("display","block");
					$(".comment-list-page").css("display","block");
					$(".no-comment").css("display","none");
					var pageTotal = getMaxPage(comment_total);
					getPageNav(pageTotal,1,front_site,relative_path,userObject);
				}
			}
		}
	});
}




function initCommitComment(front_site,relative_path,userObject){
	$(".comment-input .comment-submit").on("click",function(){
		var $tip = $(".comment-submit-tip");
		
		var commentContent = $(".comment-input .textarea").html();
		if(!commentContent){
			alert("评论内容不能为空");
			return;
		}
		userObject.comment_content = commentContent;
		var params = userObject;
		params.client_ip = returnCitySN.cip;
		var headerParams = getHeaderParams();
		$.ajax({
			type:"post",
			url:front_site+"/comment/user/add",
			async:true,
			data:params,
			headers:headerParams,
			dataType:"json",
			success:function(data){
				if(data.code == data_protocol.success){
					
					if(!comment_total){
						comment_total = 1;
						initCommentPage(front_site,relative_path,userObject);
					}else{
						comment_total = comment_total+1;
					}
					
					userObject.comment_total = comment_total;
					userObject.comment_time = new Date().format('yyyy-MM-dd hh:mm:ss');
					userObject.comment_id = data.data;
					
					var newCommentItem = getCommentItem(front_site,relative_path,userObject);
					if(getCurrPage() == 1){
						var $commentListUl = $(".comment-list>ul");
						$commentListUl.prepend(newCommentItem);
						var commentItemLen = $(".comment-item").length;
						if(commentItemLen > 5){
							$(".comment-list>ul>li:last-child").remove();
						}
					}
					initPageChangeLiClick(front_site,relative_path,userObject);
					initCommentOperate(front_site,userObject);////评论右上角的操作
					
					$tip.html("发表成功").css({"color":"limegreen","display":"inline-block"});
					$(".comment-input .textarea").empty();
					setTimeout(function(){
						$tip.css("display","none");
					},2000);
				}else if(data.code == data_protocol.unauthc){
					alert("请登录后再评论")
				}else{
					console.log(data.info);
					$tip.html("发表失败，请联系管理员进行处理").css({"color":"red","display":"inline-block"});
				}
			}
		});
		
		
		
	})
}

function getCommentItem(front_site,relative_path,userObject){
	var comment_item = '<li class="comment-item" cid="'+userObject.comment_id+'">'+
							'<div>'+
								'<div class="comment-item-title">'+
									'<ul class="title-left">'+
										'<li><img src="'+front_site+"/img/user/get/"+userObject.user_id+'"></li>'+
										'<li uid="'+userObject.user_id+'"><a href="#">'+userObject.user_nick+'</a></li>'+
										'<li>'+userObject.comment_time+'</li>'+
										'<li>第'+userObject.comment_total+'楼</li>'+
									'</ul>'+
									'<ul class="title-right">'+
										'<li>举报</li>';
	if(!!userObject.reply_count){
		comment_item = comment_item + '<li class="comment-reply-click">回复(<span>'+userObject.reply_count+'</span>)</li>';
	}else{
		comment_item = comment_item + '<li class="comment-reply-click">回复</li>';
	}
	if(!!userObject.good_count){
		comment_item = comment_item + '<li class="comment-good">赞(<span>'+userObject.good_count+'</span>)</li>';
	}else{
		comment_item = comment_item + '<li class="comment-good">赞</li>';
	}
	if(!!userObject.bad_count){
		comment_item = comment_item + '<li class="comment-bad">踩(<span>'+userObject.bad_count+'</span>)</li>';
	}else{
		comment_item = comment_item + '<li class="comment-bad">踩</li>';
	}
		comment_item = comment_item + '</ul>'+
								'</div>'+
								'<div style="clear: both;"></div>'+
								'<div class="comment-item-content">'+
									userObject.comment_content+
								'</div>'+
								'<div class="comment-reply" style="display: none;">'+
									
								'</div>'+
							'</div>'+
						'</li>';
	return comment_item;
}


/*----------------------------------------------以下是文章内容---------------------------------------------------*/

//function initArticleContent(relative_path){
//	var article_id = getRequestParameter().article_id;
//	if(!article_id){
//		alert("没有文章id参数，将跳转至首页")
//		window.location.href = relative_path+"article/articleHome.html";
//	}
//	var front_site = data_file.get_data(relative_path);
//	
//	
//	var user_id = getRequestParameter().user_id;
//	if(!!user_id){
//		var params = "userId="+user_id;
//		var headerParams = getHeaderParams();
//		$.ajax({
//			type:"get",
//			url:front_site+"/article/user/get/"+article_id,
//			async:true,
//			dataType:"json",
//			data:params,
//			headers:headerParams,
//			success:function(data){
//				if(data.code == data_protocol.success){
//					loadArticleContent(data,front_site);
//				}else{
//					alert(data.info);
//					window.location.href="../index.html";
//				}
//			}
//		});
//	}else{
//		$.ajax({
//			type:"get",
//			url:front_site+"/article/get/"+article_id,
//			async:true,
//			dataType:"json",
//			success:function(data){
//				if(data.code == data_protocol.success){
//					loadArticleContent(data,front_site);
//				}else{
//					alert(data.info);
//					window.location.href="../index.html";
//				}
//			}
//		});
//	}
//	
//	
//	return article_id;
//}

//function loadArticleContent(data,front_site){
//	//清空数据用来加载后台数据
//	var $read_article_title = $("#read-article");
//	var $article_content = $(".article-content");
//	$read_article_title.empty();
//	$article_content.empty();
//	//开始处理
//	var result = data.data;
//	var title = '<h1>'+result.articleTitle+'</h1>';
//	if(result.articleType == data_protocol.articleOrigin){
//		title = title + '<div class="original">原</div>';
//	}else if(result.articleType == data_protocol.articleReprint){
//		title = title + '<div class="reprint">转</div>'
//	}else{
//		title = title + '<div class="translate">译</div>'
//	}
//	title = title +	'<ul>'+
//						'<li>创建时间：'+result.articleTime+'</li>'+
//						'<li>标签：'+result.articleTag+'</li>'+
//						'<li>阅读次数：'+result.articleClick+'</li>'+
//					'</ul>';
//	$read_article_title.append(title);
//	var content = result.articleContent;
//	$article_content.append(content);
//	$(".span-good>div").html(result.articleGood);
//	$(".span-bad>div").html(result.articleBad);
//	var user_id = result.userId;
//	if(!!user_id){
//		$(".user-visit-msg").css("display","block");
//		$(".user-visit-msg img").prop("src",front_site+"/img/user/get/"+user_id+"?random="+Math.random());
//		$.ajax({
//			type:"get",
//			url:front_site+"/user/get/"+user_id,
//			async:true,
//			dataType:"json",
//			success:function(data){
//				if(data.code==data_protocol.success){
//					var $aTag = $(".user-visit-nick a");
//					$aTag.prop("href",data.data.userId);
//					$aTag.html(data.data.userNickname);
//				}else{
//					console.log(data.info)
//				}
//			}
//		});
//		$.ajax({
//			type:"get",
//			url:front_site+"/article/counts/get/"+user_id,
//			async:true,
//			dataType:"json",
//			success:function(data){
//				if(data.code==data_protocol.success){
//					$(".article-count").html(data.data);
//				}else{
//					console.log(data.info)
//				}
//			}
//		});
//	}
//}

function initGoodBad(front_site,article_id){
	$(".span-good").on("click",function(){
		var headerParams = getHeaderParams();
		$.ajax({
			type:"post",
			url:front_site+"/article/authc/goodOrBad",
			async:true,
			dataType:"json",
			headers:headerParams,
			data:"type=good&article_id="+article_id,
			success:function(data){
				if(data.code==data_protocol.success){
					$(".span-good>div").html(data.data.good);
					$(".span-bad>div").html(data.data.bad);
				}else if(data.code==data_protocol.unauthc){
					alert("请登录");
				}else{
					alert(data.info);
				}
			},
			error:function(data){
				console.log(data);
			}
		});
	})
	$(".span-bad").on("click",function(){
		var headerParams = getHeaderParams();
		$.ajax({
			type:"post",
			url:front_site+"/article/authc/goodOrBad",
			async:true,
			dataType:"json",
			headers:headerParams,
			data:"type=bad&article_id="+article_id,
			success:function(data){
				if(data.code==data_protocol.success){
					$(".span-good>div").html(data.data.good);
					$(".span-bad>div").html(data.data.bad);
				}else if(data.code==data_protocol.unauthc){
					alert("请登录");
				}else{
					alert(data.info);
				}
			},
			error:function(data){
				console.log(data);
			}
		});
	})
}

/*******************************新的*************************************/


//把“赞”下面的“踩”显示出来
function initArticleBadShowEvent(){
	$(".bad").hide();
	var countDownWatch = 0;
	$(".article-good").on({
		mouseenter:function(){
			countDownWatch = setTimeout(function(){
				$(".bad").slideDown(200);
			},1000);
		},
		mouseleave:function(){
			clearTimeout(countDownWatch);
		}
	})
	$(".article-operate").on("mouseleave",function(){
		$(".bad").slideUp(200);
	})
}

function changeIconOrFill($this){
	var classStr = $this.attr("class");
	var classArray = classStr.split(" ");
	for(var i = 0; i < classArray.length; i++){
		if(classArray[i].indexOf("icon-") != -1){
			var index = classArray[i].indexOf("-fill");
			$this.removeClass(classArray[i]);
			if(index != -1){
				$this.addClass(classArray[i].substring(0,index));
			}else{
				$this.addClass(classArray[i]+"-fill");
			}
		}
	}
	
}

function articleIconEventCallback(object){
	var _this = object;
	$(_this).queue("chain",function(next){
		if(!$(_this).is(".animated")){
			$(_this).off("click");
			$(_this).animate({
				"bottom": "10px"
				,"font-size":"50px"
			}
			,{
				easing:"linear"
				,duration:200
				,done:changeIconOrFill($(_this))
			})
		}
		
		$(_this).dequeue("chain");
	}).queue("chain",function(next){
		if(!$(_this).is(".animated")){
			$(_this).animate({
				"bottom": "0px"
				,"font-size":"30px"
			}
			,{
				easing:"linear"
				,duration:200
				,done:function(){
					$(_this).on("click",function(){
						articleIconEventCallback(this);
					})
				}
			})
		}
	})
	$(_this).dequeue("chain");
}

function initArticleOperateIconEvent(){
	initArticleBadShowEvent();
	$(".article-icon").on("click",function(){
		articleIconEventCallback(this);
	})
}

function initCommentOperateIconEvent(){
	$(".comment-reply-back").hide();
	$(".comment-reply").hide();
	$(".comment-reply-click").on("click",function(){
		$(this).hide();
		$(this).siblings(".comment-reply-back").show();
		
		$thisCommentReply = $(this).parents(".comment-item").find(".comment-reply");
		$thisCommentReply.show(200);
		$thisCommentReply.find(".reply-items").hide();
		changeLoadIconEvent($thisCommentReply,true);
		loadArticleCommentReply($thisCommentReply);
	})
	$(".comment-reply-back").on("click",function(){
		$(this).hide();
		$(this).siblings(".comment-reply-click").show();
		
		$thisCommentReply = $(this).parents(".comment-item").find(".comment-reply");
		$thisCommentReply.hide(200);
	})
}

function initArticleContent(){
	$(".article-show").hide();
	changeLoadIconEvent($(".content-left"),true);
	loadArticleContent();
}

function initArticleComment(){
	$(".comment-list").hide();
	changeLoadIconEvent($(".comment-show"),true);
	loadArticleComment();
}

function initArticleUserInfo(){
	$(".article-user").hide();
	changeLoadIconEvent($(".content-right"),true);
	loadArticleUserInfo();
}
function initArticleUserLocalCategory(){
	$(".category-content").hide();
	changeLoadIconEvent($(".article-local-category"),true);
	loadArticleUserLocalCategory();
}
function initArticleUserNewestArticle(){
	$(".read-rank .rank-content").hide();
	changeLoadIconEvent($(".read-rank"),true);
	loadArticleUserNewestArticle();
}
function initArticleUserNewestComment(){
	$(".comment-rank .rank-content").hide();
	changeLoadIconEvent($(".comment-rank"),true);
	loadArticleUserNewestComment();
}

function readArticleMain(){
	relative_path = getRelativePath();
	initCommonHeader();
	initCommonFooter();
	checkCommonHeader();
	
	//content-left
	initArticleContent();			//初始化文章内容
	initArticleComment();			//初始化文章评论
	//content-right
	initArticleUserInfo();			//初始化文章用户信息
	initArticleUserLocalCategory();	//初始化文章用户的个人分类专栏
	initArticleUserNewestArticle();	//初始化文章用户的最新文章
	initArticleUserNewestComment();	//初始化文章用户的最新评论


//	
//	//comment
//	initCommitComment(front_site,relative_path,userObject);//初始化提交评论
//	initCommentPage(front_site,relative_path,userObject);//初始化评论分页导航
//	initCommentItem(front_site,relative_path,userObject);//初始化评论条目
//	initPageChange(front_site,relative_path,userObject);//初始化页码改变事件
//	
//	//reply
//	initCommentReplyClick(front_site,userObject);//评论右上角的回复点击
//	initReplyCommit(front_site,userObject);//回复下，提交回复
//	initReplyClick();//回复中的右上角回复点击
//	
//	initNoteModal(article_id)
}





/********************************从后台加载数据(虚方法，需要重写)*********************************/

//每一页需要加载的内容（分页组件page.js提供的方法，用来加载每一页的内容）
function loadContentOfPage(currPage){}



function loadArticleContent(){
	setTimeout(function(){
		changeLoadIconEvent($(".content-left"),false);
		$(".article-show").show(200);
		//初始化对文章进行操作（赞，踩，收藏，打赏）的动画事件
		initArticleOperateIconEvent();
	},3000)
}

function loadArticleComment(){
	setTimeout(function(){
		$(".no-comment").hide();
		changeLoadIconEvent($(".comment-show"),false);
		$(".comment-list").show(200);
		//加载分页组件
		var className = "page-comment-list";
		$(".comment-list").after(getPagePluginHtml(className,45));
		initPagePlugin(className);
		//初始化评论操作事件
		initCommentOperateIconEvent();
	},3000)
}

function loadArticleCommentReply($commentReply){
	setTimeout(function(){
		changeLoadIconEvent($commentReply,false);
		$commentReply.find(".reply-items").show(200);
		//加载分页组件
		var className = "page-reply-list-"+$commentReply.attr("data-load-id");
		$commentReply.find(".reply-items").append(getPagePluginHtml(className,26));
		initPagePlugin(className);
	},3000)
}

function loadArticleUserInfo(){
	setTimeout(function(){
		changeLoadIconEvent($(".content-right"),false);
		$(".article-user").show(200);
	},3000)
}

function loadArticleUserLocalCategory(){
	setTimeout(function(){
		changeLoadIconEvent($(".article-local-category"),false);
		$(".category-content").show(200);
	},3000)
}

function loadArticleUserNewestArticle(){
	setTimeout(function(){
		changeLoadIconEvent($(".read-rank"),false);
		$(".read-rank .rank-content").show(200);
	},3000)
}

function loadArticleUserNewestComment(){
	setTimeout(function(){
		changeLoadIconEvent($(".comment-rank"),false);
		$(".comment-rank .rank-content").show(200);
	},3000)
}

/********************************重写上面的所有虚方法*********************************/