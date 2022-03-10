const Alexa = require('ask-sdk-core');
const {
  getRequestType,
  getIntentName,
  getSlotValue,
  getDialogState,
} = require('ask-sdk-core');

const fs = require('fs');

var word = "";
var tentativas = 0;

// arquivo de áudio para silencio entre pergunta e resposta
// const silence = '<audio src="./silence.mp3" />';
const silence = '';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        tentativas = 0;
        
        var result = 'Olá! Vamos começar o wordle! Vou gerar uma palavra aleatória de 5 letras e você terá que adivinhar a palavra... Podemos começar?';
        
        const speakOutput = result.toString();

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};

const YesRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PositiveIntent';
    },
    handle(handlerInput) {
        var data = fs.readFileSync("./words.txt", 'utf8');
        word = data.split("\n")[Math.floor(Math.random() * 955)]
        
        console.log(word);
        var result = word;
        
        const speakOutput = 'A palavra foi gerada... Qual o seu palpite?' + silence;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt()
            .getResponse();
    }
};

const GameLoopHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GameLoopIntent';
    },
    handle(handlerInput) {
        var input = getSlotValue(handlerInput.requestEnvelope, 'guess');
        
        if(input === "pedro"){
            tentativas = -100
            return handlerInput.responseBuilder
                .speak('Modo debug ativado! ' + silence)
                .reprompt()
                .getResponse();
        }
        
        if(input.length > 5){
            return handlerInput.responseBuilder
                .speak('Esta palavra tem mais de 5 letras. Tente novamente!' + silence)
                .reprompt()
                .getResponse();
        }
        
        if(tentativas >= 5){
            tentativas = 0;
            return handlerInput.responseBuilder
                .speak('Suas tentativas se esgotaram! A palavra era ' + word + '... Deseja jogar novamente?')
                .reprompt()
                .getResponse();
        }
        
        var letrasEmPosicoesDiferentes = [];
        var letrasEmPosicoesIguais = [];
        
        for(var i = 0; i < input.length; i++){
            for(var j = 0; j < input.length; j++){
                if(input[i] === word[j]){
                    letrasEmPosicoesDiferentes.push(input[i])
                }
                
                if(input[i] === word[j] && i === j){
                    letrasEmPosicoesIguais.push(input[i])
                }
            }
        }
        
        for(var m = 0; m < letrasEmPosicoesDiferentes.length; m++){
            for(var n = 0; n < letrasEmPosicoesIguais.length; n++){
                if(letrasEmPosicoesDiferentes[m] === letrasEmPosicoesIguais[n]){
                    letrasEmPosicoesDiferentes.splice(m, 1)
                }
            }
        }
        
        if(letrasEmPosicoesIguais.length >= 5){
            tentativas = 0;
            
            return handlerInput.responseBuilder
                .speak('Você acertou! A palavra era ' + word + '...' +  'Deseja jogar novamente?')
                .reprompt()
                .getResponse();
        }
        
        const speakOutput = 'Seu palpite é ' + input
        
        if(letrasEmPosicoesDiferentes.length === 0 && letrasEmPosicoesIguais.length === 1){
            return handlerInput.responseBuilder
                .speak(speakOutput + '... Você não acertou nenhuma letra... Dê outro palpite...')
                .reprompt()
                .getResponse();
        }
        
        var letrasDiferentesOutput = letrasEmPosicoesDiferentes.length > 0 ? '... As letras ' + letrasEmPosicoesDiferentes.join(" ... ") + '... estão em lugares diferentes.' : '';
        var letrasIguaisOutput = letrasEmPosicoesIguais.length > 0 ? '... As letras ' + letrasEmPosicoesIguais.join(" ... ") + '... estão nos lugares corretos.' : '';
        
        tentativas++;
        
        if(tentativas >= 5){
            tentativas = 0;
            return handlerInput.responseBuilder
                .speak('Suas tentativas se esgotaram! A palavra era ' + word + '... Deseja jogar novamente?')
                .reprompt()
                .getResponse();
        }

        return handlerInput.responseBuilder
            .speak(speakOutput + " " + letrasDiferentesOutput + letrasIguaisOutput + `... Você possui ${5 - tentativas} tentativas restantes.` + silence)
            .reprompt()
            .getResponse();
    }
};


const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá mundo';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('O que deseja fazer?')
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
        const speakOutput = 'Até a próxima!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const NegativeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NegativeIntent'
    },
    handle(handlerInput) {
        const speakOutput = 'Até a próxima!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Eu não entendi o que você deseja...';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

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

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
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
        const speakOutput = `Ocorreu um erro: ${JSON.stringify(error)}`;
        console.log();

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        YesRequestHandler,
        GameLoopHandler,
        HelloWorldIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        NegativeIntentHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
