

//添加个人分类,点击新建时
function prvTypeAddConfirm(){
	$(".prv-type-input .new-click").on("click",function(){
		var pname = $(this).prev().val();
		if(!pname){
			alert("个人分类名称不能为空");
			return;
		}
		var headerParams = getHeaderParams();
		$.ajax({
			type:"post",
			url:front_site+"/article/privateSort/add",
			async:true,
			data:"p_name="+pname,
			headers:headerParams,
			success:function(data){
				if(data.code==data_protocol.success){
					var prvCate = {privateSortId:data.data,privateSortName:pname,articleCount:0};
					var $li = $(getPrvTypeListLi(prvCate));
					$li.css("display","none")
					var $prvCateList = $(".prv-type-list ol");
					$prvCateList.append($li);
					$li.show(500);
					prvTypeItemEvent();
					
					var label = getPrvTypeLabel(prvCate);
					$(".prv-category").append(label);
					
					$(".prv-type-input .new-input").css("display","none");
	    			$(".prv-type-input .new-prv").fadeIn(500);
				}else if(data.code==data_protocol.unauthc){
					var return_uri = getReturnUri(relative_path);
					jumpLogin(relative_path,return_uri);
				}else{
					console.log(data.info);
				}
			}
		});
	})
}

//修改个人分类,点击确定时
function prvTypeModConfirm(){
	//点击确定
	$(".prv-mod-input .confirm").on("click",function(){
		var _this = this;
		var pid = $(this).parent().siblings(".prv-name").attr("pid");
		var pname = $(this).prev().html();
		if(!pname){
			alert("个人分类名称不能为空");
			return;
		}
		var headerParams = getHeaderParams();
		console.log(front_site)
		$.ajax({
			type:"post",
			url:front_site+"/article/privateSort/update",
			async:true,
			dataType:"json",
			data:"p_id="+pid+"&p_name="+pname,
			headers:headerParams,
			success:function(data){
				if(data.code==data_protocol.success){
					$(_this).parent().siblings(".prv-name").html(pname);
					$(_this).parent().css("display","none");
					$(_this).parent().siblings(".prv-name").fadeIn(500);
					$(_this).parent().siblings(".prv-operate").fadeIn(500);
				}else if(data.code==data_protocol.unauthc){
					var return_uri = getReturnUri(relative_path);
					jumpLogin(relative_path,return_uri);
				}else{
					console.log(data.info);
				}
			}
		});
	})
}

function prvTypeAddClick(){
	//点击新建个人分类事件
	$(".prv-type-input .new-prv").on("click",function(event){
		$(this).css("display","none");
		$(".prv-type-input .new-input").fadeIn(500);
	})
	//全局点击事件，只要是除了.new-prv和.new-input的，其他地方的点击都要让.new-input->display:none
	//如果是.new-prv就不display:none
	$(document).on("click",function(event){
		if(!($(event.target).attr("class")=="new-prv")){
			$(".prv-type-input .new-input").css("display","none");
	    	$(".prv-type-input .new-prv").fadeIn(500);
		}
	});
	//阻止事件的冒泡，也就相当于没有触发全局点击事件，也就实现了点击.new-input，而其本身不会消失
	$(".prv-type-input .new-input").on("click",function(event){
		event.stopPropagation();
	})
}

function prvTypeItemEvent(){
	prvTypeEditClick();
	prvTypeDelClick();
}
function prvTypeDelClick(){
	$(".prv-operate .del").on("click",function(){
		var _this = this;
		var pid = $(this).parent().siblings(".prv-name").attr("pid");
		if(!pid){
			alert("莫明其妙的错误");
			return;
		}
		var headerParams = getHeaderParams();
		$.ajax({
			type:"post",
			url:front_site+"/article/privateSort/delete",
			async:true,
			data:"p_id="+pid,
			headers:headerParams,
			success:function(data){
				if(data.code==data_protocol.success){
					$(".prv-category>label").each(function(index,object){
						if($(object).children().val() == pid){
							$(object).remove();
						}
					})
					$(_this).parent().parent().hide(500);
					$(_this).parent().parent().remove();
				}else if(data.code==data_protocol.unauthc){
					var return_uri = getReturnUri(relative_path);
					jumpLogin(relative_path,return_uri);
				}else if (data.code==2) {
					alert("不能删除拥有文章的分类");
				}else{
					console.log(data.info);
				}
			}
		});
	})
}
//个人分类条目编辑
function prvTypeEditClick(){
	$(".prv-operate .edit").on("click",function(){
		$(this).parent().css("display","none");
		var $thisLi = $(this).parents("li");
		$thisLi.children(".prv-name").css("display","none");
		var prvName = $thisLi.children(".prv-name").html();
		var $prvMod = $thisLi.children(".prv-mod-input");
		$prvMod.fadeIn(500);
		$prvMod.children().eq(0).html(prvName);
	})
	$(".prv-mod-input .cancel").on("click",function(){
		$(this).parent().css("display","none");
		$(this).parent().siblings(".prv-name").fadeIn(500);
		$(this).parent().siblings(".prv-operate").fadeIn(500);
	})
	prvTypeModConfirm()
}

