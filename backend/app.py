from flask import Flask, g, Response, request
from flask_cors import CORS

from json import dumps
from neo4j import GraphDatabase

import pickle
import numpy as np
import os

# neo4j
uri = "neo4j://neo4j:7687"
# uri = "neo4j://localhost:7687"
neo4jVersion = "4.4.7"
username = "neo4j"
password = "123456"
database = "neo4j"

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
                                                         {"limit": int(request.args.get("limit", 1000))})))
    
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
                                                              "limit": int(request.args.get("limit", 1000))})))

        res = format_result(results)
        return Response(dumps(res), mimetype="application/json")


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
