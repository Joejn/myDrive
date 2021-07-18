from flask_restx import Api

from .auth import api as auth
from .file import api as file

api = Api(
    title="myDrive",
    version="1.0",
    description="fileservice"
)

api.add_namespace(auth)
api.add_namespace(file)
