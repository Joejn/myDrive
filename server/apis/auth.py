import bcrypt
from flask_jwt_extended.utils import get_jwt
from core.utils import Database, Auth
from flask import request, json
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource, fields

from flask_jwt_extended import create_access_token, create_refresh_token

api = Namespace("auth", description="Authentication related operations")

user = api.model("User", {
    "id": fields.Integer(required=True, description="The user identifier"),
    "username": fields.String(required=True, description="The username"),
    "groups": fields.String(required=False, description="group where the user is a member of"),
})


@api.route("/login")
class Login(Resource):
    @api.doc("sign in")
    @api.param("password")
    @api.param("username")
    def post(self):
        user_credential = json.loads(request.data)
        if not (user_credential["username"] and user_credential["password"]):
            return Auth.generate_login_faild_response()

        username = user_credential["username"]
        password = user_credential["password"]

        db = Database()
        statement = "SELECT id, username, password, groups FROM users WHERE username = '{username}';".format(
            username=username)
        query = db.select(statement)

        if not query:
            return Auth.generate_login_faild_response()

        if not bcrypt.checkpw(str(password).encode("utf-8"), str(query[0][2]).encode("utf-8")):
            return Auth.generate_login_faild_response()

        additional_claims = {
            "id": query[0][0],
            "groups": query[0][3]
        }

        return Auth.generate_login_success_response(username, additional_claims)


@api.route("/refresh")
class Refresh(Resource):
    @api.doc("Refresh the tokens")
    @api.param("refresh_token")
    @jwt_required(refresh=True)
    def post(self):
        user = get_jwt_identity()
        id = get_jwt()["id"]
        groups = get_jwt()["groups"]
        additional_claims = {
            "id": id,
            "groups": groups
        }
        access_token = create_access_token(
            identity=user, additional_claims=additional_claims)
        return {
            "refresh": True,
            "access_token": access_token
        }
