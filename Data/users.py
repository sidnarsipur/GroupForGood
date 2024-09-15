import os
import json

import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('service_key.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

genai.configure(api_key="AIzaSyDM8G2EKxh9OfphqcaS808p3j3sDE07qz4") 

generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_schema": content.Schema(
    type = content.Type.OBJECT,
    required = ["transactions"],
    properties = {
      "transactions": content.Schema(
        type = content.Type.ARRAY,
        items = content.Schema(
          type = content.Type.OBJECT,
          properties = {
            "user": content.Schema(
              type = content.Type.ARRAY,
              items = content.Schema(
                type = content.Type.STRING,
              ),
            ),
            "info": content.Schema(
              type = content.Type.ARRAY,
              items = content.Schema(
                type = content.Type.OBJECT,
                properties = {
                  "desc": content.Schema(
                    type = content.Type.STRING,
                  ),
                  "data": content.Schema(
                    type = content.Type.STRING,
                  ),
                },
              ),
            ),
          },
        ),
      ),
    },
  ),
  "response_mime_type": "application/json",
}


model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="""Your goal is to generate a high-quality fake dataset about users.\n You have to generate a fake name, 10 descriptions with 7-10 words of 10 different transactions in their bank accounts, and dates for their 10 transactions as a string MM/YYYY \n For 5 descriptions ensure there are key words that tell us enough about what a user purchased that anyone who reads them can infer something meaningful about the user. For example, tell they are a parent, student, artists, pet owner, athlete, profession, ethnicity, religiousness, health conciousness. For the other 5 descriptions, make them normal bills like groceries or subscriptions.\n Vary the names, descriptions, and dates for each response. Generate 5 users and 10 transactions per user.""", 
)

# For example, if the user's name is Kevin Chafloque and he is a dog owner, make sure you create descriptions for transactions that would relate to pet stores. 
# chat_session = model.start_chat(history=[])
# response = chat_session.send_message("Please generate the fake dataset of non-profits.")

# print(response.text)

for i in range(100):
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message("Generate")

    # Parse the response JSON
    json_response = json.loads(response.text)

    # Check if 'transactions' exists in the response
    if "transactions" in json_response:
        transactions = json_response["transactions"]

        # Iterate over each transaction
        for transaction in transactions:
            users = transaction.get("user", [])  # List of users
            info = transaction.get("info", [])  # List of transaction info objects

            # Ensure 'users' and 'info' are properly populated
            for user in users:
                for transaction_info in info:
                    desc = transaction_info.get("desc", "No Description")
                    date = transaction_info.get("data", "No Date")  # Assuming 'data' contains the date

                    # Create a transaction dictionary
                    transaction_data = {
                        "user": user,
                        "desc": desc,
                        "date": date
                    }

                    # print(transaction_data)

                    # Save the transaction to Firestore
                    doc_ref = db.collection('users').document()
                    doc_ref.set(transaction_data)
    else:
        print("No 'transactions' key found in the response.")