//初始化私有文章分类
function initPrivateCategory(front_site,user_id,relative_path){
    var return_uri = getReturnUri(relative_path);
	
	var headerParams = getHeaderParams();
	
	$.ajax({
		type:"get",
		url:front_site+"/article/privateSort/"+user_id,
		async:true,
		headers:headerParams,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				var prvCates = data.data;
				var length = prvCates.length;
				var $prvCate = $(".prv-category");
				var $prvCateList = $(".prv-type-list ol");
				$prvCate.empty();
				$prvCateList.empty();
				for(var i = 0 ;i < length;i++){
					var label = getPrvTypeLabel(prvCates[i]);
		    		$prvCate.append(label);
		    		var li = getPrvTypeListLi(prvCates[i]);
		    		$prvCateList.append(li);
				}
				prvTypeItemEvent();
			}else if(data.code==data_protocol.unauthc){
				jumpLogin(relative_path,return_uri);
			}else{
				alert(data.info)
			}
			
		},
		error:function(){
			console.log("请求私有文章分类失败")
		}
	});
}

function getPrvTypeLabel(prvCate){
	var label = '<label>'+
  					'<input type="checkbox" name="private_type" value="'+String(prvCate.privateSortId)+'">'+prvCate.privateSortName+
				'</label>';
	return label;
}

function getPrvTypeListLi(prvCate){
	var li = '<li>'+
				'<span class="prv-total"><span>'+prvCate.articleCount+'</span><span>篇</span></span>'+
				'<span class="prv-name" pid="'+prvCate.privateSortId+'">'+prvCate.privateSortName+'</span>'+
				'<span class="prv-mod-input">'+
					'<span contenteditable="true" placeholder="please input"></span>'+
					'<span class="confirm">确定</span>'+
					'<span class="cancel">取消</span>'+
				'</span>'+
				'<span class="prv-operate">'+
					'<span class="edit">编辑</span>'+
					'<span class="del">删除</span>'+
				'</span>'+
			'</li>';
	return li;
}

//初始化公有文章分类
function initPublicCategory(front_site){
	$.ajax({
		type:"get",
		url:front_site+"/article/sort",
		async:true,
		dataType:"json",
		success:function(data){
			var pubCates = data.data;
			var length = pubCates.length;
			var $pubCate = $(".pub-category");
			$pubCate.empty();
			for(var i = 0 ;i < length;i++){
				var label = '<label>'+
	      					'<input type="checkbox" name="public_type" value="'+String(pubCates[i].sortId)+'">'+pubCates[i].sortName+
	    				'</label>';
	    		$pubCate.append(label);
			}
		},
		error:function(){
			console.log("请求公有文章分类失败")
		}
	});
}


/**
 * ①调整【文章标题】下的输入框位置
 * 
 * ②动态添加【文章标签】
 */
count_article_lable = 0
function mylistener() {
	
	$("ul.dropdown-menu.sub-dropdown-menu:first a").click(function() {
		A = $(this).text()
		$("button.btn.btn-default.dropdown-toggle:first").html(A)
		$("#yczzfy").val(A)
		$("#artic-type").css({"margin-left":"41px"})
	})
	
	
	$(".glyphicon.glyphicon-plus").click(function() {
		count_article_lable = count_article_lable + 1;
		if(count_article_lable >= 5) {
			return
		}
		html='<input type="text" name="article_tag" class="form-control " maxlength="10" size="1" onkeyup="changeInput(this)" style="text-align: center;padding: 6px 7px;">'
		html+='<span class="glyphicon glyphicon-remove" style="margin-top: -7px;margin-left: -9px;font-size: 12px;margin-right:8px;color: red"  onclick="del(this)"></span>'
		$(this).before(html)
	})
}

/**
 * 删除【文章标签】
 * 
 */
function del(a){
		if(count_article_lable==0)
			return
		$(a).prev().remove();
		$(a).remove();
		count_article_lable=count_article_lable-1;
}

