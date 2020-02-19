from urllib.parse import urljoin
from selenium import webdriver
from datetime import datetime, timedelta
import random
import time
import json
import config
import sqlite3
import os

mydb = sqlite3.connect(config.project_path+'danawa.db')
mycursor = mydb.cursor()

def login():
  driver.get('https://nid.naver.com/nidlogin.login')
  driver.execute_script("document.getElementsByName('id')[0].value=\'" + config.naver_id + "\'")
  driver.execute_script("document.getElementsByName('pw')[0].value=\'" + config.naver_pw + "\'")

  driver.find_element_by_xpath('//*[@id="frmNIDLogin"]/fieldset/input').click()
  driver.implicitly_wait(random.randrange(4, 6))

def crawl(keyword):
  print('searching ...  "' + keyword + '"')

  driver.get('https://www.naver.com')
  driver.get('https://m.cafe.naver.com/ArticleSearchList.nhn?search.query=' + keyword + '&search.menuid=&search.searchBy=1&search.sortBy=date&search.clubid=10050146&search.option=0&search.defaultValue=')
  driver.implicitly_wait(5)
  
  post_list = []
  yesterday = (datetime.today() - timedelta(1)).strftime('%y.%m.%d.')

  try:
    driver.find_element_by_css_selector('#moreButtonArea > div > a').click()
    driver.implicitly_wait(5)
  except:
    print('There are no more button')

  listing = True
  while listing:
    try:
      driver.find_element_by_css_selector('#moreButton').click()
      time.sleep(3)
    except:
      print('There are no more button')
      break

    post_list_elements = driver.find_elements_by_class_name('list_tit')

    for pl in post_list_elements:
      dates = pl.find_elements_by_css_selector('#articleList > ul > li > div > a > div > span.time > em')
      for d in dates:
        if d.text < yesterday:
          listing = False
          print('-- found all the posts that came out ' + yesterday)
          break
  
  post_list_elements = driver.find_elements_by_class_name('list_tit')
  for pl in post_list_elements:
    a_tags = pl.find_elements_by_css_selector('#articleList > ul > li > a')
    dates = pl.find_elements_by_css_selector('#articleList > ul > li > div > a > div > span.time > em')
    for i in range(len(a_tags)):
      a = a_tags[i]
      date = dates[i].text
      
      url = a.get_attribute('href')
      title = a.find_element_by_class_name('tit').text.replace('New', '').strip()
      
      status = title[:2]
      title = title[2:]

      if title[:5] == '[공식앱]' or date != yesterday or (status != '판매' and status != '완료'):
        continue

      post_list.append({
        'status': status.strip(),
        'title': title.strip(),
        'url': url,
      })

  print('counts: ' + str(len(post_list)) + "\n")
    
  for post in post_list:
    driver.get(post['url'])
    driver.implicitly_wait(random.randrange(1, 5))
    time.sleep(1)

    try:
      price_element = driver.find_element_by_css_selector('#ct > div.post > h4 > span.price > em')
      nickname_element = driver.find_element_by_css_selector('#ct > div.post > ul > li:nth-child(3) > p > a:nth-child(1) > span > span.nickname > span')
      datetime_element = driver.find_element_by_css_selector('#ct > div.post > div.post_info > span.board_time > span:nth-child(1)')
      
      post['price'] = int(price_element.get_attribute('textContent').replace(',', '').strip())
      post['nickname'] = nickname_element.get_attribute('textContent').strip()
      post['date'] = datetime_element.get_attribute('textContent').strip()[:10].replace('.', '-')
      post['time'] = datetime_element.get_attribute('textContent').strip()[12:]
    except:
      print('failed to get info in detail page: ' + post['url'])

  return post_list

def get_title_list():
  title_list = []

  db_title_list = mycursor.execute("""
    select title_name from PS4_TITLE_INFO
  """).fetchall()

  for title in db_title_list:
    title_list.append(title[0])

  return title_list

if __name__ == '__main__':
  options = webdriver.ChromeOptions()
  options.add_argument('headless')
  options.add_argument("disable-gpu")
  options.add_argument("User-Agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
  
  driver = webdriver.Chrome(config.chromedriver_path+'chromedriver', chrome_options=options)
  
  login()

  yesterday = (datetime.today() - timedelta(1)).strftime('%y%m%d')
  title_list = get_title_list()
  console = 'PS4'
  for name in title_list:
    file_name = console + '-' + yesterday + '-' + name.replace(' ', '') + '.json'
    file_path = "output/joongonara/" + file_name
    empty_file = False
    with open(file_path, 'w', encoding='utf8') as json_file:
      print('file: ' + file_name)
      result = crawl(console + ' ' + name)
      json.dump(result, json_file, ensure_ascii=False)
      if len(result) == 0:
        empty_file = True
    
    if empty_file:
      os.remove(file_path)

  driver.quit()
