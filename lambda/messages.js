var getRandomCorrect = (answer) => {
    
    var questions = [`You're right, ${answer} is the correct answer.`, 
    `${answer} is right. Great job!`, 
    `${answer} was the right answer. You've obviously researched alot!`,
    `${answer} was correct. You're getting good at this!`, 
    `Go you! ${answer} is what I was looking for!`, 
    `${answer} is right! You really know your stuff.`,
    `Correct! ${answer} is indeed the right answer.`];
    var random = getRandom(0, questions.length-1);
    return "<break time='.5s'/>" + questions[random]; 
    
}

var getRandomIncorrect = (rightAnswer) => {
    var questions = [`Nope! that wasn't right, the answer was ${rightAnswer}`, 
    `Sorry it is not the right answer I have here, the right answer was ${rightAnswer}`, 
    `That was wrong, think harder next time, the right answer was ${rightAnswer}`, 
    "This isn't your finest hour is it? " + `your answer was incorrect. the right answer was ${rightAnswer}`];
    var random = getRandom(0, questions.length-1);
    return "<break time='.5s'/>" + questions[random]; 
};




function getRandom(min, max) {
    
    
    return Math.floor(Math.random() * (max-min+1)+min);
}

function test(){
    
    return "Hi";
}

module.exports = {
    getRandomCorrect,
    getRandomIncorrect,
    test
    
    
}
