from datetime import datetime
from flask import request, json
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt
from flask_restx import Namespace, Resource
from core.utils import Database
from core.consts import administrators_groups
from core.utils import Password, Admin

api = Namespace("users", description="user related operations")


@api.route("/get_all_users")
class GetAllUsers(Resource):
    @api.doc("return all users")
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]

        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        db = Database()

        data = []
        users = db.select(
            "SELECT id, username, firstname, lastname, birthday, email FROM public.users ORDER BY id;")
        for item in users:
            user_id, username, firstname, lastname, birthday, email = item
            data.append({
                "id": user_id,
                "username": username,
                "firstname": firstname,
                "lastname": lastname,
                "birthday": birthday,
                "email": email
            })

        return json.jsonify(data)

@api.route("/add_user")
class AddUser(Resource):
    @api.doc("Add a user")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        data = json.loads(request.data)
        username, firstname, lastname, birthday, email, password = data.values()
        hashed_password = Password.hash(password).decode("utf-8")
        db = Database()
        statement = """
            INSERT INTO public.users(
                username, firstname, lastname, birthday, email, password)
            VALUES
                ('{username}' , '{firstname}', '{lastname}', to_date('{birthday}', 'mm/dd/yyyy'), '{email}', '{password}');
        """.format(username=username, firstname=firstname, lastname=lastname, birthday=datetime.utcfromtimestamp(birthday).strftime("%m/%d/%y"), email=email, password=hashed_password)
        db.exec(statement.strip())
        
        
        data = []
        users = db.select(
            "SELECT id, username, firstname, lastname, birthday, email FROM public.users ORDER BY id;")
        for item in users:
            user_id, username, firstname, lastname, birthday, email = item
            data.append({
                "id": user_id,
                "username": username,
                "firstname": firstname,
                "lastname": lastname,
                "birthday": birthday,
                "email": email
            })

        return json.jsonify(data)

@api.route("/delete_user")
class DeleteUser(Resource):
    @api.doc("Delete a user")
    @jwt_required()
    def delete(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        data = json.loads(request.data)
        user_id = data.get("id")
        print(user_id)
        db = Database()
        statement = "DELETE FROM public.user_history WHERE id={id};".format(id=user_id)
        db.exec(statement)
        
        statement = "DELETE FROM public.users WHERE id={id};".format(id=user_id)
        db.exec(statement)
        
        data = []
        users = db.select(
            "SELECT id, username, firstname, lastname, birthday, email FROM public.users ORDER BY id;")
        for item in users:
            user_id, username, firstname, lastname, birthday, email = item
            data.append({
                "id": user_id,
                "username": username,
                "firstname": firstname,
                "lastname": lastname,
                "birthday": birthday,
                "email": email
            })

        return json.jsonify(data)

@api.route("/get_registerd_users_count")
class GetRegisterdUsersCount(Resource):
    @api.doc("Get the count of the registered users")
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]
        isAdmin = Admin.checkIfAdmin(id)

        if not isAdmin:
            return "Unauthorized", 401

        db = Database()
        user_count = db.select("SELECT COUNT(id) FROM public.users;")[0][0]
        body = {
            "user_count": user_count
        }

        return json.jsonify(body)
