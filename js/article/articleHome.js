//初始化文章列表
//function initArticleList(front_site,flag){
//	//初始化地址
//	var site = front_site+"/article/viewList";
//	var cate_id = getRequestParameter().cate_id;
//	var params = {};
//	if(cate_id){
//		params.cate_id = cate_id;
//	}
//	var $articleListParent = $(".article-abstract>ul:first-child");
////		判断是否为load-more
//	if(!flag){
//		var start_count = $articleListParent.children("li").length;
//		params.start_count = start_count;
//		site = front_site+"/article/viewList/scroll";
//	}
//	console.log(params)
//	$.ajax({
//		type:"get",
//		url:site,
//		async:true,
//		dataType:"json",
//		data:params,
//		success:function(data){
//			var articleList = data.data;
//			var length = articleList.length;
//			if(length==0){
//				$(".load-more").unbind();
//				$(".load-more>div").html("已经没有了")
//			}
//			var $articleListParent = $(".article-abstract>ul:first-child");
//			//是否是初始化调用
//			if(flag==true){
//				$articleListParent.empty();
//			}
//			for(var i = 0;i<length;i++){
//				var li_tag = liTag(articleList[i]);
//				$articleListParent.append(li_tag);
//			}
//			
//			
//		},
//		error:function(){
//			
//		}
//	});
//}

function initSideNav(front_site,relative_path,idNamePrefix){
	
	$.ajax({
        type:"get",
        async:false,
        url:front_site+"/article/sort",
        success:function(data){
        	if(data.code!=0){
        		console.log("加载侧边导航栏分类时 服务端出错")
        		return;
        	}
        	var sorts = data.data;
        	var sortsLen = sorts.length;
        	//侧边导航
        	var $navUl0 = $(".nav-0");
        	$navUl0.empty();
        	//中间内容列表
        	var $contentLeft = $("#content-left");
        	$contentLeft.empty();
        	
        	var nav_li,pub_item;
        	for(i=0;i<sortsLen;i++){
        		var idName = idNamePrefix + i;
        		var sort = sorts[i];
        		var pubType = sort.sortName;
        		if(i==0){
        			nav_li = '<li nav="#'+idName+'" class="active">'+pubType+'</li>'
        		}else{
        			nav_li = '<li nav="#'+idName+'">'+pubType+'</li>'
        		}
        		//添加进侧边导航
				$navUl0.append(nav_li);
        		
        		var href = "container/article/searchResult.html?cate_id="+sort.sortId;
        		pub_item = pubItem(idName,pubType,relative_path,href);
        		//添加内容列表
        		$contentLeft.append(pub_item);
        	}
        },
        error:function(){
            console.log("加载侧边导航栏分类出错");
        }
    })
	
	var $sideNavLi = $(".nav-0 li");
	//点击左边导航触发事件
	$sideNavLi.click(function(){
		$(window).unbind()
		var _this = this;
		$sideNavLi.each(function(index,object){
			if(_this == object){
				$(object).addClass("active");
				var $target = $($(object).attr("nav"));
				if ($target.length) {
                    var targetOffset = $target.offset().top;
                	$('html').animate({scrollTop: targetOffset},500,function(){
                		initScrollNav($sideNavLi,idNamePrefix,front_site,relative_path);
                	});
                }
			}else{
				$(object).removeClass("active");
			}
		})

	});
	
	var itemLen = $("#content-left>div").length;
	pubItemIsInit = [];
	for(var i = 0;i<itemLen;i++){
		//全局变量，判断各个分类是否已经初始化
		pubItemIsInit[i] = false;
	}
	
}

//初始化滚动条导航
function initScrollNav($sideNavLi,idNamePrefix,front_site,relative_path){
	//右边滚动条触发事件
	//首先获得各个item的位置
	var $itemDivs = $("#content-left>div");
	var itemTopValues = [];
	var itemLen = $itemDivs.length;
	
	
	var order,scrollTop,scrollBottom;

	var $sideNav = $("#side-nav .side-nav");
	$(window).scroll(function(){
		for(var i = 0;i<itemLen;i++){
			itemTopValues[i] = parseInt($itemDivs.eq(i).offset().top);//需要转成整数，后面scrollTop获得的是整数，好比较
		}
		//获得网页可见区域高度
//		console.log(document.documentElement.clientHeight)
		//获得滚动高度，网页可见区域顶部与真正网页顶部之间的差值
		scrollTop = $(document).scrollTop();
		
		//获得滚动区间，二分查找快速获取
		order = binarySearch(scrollTop,itemTopValues);
		$sideNavLi.each(function(index,object){
			if(order == index){
				$(object).addClass("active");
				if(scrollTop > itemTopValues[0]){
					//这里是滚动条滑至上方导航没了，侧边导航就上去，否则就下来
					//animate在运行的时候建立了一个队列,要取消队列，才会马上执行
					$sideNav.animate({top:"15px"},{queue:false,duration:200});
				}else{
					$sideNav.animate({top:"75px"},{queue:false,duration:200});
				}
			}else{
				$(object).removeClass("active");
			}
		})
		
		scrollBottom = scrollTop + document.documentElement.clientHeight;
		order = binarySearch(scrollBottom,itemTopValues);
		for(var i = 0;i<itemLen;i++){
			//如果可见区域且未初始化的，则初始化，否则不进行二次初始化
			if(order >= i && !pubItemIsInit[i]){
				initArticleAbstract(idNamePrefix+i,front_site,relative_path);
			}
		}
	})
	
}

