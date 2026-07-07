#!/bin/bash
python embed_stations.py
uvicorn main:app --host 0.0.0.0 --port $PORT