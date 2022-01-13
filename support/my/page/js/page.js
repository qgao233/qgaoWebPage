/*********************************分页***********************************/
//若同一页面有多个分页组件，该分页组件所在的标签不能嵌套使用


var page_id = ".common-page-list"	//也是class选择器
var page_id_name = "common-page-list";
var page_limit = 5;					//每一页的数量
var omit_symbol = "...";


var page_total_counts = 30;			//列表总数量,根据所在标签的属性data-total-counts获得
var page_class_name = "";			//用class来区分是同一页面的哪个“分页”组件,根据所在标签的属性data-class-name获得，如:page_class_name=".comment"，而".comment"是data-class-name里面的值

/*************************暴露给外部使用的***********************/

//需要外部初始化
var $elemInPage;					//$elemInPage必须在调用pageMain()前初始化，只要是.common-page-list内部随便一个元素就行
//需要外部初始化（每一页需要加载的内容）
function loadContentOfPage(currPage){}

function getPagePluginHtml(className,dataTotalCounts){
	return '<div class="'+page_id_name+' '+className+'" data-class-name=".'+className+'" data-total-counts="'+dataTotalCounts+'"></div>';
}

//组件的主方法
function pageMain(){
	initPageNav(1);
}

/******************************************************************/


function clickOmitSymbolWithinPage($curr){
	var prevSiblingPage = parseInt($curr.prev().html());
	var nextSiblingPage = parseInt($curr.next().html());
	var $div = $("<div></div>");
	var tempPageNum;
	for(var i = 1; i <= 3; i++){
		tempPageNum = prevSiblingPage+i;
		if(tempPageNum >= nextSiblingPage) break;
		$div.append("<li>"+tempPageNum+"</li>");
	}
	$div.children("li").on("click",function(){
		currPage = parseInt($(this).html());
		initPageNav(currPage);//重新生成"分页"组件
	})
	
	$curr.prev().after($div.children());
}

function initPageChangeEvent(){
	var currPage;
	var $pageList = $(page_id+page_class_name);
	
	//点击"页码"
	$pageList.find("ul>li").on("click",function(){
		$elemInPage = $(this);
		if($(this).hasClass("active")) return;
		if($(this).html() == omit_symbol){
			clickOmitSymbolWithinPage($(this));
			return;
		}
		currPage = parseInt($(this).html());
		hiddenPrevOrNext(currPage);
		initPageNav(currPage);//重新生成"分页"组件
		
	})
	//点击"上一页"
	$pageList.find(".prev-page").off("click").on("click",function(){
		$elemInPage = $(this);
		currPage = getCurrPage() - 1;
		hiddenPrevOrNext(currPage);
		initPageNav(currPage);
	})
	//点击"下一页"
	$pageList.find(".next-page").off("click").on("click",function(){
		$elemInPage = $(this);
		currPage = getCurrPage() + 1;
		hiddenPrevOrNext(currPage);
		initPageNav(currPage);
	})
}

function initPageNav(currPage){
	var $currPagePlugin = $elemInPage.parents(page_id);
	page_class_name = $currPagePlugin.attr("data-class-name");
	page_total_counts = parseInt($currPagePlugin.attr("data-total-counts"));
	
	
	var maxPage = getMaxPage(page_total_counts);
	var $commentPageUl = $(page_id+page_class_name+" ul");
	$commentPageUl.empty();
	var pageLis = '';
	if(maxPage <= 7){
		for(var i = 1;i<=maxPage;i++){
			pageLis = pageLis + '<li>'+i+'</li>';
		}
	}else{
		//左
		for(var i = 1;i<=3;i++){
			pageLis = pageLis + '<li>'+i+'</li>';
		}
		if(currPage - 1 >= 3){
			pageLis = pageLis + '<li>'+omit_symbol+'</li>'
		}
		
		//中
		if(maxPage - currPage >= 3 && currPage - 1 >= 3){
			pageLis = pageLis + '<li>'+(currPage-1)+'</li>'
								+ '<li>'+currPage+'</li>'
								+ '<li>'+(currPage+1)+'</li>';
		}
		
		//右
		if(maxPage - currPage >= 3){
			pageLis = pageLis + '<li>'+omit_symbol+'</li>'
		}
		for(var i = maxPage - 2;i<=maxPage;i++){
			pageLis = pageLis + '<li>'+i+'</li>';
		}
		
	}
	var $pageLis = $(pageLis);
	$pageLis.each(function(){
		if($(this).html()==currPage.toString()){
			$(this).addClass("active");
		}
	})
	$commentPageUl.append($pageLis);
	initPageChangeEvent();
	loadContentOfPage(currPage);  		//加载某一页的内容,暴露给其他业务重写，方法内部可根据page_class_name的不同来加载不同分页组件中的内容
//	console.log(page_class_name+"#"+page_total_counts)
}



function getMaxPage(counts){
	if(counts % page_limit == 0){
		return Math.floor(counts / page_limit);
	}else{
		return Math.floor(counts / page_limit) + 1;
	}
}


function hiddenPrevOrNext(currPage){
	var $currPagePlugin = $elemInPage.parents(page_id);
	page_class_name = $currPagePlugin.attr("data-class-name");
	page_total_counts = parseInt($currPagePlugin.attr("data-total-counts"));
	
	var $pageList = $(page_id+page_class_name);
	
	
	if(getMaxPage(page_total_counts) == 1){
		$pageList.find(".prev-page").css("display","none");
		$pageList.find(".next-page").css("display","none");
		return;
	}
	
	var $prevPage = $pageList.find(".prev-page");
	var $nextPage = $pageList.find(".next-page");
	
	if(currPage <= 1){
		$prevPage.css("display","none");
		$nextPage.css("display","block");
	}else if(currPage >= getMaxPage(page_total_counts)){
		$prevPage.css("display","block");
		$nextPage.css("display","none");
	}else{
		$prevPage.css("display","block");
		$nextPage.css("display","block");
	}
}


function getCurrPage(){
	var $currPagePlugin = $elemInPage.parents(page_id);
	page_class_name = $currPagePlugin.attr("data-class-name");
	
	var currPage;
	$(page_id+page_class_name+" ul>li").each(function(){
		if($(this).hasClass("active")){
			//获得当前页
			currPage = parseInt($(this).html());
		}
	})
	return currPage;
}


