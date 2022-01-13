function initVotePoll(){
	$(".invitor-content-send .send-button").disable();
	if(!pageJudge()){
		return false;
	}
	var pollId = pageJudge();
	console.log(pollId)
	$.ajax({
		type:"get",
		url:front_site+"/poll/get",
		async:true,
		data:"pollId="+pollId,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				var pollObj = data.data;
				//title
				$(".poll-bg-title").html(pollObj.pollTitle);
				//userNickname
				$(".poll-bg-userNickname").html(pollObj.userNickName);
				//createTime
				$(".poll-bg-createTime").html(dateToString(stringToDate(pollObj.pollCreateTime),"/"));
				$(".poll-bg-location").html(pollObj.pollLocation);
				$(".poll-bg-note").html(pollObj.pollNote);
				//table
				//options
				var pollOptions = pollObj.pollOptions;
				var pollOptionsArray = pollOptions.split('#');
				var pollOptionsNum = pollOptionsArray.length;
				localStorage.setItem("pollOptionsNum",pollOptionsNum+'');
				var $tableTheadOptionTr = $(".complete-table thead .option-tr");
				$tableTheadOptionTr.empty();
				var headtd = '<td></td>';
				for(var i = 0;i<pollOptionsNum;i++){
					headtd = headtd + '<td>'+pollOptionsArray[i]+'</td>'
				}
				$tableTheadOptionTr.append(headtd);
				//ifsuit
				var $tableTbody = $(".complete-table tbody");
				$tableTbody.empty();
				var ifSuit = pollObj.pollIfsuit;
				var unsuitBox = '<div class="check-option-unsuit-box" title="If not ideal for you,check this."><span class="glyphicon glyphicon-remove"></span></div>';
				
				var filltd = '<td><input></td>';
				for(var i = 0;i<pollOptionsNum;i++){
					filltd = filltd + '<td>'
								+'<div class="check-option-box">'
									+'<span class="glyphicon glyphicon-ok"></span>'
								+'</div>';
					if(ifSuit=='1'){
						filltd = filltd + unsuitBox;
					}
					filltd = filltd +'</td>'
				}
				var trInputOption = '<tr>'+filltd+'</tr>';
				
				$tableTbody.append(trInputOption);
				$(".complete-table>table tbody td ").on({
					"mouseover":function(event){
						$(this).children(".check-option-unsuit-box").show();
					},
					"mouseout":function(event){
						if($(this).children(".check-option-unsuit-box").children("span").is(":visible")){
							$(this).children(".check-option-unsuit-box").show();
						}else{
							$(this).children(".check-option-unsuit-box").hide();
						}
					}
				})
				//check-option-box
				var $tableTbodyCheckbox = $(".complete-table tbody .check-option-box");
				$tableTbodyCheckbox.on("click",function(){
					if($(this).children("span").is(":visible")){
						$(this).children("span").hide();
					}else{
						$(this).children("span").show();
					}
					checkPollAnsSend();
					event.stopPropagation();
					
				})
				//check-option-unsuit-box
				var $tableTbodyCheckUnsuitbox = $(".complete-table tbody .check-option-unsuit-box");
				$tableTbodyCheckUnsuitbox.hide();
				var $tableTbodyCheckUnsuitboxNum = 0;
				$tableTbodyCheckUnsuitbox.on("click",function(event){
					if($(this).children("span").is(":visible")){
						console.log("hide")
						//不适合box本身
						$(this).children("span").hide();
						//钩选选项
						$tableTbodyCheckbox.enable();
						--$tableTbodyCheckUnsuitboxNum;
					}else{
						console.log("show")
						$(this).children("span").show();
						$tableTbodyCheckbox.children("span").hide();
						$tableTbodyCheckbox.disable();
						++$tableTbodyCheckUnsuitboxNum;
					}
					event.stopPropagation();
					if($tableTbodyCheckUnsuitboxNum>0){
						$tableTbodyCheckbox.children("span").hide();
						$tableTbodyCheckbox.disable();
					}else{
						$tableTbodyCheckbox.enable();
					}
					checkPollAnsSend();
				})
				
				//pollOptionIflimit
				if(pollObj.pollOptionIflimit=='1'){
					localStorage.setItem("pollSettings-limit",pollObj.pollOptionLimit+'');
				}
				//ifSingle
				var ifSingle = pollObj.pollIfsingle;
				if(ifSingle == '1'){
					console.log("single")
					$tableTbodyCheckbox.off("click");
					$tableTbodyCheckbox.on("click",function(){
						var _this = this;
						if($(_this).children("span").is(":visible")){
							console.log("hide")
							$tableTbodyCheckbox.each(function(index,object){
								if(_this == object){
									$(object).children("span").hide();
								}else{
									$(object).enable();
								}
							})
						}else{
							console.log("show")
							
							$tableTbodyCheckbox.each(function(index,object){
								if(_this == object){
									$(object).children("span").show();
								}else{
									$(object).children("span").hide();
									$(object).disable();
								}
							})
						}
						event.stopPropagation();
						checkPollAnsSend();
					})
					
				}
				//pollMsgIfhide
				var ifHide = pollObj.pollMsgIfhide;
				if(ifHide == '1'){
					localStorage.setItem('pollSettings-ifHide',ifHide);
				}
				//get poll answer sheet
				initPollAnsheet(true,pollId,pollOptionsNum,ifHide);
				
				//get poll comments
				initPollComment(true,pollId,ifHide);
				
				//isMsgAsk
				var isMsgAsk = pollObj.pollMsgIsask;
				clickPollAnsSend(isMsgAsk);
				//isAdsRemove
				var isAdsRemove = pollObj.pollAdsIsremove;
				if(isAdsRemove == '1'){
					$(".dd-area").hide();
				}
			}else{
				
			}
		}
	});
	
}

