from flask import Flask, request, jsonify
from flask_cors import CORS

import requests

from sklearn.cluster import KMeans
import numpy as np

import firebase_admin

from firebase_admin import credentials
from firebase_admin import firestore

model_id = ""
baseten_api_key = ""

cred = credentials.Certificate("")
app = firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)

@app.route('/api/getMatchingNonprofits', methods=['POST'])
def getMatchingNonprofits():
    nonprofit_ref = db.collection("nonprofits")
    np_docs = nonprofit_ref.stream()

    users_ref = db.collection("users")
    users_docs = users_ref.stream()

    groupMembers = request.get_json()

    groupTransactions = getTransactions(groupMembers, users_docs)

    centroids = []

    for user in groupTransactions:
        embeddings = getEmbeddings(groupTransactions[user])
        centroids.append(getMostFrequentTransaction(embeddings)) #Most frequent for each person
    
    average = np.mean(centroids, axis=0) #Average for the group
    dot_products = []

    # Get the dot product of the average vector with each nonprofit's mission vector and return the top 3 nonprofits with highest dot products
    for doc in np_docs:
        nonprofit = {
        'id': doc.id,
        'name': doc.get('name'),
        'website': doc.get('website'),
        'city': doc.get('city'),
        'state': doc.get('state'),
        'mission': doc.get('mission'),    
        }
        
        mission_vector = doc.get('mission_vector')

        dot_product = np.dot(average, mission_vector)
        dot_products.append((nonprofit, dot_product))
    
    dot_products.sort(key=lambda x: x[1], reverse=True)
    
    results = [x[0] for x in dot_products[:3]]

    return jsonify(results)

#Get all transactions for a list of users
def getTransactions(user_names, user_docs):
    #create a hashmap of username with a empty list as value
    transactions = {}

    for user in user_names:
        transactions[user] = []
    
    for doc in user_docs:
        if doc.get('user') in user_names:
            transactions[doc.get('user')].append(doc.get('desc'))

    return transactions

#Find most frequent transactions with K-means clustering
def getMostFrequentTransaction(embeddings):
    kmeans = KMeans(n_clusters=2)
    clusters = kmeans.fit_predict(embeddings)

    unique, counts = np.unique(clusters, return_counts=True)
    cluster_counts = dict(zip(unique, counts))

    most_frequent_cluster = max(cluster_counts, key=cluster_counts.get)
    centroid_vector = kmeans.cluster_centers_[most_frequent_cluster]

    return centroid_vector

def getEmbedding(description):
    res = requests.post(
        f"https://model-{model_id}.api.baseten.co/production/predict",
        headers={"Authorization": f"Api-Key {baseten_api_key}"},
        json=description
        )

    return res.json()
                 
def getEmbeddings(descriptions):

    embeddings = []

    for desc in descriptions:
        data = {
            "text": desc
        }

        res = requests.post(
            f"https://model-{model_id}.api.baseten.co/production/predict",
            headers={"Authorization": f"Api-Key {baseten_api_key}"},
            json=data
        )

        embeddings.append(res.json())
    
    return np.array(embeddings)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=4000, debug=True)
