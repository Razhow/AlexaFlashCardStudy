# AlexaFlashCardStudy

To use the Alexaflashcard study follow these steps:


1. Go to index.js and provide the variable contextY with your own public google sheets document link. 
Your google sheets should consist of 2 columns. column 1 containing questions/definition and column 2 containing answers.
2. Fill in your google sheet api in the apikey variable.
3. optional (Fill in your own custom alexa responses in message.js).
4.  Open the interaction model, and provide alexa with the answer column in the slot called answer.


The dice reconnizr is turned off by default if you want to enable it follow these steps:
1. Set the diceRecognizer variable to "true"
2. Create a Google Cloud Account and create a project
3. Download your Service Account Credentials file and save it to your directory
4. Enter the file name as the parameter to the credentials variable in GoogleApi.py
5. Create a google sheet file and enter the name as the parameter to the sheet variable.
