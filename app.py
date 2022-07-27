import requests
from flask_apscheduler import APScheduler
from flask import Flask, g, Response, request
from flask_cors import CORS

from json import dumps
from neo4j import GraphDatabase

import os
from os.path import join, dirname
from dotenv import load_dotenv


class Config(object):
    JOBS = [
        {
            'id': 'neo4j',
            'func': '__main__:neo4j_auradb_task',
            'trigger': 'interval',
            'seconds': 24 * 60 * 60
        }
    ]

# timed task


def neo4j_auradb_task():
    url = "https://mds-3d-graph.herokuapp.com/overview"
    requests.get(url)


# .env
dotenv_path = join(dirname(__file__), 'neo4j-auradb.env')
load_dotenv(dotenv_path=dotenv_path, verbose=True)

# neo4j
neo4jVersion = "4.4.7"
# uri = "neo4j://neo4j:7687"
# uri = "neo4j://localhost:7687"
uri = os.getenv("NEO4J_URI")
database = "neo4j"

# username = "neo4j"
# password = "123456"
username = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(uri, auth=(username, password))
path = os.getcwd()


def format_result(results):
    nodes = {}
    links = []
    for record in results:
        s = record.get('subject')
        r = record.get('relation')
        o = record.get('object')

        nodes[s['name']] = {
            'id': s['name'],
            'name': s['name']
        }

        nodes[o['name']] = {
            'id': o['name'],
            'name': o['name']
        }

        links.append({
            'source': s['name'],
            'target': o['name'],
            'relation': r
        })

    res = {
        'nodes': list(nodes.values()),
        'links': links
    }

    return res


# flask
app = Flask(__name__, instance_path=path)
CORS(app)
app.config.from_object(Config())


def get_db():
    if not hasattr(g, 'neo4j_db'):
        g.neo4j_db = driver.session(database=database)
    return g.neo4j_db


@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'neo4j_db'):
        g.neo4j_db.close()


@app.route("/")
def get_index():
    return "<p>MDS backend</p>"


@app.route("/overview")
def overview():
    db = get_db()
    results = db.read_transaction(lambda tx: list(tx.run("MATCH (s)-[r]->(o) "
                                                         "RETURN properties(s) as subject, properties(r) as relation, properties(o) as object "
                                                         "LIMIT $limit",
                                                         {"limit": int(request.args.get("limit", 1500))})))

    res = format_result(results)
    return Response(dumps(res), mimetype="application/json")


@app.route("/search")
def search():
    try:
        name = request.args["keyword"]
    except KeyError:
        return []
    else:
        db = get_db()
        results = db.read_transaction(lambda tx: list(tx.run("MATCH (s)-[r]->(o) "
                                                             "WHERE s.name CONTAINS $name "
                                                             "RETURN properties(s) as subject, properties(r) as relation, properties(o) as object "
                                                             "LIMIT $limit",
                                                             {"name": name,
                                                              "limit": int(request.args.get("limit", 1500))})))

        res = format_result(results)
        return Response(dumps(res), mimetype="application/json")


if __name__ == '__main__':
    scheduler = APScheduler()
    scheduler.init_app(app)
    scheduler.start()

    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
