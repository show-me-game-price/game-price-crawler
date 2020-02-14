# -*- coding: utf-8 -*-

import config

import warnings
import asyncio

from selenium import webdriver
from bs4 import BeautifulSoup


import json
import datetime
import time

warnings.filterwarnings('ignore')

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--remote-debugging-port=9222')  # 이 부분이 핵심
driver = webdriver.Chrome(config.homepath+'chromedriver', chrome_options=chrome_options)



######mysql 접속#########

# import mysql.connector
#
# mydb = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     # passwd="yourpassword",
#     database="test"
# )
#
# mycursor = mydb.cursor(buffered=True)
#######SQLITE 접속#################
import sqlite3
mydb = sqlite3.connect(config.homepath+'test_3.db')
mycursor = mydb.cursor()

######mysql 접속#########

def get_titleprice(tmp_value, platform):
    # ##prod_main_info
    # ##prod_info -> prod_name, prod_spec_set
    # ##prod_pricelist -> price_sect

    driver.implicitly_wait(5)
    driver.get(tmp_value['weblink'])
    driver.implicitly_wait(10)

    spec_list = driver.find_element_by_class_name("spec_list").text

    title_name = driver.find_element_by_class_name("prod_tit").text.split(" %s" % platform)[0]

    try:
        origin_price = int(spec_list.split("출시가: ")[1].split("원")[0].replace(',', ''))
    except Exception as ex: # 에러 종류
        print(title_name +" "+spec_list)
        print(ex) # ex는 발생한 에러의 이름을 받아오는 변수
        origin_price = None

    try:
        price = int(driver.find_element_by_class_name("lwst_prc").text.split("원")[0].replace(',', ''))
    except Exception as ex: # 에러 종류
        print(title_name +" "+tmp_value['price_list'])
        print(ex) # ex는 발생한 에러의 이름을 받아오는 변수
        price = None

    genre = spec_list.split("장르: ")[1].split(" / ")[0]
    made_info = driver.find_element_by_class_name("made_info").text.replace('\n', '')
    release_date = driver.find_element_by_class_name("made_info").find_element_by_class_name("txt").text.split(": ")[1].replace('.','-')
    manufacturer = driver.find_element_by_class_name("made_info").find_element_by_id("makerTxtArea").text.split(": ")[1]
    img_src = driver.find_element_by_class_name("photo_w").find_element_by_id("baseImage").get_attribute("src")

    output = {
        "record_date" : datetime.date.today().strftime('%Y-%m-%d'),
        "title_name" : title_name,
        "rank" : tmp_value['pop_rank'],
        "price" : price,
        "origin_price" : origin_price,
        "price_list" : tmp_value['price_list'],
        "genre" : genre,
        "spec" : spec_list,
        "release_date" : release_date,
        "manufacturer" : manufacturer,
        "made_info" : made_info,
        "img_src" : img_src
    }

    print(output)


    ############
    title_list_check = mycursor.execute("""SELECT title_name FROM {}_TITLE_INFO where title_name = '{}'""".format(platform,title_name)).fetchone()
    if title_list_check :
        # todo: id가 있으면 가져와서 저장, 없으면 생성
        # todo : id rule (autoencrement)
        sql = """UPDATE {}_TITLE_INFO set record_date = '{}', rank={}, price='{}', origin_price='{}', spec='{}', release_date='{}', 
                manufacturer='{}', made_info='{}', img_src='{}', weblink='{}' where title_name = '{}';
                """.format(platform,
                           output['record_date'], output['rank'], output['price'], output['origin_price'], output['spec'], output['release_date'],
                           output['manufacturer'], output['made_info'], output['img_src'], tmp_value['weblink'],
                           title_name)
        mycursor.execute(sql)

        mydb.commit()
    else :
        sql = """INSERT 
                INTO {}_TITLE_INFO (record_date, title_name, rank, price, origin_price, 
                spec, release_date, manufacturer, made_info, img_src, weblink) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """.format(platform)
        val = (output['record_date'], output['title_name'], output['rank'], output['price'], output['origin_price'],
               output['spec'], output['release_date'], output['manufacturer'], output['made_info'], output['img_src'], tmp_value['weblink'])
        mycursor.execute(sql, val)

        mydb.commit()
    title_id = mycursor.execute("""SELECT title_id FROM {}_TITLE_INFO where title_name = '{}'""".format(platform,title_name)).fetchone()[0]

    ###############
    ##todo: ID 값 추가
    ##todo : Insert or Ignore이 왜 되지 않는것인지 확
    sql = """INSERT 
            OR IGNORE 
            INTO {}_TITLE_PRICE (record_date, title_id, title_name, rank, price, origin_price, 
            price_list) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """.format(platform)

    val = (output['record_date'], title_id, output['title_name'], output['rank'], output['price'], output['origin_price'],
           output['price_list'])
    mycursor.execute(sql, val)

    mydb.commit()


    ############

    return output

