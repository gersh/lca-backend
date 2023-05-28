import olca_ipc as ipc
import olca_schema as o
from flask import Flask
import json
import openai
import chromadb
from chromadb.utils import embedding_functions
from flask import request
import os
from flask_json import FlaskJSON, JsonError, json_response, as_json
from chromadb.config import Settings

openai.api_key= os.environ['OPENAI_API_KEY']

app = Flask(__name__)


chroma_client = chromadb.Client(Settings(chroma_db_impl='duckdb+parquet',persist_directory='db'))

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=os.environ['OPENAI_API_KEY'],
                model_name="text-embedding-ada-002"
            )
collection = chroma_client.get_collection(name="flow_collection",embedding_function=openai_ef)
    

PROMPT = """You are an LCA analyst.
Return a descripton of the final flow for the product to calculate the LCA

Product Info:
```
<DESCRIPTION>
```
"""
def get_flows(description):
    messages = [{'role':'user', 'content':PROMPT.replace('<DESCRIPTION>',description)}]
    response = openai.ChatCompletion.create(
        model='gpt-4',
        messages=messages,
        temperature=0, 
        max_tokens=2000)
    print(response)
    return response['choices'][0]['message']['content']


@app.route("/impact")
def get_impact():
    product_desc = request.args.get('product_desc')
    flows = get_flows(product_desc)
    q = collection.query(query_texts=[flows])
    print(q)
    client = ipc.Client(port=8081)
    n = 0
    while n < len(q['ids'][0]):
        oid = q['ids'][0][n]
        f = client.get(o.Flow, oid)
        print(f)
        providers = client.get_providers(o.Ref(id=f.id))
        if len(providers) > 0:
            break
        n += 1
    process_ref = providers[0].provider
    config = o.LinkingConfig(
        prefer_unit_processes=True,
        provider_linking=o.ProviderLinking.PREFER_DEFAULTS,
    )
    system_ref = client.create_product_system(process_ref, config)

    impact_methods = client.get_all(o.ImpactMethod)
    setup = o.CalculationSetup(
        target=system_ref,
        impact_method=impact_methods[0],
    )
    result = client.calculate(setup)
    result.wait_until_ready()
    impacts = result.get_total_impacts()
    impact_json = []
    for i in impacts:
        impact_json.append({'flow_name':f.name,'impact_category_name':i.impact_category.name,'amount':i.amount, 'unit':i.impact_category.ref_unit})
    return json.dumps(impact_json)


app.run(host='0.0.0.0', port=5001)