//初始化各个分类下对应的文章摘要列表
function initArticleAbstract(idName,front_site,relative_path){
	var index = parseInt(idName.split("-")[2]);
	pubItemIsInit[index] = true;
	var idProp  = "#"+idName;
	var $itemAbstractUl = $(idProp+" .article-abstract>ul:first-child");
	var cateHref = $(idProp+" .jump-more a").attr("href");
	var cate_id = getUrlParameter(cateHref).cate_id;
	$.ajax({
		type:"get",
		url:front_site+"/article/viewList/index",
		async:true,
		data:"cate_id="+cate_id,
		dataType:"json",
		success:function(data){
			if(data.code == 0){
				$itemAbstractUl.empty();
				var articles = data.data;
				var len = articles.length;
				for(var i = 0;i<len;i++){
					var li_tag = liTag(articles[i],front_site,relative_path);
					$itemAbstractUl.append(li_tag);
				}
			}
		}
	});
}

//刷新事件
function refreshItem(front_site,relative_path){
	$(".refresh").click(function(){
		var idName = $(this).parent().parent("div").eq(0).attr("id");
		initArticleAbstract(idName,front_site,relative_path);
	})
}

function pubItem(idName,pubType,relative_path,href){
	var pub_item = '<div id="'+idName+'">'+
						'<div class="article-iden">'+
							'<span class="title">'+pubType+'</span>'+
							'<span class="refresh">刷新</span>'+
						'</div>'+
						'<div style="clear: left;"></div>'+
						'<div class="article-abstract">'+
							'<ul>'+
							'</ul>'+
							'<ul>'+
								'<li class="jump-more">'+
									'<a href="'+relative_path+href+'"><div>更多...</div></a>'+
								'</li>'+
							'</ul>'+
						'</div>'+
					'</div>';
	return pub_item;
}

function liTag(article,front_site,relative_path){
	var li_tag = '<li>'+
				'<a href="'+relative_path+'container/article/readArticle.html?article_id='+article.articleId+'">'+article.articleTitle+'</a>';
				
	if(article.articleType == 0){
		li_tag = li_tag + '<div class="article-type original">原</div>';
	}else if(article.articleType == 1){
		li_tag = li_tag + '<div class="article-type reprint">转</div>';
	}else{
		li_tag = li_tag + '<div class="article-type translate">译</div>';
	}
	li_tag = li_tag + '<ul>';
	var cate_id_name = article.sortIdName.split(",")[0].split("#");
	var cate_id = cate_id_name[0];
	var cate_name = cate_id_name[1];
	li_tag = li_tag + '<li>文章类型：<a href="'+relative_path+'container/article/searchResult.html?cate_id='+cate_id+'">'+cate_name+'</a></li>'+
					'<li>发布日期：'+article.articleTime+'</li>'+
					'<li>阅读量：'+article.articleClick+'</li>'+
					'<li>发表者：<a href="'+article.userId+'">'+article.nickName+'</a></li>'+
				'</ul>'+
				'<div style="clear: left;"></div>'+
				'<div class="article-remark">';
	if(!!article.articleImg){
		li_tag = li_tag + '<div class="remark-img"><img src="'+front_site+article.articleImg+'"></div>' +
							'<div class="remark-txt">'+article.articleRemark+'...</div>';
	}else{
		li_tag = li_tag + '<div class="remark-txt article-txt-width">'+article.articleRemark+'...</div>';
	}
	li_tag = li_tag + '</div>'+
				'<div style="clear: left;"></div>'+
			'</li>';
			
	return li_tag;
}
/**********************************新的***************************************/


