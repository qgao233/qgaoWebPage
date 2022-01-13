function getTimeLineLi(newDate){
	return '<li>'
			+	'<div class="line-date">'+newDate+'</div>'
			+	'<ul class="navigator-ul-each">'
			+	'</ul>'
			+'</li>';
}

function deriveTimeLine(){
	var lastDate = "";
	var $lastLi;
	var $all = $("<div></div>");
	$(".right-article-list .list-ul>li").each(function(){
		var newDate = $(this).find(".article-time").html();
		if(!isEmpty(newDate)){
			if(lastDate != newDate){
				$lastLi = $(getTimeLineLi(newDate));
				$all.append($lastLi);
				lastDate = newDate;
			}
			$li = $('<li></li>');
			$li.css("height",$(this).outerHeight());
			$lastLi.find(".navigator-ul-each").append($li);
		}
	})
	if($all.children().length > 0){
		$(".left-time-line .navigator-ul-all").empty();
		$(".left-time-line .navigator-ul-all").append($all.children());
	}
	
}


function initArticleList(){
	$(".left-time-line").hide();
	$(".right-article-list").hide();
	changeLoadIconEvent($(".load-container"),true);
	loadArticleList();
}


function logMain(){
	relative_path = getRelativePath();
	initCommonHeader();
	initCommonFooter();
	checkCommonHeader();
	
	
	initArticleList();
	
}

/*******************************虚方法*****************************/

function loadArticleList(){
	setTimeout(function(){
		//加载分页组件
		var className = "page-article-list";
		$(".right-article-list").append(getPagePluginHtml(className,45));
		initPagePlugin(className);
		$(".right-article-list").show(200,function(){
			//生成时间线
			deriveTimeLine();
			$(".left-time-line").show(200);
		});
		
		changeLoadIconEvent($(".load-container"),false);
	},3000)
}

//每一页需要加载的内容
function loadContentOfPage(currPage){}

/*******************************重写虚方法*****************************/