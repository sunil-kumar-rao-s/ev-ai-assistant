from fastapi import FastAPI
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions
import os

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

app = FastAPI()

# ── LLM Setup ──────────────────────────────────────────────
llm = ChatGroq(model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"))

# ── ChromaDB Setup ─────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path=str(Path(__file__).parent / "chroma_db"))

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_collection(
    name="ev_stations", embedding_function=embedding_fn
)

print(f"ChromaDB loaded — {collection.count()} stations ready")

# ── Prompt Template ────────────────────────────────────────
prompt_template = ChatPromptTemplate.from_template(
    """You are an expert EV route planning assistant for India.

A user has asked: {user_message}

Here are real EV charging stations from our database that are relevant 
to their query:

{station_context}

Using ONLY the stations listed above, give the user a specific, 
helpful recommendation. Include:
- Which station(s) to stop at and why
- The charger type and power available
- Any practical tips for their trip

If the user is not asking about an EV trip or charging, respond 
naturally as a helpful EV assistant. If no relevant stations were 
found in the database, say so honestly and give general advice."""
)


# ── Request Model ──────────────────────────────────────────
class TripRequest(BaseModel):
    userMessage: str


# ── Routes ────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "stations_loaded": collection.count()}


@app.post("/ai-recommend")
def recommend(data: TripRequest):
    # Step 1 — Query ChromaDB for relevant stations
    results = collection.query(query_texts=[data.userMessage], n_results=5)

    # Step 2 — Format retrieved stations as context
    station_docs = results["documents"][0]
    station_metadata = results["metadatas"][0]

    if station_docs:
        context_parts = []
        for doc, meta in zip(station_docs, station_metadata):
            context_parts.append(doc)
        station_context = "\n\n---\n\n".join(context_parts)
    else:
        station_context = "No specific stations found in database for this query."

    # Step 3 — Pass context + user message to Groq via LangChain
    chain = prompt_template | llm
    response = chain.invoke(
        {"user_message": data.userMessage, "station_context": station_context}
    )

    # Step 4 — Return recommendation + station metadata for map
    stations_for_map = [
        {
            "name": m.get("name", ""),
            "city": m.get("city", ""),
            "lat": m.get("lat", 0),
            "lng": m.get("lng", 0),
            "charger_info": m.get("charger_info", ""),
            "operator": m.get("operator", ""),
            "status": m.get("status", ""),
        }
        for m in station_metadata
        if m.get("lat") and m.get("lng")
    ]

    return {"recommendation": response.content, "stations": stations_for_map}
