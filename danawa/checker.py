import config
import datetime

import smtplib
from email.mime.text import MIMEText


#######SQLITE 접속#################
import sqlite3
mydb = sqlite3.connect(config.homepath+'danawa.db')
mycursor = mydb.cursor()

today = datetime.date.today().strftime('%Y-%m-%d')

title_price = mycursor.execute("""SELECT count(*) FROM TITLE_PRICE where record_date = '{}'""".format(today)).fetchone()[0]
if(title_price != 181) :
    error_msg = "game-price-crawler {} title_price = {}".format(today, title_price)
    smtp = smtplib.SMTP('smtp.gmail.com', 587)
    smtp.ehlo()      # say Hello
    smtp.starttls()  # TLS 사용시 필요
    smtp.login('game.price.crawler', 'game-price12#$')

    msg = MIMEText(error_msg,'html')
    msg['Subject'] = 'game-price-crawler event'
    msg['To'] = 'kjh15011@gmail.com'
    smtp.sendmail('game.price.crawler@gmail.com', ['kjh15011@gmail.com'], msg.as_string())

    smtp.quit()
    print(error_msg)
else: print("{} : ok".format(today))