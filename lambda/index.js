/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
 //remember to include in package.json
const Alexa = require('ask-sdk-core');
const { debug } = require('console');
const axios = require('axios');
const randomMsg = require('./messages.js');
 


//global variables used in game
let gameBegun = false;
let questionAsked = false;
let nextPlayer;
var dice;
let firstRoll = true;
let diceRegonizer = false;

//Question and answer
let questionIndex;
let currentQuestion = "";
let currentAnswer = "";
let totalQuestions;

//Only used if winner function is enabled
let winnerArray; 

//API for google sheet documents - Include https://sheets.googleapis.com/v4/spreadsheets/ + sheet id + /values/ + sheetname ? + api key
const contentX = "https://sheets.googleapis.com/v4/spreadsheets/1Z7foYz_5No5rCJwkut7bBG2OQYgEMEU5ODZYJ67klkc/values/'ContentX'?key=" + apiKey;
const contentY = "https://sheets.googleapis.com/v4/spreadsheets/1Z7foYz_5No5rCJwkut7bBG2OQYgEMEU5ODZYJ67klkc/values/'ContentY'?key=" + apiKey;
const diceID = "https://sheets.googleapis.com/v4/spreadsheets/1GhIuXgvov1nZ1Qz0XshtBApsxNM30hGUGn3w4CeOasA/values/'Ark1'?key=" + apikey";
const apiKey = "";

//global arrays, the sheetdata and the array for storing players points.
let sheetData;
var playerScoreBoard;
let diceData;


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        
        await getRemoteData(contentY)
                .then((response) => {
                  const data = JSON.parse(response);
                  console.log(data.values);
                  sheetData = data.values;
                })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
               
              });
              
          
        //Initizizing of start variables, to reset them
        gameBegun = false;
        questionAsked = false;
        nextPlayer = 0;
        totalQuestions = sheetData.length
        firstRoll = true;
        questionIndex = 0;
        // shuffles the array to get random order
        sheetData = shuffleMatrix(sheetData);
        //Welcome message
        const speakOutput = 'Hello! Welcome to the flashcard game, I will walk you through a sheet of flashcards, the player with the most points win! how many people are playing?' ;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
            
    
    }

};
//the function that shuffles the sheet array by rows
function shuffleMatrix(matrix){
     for(let i = matrix.length-1; i > 0; i--){
          const j = Math.floor(Math.random() * i)
          const temp = matrix[i]
          matrix[i] = matrix[j]
          matrix[j] = temp
     }
     return matrix;
}
//Responible for recognizing numbers.
const NumberIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NumberOfPlayerIntent' 
        && gameBegun === false;
    },
    handle(handlerInput) {
        
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const number = slots['numberAnswer'].value;
        let speakOutput = 'You are ' + number + " players playing, can you confirm?";
        questionAsked = true;
       
        var scoreboard = new Array(number);
        playerScoreBoard = scoreboard;
        for(var i = 0; i < number; i++){
        playerScoreBoard[i] = 0;
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};


const YesNoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
        && gameBegun === false
        && questionAsked === true
        
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent' 
        && gameBegun === false
        && questionAsked === true;
    },
    handle(handlerInput) {
        
        let speakOutput = "test";
        
        if(handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent'){
            gameBegun = true;
            speakOutput = "Okay great, let the game begin. Player " + (nextPlayer +1) + " roll the dice, say done when you have rolled";
            
        }
        else {
            speakOutput = "Okay, how many people are you playing then?";
            
        }
        
        questionAsked = false;
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
            
    }
};


//Gets triggered when u have rolled, "respons to the messages "Done" "Finish" "I have rolled" etc.
const RollIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DoneIntent'
        
        
    },
    async handle(handlerInput) {
    
    //fecthes dice data
	if(diceRegonizer == true) {
        await getRemoteData(diceID)
                .then((response) => {
                  const data = JSON.parse(response);
                  dice = parseInt(data.values[1][1]);
                })
            .catch((err) => {
                console.log(`ERROR: ${err.message}`);
               
              });
			  
	}
	else{
		
		dice = Math.floor(Math.random() * 11) + 2;
	}
        
        let speakOutput;
    if(questionIndex < totalQuestions)
       if(firstRoll === true) {
            speakOutput = "Okay u rolled " + dice + ". The question is for " + dice + " points. " + "The term is: " + sheetData[questionIndex][0] + ". say: the answer is: followed by your answer";
            questionAsked = true;
            firstRoll = false;
            currentQuestion = sheetData[questionIndex][0];
            currentAnswer = sheetData[questionIndex][1];
        
       }
        else
        {
            speakOutput = "Okay u rolled " + dice + ". The question is for " + dice + " points. " + "The term is: " + sheetData[questionIndex][0];
            questionAsked = true;
            currentQuestion = sheetData[questionIndex][0];
            currentAnswer = sheetData[questionIndex][1];
        }
    else{
        
        
        shuffleMatrix(sheetData);
        questionIndex = 0;
        speakOutput = "Okay u rolled " + dice + ". The question is for " + dice + " points. " + "The term is: " + sheetData[questionIndex][0];
        questionAsked = true;
        currentQuestion = sheetData[questionIndex][0];
        currentAnswer = sheetData[questionIndex][1];
        
    }    
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("test")
            .getResponse();
            
    }
   
};

