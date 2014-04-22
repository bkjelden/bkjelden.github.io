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
		wordsInCloud = wordCountsArray.sort(function(a,b){ return b.size - a.size; }).slice(0,50);
		maxWordCount = wordsInCloud[0].size;
	};
	
	var setupCloud = function(){
		d3.layout.cloud().size([1140,1140]).words(wordsInCloud)
			.rotate(function() { return ~~(Math.random() * 12) * 15; })
			.fontSize(function(d) { return parseInt("" + (Math.sqrt(d.size)*80 / Math.sqrt(maxWordCount)) + 20; })
			.font("Impact")
			.on("end", drawCloud).start();
	};
	
	var drawCloud = function(words){
		d3.select("#word-cloud").append("svg")
			.attr("width", 1140).attr("height", 1140)
			.append("g")
			.attr("transform", "translate(150,150)")
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
		setStatuses: setStatuses
	}
})();