function initPollAnsheet(isVisit,pollId,pollOptionsNum,ifHide){
	$.ajax({
		type:"get",
		url:front_site+"/pollAnsheet/get",
		data:"pollId="+pollId,
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				var pollAnsheetObj = data.data;
				var $tableTheadPartInTr = $(".complete-table thead .partIn-people");
				var partInNum = pollAnsheetObj.ansNum;
				$tableTheadPartInTr.children("td").children(".poll-bg-partIn").html(partInNum);
				//options：每个选项的选的个数
				var options = [];
				var partOfOne = pollAnsheetObj.pollAnsheet;
				for(var i = 0;i<pollOptionsNum;i++){
					options[i] = 0;
				}
				for(var i = 0;i<partInNum;i++){
					var partOfOneOptions = partOfOne[i].fillOption.split('#');
					var partOfOneOptionLen = partOfOneOptions.length;
					for(var j = 0;j<partOfOneOptionLen;j++){
						++options[parseInt(partOfOneOptions[j])];
					}
				}
				var $optionPart = $tableTheadPartInTr.children("td:last-child");
				$optionPart.remove();
				var optionPartOne = '';
				for(var i = 0;i<pollOptionsNum;i++){
					optionPartOne = optionPartOne + '<td class="partIn-per"><span class="glyphicon glyphicon-ok"></span><span>'+options[i]+'</span></td>';
				}
				$tableTheadPartInTr.append(optionPartOne);
				
				//hide optional detail of per people
				$(".complete-table thead").children("tr:last-child").remove();
				if(ifHide == '0'){
					var nosuit = 0;
					for(var i = 0;i<partInNum;i++){
						if(partOfOne[i].fillNosuit=='0'){
							var partOfOneOptions = partOfOne[i].fillOption.split('#');
							var fillName = partOfOne[i].fillName;
							addPartInRecord(fillName,partOfOneOptions,pollOptionsNum);
						}else{
							nosuit++;
						}
					}
					if(nosuit != 0){
						$(".partIn-people .no-suit-tip>span:first-child").html(nosuit);
						$(".partIn-people>td:first-child").on({
							"mouseover":function(){
								$(this).children(".no-suit-tip").show();
							},
							"mouseout":function(){
								$(this).children(".no-suit-tip").hide();
							}
						})
					}
				}
				
				
			}else{
				
			}
			
		}
	});
}