// For repeating the question
const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent'
            && questionAsked === true;
    },
    async handle(handlerInput) {
        const speakOutput = "The question is. " + currentQuestion;
       
    
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};

const PassIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PassIntent'
            && questionAsked === true;
    },
    async handle(handlerInput) {
        let speakOutput = "You've passed, alright! the correct answer was: " + currentAnswer;
       choosePlayer();
       questionIndex++;
       speakOutput  += ". Player" + (nextPlayer + 1) + "'s turn, roll the dice say done when you have rolled "
        questionAsked = false;
    
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};


const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent'
        && gameBegun === true
        && questionAsked === true
    },
    handle(handlerInput, error) {
      
        let spokenValue = getSpokenValue(handlerInput.requestEnvelope, "answer");
        
        let resolvedValues = getResolvedValues(handlerInput.requestEnvelope, "answer");
        
         let speakOutput = "";
         
         //if alexa recognizies "answer"
        if(resolvedValues !== undefined){
             if(resolvedValues[0].value.name === currentAnswer) {
                speakOutput =  `${randomMsg.getRandomCorrect(currentAnswer)} You've gained ${dice} points. and now have a total off ${playerScoreBoard[nextPlayer] + dice} points!`;
                playerScoreBoard[nextPlayer] += dice;
                choosePlayer();
                speakOutput +=  ". Player" + (nextPlayer + 1) + "'s turn, roll the dice say done when you have rolled ";
                questionAsked = false;
             }
             else {
                 speakOutput = randomMsg.getRandomIncorrect(currentAnswer);
                 questionAsked = false;
                 choosePlayer();
                 speakOutput +=  ". Player" + (nextPlayer + 1) + "'s turn, roll the dice say done when you have rolled ";
             }
       
        }
        else {
            speakOutput = randomMsg.getRandomIncorrect(currentAnswer);
            choosePlayer();
             speakOutput +=  ". Player" + (nextPlayer + 1) + "'s turn, roll the dice say done when you have rolled ";
            questionAsked = false;
            
        }
        questionIndex++;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
            
    }
};


//Calls to get nextplayer
function choosePlayer(){
    if(nextPlayer < playerScoreBoard.length -1){
        nextPlayer++;
    }
    else{
        nextPlayer = 0;
    }
   
}

//Only used for localhost
const sendGetRequest = async () => {
    try{
        const resp = await axios.get('http://192.168.46.151:5000/cameradice');
        }
    catch(error) {
            console.error(error);      
    }
};


//for fecthing data via url
const getRemoteData = (url) => new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed with status code: ${response.statusCode}`));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err));
  });
    

const getDiceData = async () =>
{
    await sendGetRequest();
        await getRemoteData('http://192.168.46.151:5000/diceresult')
            .then((response) => {
            const data = JSON.parse(response);
            console.log(data);
            diceData = data;
            })
        .catch((err) => {
             console.log(`ERROR: ${err.message}`);
   
        });
        return(diceData);     
}


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'What can i help you with?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye! Thanks for playing';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Please give a valid input`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = "There was an error"
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



function getResolvedValues(envelope, slotName) {
  if (envelope &&
    envelope.request &&
    envelope.request.intent &&
    envelope.request.intent.slots &&
    envelope.request.intent.slots[slotName] &&
    envelope.request.intent.slots[slotName].resolutions &&
    envelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority &&
    envelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0] &&
    envelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values) {
    return envelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values;
  }
  else return undefined;
}
//Generates random interger.
function GetRandomInt(max) {
    
let random = Math.floor(Math.random()*max);
return random;
}

//Respons to "score" "who is winning" etc. (makes alexa say the scoreboard)
const ScoreIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ScoreIntent'
            && gameBegun === true;
    },
    async handle(handlerInput) {
        let speakOutput = "";
        
        for(let i = 0; i < playerScoreBoard.length; i++){
            speakOutput += "Player " + (i+1) + "have " + playerScoreBoard[i] + "points. ";
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};



/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ScoreIntentHandler,
        RepeatIntentHandler,
        PassIntentHandler,    
        AnswerIntentHandler,
        RollIntentHandler,
        YesNoIntentHandler,
        NumberIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();