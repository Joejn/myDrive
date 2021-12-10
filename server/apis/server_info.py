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

# cpu_usage_history = []
# cpu_freq_history = []
# memory_usage_history = []

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

        data = {
            "cpu_usage": {
                "value": cpu_usage,
                "time": current_time
            },
            "cpu_freq_current": {
                "value": cpu_freq_current,
                "time": current_time
            },
            "memory_usage": {
                "value": memory_usage,
                "time": current_time
            },
            "disk_space_free": disk_space_free,
            "disk_space_used": disk_space_used
        }
        
        return data
