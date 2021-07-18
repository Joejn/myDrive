from datetime import datetime
from flask import request, json
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource, fields
from os import listdir, stat
from os.path import isfile, join, getsize, getmtime

api = Namespace("file", description="Files related operations")
PATH = "D:\myDrive\data"

@api.route("/myFiles")
class MyFiles(Resource):
    @api.doc("my files")
    # @jwt_required()
    def get(self):
        dirContent = listdir(PATH)
        dirElements = {
            "directories": [],
            "files": []
        }
        for item in dirContent:
            fullName = join(PATH, item)
            print(fullName)
            if (isfile(fullName)):
                dirElements["files"].append(
                    {"name": item, "path": fullName, "last_modified": getmtime(fullName), "file_size": getsize(fullName)}
                )
            else:
                dirElements["directories"].append(
                    {"name": item, "path": fullName, "last_modified": getmtime(fullName), "file_size": getsize(fullName)}
                )

        return dirElements
        

        
