import chromadb
import os
import json
import sys

from chromadb.utils import embedding_functions
from chromadb.config import Settings


chroma_client = chromadb.Client(Settings(chroma_db_impl='duckdb+parquet',persist_directory='db'))

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=os.environ['OPENAI_API_KEY'],
                model_name="text-embedding-ada-002"
            )



if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Syntax loadFlows.py [flow_direction]")
    else:
        print("Loading collection")
        collection = chroma_client.create_collection(name="flow_collection",embedding_function=openai_ef)

        flowInfo = {}
        for fl in os.listdir(sys.argv[1]):
            f = open(os.path.join(sys.argv[1],fl),"r")
            j = json.loads(f.read())
            flowInfo[j['name']] = j['@id']
        names = list(flowInfo.keys())
        values = [flowInfo[x] for x in names]
        length = 2000
        print("Adding " + str(len(flowInfo)) + " flows")
        for n in range(len(flowInfo)//length):
            collection.add(documents=list(names[(n*length):(n*length+length)]),ids=list(values[(n*length):(n*length+length)]))
        chroma_client.persist()
