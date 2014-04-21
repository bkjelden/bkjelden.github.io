var WordCloud = WordCloud || (function(){
	var statuses = [];
	var activeDelegates = [];
	var wordsInCloud = [];
	var setStatuses = function(_statuses){
		statuses = _statuses;
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
			wordCountsArray.push({ word: word, count: wordCounts[word] });
		}
		
		wordCountsArray.sort(function(a,b){ return b.count - a.count; });
		console.log(wordCountsArray.slice(0,100));
	};
	
	return {
		setStatuses: setStatuses
	}
})();
