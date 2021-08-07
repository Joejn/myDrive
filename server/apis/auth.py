import bcrypt
from flask_jwt_extended.utils import get_jwt
from core.utils import Database
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
            return {
                "login": False,
                "access_token": "",
                "refresh_token": ""
            }

        password = user_credential["password"]

        db = Database
        statement = "SELECT id, username, password, groups FROM users WHERE username = '" + user_credential["username"] + "';"
        selectResult = db.select(statement)
        
        is_user_existing = False
        if not selectResult:
            return {
                "login": False,
                "access_token": "",
                "refresh_token": ""
            }

        if not bcrypt.checkpw(str(password).encode("utf-8"), str(selectResult[0][2]).encode("utf-8")):
            return {
                "login": False,
                "access_token": "",
                "refresh_token": ""
            }

        if selectResult[0][1] == user_credential["username"]:
            is_user_existing = True
        
        if not is_user_existing:
            return {
                "login": False,
                "access_token": "",
                "refresh_token": ""
            }

        groups = selectResult[0][3]
        if groups == None:
            groups = []

        additional_claims = {
            "id": selectResult[0][0],
            "groups": groups
            }
        access_token = create_access_token(identity=user_credential["username"], additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=user_credential["username"], additional_claims=additional_claims)

        return {
            "login": True,
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
        id = get_jwt()["id"]
        groups = get_jwt()["groups"]
        additional_claims = {
            "id": id,
            "groups": groups
            }
        access_token = create_access_token(identity=user, additional_claims=additional_claims)
        return {
            "refresh": True,
            "access_token": access_token
        }

        

        
