import time
import sys
import json
import io
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager
from process import processing

# sys.stdout 인코딩을 UTF-8로 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def crawl_subject_texts(url):
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get(url)
    
    time.sleep(2)
    page_source = driver.page_source
    driver.quit()
    
    soup = BeautifulSoup(page_source, 'html.parser', from_encoding='utf-8')
    soup.encoding = 'utf-8'
    tablebody = soup.find(class_='tablebody')
    days={0:"월", 1:"화", 2:"수", 3:"목", 4:"금",5:"토",6:"일"}   
    subject_data = []
    if tablebody:
        tds = tablebody.find_all('td')
        for i in range(0, 7):
            
            classes = tds[i].find_all(class_='subject')
            for lesson in classes:
                day=days[i]
                style = lesson.get('style', 'No style attribute')
                h3_text = lesson.find('h3').get_text(strip=True) if lesson.find('h3') else 'No h3 element'
                #em_text = lesson.find('em').get_text(strip=True) if lesson.find('em') else 'No em element'
                span_text = lesson.find('span').get_text(strip=True) if lesson.find('span') else 'No span element'
                subject_data.append({
                    "요일": day,
                    "시간": style,
                    "과목명": h3_text,
                    #"교수": em_text,
                    "강의실": span_text
                })
    else:
        subject_data = {"error": "tablebody 클래스를 찾을 수 없습니다."}
    
    return subject_data

if __name__ == "__main__":
    url = sys.argv[1]
    crawl_result = crawl_subject_texts(url)
    process_result = processing(crawl_result)
    print(process_result)
