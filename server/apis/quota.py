from datetime import datetime
from os import cpu_count
from time import time
from flask import request, json
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt, get_jwt_identity
from flask_restx import Namespace
from flask_restx.resource import Resource

from core.utils import Admin, Database

api = Namespace("quota", description="quota related operations")

@api.route("/create")
class Usage(Resource):
    @api.doc("create quota")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        name, size = json.loads(request.data).values()
        db = Database()
 
        statement = "INSERT INTO public.quotas(name, size) VALUES (%(name)s, %(size)s);"
        db.exec(statement, {"name": name, "size": size})

        return "", 200

