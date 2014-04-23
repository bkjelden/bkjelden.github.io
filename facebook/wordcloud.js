var WordCloud = WordCloud || (function(){
	var statuses = [];
	var activeDelegates = {};
	var wordsInCloud = [];
	var maxWordCount = 0;
	var fill = d3.scale.category20();
	
	var initialize = function(_statuses, _names){
		statuses = _statuses;
		$("#filter").click(filterClick);
		$("#before-time").datetimepicker();
		$("#after-time").datetimepicker();
		$("#posted-by").append($("<option>", { value: "-1" }).text("Everyone"));
		for(var i in _names){
			$("#posted-by").append($("<option>", { value: _names[i].uid }).text(_names[i].name));	
		}
		$("#word-cloud-form").css("visibility", "visible");
		
		var beforeTime = $("#before-time").data("DateTimePicker");
		beforeTime.setMaxDate(new Date((parseInt(statuses[0].created_time) + 1)*1000));
		beforeTime.setDate(new Date(parseInt(statuses[0].created_time)*1000));
		var endTime = $("#after-time").data("DateTimePicker");
		endTime.setMinDate(new Date((parseInt(statuses[statuses.length - 1].created_time) - 1)*1000));
		endTime.setDate(new Date(parseInt(statuses[statuses.length - 1].created_time)*1000));
		
		updateCloud();
	};
	
	var filterClick = function(){
		var beforeTimeStamp = (new Date($("#before-time").data("DateTimePicker").getDate())).getTime()/1000;
		activeDelegates.beforeTime = function(status){
			return parseInt(status.created_time) < beforeTimeStamp;
		};
		var afterTimeStamp = (new Date($("#after-time").data("DateTimePicker").getDate())).getTime()/1000;
		activeDelegates.afterTime = function(status){
			return parseInt(status.created_time) > afterTimeStamp;
		};
		var postedByVal = $("#posted-by :selected").val();
		if(postedByVal != "-1"){
			activeDelegates.postedBy = function(status){ 
				return status.actor_id == postedByVal;
			};
		}else{
			activeDelegates.postedBy = function(){ return true; };
		}
		updateCloud();	
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
				var statusWords = statuses[i].message.match(/[a-z]{5,}/gim);//words under 5 characters tend to be not very interesting ('the', 'it', 'what', etc)
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
		wordsInCloud = wordCountsArray.sort(function(a,b){ return b.size - a.size; });
		if(wordsInCloud.length > 250){ //it's not likely the word cloud will even be able to fit 250 words on the screen, but if the list is larger than this, cut it down to speed rendering up
		wordsInCloud = wordsInCloud.slice(0,250);
		}
		
		if(wordsInCloud.length > 0){
			maxWordCount = wordsInCloud[0].size;
			d3.layout.cloud().size([1140,900]).words(wordsInCloud)
				.rotate(function() { return (~~(Math.random() * 12) * 15) - 90; }) //-90 degrees to 90 degrees in 15 degree steps
				.fontSize(function(d) { return parseInt("" + (Math.sqrt(d.size)*100) / Math.sqrt(maxWordCount)) + 10; }) //sqrt should give us a wider distribution of font sizes
				.font("Impact")
				.on("end", drawCloud).start();
		}else{
			$("#content-container").empty();
			$("#content-container").append('<h1 class="text-center">No words longer than 5 characters found, try again!</h1>');
		}
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
	};
	return {
		initialize: initialize
	}
})();