function addPartInRecord(fillName,partOfOneOptions,pollOptionsNum){
	if(isEmpty(fillName)){
		fillName = 'Anonymous';
	}
	var tr = '<tr class="partIn-option">'
						+'<td>'+fillName+'</td>';
	var k = 0;
	for(var j = 0;j<pollOptionsNum;j++){
		
		
		if(j == partOfOneOptions[k]){
			k++;
			tr = tr	+'<td class="act"><div class="check-option-box"><span class="glyphicon glyphicon-ok"></span></div></td>';
			
		}else{
			tr = tr	+'<td></td>';
			
		}
	}
	tr = tr + '</tr>';
	$(".complete-table thead").append(tr);
}

function savePollAnsheet(isVisit,data){
	if(!pageJudge()){
		return false;
	}
	var pollId = pageJudge();
	//准备数据
	var optionAns = [];
	$(".complete-table tbody td .check-option-box").each(function(index,object){
		if($(object).children("span").is(":visible")){
			optionAns.push(index);
		}
	})
	var optionsAnsStr = optionAns.join('#');
	var fillNosuit = '0';
	if(checkBoxJudge(".check-option-unsuit-box")){
		fillNosuit = '1';
	}
	var fillName = $(".complete-table tbody td:first-child input").val();
	var fillId = localStorage.getItem("fillId");
	var pollAnsObj = {
		"fillName":fillName,
		"fillOption":optionsAnsStr,
		"fillNosuit":fillNosuit,
		"fillIp":returnCitySN.cip,
		"pollId":pollId,
		"fillId":fillId
	}
	if(typeof data != undefined && data != null){
		pollAnsObj['fillEmail'] = data.fillEmail;
		pollAnsObj['fillPhone'] = data.fillPhone;
		pollAnsObj['fillAddress'] = data.fillAddress;
	}
	
	//改变页面上的数据
	var pollOptionsNum = parseInt(localStorage.getItem("pollOptionsNum"));
	addPartInRecord(fillName,optionAns,pollOptionsNum)
	var $partInPeople = $(".complete-table thead .partIn-people");
	var partsNum = parseInt($partInPeople.children("td:first-child").children("span").html());
	$partInPeople.children("td:first-child").children("span").html(++partsNum);
	var i = 0;
	$partInPeople.children(".partIn-per").children("span:last-child").each(function(index,object){
		if(index == optionAns[i]){
			var tmp = parseInt($(object).html());
			++tmp;
			$(object).html(tmp);
			i++;
		}
	})
	
	$.ajax({
		type:"post",
		url:front_site+"/pollAnsheet/save",
		async:true,
		data:JSON.stringify(pollAnsObj),
		dataType:"json",
		contentType:"application/json;charset=utf-8",
		success:function(data){
			if(data.code==data_protocol.success){
				var pollAnsObj = data.data;
				var fillId = pollAnsObj.fillId;
				if(isEmpty(localStorage.getItem("fillId"))){
					localStorage.setItem("fillId",fillId+'');
				}
			}else if(data.code==data_protocol.intentialError){
				console.log("(￣_,￣ )");
			}
		}
	});
}

function clickPollAnsSend(isMsgAsk){
	
	$(".invitor-content-send .send-button").on("click",function(){
		//to do 弹框询问信息
		if(isMsgAsk == '1'){
			$("#lanbai-modal").fadeIn(300);
			$("#lanbai-modal .modal-btn-confirm").on("click",function(){
				var pollAnsObj = {
					fillEmail:$.trim($(".fill-mail").val()),
					fillPhone:$.trim($(".fill-phone").val()),
					fillAddress:$.trim($(".fill-address").val())
				}
				savePollAnsheet(true,pollAnsObj);
				$("#lanbai-modal").fadeOut(300);
			})
		}else{
			savePollAnsheet(true);
		}
	})
	
}