/**
 * 【文章标签】输入框自动扩大缩小
 */
function changeInput(a){
	a.size = a.value.length + 1;
}


/**
 * 初始化wangEditor2
 * @param {Object} articleEditor
 * @param {Object} relative_path
 */
function initWangEditor2(articleEditor,front_site,relative_path){
	
	var uploadImgPath = "/img/article/upload";
	var getImgPath = "/img/article/get/";
	var delImgPath = "/img/article/del/"
	
	// 取消粘贴过滤
    articleEditor.config.pasteFilter = false;
	
	articleEditor.config.emotions = {
	    // 支持多组表情
	
	    // 第一组，id叫做 'default' 
	    'gif': {
	        title: '默认',  // 组名称
	        data: relative_path+'data/emotions-gif.data'  // 服务器的一个json文件url，例如官网这里配置的是 http://www.wangeditor.com/wangEditor/test/emotions.data
	    },
	    'jpg': {
	        title: '新版emoji',  // 组名称
	        data: relative_path+'data/weiboEmoji.data'  // 服务器的一个json文件url，例如官网这里配置的是 http://www.wangeditor.com/wangEditor/test/emotions.data
	    },
	    // 第二组，id叫做'weibo'
	    'weibo': {
	        title: '微博表情',  // 组名称
	        data: [  // data 还可以直接赋值为一个表情包数组
	            // 第一个表情
	            {
	                'icon': 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/7a/shenshou_thumb.gif',
	                'value': '[草泥马]'
	            },
	            // 第二个表情
	            {
	                'icon': 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/60/horse2_thumb.gif',
	                'value': '[神马]'
	            }
	            // 下面还可以继续，第三个、第四个、第N个表情。。。
	        ]
	    }
	    // 下面还可以继续，第三组、第四组、、、
	};
	// 上传图片配置
	//头部
	var headerParams = getHeaderParams();
	articleEditor.config.uploadHeaders = headerParams;
	console.log(headerParams)
	//上传地址
	articleEditor.config.uploadImgUrl = front_site + uploadImgPath;
	//上传name
	articleEditor.config.uploadImgFileName = 'img'
	//与请求一起发送凭据或cookie
	articleEditor.config.withCredentials = false;
    
    var imgObjs = [];
    // 自定义load事件
    articleEditor.config.uploadImgFns.onload = function (data, xhr) {
        // resultText 服务器端返回的text
        // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
        data = JSON.parse(data);
        // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
//	        var originalName = editor.uploadImgOriginalName || '';  
        
        // 如果 resultText 是图片的url地址，可以这样插入图片：
//	        editor.command(null, 'insertHtml', '<img src="' + resultText + '" alt="' + originalName + '" style="max-width:100%;"/>');
        // 如果不想要 img 的 max-width 样式，也可以这样插入：
        if(data.code==200){
        	articleEditor.command(null, 'InsertImage', front_site + getImgPath + data.data[0]);
         
	        var imgObj = {isExist:true,imgName:data.data[0]};
	        imgObjs.push(imgObj);
        }
         
    };
    // 配置 onchange 事件
    articleEditor.onchange = function () {
        // 编辑区域内容变化时，实时打印出当前内容
//      console.log(this.$txt.html());
        //现在文档中实际存在的图片
        var $imgs = this.$txt.find("img");
        //imgObjs记录的图片
        if($imgs.length < imgObjs.length){
        	var imgsLen = $imgs.length;
        	var imgObjsLen = imgObjs.length;
        	//首先将记录中的所有图片存在设为false
        	for(var i = 0;i < imgObjsLen;i++){
        		imgObjs[i].isExist = false;
        	}
        	//判断哪些图片仍旧在内容中，
        	for(var i = 0;i < imgObjsLen;i++){
        		var imgName = imgObjs[i].imgName;
        		for(var j = 0;j < imgsLen;j++){
        			if($imgs.eq(j).attr("src").indexOf(imgName) != -1){
        				imgObjs[i].isExist = true;
        				break;
        			}
        		}
        	}
        	//将记录中仍是false的删除
        	for(var i = 0;i < imgObjsLen;i++){
        		if(imgObjs[i].isExist == false){
        			$.ajax({
        				type:"post",
        				url:front_site+delImgPath+imgObjs[i].imgName,
        				async:true,
        				dataType:"json",
        				success:function(data){
        					if(data.code==data_protocol.success){
        						console.log("删除图片："+imgObjs[i]+"==》成功")
        					}else{
        						console.log("删除图片："+imgObjs[i]+"==》失败")
        					}
        				}
        			});
        		}
        	}
        }
    };
}

