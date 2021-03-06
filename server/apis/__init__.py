from flask_restx import Api

from .auth import api as auth
from .file import api as file
from .group import api as group
from .privilege import api as privilege
from .quota import api as quota
from .server_info import api as server_info
from .user_profile import api as user_profile
from .users import api as users

api = Api(
    title="myDrive",
    version="1.0",
    description="fileservice"
)

api.add_namespace(auth)
api.add_namespace(file)
api.add_namespace(user_profile)
api.add_namespace(server_info)
api.add_namespace(users)
api.add_namespace(group)
api.add_namespace(quota)
api.add_namespace(privilege)
