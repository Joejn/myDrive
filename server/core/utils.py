import psycopg2

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

    def __exit__():
        cur.close()
        conn.close