function checkPollAnsSend(){
	if(checkBoxJudge(".check-option-box") || checkBoxJudge(".check-option-unsuit-box")){
		$(".invitor-content-send .send-button").enable();
		$(".invitor-content-send .send-ban-tip").hide();
		
	}else{
		$(".invitor-content-send .send-button").disable();
		$(".invitor-content-send .send-ban-tip").show();
	}
}

function checkBoxJudge(className){
	var ifAdmit = 0;

	$(".complete-table tbody td "+className).each(function(index,object){
		if($(object).children("span").is(":visible")){
			++ifAdmit;
		}
	})
	if(ifAdmit == 0){
		return false;
	}else{
		return true;
	}
}

function commentDiv(pollCommentObj){
	var fillName = pollCommentObj.fillName
	if(isEmpty(fillName)){
		fillName = "Anonymous";
	}
	var fillNameFirstLetter = fillName.split('')[0];
	var fillCmntContent = pollCommentObj.fillCmntContent;
	var fillCmntTime = dateDiff(stringToDate(pollCommentObj.fillCmntTime));
	var div = '<div class="comment-item" data-cmntid="'+pollCommentObj.fillCmntId+'">'
				+'<div class="comment-image">'
					+'<div class="image-location">'
						+'<div>'+fillNameFirstLetter+'</div>'
					+'</div>'
				+'</div>'
				+'<div class="comment-content">'
					+'<div class="comment-name">'+fillName+'</div>'
					+'<div class="comment-time">'+fillCmntTime+'</div>'
					+'<div class="comment-content-detail">'+fillCmntContent+'</div>'
				+'</div>'
				+'<div class="comment-remove">'
					+'<span class="glyphicon glyphicon-trash"></span>'
				+'</div>'
			+'</div>';
	return div;
}

function initPollCommentDel(isVisit){
	$(".poll-invitor-complete-comment .comment-remove").off("click");
	$(".poll-invitor-complete-comment .comment-remove").on("click",function(){
		var fillCmntId = $(this).parent(".comment-item").data("cmntid");
		var fillId = localStorage.getItem("fillId");
		if(isEmpty(fillId)){
			return false;
		}
		var obj = {"fillId":parseInt(fillId),"fillCmntId":fillCmntId};
		$(this).parent(".comment-item").remove();
		$.ajax({
			type:"post",
			url:front_site+"/comment/poll/del",
			async:true,
			data:JSON.stringify(obj),
			dataType:"json",
			contentType:"application/json;charset=utf-8",
			success:function(data){
				if(data.code==data_protocol.success){
					console.log("success");
				}else if(data.code==data_protocol.error){
					console.log("del comment error"); 
				}
			}
		});
	});
	
}

function initPollComment(isVisit,pollId,ifHide){
	$(".invitor-comment-show").empty();
	$.ajax({
		type:"get",
		url:front_site+"/comment/poll/get",
		data:"pollId="+pollId,
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				var pollCommentObjs = data.data;
				var pollCommentLen = pollCommentObjs.length;
				if(pollCommentLen != 0){
					$(".poll-invitor-complete-comment .invitor-comment-title span").html(pollCommentLen);
					for(var i = 0;i<pollCommentLen;i++){
						$(".poll-invitor-complete-comment .invitor-comment-show").append(commentDiv(pollCommentObjs[i]));
					}
					initPollCommentDel(true);
				}
				
			}else{
				
			}
			
		}
	});
}

function clickCommentSend(){
	if(!pageJudge()){
		return false;
	}
	$(".poll-invitor-complete-comment .invitor-comment-input .comment-send").on("click",function(){
		var fillName = $(".complete-table tbody td:first-child input").val();
		var fillCmntContent = $(".poll-invitor-complete-comment .invitor-comment-input .comment-input").text();
		
		var obj = {"fillName":fillName,"fillCmntContent":fillCmntContent};
		obj["fillId"] = localStorage.getItem("fillId");
		obj["pollId"] = pageJudge();
		$.ajax({
			type:"post",
			url:front_site+"/comment/poll/save",
			async:true,
			data:JSON.stringify(obj),
			dataType:"json",
			contentType:"application/json;charset=utf-8",
			success:function(data){
				if(data.code==data_protocol.success){
					var pollCmntObj = data.data;
					var fillId = pollCmntObj.fillId;
					if(isEmpty(localStorage.getItem("fillId"))){
						localStorage.setItem("fillId",fillId+'');
					}
					var totalNum = $(".poll-invitor-complete-comment .invitor-comment-title span").html();
					++totalNum;
					$(".poll-invitor-complete-comment .invitor-comment-title span").html(totalNum);
					$(".poll-invitor-complete-comment .invitor-comment-show").prepend(commentDiv(pollCmntObj));
					initPollCommentDel(true);
				}else{
					console.log("error");
				}
			},
			error:function(data){
				console.log(data)
			}
		});
	})
	
}

