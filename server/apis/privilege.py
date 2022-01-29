from core.utils import Admin, Database
from flask import json
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace, Resource

api = Namespace("privilege", description="Privilege related operations")

@api.route("/all")
class Privileges(Resource):
    @api.doc("privileges")
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        statement = "SELECT id, name FROM public.privileges"
        db = Database()
        query = db.select(statement)

        body = []
        for id, name in query:
            body.append({
                "id": id,
                "name": name
            })

        return json.jsonify(body)
