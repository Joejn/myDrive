from datetime import datetime
from flask import request, json
from flask_jwt_extended import jwt_required
from flask_jwt_extended.utils import get_jwt, get_jwt_identity
from flask_restx import Namespace, Resource
from werkzeug.utils import secure_filename
from core.utils import Database
import base64
import bcrypt
from core.utils import Password

api = Namespace("user_profile", description="userprofile related operations")


@api.route("/upload_profile_picture")
class UploadProfilePicture(Resource):
    @api.doc("upload profile picture")
    @jwt_required()
    def post(self):
        id = get_jwt()["id"]
        file = request.files.get("image")
        filename = file.filename
        if filename == "":
            return
        filename = secure_filename(filename)
        binary_data = file.read()
        data = base64.b64encode(binary_data)

        data_str = str(data)[1:]
        db = Database
        statement = "UPDATE public.users SET profile_img=" + data_str + " WHERE id =" + str(id)
        db.exec(statement)

        statement = "SELECT encode(profile_img, 'escape') FROM public.users WHERE id = 1;"
        img_byte = str(db.select(statement)[0][0])
        return img_byte

@api.route("/update_general_data")
class UpdateGeneralData(Resource):
    @jwt_required()
    def post(self):
        firstname, lastname, birthday, email = json.loads(request.data).values()
        id = get_jwt().get("id")
        db = Database
        statement = """
            UPDATE public.users
                SET firstname='""" + str(firstname) + "' , lastname='" + str(lastname) + "', birthday=to_date('" + str(birthday) + "', " + "'mm/dd/yyyy'" + "), email='" + str(email) + """'
            WHERE id=""" + str(id) + """;
        """

        db.exec(statement)

        return {
            "updated": True
        }

@api.route("/update_password")
class UpdatePassword(Resource):
    @jwt_required()
    def post(self):
        current_password, new_password = json.loads(request.data).values()
        hashed_new_password = Password.hash(new_password)
        id = get_jwt()["id"]
        statement = "SELECT password FROM public.users WHERE id=" + str(id) + ";"
        db = Database
        result = db.select(statement)
        if not bcrypt.checkpw(str(current_password).encode("utf-8"), str(result[0][0]).encode("utf-8")):
            return {
                "successful": False,
                "error": "wrong current password"
            }

        
        statement = "UPDATE public.users SET password='" + str(hashed_new_password.decode("utf-8")) + "' WHERE id=" + str(id) + ";"
        db.exec(statement)

        return {
            "successful": True,
            "error": ""
        }

@api.route("/get_profile_picture")
class GetProfilePicture(Resource):
    @jwt_required()
    def get(self):
        id = get_jwt()["id"]
        db = Database

        statement = "SELECT encode(profile_img, 'escape') FROM public.users WHERE id=" + str(id)
        img_byte = str(db.select(statement)[0][0])
        if img_byte == "None":
            img_byte = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAATUSURBVHhe7ZxPKGxRHMfPvCwsLCwUCwsLi1lQZGMxC2WjzEKZxSjFwsLCwsLCkrKwpGZhYWGhWFhQlAXZKAsKjRqiKApRFGVB3Xe/pzNqzLnz5+He7+39PvXLNe/cmXE+c8/53fM78yKOixJo+GN+CiSIEDJECBkihAwRQoYIIUOEkCFCyBAhZIgQMkQIGSKEDBFChgghQ4SQIULIECFkiBAyRAgZIoQMEUKGCCFDhJAhQsgQIWSEbufi4+Oj2tjYUOvr6+rm5kbd3d3px+vr61VDQ4OKx+Oqu7tbVVVV6cdDB4SEgdvbW2dkZMSpqKjAB6hgVFZWOhMTE87T05M5OzyEQoh7NTjV1dXWzi8U7lXj7O3tmWcJB/RCZmZmSroqvAJXy8rKink2fqiFrK6uWju53ICUsFwptJP61dWVam5uVq+vr+aR74FJP51OK3foM49wQpv2Tk5OFpSRTCbV4uKi7uTLy0uddSUSCfOv+SAjm52dNb8Ro68TMs7Pz/OGnWzU1dXpSd6Lzc1Nx015redi6Hp5eTEtOaEUMj097dmhh4eHppU3CwsL1vMRy8vLphUnlEJisZi1M8fGxkyL4nR1dVmfo7+/37TghHIOwYRuY2BgwBwVx2s+8XpuFiiFYAK20dTUZI6K09bWZo5y8XpuFkK1uFhOClxTU2OOcvn4+DBHnFAKcTMpc5TL0dGROSrO2dmZOcoF9yPMUArx6jSs8paKm02Zo1zYhVBmWVipxVv7GljTKiXt3d/f91z/QkrMDKUQdLqtMxHRaNRx78xNy3x2dnb0zaPtXEh6eHgwLTmhFALi8bi1UxFYip+amtJ39AB1j62tLWd4eNjaPhuop7BDu7h4cnKiWltbfywrwqJiJpPxTBhYoE17cc+RSqXMb9/DHar0QiS7DI2+TogZHR3NG3rKDRS5wgK9EDA3N/dPVUOs+qLIFSZCIQSk0+mCE/3XGBwcLJiNsRK6bUC4W19bWyu4Dai3t1c1Njbqx8OG/I9yZIRqcfF/QISQIULIECFkiBAyQpFlIb09Pj5WFxcXn/H8/PyZ8mZB6os1K6S82UAp16t6yAilEHT49va22t3d1fHdjQnRaFTFYjEdnZ2d3EUqCGHg+vpa78dqaWnRd9q/GdhmlEqlKGsjgQtBQclrD9VvB9bHEolESVVIvwhMCER0dHRYOyqI6OnpoRDju5C3tzddubN1StCBKwaVyPf3d/Nu/cfXSf309FT19fWVtZ0nS3t7u56cMSGj0ISftbW1OUUnZF339/c6KcBrHRwc6MpjuVVH98pVS0tLwRS0tBYfwHcE3U7M+1R6BdoODQ3pzdHf+a4gdrtjRzz2BbtpsPW1bIHkIoid8r4IwRBQynyBghIqhJlMxpz582CewJBZyncWg9iY7YuQ+fl56x+cDXdo0GO3n9+axVyG0i5e2/aesoHdLH7ii5BkMmn9YxH4tKJzggLDUqHtQ+Pj46alP/gixOtTiOGJBa8vCbnJhGnhD75kWZFIxByFEx+66BNZ7SVDhJAhQsgQIWSIEDJkXxYZcoWQIULIECFkiBAyRAgZIoQMEUKGCCFDhJAhQsgQIWSIEDJECBkihAwRQoYIIUOEkCFCyBAhZIgQMkQIGSKEDBFChgghQ4RQodRfz+BEZmhEzpYAAAAASUVORK5CYII="
        return img_byte

@api.route("/get_general_data")
class GetGeneralData(Resource):
    @jwt_required()
    def get(self):
        db = Database
        id = get_jwt()["id"]
        statement = "SELECT firstname, lastname, birthday, email FROM public.users WHERE id=" + str(id) + ";"
        firstname, lastname, birthday, email = db.select(statement)[0]
        data = {
            "firstname": firstname,
            "lastname": lastname,
            "birthday": birthday,
            "email": email
        }

        return json.jsonify(data)
