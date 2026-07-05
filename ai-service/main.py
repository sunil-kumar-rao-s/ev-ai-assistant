from fastapi import FastAPI
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

print("GROQ KEY LOADED:", os.getenv("GROQ_API_KEY"))


app = FastAPI()

llm = ChatGroq(model="llama-3.1-8b-instant", api_key=os.getenv("GROQ_API_KEY"))

prompt_template = ChatPromptTemplate.from_template(
    """A user is driving an EV from {start} to {destination} 
    with {battery}% battery. Recommend a charging strategy in 2-3 sentences."""
)


class TripRequest(BaseModel):
    startLocation: str
    destination: str
    batteryPercent: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ai-recommend")
def recommend(data: TripRequest):
    chain = prompt_template | llm
    response = chain.invoke(
        {
            "start": data.startLocation,
            "destination": data.destination,
            "battery": data.batteryPercent,
        }
    )
    return {"recommendation": response.content}
