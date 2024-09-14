import os
import json

import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('/Users/sid-home/GroupCharity/Data/service_key.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

genai.configure(api_key="") 

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_schema": content.Schema(
        type=content.Type.OBJECT,
        required=["names", "missions", "city", "website"],
        properties={
            "names": content.Schema(
                type=content.Type.ARRAY,
                items=content.Schema(
                    type=content.Type.STRING,
                ),
            ),
            "missions": content.Schema(
                type=content.Type.ARRAY,
                items=content.Schema(
                    type=content.Type.STRING,
                ),
            ),
            "city": content.Schema(
                type=content.Type.ARRAY,
                items=content.Schema(
                    type=content.Type.STRING,
                ),
            ),

            "website": content.Schema(
                type=content.Type.ARRAY,
                items=content.Schema(
                    type=content.Type.STRING, 
                ),
            ),
        },
    ),
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
    system_instruction="""Your goal is to generate a high-quality fake dataset about non-profits.
You have to generate fake names, cities (choose a city from MA; use Boston more often), fake website url (using the name) and fake mission statements 
(consisting of 3-4 well-written sentences with keywords about the non-profit's mission. For example, if the non-profit is a pet shelter, include keywords such as "dog", "cat" and "pet").
Vary the names, locations, and missions for each response. Generate the data as a JSON object. Generate 10 responses per prompt""", 
)

for i in range(100):
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message("Please generate the fake dataset of non-profits.")

    json_response = json.loads(response.text)

    for i in range(len(json_response["names"])):
        nonprofit = {
            "name": json_response["names"][i],
            "city": json_response["city"][i],
            "state": "MA",
            "website": json_response["website"][i],
            "mission": json_response["missions"][i],
        }

        doc_ref = db.collection('nonprofits').document()
        doc_ref.set(nonprofit)
