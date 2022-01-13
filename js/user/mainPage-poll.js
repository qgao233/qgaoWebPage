function startPollDeadlineEvent(){
	$(".poll-deadline").on({
		"mouseover":function(){
			$(".deadline-change.trigger").show();
		},
		"mouseout":function(){
			$(".deadline-change.trigger").hide();
		}
	})
}
function stopPollDeadlineEvent(){
	$(".poll-deadline").off("mouseover mouseout")
}
function deadlineChange(){
	startPollDeadlineEvent();
	$(".deadline-change.trigger").on("click",function(){
		$(this).hide();
		$(".deadline-show").hide();
		$(".deadline-input").show().css("display","inline-block");;
		stopPollDeadlineEvent();
	})
	$(".deadline-change.confirm").on("click",function(){
		var newDeadStr = $('.deadline-input>input').val();
		newDeadStr = newDeadStr.replace("T"," ");
		var pollId = myPoll.window.pollId;
		var pollObj = {
			"pollDeadline":newDeadStr+":00",
			"pollId":pollId
		}
		var headers = getHeaderParams();
		$.ajax({
			type:"post",
			url:front_site+"/poll/authc/update",
			headers:headers,
			async:false,
			contentType:'application/json;charset=utf-8',
			dataType:"json",
			data:JSON.stringify(pollObj),
			success:function(data){
				if(data.code==data_protocol.success){
					$(".data-modal .poll-detail .deadline-show").html(newDeadStr);
				}
				$(".deadline-show").show();
				$(".deadline-input").hide();
				startPollDeadlineEvent();
			},
			error:function(data){
				console.log(data)
			}
		});
		
	})
	$(".deadline-change.cancel").on("click",function(){
		$(".deadline-show").show();
		$(".deadline-input").hide();
		startPollDeadlineEvent();
	})
}


function selectChange(){
	$(".modal-body .chart-option .option-select select").on("change",function(){
		myChart.showLoading();
		var option;
		switch($(this).val()){
			case "line":option = line();break;
			case "bar":option = bar();break;
			case "pie":option = pie();break;
	//					case "scatter":option = scatter();break;
			default:break;
		}
//		option.color = ['#34a4e6'];没用，本意是修改全局颜色
		myChart.setOption(option);
		myChart.hideLoading();
			
	})
}
	
function line(){
	return {
		xAxis: {
			show:true,
            data: xData
        },
        yAxis: {show:true},
        series: [{
            type: 'line',
            data: options
            
        }]
    };
	    
}	
function bar(){
	return {
		xAxis: {
			show:true,
            data: xData
        },
        yAxis: {show:true},
        series: [{
            type: 'bar',
            data: options
            
        }]
    };
}
function pie(){
	var len = xData.length;
	var obj;
	var data = new Array(len);
	for(var i = 0;i<len;i++){
		obj = new Object();
		obj['value'] = options[i];
		obj['name'] = xData[i];
		data.push(obj);
	}
	return {
		xAxis: {show:false},
	    yAxis: {show:false},
	    series: [{
	        type: 'pie',
	        radius: '55%',
			roseType: 'angle',
    		data:data
        }]
    };
}
function scatter(){
	return {
        series: [{
            type: 'scatter',
        }]
    };
}

function showCharts(){
	var title = pollObj.pollTitle;
	xData = pollObj.pollOptions.split("#");
	var pollOptionsNum = xData.length;
	var partInNum = pollAnsheetObj.ansNum;
	options = [];
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

	// 指定图表的配置项和数据
	var option = {
	    title: {
	        text: title
	    },
	    tooltip: {},
	    legend: {
	        data:['投票数']
	    },
	    xAxis: {
	        data: xData
	    },
	    yAxis: {},
	    series: [{
	        name: '投票数',
	        type: 'bar',
	        data: options
	    }]
	};
	
	// 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart.hideLoading();
    selectChange();
}

