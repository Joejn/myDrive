import base64

with open("C:/Users/Neuhauser_Jonas/Downloads/2x/outline_person_black_36dp.png", "rb") as image:
    print(base64.b64encode(image.read()))
    # print(base64.b64encode(image.read()).decode("utf-8"))
