//初始化文章列表
function searchArticleList(front_site,flag,relative_path){
	//初始化地址
	var site;
	var search_key = getRequestParameter().search_key;
	var cate_id = getRequestParameter().cate_id;
	var params = {};
	if(!!search_key){
		site = front_site+"/article/search";
		params.search_key = search_key;
	}else if(!!cate_id){
		site = front_site+"/article/viewList";
		params.cate_id = cate_id;
	}else{
		alert("没有查询参数，你想干嘛");
		window.opener=null;
		window.open('','_self');
		window.close();
		return;
	}
	var $articleListParent = $(".article-abstract>ul:first-child");
//	判断是否为load-more
	if(!flag){
		var start_count = $articleListParent.children("li").length;
		params.start_count = start_count;
		if(!!search_key){
			site = front_site+"/article/search";
		}else if(!!cate_id){
			site = front_site+"/article/viewList/scroll";
		}
	}
	console.log(params)
	$.ajax({
		type:"get",
		url:site,
		async:true,
		dataType:"json",
		data:params,
		success:function(data){
			var articleList = data.data;
			var length = articleList.length;
			if(length==0){
				$(".load-more").unbind();
				$(".load-more>div").html("已经没有了")
			}
			var $articleListParent = $(".article-abstract>ul:first-child");
			//是否是初始化调用
			if(flag==true){
				$articleListParent.empty();
			}
			for(var i = 0;i<length;i++){
				var li_tag = liTag(articleList[i],front_site,relative_path);
				$articleListParent.append(li_tag);
			}
			
			
		},
		error:function(){
			
		}
	});
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

/*************************************新的*************************************/

function toggleSearchResultCommonHeader(hiddenHeight){
	var $commonHeader = $("#common-header");
	
	//获得滚动高度，网页可见区域顶部与真正网页顶部之间的差值
	var	scrollTop = $(document).scrollTop();
	
	if(scrollTop - hiddenHeight > 0){
		$commonHeader.show(200).css("position","fixed");
		$("#common-header .search").show();
	}else{
		$commonHeader.css("position","static");
		$("#common-header .search").hide();
	}
}

function checkSearchResultCommonHeader(){
	var hiddenHeight = $("#common-header").height();
	//滚动条滚动
	$(window).on('scroll',function(){
		toggleSearchResultCommonHeader(hiddenHeight);
	})
	//窗口放大缩小
	$(window).resize(function(){
		toggleSearchResultCommonHeader(hiddenHeight);
	})
}


function initSearchCondition(){
	$(".condition-navigator").hide();
	changeLoadIconEvent($(".search-condition-choose-row"),true);
	loadSearchCondition();
}
function initSearchArticleList(){
	$(".list-ul").hide();
	changeLoadIconEvent($(".search-result-list-row"),true);
	loadSearchArticleList();
}


function searchResultMain(){
	relative_path = getRelativePath();
	initCommonHeader();
	initCommonFooter();
	checkSearchResultCommonHeader();
	
	
	initSearchCondition();
	initSearchArticleList();
	
	
//	var front_site = data_file.get_data(relative_path);
//	initnav(front_site,relative_path);//初始化导航栏的分类
//	initContainerRight(front_site,relative_path);//初始化container的右边部分
//	searchArticleList(front_site,true,relative_path)//搜索文章列表
//	$(".load-more").on("click",function(){
//		searchArticleList(front_site,false,relative_path);
//	})
}

/*******************************虚方法*****************************/

function loadSearchCondition(){
	setTimeout(function(){
		$(".condition-navigator").show(200);
		changeLoadIconEvent($(".search-condition-choose-row"),false);
	},3000)
}

function loadSearchArticleList(){
	setTimeout(function(){
		//加载分页组件
		var className = "page-article-list";
		$(".search-result-list-row").append(getPagePluginHtml(className,45));
		initPagePlugin(className);
		$(".list-ul").show(200);
		
		changeLoadIconEvent($(".search-result-list-row"),false);
	},3000)
}

//每一页需要加载的内容
function loadContentOfPage(currPage){}

/*******************************重写虚方法*****************************/