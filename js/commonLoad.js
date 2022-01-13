function loadCommonHeader(){
	$("#common-header .module li").each(function(){
		var liName = $(this).attr("data-name").toLowerCase();
		switch(liName){
			case "index":
				$(this).children("a").attr("href",relative_path+"index.html");
				break;
			case "article":
				$(this).children("a").attr("href",relative_path+"html/article/articleHome.html");
				break;
			case "video":
				$(this).children("a").attr("href",relative_path+"html/develop/ing.html");
				break;
			case "poll":
				$(this).children("a").attr("href",relative_path+"html/poll/createPoll.html");
				break;
			case "log":
				$(this).children("a").attr("href",relative_path+"html/log/log.html");
				break;
			case "contact":
				$(this).children("a").attr("href",relative_path+"html/contact/contact.html");
				break;
			default: break;
		}
	})
	
	
}

function loadUseractivity($currDropdownBox){
	setTimeout(function(){
		clearInterval(loadInterval);
		$currDropdownBox.find(".load-icon").slideUp(200);
	},3000)
}