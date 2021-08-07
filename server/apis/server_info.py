from datetime import datetime
from os import cpu_count
from time import time
from flask import request, json
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt, get_jwt_identity
from flask_restx import Namespace
from flask_restx.resource import Resource
import psutil

api = Namespace("server_info", description="server related operations")

cpu_usage_history = []
cpu_freq_history = []
memory_usage_history = []

@api.route("/usage")
class Usage(Resource):
    @api.doc("get the server load")
    @jwt_required()
    def get(self):
        disk_space_free = psutil.disk_usage("C:\\").free
        disk_space_used = psutil.disk_usage("C:\\").used

        cpu_usage = psutil.cpu_percent()
        cpu_freq_current = psutil.cpu_freq(percpu=True)[0].current
        memory_usage = psutil.virtual_memory().percent

        current_time = datetime.now().strftime("%H:%M")
        
        cpu_usage_history.append({
            "time": current_time,
            "value": cpu_usage
        })

        cpu_freq_history.append({
            "time": current_time,
            "value": cpu_freq_current
        })

        memory_usage_history.append({
            "time": current_time,
            "value": memory_usage
        })

        data = {
            "cpu_usage": cpu_usage_history,
            "cpu_freq_current": cpu_freq_history,
            "memory_usage": memory_usage_history,
            "disk_space_free": disk_space_free,
            "disk_space_used": disk_space_used
        }
        
        if len(cpu_usage_history) > 8:
            cpu_usage_history.pop(0)
            
        return data