function pageJudge(){
	var pollId = getRequestParameter().pollId;
	if(isEmpty(pollId)){
		return false;
	}
	return pollId; 
}

function switchInviteModal(){
	$(".poll-invite-button").on("click",function(){
		$(".invite-modal").show();
		$(this).hide();
	})
	$(".invite-modal .modal-remove").on("click",function(){
		$(this).parent(".invite-modal").hide();
		$(".poll-invite-button").show();
	})
}
function switchNoteDiv(){
	$(".modal-msg-edit>div").on("click",function(){
		if($(".modal-note-input").is(":visible")){
			$(".modal-note-input").hide();
		}else{
			$(".modal-note-input").show();
			
		}
	})
}
function switchShareDiv(){
	$(".link-copy").prev().text(window.location);
	$(".modal-link-share>div>span").on("click",function(){
		if($(".modal-link-content").is(":visible")){
			$(".modal-link-content").hide();
		}else{
			$(".modal-link-content").show();
			
		}
	})
}

function getPollLink(){
	return $(".link-copy").prev().text();
}

function copyLink(){
	var linkText = getPollLink();
	var clipboard = new Clipboard('.link-copy', {
		text: function() {
			return linkText;
		}
	});
	clipboard.on('success', function(e) {
		$(".link-copy>div").show();
		setTimeout(function(){
			$(".link-copy>div").hide();
		},3000)
		
	});
 
	clipboard.on('error', function(e) {
		console.log(e);
	});

}

function sendMail(){
	$("#mail-send").disable();
	$("#mail-input").on("input propertychange",function(){
		if($.trim($(this).text())){
			$("#mail-send").enable();
		}else{
			$("#mail-send").disable();
		}
	})
	$("#mail-send").on("click",function(){
		var inputMail = $("#mail-input").text();
		var inputNote = $("#note-input").text();
		var pollLink = getPollLink();
		
		var mails = inputMail.split(',');
		var mailsLen = mails.length;
		for(var i = 0;i < mailsLen;i++){
			mails[i] = $.trim(mails[i]);
		}
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
		var newMails = [];//用新的数组重新得到邮箱，去除含空的字符串
		for(var i = 0,j = 0;i < mailsLen;i++){
			if(mails[i] == '') continue;
			if(!reg.test(mails[i])){
				alert("第"+(j+1)+"个邮箱填写格式有误");
				return false;
			}
			newMails[j++] = mails[i];
		}
		
		var newNote = $.trim(inputNote);
		
		var data = new StringBuffer();
		data.append("mails="+newMails);
		data.append("&note="+newNote);
		data.append("&link="+pollLink);
		
		$.ajax({
			type:"post",
			url:front_site+"/poll/mail/invite/send",
			data:data.toString(),
			async:true,
			dataType:"json",
			success:function(data){
				if(data.code==data_protocol.success) alert("邮件发送成功！");
			}
		});
	})
}

function modalAnimate(){
	$("#lanbai-modal .modal-btn-cancel").on("click",function(){
		$("#lanbai-modal").fadeOut(300);
	})
}

function editPoll(){
	$(".poll-title .poll-edit").on("click",function(){
		var pollId = getRequestParameter().pollId;
		if(typeof pollId != undefined && pollId != null){
			window.location.href = "./createPoll.html?pollId="+pollId;
		}
	})
}

