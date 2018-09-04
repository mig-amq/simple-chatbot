import json
import datetime
from . import AI
from . models import User
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# load html
def load_chat(request):
    return render(request, 'index.html')

# do this if user says "load ####"
def load_session(inputs):
    context = {}
    if "session" in inputs:
        context["session"] = inputs.get("session")
        try:
            user = User.objects.get(sessID=inputs.get("session"))
            context["user"] = user.name

            context["success"] = "true"
            return JsonResponse(context)
        except User.DoesNotExist:
            context["success"] = "false"

    context["success"] = "false"
    return JsonResponse(context)

# do this if user says "remember me"
def save_session (inputs):
    context = {}
    
    if "session" in inputs:
        try:
            print(inputs['name'])
            user = User.objects.get(sessID=inputs["session"])
            user.name = inputs['name'] if 'name' in inputs and inputs['name'] else ""
            user.save(force_update=True)

            return "success"
        except User.DoesNotExist:
            user = User(name=inputs['name'] if 'name' in inputs and inputs['name'] else "",
                        sessID=inputs['session'])
            user.save(force_insert=True)

            return "success"

    return "fail"

def send_chat (request):
    if "message" in request.GET and request.GET["message"]:

        if request.GET["message"][:4] == "load":
            return load_session(dict(session=request.GET["message"][5:]))
        elif request.GET["message"] == "remember me":
            return HttpResponse(save_session(dict(session=request.GET["session"], name=request.GET['name'])))
        else:
            req = AI.text_request()
            req.lang = "en"

            if "session" in request.GET and request.GET["session"]:
                req.session_id = "<" , request.GET["session"] , ">"

                try:
                    user = User.objects.get(sessID=request.GET["session"])
                    user.lastLogged = datetime.datetime.now()
                    user.save(force_update=True)
                except User.DoesNotExist:
                    pass

            req.query = request.GET["message"]
            response = req.getresponse()
            res = json.loads(response.read().decode("utf-8"))

            if "intentName" in res["result"]["metadata"] and res["result"]["metadata"]["intentName"] == "Get My Name" and res["result"]["actionIncomplete"] == False:
                res["user_name"] = res["result"]["parameters"]["given-name"]

            return JsonResponse(res)
    return HttpResponse("Did you say something?")