function initTagCloudPlugin(){
	$.ajaxSettings.async = false;
	$(".right-tag-cloud .tag-content").load(relative_path+"support/my/tag-cloud/tag_cloud.html");
	$.ajaxSettings.async = true;
	
	//给标签云中的标签设置颜色，颜色搭配使用配置文件里的配置
	var color_array = data_file.get_data(relative_path,"color_combination");
	$(".right-tag-cloud #tagsList a").each(function(index,object){
		$(this).css("background-color",color_array[index % color_array.length].color_num);
	})
	
	
	//因为设置了relative，脱离了文档流，手动设置高度撑开文档
	$(".right-tag-cloud .tag-content").css("height",$(".right-tag-cloud").width()-40+"");
	//通过设置tagCloud.js里的radius来控制标签云的大小
	radius = $(".right-tag-cloud").width()/2-40;
	tagCloudMain();
}




function initArticleList(){
	$(".left-navigator").hide();
	$(".left-article-list").hide();
	changeLoadIconEvent($(".content-left"),true);
	loadArticleList();
}
function initTagCloud(){
	$(".tag-content").hide();
	changeLoadIconEvent($(".right-tag-cloud"),true);
	loadTagCloud();
}
function initReadRank(){
	$(".read-rank .rank-content").hide();
	changeLoadIconEvent($(".read-rank"),true);
	loadReadRank();
}
function initGoodRank(){
	$(".good-rank .rank-content").hide();
	changeLoadIconEvent($(".good-rank"),true);
	loadGoodRank();
}
function initCommentRank(){
	$(".comment-rank .rank-content").hide();
	changeLoadIconEvent($(".comment-rank"),true);
	loadCommentRank();
}
function initStoreRank(){
	$(".store-rank .rank-content").hide();
	changeLoadIconEvent($(".store-rank"),true);
	loadStoreRank();
}
function initGoodRankByWebmaster(){
	$(".recommend-rank .rank-content").hide();
	changeLoadIconEvent($(".recommend-rank"),true);
	loadGoodRankByWebmaster();
}

function articleHomeMain(){
	relative_path = getRelativePath();
	initCommonHeader();
	initCommonFooter();
	checkCommonHeader();
	
	//content-left
	initArticleList();
	//content-right
	initTagCloud();
	initReadRank();
	initGoodRank();
	initCommentRank();
	initStoreRank();
	initGoodRankByWebmaster();
	
//	var front_site = data_file.get_data(relative_path);
//	var idNamePrefix = "pub-item-";
	
//	initnav(front_site,relative_path);//初始化导航栏的分类
//	loadSideNav(relative_path);//加载侧边导航
//	initSideNav(front_site,relative_path,idNamePrefix);//初始化侧边导航以及中间内容列表
//	var $sideNavLi = $(".nav-0 li");//这一句必须在上一句之后
//	initScrollNav($sideNavLi,idNamePrefix,front_site,relative_path);//初始化滚动条导航
//	initContainerRight(front_site,relative_path);//初始化container的右边部分
//	refreshItem(front_site,relative_path);//刷新按钮
// 		initArticleList(front_site,true)//初始化文章列表
// 		$(".load-more").on("click",function(){
// 			initArticleList(front_site,false);
// 		})
}

/*******************************虚方法*****************************/

function loadArticleList(){
	setTimeout(function(){
		changeLoadIconEvent($(".content-left"),false);
		$(".left-navigator").show(200);
		
		//加载分页组件
		var className = "page-article-list";
		$(".left-article-list").append(getPagePluginHtml(className,45));
		initPagePlugin(className);
		$(".left-article-list").show(200);
	},3000)
}

function loadTagCloud(){
	setTimeout(function(){
		changeLoadIconEvent($(".right-tag-cloud"),false);
		//初始化“标签云”组件
		initTagCloudPlugin();
		$(".tag-content").show(200);
	},3000)
}

function loadReadRank(){
	setTimeout(function(){
		changeLoadIconEvent($(".read-rank"),false);
		$(".read-rank .rank-content").show(200);
	},3000)
}

function loadGoodRank(){
	setTimeout(function(){
		changeLoadIconEvent($(".good-rank"),false);
		$(".good-rank .rank-content").show(200);
	},3000)
}

function loadCommentRank(){
	setTimeout(function(){
		changeLoadIconEvent($(".comment-rank"),false);
		$(".comment-rank .rank-content").show(200);
	},3000)
}

function loadStoreRank(){
	setTimeout(function(){
		changeLoadIconEvent($(".store-rank"),false);
		$(".store-rank .rank-content").show(200);
	},3000)
}

function loadGoodRankByWebmaster(){
	setTimeout(function(){
		changeLoadIconEvent($(".recommend-rank"),false);
		$(".recommend-rank .rank-content").show(200);
	},3000)
}

//每一页需要加载的内容
function loadContentOfPage(currPage){}

/*******************************重写虚方法**************************/
