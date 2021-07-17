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

USERS = [
    {"id": 1, "username": "admin", "password": "passme", "groups": "administrators"}
]

@api.route("/login")
class Login(Resource):
    @api.doc("sign in")
    @api.param("password")
    @api.param("username")
    def post(self):
        user_credential = request.args
        print(user_credential["username"])
        if not (user_credential["username"] and user_credential["password"]):
            return "Missing user credentials", 401

        is_user_existing = False
        for item in USERS:
            if (item.get("username") == user_credential["username"] and item.get("password") == user_credential["password"]):
                is_user_existing = True
        
        if not is_user_existing:
            return "Wrong user credentials", 401

        access_token = create_access_token(identity=user_credential["username"])
        refresh_token = create_refresh_token(identity=user_credential["password"])

        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

@api.route("/refresh")
class Refresh(Resource):
    @api.doc("Refresh the tokens")
    @api.param("refresh_token")
    @jwt_required(refresh=True)
    def post(self):
        user = get_jwt_identity()
        access_token = create_access_token(identity=user)
        return {
            "access_token": access_token
        }

        

        
