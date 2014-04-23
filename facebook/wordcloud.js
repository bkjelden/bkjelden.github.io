var WordCloud = WordCloud || (function(){
	var statuses = [];
	var activeDelegates = [];
	var wordsInCloud = [];
	var maxWordCount = 0;
	var fill = d3.scale.category20();
	var setStatuses = function(_statuses){
		statuses = _statuses;
		updateCloud();
		setupCloud();
	};
	
	var updateCloud = function(){
		var wordCounts = {};
		var wordCountsArray = [];
		for(var i in statuses){
			var passed = true;
			for(var del in activeDelegates){
				if(!activeDelegates[del](statuses[i])){ //delegate check failed
					passed = false;
					break;
				}
			}
			if(passed){
				var statusWords = statuses[i].message.match(/[a-z]{5,}/gim);
				for(var j in statusWords){
					var word = statusWords[j].toUpperCase();
					if(wordCounts[word] === undefined){
						wordCounts[word] = 1;	
					}else{
						wordCounts[word]++;
					}
				}
			}
		}
		
		for(var word in wordCounts){
			wordCountsArray.push({ text: word, size: wordCounts[word] });
		}
		wordsInCloud = wordCountsArray.sort(function(a,b){ return b.size - a.size; }).slice(0,250);
		maxWordCount = wordsInCloud[0].size;
	};
	
	var setupCloud = function(){
		d3.layout.cloud().size([1140,900]).words(wordsInCloud)
			.rotate(function() { return (~~(Math.random() * 12) * 15) - 90; })
			.fontSize(function(d) { return parseInt("" + (Math.sqrt(d.size)*80) / Math.sqrt(maxWordCount)) + 20; })
			.font("Impact")
			.on("end", drawCloud).start();
	};
	
	var drawCloud = function(words){
		$("#content-container").empty();
		d3.select("#content-container").append("svg")
			.attr("width", 1140).attr("height", 900)
			.append("g")
			.attr("transform", "translate(570,450)")
			.selectAll("text")
			.data(words)
			.enter().append("text")
			.style("font-size", function(d) { return d.size + "px"; })
			.style("font-family", "Impact")
			.style("fill", function(d, i) { return fill(i); })
			.attr("text-anchor", "middle")
			.attr("transform", function(d) {
				return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			})
			.text(function(d) { return d.text; });
		$("#word-cloud-form").css("visibility", "visible");
		var beforeTime = $("#before-time").data("DateTimePicker");
		beforeTime.setMinDate(new Date((statuses[0].created_time + 1)*1000));
		beforeTime.setDate(new Date(statuses[0].created_time*1000));
		var endTime = $("#after-time").data("DateTimePicker");
		endTime.setMinDate(new Date((statuses[statuses.length - 1].created_time - 1)*1000));
		endTime.setDate(new Date(statuses[statuses.length - 1].created_time*1000));
	};
	
	$("#filter").click(function(){
		
	});
	$("#before-time").datetimepicker();
	$("#after-time").datetimepicker();
	return {
		setStatuses: setStatuses
	}
})();