function showPollMsg(){
	$(".data-modal .poll-detail .location").html(pollObj.pollLocation);
	$(".data-modal .poll-detail .note").html(pollObj.pollNote);
	
	var suit;
	if(pollObj.pollIfsuit=='1')suit = 'yes';else suit = 'no';
	$(".data-modal .poll-detail .ideal").html(suit);
	
	var limit;
	if(pollObj.pollOptionIflimit=='1'){
		limit = 'yes';
	}else {
		limit = 'no';
		$(".data-modal .poll-detail .limit-num").parent().hide();
	}
	$(".data-modal .poll-detail .limit").html(limit);
	$(".data-modal .poll-detail .limit-num").html(pollObj.pollOptionLimit);
	
	var single;
	if(pollObj.pollIfsingle=='1')single = 'yes';else single = 'no';
	$(".data-modal .poll-detail .single").html(single);
	
	var hide;
	if(pollObj.pollMsgIfhide=='1')hide = 'yes';else hide = 'no';
	$(".data-modal .poll-detail .msghide").html(hide);
	
	var dead;
	if(isEmpty(pollObj.pollDeadline))dead = '∞';else dead = pollObj.pollDeadline;
	$(".data-modal .poll-detail .deadline-show").html(dead);
}

function showTableMsg(){
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
	
	
	$(".complete-table thead").children("tr:last-child").remove();
	var partOfOne = pollAnsheetObj.pollAnsheet;
	var partInNum = pollAnsheetObj.ansNum;
	var nosuit = 0;
	for(var i = 0;i<partInNum;i++){
		var partOfOneOptions = partOfOne[i].fillOption.split('#');
		var fillName = partOfOne[i].fillName;
		addPartInRecord(fillName,partOfOneOptions,pollOptionsNum,partOfOne[i].fillNosuit);
		if(partOfOne[i].fillNosuit=='1'){
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

function addPartInRecord(fillName,partOfOneOptions,pollOptionsNum,key){
	if(isEmpty(fillName)){
		fillName = 'Anonymous';
	}
	var tr = '<tr class="partIn-option">'
						+'<td>'+fillName+'</td>';
	var k = 0;
	if(key == '1'){
		for(var j = 0;j<pollOptionsNum;j++){
			tr = tr	+'<td style="background:#aaa;"></td>';
		}
	}else{
		for(var j = 0;j<pollOptionsNum;j++){
			if(j == partOfOneOptions[k]){
				k++;
				tr = tr	+'<td class="act"><div class="check-option-box"><span class="glyphicon glyphicon-ok"></span></div></td>';
			}else{
				tr = tr	+'<td></td>';
			}
		}
	}
	
	tr = tr + '</tr>';
	$(".complete-table thead").append(tr);
}

function showPollDataModal(){
	$(".data-modal").show();
	
	dragPollModal();
	rotatePollModalArrow();
	dowloadExcel();
	deadlineChange();
	
	
	var pollId = window.myPoll.pollId;
	//			var pollId = window.myPoll.returnPollId();
	//			var pollId = $("#myPoll")[0].contentWindow.returnPollId();
	//			var pollId = window.document.getElementById('myPoll').contentWindow.returnPollId();
	
	myChart = echarts.init($(".mychart-show")[0]);
	myChart.showLoading();
	$.ajax({
		type:"get",
		url:front_site+"/pollAnsheet/get",
		data:"pollId="+pollId,
		async:true,
		dataType:"json",
		success:function(data){
			if(data.code==data_protocol.success){
				pollAnsheetObj = data.data;				//全局回答列表对象
				$.ajax({
					type:"get",
					url:front_site+"/poll/get",
					async:true,
					data:"pollId="+pollId,
					dataType:"json",
					success:function(data){
						if(data.code==data_protocol.success){
							pollObj = data.data;		//全局问卷信息对象
							showCharts();
							showPollMsg();
							showTableMsg();
						}
					}
				});
			}
		}
    });
	
}
function hidePollDataModal(){
	$(".modal-remove").on("click",function(){
		$(".data-modal").hide();
		$(".data-modal .complete-table").empty();
		$(".data-modal .complete-table").append(getModalTable());
	})
}

function getModalTable(){
	return '<table border="0">'
			+'<thead>'
				+'<tr class="option-tr">'
					+'<td></td>'
					+'<td>Feb26TUE</td>'
				+'</tr>'
				+'<tr class="partIn-people">'
					+'<td>'
						+'<div class="no-suit-tip"><span>2</span> of all said they were not ideal for these options.</div>'
						+'<span class="poll-bg-partIn">0</span> participants'
					+'</td>'
					+'<td class="partIn-per"><span class="glyphicon glyphicon-ok"></span><span>0</span></td>'
				+'</tr>'
				+'<tr class="partIn-option">'
					+'<td>Anonymous</td>'
					+'<td class="act"><div class="check-option-box"><span class="glyphicon glyphicon-ok"></span></div></td>'
				+'</tr>'
			+'</thead>'
		+'</table>';
}

//pollAnsheetObj，pollObj

function dowloadExcel(){
	$("#export-excel").on("click",function(){
		var excelJson = {
			fileName:pollObj.pollTitle+'#'+dateToString(new Date()),
			title:[
				{value:"参与者名称", type:"ROW_HEADER", datatype:"string"},
		        {value:"参与者邮箱", type:"ROW_HEADER", datatype:"string"},
		        {value:"本投票不适合此参与者", type:"ROW_HEADER", datatype:"string"},
		        {value:"参与时间", type:"ROW_HEADER", datatype:"string"},
		        {value:"参与者所在IP", type:"ROW_HEADER", datatype:"string"}
			],
			data:[]
		};
		var pollOptionsArray = pollObj.pollOptions.split('#');
		var pollOptionsNum = pollOptionsArray.length;
		for(var i = 0;i < pollOptionsNum;i++){
			excelJson.title.push({value:"投票选项："+pollOptionsArray[i], type:"ROW_HEADER", datatype:"string"});
		}
		        
		
		var partInNum = pollAnsheetObj.ansNum;
		var partInPeople = pollAnsheetObj.pollAnsheet;
		for(var i = 0;i < partInNum;i++){
			var rowArray = [
				{value:partInPeople[i].fillName,type:"ROW_DATA"},
				{value:partInPeople[i].fillEmail,type:"ROW_DATA"},
				{value:partInPeople[i].fillNosuit=="0" ? "适合" : "不适合",type:"ROW_DATA"},
				{value:partInPeople[i].fillTime,type:"ROW_DATA"},
				{value:partInPeople[i].fillIp,type:"ROW_DATA"}
			];
			
			var fillOptions = partInPeople[i].fillOption.split('#');
			for(var j = 0,k = 0;j < pollOptionsNum;j++){
				if(j == parseInt(fillOptions[k])){
					rowArray.push({value:1,type:"ROW_DATA"});
					k++;
				}else{
					rowArray.push({value:0,type:"ROW_DATA"});
				}
				
			}
			excelJson.data.push(rowArray);
		}
		jsonToExcelConverter(excelJson);
		
	})
	
}
//https://www.cnblogs.com/--cainiao/p/9999170.html
//https://blog.csdn.net/Frank_YLL/article/details/78544750
function jsonToExcelConverter(jsonObj){
	var excelJson = typeof jsonObj != "object" ? JSON.parse(jsonObj) : jsonObj;
	
	var excel = new StringBuffer();
	excel.append('<table>');
 
	//设置表头
	var title = excelJson.title;
	var titleLen = title.length;
	var row = new StringBuffer();
	row.append("<tr>");
	for (var i = 0; i < titleLen; i++) {
        row.append("<td>" + title[i].value + "</td>");
	}
	
	//换行
	excel.append(row.toString());
	excel.append("</tr>")
	
	//设置数据
	var partInPeople = excelJson.data;
	var partInNum = partInPeople.length;
	for (var i = 0; i < partInNum; i++) {
	    var row = new StringBuffer();
		row.append("<tr>");
		var tmpLen = partInPeople[i].length;
		for(var j = 0;j < tmpLen; j++){
		    row.append('<td>' + partInPeople[i][j].value + '</td>');
		}
		excel.append(row.toString());
		excel.append("</tr>")
	}
	excel.append("</table>");
	
	var excelFile = new StringBuffer();
	excelFile.append("<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>");
	excelFile.append('<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">');
	excelFile.append('<meta http-equiv="content-type" content="application/vnd.ms-excel');
	excelFile.append('; charset=UTF-8">');
	excelFile.append("<head>");
	excelFile.append("<!--[if gte mso 9]>");
	excelFile.append("<xml>");
	excelFile.append("<x:ExcelWorkbook>");
	excelFile.append("<x:ExcelWorksheets>");
	excelFile.append("<x:ExcelWorksheet>");
	excelFile.append("<x:Name>");
	excelFile.append("{worksheet}");
	excelFile.append("</x:Name>");
	excelFile.append("<x:WorksheetOptions>");
	excelFile.append("<x:DisplayGridlines/>");
	excelFile.append("</x:WorksheetOptions>");
	excelFile.append("</x:ExcelWorksheet>");
	excelFile.append("</x:ExcelWorksheets>");
	excelFile.append("</x:ExcelWorkbook>");
	excelFile.append("</xml>");
	excelFile.append("<![endif]-->");
	excelFile.append("</head>");
	excelFile.append("<body>");
	excelFile.append(excel.toString());
	excelFile.append("</body>");
	excelFile.append("</html>");
	 
	 
	var uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile.toString());
	
//	window.open(uri, '_blank'); // 新开窗口下载，不能设置名称，换下面的方式
	var link = document.createElement("a");
	link.href = uri;
	 
	link.style = "visibility:hidden";
	link.download = excelJson.fileName + ".xls";
	 
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

//模态框动态效果

function rotatePollModalArrow(){
	var show = false;
	var $arrow = $(".modal-body .chart-option .option-select .option-arrow");
	var deg = 0;
	var speed = 10;
	function rotate(){
		if(!show)
        	deg = deg + speed;
    	else
			deg = deg - speed;
        $arrow.animate({},function(){
            $(this).css({
                "transform":"rotateZ("+deg+"deg)",
                "-ms-transform":"rotateZ("+deg+"deg)",
                "-moz-transform":"rotateZ("+deg+"deg)",
                "-webkit-transform":"rotateZ("+deg+"deg)",
                "-o-transform":"rotateZ("+deg+"deg)"
            })
        })
        if(deg==180){
			show = true;//设置为true，此时箭头向下，下拉菜单点开
            return;
        }
        if(deg==0){
			show = false;//设置为false,此时箭头向上，下拉菜单关闭
        	return;
        }

        setTimeout(function(){
            rotate();
        },1);
    }
	$(".modal-body .chart-option .option-select select").on({
		"click":function(){
			if(!show){//如果为false，即箭头向上，下拉菜单没点开
				rotate();//进行旋转
			}else{//否则为true，箭头向下，下拉菜单点开
				rotate();//进行旋转
			}
		},
		"blur":function(){
			if(show){//如果箭头向下，下拉菜单点开
				rotate();
			}
		}
	})
}
		
		//拖动模态框
function dragPollModal(){
	var startX;
	var startY;
	var moveSwitch = false;
	var currentLeft;
	var currentTop;
	var $pollModal = $(".data-modal")
	var pollModal = $pollModal[0];
	var pollModalMarginLeft = parseFloat($pollModal.css('marginLeft'));//设置的百分比，得到的是实际数值

//			var bodyWidth = $(document.body).width();
//			var percentRate = parseFloat(pollModalMarginLeft)/parseFloat(bodyWidth);
//			var offset = bodyWidth * percentRate;

	$(document).on("mousemove",function(e){
		if(moveSwitch){　　　　　　　　　//类似于if(true);　　　　　　　　　　　　　　　
			var x = e.clientX;　　　　　　　　//e.clientX是一个触摸事件，即是鼠标点击时的X轴上的坐标
			var y = e.clientY;　　　　　　　　//e.clientY是一个触摸事件，即是鼠标点击时的Y轴上的坐标
			var distanceX = x-startX;　　　　//X轴上获得移动的实际距离
			var distanceY = y-startY;　　　　　//Y轴上获得移动的实际距离
			pollModal.style.left = (currentLeft+distanceX - pollModalMarginLeft)+"px";　　//currentLeft下面的方法会有解释，需要注意最后要添加PX单位，如果给left赋值会破坏文档流，不加单位就会无效
			pollModal.style.top = (currentTop+distanceY)+"px";　　//
		}
		
	})	
	$(".modal-title").on({
		"mousedown":function(e){
			e = e?e:window.event;　　　　//因为兼容问题，event可能在隐藏参数中，如果隐藏参数没有event事件，则可以使用全局的事件window.event（大家记住写法就可以了）
			moveSwitch = true;
			startX = e.clientX;
			startY = e.clientY;
			currentLeft = pollModal.offsetLeft;　　//通过对象获取对象的坐标
			currentTop = pollModal.offsetTop;
		},
		"mouseup":function(e){
			moveSwitch = false;
		}
	})
	
}