/**
 * 获得from中的参数
 */
function getArticleParams(front_site){
	var articleForm = {};
	
	
	var params = $("form").serialize();
	
	//解决中文乱码
	params = decodeURIComponent(params,true);
	
	var splitStr = params.split("&");  // 返回结果：["userName=cyq", "age=24", "sex=f"]
	for(var i = 0; i < splitStr.length; i++){
		var value = articleForm[splitStr[i].split("=")[0]]
		if(value){
			value = value + ',' + splitStr[i].split("=")[1];
			articleForm[splitStr[i].split("=")[0]] = value;
			continue;
		}
	  	articleForm[splitStr[i].split("=")[0]] = splitStr[i].split("=")[1];
	}
	
	//文章内容
	var article_content = articleEditor.$txt.html();
	articleForm['article_content'] = article_content;
	//文章列表显示图片
	var $img = $(article_content).find("img").eq(0);
	var imgSrc = $img.attr("src");
	if(!!imgSrc){
		//"http://"的长度为7
		var siteLen = front_site.length;
		var index = imgSrc.indexOf('/',siteLen);
		articleForm['article_img'] = imgSrc.substr(index);
	}else{
		articleForm['article_img'] = "";
	}
	//文章摘要
	if(!articleForm['article_remark']){
		var article_remark = articleEditor.$txt.text().substr(0,100);
		articleForm['article_remark'] = article_remark;
	}
	if(!articleForm['article_type']){
		alert("请填写类型")
		return false;
	}else if(!articleForm['article_title']){
		alert("请填写题目")
		return false;
	}else if(articleForm['article_content']=='<p><br></p>'){
		alert("请填写内容")
		return false;
	}else if(!articleForm['article_tag']){
		alert("请填写标签")
		return false;
	}else if(!articleForm['private_type']){
		alert("请选择个人分类")
		return false;
	}else if(!articleForm['public_type']){
		alert("请选择公有分类")
		return false;
	}
	
	//ip
	articleForm['client_ip'] = returnCitySN.cip;
	
	console.log(articleForm)
	return articleForm;
	
}

/**
 * 更新
 */
function updateForm(front_site,relative_path,user_id,article_id){
    var return_uri = getReturnUri(relative_path);
	
	var articleForm = getArticleParams(front_site);
	
	if(!articleForm){
		return;
	}
	
	var headerParams = getHeaderParams();
	
	
	$.ajax({
		type:"post",
		url:front_site+"/article/user/"+user_id+"/update/"+article_id,
		async:false,
		contentType:'application/json;charset=utf-8',
		dataType:"json",
		headers:headerParams,
		data:JSON.stringify(articleForm),
		success:function(data){
			if(data.code==data_protocol.success){
				alert("修改成功，点击确定跳转");
				window.location.href = relative_path+"index.html";
			}else if(data.code==data_protocol.unauthc){
				jumpLogin(relative_path,return_uri);
			}else{
				alert(data.info+"(请联系管理员处理)");
			}
		}
	});
}

/**
 * 提交表单：发布
 */
function publishForm(front_site,relative_path,user_id){
	$("#article_state").val("发布");
	formBtnClick(front_site,relative_path,user_id);
}
function saveForm(front_site,relative_path,user_id){
	$("#article_state").val("草稿");
	formBtnClick(front_site,relative_path,user_id);
}
function formBtnClick(front_site,relative_path,user_id){
	var return_uri = getReturnUri(relative_path);
	var articleForm = getArticleParams(front_site);
	
	if(!articleForm){
		return;
	}
	var headerParams = getHeaderParams();
	
	$.ajax({
		type:"post",
		url:front_site+"/article/user/"+user_id+"/save",
		async:false,
		contentType:'application/json;charset=utf-8',
		dataType:"json",
		headers:headerParams,
		data:JSON.stringify(articleForm),
		success:function(data){
			if(data.code==data_protocol.success){
				alert("提交成功，点击确定跳转");
				window.location.href = relative_path+"index.html";
			}else if(data.code==data_protocol.unauthc){
				jumpLogin(relative_path,return_uri);
			}else{
				alert(data.info+"(请联系管理员处理)");
			}
		}
	});
}
function delForm(relative_path){
	if(confirm("确定不要了吗？这可是你辛辛苦苦写了这么久的耶")){
		jumpIndex(relative_path);
	}
}