def get_titlelist(platform, url):

    # ######mysql initialize#########
    # mycursor.execute("DROP TABLE IF EXISTS {}_TITLELIST".format(platform))
    #

    mycursor.execute("""
            CREATE TABLE IF NOT EXISTS {}_TITLE_INFO (
                record_date DATE,
                title_id INTEGER PRIMARY KEY AUTOINCREMENT,
                title_name VARCHAR(255),
                rank INT,
                price INT,
                origin_price INT,
                spec VARCHAR(511),
                release_date DATE,
                manufacturer VARCHAR(255),
                made_info VARCHAR(255),
                img_src VARCHAR(255),
                weblink VARCHAR(255),
                UNIQUE (title_id)
                )
        """.format(platform))

    mycursor.execute("""
            CREATE TABLE IF NOT EXISTS {}_TITLE_PRICE (
                record_date DATE,
                title_id INTEGER,
                title_name VARCHAR(255),
                rank INT,
                price INT,
                origin_price INT,
                price_list VARCHAR(255),
                UNIQUE (record_date,title_id)
                )
        """.format(platform))
    # ######END OF mysql 접속#########


    driver.implicitly_wait(5)
    driver.get(url)
    driver.implicitly_wait(5)
    # Select(driver.find_element_by_class_name('qnt_selector')).select_by_value('90')

    driver.find_element_by_xpath("//select[@class='qnt_selector']//option[@value='90']").click()
    time.sleep(1)
    driver.implicitly_wait(1)

    print("################################")
    print("%s ProductName List" % platform)
    ###########첫페이지 리스트업 Async###############
    prod_main_info_list = driver.find_elements_by_class_name("prod_main_info")

    result = []
    tmp_value = []
    ranking = 0
    for prod_main_info in prod_main_info_list :

        prod_info = prod_main_info.find_element_by_class_name("prod_info")
        prod_name = prod_info.find_element_by_class_name("prod_name")

        prod_pricelist = prod_main_info.find_element_by_class_name("prod_pricelist")
        price_list = prod_pricelist.text.replace('\n', ' ')

        ranking+=1
        try:
            pop_rank = int(prod_name.find_element_by_class_name("pop_rank").text)
        except Exception: # 에러 종류
            pop_rank = ranking

        # pop_rank = int(prod_name.find_element_by_class_name("pop_rank").text)
        productName = prod_name.find_element_by_name("productName")
        weblink = productName.get_attribute("href")

        tmp_value.append({'price_list' : price_list, 'pop_rank' : pop_rank, 'weblink' : weblink})

    for t in tmp_value :
        r = get_titleprice(t, platform)
        result.append(r)

    with open(config.homepath+"output/{}_result_{}.json".format(platform, datetime.date.today().strftime('%Y-%m-%d')), 'w') as outfile:
        json.dump(result, outfile, ensure_ascii=False, sort_keys=True, indent=4)

get_titlelist("PS4",'http://prod.danawa.com/list/?cate=19221773&15main_19_02')          # main이 끝날 때까지 기다림
get_titlelist("SWITCH",'http://prod.danawa.com/list/?cate=19227236')          # main이 끝날 때까지 기다림

driver.quit()
