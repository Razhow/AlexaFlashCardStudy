import datetime, time
import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']
credentials = ServiceAccountCredentials.from_json_keyfile_name('dicedata-e5b83094bcf6.json', scope) 
client = gspread.authorize(credentials)
sheet = client.open("Terninger").sheet1
 

def sendData(data):
    time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S') #%f

    sheet.update('B2',data)
    sheet.update('A2',time)
