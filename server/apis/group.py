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
class GetAll(Resource):
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

        return json.jsonify(body)


@api.route("/add_to_group")
class AddToGroup(Resource):
    @api.doc("add users to group")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        groups, users = json.loads(request.data).values()
        statement = "SELECT update_groups_from_users('{groups}', '{users}');"

        groupsStr = "{" + ",".join(groups) + "}"
        usersStr = "{" + ",".join(users) + "}"

        statement = statement.format(groups=groupsStr, users=usersStr)
        db = Database()
        db.exec(statement)


@api.route("/get_groups_of_user")
class GetGroupsOfUser(Resource):
    @api.doc("get groups of user")
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        user_id = (request.headers.get("user_id"))
        if user_id is None:
            return "Bad request", 400
        
        statement = "SELECT groups FROM public.users WHERE id={user_id};".format(user_id=user_id)
        db = Database()
        query = db.select(statement)
        groups = query[0][0]
        if groups is None:
            groups = []

        return groups, 200


@api.route("/set_groups_of_user")
class SetGroupsOfUser(Resource):
    @api.doc("set groups of user")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        data = json.loads(request.data)

        user_id = data.get("user_id")
        groups = data.get("groups")

        if ((user_id is None) or (groups is None)):
            return "Bad request", 400

        groupsStr = "{" + ", ".join(groups) + "}"
        statement = "UPDATE public.users SET groups='{groupsStr}' WHERE id={user_id};".format(groupsStr=groupsStr, user_id=user_id)
        
        db = Database()
        db.exec(statement)
