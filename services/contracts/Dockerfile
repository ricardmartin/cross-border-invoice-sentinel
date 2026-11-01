# Contracts service: FastAPI + LangGraph + hybrid retrieval (BM25 + multilingual MiniLM, ONNX on CPU).
FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    FASTEMBED_CACHE=/opt/fastembed

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# Bake the embedding model into the image: no download at start-up, and the pod works offline.
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', cache_dir='/opt/fastembed')"

COPY app ./app
COPY data ./data

RUN useradd --uid 10001 --create-home sentinel
USER sentinel

EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8001/healthz', timeout=4).status == 200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

# Tests and the retrieval eval, no API key needed: docker build --target test services/contracts
FROM base AS test
USER root
COPY requirements-dev.txt pyproject.toml ./
COPY tests ./tests
COPY evals ./evals
COPY scripts ./scripts
RUN pip install -r requirements-dev.txt && python -m pytest -q
