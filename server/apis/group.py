from flask import json
from flask.globals import request
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace
from flask_restx.resource import Resource

from core.utils import Database
from core.utils import Admin

api = Namespace("group", description="group related operations")

@api.route("/get_all")
class Usage(Resource):
    @api.doc("get all groups")
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        db = Database()
        statement = "SELECT id, name, privileges FROM public.groups;"
        query = db.select(statement)
        body = []
        for item in query:
            id, name, privileges = item

            privileges = list(map(lambda x: int(x), privileges))

            body.append({
                "id": id,
                "name": name,
                "privileges": privileges
            })

        print(body)
        return json.jsonify(body)

@api.route("/add_to_group")
class Usage(Resource):
    @api.doc("add users to group")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        groups, users = json.loads(request.data).values()
        # statement = "UPDATE public.users SET groups=groups || 'item'::text || 'Hallo'::text WHERE username IN (1, 2);"
        statement = "SELECT update_groups_from_users('{groups}', '{users}');"
        # print(users)
        # print(groups)
        # print(statement)

        groupsStr = "{" +  ",".join(groups) + "}"

        usersStr = "{" + ",".join(users) + "}"

        statement = statement.format(groups=groupsStr, users=usersStr)
        db = Database()
        db.exec(statement)
