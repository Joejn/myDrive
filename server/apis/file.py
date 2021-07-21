from datetime import datetime
from flask import request, json
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restx import Namespace, Resource, fields
from os import listdir, path, stat
from os.path import isfile, join, getsize, getmtime

api = Namespace("file", description="Files related operations")
PATH = "D:\myDrive\data"

@api.route("/myFiles")
class MyFiles(Resource):
    @api.doc("my files")
    @jwt_required()
    def get(self):
        args = request.args
        identity = get_jwt_identity()
        user_storage_path = join(PATH, identity)
        directory = str(args.get("directory")).replace("\\", "/")
        if directory[0] == "/":
            directory = directory[1:]
        
        current_directory = user_storage_path
        
        if not directory == "/":
            current_directory = join(user_storage_path, directory)

        # if directory == "..":
        #     print(path.dirname(current_directory))
        #     current_directory = path.dirname(current_directory)

        print(current_directory)
        print(path.dirname(current_directory))

        dirContent = listdir(current_directory)
        dirElements = {
            "directories": [],
            "files": []
        }

        for item in dirContent:
            fullName = join(current_directory, item)
            if (isfile(fullName)):
                dirElements["files"].append(
                    {"name": item, "path": fullName.replace(user_storage_path, ""), "last_modified": getmtime(fullName), "file_size": getsize(fullName)}
                )
            else:
                dirElements["directories"].append(
                    {"name": item, "path": fullName.replace(user_storage_path, ""), "last_modified": getmtime(fullName), "file_size": getsize(fullName)}
                )

        return dirElements
        

        
