import base64
from collections import namedtuple
import io
import os
from os.path import join

from core.utils import Database, Files, Path
from core.consts import DATA_PATH, HOME_DIR, TRASH_DIR, USER_HISTORY_FILE
from flask import json, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace, Resource

from core.utils import Admin

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
        query = Database.select(db, statement)

        body = []
        for id, name in query:
            body.append({
                "id": id,
                "name": name
            })

        return json.jsonify(body)
