from flask_restx import Api

from .auth import api as auth
from .file import api as file
from .user_profile import api as user_profile

api = Api(
    title="myDrive",
    version="1.0",
    description="fileservice"
)

api.add_namespace(auth)
api.add_namespace(file)
api.add_namespace(user_profile)
