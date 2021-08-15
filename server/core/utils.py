import psycopg2
import bcrypt
from core.consts import administrators_groups

DB_HOST = "127.0.0.1"
DB_NAME = "myDrive"
DB_USER = "admin"
DB_PASS = "passme"

conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST)
cur = conn.cursor()

class Database():
    def select(statement):
        cur.execute(statement)
        return cur.fetchall()

    def exec(statement):
        cur.execute(statement)
        conn.commit()

    def __exit__():
        cur.close()
        conn.close

class Password():
    def hash( password ):
        return bcrypt.hashpw(str.encode(password) , bcrypt.gensalt())

class Admin():
    def checkIfAdmin( id ):
        db = Database
        groups = db.select("SELECT groups FROM public.users WHERE id=" + str(id))[0][0]
        return any(x in groups for x in administrators_groups)
