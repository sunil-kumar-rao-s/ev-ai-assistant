import json
import chromadb
from chromadb.utils import embedding_functions
from pathlib import Path

# ── Load JSON ──────────────────────────────────────────────
with open(Path(__file__).parent / "data/ev_stations.json", "r", encoding="utf-8") as f:
    stations = json.load(f)

print(f"Loaded {len(stations)} stations from JSON")

# ── Parse Each Station ─────────────────────────────────────
parsed = []

for station in stations:
    try:
        addr = station.get("AddressInfo", {}) or {}

        # Name
        name = addr.get("Title") or "Unknown Station"

        # Location — Town is often None, fallback to AddressLine1
        city = (
            addr.get("Town")
            or addr.get("AddressLine1")
            or addr.get("AddressLine2")
            or "Unknown City"
        )
        state = addr.get("StateOrProvince") or ""
        lat = addr.get("Latitude") or 0
        lng = addr.get("Longitude") or 0

        # Operator
        operator_info = station.get("OperatorInfo") or {}
        operator = operator_info.get("Title") or "Unknown Operator"

        # Status
        status_info = station.get("StatusType") or {}
        is_operational = status_info.get("IsOperational", False)
        status = "Operational" if is_operational else "Not confirmed operational"

        # Usage type
        usage_info = station.get("UsageType") or {}
        usage = usage_info.get("Title") or "Unknown"

        # Connections
        connections = station.get("Connections") or []
        charger_details = []
        for conn in connections:
            conn_type = (conn.get("ConnectionType") or {}).get("Title", "Unknown")
            level = (conn.get("Level") or {}).get("Title", "Unknown")
            power = conn.get("PowerKW") or 0
            current = (conn.get("CurrentType") or {}).get("Title", "Unknown")
            quantity = conn.get("Quantity") or 1
            charger_details.append(
                f"{conn_type} | {level} | {power}kW | {current} | Qty: {quantity}"
            )

        charger_info = (
            " || ".join(charger_details) if charger_details else "Unknown charger type"
        )

        # Build the document text — this is what gets embedded and searched
        document = f"""
EV Charging Station: {name}
City: {city}
State: {state}
Operator: {operator}
Status: {status}
Access: {usage}
Chargers: {charger_info}
Coordinates: {lat}, {lng}
        """.strip()

        station_id = str(station.get("ID") or station.get("UUID") or len(parsed))

        parsed.append(
            {
                "id": station_id,
                "document": document,
                "metadata": {
                    "name": name,
                    "city": str(city),
                    "state": str(state),
                    "lat": float(lat),
                    "lng": float(lng),
                    "operator": str(operator),
                    "charger_info": str(charger_info),
                    "status": str(status),
                    "usage": str(usage),
                },
            }
        )

    except Exception as e:
        print(f"Skipping station {station.get('ID', '?')} — error: {e}")
        continue

print(f"Successfully parsed {len(parsed)} stations")

# ── Set Up ChromaDB ────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path=str(Path(__file__).parent / "chroma_db"))

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Clean slate — delete if exists
try:
    chroma_client.delete_collection("ev_stations")
    print("Deleted existing ev_stations collection")
except Exception:
    pass

collection = chroma_client.create_collection(
    name="ev_stations", embedding_function=embedding_fn
)

print("Created fresh ev_stations collection")

# ── Add in Batches of 50 ───────────────────────────────────
batch_size = 50
total_added = 0

for i in range(0, len(parsed), batch_size):
    batch = parsed[i : i + batch_size]
    try:
        collection.add(
            ids=[s["id"] for s in batch],
            documents=[s["document"] for s in batch],
            metadatas=[s["metadata"] for s in batch],
        )
        total_added += len(batch)
        print(f"Added {total_added}/{len(parsed)} stations...")
    except Exception as e:
        print(f"Batch {i} failed: {e}")
        continue

print(f"\nDone — {collection.count()} stations in ChromaDB")

# ── Quick Test Query ───────────────────────────────────────
print("\nRunning test query: 'fast charger in Pune'")
results = collection.query(query_texts=["fast charger in Pune"], n_results=3)

for i, doc in enumerate(results["documents"][0]):
    print(f"\nResult {i+1}:")
    print(doc[:300])
