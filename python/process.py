import re

def extract_numbers(style):
    # 정규 표현식을 사용하여 숫자 값을 추출
    height_match = re.search(r'height:\s*(\d+)px', style)
    top_match = re.search(r'top:\s*(\d+)px', style)
    
    height = int(height_match.group(1)) if height_match else None
    top = int(top_match.group(1)) if top_match else None
    
    startTime = top/50
    hours = (height-1)//50
    beforeminutes = height-(hours*50+1)
    minutematching = {0:0,4:5,8:10,13:15,17:20,21:25,25:30,29:35,33:40,38:45,42:50,46:55}
    matchedminute = minutematching[beforeminutes]
    duration = hours*60+matchedminute
    endTime = "계산하기 귀찮다!"

    

    return startTime, duration,endTime

def processing(json_data):
    # 각 json_data에서 객체의 2번째 값인 시간:style을 추출하여 다른 형태로 변형하기
    result = []
    a = 0
    for subject in json_data:
        style = subject.get("시간", "No style attribute")  # 시간:style
        startTime, duration,endTime = extract_numbers(style)
        result.append("시작시간: {0}, 걸리는 시간:{1}분, 끝나는 시간: {2}".format(startTime, duration,endTime))
    return result

# 4px 5분
# 8px 10분
# 13px 15분
# 17px 20분
# 21px 25분
# 25px 30분
# 29px 35분
# 33px 40분
# 38px 45분
# 42px 50분
# 46px 55분