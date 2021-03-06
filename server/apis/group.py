from core.utils import Admin, Database
from flask import json
from flask.globals import request
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace
from flask_restx.resource import Resource

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
        statement = "SELECT groups.id, groups.name, privileges.id, privileges.name FROM public.groups, public.privileges"
        query = db.select(statement)

        groups = []
        for item in query:
            id_group, name_group, id_privilege, name_privilege = item
            groups.append({
                "id_group": int(id_group),
                "name_group": name_group,
                "id_privilege": int(id_privilege),
                "name_privilege": name_privilege
            })

        return json.jsonify(groups)


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
        statement = "SELECT update_groups_from_users(%(groups)s, %(users)s);"

        groupsStr = "{" + ",".join(groups) + "}"
        usersStr = "{" + ",".join(users) + "}"

        db = Database()
        db.exec(statement, {"groups": groupsStr, "users": usersStr})


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
        
        statement = "SELECT groups FROM public.users WHERE id=%(user_id)s;"
        db = Database()
        query = db.select(statement, {"user_id": user_id})
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
        statement = "UPDATE public.users SET groups=%(groupsStr)s WHERE id=%(user_id)s;"
        
        db = Database()
        db.exec(statement, {"groupsStr": groupsStr, "user_id": user_id})

@api.route("/add_group")
class AddGroup(Resource):
    @api.doc("add a new group")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        name, privileges = json.loads(request.data).values()

        db = Database()
        for privilege in privileges:
            statement = "INSERT INTO public.groups (name, privilege) VALUES (%(name)s, %(privilege)s);"
            db.exec(statement, {"name": name, "privilege": privilege["id"]})

        
@api.route("/delete_group")
class DeleteGroup(Resource):
    @api.doc("delete a group")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        group_id = json.loads(request.data)["id"]

        statement = "DELETE FROM public.groups WHERE id=%(id)s"

        db = Database()
        db.exec(statement, {"id": group_id})

        return "success", 200
