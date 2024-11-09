import time
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager

def crawl_subject_texts(url):
    # Chrome 옵션 설정
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")  # headless 모드 사용
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36")
    
    # 웹드라이버 설정 (Chrome 사용 예시)
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get(url)
    
    # 페이지 로딩 대기
    time.sleep(5)
    page_source = driver.page_source
    driver.quit()
    
    # BeautifulSoup을 사용하여 HTML 파싱
    soup = BeautifulSoup(page_source, 'html.parser', from_encoding='utf-8')
    
    # tablebody 클래스 내의 <td> 요소 찾기
    tablebody = soup.find(class_='tablebody')
    if tablebody:
        tds = tablebody.find_all('td')
        for i in range(0, 5):  # 인덱스 0부터 4까지
            print(f"{i}day")
            print("=====================================")
            classes = tds[i].find_all(class_='subject')
            for lesson in classes:
                 # 1. 현재 class의 style
                style = lesson.get('style', 'No style attribute')
                print(f"Style: {style}")

                # 2. h3 안의 글자
                h3_text = lesson.find('h3').get_text(strip=True) if lesson.find('h3') else 'No h3 element'
                print(f"h3: {h3_text}")

                # 3. em 안의 글자
                em_text = lesson.find('em').get_text(strip=True) if lesson.find('em') else 'No em element'
                print(f"em: {em_text}")

                # 4. span 안의 글자
                span_text = lesson.find('span').get_text(strip=True) if lesson.find('span') else 'No span element'
                print(f"span: {span_text}")

                print("=====================================")
    else:
        print("tablebody 클래스를 찾을 수 없습니다.")
# URL 테스트

url = sys.argv[1]
crawl_subject_texts(url)
